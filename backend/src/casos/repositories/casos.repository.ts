import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prisma.service';

export interface CasoFilterOptions {
  idCarrera?: bigint;
  idArea?: bigint;
  estado?: string;
  search?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class CasosRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene los IDs de las carreras asignadas a un usuario en usuario_carrera.
   */
  async getUserCarreraIds(idUsuario: bigint): Promise<bigint[]> {
    const records = await this.prisma.usuarioCarrera.findMany({
      where: { idUsuario },
      select: { idCarrera: true },
    });
    return records.map((r) => r.idCarrera);
  }

  /**
   * Construye el predicado WHERE para casos respetando filtros y carreras permitidas.
   */
  private buildWhereClause(
    filter: CasoFilterOptions,
    allowedCarreraIds?: bigint[],
  ): Prisma.CasoEstudioWhereInput {
    const where: Prisma.CasoEstudioWhereInput = {};

    // Restricción por rol (Jefe de Carrera o filtro por carrera)
    if (allowedCarreraIds && allowedCarreraIds.length > 0) {
      if (filter.idCarrera) {
        if (allowedCarreraIds.includes(filter.idCarrera)) {
          where.area = { idCarrera: filter.idCarrera };
        } else {
          // No tiene acceso a la carrera solicitada -> condición imposible
          where.idCasoEstudio = BigInt(-1);
          return where;
        }
      } else {
        where.area = { idCarrera: { in: allowedCarreraIds } };
      }
    } else if (filter.idCarrera) {
      where.area = { idCarrera: filter.idCarrera };
    }

    if (filter.idArea) {
      where.idArea = filter.idArea;
    }

    if (filter.estado && filter.estado !== 'ALL') {
      where.estado = filter.estado;
    }

    if (filter.search && filter.search.trim().length > 0) {
      const term = filter.search.trim();
      where.OR = [
        { titulo: { contains: term, mode: 'insensitive' } },
        { contenido: { contains: term, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Consulta casos de estudio con paginación, filtros y conteo de usos.
   */
  async findCasos(filter: CasoFilterOptions, allowedCarreraIds?: bigint[]) {
    const where = this.buildWhereClause(filter, allowedCarreraIds);

    return this.prisma.casoEstudio.findMany({
      where,
      skip: filter.skip,
      take: filter.take,
      orderBy: { idCasoEstudio: 'desc' },
      include: {
        area: {
          include: {
            carrera: {
              include: { facultad: true },
            },
          },
        },
        _count: {
          select: {
            defensas: true,
            sorteosCaso: true,
          },
        },
      },
    });
  }

  /**
   * Cuenta total de casos bajo los filtros provistos.
   */
  async countCasos(filter: CasoFilterOptions, allowedCarreraIds?: bigint[]): Promise<number> {
    const where = this.buildWhereClause(filter, allowedCarreraIds);
    return this.prisma.casoEstudio.count({ where });
  }

  /**
   * Busca un caso de estudio por ID con todos sus detalles y relaciones.
   */
  async findCasoById(idCasoEstudio: bigint) {
    return this.prisma.casoEstudio.findUnique({
      where: { idCasoEstudio },
      include: {
        area: {
          include: {
            carrera: {
              include: { facultad: true },
            },
          },
        },
        _count: {
          select: {
            defensas: true,
            sorteosCaso: true,
          },
        },
        defensas: {
          take: 5,
          orderBy: { fechaDefensa: 'desc' },
          include: {
            instancia: {
              include: {
                proceso: {
                  include: { estudiante: true },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Crea un caso de estudio registrando simultáneamente la auditoría.
   */
  async createCaso(
    data: {
      idArea: bigint;
      titulo: string;
      contenido: string;
      documentoAdjunto?: string;
      estado?: string;
    },
    idUsuario?: bigint,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const nuevoCaso = await tx.casoEstudio.create({
        data: {
          idArea: data.idArea,
          titulo: data.titulo.trim(),
          contenido: data.contenido.trim(),
          documentoAdjunto: data.documentoAdjunto?.trim(),
          estado: data.estado ?? 'DISPONIBLE',
        },
        include: {
          area: {
            include: {
              carrera: {
                include: { facultad: true },
              },
            },
          },
        },
      });

      // Auditoría automática
      await tx.registroAuditoria.create({
        data: {
          idUsuario: idUsuario ?? null,
          idCasoEstudio: nuevoCaso.idCasoEstudio,
          tipoOperacion: 'CREACION_CASO_ESTUDIO',
          descripcion: `Creación de caso de estudio: "${nuevoCaso.titulo}" en el área ${nuevoCaso.area.nombre}`,
          valorNuevo: {
            idCasoEstudio: String(nuevoCaso.idCasoEstudio),
            titulo: nuevoCaso.titulo,
            idArea: String(nuevoCaso.idArea),
            estado: nuevoCaso.estado,
          },
        },
      });

      return nuevoCaso;
    });
  }

  /**
   * Actualiza un caso de estudio con registro de auditoría del valor anterior y nuevo.
   */
  async updateCaso(
    idCasoEstudio: bigint,
    data: {
      idArea?: bigint;
      titulo?: string;
      contenido?: string;
      estado?: string;
      documentoAdjunto?: string;
    },
    idUsuario?: bigint,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const anterior = await tx.casoEstudio.findUnique({
        where: { idCasoEstudio },
      });

      const casoActualizado = await tx.casoEstudio.update({
        where: { idCasoEstudio },
        data: {
          idArea: data.idArea,
          titulo: data.titulo?.trim(),
          contenido: data.contenido?.trim(),
          estado: data.estado,
          documentoAdjunto: data.documentoAdjunto?.trim(),
        },
        include: {
          area: {
            include: {
              carrera: {
                include: { facultad: true },
              },
            },
          },
          _count: {
            select: { defensas: true, sorteosCaso: true },
          },
        },
      });

      await tx.registroAuditoria.create({
        data: {
          idUsuario: idUsuario ?? null,
          idCasoEstudio,
          tipoOperacion: 'ACTUALIZACION_CASO_ESTUDIO',
          descripcion: `Actualización de caso de estudio ID ${idCasoEstudio} (${casoActualizado.titulo})`,
          valorAnterior: anterior
            ? {
                titulo: anterior.titulo,
                idArea: String(anterior.idArea),
                estado: anterior.estado,
              }
            : undefined,
          valorNuevo: {
            titulo: casoActualizado.titulo,
            idArea: String(casoActualizado.idArea),
            estado: casoActualizado.estado,
          },
        },
      });

      return casoActualizado;
    });
  }

  /**
   * Alterna o cambia el estado de un caso (ej. INACTIVO / DISPONIBLE).
   */
  async setEstadoCaso(idCasoEstudio: bigint, nuevoEstado: string, idUsuario?: bigint) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.casoEstudio.update({
        where: { idCasoEstudio },
        data: { estado: nuevoEstado },
        include: {
          area: {
            include: { carrera: true },
          },
        },
      });

      await tx.registroAuditoria.create({
        data: {
          idUsuario: idUsuario ?? null,
          idCasoEstudio,
          tipoOperacion: 'CAMBIO_ESTADO_CASO',
          descripcion: `Cambio de estado del caso ID ${idCasoEstudio} a ${nuevoEstado}`,
          valorNuevo: { estado: nuevoEstado },
        },
      });

      return updated;
    });
  }

  /**
   * Busca un área académica por ID con su carrera y facultad.
   */
  async findAreaById(idArea: bigint) {
    return this.prisma.areaAcademica.findUnique({
      where: { idArea },
      include: {
        carrera: {
          include: { facultad: true },
        },
      },
    });
  }

  /**
   * Obtiene la lista de áreas académicas activas respetando carrera o filtros.
   */
  async findAreas(idCarrera?: bigint, allowedCarreraIds?: bigint[]) {
    const where: Prisma.AreaAcademicaWhereInput = {
      estado: 'ACTIVO',
    };

    if (allowedCarreraIds && allowedCarreraIds.length > 0) {
      if (idCarrera) {
        if (allowedCarreraIds.includes(idCarrera)) {
          where.idCarrera = idCarrera;
        } else {
          where.idArea = BigInt(-1);
          return [];
        }
      } else {
        where.idCarrera = { in: allowedCarreraIds };
      }
    } else if (idCarrera) {
      where.idCarrera = idCarrera;
    }

    return this.prisma.areaAcademica.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        carrera: {
          include: { facultad: true },
        },
        _count: {
          select: {
            casos: {
              where: { estado: 'DISPONIBLE' },
            },
          },
        },
      },
    });
  }

  /**
   * Crea una nueva área académica para una carrera.
   */
  async createArea(data: { idCarrera: bigint; nombre: string; umbralDisponibilidad?: number }) {
    return this.prisma.areaAcademica.create({
      data: {
        idCarrera: data.idCarrera,
        nombre: data.nombre.trim(),
        umbralDisponibilidad: data.umbralDisponibilidad ?? 2,
        estado: 'ACTIVO',
      },
      include: { carrera: true },
    });
  }

  /**
   * Obtiene las métricas generales y alertas de stock crítico por área.
   */
  async getMetricas(idCarrera?: bigint, allowedCarreraIds?: bigint[]) {
    const areaWhere: Prisma.AreaAcademicaWhereInput = { estado: 'ACTIVO' };

    if (allowedCarreraIds && allowedCarreraIds.length > 0) {
      if (idCarrera && allowedCarreraIds.includes(idCarrera)) {
        areaWhere.idCarrera = idCarrera;
      } else {
        areaWhere.idCarrera = { in: allowedCarreraIds };
      }
    } else if (idCarrera) {
      areaWhere.idCarrera = idCarrera;
    }

    const areas = await this.prisma.areaAcademica.findMany({
      where: areaWhere,
      include: {
        carrera: true,
        casos: {
          select: {
            idCasoEstudio: true,
            estado: true,
            _count: {
              select: { defensas: true, sorteosCaso: true },
            },
          },
        },
      },
    });

    let totalCasos = 0;
    let disponibles = 0;
    let agotados = 0;
    let inactivos = 0;
    const stockCritico: Array<{
      idArea: string;
      nombreArea: string;
      carrera: string;
      casosDisponibles: number;
      umbralRequerido: number;
      mensajeAlerta: string;
    }> = [];

    for (const area of areas) {
      let areaDisponibles = 0;

      for (const caso of area.casos) {
        totalCasos++;
        const totalUsos = caso._count.defensas + caso._count.sorteosCaso;

        if (caso.estado === 'INACTIVO') {
          inactivos++;
        } else if (caso.estado === 'AGOTADO' || totalUsos >= area.umbralDisponibilidad) {
          agotados++;
        } else {
          disponibles++;
          areaDisponibles++;
        }
      }

      // Alerta si el área tiene menos casos disponibles que su umbral mínimo
      if (areaDisponibles < area.umbralDisponibilidad) {
        stockCritico.push({
          idArea: String(area.idArea),
          nombreArea: area.nombre,
          carrera: area.carrera.nombre,
          casosDisponibles: areaDisponibles,
          umbralRequerido: area.umbralDisponibilidad,
          mensajeAlerta: `El área "${area.nombre}" (${area.carrera.nombre}) cuenta con ${areaDisponibles} caso(s) disponible(s), por debajo del umbral mínimo de ${area.umbralDisponibilidad}.`,
        });
      }
    }

    return {
      totalCasos,
      disponibles,
      agotados,
      inactivos,
      areasCubiertas: areas.length,
      stockCritico,
    };
  }
}
