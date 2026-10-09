import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';
import { AppModule } from './app.module.js';
import { ExceptionsFilter } from './common/exceptions.filter.js';
import { Logger } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { seedAdmin, seedCategories } from '@wabisabiart/db';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.useGlobalPipes(new ZodValidationPipe());

  const publicPath: string = join(process.cwd(), 'public');
  // comment out letter to enable admin dashboard
  // const adminDashboardPath: string = join(
  //   process.cwd(),
  //   'admin-dashboard',
  //   'dist',
  // );

  app.setGlobalPrefix('api/v1', { exclude: ['/'] });

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:80',
      'http://localhost:5173',
      'http://localhost:3000',
      'https://wabisabiart.com',
      'https://admin.wabisabiart.com',
      'https://wabisaviart.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Access-Token'],
  });

  app.use(cookieParser());

  const sessionSecret = process.env.ADMIN_SESSION_SECRET as string;

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      },
    }),
  );

  app.setBaseViewsDir(join(process.cwd(), 'src', 'view'));
  app.setViewEngine('hbs');

  app.use(express.static(publicPath));
  // comment out letter to enable admin dashboard
  // app.use(express.static(adminDashboardPath));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionsFilter(httpAdapter));

  await seedAdmin();
  await seedCategories();

  const port = Number(process.env.PORT);
  await app.listen(port);
  Logger.log(`🚀 Server running on port ${port}`, 'Bootstrap');
}

bootstrap().catch(console.error);
