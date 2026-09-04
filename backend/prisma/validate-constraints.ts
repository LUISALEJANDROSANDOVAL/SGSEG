import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://sgseg:sgseg@localhost:5437/sgseg?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface TestResult {
  num: number;
  nombre: string;
  tipo: 'UNICIDAD' | 'FOREIGN_KEY';
  resultado: 'PASÓ' | 'FALLÓ';
  codigoError?: string;
  detalle: string;
}

const PREFIX = `TEST_VAL_${Date.now()}`;

async function cleanUpTestData() {
  try {
    // Limpieza en orden inverso a dependencias de claves foráneas
    await prisma.estudiante.deleteMany({
      where: { carnetEstudiantil: { startsWith: 'TEST_' } },
    });

    await prisma.planArea.deleteMany({
      where: {
        planEstudio: { nombre: { startsWith: 'TEST_' } },
      },
    });

    await prisma.areaAcademica.deleteMany({
      where: { nombre: { startsWith: 'TEST_' } },
    });

    await prisma.planEstudio.deleteMany({
      where: { nombre: { startsWith: 'TEST_' } },
    });

    await prisma.carrera.deleteMany({
      where: { nombre: { startsWith: 'TEST_' } },
    });

    await prisma.facultad.deleteMany({
      where: { nombre: { startsWith: 'TEST_' } },
    });
  } catch (error) {
    console.warn('Advertencia durante la limpieza inicial/final:', error);
  }
}

