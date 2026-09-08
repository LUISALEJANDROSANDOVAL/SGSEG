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

interface JefeCarreraDef {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correoInstitucional: string;
  carreraNombre: string;
}

const JEFES_CARRERA: JefeCarreraDef[] = [
  // FCT - Facultad de Ciencia y Tecnología
  {
    primerNombre: 'Rolando',
    segundoNombre: 'Dany',
    primerApellido: 'Vaca Díez',
    segundoApellido: 'Mercado',
    correoInstitucional: 'jefe.redes@uni.edu.bo',
    carreraNombre: 'Redes y Telecomunicaciones',
  },
  {
    primerNombre: 'Juan',
    segundoNombre: 'Pablo',
    primerApellido: 'Aguilera',
    segundoApellido: 'Justiniano',
    correoInstitucional: 'jefe.industrial@uni.edu.bo',
    carreraNombre: 'Industrial y Comercial',
  },
  {
    primerNombre: 'Oscar',
    primerApellido: 'Justiniano',
    segundoApellido: 'Ribera',
    correoInstitucional: 'jefe.mecanica@uni.edu.bo',
    carreraNombre: 'Mecánica',
  },
  {
    primerNombre: 'Jorge',
    segundoNombre: 'Eduardo',
    primerApellido: 'Roca',
    segundoApellido: 'Salvatierra',
    correoInstitucional: 'jefe.electronica@uni.edu.bo',
    carreraNombre: 'Electrónica y Sistemas',
  },
  {
    primerNombre: 'Mario',
    segundoNombre: 'Alberto',
    primerApellido: 'Chávez',
    segundoApellido: 'Gutiérrez',
    correoInstitucional: 'jefe.electrica@uni.edu.bo',
    carreraNombre: 'Ingeniería Eléctrica',
  },

  // FCE - Facultad de Ciencias Empresariales
  {
    primerNombre: 'Claudia',
    segundoNombre: 'Patricia',
    primerApellido: 'Arteaga',
    segundoApellido: 'Mendoza',
    correoInstitucional: 'jefe.comercial@uni.edu.bo',
    carreraNombre: 'Ingeniería Comercial',
  },
  {
    primerNombre: 'Fernando',
    primerApellido: 'Suárez',
    segundoApellido: 'Morales',
    correoInstitucional: 'jefe.administracion@uni.edu.bo',
    carreraNombre: 'Administración General',
  },
  {
    primerNombre: 'Jimena',
    segundoNombre: 'Andrea',
    primerApellido: 'Paz',
    segundoApellido: 'Zeballos',
    correoInstitucional: 'jefe.marketing@uni.edu.bo',
    carreraNombre: 'Marketing y Publicidad',
  },
  {
    primerNombre: 'Marco',
    segundoNombre: 'Antonio',
    primerApellido: 'Claros',
    segundoApellido: 'Hurtado',
    correoInstitucional: 'jefe.financiera@uni.edu.bo',
    carreraNombre: 'Ingeniería Financiera',
  },
  {
    primerNombre: 'Rosario',
    primerApellido: 'Méndez',
    segundoApellido: 'Ortiz',
    correoInstitucional: 'jefe.contaduria@uni.edu.bo',
    carreraNombre: 'Contaduría Pública',
  },
  {
    primerNombre: 'Daniel',
    segundoNombre: 'Eduardo',
    primerApellido: 'Torrico',
    segundoApellido: 'Alarcón',
    correoInstitucional: 'jefe.comercio@uni.edu.bo',
    carreraNombre: 'Comercio Internacional',
  },
  {
    primerNombre: 'Verónica',
    segundoNombre: 'Cecilia',
    primerApellido: 'Banegas',
    segundoApellido: 'Dorado',
    correoInstitucional: 'jefe.turismo@uni.edu.bo',
    carreraNombre: 'Turismo',
  },
  {
    primerNombre: 'Sergio',
    segundoNombre: 'Andrés',
    primerApellido: 'Villarroel',
    segundoApellido: 'Cortez',
    correoInstitucional: 'jefe.comunicacion@uni.edu.bo',
    carreraNombre: 'Comunicación Estratégica y Digital',
  },

  // FCJS - Facultad de Ciencias Jurídicas y Sociales
  {
    primerNombre: 'Mariana',
    segundoNombre: 'Sofía',
    primerApellido: 'Gutiérrez',
    segundoApellido: 'Torrico',
    correoInstitucional: 'jefe.psicologia@uni.edu.bo',
    carreraNombre: 'Psicología',
  },
  {
    primerNombre: 'Alejandro',
    segundoNombre: 'Bruno',
    primerApellido: 'Melgar',
    segundoApellido: 'Justiniano',
    correoInstitucional: 'jefe.rrii@uni.edu.bo',
    carreraNombre: 'Relaciones Internacionales',
  },
];

interface UsuarioInstitucionalDef {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correoInstitucional: string;
  rolNombre: string;
}

