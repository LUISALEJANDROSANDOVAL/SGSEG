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
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.DATABASE_URL_DATABASE_URL ||
      process.env.DATABASE_URL_POSTGRES_URL ||
      process.env.DATABASE_URL_PRISMA_DATABASE_URL ||
      process.env.STORAGE_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL ||
      process.env.STORAGE_DATABASE_URL ||
      'postgresql://sgseg:sgseg@localhost:5437/sgseg?schema=public';
    const isRemote =
      !connectionString.includes('localhost') &&
      !connectionString.includes('127.0.0.1');

    const pool = new Pool({
      connectionString,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 5000,
      max: 5,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool?.end();
  }
}
