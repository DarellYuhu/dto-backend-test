import { INestApplication, ValidationPipe } from '@nestjs/common';
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
let token: string;
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
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();

  const payload = {
    username: faker.internet.userName(),
    password: faker.internet.password(),
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    address: faker.location.streetAddress(),
  };
  await auth.signUp(payload);
  const { token: _token } = await auth.signIn({
    username: payload.username,
    password: payload.password,
  });
  token = _token;
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

  const cases = [
    { key: 'username', _case: 'wrong typed', data: 123 },
    { key: 'username', _case: 'not provided', data: undefined },
    { key: 'password', _case: 'wrong typed', data: 123 },
    { key: 'password', _case: 'not provided', data: undefined },
    { key: 'fullName', _case: 'wrong typed', data: 123 },
    { key: 'fullName', _case: 'not provided', data: undefined },
    { key: 'email', _case: 'worng typed', data: 'yuhu' },
    { key: 'email', _case: 'not provided', data: undefined },
    { key: 'address', _case: 'wrong typed', data: 123 },
    { key: 'address', _case: 'not provided', data: undefined },
  ];
  test.each(cases)(
    'should fail sign up user when the $key is $_case',
    async ({ key, data }) => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          [key]: data,
        });
      expect(res.status).toBe(400);
    },
  );
});

describe('Sign In', () => {
  it('should fail when the username or password is wront', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        username: `${user.username}worng_username`,
        password: user.password,
      });
    expect(res.status).toBe(401);
  });

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

describe('Protected route', () => {
  it('should fail when token not provided', async () => {
    const res = await request(app.getHttpServer()).get('/auth/protected-route');
    expect(res.status).toBe(401);
  });

  it('should success when token not provided', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/protected-route')
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(200);
  });
});