async function runValidations(): Promise<boolean> {
  const results: TestResult[] = [];
  console.log('='.repeat(80));
  console.log('SGSEG - VERIFICACIÓN AUTOMATIZADA DE RESTRICCIONES DDL (SQL / PRISMA)');
  console.log('Responsables: Jose Carlos Rojas / Jorge Ayala');
  console.log(`Base de datos: ${connectionString.replace(/:[^:@]+@/, ':***@')}`);
  console.log('='.repeat(80));

  await cleanUpTestData();

  try {
    // ------------------------------------------------------------------------
    // PRUEBA 1: Unicidad compuesta en Carrera (idFacultad, nombre)
    // ------------------------------------------------------------------------
    console.log('\n[1/6] Probando unicidad compuesta (idFacultad, nombre) en Carrera...');
    const facA = await prisma.facultad.create({
      data: { nombre: `${PREFIX}_FACULTAD_A` },
    });
    const facB = await prisma.facultad.create({
      data: { nombre: `${PREFIX}_FACULTAD_B` },
    });

    const carName = `${PREFIX}_INGENIERIA`;
    await prisma.carrera.create({
      data: { idFacultad: facA.idFacultad, nombre: carName },
    });

    let p1Passed = false;
    let p1Code = '';
    let p1Detail = '';
    try {
      await prisma.carrera.create({
        data: { idFacultad: facA.idFacultad, nombre: carName },
      });
      p1Detail = 'ERROR: La base de datos permitió duplicar (idFacultad, nombre) en Carrera.';
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        p1Code = err.code;
        // Permitir el mismo nombre en facB (comprobación diferencial)
        await prisma.carrera.create({
          data: { idFacultad: facB.idFacultad, nombre: carName },
        });
        p1Passed = true;
        p1Detail = `Rechazó duplicado con código ${err.code} (${err.meta?.target || 'id_facultad, nombre'}). Permitió mismo nombre en otra facultad.`;
      } else {
        p1Detail = `Excepción inesperada: ${err.message}`;
      }
    }
    results.push({
      num: 1,
      nombre: 'Unicidad (idFacultad, nombre) en Carrera',
      tipo: 'UNICIDAD',
      resultado: p1Passed ? 'PASÓ' : 'FALLÓ',
      codigoError: p1Code,
      detalle: p1Detail,
    });

    // ------------------------------------------------------------------------
    // PRUEBA 2: Unicidad compuesta en PlanEstudio (idCarrera, nombre)
    // ------------------------------------------------------------------------
    console.log('[2/6] Probando unicidad compuesta (idCarrera, nombre) en PlanEstudio...');
    const carreraTest = await prisma.carrera.create({
      data: { idFacultad: facA.idFacultad, nombre: `${PREFIX}_CARRERA_PLAN` },
    });
    const planName = `${PREFIX}_PLAN_2026`;

    await prisma.planEstudio.create({
      data: { idCarrera: carreraTest.idCarrera, nombre: planName },
    });

    let p2Passed = false;
    let p2Code = '';
    let p2Detail = '';
    try {
      await prisma.planEstudio.create({
        data: { idCarrera: carreraTest.idCarrera, nombre: planName },
      });
      p2Detail = 'ERROR: La base de datos permitió duplicar (idCarrera, nombre) en PlanEstudio.';
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        p2Code = err.code;
        p2Passed = true;
        p2Detail = `Rechazó duplicado con código ${err.code} (${err.meta?.target || 'id_carrera, nombre'}).`;
      } else {
        p2Detail = `Excepción inesperada: ${err.message}`;
      }
    }
    results.push({
      num: 2,
      nombre: 'Unicidad (idCarrera, nombre) en PlanEstudio',
      tipo: 'UNICIDAD',
      resultado: p2Passed ? 'PASÓ' : 'FALLÓ',
      codigoError: p2Code,
      detalle: p2Detail,
    });

    // ------------------------------------------------------------------------
    // PRUEBA 3: Unicidad compuesta en AreaAcademica (idCarrera, nombre)
    // ------------------------------------------------------------------------
    console.log('[3/6] Probando unicidad compuesta (idCarrera, nombre) en AreaAcademica...');
    const areaName = `${PREFIX}_REDES_TELECOM`;
    await prisma.areaAcademica.create({
      data: { idCarrera: carreraTest.idCarrera, nombre: areaName },
    });

    let p3Passed = false;
    let p3Code = '';
    let p3Detail = '';
    try {
      await prisma.areaAcademica.create({
        data: { idCarrera: carreraTest.idCarrera, nombre: areaName },
      });
      p3Detail = 'ERROR: La base de datos permitió duplicar (idCarrera, nombre) en AreaAcademica.';
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        p3Code = err.code;
        p3Passed = true;
        p3Detail = `Rechazó duplicado con código ${err.code} (${err.meta?.target || 'id_carrera, nombre'}).`;
      } else {
        p3Detail = `Excepción inesperada: ${err.message}`;
      }
    }
    results.push({
      num: 3,
      nombre: 'Unicidad (idCarrera, nombre) en AreaAcademica',
      tipo: 'UNICIDAD',
      resultado: p3Passed ? 'PASÓ' : 'FALLÓ',
      codigoError: p3Code,
      detalle: p3Detail,
    });

    // ------------------------------------------------------------------------
    // PRUEBA 4: Unicidad simple en carnet_estudiantil en Estudiante
    // ------------------------------------------------------------------------
    console.log('[4/6] Probando unicidad simple en carnet_estudiantil en Estudiante...');
    const planEstudioRef = await prisma.planEstudio.findFirst({
      where: { idCarrera: carreraTest.idCarrera },
    });

    const carnetDuplicado = `${PREFIX}_CARNET_001`;
    await prisma.estudiante.create({
      data: {
        idPlanEstudio: planEstudioRef!.idPlanEstudio,
        carnetEstudiantil: carnetDuplicado,
        carnetIdentidad: '1234567-LP',
        nombreCompleto: 'Juan Pérez Test',
        correo: 'juan.test@correo.com',
      },
    });

    let p4Passed = false;
    let p4Code = '';
    let p4Detail = '';
    try {
      await prisma.estudiante.create({
        data: {
          idPlanEstudio: planEstudioRef!.idPlanEstudio,
          carnetEstudiantil: carnetDuplicado,
          carnetIdentidad: '7654321-CBBA',
          nombreCompleto: 'Pedro Morales Test',
          correo: 'pedro.test@correo.com',
        },
      });
      p4Detail = 'ERROR: La base de datos permitió duplicar carnet_estudiantil en Estudiante.';
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        p4Code = err.code;
        p4Passed = true;
        p4Detail = `Rechazó duplicado con código ${err.code} (${err.meta?.target || 'carnet_estudiantil'}).`;
      } else {
        p4Detail = `Excepción inesperada: ${err.message}`;
      }
    }
    results.push({
      num: 4,
      nombre: 'Unicidad carnet_estudiantil en Estudiante',
      tipo: 'UNICIDAD',
      resultado: p4Passed ? 'PASÓ' : 'FALLÓ',
      codigoError: p4Code,
      detalle: p4Detail,
    });

    // ------------------------------------------------------------------------
    // PRUEBA 5: Restricción FK onDelete: Restrict en eliminación de Facultad
    // ------------------------------------------------------------------------
    console.log('[5/6] Probando restricción onDelete: Restrict en Facultad con Carreras...');
    const facRestrict = await prisma.facultad.create({
      data: { nombre: `${PREFIX}_FAC_CON_CARRERA` },
    });
    await prisma.carrera.create({
      data: {
        idFacultad: facRestrict.idFacultad,
        nombre: `${PREFIX}_CARRERA_HIJA`,
      },
    });

    let p5Passed = false;
    let p5Code = '';
    let p5Detail = '';
    try {
      await prisma.facultad.delete({
        where: { idFacultad: facRestrict.idFacultad },
      });
      p5Detail = 'ERROR: La base de datos permitió eliminar una Facultad que tiene Carreras asociadas.';
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        p5Code = err.code;
        // Verificar que la facultad no fue eliminada
        const sigueExistiendo = await prisma.facultad.findUnique({
          where: { idFacultad: facRestrict.idFacultad },
        });
        if (sigueExistiendo) {
          p5Passed = true;
          p5Detail = `Bloqueó eliminación con código ${err.code} (Foreign key constraint onDelete: Restrict). Registro preservado.`;
        } else {
          p5Detail = 'Se lanzó P2003 pero la facultad fue borrada inconsistente.';
        }
      } else {
        p5Detail = `Excepción inesperada: ${err.message}`;
      }
    }
    results.push({
      num: 5,
      nombre: 'onDelete: Restrict en eliminación de Facultad con Carreras',
      tipo: 'FOREIGN_KEY',
      resultado: p5Passed ? 'PASÓ' : 'FALLÓ',
      codigoError: p5Code,
      detalle: p5Detail,
    });

    // ------------------------------------------------------------------------
    // PRUEBA 6: Restricción FK onDelete: Restrict en eliminación de Carrera
    // ------------------------------------------------------------------------
    console.log('[6/6] Probando restricción onDelete: Restrict en Carrera con PlanEstudio...');
    const carRestrict = await prisma.carrera.create({
      data: {
        idFacultad: facRestrict.idFacultad,
        nombre: `${PREFIX}_CARRERA_CON_PLAN`,
      },
    });
    await prisma.planEstudio.create({
      data: {
        idCarrera: carRestrict.idCarrera,
        nombre: `${PREFIX}_PLAN_HIJO`,
      },
    });

    let p6Passed = false;
    let p6Code = '';
    let p6Detail = '';
    try {
      await prisma.carrera.delete({
        where: { idCarrera: carRestrict.idCarrera },
      });
      p6Detail = 'ERROR: La base de datos permitió eliminar una Carrera que tiene Planes de Estudio asociados.';
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        p6Code = err.code;
        // Verificar que la carrera no fue eliminada
        const sigueExistiendo = await prisma.carrera.findUnique({
          where: { idCarrera: carRestrict.idCarrera },
        });
        if (sigueExistiendo) {
          p6Passed = true;
          p6Detail = `Bloqueó eliminación con código ${err.code} (Foreign key constraint onDelete: Restrict). Registro preservado.`;
        } else {
          p6Detail = 'Se lanzó P2003 pero la carrera fue borrada inconsistente.';
        }
      } else {
        p6Detail = `Excepción inesperada: ${err.message}`;
      }
    }
    results.push({
      num: 6,
      nombre: 'onDelete: Restrict en eliminación de Carrera con PlanEstudio',
      tipo: 'FOREIGN_KEY',
      resultado: p6Passed ? 'PASÓ' : 'FALLÓ',
      codigoError: p6Code,
      detalle: p6Detail,
    });

  } finally {
    console.log('\nLimpiando registros temporales de prueba...');
    await cleanUpTestData();
  }

  // --------------------------------------------------------------------------
  // RESUMEN Y REPORTE
  // --------------------------------------------------------------------------
  console.log('\n' + '='.repeat(80));
  console.log('TABLA DE RESULTADOS DE VERIFICACIÓN');
  console.log('='.repeat(80));
  console.table(
    results.map((r) => ({
      '#': r.num,
      Prueba: r.nombre,
      Tipo: r.tipo,
      Resultado: r.resultado,
      'Código Prisma': r.codigoError || 'N/A',
      Detalle: r.detalle,
    })),
  );

  const allPassed = results.every((r) => r.resultado === 'PASÓ');
  if (allPassed) {
    console.log('✓ TODAS LAS PRUEBAS DE RESTRICCIONES PASARON EXITOSAMENTE (6/6).');
  } else {
    console.error('✗ ALGUNAS PRUEBAS FALLARON.');
  }

  return allPassed;
}

runValidations()
  .then((success) => {
    pool.end();
    prisma.$disconnect();
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('Fallo no controlado en la ejecución del script:', err);
    pool.end();
    prisma.$disconnect();
    process.exit(1);
  });
