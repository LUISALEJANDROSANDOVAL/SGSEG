import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

// Support BigInt serialization in JSON responses
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

const server = express();
let isAppInitialized = false;

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : true;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
}

export default async function handler(req: Request, res: Response) {
  if (!isAppInitialized) {
    await bootstrapServer();
    isAppInitialized = true;
  }
  server(req, res);
}
