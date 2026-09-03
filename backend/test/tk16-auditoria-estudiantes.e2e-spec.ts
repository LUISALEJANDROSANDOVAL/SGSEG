/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';
import * as ExcelJS from 'exceljs';
import {
  RawEstudianteInputDto,
  BulkEstudiantesInputDto,
} from '../src/estudiantes/dto/estudiante.dto';

describe('Auditoría TK-16: Migración de Estudiantes desde Excel (E2E)', () => {
  let app: INestApplication<App>;
  let jefeToken: string;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    // Iniciar sesión para obtener token (COORDINACION o SECRETARIADO)
    // El usuario debe tener rol COORDINACION o SECRETARIADO
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'coord@uni.edu.bo', password: 'Admin123!' })
      .expect(200);

    jefeToken = res.body.accessToken;
  });

  afterAll(async () => {
    // Limpieza de los registros creados por la prueba (opcional según la estrategia de BD)
    await prisma.estudiante.deleteMany({
      where: { correo: { contains: 'tk16' } },
    });
    await prisma.$disconnect();
    await app.close();
  });

  // Helper para simular que el frontend genera el JSON desde el buffer del excel
  const frontendParserSimulation = (
    workbook: ExcelJS.Workbook,
  ): BulkEstudiantesInputDto => {
    const sheet = workbook.worksheets[0];
    const estudiantes: RawEstudianteInputDto[] = [];

    // Ignoramos la fila 1 (cabeceras)
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const values = row.values as string[];
      // Asumimos mapeo: 1: Carnet Estudiantil, 2: CI, 3: Nombre Completo, 4: Correo
      estudiantes.push({
        carnetEstudiantil: values[1] ? String(values[1]) : '',
        carnetIdentidad: values[2] ? String(values[2]) : '',
        nombreCompleto: values[3] ? String(values[3]) : '',
        correo: values[4] ? String(values[4]) : '',
      });
    });

    return {
      estudiantes,
      idCarreraPorDefecto: 1,
      crearPlanesFaltantes: false,
    };
  };

  it('1. Caso Borde: Archivo Vacío', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Estudiantes');
    sheet.addRow([
      'Carnet Estudiantil',
      'Carnet Identidad',
      'Nombre Completo',
      'Correo',
    ]);
    // Sin datos adicionales

    const dto = frontendParserSimulation(workbook);
    expect(dto.estudiantes.length).toBe(0);

    const res = await request(app.getHttpServer())
      .post('/estudiantes/bulk-upsert')
      .set('Authorization', `Bearer ${jefeToken}`)
      .send(dto)
      .expect(200);

    expect(res.body.creados).toBe(0);
    expect(res.body.total).toBe(0);
  });

  it('2. Caso de Éxito y Validación en BD: Archivo con datos válidos', async () => {
    const initialCount = await prisma.estudiante.count();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Estudiantes');
    sheet.addRow([
      'Carnet Estudiantil',
      'Carnet Identidad',
      'Nombre Completo',
      'Correo',
    ]);
    sheet.addRow(['TK16-001', 'CI-TK16-1', 'Test User 1', 'tk16-1@sgseg.com']);
    sheet.addRow(['TK16-002', 'CI-TK16-2', 'Test User 2', 'tk16-2@sgseg.com']);

    const dto = frontendParserSimulation(workbook);

    const res = await request(app.getHttpServer())
      .post('/estudiantes/bulk-upsert')
      .set('Authorization', `Bearer ${jefeToken}`)
      .send(dto)
      .expect(200);

    expect(res.body.creados).toBe(2);
    expect(res.body.errores).toHaveLength(0);

    // Validar integridad BD
    const finalCount = await prisma.estudiante.count();
    expect(finalCount).toBe(initialCount + 2);
  });

  it('3. Caso Borde: Carnets duplicados en el mismo archivo', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Estudiantes');
    sheet.addRow([
      'Carnet Estudiantil',
      'Carnet Identidad',
      'Nombre Completo',
      'Correo',
    ]);
    sheet.addRow([
      'TK16-DUP',
      'CI-TK16-DUP1',
      'Duplicate 1',
      'tk16-dup1@sgseg.com',
    ]);
    sheet.addRow([
      'TK16-DUP',
      'CI-TK16-DUP2',
      'Duplicate 2',
      'tk16-dup2@sgseg.com',
    ]);

    const dto = frontendParserSimulation(workbook);

    const res = await request(app.getHttpServer())
      .post('/estudiantes/bulk-upsert')
      .set('Authorization', `Bearer ${jefeToken}`)
      .send(dto)
      .expect(200);

    // Como son duplicados con mismo carnet, el comportamiento esperado de upsert
    // es que o bien actualiza (1 creado, 1 actualizado) o lanza un error de validación en la lista.
    // Esto asegura que probamos qué sucede exactamente con la API.
    expect(res.body.total).toBe(2);
    expect(res.body.creados + res.body.actualizados).toBeGreaterThanOrEqual(1);
  });

  it('4. Caso Borde: Formatos incorrectos (Correo inválido, falta nombre)', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Estudiantes');
    sheet.addRow([
      'Carnet Estudiantil',
      'Carnet Identidad',
      'Nombre Completo',
      'Correo',
    ]);
    sheet.addRow(['TK16-ERR1', 'CI-ERR', '', 'bad-email']); // Falta nombre, correo mal

    const dto = frontendParserSimulation(workbook);

    const res = await request(app.getHttpServer())
      .post('/estudiantes/bulk-upsert')
      .set('Authorization', `Bearer ${jefeToken}`)
      .send(dto)
      .expect(400); // Dependiendo si falla toda la batch o solo el registro.

    // Al fallar toda la request por class-validator, el error viene directo.
    expect(res.body.message).toBeDefined();
  });
});
