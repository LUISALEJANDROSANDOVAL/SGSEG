import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CATALOGO_OFICIAL_UTEPSA } from './data-oficial-utepsa';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ??
        'postgresql://sgseg:sgseg@localhost:5437/sgseg?schema=public',
    },
  },
});

/**
 * Principio de Responsabilidad Única (SRP):
 * Cada función encapsula una fase delimitada del proceso de sembrado.
 */

// ============================================================================
// 1. Limpieza Segura de Datos Previos
// ============================================================================
async function cleanDatabase(): Promise<void> {
  console.log('🧹 Limpiando registros previos para garantizar consistencia...');
  await prisma.registroAuditoria.deleteMany({});
  await prisma.envioCasoEstudio.deleteMany({});
  await prisma.sorteoAreaPool.deleteMany({});
  await prisma.sorteoArea.deleteMany({});
  await prisma.sorteoCaso.deleteMany({});
  await prisma.sorteo.deleteMany({});
  await prisma.defensaExamenGrado.deleteMany({});
  await prisma.instanciaExamenGrado.deleteMany({});
  await prisma.procesoExamenGrado.deleteMany({});
  await prisma.estudiante.deleteMany({});
  await prisma.casoEstudio.deleteMany({});
  await prisma.planArea.deleteMany({});
  await prisma.areaAcademica.deleteMany({});
  await prisma.configuracionSorteoCaso.deleteMany({});
  await prisma.configuracionSorteoArea.deleteMany({});
  await prisma.planEstudio.deleteMany({});
  await prisma.usuarioCarrera.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.carrera.deleteMany({});
  await prisma.facultad.deleteMany({});
  console.log('✅ Base de datos saneada exitosamente.');
}

// ============================================================================
// 2. Roles y Tipos de Defensa
// ============================================================================
async function seedRolesYTiposDefensa() {
  console.log('👥 Sembrando roles institucionales y tipos de defensa...');
  const roles = [
    { nombre: 'COORDINACION', descripcion: 'Coordinación académica institucional' },
    { nombre: 'SECRETARIADO', descripcion: 'Secretariado académico (operación de sorteos)' },
    { nombre: 'JEFE_CARRERA', descripcion: 'Jefe de carrera (gestión exclusiva de su área)' },
    { nombre: 'VICERRECTORADO', descripcion: 'Vicerrectorado (supervisión y auditoría)' },
    { nombre: 'REGISTRO', descripcion: 'Registro académico' },
    { nombre: 'DEFENSA', descripcion: 'Defensa de grado' },
    { nombre: 'SUPER_ADMIN', descripcion: 'Administrador general del sistema' },
  ];

  for (const r of roles) {
    await prisma.rol.upsert({
      where: { nombre: r.nombre },
      update: { descripcion: r.descripcion },
      create: r,
    });
  }

  const tiposDefensa = [
    { nombre: 'INTERNA', descripcion: 'Defensa de grado interna' },
    { nombre: 'EXTERNA', descripcion: 'Defensa de grado externa' },
  ];

  for (const t of tiposDefensa) {
    await prisma.tipoDefensa.upsert({
      where: { nombre: t.nombre },
      update: { descripcion: t.descripcion },
      create: t,
    });
  }
}

