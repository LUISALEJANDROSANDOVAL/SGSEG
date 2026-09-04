import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';

describe('Aislamiento por Carrera y Validación Reglamentaria de Sorteo (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let tokenDerecho: string;
  let tokenSistemas: string;
  let tokenCoord: string;
  let tokenVice: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    // 1. Obtener tokens para cada rol
    const loginDerecho = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'jefe.derecho@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    tokenDerecho = loginDerecho.body.accessToken;

    const loginSistemas = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'jefe.sistemas@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    tokenSistemas = loginSistemas.body.accessToken;

    const loginCoord = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'coord@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    tokenCoord = loginCoord.body.accessToken;

    const loginVice = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'vicerrector@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    tokenVice = loginVice.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. Aislamiento Estricto para Jefe de Carrera de Derecho', () => {
    it('GET /api/estudiantes/carreras debe retornar ÚNICAMENTE la carrera de Derecho', async () => {
      const res = await request(app.getHttpServer())
        .get('/estudiantes/carreras')
        .set('Authorization', `Bearer ${tokenDerecho}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].nombre).toBe('Derecho');
    });

    it('GET /api/defensas debe retornar únicamente defensas de estudiantes de Derecho', async () => {
      const res = await request(app.getHttpServer())
        .get('/defensas')
        .set('Authorization', `Bearer ${tokenDerecho}`)
        .expect(200);

      expect(res.body.items.length).toBeGreaterThan(0);
      for (const def of res.body.items) {
        expect(def.instancia.proceso.estudiante.planEstudio.carrera.nombre).toBe('Derecho');
      }
    });

    it('GET /api/casos debe retornar únicamente casos de estudio de Derecho', async () => {
      const res = await request(app.getHttpServer())
        .get('/casos')
        .set('Authorization', `Bearer ${tokenDerecho}`)
        .expect(200);

      expect(res.body.items.length).toBeGreaterThan(0);
      for (const caso of res.body.items) {
        expect(caso.area.carrera.nombre).toBe('Derecho');
      }
    });

    it('GET /api/casos/metricas debe totalizar únicamente el stock de Derecho', async () => {
      const res = await request(app.getHttpServer())
        .get('/casos/metricas')
        .set('Authorization', `Bearer ${tokenDerecho}`)
        .expect(200);

      // Derecho tiene 4 áreas oficiales (Civil, Penal, Comercial, Constitucional)
      expect(res.body.areasCubiertas).toBe(4);
    });
  });

  describe('2. Aislamiento Estricto para Jefe de Carrera de Sistemas', () => {
    it('GET /api/estudiantes/carreras debe retornar ÚNICAMENTE la carrera de Sistemas', async () => {
      const res = await request(app.getHttpServer())
        .get('/estudiantes/carreras')
        .set('Authorization', `Bearer ${tokenSistemas}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].nombre).toBe('Sistemas');
    });

    it('GET /api/defensas debe retornar únicamente defensas de estudiantes de Sistemas', async () => {
      const res = await request(app.getHttpServer())
        .get('/defensas')
        .set('Authorization', `Bearer ${tokenSistemas}`)
        .expect(200);

      expect(res.body.items.length).toBeGreaterThan(0);
      for (const def of res.body.items) {
        expect(def.instancia.proceso.estudiante.planEstudio.carrera.nombre).toBe('Sistemas');
      }
    });

    it('GET /api/casos debe retornar únicamente casos de estudio de Sistemas', async () => {
      const res = await request(app.getHttpServer())
        .get('/casos')
        .set('Authorization', `Bearer ${tokenSistemas}`)
        .expect(200);

      expect(res.body.items.length).toBeGreaterThan(0);
      for (const caso of res.body.items) {
        expect(caso.area.carrera.nombre).toBe('Sistemas');
      }
    });
  });

  describe('3. Visión Global para Coordinación Académica', () => {
    it('GET /api/estudiantes/carreras debe retornar las 17 carreras oficiales de las 3 facultades', async () => {
      const res = await request(app.getHttpServer())
        .get('/estudiantes/carreras')
        .set('Authorization', `Bearer ${tokenCoord}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(17);
    });

    it('GET /api/defensas debe listar defensas de múltiples carreras', async () => {
      const res = await request(app.getHttpServer())
        .get('/defensas')
        .set('Authorization', `Bearer ${tokenCoord}`)
        .expect(200);

      const carrerasEnDefensas = new Set(
        res.body.items.map((d: any) => d.instancia.proceso.estudiante.planEstudio.carrera.nombre),
      );
      expect(carrerasEnDefensas.size).toBeGreaterThan(1);
    });
  });

  describe('4. Reglas de Negocio del Sorteo y Prevención de Duplicados', () => {
    it('Debe ejecutar sorteo de área en defensa limpia de Derecho y rechazar sorteo duplicado con 400', async () => {
      // 1. Obtener la defensa limpia programada de Derecho
      const defensasRes = await request(app.getHttpServer())
        .get('/defensas?estadoDefensa=PROGRAMADA')
        .set('Authorization', `Bearer ${tokenDerecho}`)
        .expect(200);

      const defensaLimpia = defensasRes.body.items.find(
        (d: any) => d.instancia.proceso.estudiante.carnetEstudiantil === 'DER-20220001',
      );
      expect(defensaLimpia).toBeDefined();

      // 2. Ejecutar Sorteo de Área
      const sorteoRes = await request(app.getHttpServer())
        .post('/sorteos/area')
        .set('Authorization', `Bearer ${tokenDerecho}`)
        .send({ idDefensa: defensaLimpia.idDefensa, estudiantePresente: true })
        .expect(201);

      expect(sorteoRes.body.tokenActa).toBeDefined();
      expect(sorteoRes.body.areaGanadora).toBeDefined();

      // 3. Intentar volver a sortear el área en la misma defensa -> Debe fallar con 400
      const duplicateRes = await request(app.getHttpServer())
        .post('/sorteos/area')
        .set('Authorization', `Bearer ${tokenDerecho}`)
        .send({ idDefensa: defensaLimpia.idDefensa, estudiantePresente: true })
        .expect(400);

      expect(duplicateRes.body.message).toContain('Esta defensa ya cuenta con un área académica sorteada');

      // 4. Intentar que Jefe de Sistemas sortee la defensa de Derecho -> Debe fallar con 403
      await request(app.getHttpServer())
        .post('/sorteos/caso')
        .set('Authorization', `Bearer ${tokenSistemas}`)
        .send({ idDefensa: defensaLimpia.idDefensa, estudiantePresente: true })
        .expect(403);

      // 5. El Jefe de Derecho ejecuta el Sorteo de Caso legítimamente
      const casoRes = await request(app.getHttpServer())
        .post('/sorteos/caso')
        .set('Authorization', `Bearer ${tokenDerecho}`)
        .send({ idDefensa: defensaLimpia.idDefensa, estudiantePresente: true })
        .expect(201);

      expect(casoRes.body.tokenActa).toBeDefined();
      expect(casoRes.body.casoGanador).toBeDefined();
    });
  });

  describe('5. Restricción Estricta para Vicerrectorado (Solo Lectura, Sin Autorización de Sorteos)', () => {
    it('Vicerrectorado puede consultar defensas, casos y carreras (acceso global)', async () => {
      const resCarreras = await request(app.getHttpServer())
        .get('/estudiantes/carreras')
        .set('Authorization', `Bearer ${tokenVice}`)
        .expect(200);
      expect(resCarreras.body.length).toBe(17);

      const resDefensas = await request(app.getHttpServer())
        .get('/defensas')
        .set('Authorization', `Bearer ${tokenVice}`)
        .expect(200);
      expect(resDefensas.body.items).toBeDefined();
    });

    it('Vicerrectorado NO debe tener autorización para sortear área (debe retornar 403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .post('/sorteos/area')
        .set('Authorization', `Bearer ${tokenVice}`)
        .send({ idDefensa: '1', estudiantePresente: true })
        .expect(403);

      expect(res.body.statusCode).toBe(403);
    });

    it('Vicerrectorado NO debe tener autorización para sortear caso (debe retornar 403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .post('/sorteos/caso')
        .set('Authorization', `Bearer ${tokenVice}`)
        .send({ idDefensa: '1', estudiantePresente: true })
        .expect(403);

      expect(res.body.statusCode).toBe(403);
    });

    it('Vicerrectorado NO debe tener autorización para sorteo conjunto (debe retornar 403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .post('/sorteos/conjunto')
        .set('Authorization', `Bearer ${tokenVice}`)
        .send({ idDefensa: '1', estudiantePresente: true })
        .expect(403);

      expect(res.body.statusCode).toBe(403);
    });
  });
});
