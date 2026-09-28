import 'dotenv/config';
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
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permitir herramientas locales, server-to-server o sin cabecera origin
      if (!origin) return callback(null, true);

      // Permitir cualquier dominio de Vercel o localhost
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.vercel.app') ||
        origin.includes('.vercel.app')
      ) {
        return callback(null, true);
      }

      // Si se configuró CORS_ORIGINS
      if (process.env.CORS_ORIGINS) {
        const allowed = process.env.CORS_ORIGINS.split(',').map((o) => o.trim());
        if (allowed.includes(origin) || allowed.includes('*')) {
          return callback(null, true);
        }
      }

      // Por defecto en SGSEG institucional
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  });

  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on port ${port} (0.0.0.0)`);
}

// Servidor institucional SGSEG iniciado con prisma client actualizado
void bootstrap();
