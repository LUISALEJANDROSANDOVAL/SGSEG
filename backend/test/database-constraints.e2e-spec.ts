import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Restricciones de Base de Datos y DDL (e2e)', () => {
  let prisma: PrismaClient;
  let pool: Pool;
  const PREFIX = `E2E_RESTRICT_${Date.now()}`;

  beforeAll(async () => {
    const connectionString =
      process.env.DATABASE_URL ??
      'postgresql://sgseg:sgseg@localhost:5437/sgseg?schema=public';
    pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();
  });

  afterAll(async () => {
    // Limpieza de datos creados en tests E2E
    try {
      await prisma.estudiante.deleteMany({
        where: { carnetEstudiantil: { startsWith: 'E2E_' } },
      });
      await prisma.planArea.deleteMany({
        where: { planEstudio: { nombre: { startsWith: 'E2E_' } } },
      });
      await prisma.areaAcademica.deleteMany({
        where: { nombre: { startsWith: 'E2E_' } },
      });
      await prisma.planEstudio.deleteMany({
        where: { nombre: { startsWith: 'E2E_' } },
      });
      await prisma.carrera.deleteMany({
        where: { nombre: { startsWith: 'E2E_' } },
      });
      await prisma.facultad.deleteMany({
        where: { nombre: { startsWith: 'E2E_' } },
      });
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }
  });

  describe('Restricciones de Unicidad (Unique Constraints)', () => {
    it('debe rechazar duplicados en (idFacultad, nombre) en la tabla carrera', async () => {
      const facultad1 = await prisma.facultad.create({
        data: { nombre: `${PREFIX}_FAC_1` },
      });
      const facultad2 = await prisma.facultad.create({
        data: { nombre: `${PREFIX}_FAC_2` },
      });

      const nombreCarrera = `${PREFIX}_ING_INFORMATICA`;

      // Primer inserción: debe ser exitosa
      const carrera1 = await prisma.carrera.create({
        data: {
          idFacultad: facultad1.idFacultad,
          nombre: nombreCarrera,
        },
      });
      expect(carrera1).toBeDefined();

      // Segunda inserción en la misma facultad: debe fallar con P2002
      await expect(
        prisma.carrera.create({
          data: {
            idFacultad: facultad1.idFacultad,
            nombre: nombreCarrera,
          },
        }),
      ).rejects.toMatchObject({
        code: 'P2002',
      });

      // Comprobación diferencial: permitir mismo nombre en facultad distinta
      const carreraEnOtraFacultad = await prisma.carrera.create({
        data: {
          idFacultad: facultad2.idFacultad,
          nombre: nombreCarrera,
        },
      });
      expect(carreraEnOtraFacultad.idCarrera).toBeDefined();
    });

    it('debe rechazar duplicados en (idCarrera, nombre) en la tabla plan_estudio', async () => {
      const facultad = await prisma.facultad.create({
        data: { nombre: `${PREFIX}_FAC_PLAN` },
      });
      const carrera = await prisma.carrera.create({
        data: {
          idFacultad: facultad.idFacultad,
          nombre: `${PREFIX}_CARRERA_P`,
        },
      });

      const nombrePlan = `${PREFIX}_PLAN_SISTEMAS_2026`;

      await prisma.planEstudio.create({
        data: {
          idCarrera: carrera.idCarrera,
          nombre: nombrePlan,
        },
      });

      // Intento duplicado bajo la misma carrera
      await expect(
        prisma.planEstudio.create({
          data: {
            idCarrera: carrera.idCarrera,
            nombre: nombrePlan,
          },
        }),
      ).rejects.toMatchObject({
        code: 'P2002',
      });
    });

    it('debe rechazar duplicados en (idCarrera, nombre) en la tabla area_academica', async () => {
      const facultad = await prisma.facultad.create({
        data: { nombre: `${PREFIX}_FAC_AREA` },
      });
      const carrera = await prisma.carrera.create({
        data: {
          idFacultad: facultad.idFacultad,
          nombre: `${PREFIX}_CARRERA_A`,
        },
      });

      const nombreArea = `${PREFIX}_AREA_DESARROLLO`;

      await prisma.areaAcademica.create({
        data: {
          idCarrera: carrera.idCarrera,
          nombre: nombreArea,
        },
      });

      // Intento duplicado bajo la misma carrera
      await expect(
        prisma.areaAcademica.create({
          data: {
            idCarrera: carrera.idCarrera,
            nombre: nombreArea,
          },
        }),
      ).rejects.toMatchObject({
        code: 'P2002',
      });
    });

    it('debe rechazar duplicados en carnet_estudiantil en la tabla estudiante', async () => {
      const facultad = await prisma.facultad.create({
        data: { nombre: `${PREFIX}_FAC_EST` },
      });
      const carrera = await prisma.carrera.create({
        data: {
          idFacultad: facultad.idFacultad,
          nombre: `${PREFIX}_CARRERA_EST`,
        },
      });
      const plan = await prisma.planEstudio.create({
        data: {
          idCarrera: carrera.idCarrera,
          nombre: `${PREFIX}_PLAN_EST`,
        },
      });

      const carnetUnico = `${PREFIX}_CARNET_999`;

      await prisma.estudiante.create({
        data: {
          idPlanEstudio: plan.idPlanEstudio,
          carnetEstudiantil: carnetUnico,
          carnetIdentidad: '98765432-LP',
          nombreCompleto: 'Estudiante Primero',
          correo: 'primero@test.com',
        },
      });

      // Segundo estudiante con el mismo carnet
      await expect(
        prisma.estudiante.create({
          data: {
            idPlanEstudio: plan.idPlanEstudio,
            carnetEstudiantil: carnetUnico,
            carnetIdentidad: '11223344-CBBA',
            nombreCompleto: 'Estudiante Segundo',
            correo: 'segundo@test.com',
          },
        }),
      ).rejects.toMatchObject({
        code: 'P2002',
      });
    });
  });

  describe('Restricciones de Claves Foráneas (onDelete: Restrict)', () => {
    it('debe bloquear la eliminación de una Facultad que tiene Carreras asociadas', async () => {
      const facultad = await prisma.facultad.create({
        data: { nombre: `${PREFIX}_FAC_RESTRICT` },
      });
      await prisma.carrera.create({
        data: {
          idFacultad: facultad.idFacultad,
          nombre: `${PREFIX}_CARRERA_HIJA_RESTRICT`,
        },
      });

      // Intentar eliminar la facultad debe fallar con P2003
      await expect(
        prisma.facultad.delete({
          where: { idFacultad: facultad.idFacultad },
        }),
      ).rejects.toMatchObject({
        code: 'P2003',
      });

      // Verificar integridad: el registro de la facultad no fue borrado
      const facultadPersistida = await prisma.facultad.findUnique({
        where: { idFacultad: facultad.idFacultad },
      });
      expect(facultadPersistida).not.toBeNull();
      expect(facultadPersistida?.idFacultad).toBe(facultad.idFacultad);
    });

    it('debe bloquear la eliminación de una Carrera que tiene Planes de Estudio asociados', async () => {
      const facultad = await prisma.facultad.create({
        data: { nombre: `${PREFIX}_FAC_CARRERA_RESTRICT` },
      });
      const carrera = await prisma.carrera.create({
        data: {
          idFacultad: facultad.idFacultad,
          nombre: `${PREFIX}_CARRERA_CON_PLAN_RESTRICT`,
        },
      });
      await prisma.planEstudio.create({
        data: {
          idCarrera: carrera.idCarrera,
          nombre: `${PREFIX}_PLAN_HIJO_RESTRICT`,
        },
      });

      // Intentar eliminar la carrera debe fallar con P2003
      await expect(
        prisma.carrera.delete({
          where: { idCarrera: carrera.idCarrera },
        }),
      ).rejects.toMatchObject({
        code: 'P2003',
      });

      // Verificar integridad: el registro de la carrera no fue borrado
      const carreraPersistida = await prisma.carrera.findUnique({
        where: { idCarrera: carrera.idCarrera },
      });
      expect(carreraPersistida).not.toBeNull();
      expect(carreraPersistida?.idCarrera).toBe(carrera.idCarrera);
    });
  });
});
