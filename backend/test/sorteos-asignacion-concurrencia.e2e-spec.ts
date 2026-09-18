/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';

describe('Módulo 1: Sorteo Digital, Asignación y Control de Concurrencia (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let vicerrectorToken: string;

  // IDs de prueba para cleanup seguro
  let facultadId: number | bigint;
  let carreraId: number | bigint;
  let planId: number | bigint;
  let areaId: number | bigint;
  let casoId: number | bigint;
  let estudianteId1: number | bigint;
  let estudianteId2: number | bigint;
  let defensaId1: string;
  let defensaId2: string;
  let ganadoraDefensaId: string;
  let sesionSlug: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    // 1. Obtener token de Coordinación / Admin
    const resAuth = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'coord@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    adminToken = (resAuth.body as { accessToken: string }).accessToken;

    // 2. Obtener token de Vicerrectorado
    const resVicerrec = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'vicerrector@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    vicerrectorToken = (resVicerrec.body as { accessToken: string }).accessToken;

    // 3. Crear fixtures en la BD
    const fac = await prisma.facultad.create({
      data: { nombre: `Facultad Concurrencia ${Date.now()}` },
    });
    facultadId = fac.idFacultad;

    const car = await prisma.carrera.create({
      data: { nombre: `Carrera Concurrencia ${Date.now()}`, idFacultad: facultadId },
    });
    carreraId = car.idCarrera;

    const plan = await prisma.planEstudio.create({
      data: { nombre: `Plan Concurrencia ${Date.now()}`, idCarrera: carreraId },
    });
    planId = plan.idPlanEstudio;

    const area = await prisma.areaAcademica.create({
      data: { nombre: `Área Concurrencia ${Date.now()}`, idCarrera: carreraId },
    });
    areaId = area.idArea;

    // Crear un único caso disponible que será disputado en concurrencia
    const caso = await prisma.casoEstudio.create({
      data: {
        titulo: `Caso Único Concurrente ${Date.now()}`,
        contenido: 'Pliego de especificaciones para defensa de grado de alta exigencia.',
        idArea: areaId,
        estado: 'DISPONIBLE',
      },
    });
    casoId = caso.idCasoEstudio;

    // Estudiante 1
    const est1 = await prisma.estudiante.create({
      data: {
        carnetEstudiantil: `CONC-EST-1-${Date.now()}`,
        carnetIdentidad: '90001-SCZ',
        nombreCompleto: 'Estudiante Concurrente 1',
        correoInstitucional: `conc1.${Date.now()}@uni.edu.bo`,
        idPlanEstudio: planId,
      },
    });
    estudianteId1 = est1.idEstudiante;

    // Estudiante 2
    const est2 = await prisma.estudiante.create({
      data: {
        carnetEstudiantil: `CONC-EST-2-${Date.now()}`,
        carnetIdentidad: '90002-SCZ',
        nombreCompleto: 'Estudiante Concurrente 2',
        correoInstitucional: `conc2.${Date.now()}@uni.edu.bo`,
        idPlanEstudio: planId,
      },
    });
    estudianteId2 = est2.idEstudiante;

    // Programar Defensa 1
    const resDef1 = await request(app.getHttpServer())
      .post('/defensas/programar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        idEstudiante: Number(estudianteId1),
        tipoDefensa: 'INTERNA',
        fechaDefensa: new Date().toISOString().split('T')[0],
      })
      .expect(201);
    defensaId1 = String(resDef1.body.defensa.idDefensa);

    // Programar Defensa 2
    const resDef2 = await request(app.getHttpServer())
      .post('/defensas/programar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        idEstudiante: Number(estudianteId2),
        tipoDefensa: 'INTERNA',
        fechaDefensa: new Date().toISOString().split('T')[0],
      })
      .expect(201);
    defensaId2 = String(resDef2.body.defensa.idDefensa);
  });

  afterAll(async () => {
    try {
      // Limpiar sesiones y asignaciones
      if (defensaId1 || defensaId2) {
        const defIds = [Number(defensaId1), Number(defensaId2)].filter(Boolean);
        await prisma.sesionEspectadorSorteo.deleteMany({
          where: { idDefensa: { in: defIds } },
        });
        await prisma.asignacionCaso.deleteMany({
          where: { idDefensa: { in: defIds } },
        });
        await prisma.registroAuditoria.deleteMany({
          where: { idDefensa: { in: defIds } },
        });
        await prisma.sorteoAreaPool.deleteMany({
          where: { sorteoArea: { sorteo: { idDefensa: { in: defIds } } } },
        });
        await prisma.sorteoArea.deleteMany({
          where: { sorteo: { idDefensa: { in: defIds } } },
        });
        await prisma.sorteoCaso.deleteMany({
          where: { sorteo: { idDefensa: { in: defIds } } },
        });
        await prisma.sorteo.deleteMany({
          where: { idDefensa: { in: defIds } },
        });
        await prisma.defensaExamenGrado.deleteMany({
          where: { idDefensa: { in: defIds } },
        });
      }

      if (estudianteId1 || estudianteId2) {
        const estIds = [Number(estudianteId1), Number(estudianteId2)].filter(Boolean);
        await prisma.instanciaExamenGrado.deleteMany({
          where: { proceso: { idEstudiante: { in: estIds } } },
        });
        await prisma.procesoExamenGrado.deleteMany({
          where: { idEstudiante: { in: estIds } },
        });
        await prisma.estudiante.deleteMany({
          where: { idEstudiante: { in: estIds } },
        });
      }

      if (casoId) {
        await prisma.casoEstudio.deleteMany({ where: { idCasoEstudio: Number(casoId) } });
      }
      if (areaId) {
        await prisma.planArea.deleteMany({ where: { idArea: Number(areaId) } });
        await prisma.areaAcademica.deleteMany({ where: { idArea: Number(areaId) } });
      }
      if (planId) {
        await prisma.planEstudio.deleteMany({ where: { idPlanEstudio: Number(planId) } });
      }
      if (carreraId) {
        await prisma.carrera.deleteMany({ where: { idCarrera: Number(carreraId) } });
      }
      if (facultadId) {
        await prisma.facultad.deleteMany({ where: { idFacultad: Number(facultadId) } });
      }
    } finally {
      await prisma.$disconnect();
      await app.close();
    }
  });

  describe('1. Seguridad y RBAC en Finalización de Sorteo', () => {
    it('debe bloquear a Vicerrectorado con 403 Forbidden al intentar finalizar un sorteo', async () => {
      const res = await request(app.getHttpServer())
        .post('/sorteos/finalizar')
        .set('Authorization', `Bearer ${vicerrectorToken}`)
        .send({
          idDefensa: defensaId1,
          idArea: String(areaId),
          idCaso: String(casoId),
        })
        .expect(403);

      expect(res.body.message).toBeDefined();
    });
  });

  describe('2. Control Estricto de Concurrencia (Garantía ACID de Caso Único)', () => {
    it('debe permitir asignar el caso a una defensa y rechazar con 409 Conflict a la otra en ejecución simultánea', async () => {
      // Disparamos ambas peticiones en paralelo compitiendo por el MISMO caso
      const [res1, res2] = await Promise.all([
        request(app.getHttpServer())
          .post('/sorteos/finalizar')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            idDefensa: defensaId1,
            idArea: String(areaId),
            idCaso: String(casoId),
            estudiantePresente: true,
          }),
        request(app.getHttpServer())
          .post('/sorteos/finalizar')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            idDefensa: defensaId2,
            idArea: String(areaId),
            idCaso: String(casoId),
            estudiantePresente: true,
          }),
      ]);

      const statuses = [res1.status, res2.status].sort();

      // Exactamente una debe haber triunfado (201) y la otra debe haber sido rechazada por conflicto (409)
      expect(statuses).toEqual([201, 409]);

      const conflictoRes = res1.status === 409 ? res1 : res2;
      const exitoRes = res1.status === 201 ? res1 : res2;
      ganadoraDefensaId = res1.status === 201 ? defensaId1 : defensaId2;

      expect(conflictoRes.body.message).toContain(
        'El caso de estudio ya se encuentra asignado a otro estudiante.',
      );

      // La exitosa debe contener la persistencia completa
      expect(exitoRes.body.asignacion).toBeDefined();
      expect(exitoRes.body.codigoActa).toBeDefined();
      expect(exitoRes.body.tokenActa).toBeDefined();
      expect(exitoRes.body.plazoLimiteEntrega).toBeDefined();

      // Verificar en la BD que la tabla asignacion_caso tiene exactamente 1 registro para este caso
      const asignacionesBD = await prisma.asignacionCaso.findMany({
        where: { idCaso: Number(casoId), estado: 'ASIGNADO' },
      });
      expect(asignacionesBD).toHaveLength(1);
    });

    it('debe impedir finalizar nuevamente una defensa que ya cuenta con asignación activa', async () => {
      const res = await request(app.getHttpServer())
        .post('/sorteos/finalizar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          idDefensa: ganadoraDefensaId,
          idArea: String(areaId),
          idCaso: String(casoId),
        })
        .expect(400);

      expect(res.body.message).toContain(
        'ya cuenta con una asignación de caso activa',
      );
    });
  });

  describe('3. Consulta de Asignación Formal', () => {
    it('debe permitir consultar la asignación formal por ID de defensa', async () => {
      const res = await request(app.getHttpServer())
        .get(`/sorteos/asignacion/${ganadoraDefensaId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.idAsignacion).toBeDefined();
      expect(res.body.caso).toBeDefined();
      expect(res.body.estudiante).toBeDefined();
      expect(res.body.area).toBeDefined();
      expect(res.body.codigoActa).toBeDefined();
    });
  });

  describe('4. Enlace Temporal de Visualización para Estudiante (Modo Espectador)', () => {
    it('debe generar un enlace temporal con token y slug únicos', async () => {
      const res = await request(app.getHttpServer())
        .post('/sorteos/enlace-espectador')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          idDefensa: ganadoraDefensaId,
          duracionMinutos: 60,
        })
        .expect(201);

      expect(res.body.slug).toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.urlEspectador).toContain(`/sorteos/espectador/${res.body.slug}`);
      expect(res.body.fechaExpiracion).toBeDefined();

      sesionSlug = res.body.slug;
    });

    it('debe permitir consultar el estado del sorteo desde el slug sin autenticación (Acceso Público)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/sorteos/espectador/${sesionSlug}`)
        .expect(200);

      expect(res.body.slug).toBe(sesionSlug);
      expect(res.body.expirado).toBe(false);
      expect(res.body.estudiante).toBeDefined();
      expect(res.body.defensa.idDefensa).toBe(ganadoraDefensaId);
      expect(res.body.defensa.asignacion).toBeDefined();
      expect(res.body.defensa.asignacion.codigoActa).toBeDefined();
    });

    it('debe responder NotFound (404) para un slug inexistente', async () => {
      await request(app.getHttpServer())
        .get('/sorteos/espectador/slug-completamente-falso-999')
        .expect(404);
    });
  });
});
