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

async function main() {
<<<<<<< HEAD
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
}

main()
  .catch((error) => {
    console.error('Error al ejecutar seed:', error);
=======
  console.log('Iniciando el sembrado de la base de datos...');

  // Limpiar base de datos
  await prisma.configSorteo.deleteMany();
  await prisma.areaPensum.deleteMany();
  await prisma.pensum.deleteMany();
  await prisma.areaAcademica.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.carrera.deleteMany();
  await prisma.facultad.deleteMany();

  // 1. Crear Facultades
  const facTecnologia = await prisma.facultad.create({
    data: { nombre: 'Facultad de Tecnología y Sistemas' },
  });

  const facEconomicas = await prisma.facultad.create({
    data: { nombre: 'Facultad de Ciencias Económicas y Empresariales' },
  });

  console.log('Facultades creadas.');

  // 2. Crear Carreras
  const carSistemas = await prisma.carrera.create({
    data: {
      nombre: 'Ingeniería de Sistemas',
      facultadId: facTecnologia.id,
    },
  });

  const carAdministracion = await prisma.carrera.create({
    data: {
      nombre: 'Administración de Empresas',
      facultadId: facEconomicas.id,
    },
  });

  const carComercial = await prisma.carrera.create({
    data: {
      nombre: 'Ingeniería Comercial',
      facultadId: facEconomicas.id,
    },
  });

  console.log('Carreras creadas.');

  // 3. Crear Áreas Académicas
  const areaSoftware = await prisma.areaAcademica.create({
    data: { nombre: 'Ingeniería de Software y Programación', carreraId: carSistemas.id },
  });

  const areaRedes = await prisma.areaAcademica.create({
    data: { nombre: 'Redes y Telecomunicaciones', carreraId: carSistemas.id },
  });

  const areaFinanzas = await prisma.areaAcademica.create({
    data: { nombre: 'Finanzas y Contabilidad', carreraId: carAdministracion.id },
  });

  const areaMarketing = await prisma.areaAcademica.create({
    data: { nombre: 'Marketing y Ventas', carreraId: carComercial.id },
  });

  console.log('Áreas académicas creadas.');

  // 4. Crear Pensums
  const pensum2019 = await prisma.pensum.create({
    data: { nombre: 'Pensum 2019', carreraId: carSistemas.id },
  });

  const pensum2022 = await prisma.pensum.create({
    data: { nombre: 'Pensum 2022', carreraId: carSistemas.id },
  });

  const pensumAdmin2022 = await prisma.pensum.create({
    data: { nombre: 'Pensum 2022 (Admin)', carreraId: carAdministracion.id },
  });

  console.log('Pensums creados.');

  // 5. Vincular Áreas Académicas a Pensums (AreaPensum)
  await prisma.areaPensum.createMany({
    data: [
      { areaId: areaSoftware.id, pensumId: pensum2019.id },
      { areaId: areaSoftware.id, pensumId: pensum2022.id },
      { areaId: areaRedes.id, pensumId: pensum2022.id },
      { areaId: areaFinanzas.id, pensumId: pensumAdmin2022.id },
    ],
  });

  console.log('Asociaciones de Áreas y Pensums creadas.');

  // 6. Configurar Procedimiento y Reglas de Sorteo por defecto (RF-05)
  await prisma.configSorteo.createMany({
    data: [
      {
        carreraId: carSistemas.id,
        tipoDefensa: 'INTERNA',
        mismoMomento: true,
        anticipacionDefensa: 24, // 24 horas antes
        plazoResolucion: 48, // 48 horas de plazo
        unidadTiempo: 'HORAS',
      },
      {
        carreraId: carSistemas.id,
        tipoDefensa: 'EXTERNA',
        mismoMomento: false, // Área y caso en momentos distintos
        anticipacionDefensa: 5, // 5 días antes
        plazoResolucion: 7, // 7 días de plazo
        unidadTiempo: 'DIAS_CALENDARIO',
      },
      {
        carreraId: carAdministracion.id,
        tipoDefensa: 'INTERNA',
        mismoMomento: true,
        anticipacionDefensa: 2,
        plazoResolucion: 3,
        unidadTiempo: 'DIAS_HABILES',
      },
    ],
  });

  console.log('Configuraciones de sorteo creadas.');

  // 7. Crear Usuarios con Contraseñas encriptadas (RF-01, RF-02, RF-03)
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.usuario.createMany({
    data: [
      {
        email: 'coordinadora@sgseg.com',
        nombre: 'Dra. Lucrecia Sandoval',
        password: passwordHash,
        rol: 'Coordinador General',
        activo: true,
      },
      {
        email: 'jefe.sistemas@sgseg.com',
        nombre: 'Ing. Carlos Mendoza',
        password: passwordHash,
        rol: 'Jefe de Carrera',
        carreraId: carSistemas.id,
        activo: true,
      },
      {
        email: 'secretario@sgseg.com',
        nombre: 'Lic. Roberto Gómez',
        password: passwordHash,
        rol: 'Secretario de Facultad',
        activo: true,
      },
      {
        email: 'vicerrector@sgseg.com',
        nombre: 'Dr. Fernando Prado (Vicerrectorado)',
        password: passwordHash,
        rol: 'Vicerrectorado',
        activo: true,
      },
    ],
  });

  console.log('Usuarios creados.');
  console.log('Sembrado de datos finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
>>>>>>> feature/Arnez
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
