import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

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

const isVercel =
  !!process.env.VERCEL || process.env.NODE_ENV === 'production';
const url =
  remoteUrl ||
  candidates[0] ||
  (isVercel
    ? defaultRemoteUrl
    : 'postgresql://sgseg:sgseg@localhost:5437/sgseg?schema=public');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url,
  },
});

