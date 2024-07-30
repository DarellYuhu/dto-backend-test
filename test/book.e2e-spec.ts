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

let app: INestApplication;
let token: string;
const auth = new AuthService(
  new PrismaService(),
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
  const user = await auth.signUp({
    username: faker.internet.userName(),
    password,
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    address: faker.location.streetAddress(),
  });
  const payload = await auth.signIn({ username: user.username, password });
  token = payload.token;
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
      publishedDate: new Date().toISOString(),
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
      publishedDate: new Date().toISOString(),
    };
    const res = await request(app.getHttpServer()).post('/books').send(payload);
    expect(res.status).toBe(401);
  });
});
