import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';

describe('Auditoría TK-12: Pruebas de Seguridad y Aislamiento (e2e)', () => {
  let app: INestApplication<App>;
  let coordToken: string;
  let jefeSistemasToken: string;
  let viceToken: string;
  let prisma: PrismaService;
  let carreraDerechoId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    prisma = app.get(PrismaService);

    // 1. Obtener tokens para cada rol
    const loginCoord = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'coord@uni.edu.bo', password: 'Admin123!' });
    coordToken = loginCoord.body.accessToken;

    const loginSistemas = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'jefe.sistemas@uni.edu.bo', password: 'Admin123!' });
    jefeSistemasToken = loginSistemas.body.accessToken;

    const loginVice = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'vicerrector@uni.edu.bo', password: 'Admin123!' });
    viceToken = loginVice.body.accessToken;

    // Obtener ID de la carrera Derecho
    const carDerecho = await prisma.carrera.findFirst({ where: { nombre: 'Derecho' } });
    carreraDerechoId = String(carDerecho?.idCarrera || 2);
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

    it('Debe rechazar consulta por carnet en /estudiantes/carnet/:carnet sin token JWT (revisión de cierre @Public)', async () => {
      await request(app.getHttpServer())
        .get('/estudiantes/carnet/SIS-20220001')
        .expect(401);
    });

    it('Debe rechazar consulta por ID en /estudiantes/:id sin token JWT (revisión de cierre @Public)', async () => {
      await request(app.getHttpServer())
        .get('/estudiantes/1')
        .expect(401);
    });
  });

  describe('2. Aislamiento de Privilegios por Rol (HTTP 403)', () => {
    it('Debe prohibir que un Jefe de Sistemas cree áreas académicas para Derecho (403)', async () => {
      const res = await request(app.getHttpServer())
        .post('/casos/areas')
        .set('Authorization', `Bearer ${jefeSistemasToken}`)
        .send({
          idCarrera: carreraDerechoId,
          nombre: 'Área Ilícita de Prueba',
          umbralDisponibilidad: 2,
        })
        .expect(403);

      expect(res.body.message).toContain('No tienes permisos para crear áreas en carreras ajenas');
    });

    it('Debe prohibir que un Jefe de Carrera acceda a la lista global de usuarios en /auth/users (403)', async () => {
      await request(app.getHttpServer())
        .get('/auth/users')
        .set('Authorization', `Bearer ${jefeSistemasToken}`)
        .expect(403);
    });

    it('Debe permitir a Coordinación consultar la lista global de usuarios en /auth/users (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/users')
        .set('Authorization', `Bearer ${coordToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('Debe prohibir que Vicerrectorado ejecute mutaciones en /casos (403)', async () => {
      await request(app.getHttpServer())
        .post('/casos')
        .set('Authorization', `Bearer ${viceToken}`)
        .send({
          idArea: '1',
          titulo: 'Caso Ilícito por Vicerrectorado',
          contenido: 'Planteamiento...',
        })
        .expect(403);
    });
  });
});