// ============================================================================
// 3. Catálogo Oficial UTEPSA (Facultades, Carreras, Planes, Áreas, Casos y Configs)
// ============================================================================
async function seedCatalogoOficial(): Promise<{
  carreraSistemasId: bigint;
  carreraDerechoId: bigint;
  planSistemasId: bigint;
  planDerechoId: bigint;
}> {
  console.log('🏛️  Sembrando Catálogo Oficial UTEPSA (3 Facultades, 17 Carreras)...');

  const tipoInterna = await prisma.tipoDefensa.findUniqueOrThrow({ where: { nombre: 'INTERNA' } });
  const tipoExterna = await prisma.tipoDefensa.findUniqueOrThrow({ where: { nombre: 'EXTERNA' } });

  let carreraSistemasId: bigint | null = null;
  let carreraDerechoId: bigint | null = null;
  let planSistemasId: bigint | null = null;
  let planDerechoId: bigint | null = null;

  for (const facDef of CATALOGO_OFICIAL_UTEPSA) {
    const facultad = await prisma.facultad.upsert({
      where: { nombre: facDef.nombre },
      update: {},
      create: { nombre: facDef.nombre },
    });

    for (const carDef of facDef.carreras) {
      const carrera = await prisma.carrera.create({
        data: {
          idFacultad: facultad.idFacultad,
          nombre: carDef.nombre,
        },
      });

      if (carDef.nombre === 'Sistemas') {
        carreraSistemasId = carrera.idCarrera;
      }
      if (carDef.nombre === 'Derecho') {
        carreraDerechoId = carrera.idCarrera;
      }

      // Crear Plan de Estudios vigente para la carrera
      const plan = await prisma.planEstudio.create({
        data: {
          idCarrera: carrera.idCarrera,
          nombre: 'Plan 2026',
          estadoVigencia: 'VIGENTE',
        },
      });

      if (carDef.nombre === 'Sistemas') {
        planSistemasId = plan.idPlanEstudio;
      }
      if (carDef.nombre === 'Derecho') {
        planDerechoId = plan.idPlanEstudio;
      }

      // Crear Configuraciones Reglamentarias de Sorteo de Área y Caso
      const reg = carDef.plazoReglamentario;
      const tipos = [tipoInterna, tipoExterna];

      for (const t of tipos) {
        await prisma.configuracionSorteoArea.create({
          data: {
            idCarrera: carrera.idCarrera,
            idTipoDefensa: t.idTipoDefensa,
            orden: 1,
            anticipacion: reg.anticipacionSorteoAreaDias,
            unidadAnticipacion: 'DIAS',
            estadoVigencia: 'VIGENTE',
          },
        });

        await prisma.configuracionSorteoCaso.create({
          data: {
            idCarrera: carrera.idCarrera,
            idTipoDefensa: t.idTipoDefensa,
            modoObtencionCaso: 'NUEVO_SORTEO',
            orden: 2,
            anticipacion: reg.modalidad === 'ANTICIPADO_CONJUNTO' ? reg.anticipacionSorteoAreaDias : 0,
            unidadAnticipacion: 'DIAS',
            plazoResolucion: reg.plazoResolucionValor,
            unidadPlazo: reg.plazoResolucionUnidad,
            estadoVigencia: 'VIGENTE',
          },
        });
      }

      // Crear Áreas Académicas Oficiales y Casos de Estudio
      for (const areaDef of carDef.areas) {
        const area = await prisma.areaAcademica.create({
          data: {
            idCarrera: carrera.idCarrera,
            nombre: areaDef.nombre,
            umbralDisponibilidad: areaDef.umbralDisponibilidad ?? 2,
            estado: 'ACTIVO',
          },
        });

        // Vincular con PlanArea
        await prisma.planArea.create({
          data: {
            idPlanEstudio: plan.idPlanEstudio,
            idArea: area.idArea,
          },
        });

        // Casos de estudio para el área
        for (const casoDef of areaDef.casosEjemplo) {
          await prisma.casoEstudio.create({
            data: {
              idArea: area.idArea,
              titulo: casoDef.titulo,
              contenido: casoDef.contenido,
              estado: 'DISPONIBLE',
            },
          });
        }
      }
    }
  }

  console.log('✅ Catálogo oficial UTEPSA, áreas y configuraciones sembradas exitosamente.');

  return {
    carreraSistemasId: carreraSistemasId!,
    carreraDerechoId: carreraDerechoId!,
    planSistemasId: planSistemasId!,
    planDerechoId: planDerechoId!,
  };
}

