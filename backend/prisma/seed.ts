import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://sgseg:sgseg@localhost:5437/sgseg?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

import { seedEstudiantes } from './seed-estudiantes';

async function main() {
  const roles = [
    { nombre: 'COORDINACION', descripcion: 'Coordinación académica' },
    { nombre: 'SECRETARIADO', descripcion: 'Secretariado académico' },
    { nombre: 'JEFE_CARRERA', descripcion: 'Jefe de carrera' },
    { nombre: 'VICERRECTORADO', descripcion: 'Vicerrectorado' },
    { nombre: 'REGISTRO', descripcion: 'Registro académico' },
    { nombre: 'DEFENSA', descripcion: 'Defensa de grado' },
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: { descripcion: rol.descripcion },
      create: rol,
    });
  }

  const coordinacionRole = await prisma.rol.findUnique({
    where: { nombre: 'COORDINACION' },
  });
  const jefeCarreraRole = await prisma.rol.findUnique({
    where: { nombre: 'JEFE_CARRERA' },
  });

  if (!coordinacionRole || !jefeCarreraRole) {
    throw new Error('No se encontraron los roles básicos');
  }

  const passwordHash = await bcrypt.hash('Admin123!', 10);

  // 1. Usuario Coordinación
  await prisma.usuario.upsert({
    where: { correoInstitucional: 'coord@uni.edu.bo' },
    update: {
      primerNombre: 'Coordinación',
      primerApellido: 'Administrativa',
      passwordHash,
      idRol: coordinacionRole.idRol,
      estado: 'ACTIVO',
    },
    create: {
      primerNombre: 'Coordinación',
      primerApellido: 'Administrativa',
      correoInstitucional: 'coord@uni.edu.bo',
      passwordHash,
      idRol: coordinacionRole.idRol,
      estado: 'ACTIVO',
    },
  });

  // 2. Ejecutar población de carreras, facultades y estudiantes
  await seedEstudiantes();

  // 3. Obtener carrera de Ingeniería de Sistemas
  const carreraSistemas = await prisma.carrera.findFirst({
    where: {
      nombre: { contains: 'Sistemas', mode: 'insensitive' },
    },
  });

  if (carreraSistemas) {
    // 4. Usuario Jefe de Carrera
    const usuarioJefe = await prisma.usuario.upsert({
      where: { correoInstitucional: 'jefe.sistemas@uni.edu.bo' },
      update: {
        primerNombre: 'Carlos',
        primerApellido: 'Mendoza',
        segundoApellido: 'Vargas',
        passwordHash,
        idRol: jefeCarreraRole.idRol,
        estado: 'ACTIVO',
      },
      create: {
        primerNombre: 'Carlos',
        primerApellido: 'Mendoza',
        segundoApellido: 'Vargas',
        correoInstitucional: 'jefe.sistemas@uni.edu.bo',
        passwordHash,
        idRol: jefeCarreraRole.idRol,
        estado: 'ACTIVO',
      },
    });

    // Vincular Jefe de Carrera con Ingeniería de Sistemas
    await prisma.usuarioCarrera.upsert({
      where: {
        idUsuario_idCarrera: {
          idUsuario: usuarioJefe.idUsuario,
          idCarrera: carreraSistemas.idCarrera,
        },
      },
      update: {},
      create: {
        idUsuario: usuarioJefe.idUsuario,
        idCarrera: carreraSistemas.idCarrera,
      },
    });

    // 5. Poblar Áreas Académicas para Ingeniería de Sistemas
    const areas = [
      { nombre: 'Ingeniería de Software', umbral: 2 },
      { nombre: 'Redes y Ciberseguridad', umbral: 2 },
      { nombre: 'Bases de Datos y Analítica', umbral: 2 },
      { nombre: 'Inteligencia Artificial y Cloud', umbral: 2 },
    ];

    const areasMap = new Map<string, bigint>();

    for (const a of areas) {
      const areaRecord = await prisma.areaAcademica.upsert({
        where: {
          idCarrera_nombre: {
            idCarrera: carreraSistemas.idCarrera,
            nombre: a.nombre,
          },
        },
        update: { umbralDisponibilidad: a.umbral, estado: 'ACTIVO' },
        create: {
          idCarrera: carreraSistemas.idCarrera,
          nombre: a.nombre,
          umbralDisponibilidad: a.umbral,
          estado: 'ACTIVO',
        },
      });
      areasMap.set(a.nombre, areaRecord.idArea);
    }

    // 6. Poblar Casos de Estudio de ejemplo
    const casosMuestra = [
      {
        area: 'Ingeniería de Software',
        titulo: 'Arquitectura de microservicios resiliente para plataforma de pagos en tiempo real',
        contenido:
          'Una empresa financiera nacional experimenta cuellos de botella en su backend monolítico durante días de alta demanda. Se solicita al postulante diseñar una arquitectura basada en microservicios utilizando event-driven architecture, definiendo los patrones de resiliencia (Circuit Breaker, Retry, Fallback) y la estrategia de particionado de base de datos.',
      },
      {
        area: 'Ingeniería de Software',
        titulo: 'Diseño e implementación de pipeline CI/CD seguro con escaneo automatizado de vulnerabilidades',
        contenido:
          'La organización busca migrar a un enfoque DevSecOps. Desarrolle la propuesta completa de pipeline continuo que incluya análisis estático (SAST), pruebas de integración automatizadas y despliegue continuo con estrategia Blue-Green en clúster Kubernetes.',
      },
      {
        area: 'Redes y Ciberseguridad',
        titulo: 'Segmentación de red corporativa multi-sede con arquitectura Zero Trust',
        contenido:
          'La universidad UPTECSA requiere rediseñar la infraestructura de telecomunicaciones de sus sedes regionales. El postulante debe plantear la topología de red con SD-WAN, políticas de segmentación micro y protocolos de cifrado punto a punto bajo lineamientos NIST 800-207.',
      },
      {
        area: 'Redes y Ciberseguridad',
        titulo: 'Plan de contingencia y mitigación ante ataques DDoS a nivel de capa de aplicación (L7)',
        contenido:
          'Diseñe un plan de respuesta a incidentes y una arquitectura de protección perimetral mediante WAF y balanceadores Anycast para salvaguardar el portal de admisiones de la universidad frente a ataques de denegación distribuida de servicio.',
      },
      {
        area: 'Bases de Datos y Analítica',
        titulo: 'Modelado y optimización de Data Lakehouse para trazabilidad académica y predicción',
        contenido:
          'El departamento de TI desea consolidar datos transaccionales, logs de auditoría y métricas de defensas de grado. Diseñe el modelo dimensional en estrella/copo de nieve e implemente estrategias de particionamiento y clustering.',
      },
      {
        area: 'Inteligencia Artificial y Cloud',
        titulo: 'Sistema de recomendación de casos de estudio y detección de plagio con NLP',
        contenido:
          'Proponga un pipeline de procesamiento de lenguaje natural (NLP) para indexar vectorialmente los enunciados de casos de estudio y evaluar la similitud semántica con propuestas presentadas por los postulantes.',
      },
    ];

    for (const c of casosMuestra) {
      const areaId = areasMap.get(c.area);
      if (areaId) {
        const existeCaso = await prisma.casoEstudio.findFirst({
          where: { idArea: areaId, titulo: c.titulo },
        });

        if (!existeCaso) {
          await prisma.casoEstudio.create({
            data: {
              idArea: areaId,
              titulo: c.titulo,
              contenido: c.contenido,
              estado: 'DISPONIBLE',
            },
          });
        }
      }
    }

    console.log('Seed de Jefe de Carrera, Áreas y Casos completado con éxito');
  }

  console.log('Seed general finalizado correctamente');
}

main()
  .catch((error) => {
    console.error('Error al ejecutar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
