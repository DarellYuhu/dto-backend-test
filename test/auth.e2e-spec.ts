import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import * as request from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcrypt';

let app: INestApplication;
let user: { username: string; password: string };

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AuthModule],
  })
    .overrideModule(AuthModule)
    .useModule(AuthModule)
    .compile();
  app = moduleRef.createNestApplication();
  await app.init();
  const prisma = new PrismaService();

  const _user = await prisma.user.create({
    data: {
      username: 'dwaynephiliph',
      password: await hash('123456', 10),
      fullName: 'Dwayne Philiph',
      email: 'dwaynephiliph@me.com',
      address: '123 Main St, Anytown USA',
    },
  });
  user = { username: _user.username, password: _user.password };
});

afterAll(async () => {
  await app.close();
});

describe('Sign Up', () => {
  it('should sign up user successfully', async () => {
    const res = await request(app.getHttpServer()).post('/auth/signup').send({
      username: 'johndoe',
      password: '123456',
      fullName: 'John Doe',
      email: 'johndoe@me.com',
      address: '123 Main St, Anytown USA',
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
