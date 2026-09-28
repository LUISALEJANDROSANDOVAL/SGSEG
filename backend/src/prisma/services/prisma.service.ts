import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor() {
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

    // Si alguna de las URLs es remota (no localhost), usar esa primero
    const remoteUrl = candidates.find(
      (u) => !u.includes('localhost') && !u.includes('127.0.0.1'),
    );

    const isVercel =
      !!process.env.VERCEL || process.env.NODE_ENV === 'production';
    const connectionString =
      remoteUrl ||
      candidates[0] ||
      (isVercel
        ? defaultRemoteUrl
        : 'postgresql://sgseg:sgseg@localhost:5437/sgseg?schema=public');

    const isRemote =
      !connectionString.includes('localhost') &&
      !connectionString.includes('127.0.0.1');

    const pool = new Pool({
      connectionString,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 10000,
      max: 5,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err: any) {
      console.warn(
        'Advertencia de conexión inicial Prisma (se reconectará bajo demanda):',
        err?.message || err,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      await this.pool?.end();
    } catch (err) {
      // Ignorar errores al destruir
    }
  }
}
