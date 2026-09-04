import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';

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
    // 1. Intentar por plan_area
    const planAreas = await this.prisma.planArea.findMany({
      where: {
        idPlanEstudio,
        area: { estado: 'ACTIVO' },
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

      // 4. Contar usos actuales del caso para actualizar a AGOTADO si llega a 2
      const defensasCount = await tx.defensaExamenGrado.count({
        where: { idCasoUtilizado: params.idCasoSeleccionado },
      });

      if (defensasCount >= 2) {
        await tx.casoEstudio.update({
          where: { idCasoEstudio: params.idCasoSeleccionado },
          data: { estado: 'AGOTADO' },
        });
      }

      // 5. Registrar auditoría inmutable
      await tx.registroAuditoria.create({
        data: {
          idUsuario: params.idUsuarioEjecutor,
          idSorteo: sorteo.idSorteo,
          idDefensa: params.idDefensa,
          idCasoEstudio: params.idCasoSeleccionado,
          tipoOperacion: 'SORTEO_CASO_EJECUTADO',
          descripcion: `Sorteo de caso asignado: ${params.idCasoSeleccionado}. Usos registrados acumulados: ${defensasCount}.`,
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
}
