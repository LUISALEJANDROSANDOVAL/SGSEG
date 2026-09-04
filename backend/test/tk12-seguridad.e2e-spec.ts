import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';

describe('Auditoría TK-12: Pruebas de Seguridad y Aislamiento (e2e)', () => {
  let app: INestApplication<App>;
  let userToken: string;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    prisma = app.get(PrismaService);

    // Obtener un token válido para pruebas de rol (Jefe de Carrera / Coordinación)
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'coord@uni.edu.bo', password: 'Admin123!' });
    
    userToken = res.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. Validación de Accesos sin JWT (HTTP 401)', () => {
    it('Debe rechazar peticiones al endpoint protegido /estudiantes/bulk-upsert si no hay Token JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/estudiantes/bulk-upsert')
        .send({})
        .expect(401);
      
      expect(res.body.message).toEqual('Token de acceso requerido');
    });

    it('Debe rechazar peticiones con un Token JWT inválido o malformado', async () => {
      const res = await request(app.getHttpServer())
        .post('/estudiantes/bulk-upsert')
        .set('Authorization', 'Bearer token_invalido_12345')
        .send({})
        .expect(401);
      
      expect(res.body.message).toEqual('Token inválido o expirado');
    });
  });

  describe('2. Aislamiento de Privilegios (HTTP 403) - [EN ESPERA DE MÓDULO ACADEMIA]', () => {
    it.todo('Debe prohibir que un Jefe de Carrera cree planes de estudio de otra carrera');
    it.todo('Debe prohibir que un Jefe de Carrera edite áreas académicas ajenas a su jurisdicción');
    
    // NOTA: Estas pruebas se implementarán completamente cuando se fusione
    // la rama "feature/modulo-academia" que contiene los controladores de Planes y Áreas.
  });
});
