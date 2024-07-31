import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { CreateLoanDto } from 'src/loan/dto/create-loan.dto';
import { ReturnLoanDto } from 'src/loan/dto/return-loan.dto';
import { LoanModule } from 'src/loan/loan.module';
import { PrismaService } from 'src/prisma/prisma.service';
import * as request from 'supertest';

let app: INestApplication;
let bookId: number[];
let userId: number;
let loanId: number;
let token: string;
const prisma = new PrismaClient();
const authService = new AuthService(
  new PrismaService(),
  new JwtService(),
  new ConfigService(),
);

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [LoanModule],
  }).compile();
  app = moduleRef.createNestApplication();
  await app.init();

  const { token: _token, user } = await authService
    .signUp({
      email: faker.internet.email(),
      fullName: faker.person.fullName(),
      password: '123456',
      username: faker.internet.userName(),
    })
    .then((res) => {
      return authService.signIn({ username: res.username, password: '123456' });
    });
  userId = user.id;
  token = _token;

  const books = await prisma.book.createManyAndReturn({
    data: Array.from({ length: 5 }).map(() => ({
      author: faker.person.fullName(),
      isbn: faker.string.numeric({ length: 12 }),
      publishedDate: faker.date.past(),
      title: faker.commerce.productName(),
    })),
  });
  bookId = books.slice(0, 2).map((item) => item.id);

  const loans = await prisma.loan.createManyAndReturn({
    data: books.slice(3).map((item) => ({
      dueDate: faker.date.future(),
      bookId: item.id,
      userId,
    })),
  });
  loanId = loans[0].id;
});

afterAll(async () => {
  await app.close();
});

describe('Create loan', () => {
  it('should create loan successfully', async () => {
    const payload: CreateLoanDto = {
      data: bookId.map((item) => ({
        bookId: item,
        dueDate: faker.date.future(),
      })),
    };
    const res = await request(app.getHttpServer())
      .post(`/loans/${userId}`)
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body.length).toBe(payload.data.length);
  });
});

describe('Find user loan', () => {
  it('should successfully find user loan', async () => {
    const res = await request(app.getHttpServer()).get(`/loans/user/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.length).not.toBe(0);
  });
});

describe('Find loan by id', () => {
  it('should sucessfully find loan by id', async () => {
    const res = await request(app.getHttpServer()).get(`/loans/${loanId}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.id).toBe('number');
    expect(res.body.id).toBe(loanId);
  });
});

describe('Update loan data', () => {
  const cases = [
    {
      label: 'returnDate',
      data: new Date().toISOString(),
    },
    {
      label: 'dueDate',
      data: faker.date.future().toISOString(),
    },
    {
      label: 'isReturned',
      data: true,
    },
  ];
  test.each(cases)('should update $label successfully', async (data) => {
    const payload = {
      [data.label]: data.data,
    };
    const res = await request(app.getHttpServer())
      .patch(`/loans/${loanId}`)
      .send(payload)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(200);
    expect(res.body[data.label]).toBe(data.data);
  });
});

describe('Return loans', () => {
  it('should return loan successfully', async () => {
    const payload: ReturnLoanDto = {
      id: [loanId],
    };
    const res = await request(app.getHttpServer())
      .patch('/loans/return')
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(payload.id.length);
  });
});
