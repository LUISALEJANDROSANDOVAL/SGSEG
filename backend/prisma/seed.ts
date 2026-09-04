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

  if (!coordinacionRole) {
    throw new Error('No se encontró el rol COORDINACION');
  }

  const passwordHash = await bcrypt.hash('Admin123!', 10);

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

  console.log('Seed de autenticación ejecutado correctamente');

  // Ejecutar población masiva de estudiantes y planes de estudio
  await seedEstudiantes();
}

main()
  .catch((error) => {
    console.error('Error al ejecutar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
