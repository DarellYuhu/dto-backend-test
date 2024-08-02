import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
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
  const failCases = [
    {
      case: 'wrong data property type',
      data: {
        bookId: true,
        dueDate: faker.date.future(),
      },
    },
    {
      case: 'wrong bookId type',
      data: [
        {
          bookId: '0',
          dueDate: faker.date.future(),
        },
      ],
    },
    {
      case: 'not provide bookId',
      data: [
        {
          bookId: undefined,
          dueDate: faker.date.future(),
        },
      ],
    },
    {
      case: 'not provide dueDate',
      data: [
        {
          bookId: true,
          dueDate: undefined,
        },
      ],
    },
    {
      case: 'wrong dueDate type',
      data: [
        {
          bookId: true,
          dueDate: 'wrong',
        },
      ],
    },
  ];
  test.each(failCases)('should fail when $case', async ({ data }) => {
    const payload = Array.isArray(data)
      ? data.map((item) => ({
          ...item,
          bookId: item.bookId === true ? bookId[0] : item.bookId,
        }))
      : data;
    const res = await request(app.getHttpServer())
      .post(`/loans/${userId}`)
      .send(payload)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(400);
  });

  it('should fail when token not provided', async () => {
    const payload: CreateLoanDto = {
      data: bookId.map((item) => ({
        bookId: item,
        dueDate: faker.date.future(),
      })),
    };
    const res = await request(app.getHttpServer())
      .post(`/loans/${userId}`)
      .send(payload);
    expect(res.status).toBe(401);
  });

  it('should fail when the user not exist', async () => {
    const payload: CreateLoanDto = {
      data: bookId.map((item) => ({
        bookId: item,
        dueDate: faker.date.future(),
      })),
    };
    const res = await request(app.getHttpServer())
      .post(`/loans/${userId}1234A`)
      .send(payload)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(400);
  });

  it('should create loan successfully', async () => {
    const payload: CreateLoanDto = {
      data: bookId.map((item) => ({
        bookId: item,
        dueDate: faker.date.future(),
      })),
    };
    const res = await request(app.getHttpServer())
      .post(`/loans/${userId}`)
      .send(payload)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(201);
    expect(res.body.length).toBe(payload.data.length);
  });
});

describe('Find user loan', () => {
  it('should fail when wrong param type', async () => {
    const res = await request(app.getHttpServer())
      .get(`/loans/user/${userId}ASDF`)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(400);
  });

  it('should fail when user not exist', async () => {
    const res = await request(app.getHttpServer())
      .get(`/loans/user/${1234}`)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(404);
  });

  it('should fail when user not authenticated', async () => {
    const res = await request(app.getHttpServer()).get(`/loans/user/${userId}`);
    expect(res.status).toBe(401);
  });

  it('should successfully find user loan', async () => {
    const res = await request(app.getHttpServer())
      .get(`/loans/user/${userId}`)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(200);
    expect(res.body.length).not.toBe(0);
  });
});

describe('Find loan by id', () => {
  it('should fail when loan type is wrong', async () => {
    const res = await request(app.getHttpServer())
      .get(`/loans/${loanId}ASJD`)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(400);
  });

  it('should fail when not authenticated', async () => {
    const res = await request(app.getHttpServer()).get(`/loans/${loanId}`);
    expect(res.status).toBe(401);
  });

  it("should fail when loan didn't exist", async () => {
    const res = await request(app.getHttpServer())
      .get(`/loans/${loanId}2346837`)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(404);
  });

  it('should sucessfully find loan by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/loans/${loanId}`)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(200);
    expect(typeof res.body.id).toBe('number');
    expect(res.body.id).toBe(loanId);
  });
});

describe('Update loan data', () => {
  const failCases = [
    { key: 'returnDate', data: 123 },
    { key: 'dueDate', data: 123 },
    { key: 'isReturned', data: 123 },
  ];
  test.each(failCases)(
    'should fail update when $key type is wrong',
    async ({ key, data }) => {
      const res = await request(app.getHttpServer())
        .patch(`/loans/${loanId}`)
        .send({ [key]: data })
        .auth(token, { type: 'bearer' });
      expect(res.status).toBe(400);
    },
  );

  it('should update fail when not authenticated', async () => {
    const payload = {
      isReturned: true,
    };
    const res = await request(app.getHttpServer())
      .patch(`/loans/${loanId}`)
      .send(payload);
    expect(res.status).toBe(401);
  });

  it("should update fail when loan didn't exist", async () => {
    const payload = {
      isReturned: true,
    };
    const res = await request(app.getHttpServer())
      .patch(`/loans/${loanId}1234`)
      .send(payload)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(404);
  });

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
      .send(payload)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(payload.id.length);
  });

  it('should fail when the type is wrong', async () => {
    const payload = {
      id: ['7183748ADJ'],
    };
    const res = await request(app.getHttpServer())
      .patch('/loans/return')
      .send(payload)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(400);
  });

  it('should fail when not authenticated', async () => {
    const payload: ReturnLoanDto = {
      id: [loanId],
    };
    const res = await request(app.getHttpServer())
      .patch('/loans/return')
      .send(payload);
    expect(res.status).toBe(401);
  });

  it('should fail when the loan not exist', async () => {
    const payload: ReturnLoanDto = {
      id: [7183748],
    };
    const res = await request(app.getHttpServer())
      .patch('/loans/return')
      .send(payload)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(404);
  });
});
