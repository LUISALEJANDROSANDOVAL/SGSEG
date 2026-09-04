import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';

describe('Vistas Optimizadas por Carrera (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let coordToken: string;
  let jefeDerechoToken: string;
  let jefeSistemasToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    // 1. Token de Coordinación
    const coordRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'coord@uni.edu.bo', password: 'Admin123!' });
    coordToken = coordRes.body.accessToken;

    // 2. Token de Jefe de Derecho
    const derechoRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'jefe.derecho@uni.edu.bo', password: 'Admin123!' });
    jefeDerechoToken = derechoRes.body.accessToken;

    // 3. Token de Jefe de Sistemas
    const sistemasRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'jefe.sistemas@uni.edu.bo', password: 'Admin123!' });
    jefeSistemasToken = sistemasRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. Consulta de Casos mediante Vista por idCarrera', () => {
    it('Debe permitir a Coordinación consultar casos de Derecho (idCarrera: 85)', async () => {
      const res = await request(app.getHttpServer())
        .get('/casos/vistas/carrera/85/casos')
        .set('Authorization', `Bearer ${coordToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.items)).toBe(true);

      if (res.body.items.length > 0) {
        const item = res.body.items[0];
        expect(item).toHaveProperty('idCasoEstudio');
        expect(item).toHaveProperty('titulo');
        expect(item).toHaveProperty('idCarrera', '85');
        expect(item).toHaveProperty('totalUsos');
        expect(item).toHaveProperty('estadoEfectivo');
        expect(item).toHaveProperty('esDisponibleParaSorteo');
      }
    });

    it('Debe permitir al Jefe de Carrera de Derecho consultar casos de su carrera (85)', async () => {
      const res = await request(app.getHttpServer())
        .get('/casos/vistas/carrera/85/casos')
        .set('Authorization', `Bearer ${jefeDerechoToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('Debe PROHIBIR (403) que el Jefe de Carrera de Sistemas consulte casos de Derecho (85)', async () => {
      const res = await request(app.getHttpServer())
        .get('/casos/vistas/carrera/85/casos')
        .set('Authorization', `Bearer ${jefeSistemasToken}`)
        .expect(403);

      expect(res.body.message).toContain('No tienes permisos para visualizar');
    });
  });

  describe('2. Consulta de Áreas mediante Vista por idCarrera', () => {
    it('Debe permitir a Coordinación consultar áreas con stock de Derecho (85)', async () => {
      const res = await request(app.getHttpServer())
        .get('/casos/vistas/carrera/85/areas')
        .set('Authorization', `Bearer ${coordToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        const area = res.body[0];
        expect(area).toHaveProperty('idArea');
        expect(area).toHaveProperty('nombreArea');
        expect(area).toHaveProperty('idCarrera', '85');
        expect(area).toHaveProperty('totalCasos');
        expect(area).toHaveProperty('casosDisponibles');
        expect(area).toHaveProperty('stockCritico');
        expect(area).toHaveProperty('mensajeAlerta');
      }
    });

    it('Debe PROHIBIR (403) que el Jefe de Carrera de Sistemas consulte áreas de Derecho (85)', async () => {
      await request(app.getHttpServer())
        .get('/casos/vistas/carrera/85/areas')
        .set('Authorization', `Bearer ${jefeSistemasToken}`)
        .expect(403);
    });
  });
});
