/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';

describe('Módulo Sorteos (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let idEstudiante: number | bigint;
  let idAreaSorteada: number | bigint;
  let idCasoSorteado: number | bigint;
  let idDefensa: string;

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
    await prisma.casoEstudio.create({ data: { titulo: `Caso Sorteo ${Date.now()}`, contenido: 'Contenido extenso de prueba', idArea: area.idArea } });
    
    const estudiante = await prisma.estudiante.create({
      data: {
        carnetEstudiantil: `E2E-SORT-${Date.now()}`,
        carnetIdentidad: '123123',
        nombreCompleto: 'Estudiante Sorteo',
        correo: 'sorteo@uni.edu.bo',
        idPlanEstudio: plan.idPlanEstudio
      }
    });
    idEstudiante = estudiante.idEstudiante;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
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
    // 1. Simular que el caso de estudio alcanzó su límite de 2 usos (AGOTADO)
    await prisma.casoEstudio.update({
      where: { idCasoEstudio: Number(idCasoSorteado) },
      data: { estado: 'AGOTADO' }
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
});