// ============================================================================
// 4. Usuarios Institucionales y Jefes de Carrera
// ============================================================================
async function seedUsuarios(
  carreraSistemasId: bigint,
  carreraDerechoId: bigint,
  passwordHash: string,
) {
  console.log('🔐 Creando usuarios institucionales y asignando carreras...');

  const coordRole = await prisma.rol.findUniqueOrThrow({ where: { nombre: 'COORDINACION' } });
  const secRole = await prisma.rol.findUniqueOrThrow({ where: { nombre: 'SECRETARIADO' } });
  const viceRole = await prisma.rol.findUniqueOrThrow({ where: { nombre: 'VICERRECTORADO' } });
  const jefeRole = await prisma.rol.findUniqueOrThrow({ where: { nombre: 'JEFE_CARRERA' } });

  // 1. Coordinación
  await prisma.usuario.create({
    data: {
      primerNombre: 'Coordinación',
      primerApellido: 'Académica',
      correoInstitucional: 'coord@uni.edu.bo',
      passwordHash,
      idRol: coordRole.idRol,
      estado: 'ACTIVO',
    },
  });

  // 2. Secretariado
  await prisma.usuario.create({
    data: {
      primerNombre: 'Ana',
      primerApellido: 'Flores',
      segundoApellido: 'Pérez',
      correoInstitucional: 'secretaria@uni.edu.bo',
      passwordHash,
      idRol: secRole.idRol,
      estado: 'ACTIVO',
    },
  });

  // 3. Vicerrectorado
  await prisma.usuario.create({
    data: {
      primerNombre: 'Beatriz',
      primerApellido: 'Gutiérrez',
      segundoApellido: 'Salinas',
      correoInstitucional: 'vicerrector@uni.edu.bo',
      passwordHash,
      idRol: viceRole.idRol,
      estado: 'ACTIVO',
    },
  });

  // 4. Jefe de Carrera - Sistemas
  const jefeSistemas = await prisma.usuario.create({
    data: {
      primerNombre: 'Carlos',
      primerApellido: 'Mendoza',
      segundoApellido: 'Vargas',
      correoInstitucional: 'jefe.sistemas@uni.edu.bo',
      passwordHash,
      idRol: jefeRole.idRol,
      estado: 'ACTIVO',
    },
  });

  await prisma.usuarioCarrera.create({
    data: {
      idUsuario: jefeSistemas.idUsuario,
      idCarrera: carreraSistemasId,
    },
  });

  // 5. Jefe de Carrera - Derecho
  const jefeDerecho = await prisma.usuario.create({
    data: {
      primerNombre: 'Roberto',
      primerApellido: 'Quinteros',
      segundoApellido: 'Alarcón',
      correoInstitucional: 'jefe.derecho@uni.edu.bo',
      passwordHash,
      idRol: jefeRole.idRol,
      estado: 'ACTIVO',
    },
  });

  await prisma.usuarioCarrera.create({
    data: {
      idUsuario: jefeDerecho.idUsuario,
      idCarrera: carreraDerechoId,
    },
  });

  console.log('✅ Usuarios institucionales y jefes de carrera vinculados exitosamente.');
}

