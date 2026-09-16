FROM node:20-slim

WORKDIR /app

# Instalar dependencias del sistema requeridas por Prisma y PostgreSQL
RUN apt-get update -y && apt-get install -y openssl netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig*.json ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx ts-node prisma/apply-views.ts && npx ts-node prisma/seed.ts && node dist/main.js"]
