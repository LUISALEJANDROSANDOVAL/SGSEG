import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prisma.service';

export interface DefensasFilterOptions {
  idFacultad?: bigint;
  idCarrera?: bigint;
  estadoDefensa?: string;
  tipoDefensa?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  search?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class DefensasRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene los IDs de carreras asignadas al usuario.
   */
  async getUserCarreraIds(idUsuario: bigint): Promise<bigint[]> {
    const records = await this.prisma.usuarioCarrera.findMany({
      where: { idUsuario },
      select: { idCarrera: true },
    });
    return records.map((r) => r.idCarrera);
  }

  /**
   * Busca un estudiante con su plan de estudio, carrera y facultad.
   */
  async findEstudianteById(idEstudiante: bigint) {
    return this.prisma.estudiante.findUnique({
      where: { idEstudiante },
      include: {
        planEstudio: {
          include: {
            carrera: {
              include: { facultad: true },
            },
          },
        },
      },
    });
  }

  /**
   * Busca un tipo de defensa por nombre ('INTERNA' | 'EXTERNA').
   */
  async findTipoDefensaByNombre(nombre: string) {
    return this.prisma.tipoDefensa.findFirst({
      where: {
        nombre: {
          equals: nombre.trim().toUpperCase(),
          mode: 'insensitive',
        },
      },
    });
  }

