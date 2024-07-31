<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# DOT Backend Test (Typescript - Nest.JS)

This project is created for completing DOT recruitment process

## Pattern Project

Pattern project yang saya gunakan dalam membuat aplikasi ini adalah _Modular/Clean Architecture_ dan _Dependency Injection_ yang merupakan standar arsitektur bawaah yang digunakan oleh framework **Nest.JS**. Alasan saya menyukai design pattern ini adalah:

1. Readable
2. Maintainable
3. Scallable
4. Modularity

## Environment

Terdapat 3 environment yang digunakan dalam merancang aplikasi ini, yaitu:

1. `.env`
2. `.env.development`
3. `.env.test`

Untuk contoh dari env yang harus disediakan dapat dilihat pada file `.env.example`

```bash
POSTGRES_PASSWORD=
POSTGRES_USER=
POSTGRES_DB=
POSTGRES_PORT=

DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

SECRET_KEY=
```

## Installation

```bash
$ npm install
```

## Running the app

Sebelum menjalankan aplikasi, harus menyalakan terlebih dahulu database dengan perintah

```bash
$ npm run db:dev:up
```

Lalu bisa menjalankan perintah

```bash
# development
$ npm run start:dev
```

NOTE: pastikan _environment variable_ nya tersedia

## Test

```bash
# e2e tests
$ npm run test:e2e
```

NOTE: pastikan _environment variable_ nya tersedia