// ============================================================================
// 5. Estudiantes y Defensas de Prueba (Listas para Ruleta)
// ============================================================================
async function seedEstudiantesYDefensas(
  planSistemasId: bigint,
  planDerechoId: bigint,
  carreraDerechoId: bigint,
) {
  console.log('🎓 Sembrando estudiantes y defensas programadas para pruebas...');

  const tipoInterna = await prisma.tipoDefensa.findUniqueOrThrow({ where: { nombre: 'INTERNA' } });
  const tipoExterna = await prisma.tipoDefensa.findUniqueOrThrow({ where: { nombre: 'EXTERNA' } });

  const ahora = new Date();

  // --------------------------------------------------------------------------
  // A. Estudiantes de SISTEMAS
  // --------------------------------------------------------------------------
  // Estudiante 1: Alejandro Morales - Defensa PROGRAMADA (Limpia para Ruleta de Sistemas)
  const estSis1 = await prisma.estudiante.create({
    data: {
      idPlanEstudio: planSistemasId,
      carnetEstudiantil: 'SIS-20220001',
      carnetIdentidad: '8392011 SC',
      nombreCompleto: 'Alejandro Morales Quispe',
      correo: 'alejandro.morales@estudiante.edu.bo',
      estado: 'ACTIVO',
    },
  });

  const procSis1 = await prisma.procesoExamenGrado.create({
    data: { idEstudiante: estSis1.idEstudiante, estadoProceso: 'EN_CURSO' },
  });

  const instSis1 = await prisma.instanciaExamenGrado.create({
    data: { idProceso: procSis1.idProceso, numeroInstancia: 1, estadoInstancia: 'PENDIENTE' },
  });

  await prisma.defensaExamenGrado.create({
    data: {
      idInstancia: instSis1.idInstancia,
      idTipoDefensa: tipoInterna.idTipoDefensa,
      fechaDefensa: new Date(ahora.getTime() + 7 * 24 * 3600 * 1000), // En 7 días (plazo FCT)
      periodoAcademico: 'II-2026',
      estadoDefensa: 'PROGRAMADA', // ¡LISTA PARA SORTEO!
    },
  });

  // Estudiante 2: Valeria Rojas - Defensa PROGRAMADA (Externa)
  const estSis2 = await prisma.estudiante.create({
    data: {
      idPlanEstudio: planSistemasId,
      carnetEstudiantil: 'SIS-20220002',
      carnetIdentidad: '7482910 CB',
      nombreCompleto: 'Valeria Andrea Rojas Mamani',
      correo: 'valeria.rojas@estudiante.edu.bo',
      estado: 'ACTIVO',
    },
  });

  const procSis2 = await prisma.procesoExamenGrado.create({
    data: { idEstudiante: estSis2.idEstudiante, estadoProceso: 'EN_CURSO' },
  });

  const instSis2 = await prisma.instanciaExamenGrado.create({
    data: { idProceso: procSis2.idProceso, numeroInstancia: 1, estadoInstancia: 'PENDIENTE' },
  });

  await prisma.defensaExamenGrado.create({
    data: {
      idInstancia: instSis2.idInstancia,
      idTipoDefensa: tipoExterna.idTipoDefensa,
      fechaDefensa: new Date(ahora.getTime() + 14 * 24 * 3600 * 1000),
      periodoAcademico: 'II-2026',
      estadoDefensa: 'PROGRAMADA',
    },
  });

  // --------------------------------------------------------------------------
  // B. Estudiantes de DERECHO
  // --------------------------------------------------------------------------
  // Estudiante 3: Carlos De La Barra - Defensa PROGRAMADA (Limpia para Ruleta de Derecho)
  const estDer1 = await prisma.estudiante.create({
    data: {
      idPlanEstudio: planDerechoId,
      carnetEstudiantil: 'DER-20220001',
      carnetIdentidad: '6391024 SC',
      nombreCompleto: 'Carlos Eduardo De La Barra Gutiérrez',
      correo: 'carlos.delabarra@estudiante.edu.bo',
      estado: 'ACTIVO',
    },
  });

  const procDer1 = await prisma.procesoExamenGrado.create({
    data: { idEstudiante: estDer1.idEstudiante, estadoProceso: 'EN_CURSO' },
  });

  const instDer1 = await prisma.instanciaExamenGrado.create({
    data: { idProceso: procDer1.idProceso, numeroInstancia: 1, estadoInstancia: 'PENDIENTE' },
  });

  await prisma.defensaExamenGrado.create({
    data: {
      idInstancia: instDer1.idInstancia,
      idTipoDefensa: tipoInterna.idTipoDefensa,
      fechaDefensa: new Date(ahora.getTime() + 5 * 24 * 3600 * 1000), // En 5 días (plazo FCJS)
      periodoAcademico: 'II-2026',
      estadoDefensa: 'PROGRAMADA', // ¡LISTA PARA SORTEO DE ÁREA!
    },
  });

  // Estudiante 4: Mariana Torrico - Con Área ya sorteada (Lista para Sorteo de Caso)
  const estDer2 = await prisma.estudiante.create({
    data: {
      idPlanEstudio: planDerechoId,
      carnetEstudiantil: 'DER-20220002',
      carnetIdentidad: '9012384 LP',
      nombreCompleto: 'Mariana Sofía Torrico Mendoza',
      correo: 'mariana.torrico@estudiante.edu.bo',
      estado: 'ACTIVO',
    },
  });

  const procDer2 = await prisma.procesoExamenGrado.create({
    data: { idEstudiante: estDer2.idEstudiante, estadoProceso: 'EN_CURSO' },
  });

  const instDer2 = await prisma.instanciaExamenGrado.create({
    data: { idProceso: procDer2.idProceso, numeroInstancia: 1, estadoInstancia: 'PENDIENTE' },
  });

  const defDer2 = await prisma.defensaExamenGrado.create({
    data: {
      idInstancia: instDer2.idInstancia,
      idTipoDefensa: tipoInterna.idTipoDefensa,
      fechaDefensa: new Date(ahora.getTime() + 2 * 24 * 3600 * 1000),
      periodoAcademico: 'II-2026',
      estadoDefensa: 'AREA_SORTEADA', // Lista para sortear caso
    },
  });

  // Registrar el sorteo de área previo para Mariana
  const areaPenal = await prisma.areaAcademica.findFirstOrThrow({
    where: { idCarrera: carreraDerechoId, nombre: 'Derecho Penal' },
  });

  const configAreaDer = await prisma.configuracionSorteoArea.findFirstOrThrow({
    where: { idCarrera: carreraDerechoId, idTipoDefensa: tipoInterna.idTipoDefensa },
  });

  const adminUser = await prisma.usuario.findFirstOrThrow({
    where: { correoInstitucional: 'coord@uni.edu.bo' },
  });

  const sorteoAreaDer = await prisma.sorteo.create({
    data: {
      idDefensa: defDer2.idDefensa,
      idUsuarioEjecutor: adminUser.idUsuario,
      idPlanEstudioContexto: planDerechoId,
      fechaDefensaContexto: defDer2.fechaDefensa,
      estadoSorteo: 'ACTIVO',
      estudiantePresente: true,
    },
  });

  await prisma.sorteoArea.create({
    data: {
      idSorteo: sorteoAreaDer.idSorteo,
      idConfigSorteoArea: configAreaDer.idConfigSorteoArea,
      idAreaResultado: areaPenal.idArea,
    },
  });

  // Estudiante 5: Diego Paredes - Defensa ya realizada (DEFENDIDO)
  const estDer3 = await prisma.estudiante.create({
    data: {
      idPlanEstudio: planDerechoId,
      carnetEstudiantil: 'DER-20210088',
      carnetIdentidad: '8172634 PT',
      nombreCompleto: 'Diego Alonso Paredes Ríos',
      correo: 'diego.paredes@estudiante.edu.bo',
      estado: 'ACTIVO',
    },
  });

  const procDer3 = await prisma.procesoExamenGrado.create({
    data: { idEstudiante: estDer3.idEstudiante, estadoProceso: 'CONCLUIDO' },
  });

  const instDer3 = await prisma.instanciaExamenGrado.create({
    data: { idProceso: procDer3.idProceso, numeroInstancia: 1, estadoInstancia: 'CONCLUIDO', resultado: 'APROBADO' },
  });

  await prisma.defensaExamenGrado.create({
    data: {
      idInstancia: instDer3.idInstancia,
      idTipoDefensa: tipoInterna.idTipoDefensa,
      fechaDefensa: new Date(ahora.getTime() - 3 * 24 * 3600 * 1000),
      periodoAcademico: 'II-2026',
      estadoDefensa: 'DEFENDIDO',
      nota: 92.5,
      resultado: 'APROBADO',
    },
  });

  console.log('✅ Estudiantes y defensas creados con estados reglamentarios correctos.');
}

// ============================================================================
// Función Principal Orquestadora
// ============================================================================
async function main() {
  console.log('\n======================================================');
  console.log('🚀 INICIANDO SEED OFICIAL UTEPSA (CLEAN CODE & SOLID)');
  console.log('======================================================\n');

  const passwordHash = await bcrypt.hash('Admin123!', 10);

  // 1. Limpieza
  await cleanDatabase();

  // 2. Roles y Tipos de Defensa
  await seedRolesYTiposDefensa();

  // 3. Catálogo UTEPSA (17 Carreras, 3 Facultades, Áreas, Planes, Casos)
  const ids = await seedCatalogoOficial();

  // 4. Usuarios institucionales y asignación estricta de carreras
  await seedUsuarios(ids.carreraSistemasId, ids.carreraDerechoId, passwordHash);

  // 5. Estudiantes y defensas reglamentarias
  await seedEstudiantesYDefensas(ids.planSistemasId, ids.planDerechoId, ids.carreraDerechoId);

  console.log('\n======================================================');
  console.log('🎉 SEED COMPLETADO SATISFACTORIAMENTE');
  console.log('======================================================\n');
}

main()
  .catch((error) => {
    console.error('❌ Error al ejecutar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
