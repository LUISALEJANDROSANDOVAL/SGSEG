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

import { Pool } from 'pg';

// Normalización de rutas para Vercel Serverless
server.use(async (req, res, next) => {
  if (req.url === '/api' || req.url === '/api/') {
    return res.status(200).json({
      status: 'online',
      version: '1.0.3',
      databaseConfigured: !!(
        process.env.DATABASE_URL ||
        process.env.DATABASE_URL_DATABASE_URL ||
        process.env.DATABASE_URL_POSTGRES_URL ||
        process.env.STORAGE_URL ||
        process.env.POSTGRES_PRISMA_URL
      ),
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

  if (req.url === '/api/test-db' || req.url === '/test-db') {
    const defaultRemoteUrl =
      'postgres://bd42a024e7d56622c514be6c6f092948d795cc778fb98651251bba3424771088:sk_EWxP6P9LgQxdtjyFa4yY4@db.prisma.io:5432/postgres?sslmode=require';
    const candidates = [
      process.env.DATABASE_URL_DATABASE_URL,
      process.env.DATABASE_URL_POSTGRES_URL,
      process.env.DATABASE_URL_PRISMA_DATABASE_URL,
      process.env.STORAGE_URL,
      process.env.POSTGRES_PRISMA_URL,
      process.env.POSTGRES_URL,
      process.env.STORAGE_DATABASE_URL,
      process.env.DATABASE_URL,
    ].filter(Boolean) as string[];
    const remoteUrl = candidates.find(
      (u) => !u.includes('localhost') && !u.includes('127.0.0.1'),
    );
    const connStr =
      remoteUrl ||
      candidates[0] ||
      (process.env.VERCEL ? defaultRemoteUrl : 'postgresql://sgseg:sgseg@localhost:5437/sgseg?schema=public');
    const isRemote =
      !connStr.includes('localhost') && !connStr.includes('127.0.0.1');

    try {
      const testPool = new Pool({
        connectionString: connStr,
        ssl: isRemote ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 5000,
      });
      const t0 = Date.now();
      const result = await testPool.query('SELECT count(*) as total FROM usuario');
      await testPool.end();
      return res.status(200).json({
        ok: true,
        usuariosCount: result.rows[0]?.total,
        pingMs: Date.now() - t0,
        host: connStr.split('@')[1]?.split('/')[0] || 'hidden',
      });
    } catch (dbErr: any) {
      return res.status(500).json({
        ok: false,
        error: dbErr.message,
        code: dbErr.code,
      });
    }
  }

  // Si entra como /auth/... asegurarse de que tenga el prefijo /api/auth/...
  if (req.url !== '/' && !req.url.startsWith('/api/')) {
    req.url = req.url.startsWith('/') ? `/api${req.url}` : `/api/${req.url}`;
  }
  next();
});

let appInitPromise: Promise<void> | null = null;

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

async function ensureApp() {
  if (!appInitPromise) {
    appInitPromise = bootstrapServer().catch((err) => {
      console.error('CRITICAL: Error inicializando NestJS en Serverless:', err);
      appInitPromise = null;
      throw err;
    });
  }
  return appInitPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    await ensureApp();

    return await new Promise<void>((resolve, reject) => {
      res.on('finish', () => resolve());
      res.on('close', () => resolve());
      res.on('error', (err) => reject(err));

      server(req, res, (err: any) => {
        if (err) {
          if (!res.headersSent) {
            res.status(500).json({
              statusCode: 500,
              error: 'Internal Server Error',
              message: err?.message || String(err),
            });
          }
          return reject(err);
        }
        if (!res.headersSent) {
          res.status(404).json({
            statusCode: 404,
            error: 'Not Found',
            message: `Ruta no encontrada: ${req.method} ${req.url}`,
          });
        }
        resolve();
      });
    });
  } catch (err: any) {
    console.error('Error procesando solicitud en Vercel:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        statusCode: 500,
        error: 'Bootstrap Error',
        message: err?.message || 'Error inicializando el servidor',
        stack: err?.stack,
      });
    }
  }
}


