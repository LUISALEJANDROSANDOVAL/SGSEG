/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';

describe('Módulo Casos (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let idCarrera: number | bigint;
  let idArea: string;
  let idCaso: string;
  const areaPrueba = `E2E-AREA-${Date.now()}`;
  const casoPrueba = `E2E-CASO-${Date.now()}`;

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

    const carrera = await prisma.carrera.findFirst();
    if (!carrera) throw new Error('No hay carreras en BD para probar');
    idCarrera = carrera.idCarrera;
  });

  afterAll(async () => {
    // Limpieza
    await prisma.casoEstudio.deleteMany({
      where: { titulo: { contains: 'E2E-CASO-' } }
    });
    await prisma.areaAcademica.deleteMany({
      where: { nombre: { contains: 'E2E-AREA-' } }
    });
    await prisma.$disconnect();
    await app.close();
  });

  it('1. POST /casos/areas - Debe crear un área académica', async () => {
    const res = await request(app.getHttpServer())
      .post('/casos/areas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        idCarrera: Number(idCarrera),
        nombre: areaPrueba
      })
      .expect(201);
    
    expect(res.body.idArea).toBeDefined();
    idArea = String(res.body.idArea);
  });

  it('2. POST /casos - Debe registrar un nuevo caso de estudio', async () => {
    const res = await request(app.getHttpServer())
      .post('/casos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        idArea: Number(idArea),
        titulo: casoPrueba,
        contenido: 'Contenido extenso de prueba'
      });
      if (res.status !== 201) console.error('POST /casos ERROR:', res.body);
      expect(res.status).toBe(201);
    
    expect(res.body.caso.titulo).toEqual(casoPrueba);
    idCaso = String(res.body.caso.idCasoEstudio);
  });

  it('3. GET /casos/metricas - Debe obtener alertas de inventario', async () => {
    const res = await request(app.getHttpServer())
      .get('/casos/metricas')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(res.body.totalCasos).toBeDefined();
    expect(res.body.agotados).toBeDefined();
    expect(res.body.stockCritico).toBeDefined();
  });

  it('4. PATCH /casos/:id/estado - Debe inactivar el caso', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/casos/${idCaso}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(res.body.caso.estado).toEqual('INACTIVO');
  });

  it('5. PATCH /casos/:id/reactivar-especial - Debe reactivar el caso por resolución', async () => {
    // Como el endpoint pide JEFE_CARRERA, creamos un token de jefe carrera
    const resAuthJefe = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'jefe.fct@uni.edu.bo', password: 'Admin123!' })
      .expect(200);
    const jefeToken = (resAuthJefe.body as { accessToken: string }).accessToken;

    const res = await request(app.getHttpServer())
      .patch(`/casos/${idCaso}/reactivar-especial`)
      .set('Authorization', `Bearer ${jefeToken}`)
      .send({
        motivo: 'Resolución decanal de prueba'
      })
      .expect(200);
    
    expect(res.body.caso.estadoEfectivo).toEqual('REACTIVADO_ESPECIAL');
    expect(res.body.caso.historialReactivaciones).toBeUndefined(); // Assuming it's audited elsewhere now
  });
});
