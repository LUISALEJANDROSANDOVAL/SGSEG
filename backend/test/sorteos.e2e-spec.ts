/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';
import { DefensasRepository } from '../src/defensas/repositories/defensas.repository';

describe('Módulo Sorteos (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let idEstudiante: number | bigint;
  let idAreaSorteada: number | bigint;
  let idCasoSorteado: number | bigint;
  let idDefensa: string;
  let createdAreaId: number | bigint;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    const resAuth = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'coord@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    adminToken = (resAuth.body as { accessToken: string }).accessToken;

    // Crear datos base para el sorteo
    const facultad = await prisma.facultad.findFirst() || await prisma.facultad.create({ data: { nombre: 'Fac Sorteo' } });
    const carrera = await prisma.carrera.findFirst() || await prisma.carrera.create({ data: { nombre: 'Carrera Sorteo', idFacultad: facultad.idFacultad } });
    const plan = await prisma.planEstudio.findFirst() || await prisma.planEstudio.create({ data: { nombre: 'Plan Sorteo', idCarrera: carrera.idCarrera } });
    
    await prisma.tipoDefensa.upsert({
      where: { nombre: 'INTERNA' },
      update: {},
      create: { nombre: 'INTERNA', descripcion: 'Defensa Interna' }
    });

    // Crear áreas y casos
    const area = await prisma.areaAcademica.create({ data: { nombre: `Area Sorteo ${Date.now()}`, idCarrera: carrera.idCarrera } });
    createdAreaId = area.idArea;
    await prisma.casoEstudio.create({ data: { titulo: `Caso Sorteo ${Date.now()}`, contenido: 'Contenido extenso de prueba', idArea: area.idArea } });
    
    const estudiante = await prisma.estudiante.create({
      data: {
        carnetEstudiantil: `E2E-SORT-${Date.now()}`,
        carnetIdentidad: '123123',
        nombreCompleto: 'Estudiante Sorteo',
        correoInstitucional: 'sorteo@uni.edu.bo',
        idPlanEstudio: plan.idPlanEstudio
      }
    });
    idEstudiante = estudiante.idEstudiante;
  });

  afterAll(async () => {
    try {
      if (idDefensa) {
        await prisma.sesionEspectadorSorteo.deleteMany({
          where: { idDefensa: Number(idDefensa) },
        });
        await prisma.asignacionCaso.deleteMany({
          where: { idDefensa: Number(idDefensa) },
        });
        await prisma.sorteoAreaPool.deleteMany({
          where: { sorteoArea: { sorteo: { idDefensa: Number(idDefensa) } } },
        });
        await prisma.sorteoArea.deleteMany({
          where: { sorteo: { idDefensa: Number(idDefensa) } },
        });
        await prisma.sorteoCaso.deleteMany({
          where: { sorteo: { idDefensa: Number(idDefensa) } },
        });
        await prisma.sorteo.deleteMany({
          where: { idDefensa: Number(idDefensa) },
        });
        await prisma.defensaExamenGrado.deleteMany({
          where: { idDefensa: Number(idDefensa) },
        });
      }
      if (idEstudiante) {
        await prisma.instanciaExamenGrado.deleteMany({
          where: { proceso: { idEstudiante: Number(idEstudiante) } },
        });
        await prisma.procesoExamenGrado.deleteMany({
          where: { idEstudiante: Number(idEstudiante) },
        });
        await prisma.estudiante.deleteMany({
          where: { idEstudiante: Number(idEstudiante) },
        });
      }
      if (createdAreaId) {
        await prisma.casoEstudio.deleteMany({ where: { idArea: Number(createdAreaId) } });
        await prisma.planArea.deleteMany({ where: { idArea: Number(createdAreaId) } });
        await prisma.areaAcademica.deleteMany({ where: { idArea: Number(createdAreaId) } });
      }
      // Revertir casos de vuelta a DISPONIBLE
      await prisma.casoEstudio.updateMany({
        where: { estado: 'AGOTADO' },
        data: { estado: 'DISPONIBLE' },
      });
    } finally {
      await prisma.$disconnect();
      await app.close();
    }
  });

  it('1. POST /sorteos/area - Debe sortear un área correctamente', async () => {
    // Primero programar una defensa para el sorteo
    const resDef = await request(app.getHttpServer())
      .post('/defensas/programar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        idEstudiante: Number(idEstudiante),
        tipoDefensa: 'INTERNA',
        fechaDefensa: new Date().toISOString().split('T')[0],
      })
      .expect(201);
    
    idDefensa = String(resDef.body.defensa.idDefensa);

    const res = await request(app.getHttpServer())
      .post('/sorteos/area')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        idDefensa: idDefensa
      })
      .expect(201);
    
    expect(res.body.areaGanadora.idArea).toBeDefined();
    idAreaSorteada = res.body.areaGanadora.idArea;
  });

  it('2. POST /sorteos/caso - Debe sortear un caso dentro del área asignada', async () => {
    const res = await request(app.getHttpServer())
      .post('/sorteos/caso')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        idDefensa: idDefensa
      })
      .expect(201);
    
    expect(res.body.casoGanador.idCasoEstudio).toBeDefined();
    idCasoSorteado = res.body.casoGanador.idCasoEstudio;
  });

  it('3. GET /sorteos - Debe obtener el historial de sorteos', async () => {
    const res = await request(app.getHttpServer())
      .get(`/sorteos?search=Estudiante Sorteo`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(res.body.items).toBeDefined();
    expect(res.body.items.length).toBeGreaterThanOrEqual(2); // Al menos el de área y el de caso
  });

  it('4. POST /sorteos/caso - Debe impedir que un caso con 2 usos (AGOTADO) sea sorteado', async () => {
    // 1. Simular que los casos de estudio del área alcanzaron su límite (AGOTADOS)
    await prisma.casoEstudio.updateMany({
      where: { idArea: Number(idAreaSorteada) },
      data: { estado: 'AGOTADO' },
    });

    // 2. Liberar la defensa actual para permitir un nuevo sorteo de caso
    await prisma.defensaExamenGrado.update({
      where: { idDefensa: Number(idDefensa) },
      data: { idCasoUtilizado: null }
    });

    // 3. Intentar sortear un caso nuevamente. Al ser el único caso en el área y estar agotado, debe fallar.
    const res = await request(app.getHttpServer())
      .post('/sorteos/caso')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ idDefensa: idDefensa })
      .expect(400);

    expect(res.body.message).toContain('Stock crítico agotado');
  });

  describe('Bloqueo de fechas (Ciencias Empresariales)', () => {
    it('debe rechazar sorteo anticipado para la Facultad de Ciencias Empresariales', async () => {
      let facultadEmp = await prisma.facultad.findFirst({ where: { nombre: 'Facultad E2E Empresariales' } });
      if (!facultadEmp) {
        facultadEmp = await prisma.facultad.create({ data: { nombre: 'Facultad E2E Empresariales' } });
      }

      let carreraEmp = await prisma.carrera.findFirst({ where: { nombre: 'Carrera E2E Adm' } });
      if (!carreraEmp) {
        carreraEmp = await prisma.carrera.create({ data: { nombre: 'Carrera E2E Adm', idFacultad: facultadEmp.idFacultad } });
      }

      let planEmp = await prisma.planEstudio.findFirst({ where: { nombre: 'Plan E2E Adm' } });
      if (!planEmp) {
        planEmp = await prisma.planEstudio.create({ data: { nombre: 'Plan E2E Adm', idCarrera: carreraEmp.idCarrera } });
      }
      
      const tipoDefensa = await prisma.tipoDefensa.findFirst({ where: { nombre: 'INTERNA' } });
      
      const estEmp = await prisma.estudiante.create({
        data: {
          carnetEstudiantil: `EMP-${Date.now()}`,
          carnetIdentidad: '999',
          nombreCompleto: 'Est Empresariales',
          correoInstitucional: `emp${Date.now()}@uni.edu.bo`,
          idPlanEstudio: planEmp.idPlanEstudio
        }
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10); // 10 days in the future

      const proceso = await prisma.procesoExamenGrado.create({
        data: { idEstudiante: estEmp.idEstudiante }
      });

      const instancia = await prisma.instanciaExamenGrado.create({
        data: { idProceso: proceso.idProceso, numeroInstancia: 1 }
      });

      const defensaEmp = await prisma.defensaExamenGrado.create({
        data: {
          idInstancia: instancia.idInstancia,
          idTipoDefensa: tipoDefensa!.idTipoDefensa,
          fechaDefensa: futureDate,
          estadoDefensa: 'PROGRAMADA',
          periodoAcademico: '2026-1'
        }
      });

      // Try to raffle Area (should fail with 400 Bad Request)
      await request(app.getHttpServer())
        .post('/sorteos/area')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          idDefensa: String(defensaEmp.idDefensa),
          estudiantePresente: true,
        })
        .expect(400);

      // Cleanup
      await prisma.defensaExamenGrado.delete({ where: { idDefensa: defensaEmp.idDefensa } });
      await prisma.instanciaExamenGrado.delete({ where: { idInstancia: instancia.idInstancia } });
      await prisma.procesoExamenGrado.delete({ where: { idProceso: proceso.idProceso } });
      await prisma.estudiante.delete({ where: { idEstudiante: estEmp.idEstudiante } });
    });
  });

  describe('Herencia de Sorteo (Psicología Externa)', () => {
    it('debe heredar el caso de la Interna y bloquear nuevo sorteo en la Externa de Psicología', async () => {
      let facultadPsi = await prisma.facultad.findFirst({ where: { nombre: 'Facultad Humanidades' } });
      if (!facultadPsi) facultadPsi = await prisma.facultad.create({ data: { nombre: 'Facultad Humanidades' } });

      let carreraPsi = await prisma.carrera.findFirst({ where: { nombre: 'Licenciatura en Psicología E2E' } });
      if (!carreraPsi) carreraPsi = await prisma.carrera.create({ data: { nombre: 'Licenciatura en Psicología E2E', idFacultad: facultadPsi.idFacultad } });

      let planPsi = await prisma.planEstudio.findFirst({ where: { nombre: 'Plan Psicología' } });
      if (!planPsi) planPsi = await prisma.planEstudio.create({ data: { nombre: 'Plan Psicología', idCarrera: carreraPsi.idCarrera } });
      
      const tipoInterna = await prisma.tipoDefensa.findFirst({ where: { nombre: 'INTERNA' } });
      const tipoExterna = await prisma.tipoDefensa.findFirst({ where: { nombre: 'EXTERNA' } });
      
      const estPsi = await prisma.estudiante.create({
        data: {
          carnetEstudiantil: `PSI-${Date.now()}`,
          carnetIdentidad: '777',
          nombreCompleto: 'Est Psicología',
          correoInstitucional: `psi${Date.now()}@uni.edu.bo`,
          idPlanEstudio: planPsi.idPlanEstudio
        }
      });

      const proceso = await prisma.procesoExamenGrado.create({
        data: { idEstudiante: estPsi.idEstudiante }
      });

      const instancia = await prisma.instanciaExamenGrado.create({
        data: { idProceso: proceso.idProceso, numeroInstancia: 1 }
      });

      const casoDb = await prisma.casoEstudio.findFirst();

      // Crear Defensa INTERNA con Caso Asignado
      const defensaInterna = await prisma.defensaExamenGrado.create({
        data: {
          idInstancia: instancia.idInstancia,
          idTipoDefensa: tipoInterna!.idTipoDefensa,
          fechaDefensa: new Date(),
          estadoDefensa: 'CALIFICADO',
          periodoAcademico: '2026-1',
          idCasoUtilizado: casoDb!.idCasoEstudio
        }
      });

      // Simular programación de Defensa EXTERNA a través del repositorio (para invocar la herencia)
      const defensasRepo = app.get(DefensasRepository);
      const defensaExterna = await defensasRepo.programarDefensa({
        idEstudiante: estPsi.idEstudiante,
        idTipoDefensa: tipoExterna!.idTipoDefensa,
        fechaDefensa: new Date(),
        periodoAcademico: '2026-1'
      });

      // Verificamos que se heredó
      const externaActualizada = await prisma.defensaExamenGrado.findUnique({ where: { idDefensa: defensaExterna.idDefensa } });
      expect(externaActualizada!.estadoDefensa).toBe('CASO_ASIGNADO');
      expect(externaActualizada!.idCasoUtilizado).toBe(casoDb!.idCasoEstudio);

      // Intentamos sortear área para la EXTERNA y debe fallar
      await request(app.getHttpServer())
        .post('/sorteos/area')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          idDefensa: String(defensaExterna.idDefensa),
          estudiantePresente: true,
        })
        .expect(400);

      // Cleanup
      await prisma.defensaExamenGrado.delete({ where: { idDefensa: externaActualizada!.idDefensa } });
      await prisma.defensaExamenGrado.delete({ where: { idDefensa: defensaInterna.idDefensa } });
      await prisma.instanciaExamenGrado.delete({ where: { idInstancia: instancia.idInstancia } });
      await prisma.procesoExamenGrado.delete({ where: { idProceso: proceso.idProceso } });
      await prisma.estudiante.delete({ where: { idEstudiante: estPsi.idEstudiante } });
    });
  });
});
