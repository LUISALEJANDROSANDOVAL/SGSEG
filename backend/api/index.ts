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

// Middleware de CORS a nivel de Express para garantizar que preflights OPTIONS y errores siempre respondan con cabeceras CORS
server.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    req.headers['access-control-request-headers'] ||
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Normalización de rutas para Vercel Serverless
server.use((req, res, next) => {
  if (req.url === '/api' || req.url === '/api/') {
    return res.status(200).json({
      status: 'online',
      sistema: 'SGSEG - Sistema de Gestión de Graduación UTEPSA',
      apiPrefix: '/api',
      endpoints: {
        auth: '/api/auth/login',
        usuarios: '/api/usuarios',
        sorteos: '/api/sorteos',
        casos: '/api/casos',
        estudiantes: '/api/estudiantes',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Si entra como /auth/... asegurarse de que tenga el prefijo /api/auth/...
  if (req.url !== '/' && !req.url.startsWith('/api/')) {
    req.url = req.url.startsWith('/') ? `/api${req.url}` : `/api/${req.url}`;
  }
  next();
});

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: (origin, callback) => callback(null, true),
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

  await app.init();
}

export default async function handler(req: Request, res: Response) {
  try {
    if (!isAppInitialized) {
      await bootstrapServer();
      isAppInitialized = true;
    }
    server(req, res, (err: any) => {
      if (err) {
        return res.status(500).json({
          statusCode: 500,
          error: 'Internal Server Error',
          message: err?.message || String(err),
        });
      }
      return res.status(404).json({
        statusCode: 404,
        error: 'Not Found',
        message: `Ruta no encontrada: ${req.method} ${req.url}`,
      });
    });
  } catch (err: any) {
    console.error('Error inicializando servidor NestJS:', err);
    return res.status(500).json({
      statusCode: 500,
      error: 'Bootstrap Error',
      message: err?.message || 'Error inicializando el servidor',
    });
  }
}


