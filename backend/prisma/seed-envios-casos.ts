import { PrismaClient } from '@prisma/client';
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

async function main() {
  console.log('============================================================');
  console.log('🌱 Poblando Envíos de Caso de Estudio (envio_caso_estudio)');
  console.log('============================================================\n');

  // 1. Obtener todos los jefes de carrera mapeados por idCarrera
  const usuariosCarrera = await prisma.usuarioCarrera.findMany({
    include: {
      usuario: {
        include: { rol: true },
      },
      carrera: true,
    },
  });

  const jefePorCarrera = new Map<string, { idUsuario: bigint; nombre: string; correo: string }>();
  for (const uc of usuariosCarrera) {
    if (uc.usuario.rol.nombre === 'JEFE_CARRERA') {
      jefePorCarrera.set(uc.idCarrera.toString(), {
        idUsuario: uc.usuario.idUsuario,
        nombre: `${uc.usuario.primerNombre} ${uc.usuario.primerApellido}`,
        correo: uc.usuario.correoInstitucional,
      });
    }
  }

  // Usuario de respaldo institucional
  const usuarioDefensas = await prisma.usuario.findFirst({
    where: { correoInstitucional: 'defensas@uni.edu.bo' },
  });
  const usuarioAdmin = await prisma.usuario.findFirst({
    where: { correoInstitucional: 'admin@uni.edu.bo' },
  });
  const fallbackUsuarioId = usuarioDefensas?.idUsuario ?? usuarioAdmin?.idUsuario ?? BigInt(1);

  // 2. Buscar todos los sorteos que tengan caso seleccionado
  const sorteosConCaso = await prisma.sorteoCaso.findMany({
    include: {
      sorteo: {
        include: {
          defensa: {
            include: {
              instancia: {
                include: {
                  proceso: {
                    include: {
                      estudiante: {
                        include: {
                          planEstudio: {
                            include: { carrera: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          usuarioEjecutor: true,
        },
      },
      casoSeleccionado: true,
    },
  });

  console.log(`📋 Sorteos con caso identificado: ${sorteosConCaso.length}`);

  let creados = 0;
  let omitidos = 0;
  let auditoriasCreadas = 0;

  for (const sc of sorteosConCaso) {
    const sorteo = sc.sorteo;
    const defensa = sorteo?.defensa;
    const instancia = defensa?.instancia;
    const proceso = instancia?.proceso;
    const estudiante = proceso?.estudiante;
    const caso = sc.casoSeleccionado;
    const carrera = estudiante?.planEstudio?.carrera;

    if (!estudiante || !caso) {
      console.warn(`⚠️ Sorteo ${sc.idSorteo} sin estudiante o caso asociado. Omitiendo.`);
      continue;
    }

    // Verificar si ya existe un envío para este estudiante y este caso
    const envioExistente = await prisma.envioCasoEstudio.findFirst({
      where: {
        idEstudiante: estudiante.idEstudiante,
        idCasoEstudio: caso.idCasoEstudio,
      },
    });

    if (envioExistente) {
      omitidos++;
      continue;
    }

    // Determinar usuario remitente:
    // Prioridad 1: Jefe de la carrera del estudiante
    // Prioridad 2: Usuario ejecutor del sorteo
    // Prioridad 3: Responsable institucional
    let idUsuarioRemitente = fallbackUsuarioId;
    if (carrera && jefePorCarrera.has(carrera.idCarrera.toString())) {
      idUsuarioRemitente = jefePorCarrera.get(carrera.idCarrera.toString())!.idUsuario;
    } else if (sorteo.idUsuarioEjecutor) {
      idUsuarioRemitente = sorteo.idUsuarioEjecutor;
    }

    // Correo destino: correo del estudiante
    const correoDestino = estudiante.correo;

    // Fecha y hora del envío:
    let fechaHoraEnvio: Date;
    if (sorteo.fechaHora) {
      fechaHoraEnvio = new Date(sorteo.fechaHora);
    } else if (defensa?.fechaDefensa) {
      fechaHoraEnvio = new Date(defensa.fechaDefensa.getTime() - 48 * 3600 * 1000);
    } else {
      fechaHoraEnvio = new Date();
    }

    // Estado del envío:
    let estadoEnvio = 'ENTREGADO';
    if (defensa?.estadoDefensa === 'CASO_ASIGNADO') {
      estadoEnvio = creados % 7 === 0 ? 'ENVIADO' : 'ENTREGADO';
    } else if (defensa?.estadoDefensa === 'AREA_SORTEADA' || defensa?.estadoDefensa === 'PROGRAMADA') {
      estadoEnvio = 'PENDIENTE';
    }

    // Crear el registro de envío
    const nuevoEnvio = await prisma.envioCasoEstudio.create({
      data: {
        idEstudiante: estudiante.idEstudiante,
        idCasoEstudio: caso.idCasoEstudio,
        idUsuarioEnvio: idUsuarioRemitente,
        correoDestino,
        fechaHoraEnvio,
        estadoEnvio,
      },
    });

    creados++;

    // Registrar en auditoría institucional vinculado al envío
    if (defensa && instancia && proceso) {
      const auditoriaExistente = await prisma.registroAuditoria.findFirst({
        where: {
          idEnvio: nuevoEnvio.idEnvio,
        },
      });

      if (!auditoriaExistente) {
        await prisma.registroAuditoria.create({
          data: {
            idUsuario: idUsuarioRemitente,
            idCasoEstudio: caso.idCasoEstudio,
            idSorteo: sorteo.idSorteo,
            idProceso: proceso.idProceso,
            idInstancia: instancia.idInstancia,
            idDefensa: defensa.idDefensa,
            idEnvio: nuevoEnvio.idEnvio,
            fechaHora: fechaHoraEnvio,
            tipoOperacion: 'ENVIO_CASO_ESTUDIO',
            descripcion: `Envío oficial de caso de estudio a ${estudiante.nombreCompleto} (${estudiante.carnetEstudiantil})`,
            motivo: 'Notificación oficial y entrega formal de caso sorteado para examen de grado',
            valorNuevo: {
              idEnvio: nuevoEnvio.idEnvio.toString(),
              correoDestino,
              estadoEnvio,
              tituloCaso: caso.titulo,
              carrera: carrera?.nombre ?? 'General',
              periodoAcademico: defensa.periodoAcademico,
            },
          },
        });
        auditoriasCreadas++;
      }
    }

    if (creados % 10 === 0) {
      console.log(`  ✉️ Creados ${creados} envíos de casos...`);
    }
  }

  // 3. Revisar si hay alguna defensa adicional con idCasoUtilizado sin SorteoCaso
  const defensasConCaso = await prisma.defensaExamenGrado.findMany({
    where: {
      idCasoUtilizado: { not: null },
    },
    include: {
      casoUtilizado: true,
      instancia: {
        include: {
          proceso: {
            include: {
              estudiante: {
                include: {
                  planEstudio: {
                    include: { carrera: true },
                  },
                },
              },
            },
          },
        },
      },
      sorteos: {
        include: {
          caso: true,
        },
      },
    },
  });

  for (const def of defensasConCaso) {
    const estudiante = def.instancia?.proceso?.estudiante;
    const caso = def.casoUtilizado;
    const carrera = estudiante?.planEstudio?.carrera;

    if (!estudiante || !caso) continue;

    const existe = await prisma.envioCasoEstudio.findFirst({
      where: {
        idEstudiante: estudiante.idEstudiante,
        idCasoEstudio: caso.idCasoEstudio,
      },
    });

    if (existe) {
      continue;
    }

    let idUsuarioRemitente = fallbackUsuarioId;
    if (carrera && jefePorCarrera.has(carrera.idCarrera.toString())) {
      idUsuarioRemitente = jefePorCarrera.get(carrera.idCarrera.toString())!.idUsuario;
    }

    const fechaEnvio = def.fechaDefensa
      ? new Date(def.fechaDefensa.getTime() - 48 * 3600 * 1000)
      : new Date();

    const nuevoEnvio = await prisma.envioCasoEstudio.create({
      data: {
        idEstudiante: estudiante.idEstudiante,
        idCasoEstudio: caso.idCasoEstudio,
        idUsuarioEnvio: idUsuarioRemitente,
        correoDestino: estudiante.correo,
        fechaHoraEnvio: fechaEnvio,
        estadoEnvio: def.estadoDefensa === 'CALIFICADO' ? 'ENTREGADO' : 'ENVIADO',
      },
    });

    creados++;

    if (def.instancia?.proceso) {
      await prisma.registroAuditoria.create({
        data: {
          idUsuario: idUsuarioRemitente,
          idCasoEstudio: caso.idCasoEstudio,
          idProceso: def.instancia.proceso.idProceso,
          idInstancia: def.instancia.idInstancia,
          idDefensa: def.idDefensa,
          idEnvio: nuevoEnvio.idEnvio,
          fechaHora: fechaEnvio,
          tipoOperacion: 'ENVIO_CASO_ESTUDIO',
          descripcion: `Envío oficial de caso de estudio a ${estudiante.nombreCompleto}`,
          motivo: 'Entrega formal de caso para defensa de grado',
          valorNuevo: {
            idEnvio: nuevoEnvio.idEnvio.toString(),
            correoDestino: estudiante.correo,
            estadoEnvio: nuevoEnvio.estadoEnvio,
            tituloCaso: caso.titulo,
            carrera: carrera?.nombre ?? 'General',
            periodoAcademico: def.periodoAcademico,
          },
        },
      });
      auditoriasCreadas++;
    }
  }

  // 4. Resumen final
  const totalEnvios = await prisma.envioCasoEstudio.count();
  const totalAuditorias = await prisma.registroAuditoria.count();

  console.log('\n============================================================');
  console.log('✅ POBLACIÓN DE ENVÍOS CONCLUIDA EXITOSAMENTE');
  console.log('============================================================');
  console.log(`📦 Envíos creados en esta ejecución:   ${creados}`);
  console.log(`⏭️  Envíos omitidos (ya existentes):   ${omitidos}`);
  console.log(`📑 Auditorías creadas para envíos:    ${auditoriasCreadas}`);
  console.log(`📊 Total registros en envio_caso_estudio: ${totalEnvios}`);
  console.log(`📊 Total registros en registro_auditoria: ${totalAuditorias}`);
  console.log('============================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed de envíos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
