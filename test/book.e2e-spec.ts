import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BookModule } from 'src/book/book.module';
import { CreateBookDto } from 'src/book/dto/create-book.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BookService } from 'src/book/book.service';

let app: INestApplication;
let token: string;
let bookId: number;

const prismaService = new PrismaService();
const bookService = new BookService(prismaService);
const authService = new AuthService(
  prismaService,
  new JwtService(),
  new ConfigService(),
);

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [BookModule],
  }).compile();
  app = moduleRef.createNestApplication();
  await app.init();
  await app.listen(3000);

  const password = '123456';
  const user = await authService.signUp({
    username: faker.internet.userName(),
    password,
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    address: faker.location.streetAddress(),
  });
  const payload = await authService.signIn({
    username: user.username,
    password,
  });
  token = payload.token;

  const book = await bookService.create({
    title: faker.commerce.productName(),
    author: faker.person.fullName(),
    isbn: faker.string.uuid(),
    publishedDate: faker.date.recent(),
  });
  bookId = book.id;
});

afterAll(async () => {
  await app.close();
});

describe('Create', () => {
  it('should create book successfully', async () => {
    const payload: CreateBookDto = {
      title: 'test book',
      author: 'test author',
      isbn: 'test isbn',
      publishedDate: new Date(),
    };
    const res = await request(app.getHttpServer())
      .post('/books')
      .send(payload)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe('number');
  });

  it('should fail when token not provided', async () => {
    const payload: CreateBookDto = {
      title: 'test book',
      author: 'test author',
      isbn: 'test isbn',
      publishedDate: new Date(),
    };
    const res = await request(app.getHttpServer()).post('/books').send(payload);
    expect(res.status).toBe(401);
  });
});

describe('Get all', () => {
  it('should all books', async () => {
    const res = await request(app.getHttpServer())
      .get('/books')
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Get single book by id', () => {
  it('should get the book data', async () => {
    const res = await request(app.getHttpServer())
      .get(`/books/${bookId}`)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(200);
    expect(typeof res.body.id).toBe('number');
  });
});

describe('Update book by id', () => {
  const cases = [
    { label: 'title', data: 'modified title' },
    { label: 'author', data: 'modified author' },
    { label: 'isbn', data: 'modified isbn' },
    { label: 'publishedDate', data: new Date().toISOString() },
    { label: 'isAvailable', data: false },
  ];
  test.each(cases)('should update book successfully $label', async (cases) => {
    const payload = {
      [cases.label]: cases.data,
    };
    const res = await request(app.getHttpServer())
      .patch(`/books/${bookId}`)
      .send(payload)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(200);
    expect(res.body[cases.label]).toBe(cases.data);
  });
});
