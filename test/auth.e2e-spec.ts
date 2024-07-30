import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import * as request from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { faker } from '@faker-js/faker';

let app: INestApplication;
let user: { username: string; password: string };
const auth = new AuthService(
  new PrismaService(),
  new JwtService(),
  new ConfigService(),
);

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AuthModule],
  }).compile();
  app = moduleRef.createNestApplication();
  await app.init();

  const payload = {
    username: faker.internet.userName(),
    password: faker.internet.password(),
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    address: faker.location.streetAddress(),
  };
  await auth.signUp(payload);
  user = { username: payload.username, password: payload.password };
});

afterAll(async () => {
  await app.close();
});

describe('Sign Up', () => {
  it('should sign up user successfully', async () => {
    const res = await request(app.getHttpServer()).post('/auth/signup').send({
      username: faker.internet.userName(),
      password: faker.internet.password(),
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
    });
    expect(res.status).toBe(201);
  });
});

describe('Sign In', () => {
  it('should sign in user successfully', async () => {
    const res = await request(app.getHttpServer()).post('/auth/signin').send({
      username: user.username,
      password: user.password,
    });
    expect(res.status).toBe(200);
    expect(typeof res.body.user.id).toBe('number');
    expect(typeof res.body.token).toBe('string');
  });
});