  /**
   * Programa una defensa creando o vinculando proceso e instancia de forma transaccional.
   */
  async programarDefensa(
    data: {
      idEstudiante: bigint;
      idTipoDefensa: bigint;
      fechaDefensa: Date;
      periodoAcademico: string;
    },
    idUsuario?: bigint,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Obtener o crear proceso de examen de grado en curso
      let proceso = await tx.procesoExamenGrado.findFirst({
        where: {
          idEstudiante: data.idEstudiante,
          estadoProceso: 'EN_CURSO',
        },
      });

      if (!proceso) {
        proceso = await tx.procesoExamenGrado.create({
          data: {
            idEstudiante: data.idEstudiante,
            estadoProceso: 'EN_CURSO',
          },
        });
      }

      // 2. Obtener o crear instancia (primera instancia por defecto)
      let instancia = await tx.instanciaExamenGrado.findFirst({
        where: {
          idProceso: proceso.idProceso,
          estadoInstancia: 'PENDIENTE',
        },
        orderBy: { numeroInstancia: 'desc' },
      });

      if (!instancia) {
        instancia = await tx.instanciaExamenGrado.create({
          data: {
            idProceso: proceso.idProceso,
            numeroInstancia: 1,
            estadoInstancia: 'PENDIENTE',
          },
        });
      }

      // 3. Crear o actualizar defensa programada
      const defensa = await tx.defensaExamenGrado.upsert({
        where: {
          idInstancia_idTipoDefensa: {
            idInstancia: instancia.idInstancia,
            idTipoDefensa: data.idTipoDefensa,
          },
        },
        update: {
          fechaDefensa: data.fechaDefensa,
          periodoAcademico: data.periodoAcademico,
          estadoDefensa: 'PROGRAMADA',
        },
        create: {
          idInstancia: instancia.idInstancia,
          idTipoDefensa: data.idTipoDefensa,
          fechaDefensa: data.fechaDefensa,
          periodoAcademico: data.periodoAcademico,
          estadoDefensa: 'PROGRAMADA',
        },
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
                            include: { facultad: true },
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
      });

      // 4. Registro en auditoría
      const estudiante = defensa.instancia.proceso.estudiante;
      await tx.registroAuditoria.create({
        data: {
          idUsuario: idUsuario ?? null,
          idDefensa: defensa.idDefensa,
          idProceso: proceso.idProceso,
          idInstancia: instancia.idInstancia,
          tipoOperacion: 'PROGRAMACION_DEFENSA',
          descripcion: `Programación de defensa ${defensa.tipoDefensa.nombre} para ${estudiante.nombreCompleto} (${estudiante.carnetEstudiantil}) con fecha ${data.fechaDefensa.toISOString().split('T')[0]}`,
          valorNuevo: {
            idDefensa: String(defensa.idDefensa),
            estudiante: estudiante.nombreCompleto,
            carnet: estudiante.carnetEstudiantil,
            fechaDefensa: data.fechaDefensa.toISOString().split('T')[0],
            tipoDefensa: defensa.tipoDefensa.nombre,
            periodo: data.periodoAcademico,
          },
        },
      });

      return defensa;
    });
  }

  /**
   * Construye el predicado WHERE para la consulta de defensas.
   */
  private buildWhereClause(
    filter: DefensasFilterOptions,
    allowedCarreraIds?: bigint[],
  ): Prisma.DefensaExamenGradoWhereInput {
    const where: Prisma.DefensaExamenGradoWhereInput = {};

    const estudianteWhere: Prisma.EstudianteWhereInput = {};
    const planWhere: Prisma.PlanEstudioWhereInput = {};

    if (allowedCarreraIds && allowedCarreraIds.length > 0) {
      if (filter.idCarrera) {
        if (allowedCarreraIds.includes(filter.idCarrera)) {
          planWhere.idCarrera = filter.idCarrera;
        } else {
          where.idDefensa = BigInt(-1);
          return where;
        }
      } else {
        planWhere.idCarrera = { in: allowedCarreraIds };
      }
    } else if (filter.idCarrera) {
      planWhere.idCarrera = filter.idCarrera;
    }

    if (filter.idFacultad) {
      planWhere.carrera = {
        idFacultad: filter.idFacultad,
      };
    }

    if (filter.search && filter.search.trim().length > 0) {
      const term = filter.search.trim();
      estudianteWhere.OR = [
        { nombreCompleto: { contains: term, mode: 'insensitive' } },
        { carnetEstudiantil: { contains: term, mode: 'insensitive' } },
        { carnetIdentidad: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (Object.keys(planWhere).length > 0) {
      estudianteWhere.planEstudio = planWhere;
    }

    if (Object.keys(estudianteWhere).length > 0) {
      where.instancia = {
        proceso: {
          estudiante: estudianteWhere,
        },
      };
    }

    if (filter.estadoDefensa && filter.estadoDefensa !== 'ALL') {
      where.estadoDefensa = filter.estadoDefensa;
    }

    if (filter.tipoDefensa && filter.tipoDefensa !== 'ALL') {
      where.tipoDefensa = {
        nombre: {
          equals: filter.tipoDefensa.toUpperCase(),
          mode: 'insensitive',
        },
      };
    }

    if (filter.fechaDesde || filter.fechaHasta) {
      where.fechaDefensa = {};
      if (filter.fechaDesde) where.fechaDefensa.gte = filter.fechaDesde;
      if (filter.fechaHasta) where.fechaDefensa.lte = filter.fechaHasta;
    }

    return where;
  }

  /**
   * Consulta el listado de defensas con soporte de filtros y orden por fecha más próxima.
   */
  async findDefensas(filter: DefensasFilterOptions, allowedCarreraIds?: bigint[]) {
    const where = this.buildWhereClause(filter, allowedCarreraIds);

    return this.prisma.defensaExamenGrado.findMany({
      where,
      skip: filter.skip,
      take: filter.take,
      orderBy: { fechaDefensa: 'asc' },
      include: {
        tipoDefensa: true,
        casoUtilizado: {
          include: {
            area: true,
          },
        },
        sorteos: {
          orderBy: { fechaHora: 'desc' },
          include: {
            area: {
              include: { areaResultado: true },
            },
            caso: {
              include: { casoSeleccionado: true },
            },
          },
        },
        auditorias: {
          where: { tipoOperacion: 'REGISTRO_CALIFICACION' },
          orderBy: { fechaHora: 'desc' },
          take: 1,
          include: {
            usuario: {
              select: {
                idUsuario: true,
                primerNombre: true,
                primerApellido: true,
                correoInstitucional: true,
              },
            },
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
                          include: { facultad: true },
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
    });
  }

  /**
   * Cuenta total de defensas según los filtros.
   */
  async countDefensas(filter: DefensasFilterOptions, allowedCarreraIds?: bigint[]): Promise<number> {
    const where = this.buildWhereClause(filter, allowedCarreraIds);
    return this.prisma.defensaExamenGrado.count({ where });
  }

  /**
   * Busca una defensa por su ID único.
   */
  async findDefensaById(idDefensa: bigint) {
    return this.prisma.defensaExamenGrado.findUnique({
      where: { idDefensa },
      include: {
        tipoDefensa: true,
        casoUtilizado: {
          include: { area: true },
        },
        sorteos: {
          include: {
            area: { include: { areaResultado: true } },
            caso: { include: { casoSeleccionado: true } },
          },
        },
        auditorias: {
          where: { tipoOperacion: 'REGISTRO_CALIFICACION' },
          orderBy: { fechaHora: 'desc' },
          take: 1,
          include: {
            usuario: {
              select: {
                idUsuario: true,
                primerNombre: true,
                primerApellido: true,
                correoInstitucional: true,
              },
            },
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
                          include: { facultad: true },
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
    });
  }

  /**
   * Modifica la fecha, estado o nota de una defensa.
   */
  async updateDefensa(
    idDefensa: bigint,
    data: {
      fechaDefensa?: Date;
      periodoAcademico?: string;
      estadoDefensa?: string;
      nota?: number;
      resultado?: string;
      tribunal?: {
        presidente?: string;
        secretario?: string;
        vocal?: string;
      };
      observaciones?: string;
    },
    idUsuario?: bigint,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.defensaExamenGrado.update({
        where: { idDefensa },
        data: {
          fechaDefensa: data.fechaDefensa,
          periodoAcademico: data.periodoAcademico,
          estadoDefensa: data.estadoDefensa,
          nota: data.nota !== undefined ? new Prisma.Decimal(data.nota) : undefined,
          resultado: data.resultado,
        },
        include: {
          tipoDefensa: true,
          instancia: {
            include: {
              proceso: {
                include: { estudiante: true },
              },
            },
          },
        },
      });

      await tx.registroAuditoria.create({
        data: {
          idUsuario: idUsuario ?? null,
          idDefensa,
          tipoOperacion: 'ACTUALIZACION_DEFENSA',
          descripcion: `Actualización de defensa ID ${idDefensa} (${updated.estadoDefensa})`,
          valorNuevo: {
            estadoDefensa: updated.estadoDefensa,
            fechaDefensa: updated.fechaDefensa.toISOString().split('T')[0],
            nota: updated.nota ? updated.nota.toString() : null,
            resultado: updated.resultado,
            tribunal: data.tribunal,
            observaciones: data.observaciones,
          },
        },
      });

      return updated;
    });
  }

  /**
   * Registra la calificación formal emitida por el tribunal examinador,
   * concluyendo la instancia y actualizando el proceso académico.
   */
  async calificarDefensa(
    idDefensa: bigint,
    data: {
      nota: number;
      resultado: string;
      estadoDefensa?: string;
      tribunal?: {
        presidente?: string;
        secretario?: string;
        vocal?: string;
      };
      observaciones?: string;
    },
    idUsuario?: bigint,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const estadoDefensa = data.estadoDefensa || 'CALIFICADO';

      // 1. Actualizar la defensa con su nota y resultado oficial
      const updated = await tx.defensaExamenGrado.update({
        where: { idDefensa },
        data: {
          nota: new Prisma.Decimal(data.nota),
          resultado: data.resultado,
          estadoDefensa,
        },
        include: {
          tipoDefensa: true,
          casoUtilizado: {
            include: { area: true },
          },
          sorteos: {
            include: {
              area: { include: { areaResultado: true } },
              caso: { include: { casoSeleccionado: true } },
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
                            include: { facultad: true },
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
      });

      // 2. Concluir la instancia de examen de grado
      const resultadoGeneral = data.nota >= 51 ? 'APROBADO' : 'REPROBADO';
      await tx.instanciaExamenGrado.update({
        where: { idInstancia: updated.idInstancia },
        data: {
          estadoInstancia: 'CONCLUIDA',
          resultado: resultadoGeneral,
        },
      });

      // 3. Concluir el proceso general del estudiante si aprobó
      if (data.nota >= 51) {
        await tx.procesoExamenGrado.update({
          where: { idProceso: updated.instancia.idProceso },
          data: {
            estadoProceso: 'CONCLUIDO',
          },
        });
      }

      // 4. Asentar registro inmutable de auditoría
      await tx.registroAuditoria.create({
        data: {
          idUsuario: idUsuario ?? null,
          idDefensa,
          idInstancia: updated.idInstancia,
          idProceso: updated.instancia.idProceso,
          tipoOperacion: 'REGISTRO_CALIFICACION',
          descripcion: `Calificación oficial registrada: ${data.nota}/100 pts (${data.resultado})`,
          valorNuevo: {
            nota: data.nota,
            resultado: data.resultado,
            estadoDefensa,
            tribunal: data.tribunal,
            observaciones: data.observaciones,
          },
        },
      });

      return updated;
    });
  }

  /**
   * Obtiene el resumen del embudo de estados (Pipeline).
   */
  async getEmbudoEstados(allowedCarreraIds?: bigint[]) {
    const where: Prisma.DefensaExamenGradoWhereInput = {};

    if (allowedCarreraIds && allowedCarreraIds.length > 0) {
      where.instancia = {
        proceso: {
          estudiante: {
            planEstudio: {
              idCarrera: { in: allowedCarreraIds },
            },
          },
        },
      };
    }

    const counts = await this.prisma.defensaExamenGrado.groupBy({
      by: ['estadoDefensa'],
      where,
      _count: { idDefensa: true },
    });

    const mapaEstados: Record<string, number> = {
      PROGRAMADA: 0,
      AREA_SORTEADA: 0,
      CASO_ASIGNADO: 0,
      DEFENDIDO: 0,
      CALIFICADO: 0,
    };

    let total = 0;
    for (const c of counts) {
      mapaEstados[c.estadoDefensa] = c._count.idDefensa;
      total += c._count.idDefensa;
    }

    return {
      total,
      programados: mapaEstados.PROGRAMADA,
      areaSorteada: mapaEstados.AREA_SORTEADA,
      casoAsignado: mapaEstados.CASO_ASIGNADO,
      defendidos: mapaEstados.DEFENDIDO,
      calificados: mapaEstados.CALIFICADO,
    };
  }

  /**
   * Obtiene alertas operativas: postulantes con defensa próxima sin sorteo ejecutado.
   */
  async getAlertasOperativas(diasAnticipacion = 15, allowedCarreraIds?: bigint[]) {
    const ahora = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(ahora.getDate() + diasAnticipacion);

    const where: Prisma.DefensaExamenGradoWhereInput = {
      estadoDefensa: 'PROGRAMADA',
      fechaDefensa: {
        gte: ahora,
        lte: fechaLimite,
      },
    };

    if (allowedCarreraIds && allowedCarreraIds.length > 0) {
      where.instancia = {
        proceso: {
          estudiante: {
            planEstudio: {
              idCarrera: { in: allowedCarreraIds },
            },
          },
        },
      };
    }

    return this.prisma.defensaExamenGrado.findMany({
      where,
      orderBy: { fechaDefensa: 'asc' },
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
                          include: { facultad: true },
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
    });
  }
}
