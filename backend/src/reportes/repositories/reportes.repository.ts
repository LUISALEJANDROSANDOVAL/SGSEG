import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';

@Injectable()
export class ReportesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la estructura completa de Facultades, Carreras, Áreas y Casos
   * con filtros opcionales de facultad y carreras permitidas.
   */
  async getEstructuraAcademica(params: {
    idFacultad?: bigint;
    allowedCarreraIds?: bigint[];
    idCarrera?: bigint;
  }) {
    const facultadWhere: any = {};
    if (params.idFacultad) {
      facultadWhere.idFacultad = params.idFacultad;
    }

    const carreraWhere: any = {};
    if (params.idCarrera) {
      carreraWhere.idCarrera = params.idCarrera;
    } else if (params.allowedCarreraIds && params.allowedCarreraIds.length > 0) {
      carreraWhere.idCarrera = { in: params.allowedCarreraIds };
    }

    return this.prisma.facultad.findMany({
      where: facultadWhere,
      include: {
        carreras: {
          where: carreraWhere,
          include: {
            areasAcademicas: {
              where: { estado: 'ACTIVO' },
              include: {
                casos: {
                  select: {
                    idCasoEstudio: true,
                    estado: true,
                    _count: {
                      select: { defensas: true },
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
   * Consulta las defensas con sus notas y estados para el cálculo de KPIs ejecutivos.
   */
  async getDefensasMetricas(params: {
    idFacultad?: bigint;
    allowedCarreraIds?: bigint[];
    idCarrera?: bigint;
    periodoAcademico?: string;
  }) {
    const where: any = {};

    if (params.periodoAcademico) {
      where.periodoAcademico = params.periodoAcademico;
    }

    const carreraFilter: any = {};
    if (params.idCarrera) {
      carreraFilter.idCarrera = params.idCarrera;
    } else if (params.allowedCarreraIds && params.allowedCarreraIds.length > 0) {
      carreraFilter.idCarrera = { in: params.allowedCarreraIds };
    }

    if (params.idFacultad) {
      carreraFilter.idFacultad = params.idFacultad;
    }

    if (Object.keys(carreraFilter).length > 0) {
      where.instancia = {
        proceso: {
          estudiante: {
            planEstudio: {
              carrera: carreraFilter,
            },
          },
        },
      };
    }

    return this.prisma.defensaExamenGrado.findMany({
      where,
      select: {
        idDefensa: true,
        estadoDefensa: true,
        nota: true,
        resultado: true,
        periodoAcademico: true,
        instancia: {
          select: {
            proceso: {
              select: {
                estudiante: {
                  select: {
                    idEstudiante: true,
                    planEstudio: {
                      select: {
                        carrera: {
                          select: {
                            idCarrera: true,
                            nombre: true,
                            idFacultad: true,
                            facultad: {
                              select: {
                                idFacultad: true,
                                nombre: true,
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
      },
    });
  }

  /**
   * Conteo total de actas de sorteo emitidas según filtros de carrera.
   */
  async countActasEmitidas(allowedCarreraIds?: bigint[], idCarrera?: bigint) {
    const where: any = {};
    if (idCarrera) {
      where.estudiante = {
        planEstudio: { idCarrera },
      };
    } else if (allowedCarreraIds && allowedCarreraIds.length > 0) {
      where.estudiante = {
        planEstudio: { idCarrera: { in: allowedCarreraIds } },
      };
    }

    return this.prisma.asignacionCaso.count({ where });
  }

  /**
   * Obtiene las carreras asignadas a un usuario específico (para aislamiento RBAC).
   */
  async findCarrerasByUsuario(idUsuario: bigint): Promise<bigint[]> {
    const asignaciones = await this.prisma.usuarioCarrera.findMany({
      where: { idUsuario },
      select: { idCarrera: true },
    });
    return asignaciones.map((a) => a.idCarrera);
  }
}
