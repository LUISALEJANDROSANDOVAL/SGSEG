/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';

describe('Módulo Estudiantes (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let idPlanEstudio: number | bigint;
  let estudianteId: string;
  const carnetPrueba = `E2E-EST-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    // Obtener token (COORDINACION)
    const resAuth = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'coord@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    adminToken = (resAuth.body as { accessToken: string }).accessToken;

    // Obtener un plan de estudio válido de la BD sembrada
    const plan = await prisma.planEstudio.findFirst();
    if (!plan) throw new Error('No hay planes de estudio en la base de datos para probar.');
    idPlanEstudio = plan.idPlanEstudio;
  });

  afterAll(async () => {
    // Limpieza
    await prisma.estudiante.deleteMany({
      where: { carnetEstudiantil: { contains: 'E2E-EST-' } }
    });
    await prisma.$disconnect();
    await app.close();
  });

  it('1. POST /estudiantes - Debe crear un estudiante correctamente', async () => {
    const res = await request(app.getHttpServer())
      .post('/estudiantes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        idPlanEstudio: Number(idPlanEstudio),
        carnetEstudiantil: carnetPrueba,
        carnetIdentidad: '1234567-LP',
        nombreCompleto: 'Estudiante E2E de Prueba',
        correo: 'estudiante.e2e@uni.edu.bo'
      })
      .expect(201);
    
    expect(res.body.estudiante.carnetEstudiantil).toEqual(carnetPrueba);
    estudianteId = String(res.body.estudiante.idEstudiante);
  });

  it('2. GET /estudiantes - Debe listar y filtrar estudiantes paginados', async () => {
    const res = await request(app.getHttpServer())
      .get(`/estudiantes?search=${carnetPrueba}&page=1&limit=10`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(res.body.items).toBeDefined();
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
  });

  it('3. PUT /estudiantes/:id - Debe actualizar los datos del estudiante', async () => {
    const res = await request(app.getHttpServer())
      .put(`/estudiantes/${estudianteId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        carnetIdentidad: '7654321-CBBA',
        nombreCompleto: 'Estudiante E2E Modificado'
      })
      .expect(200);
    
    expect(res.body.carnetIdentidad).toEqual('7654321-CBBA');
    expect(res.body.nombreCompleto).toEqual('Estudiante E2e Modificado');
  });

  it('4. DELETE /estudiantes/:id - Debe realizar borrado lógico (soft-delete)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/estudiantes/${estudianteId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(res.body.estudiante.estado).toEqual('ELIMINADO');
  });

  it('5. PATCH /estudiantes/:id/restore - Debe restaurar al estudiante', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/estudiantes/${estudianteId}/restore`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(res.body.estudiante.estado).toEqual('ACTIVO');
  });
});
