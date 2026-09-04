/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';

describe('Módulo Defensas (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let idEstudiante: number | bigint;
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

    const plan = await prisma.planEstudio.findFirst();
    if (!plan) throw new Error('Se requiere un plan');

    await prisma.tipoDefensa.upsert({
      where: { nombre: 'INTERNA' },
      update: {},
      create: { nombre: 'INTERNA', descripcion: 'Defensa Interna' }
    });
    
    const estudiante = await prisma.estudiante.create({
      data: {
        carnetEstudiantil: `E2E-DEF-${Date.now()}`,
        carnetIdentidad: '1234567-LP',
        nombreCompleto: 'Estudiante Defensa',
        correo: 'defensa@uni.edu.bo',
        idPlanEstudio: plan.idPlanEstudio
      }
    });
    idEstudiante = estudiante.idEstudiante;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('1. POST /defensas/programar - Debe programar una defensa', async () => {
    const res = await request(app.getHttpServer())
      .post('/defensas/programar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        idEstudiante: Number(idEstudiante),
        tipoDefensa: 'INTERNA',
        fechaDefensa: new Date().toISOString().split('T')[0],
        periodoAcademico: '2/2026'
      })
      .expect(201);
    
    expect(res.body.defensa.estadoDefensa).toEqual('PROGRAMADA');
    idDefensa = String(res.body.defensa.idDefensa);
  });

  it('2. GET /defensas/embudo - Debe obtener el embudo de estados', async () => {
    const res = await request(app.getHttpServer())
      .get('/defensas/embudo')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(res.body.total).toBeDefined();
    expect(res.body.programados).toBeDefined();
  });

  it('3. GET /defensas/alertas - Debe listar estudiantes próximos a defender', async () => {
    const res = await request(app.getHttpServer())
      .get('/defensas/alertas?dias=30')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(res.body.length).toBeGreaterThanOrEqual(0);
  });

  it('4. PUT /defensas/:id/calificar - Debe registrar la calificación de la defensa', async () => {
    const res = await request(app.getHttpServer())
      .put(`/defensas/${idDefensa}/calificar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nota: 85,
        resultado: 'APROBADO',
        observaciones: 'Buena defensa E2E'
      })
      .expect(200);
    
    expect(Number(res.body.defensa.nota)).toEqual(85);
    expect(res.body.defensa.resultado).toEqual('APROBADO'); // 85 es >= 51
  });
});
