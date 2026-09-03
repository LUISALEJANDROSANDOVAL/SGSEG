import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App E2E (Login & Academia)', () => {
  let app: INestApplication<App>;
  let jefeToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST) - Exitoso', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'jefe.sistemas@sgseg.com', password: 'password123' })
      .expect(201);
    
    expect(res.body).toHaveProperty('access_token');
    jefeToken = res.body.access_token;
  });

  it('/auth/login (POST) - Fallido', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'jefe.sistemas@sgseg.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('/academia/carreras (GET) - Denegado sin token', () => {
    return request(app.getHttpServer())
      .get('/academia/carreras')
      .expect(401);
  });

  it('/academia/carreras (GET) - Exitoso con token', () => {
    return request(app.getHttpServer())
      .get('/academia/carreras')
      .set('Authorization', `Bearer ${jefeToken}`)
      .expect(200);
  });

  it('/academia/areas (POST) - Aislamiento (Prohibido a otra carrera)', () => {
    return request(app.getHttpServer())
      .post('/academia/areas')
      .set('Authorization', `Bearer ${jefeToken}`)
      .send({ nombre: 'Area Hacker', carreraId: 'fake-carrera-id' })
      .expect(403);
  });

  afterAll(async () => {
    await app.close();
  });
});
