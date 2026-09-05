import { PrismaClient } from '@prisma/client';

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
 * Normaliza nombres, CIs y carnets
 */
function normalizeCarnet(carnet: string): string {
  return carnet.trim().replace(/\s+/g, '').toUpperCase();
}

function normalizeCi(ci: string): string {
  return ci
    .trim()
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

function normalizeNombre(nombre: string): string {
  const clean = nombre.trim().replace(/\s+/g, ' ');
  const lowerWords = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'van', 'von', 'da']);
  return clean
    .split(' ')
    .map((w, i) =>
      i > 0 && lowerWords.has(w.toLowerCase())
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(' ');
}

function normalizeEmail(correo?: string, carnet?: string): string {
  if (correo && correo.trim().length > 0 && correo.includes('@')) {
    return correo.trim().toLowerCase();
  }
  const cleanCarnet = (carnet ?? 'estudiante').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanCarnet}@estudiante.edu.bo`;
}

interface SeedStudentInput {
  carnetEstudiantil: string;
  carnetIdentidad: string;
  nombreCompleto: string;
  correo?: string;
  facultadNombre: string;
  carreraNombre: string;
  planEstudioNombre?: string;
}

const sampleStudents: SeedStudentInput[] = [
  // 1. Ingeniería de Sistemas - Plan 2024
  {
    carnetEstudiantil: 'SIS-20210001',
    carnetIdentidad: '8392011 LP',
    nombreCompleto: 'Alejandro Morales Quispe',
    correo: 'alejandro.morales@estudiante.edu.bo',
    facultadNombre: 'Facultad de Ingeniería',
    carreraNombre: 'Ingeniería de Sistemas',
    planEstudioNombre: 'Plan 2024',
  },
  {
    carnetEstudiantil: 'SIS-20210002',
    carnetIdentidad: '7482910 CB',
    nombreCompleto: 'valeria andrea rojas mamani',
    correo: 'valeria.rojas@estudiante.edu.bo',
    facultadNombre: 'Facultad de Ingeniería',
    carreraNombre: 'Ingeniería de Sistemas',
    planEstudioNombre: 'Plan 2024',
  },
  {
    carnetEstudiantil: 'SIS-20210003',
    carnetIdentidad: '6391024-1T SC',
    nombreCompleto: '   CARLOS   EDUARDO   DE LA BARRA   GUTIERREZ   ',
    facultadNombre: 'Facultad de Ingeniería',
    carreraNombre: 'Ingeniería de Sistemas',
    planEstudioNombre: 'Plan 2024',
  },
  // 2. Ingeniería de Sistemas - Plan 2018
  {
    carnetEstudiantil: 'SIS-20180045',
    carnetIdentidad: '5829102 LP',
    nombreCompleto: 'Gabriela Patricia Silva Flores',
    correo: 'gabriela.silva@estudiante.edu.bo',
    facultadNombre: 'Facultad de Ingeniería',
    carreraNombre: 'Ingeniería de Sistemas',
    planEstudioNombre: 'Plan 2018',
  },
  {
    carnetEstudiantil: 'SIS-20190088',
    carnetIdentidad: '6819203 OR',
    nombreCompleto: 'Rodrigo Fernando Vargas Perez',
    correo: 'rodrigo.vargas@estudiante.edu.bo',
    facultadNombre: 'Facultad de Ingeniería',
    carreraNombre: 'Ingeniería de Sistemas',
    planEstudioNombre: 'Plan 2018',
  },
  // 3. Ingeniería Informática - Plan 2023 (Existente)
  {
    carnetEstudiantil: 'INF-20220010',
    carnetIdentidad: '9012384 LP',
    nombreCompleto: 'Mariana Sofia Torrico Mendoza',
    correo: 'mariana.torrico@estudiante.edu.bo',
    facultadNombre: 'Facultad de Ingeniería',
    carreraNombre: 'Ingeniería Informática',
    planEstudioNombre: 'Plan 2023',
  },
  {
    carnetEstudiantil: 'INF-20220011',
    carnetIdentidad: '8172634 PT',
    nombreCompleto: 'DIEGO ALONSO PAREDES RIOS',
    correo: 'diego.paredes@estudiante.edu.bo',
    facultadNombre: 'Facultad de Ingeniería',
    carreraNombre: 'Ingeniería Informática',
    planEstudioNombre: 'Plan 2023',
  },
  // 4. Ingeniería Informática - Plan Nuevo que NO existe y se creará automáticamente
  {
    carnetEstudiantil: 'INF-20240099',
    carnetIdentidad: '9876543 SC',
    nombreCompleto: 'Luciana Beatriz Aguilar Vega',
    correo: 'luciana.aguilar@estudiante.edu.bo',
    facultadNombre: 'Facultad de Ingeniería',
    carreraNombre: 'Ingeniería Informática',
    planEstudioNombre: 'Plan 2026 - Mención Ciberseguridad',
  },
  // 5. Ingeniería Industrial - Sin plan especificado (asocia o crea Plan General por defecto)
  {
    carnetEstudiantil: 'IND-20230005',
    carnetIdentidad: '7281920 TJ',
    nombreCompleto: 'Mateo Sebastian Romero Fernandez',
    facultadNombre: 'Facultad de Ingeniería',
    carreraNombre: 'Ingeniería Industrial',
  },
  {
    carnetEstudiantil: 'IND-20230006',
    carnetIdentidad: '8192039 CH',
    nombreCompleto: 'Camila Nicole Choque Huanca',
    facultadNombre: 'Facultad de Ingeniería',
    carreraNombre: 'Ingeniería Industrial',
  },
  // 6. Ciencias Económicas - Ingeniería Comercial - Plan 2022
  {
    carnetEstudiantil: 'COM-20220015',
    carnetIdentidad: '6281923 LP',
    nombreCompleto: 'Joaquin Andres Suarez Delgado',
    correo: 'joaquin.suarez@estudiante.edu.bo',
    facultadNombre: 'Facultad de Ciencias Económicas y Financieras',
    carreraNombre: 'Ingeniería Comercial',
    planEstudioNombre: 'Plan 2022',
  },
  {
    carnetEstudiantil: 'COM-20220016',
    carnetIdentidad: '7192834 CB',
    nombreCompleto: 'Natalia Andrea Guzman Teran',
    facultadNombre: 'Facultad de Ciencias Económicas y Financieras',
    carreraNombre: 'Ingeniería Comercial',
    planEstudioNombre: 'Plan 2022',
  },
];

export async function seedEstudiantes() {
  console.log('\n======================================================');
  console.log('🚀 INICIANDO POBLACIÓN Y NORMALIZACIÓN DE ESTUDIANTES');
  console.log('======================================================');

  const startTime = Date.now();
  let createdCount = 0;
  let updatedCount = 0;
  let plansCreatedCount = 0;

  // 1. Asegurar facultades
  const facultades = [
    'Facultad de Ingeniería',
    'Facultad de Ciencias Económicas y Financieras',
  ];

  const facultadMap = new Map<string, bigint>();
  for (const facNombre of facultades) {
    const fac = await prisma.facultad.upsert({
      where: { nombre: facNombre },
      update: {},
      create: { nombre: facNombre },
    });
    facultadMap.set(facNombre, fac.idFacultad);
  }

  // 2. Asegurar carreras
  const carreras = [
    { facultad: 'Facultad de Ingeniería', nombre: 'Ingeniería de Sistemas' },
    { facultad: 'Facultad de Ingeniería', nombre: 'Ingeniería Informática' },
    { facultad: 'Facultad de Ingeniería', nombre: 'Ingeniería Industrial' },
    {
      facultad: 'Facultad de Ciencias Económicas y Financieras',
      nombre: 'Ingeniería Comercial',
    },
  ];

  const carreraMap = new Map<string, bigint>();
  for (const c of carreras) {
    const idFac = facultadMap.get(c.facultad)!;
    const carrera = await prisma.carrera.upsert({
      where: {
        idFacultad_nombre: {
          idFacultad: idFac,
          nombre: c.nombre,
        },
      },
      update: {},
      create: {
        idFacultad: idFac,
        nombre: c.nombre,
      },
    });
    carreraMap.set(c.nombre, carrera.idCarrera);
  }

  // 3. Asegurar planes base
  const planesBase = [
    { carrera: 'Ingeniería de Sistemas', nombre: 'Plan 2018' },
    { carrera: 'Ingeniería de Sistemas', nombre: 'Plan 2024' },
    { carrera: 'Ingeniería Informática', nombre: 'Plan 2023' },
    { carrera: 'Ingeniería Comercial', nombre: 'Plan 2022' },
  ];

  const planMap = new Map<string, bigint>();
  for (const p of planesBase) {
    const idCarrera = carreraMap.get(p.carrera)!;
    const plan = await prisma.planEstudio.upsert({
      where: {
        idCarrera_nombre: {
          idCarrera,
          nombre: p.nombre,
        },
      },
      update: { estadoVigencia: 'VIGENTE' },
      create: {
        idCarrera,
        nombre: p.nombre,
        estadoVigencia: 'VIGENTE',
      },
    });
    planMap.set(`${idCarrera}:${p.nombre.toLowerCase()}`, plan.idPlanEstudio);
  }

  // 4. Normalizar y resolver estudiantes
  console.log(`📦 Procesando ${sampleStudents.length} estudiantes de muestra...`);

  const preparedStudents: Array<{
    carnetEstudiantil: string;
    carnetIdentidad: string;
    nombreCompleto: string;
    correo: string;
    idPlanEstudio: bigint;
  }> = [];

  for (const item of sampleStudents) {
    const carnetEstudiantil = normalizeCarnet(item.carnetEstudiantil);
    const carnetIdentidad = normalizeCi(item.carnetIdentidad);
    const nombreCompleto = normalizeNombre(item.nombreCompleto);
    const correo = normalizeEmail(item.correo, carnetEstudiantil);

    const idCarrera = carreraMap.get(item.carreraNombre);
    if (!idCarrera) {
      throw new Error(`Carrera no encontrada: ${item.carreraNombre}`);
    }

    let planId: bigint | undefined;

    if (item.planEstudioNombre) {
      const planKey = `${idCarrera}:${item.planEstudioNombre.toLowerCase()}`;
      if (planMap.has(planKey)) {
        planId = planMap.get(planKey);
      } else {
        // Validar si existe en base de datos o auto-crear
        const existingPlan = await prisma.planEstudio.findUnique({
          where: {
            idCarrera_nombre: {
              idCarrera,
              nombre: item.planEstudioNombre,
            },
          },
        });

        if (existingPlan) {
          planId = existingPlan.idPlanEstudio;
        } else {
          console.log(
            ` ✨ Auto-creando Plan de Estudio faltante: "${item.planEstudioNombre}" para carrera ${item.carreraNombre}`,
          );
          const newPlan = await prisma.planEstudio.create({
            data: {
              idCarrera,
              nombre: item.planEstudioNombre,
              estadoVigencia: 'VIGENTE',
            },
          });
          planId = newPlan.idPlanEstudio;
          plansCreatedCount++;
        }
        planMap.set(planKey, planId!);
      }
    } else {
      // Buscar plan por defecto para la carrera
      const defaultPlanKey = `${idCarrera}:default`;
      if (planMap.has(defaultPlanKey)) {
        planId = planMap.get(defaultPlanKey);
      } else {
        const foundPlan = await prisma.planEstudio.findFirst({
          where: { idCarrera, estadoVigencia: 'VIGENTE' },
          orderBy: { idPlanEstudio: 'asc' },
        });

        if (foundPlan) {
          planId = foundPlan.idPlanEstudio;
        } else {
          const currentYear = new Date().getFullYear();
          const defaultPlanName = `PLAN GENERAL (${currentYear})`;
          console.log(
            ` ✨ Auto-creando Plan por defecto: "${defaultPlanName}" para carrera ${item.carreraNombre}`,
          );
          const newPlan = await prisma.planEstudio.create({
            data: {
              idCarrera,
              nombre: defaultPlanName,
              estadoVigencia: 'VIGENTE',
            },
          });
          planId = newPlan.idPlanEstudio;
          plansCreatedCount++;
        }
        planMap.set(defaultPlanKey, planId!);
      }
    }

    preparedStudents.push({
      carnetEstudiantil,
      carnetIdentidad,
      nombreCompleto,
      correo,
      idPlanEstudio: planId!,
    });
  }

  // 5. Inserción Transaccional Masiva (prisma.$transaction) con upsert idempotente
  console.log('🔄 Ejecutando transacción masiva de inserción/actualización...');

  await prisma.$transaction(async (tx) => {
    for (const st of preparedStudents) {
      const existing = await tx.estudiante.findUnique({
        where: { carnetEstudiantil: st.carnetEstudiantil },
      });

      await tx.estudiante.upsert({
        where: { carnetEstudiantil: st.carnetEstudiantil },
        create: {
          idPlanEstudio: st.idPlanEstudio,
          carnetEstudiantil: st.carnetEstudiantil,
          carnetIdentidad: st.carnetIdentidad,
          nombreCompleto: st.nombreCompleto,
          correo: st.correo,
          estado: 'ACTIVO',
        },
        update: {
          idPlanEstudio: st.idPlanEstudio,
          carnetIdentidad: st.carnetIdentidad,
          nombreCompleto: st.nombreCompleto,
          correo: st.correo,
          estado: 'ACTIVO',
        },
      });

      if (!existing) {
        createdCount++;
      } else {
        updatedCount++;
      }
    }
  });

  const duration = Date.now() - startTime;

  console.log('\n======================================================');
  console.log('✅ POBLACIÓN DE ESTUDIANTES COMPLETADA CON ÉXITO');
  console.log('======================================================');
  console.log(`📊 Total procesados:     ${preparedStudents.length}`);
  console.log(`🆕 Estudiantes creados:  ${createdCount}`);
  console.log(`🔁 Estudiantes actualiz: ${updatedCount}`);
  console.log(`📋 Planes creados auto:  ${plansCreatedCount}`);
  console.log(`⏱️  Duración:             ${duration}ms`);
  console.log('======================================================\n');
}

// Ejecución directa si se llama con ts-node
if (require.main === module) {
  seedEstudiantes()
    .catch((error) => {
      console.error('❌ Error al ejecutar seed de estudiantes:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