const USUARIOS_INSTITUCIONALES: UsuarioInstitucionalDef[] = [
  {
    primerNombre: 'Hernán',
    primerApellido: 'Daza',
    segundoApellido: 'Cuéllar',
    correoInstitucional: 'registro@uni.edu.bo',
    rolNombre: 'REGISTRO',
  },
  {
    primerNombre: 'Marcela',
    primerApellido: 'Justiniano',
    segundoApellido: 'Dorado',
    correoInstitucional: 'defensas@uni.edu.bo',
    rolNombre: 'DEFENSA',
  },
  {
    primerNombre: 'Admin',
    primerApellido: 'General',
    segundoApellido: 'SGSEG',
    correoInstitucional: 'admin@uni.edu.bo',
    rolNombre: 'SUPER_ADMIN',
  },
];

async function main() {
  console.log('========================================================================');
  console.log('🚀 SEMBRANDO JEFES DE CARRERA Y USUARIOS INSTITUCIONALES (UTEPSA)');
  console.log('========================================================================\n');

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const rolJefe = await prisma.rol.findFirstOrThrow({ where: { nombre: 'JEFE_CARRERA' } });

  let jefesCreados = 0;
  let jefesActualizados = 0;

  // 1. Sembrar Jefes de Carrera
  console.log('📌 1. Sembrando Jefes de Carrera para las 15 carreras restantes...');
  for (const j of JEFES_CARRERA) {
    const carrera = await prisma.carrera.findFirst({
      where: { nombre: j.carreraNombre },
    });

    if (!carrera) {
      console.warn(`⚠️ Carrera "${j.carreraNombre}" no encontrada en la base de datos. Saltando.`);
      continue;
    }

    let user = await prisma.usuario.findUnique({
      where: { correoInstitucional: j.correoInstitucional },
    });

    if (!user) {
      user = await prisma.usuario.create({
        data: {
          idRol: rolJefe.idRol,
          primerNombre: j.primerNombre,
          segundoNombre: j.segundoNombre ?? null,
          primerApellido: j.primerApellido,
          segundoApellido: j.segundoApellido ?? null,
          correoInstitucional: j.correoInstitucional,
          passwordHash,
          estado: 'ACTIVO',
        },
      });
      jefesCreados++;
    } else {
      user = await prisma.usuario.update({
        where: { idUsuario: user.idUsuario },
        data: {
          idRol: rolJefe.idRol,
          primerNombre: j.primerNombre,
          segundoNombre: j.segundoNombre ?? null,
          primerApellido: j.primerApellido,
          segundoApellido: j.segundoApellido ?? null,
          passwordHash,
          estado: 'ACTIVO',
        },
      });
      jefesActualizados++;
    }

    // Vincular con UsuarioCarrera
    const vinculoExistente = await prisma.usuarioCarrera.findUnique({
      where: {
        idUsuario_idCarrera: {
          idUsuario: user.idUsuario,
          idCarrera: carrera.idCarrera,
        },
      },
    });

    if (!vinculoExistente) {
      await prisma.usuarioCarrera.create({
        data: {
          idUsuario: user.idUsuario,
          idCarrera: carrera.idCarrera,
        },
      });
    }

    console.log(`   ✅ [${j.carreraNombre}]: ${j.correoInstitucional} (${j.primerNombre} ${j.primerApellido})`);
  }

  // 2. Sembrar Usuarios Institucionales con Roles Específicos
  console.log('\n📌 2. Sembrando usuarios con roles institucionales (REGISTRO, DEFENSA, SUPER_ADMIN)...');
  let institucionalesCreados = 0;

  for (const u of USUARIOS_INSTITUCIONALES) {
    const rol = await prisma.rol.findFirst({ where: { nombre: u.rolNombre } });
    if (!rol) {
      console.warn(`⚠️ Rol "${u.rolNombre}" no encontrado. Saltando.`);
      continue;
    }

    const userExistente = await prisma.usuario.findUnique({
      where: { correoInstitucional: u.correoInstitucional },
    });

    if (!userExistente) {
      await prisma.usuario.create({
        data: {
          idRol: rol.idRol,
          primerNombre: u.primerNombre,
          segundoNombre: u.segundoNombre ?? null,
          primerApellido: u.primerApellido,
          segundoApellido: u.segundoApellido ?? null,
          correoInstitucional: u.correoInstitucional,
          passwordHash,
          estado: 'ACTIVO',
        },
      });
      institucionalesCreados++;
    } else {
      await prisma.usuario.update({
        where: { idUsuario: userExistente.idUsuario },
        data: {
          idRol: rol.idRol,
          primerNombre: u.primerNombre,
          segundoNombre: u.segundoNombre ?? null,
          primerApellido: u.primerApellido,
          segundoApellido: u.segundoApellido ?? null,
          passwordHash,
          estado: 'ACTIVO',
        },
      });
    }

    console.log(`   ✅ [${u.rolNombre}]: ${u.correoInstitucional} (${u.primerNombre} ${u.primerApellido})`);
  }

  console.log('\n========================================================================');
  console.log('🎉 SEMBRADO DE USUARIOS INSTITUCIONALES COMPLETADO SATISFACTORIAMENTE');
  console.log(`   Jefes de Carrera Procesados: ${JEFES_CARRERA.length} (${jefesCreados} creados, ${jefesActualizados} actualizados)`);
  console.log(`   Usuarios Institucionales Especiales: ${USUARIOS_INSTITUCIONALES.length}`);
  console.log('   Contraseña unificada para todos los usuarios: Admin123!');
  console.log('========================================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error sembrando usuarios:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
