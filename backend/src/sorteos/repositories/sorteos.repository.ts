import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SorteosRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la lista de IDs de carreras a las que tiene acceso un usuario.
   */
  async getUserCarreraIds(idUsuario: bigint): Promise<bigint[]> {
    const uc = await this.prisma.usuarioCarrera.findMany({
      where: { idUsuario },
      select: { idCarrera: true },
    });
    return uc.map((r) => r.idCarrera);
  }

  /**
   * Obtiene la defensa con todos los detalles académicos, del estudiante y sorteos previos.
   */
  async findDefensaWithDetails(idDefensa: bigint) {
    return this.prisma.defensaExamenGrado.findUnique({
      where: { idDefensa },
      include: {
        tipoDefensa: true,
        casoUtilizado: {
          include: {
            area: true,
          },
        },
        instancia: {
          include: {
            proceso: {
              include: {
                estudiante: {
                  include: {
                    planEstudio: {
                      include: {
                        carrera: {
                          include: {
                            facultad: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        sorteos: {
          orderBy: { fechaHora: 'asc' },
          include: {
            area: {
              include: {
                areaResultado: true,
                pool: {
                  include: {
                    area: true,
                  },
                },
              },
            },
            caso: {
              include: {
                casoSeleccionado: {
                  include: {
                    area: true,
                  },
                },
              },
            },
            usuarioEjecutor: {
              select: {
                idUsuario: true,
                primerNombre: true,
                primerApellido: true,
                correoInstitucional: true,
                rol: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Obtiene las áreas académicas activas disponibles para el estudiante (por plan o por carrera).
   */
  async findAreasDisponibles(idPlanEstudio: bigint, idCarrera: bigint) {
    // 1. Intentar por plan_area asegurando aislamiento estricto por carrera
    const planAreas = await this.prisma.planArea.findMany({
      where: {
        idPlanEstudio,
        area: { estado: 'ACTIVO', idCarrera },
      },
      include: {
        area: true,
      },
    });

    if (planAreas.length > 0) {
      return planAreas.map((pa) => pa.area);
    }

    // 2. Fallback a todas las áreas activas de la carrera
    return this.prisma.areaAcademica.findMany({
      where: {
        idCarrera,
        estado: 'ACTIVO',
      },
    });
  }

  /**
   * Obtiene los casos de estudio disponibles para un área (no agotados, activos y con < 2 usos).
   */
  async findCasosDisponibles(idArea: bigint) {
    const casos = await this.prisma.casoEstudio.findMany({
      where: {
        idArea,
        estado: { notIn: ['AGOTADO', 'INACTIVO'] },
      },
      include: {
        defensas: {
          select: { idDefensa: true },
        },
      },
    });

    // Filtra casos que tengan menos de 2 defensas asociadas o que hayan sido reactivados especialmente
    return casos.filter((c) => c.estado === 'REACTIVADO_ESPECIAL' || c.defensas.length < 2);
  }

  /**
   * Busca o crea la configuración de sorteo de área para una carrera y tipo de defensa.
   */
  async findOrCreateConfigSorteoArea(idCarrera: bigint, idTipoDefensa: bigint) {
    let config = await this.prisma.configuracionSorteoArea.findFirst({
      where: {
        idCarrera,
        idTipoDefensa,
        estadoVigencia: 'VIGENTE',
      },
    });

    if (!config) {
      config = await this.prisma.configuracionSorteoArea.create({
        data: {
          idCarrera,
          idTipoDefensa,
          orden: 1,
          anticipacion: 5,
          unidadAnticipacion: 'DIAS',
          estadoVigencia: 'VIGENTE',
        },
      });
    }

    return config;
  }

  /**
   * Busca o crea la configuración de sorteo de caso para una carrera y tipo de defensa.
   */
  async findOrCreateConfigSorteoCaso(idCarrera: bigint, idTipoDefensa: bigint) {
    let config = await this.prisma.configuracionSorteoCaso.findFirst({
      where: {
        idCarrera,
        idTipoDefensa,
        estadoVigencia: 'VIGENTE',
      },
    });

    if (!config) {
      config = await this.prisma.configuracionSorteoCaso.create({
        data: {
          idCarrera,
          idTipoDefensa,
          modoObtencionCaso: 'NUEVO_SORTEO',
          orden: 2,
          anticipacion: 0,
          unidadAnticipacion: 'DIAS',
          plazoResolucion: 60,
          unidadPlazo: 'MINUTOS',
          estadoVigencia: 'VIGENTE',
        },
      });
    }

    return config;
  }

  /**
   * Ejecuta transaccionalmente el sorteo digital de Área.
   */
  async ejecutarSorteoArea(params: {
    idDefensa: bigint;
    idUsuarioEjecutor: bigint;
    idPlanEstudioContexto: bigint;
    fechaDefensaContexto: Date;
    estudiantePresente: boolean;
    motivoInasistencia?: string;
    idConfigSorteoArea: bigint;
    idAreaResultado: bigint;
    poolAreaIds: bigint[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear registro maestro de Sorteo
      const sorteo = await tx.sorteo.create({
        data: {
          idDefensa: params.idDefensa,
          idUsuarioEjecutor: params.idUsuarioEjecutor,
          idPlanEstudioContexto: params.idPlanEstudioContexto,
          fechaDefensaContexto: params.fechaDefensaContexto,
          estadoSorteo: 'ACTIVO',
          estudiantePresente: params.estudiantePresente,
          motivoInasistencia: params.motivoInasistencia,
        },
      });

      // 2. Crear registro de SorteoArea
      await tx.sorteoArea.create({
        data: {
          idSorteo: sorteo.idSorteo,
          idConfigSorteoArea: params.idConfigSorteoArea,
          idAreaResultado: params.idAreaResultado,
        },
      });

      // 3. Registrar el pool de áreas participantes para trazabilidad
      for (const idArea of params.poolAreaIds) {
        await tx.sorteoAreaPool.create({
          data: {
            idSorteo: sorteo.idSorteo,
            idArea,
          },
        });
      }

      // 4. Actualizar estado de la defensa
      await tx.defensaExamenGrado.update({
        where: { idDefensa: params.idDefensa },
        data: { estadoDefensa: 'AREA_SORTEADA' },
      });

      // 5. Registrar auditoría inmutable
      await tx.registroAuditoria.create({
        data: {
          idUsuario: params.idUsuarioEjecutor,
          idSorteo: sorteo.idSorteo,
          idDefensa: params.idDefensa,
          tipoOperacion: 'SORTEO_AREA_EJECUTADO',
          descripcion: `Sorteo digital de área ejecutado. Área ganadora: ${params.idAreaResultado}. Bolillero compuesto por ${params.poolAreaIds.length} áreas.`,
        },
      });

      return sorteo;
    });
  }

  /**
   * Ejecuta transaccionalmente el sorteo digital de Caso de Estudio.
   */
  async ejecutarSorteoCaso(params: {
    idDefensa: bigint;
    idUsuarioEjecutor: bigint;
    idPlanEstudioContexto: bigint;
    fechaDefensaContexto: Date;
    estudiantePresente: boolean;
    motivoInasistencia?: string;
    idConfigSorteoCaso: bigint;
    idCasoSeleccionado: bigint;
    plazoLimiteEntrega?: Date;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 0. Control estricto de concurrencia: verificar si el caso ya está asignado activamente
      const asignacionActiva = await tx.asignacionCaso.findFirst({
        where: {
          idCaso: params.idCasoSeleccionado,
          estado: { in: ['ASIGNADO', 'EN_CURSO'] },
        },
      });
      if (asignacionActiva && asignacionActiva.idDefensa !== params.idDefensa) {
        throw new ConflictException('El caso de estudio ya se encuentra asignado a otro estudiante.');
      }

      // 1. Crear registro maestro de Sorteo
      const sorteo = await tx.sorteo.create({
        data: {
          idDefensa: params.idDefensa,
          idUsuarioEjecutor: params.idUsuarioEjecutor,
          idPlanEstudioContexto: params.idPlanEstudioContexto,
          fechaDefensaContexto: params.fechaDefensaContexto,
          estadoSorteo: 'ACTIVO',
          estudiantePresente: params.estudiantePresente,
          motivoInasistencia: params.motivoInasistencia,
        },
      });

      // 2. Crear registro de SorteoCaso
      await tx.sorteoCaso.create({
        data: {
          idSorteo: sorteo.idSorteo,
          idConfigSorteoCaso: params.idConfigSorteoCaso,
          idCasoSeleccionado: params.idCasoSeleccionado,
          plazoLimiteEntrega: params.plazoLimiteEntrega,
        },
      });

      // 3. Vincular caso a la defensa y actualizar estado a CASO_ASIGNADO
      await tx.defensaExamenGrado.update({
        where: { idDefensa: params.idDefensa },
        data: {
          idCasoUtilizado: params.idCasoSeleccionado,
          estadoDefensa: 'CASO_ASIGNADO',
        },
      });

      // 4. Obtener estudiante y área para registrar AsignacionCaso
      const defensa = await tx.defensaExamenGrado.findUnique({
        where: { idDefensa: params.idDefensa },
        include: {
          instancia: { include: { proceso: true } },
          sorteos: { include: { area: true } },
        },
      });

      const idEstudiante = defensa?.instancia.proceso.idEstudiante;
      const idArea = defensa?.sorteos.find((s) => s.area !== null)?.area?.idAreaResultado;

      if (idEstudiante && idArea) {
        await tx.asignacionCaso.upsert({
          where: { idDefensa: params.idDefensa },
          create: {
            idEstudiante,
            idDefensa: params.idDefensa,
            idArea,
            idCaso: params.idCasoSeleccionado,
            idUsuarioEjecutor: params.idUsuarioEjecutor,
            idSorteo: sorteo.idSorteo,
            plazoLimiteEntrega: params.plazoLimiteEntrega,
            estado: 'ASIGNADO',
          },
          update: {
            idCaso: params.idCasoSeleccionado,
            idArea,
            idUsuarioEjecutor: params.idUsuarioEjecutor,
            idSorteo: sorteo.idSorteo,
            plazoLimiteEntrega: params.plazoLimiteEntrega,
            estado: 'ASIGNADO',
          },
        });
      }

      // 5. Contar usos actuales del caso para actualizar a AGOTADO si llega a 2
      const defensasCount = await tx.defensaExamenGrado.count({
        where: { idCasoUtilizado: params.idCasoSeleccionado },
      });

      const nuevoEstado = defensasCount >= 2 ? 'AGOTADO' : 'EN_USO';
      await tx.casoEstudio.update({
        where: { idCasoEstudio: params.idCasoSeleccionado },
        data: { estado: nuevoEstado },
      });

      // 6. Registrar auditoría inmutable
      await tx.registroAuditoria.create({
        data: {
          idUsuario: params.idUsuarioEjecutor,
          idSorteo: sorteo.idSorteo,
          idDefensa: params.idDefensa,
          idCasoEstudio: params.idCasoSeleccionado,
          tipoOperacion: 'SORTEO_CASO_EJECUTADO',
          descripcion: `Sorteo de caso asignado: ${params.idCasoSeleccionado}. Usos registrados acumulados: ${defensasCount}. Estado del caso: ${nuevoEstado}.`,
        },
      });

      return sorteo;
    });
  }

  /**
   * Ejecuta transaccionalmente el sorteo conjunto anticipado (Área y Caso simultáneo para FCT y Psicología).
   */
  async ejecutarSorteoConjunto(params: {
    idDefensa: bigint;
    idUsuarioEjecutor: bigint;
    idPlanEstudioContexto: bigint;
    fechaDefensaContexto: Date;
    estudiantePresente: boolean;
    motivoInasistencia?: string;
    idConfigSorteoArea: bigint;
    idAreaResultado: bigint;
    poolAreaIds: bigint[];
    idConfigSorteoCaso: bigint;
    idCasoSeleccionado: bigint;
    plazoLimiteEntrega?: Date;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Sorteo de Área
      const sorteoAreaMaster = await tx.sorteo.create({
        data: {
          idDefensa: params.idDefensa,
          idUsuarioEjecutor: params.idUsuarioEjecutor,
          idPlanEstudioContexto: params.idPlanEstudioContexto,
          fechaDefensaContexto: params.fechaDefensaContexto,
          estadoSorteo: 'ACTIVO',
          estudiantePresente: params.estudiantePresente,
          motivoInasistencia: params.motivoInasistencia,
        },
      });

      await tx.sorteoArea.create({
        data: {
          idSorteo: sorteoAreaMaster.idSorteo,
          idConfigSorteoArea: params.idConfigSorteoArea,
          idAreaResultado: params.idAreaResultado,
        },
      });

      for (const idArea of params.poolAreaIds) {
        await tx.sorteoAreaPool.create({
          data: {
            idSorteo: sorteoAreaMaster.idSorteo,
            idArea,
          },
        });
      }

      // 2. Sorteo de Caso
      const sorteoCasoMaster = await tx.sorteo.create({
        data: {
          idDefensa: params.idDefensa,
          idUsuarioEjecutor: params.idUsuarioEjecutor,
          idPlanEstudioContexto: params.idPlanEstudioContexto,
          idSorteoAnterior: sorteoAreaMaster.idSorteo,
          fechaDefensaContexto: params.fechaDefensaContexto,
          estadoSorteo: 'ACTIVO',
          estudiantePresente: params.estudiantePresente,
          motivoInasistencia: params.motivoInasistencia,
        },
      });

      await tx.sorteoCaso.create({
        data: {
          idSorteo: sorteoCasoMaster.idSorteo,
          idConfigSorteoCaso: params.idConfigSorteoCaso,
          idCasoSeleccionado: params.idCasoSeleccionado,
          plazoLimiteEntrega: params.plazoLimiteEntrega,
        },
      });

      // 3. Vincular y cambiar estado directo a CASO_ASIGNADO
      await tx.defensaExamenGrado.update({
        where: { idDefensa: params.idDefensa },
        data: {
          idCasoUtilizado: params.idCasoSeleccionado,
          estadoDefensa: 'CASO_ASIGNADO',
        },
      });

      // 4. Comprobar uso de caso
      const defensasCount = await tx.defensaExamenGrado.count({
        where: { idCasoUtilizado: params.idCasoSeleccionado },
      });

      if (defensasCount >= 2) {
        await tx.casoEstudio.update({
          where: { idCasoEstudio: params.idCasoSeleccionado },
          data: { estado: 'AGOTADO' },
        });
      }

      // 5. Auditoría
      await tx.registroAuditoria.create({
        data: {
          idUsuario: params.idUsuarioEjecutor,
          idSorteo: sorteoCasoMaster.idSorteo,
          idDefensa: params.idDefensa,
          idCasoEstudio: params.idCasoSeleccionado,
          tipoOperacion: 'SORTEO_CONJUNTO_ANTICIPADO',
          descripcion: `Sorteo conjunto ejecutado. Área: ${params.idAreaResultado}, Caso: ${params.idCasoSeleccionado}.`,
        },
      });

      return {
        sorteoArea: sorteoAreaMaster,
        sorteoCaso: sorteoCasoMaster,
      };
    });
  }

  /**
   * Consulta el historial general de sorteos con paginación y filtros.
   */
  async findHistorial(
    options: {
      idCarrera?: bigint;
      search?: string;
      skip: number;
      take: number;
    },
    allowedCarreraIds?: bigint[],
  ) {
    const where: any = {
      estadoSorteo: 'ACTIVO',
    };

    if (allowedCarreraIds && allowedCarreraIds.length > 0) {
      where.defensa = {
        instancia: {
          proceso: {
            estudiante: {
              planEstudio: {
                idCarrera: { in: allowedCarreraIds },
              },
            },
          },
        },
      };
    }

    if (options.idCarrera) {
      where.defensa = {
        ...(where.defensa || {}),
        instancia: {
          proceso: {
            estudiante: {
              planEstudio: {
                idCarrera: options.idCarrera,
              },
            },
          },
        },
      };
    }

    if (options.search) {
      where.OR = [
        {
          defensa: {
            instancia: {
              proceso: {
                estudiante: {
                  nombreCompleto: { contains: options.search, mode: 'insensitive' },
                },
              },
            },
          },
        },
        {
          defensa: {
            instancia: {
              proceso: {
                estudiante: {
                  carnetEstudiantil: { contains: options.search, mode: 'insensitive' },
                },
              },
            },
          },
        },
      ];
    }

    return this.prisma.sorteo.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: { fechaHora: 'desc' },
      include: {
        defensa: {
          include: {
            tipoDefensa: true,
            instancia: {
              include: {
                proceso: {
                  include: {
                    estudiante: {
                      include: {
                        planEstudio: {
                          include: {
                            carrera: {
                              include: {
                                facultad: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        usuarioEjecutor: {
          select: {
            idUsuario: true,
            primerNombre: true,
            primerApellido: true,
            correoInstitucional: true,
            rol: true,
          },
        },
        area: {
          include: {
            areaResultado: true,
            pool: {
              include: {
                area: true,
              },
            },
          },
        },
        caso: {
          include: {
            casoSeleccionado: {
              include: {
                area: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Cuenta total de sorteos para la paginación del historial.
   */
  async countHistorial(
    options: {
      idCarrera?: bigint;
      search?: string;
    },
    allowedCarreraIds?: bigint[],
  ): Promise<number> {
    const where: any = {
      estadoSorteo: 'ACTIVO',
    };

    if (allowedCarreraIds && allowedCarreraIds.length > 0) {
      where.defensa = {
        instancia: {
          proceso: {
            estudiante: {
              planEstudio: {
                idCarrera: { in: allowedCarreraIds },
              },
            },
          },
        },
      };
    }

    if (options.idCarrera) {
      where.defensa = {
        ...(where.defensa || {}),
        instancia: {
          proceso: {
            estudiante: {
              planEstudio: {
                idCarrera: options.idCarrera,
              },
            },
          },
        },
      };
    }

    return this.prisma.sorteo.count({ where });
  }

  /**
   * Obtiene los detalles de un sorteo por ID (para el acta y verificación).
   */
  async findSorteoById(idSorteo: bigint) {
    return this.prisma.sorteo.findUnique({
      where: { idSorteo },
      include: {
        defensa: {
          include: {
            tipoDefensa: true,
            instancia: {
              include: {
                proceso: {
                  include: {
                    estudiante: {
                      include: {
                        planEstudio: {
                          include: {
                            carrera: {
                              include: {
                                facultad: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        usuarioEjecutor: {
          select: {
            idUsuario: true,
            primerNombre: true,
            primerApellido: true,
            correoInstitucional: true,
            rol: true,
          },
        },
        area: {
          include: {
            areaResultado: true,
            pool: {
              include: {
                area: true,
              },
            },
          },
        },
        caso: {
          include: {
            casoSeleccionado: {
              include: {
                area: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Finaliza el sorteo y persiste atómicamente la asignación oficial del caso con control estricto de concurrencia.
   */
  async finalizarYAsignarSorteo(params: {
    idDefensa: bigint;
    idEstudiante: bigint;
    idArea: bigint;
    idCaso: bigint;
    idUsuarioEjecutor: bigint;
    idPlanEstudioContexto: bigint;
    fechaDefensaContexto: Date;
    estudiantePresente?: boolean;
    motivoInasistencia?: string;
    tokenActa?: string;
    codigoActa?: string;
    plazoLimiteEntrega?: Date;
  }) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Control de concurrencia a nivel de BD: ¿el caso ya está tomado por otra defensa activa?
        const asignacionActiva = await tx.asignacionCaso.findFirst({
          where: {
            idCaso: params.idCaso,
            estado: { in: ['ASIGNADO', 'EN_CURSO'] },
          },
        });

        if (asignacionActiva && asignacionActiva.idDefensa !== params.idDefensa) {
          throw new ConflictException(
            'El caso de estudio ya se encuentra asignado a otro estudiante.',
          );
        }

        // 2. Validar que el caso existe y no esté agotado
        const caso = await tx.casoEstudio.findUnique({
          where: { idCasoEstudio: params.idCaso },
        });

        if (!caso) {
          throw new NotFoundException(
            `Caso de estudio con ID ${params.idCaso} no encontrado.`,
          );
        }

        if (caso.estado === 'AGOTADO') {
          throw new BadRequestException(
            'El caso de estudio seleccionado ya se encuentra agotado.',
          );
        }

        // 3. Validar estado de la defensa
        const defensa = await tx.defensaExamenGrado.findUnique({
          where: { idDefensa: params.idDefensa },
          include: {
            asignacionCaso: true,
            sorteos: {
              orderBy: { fechaHora: 'desc' },
              take: 1,
            },
          },
        });

        if (!defensa) {
          throw new NotFoundException(
            `Defensa con ID ${params.idDefensa} no encontrada.`,
          );
        }

        if (
          defensa.asignacionCaso &&
          ['ASIGNADO', 'EN_CURSO'].includes(defensa.asignacionCaso.estado)
        ) {
          throw new BadRequestException(
            'Esta defensa ya cuenta con una asignación de caso activa.',
          );
        }

        // 4. Obtener o registrar registro maestro de Sorteo si no existiera
        let idSorteo = defensa.sorteos[0]?.idSorteo;
        if (!idSorteo) {
          const nuevoSorteo = await tx.sorteo.create({
            data: {
              idDefensa: params.idDefensa,
              idUsuarioEjecutor: params.idUsuarioEjecutor,
              idPlanEstudioContexto: params.idPlanEstudioContexto,
              fechaDefensaContexto: params.fechaDefensaContexto,
              estadoSorteo: 'ACTIVO',
              estudiantePresente: params.estudiantePresente ?? true,
              motivoInasistencia: params.motivoInasistencia,
            },
          });
          idSorteo = nuevoSorteo.idSorteo;
        }

        // 5. Persistir la asignación definitiva
        const asignacion = await tx.asignacionCaso.create({
          data: {
            idEstudiante: params.idEstudiante,
            idDefensa: params.idDefensa,
            idArea: params.idArea,
            idCaso: params.idCaso,
            idUsuarioEjecutor: params.idUsuarioEjecutor,
            idSorteo,
            tokenActa: params.tokenActa,
            codigoActa: params.codigoActa,
            plazoLimiteEntrega: params.plazoLimiteEntrega,
            estado: 'ASIGNADO',
          },
          include: {
            estudiante: {
              include: {
                planEstudio: {
                  include: {
                    carrera: true,
                  },
                },
              },
            },
            area: true,
            caso: true,
            defensa: {
              include: {
                tipoDefensa: true,
              },
            },
            usuarioEjecutor: {
              select: {
                idUsuario: true,
                primerNombre: true,
                primerApellido: true,
                correoInstitucional: true,
                rol: true,
              },
            },
          },
        });

        // 6. Actualizar la defensa
        await tx.defensaExamenGrado.update({
          where: { idDefensa: params.idDefensa },
          data: {
            idCasoUtilizado: params.idCaso,
            estadoDefensa: 'CASO_ASIGNADO',
          },
        });

        // 7. Contar usos acumulados y actualizar estado del caso a EN_USO o AGOTADO
        const totalAsignaciones = await tx.asignacionCaso.count({
          where: {
            idCaso: params.idCaso,
            estado: { not: 'ANULADO' },
          },
        });

        const nuevoEstadoCaso = totalAsignaciones >= 2 ? 'AGOTADO' : 'EN_USO';
        await tx.casoEstudio.update({
          where: { idCasoEstudio: params.idCaso },
          data: { estado: nuevoEstadoCaso },
        });

        // 8. Auditoría inmutable de cierre de sorteo y asignación
        await tx.registroAuditoria.create({
          data: {
            idUsuario: params.idUsuarioEjecutor,
            idDefensa: params.idDefensa,
            idCasoEstudio: params.idCaso,
            idSorteo,
            tipoOperacion: 'SORTEO_FINALIZADO_ASIGNACION',
            descripcion: `Sorteo finalizado exitosamente. Caso ${params.idCaso} asignado a Estudiante ${params.idEstudiante}. Estado del caso: ${nuevoEstadoCaso}.`,
            valorNuevo: {
              idAsignacion: asignacion.idAsignacion.toString(),
              idEstudiante: params.idEstudiante.toString(),
              idCaso: params.idCaso.toString(),
              idArea: params.idArea.toString(),
              codigoActa: params.codigoActa,
            },
          },
        });

        return asignacion;
      });
    } catch (err: any) {
      if (
        (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') ||
        err?.code === 'P2002' ||
        err?.message?.includes?.('idx_asignacion_caso_activo_unico') ||
        err?.meta?.target?.includes?.('idx_asignacion_caso_activo_unico')
      ) {
        throw new ConflictException(
          'El caso de estudio ya se encuentra asignado a otro estudiante.',
        );
      }
      throw err;
    }
  }

  /**
   * Consulta la asignación formal de una defensa por su ID.
   */
  async findAsignacionByDefensa(idDefensa: bigint) {
    return this.prisma.asignacionCaso.findUnique({
      where: { idDefensa },
      include: {
        estudiante: {
          include: {
            planEstudio: {
              include: {
                carrera: true,
              },
            },
          },
        },
        area: true,
        caso: true,
        defensa: {
          include: {
            tipoDefensa: true,
          },
        },
        usuarioEjecutor: {
          select: {
            idUsuario: true,
            primerNombre: true,
            primerApellido: true,
            correoInstitucional: true,
            rol: true,
          },
        },
      },
    });
  }

  /**
   * Crea una nueva sesión temporal de espectador para que el estudiante siga el sorteo.
   */
  async crearSesionEspectador(data: {
    token: string;
    slug: string;
    idDefensa: bigint;
    idEstudiante: bigint;
    fechaExpiracion: Date;
    fase?: string;
    estadoPayload?: any;
  }) {
    return this.prisma.sesionEspectadorSorteo.create({
      data: {
        token: data.token,
        slug: data.slug,
        idDefensa: data.idDefensa,
        idEstudiante: data.idEstudiante,
        fechaExpiracion: data.fechaExpiracion,
        fase: data.fase ?? 'ESPERANDO',
        estadoPayload: data.estadoPayload ?? Prisma.JsonNull,
        activo: true,
      },
    });
  }

  /**
   * Busca una sesión de espectador activa por token o slug.
   */
  async findSesionEspectadorByTokenOrSlug(identificador: string) {
    return this.prisma.sesionEspectadorSorteo.findFirst({
      where: {
        OR: [{ token: identificador }, { slug: identificador }],
        activo: true,
      },
      include: {
        defensa: {
          include: {
            tipoDefensa: true,
            asignacionCaso: {
              include: {
                area: true,
                caso: true,
              },
            },
          },
        },
        estudiante: {
          include: {
            planEstudio: {
              include: {
                carrera: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Actualiza la fase o el payload en vivo de la sesión de espectador.
   */
  async actualizarFaseSesionEspectador(
    identificador: string,
    fase: string,
    payload?: any,
  ) {
    const sesion = await this.prisma.sesionEspectadorSorteo.findFirst({
      where: {
        OR: [{ token: identificador }, { slug: identificador }],
        activo: true,
      },
    });

    if (!sesion) {
      throw new NotFoundException(
        `Sesión de espectador no encontrada: ${identificador}`,
      );
    }

    return this.prisma.sesionEspectadorSorteo.update({
      where: { idSesion: sesion.idSesion },
      data: {
        fase,
        estadoPayload: payload !== undefined ? payload : sesion.estadoPayload,
      },
    });
  }

  /**
   * Invalida/expira formalmente la sesión de espectador al terminar el acto.
   */
  async expirarSesionEspectador(identificador: string) {
    const sesion = await this.prisma.sesionEspectadorSorteo.findFirst({
      where: {
        OR: [{ token: identificador }, { slug: identificador }],
      },
    });

    if (!sesion) return null;

    return this.prisma.sesionEspectadorSorteo.update({
      where: { idSesion: sesion.idSesion },
      data: {
        activo: false,
        fase: 'EXPIRADO',
      },
    });
  }
}

