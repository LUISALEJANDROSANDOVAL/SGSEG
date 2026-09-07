import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Support BigInt serialization in JSON responses
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Configuration
  const corsOrigins =
    process.env.NODE_ENV === 'production'
      ? process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
        : true
      : [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://localhost:5174',
        ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on port ${port} (0.0.0.0)`);
}

void bootstrap();
