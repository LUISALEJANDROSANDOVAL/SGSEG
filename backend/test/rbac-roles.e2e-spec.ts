import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';

describe('Módulo 2: RBAC, Alineación Estricta de 4 Roles y Recuperación Administrativa (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let tokenCoord: string;
  let tokenSec: string;
  let tokenJefeSistemas: string;
  let tokenJefeDerecho: string;
  let tokenVice: string;

  let estudianteSistemasId: string;
  let estudianteDerechoId: string;
  let carreraSistemasId: string;
  let carreraDerechoId: string;
  let areaSistemasId: string;
  let areaDerechoId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    // 1. Obtener tokens para cada rol institucional
    const loginCoord = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'coord@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    tokenCoord = loginCoord.body.accessToken;

    const loginSec = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'secretaria@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    tokenSec = loginSec.body.accessToken;

    const loginSistemas = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'jefe.sistemas@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    tokenJefeSistemas = loginSistemas.body.accessToken;

    const loginDerecho = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'jefe.derecho@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    tokenJefeDerecho = loginDerecho.body.accessToken;

    const loginVice = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'vicerrector@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    tokenVice = loginVice.body.accessToken;

    // Obtener IDs de referencia de la BD sembrada
    const carSis = await prisma.carrera.findFirst({
      where: { nombre: { contains: 'Sistemas' } },
    });
    carreraSistemasId = String(carSis?.idCarrera);

    const estSis = await prisma.estudiante.findFirst({
      where: { carnetEstudiantil: 'SIS-20220001' },
    });
    estudianteSistemasId = String(estSis?.idEstudiante || 1);

    const carDer = await prisma.carrera.findFirst({
      where: { nombre: { contains: 'Derecho' } },
    });
    carreraDerechoId = String(carDer?.idCarrera);

    const estDer = await prisma.estudiante.findFirst({
      where: { carnetEstudiantil: 'DER-20220001' },
    });
    estudianteDerechoId = String(estDer?.idEstudiante || 2);

    const areaSis = await prisma.areaAcademica.findFirst({
      where: { idCarrera: carSis?.idCarrera },
    });
    areaSistemasId = String(areaSis?.idArea);

    const areaDer = await prisma.areaAcademica.findFirst({
      where: { idCarrera: carDer?.idCarrera },
    });
    areaDerechoId = String(areaDer?.idArea);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. Rol Vicerrectorado: Bloqueo de Mutación y Habilitación Exclusiva de Consultas', () => {
    it('Vicerrectorado puede consultar métricas, embudo y reportes con GET (200 OK)', async () => {
      await request(app.getHttpServer())
        .get('/casos/metricas')
        .set('Authorization', `Bearer ${tokenVice}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/defensas/embudo')
        .set('Authorization', `Bearer ${tokenVice}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/estudiantes')
        .set('Authorization', `Bearer ${tokenVice}`)
        .expect(200);
    });

    it('Vicerrectorado NO puede crear casos de estudio en POST /casos (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/casos')
        .set('Authorization', `Bearer ${tokenVice}`)
        .send({
          idArea: areaSistemasId,
          titulo: 'Caso no permitido',
          contenido: 'Planteamiento...',
        })
        .expect(403);
    });

    it('Vicerrectorado NO puede programar defensas en POST /defensas/programar (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/defensas/programar')
        .set('Authorization', `Bearer ${tokenVice}`)
        .send({
          idEstudiante: estudianteSistemasId,
          tipoDefensa: 'INTERNA',
          fechaDefensa: '2026-11-20',
        })
        .expect(403);
    });

    it('Vicerrectorado NO puede registrar estudiantes en POST /estudiantes (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/estudiantes')
        .set('Authorization', `Bearer ${tokenVice}`)
        .send({
          carnetEstudiantil: 'TEST-9999',
          carnetIdentidad: '99999 SC',
          nombreCompleto: 'Estudiante Test',
          correo: 'test@uni.edu.bo',
        })
        .expect(403);
    });

    it('Vicerrectorado NO puede ejecutar sorteos en POST /sorteos/area (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/sorteos/area')
        .set('Authorization', `Bearer ${tokenVice}`)
        .send({ idDefensa: '1', estudiantePresente: true })
        .expect(403);
    });
  });

  describe('2. Rol Jefe de Carrera: Aislamiento Estricto por carrera_id', () => {
    it('Jefe de Sistemas NO puede consultar por ID un estudiante de Derecho (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get(`/estudiantes/${estudianteDerechoId}`)
        .set('Authorization', `Bearer ${tokenJefeSistemas}`)
        .expect(403);
    });

    it('Jefe de Sistemas SÍ puede consultar un estudiante de su carrera (200 OK)', async () => {
      await request(app.getHttpServer())
        .get(`/estudiantes/${estudianteSistemasId}`)
        .set('Authorization', `Bearer ${tokenJefeSistemas}`)
        .expect(200);
    });

    it('Jefe de Sistemas NO puede modificar un estudiante de Derecho (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .put(`/estudiantes/${estudianteDerechoId}`)
        .set('Authorization', `Bearer ${tokenJefeSistemas}`)
        .send({ nombreCompleto: 'Intento de Modificación Ilegal' })
        .expect(403);
    });

    it('Jefe de Sistemas NO puede crear casos en áreas de Derecho (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/casos')
        .set('Authorization', `Bearer ${tokenJefeSistemas}`)
        .send({
          idArea: areaDerechoId,
          titulo: 'Caso en Área de Derecho por Sistemas',
          contenido: 'Planteamiento...',
        })
        .expect(403);
    });

    it('Jefe de Sistemas SÍ puede crear casos en áreas de Sistemas (201 Created)', async () => {
      const res = await request(app.getHttpServer())
        .post('/casos')
        .set('Authorization', `Bearer ${tokenJefeSistemas}`)
        .send({
          idArea: areaSistemasId,
          titulo: 'Caso Legítimo de Sistemas RBAC Test',
          contenido: 'Planteamiento del problema de sistemas...',
        })
        .expect(201);

      expect(res.body.caso).toBeDefined();
    });
  });

  describe('3. Rol Secretaría: Operación de Estudiantes, Cronogramas y Sorteo Digital', () => {
    it('Secretaría SÍ puede registrar un estudiante (201 Created)', async () => {
      const randomCi = `SEC-${Date.now().toString().slice(-6)}`;
      const res = await request(app.getHttpServer())
        .post('/estudiantes')
        .set('Authorization', `Bearer ${tokenSec}`)
        .send({
          carnetEstudiantil: randomCi,
          carnetIdentidad: `${randomCi} SC`,
          nombreCompleto: 'Estudiante Inscrito por Secretaría',
          correo: `est.${randomCi.toLowerCase()}@uni.edu.bo`,
          idCarrera: carreraSistemasId,
        })
        .expect(201);

      expect(res.body.estudiante).toBeDefined();
    });

    it('Secretaría NO puede crear áreas ni casos académicos (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/casos/areas')
        .set('Authorization', `Bearer ${tokenSec}`)
        .send({
          idCarrera: '1',
          nombre: 'Área Académica Prohibida para Secretaría',
          umbralDisponibilidad: 2,
        })
        .expect(403);

      await request(app.getHttpServer())
        .post('/casos')
        .set('Authorization', `Bearer ${tokenSec}`)
        .send({
          idArea: areaSistemasId,
          titulo: 'Caso no permitido para Secretaría',
          contenido: 'Planteamiento...',
        })
        .expect(403);
    });

    it('Secretaría NO puede acceder a la gestión de usuarios en /auth/users (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get('/auth/users')
        .set('Authorization', `Bearer ${tokenSec}`)
        .expect(403);
    });
  });

  describe('4. Rol Coordinación: Permisos Globales y Gestión de Usuarios', () => {
    it('Coordinación puede acceder a la lista global de usuarios /auth/users (200 OK)', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/users')
        .set('Authorization', `Bearer ${tokenCoord}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('Coordinación puede consultar estudiantes de todas las carreras', async () => {
      const res = await request(app.getHttpServer())
        .get('/estudiantes')
        .set('Authorization', `Bearer ${tokenCoord}`)
        .expect(200);

      expect(res.body.items.length).toBeGreaterThan(0);
    });
  });

  describe('5. Recuperación Administrativa de Emergencia (Fallback / Superadministrador)', () => {
    it('Coordinación puede resetear la contraseña de un usuario mediante POST /auth/admin/reset-password', async () => {
      // Resetear la contraseña del Jefe de Sistemas
      const res = await request(app.getHttpServer())
        .post('/auth/admin/reset-password')
        .set('Authorization', `Bearer ${tokenCoord}`)
        .send({
          idUsuario: 'jefe.sistemas@uni.edu.bo',
          newPassword: 'NuevaPassword2026!',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.correoInstitucional).toBe('jefe.sistemas@uni.edu.bo');

      // Verificar que el usuario puede iniciar sesión inmediatamente con la nueva credencial
      const loginVerif = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          correoInstitucional: 'jefe.sistemas@uni.edu.bo',
          password: 'NuevaPassword2026!',
        })
        .expect(200);

      expect(loginVerif.body.accessToken).toBeDefined();

      // Restaurar credencial estándar para no afectar otros tests
      await request(app.getHttpServer())
        .post('/auth/admin/reset-password')
        .set('Authorization', `Bearer ${tokenCoord}`)
        .send({
          idUsuario: 'jefe.sistemas@uni.edu.bo',
          newPassword: 'Admin123!',
        })
        .expect(200);
    });

    it('Permite reseteo de contingencia usando adminSecret si no hay sesión activa de administrador', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/admin/reset-password')
        .send({
          idUsuario: 'secretaria@uni.edu.bo',
          adminSecret: 'SGSEG_FALLBACK_2026!',
          newPassword: 'SecretariaReset2026!',
        })
        .expect(200);

      expect(res.body.success).toBe(true);

      // Restaurar
      await request(app.getHttpServer())
        .post('/auth/admin/reset-password')
        .send({
          idUsuario: 'secretaria@uni.edu.bo',
          adminSecret: 'SGSEG_FALLBACK_2026!',
          newPassword: 'Admin123!',
        })
        .expect(200);
    });

    it('Rechaza reseteo si no se provee ni sesión administrativa ni adminSecret válido (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/auth/admin/reset-password')
        .send({
          idUsuario: 'coord@uni.edu.bo',
          newPassword: 'HackPassword123!',
        })
        .expect(403);
    });
  });
});
