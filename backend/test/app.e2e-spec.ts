import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('TK-20: Integración Sprint 1 - Autenticación y Login (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Autenticación POST /auth/login', () => {
    it('1. Debe rechazar credenciales incorrectas (Contraseña Inválida)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ correoInstitucional: 'coord@uni.edu.bo', password: 'WrongPassword123!' })
        .expect(401);
      
      expect(res.body.message).toEqual('Credenciales inválidas');
    });

    it('2. Debe rechazar un formato de correo inválido (Fallo DTO Validator)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ correoInstitucional: 'esto-no-es-un-correo', password: 'Admin123!' })
        .expect(400); // 400 Bad Request lanzado por class-validator
      
      expect(res.body.message).toBeDefined();
    });

    it('3. Debe iniciar sesión exitosamente y retornar el Token JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ correoInstitucional: 'coord@uni.edu.bo', password: 'Admin123!' })
        .expect(200);
      
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.correoInstitucional).toEqual('coord@uni.edu.bo');
      expect(res.body.user.rol).toEqual('COORDINACION');
    });
  });

  // NOTA: Los tests E2E para el CRUD de Academia (Facultades, Carreras, Áreas, Planes)
  // serán integrados aquí una vez que la rama feature/modulo-academia se fusione con la base principal.
});
