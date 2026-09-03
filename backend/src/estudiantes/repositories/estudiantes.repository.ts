import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prisma.service';

export interface EstudianteQueryFilter {
  idCarrera?: bigint;
  idPlanEstudio?: bigint;
  search?: string;
  estado?: string;
  incluirEliminados?: boolean;
  skip?: number;
  take?: number;
}

@Injectable()
export class EstudiantesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta una serie de operaciones dentro de una transacción aislada de Prisma.
   */
  async executeInTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    timeoutMs = 30000,
  ): Promise<T> {
    return this.prisma.$transaction(fn, {
      maxWait: 5000,
      timeout: timeoutMs,
    });
  }

  /**
   * Obtiene todas las carreras con sus facultades y planes vigentes.
   */
  async findCarrerasWithPlans() {
    return this.prisma.carrera.findMany({
      include: {
        facultad: true,
        planesEstudio: {
          where: { estadoVigencia: 'VIGENTE' },
          orderBy: { nombre: 'asc' },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Busca una carrera por su ID numérico.
   */
  async findCarreraById(idCarrera: bigint) {
    return this.prisma.carrera.findUnique({
      where: { idCarrera },
      include: { facultad: true },
    });
  }

  /**
   * Busca una carrera por nombre (búsqueda insensible a mayúsculas/minúsculas).
   */
  async findCarreraByName(nombre: string) {
    return this.prisma.carrera.findFirst({
      where: {
        nombre: {
          equals: nombre.trim(),
          mode: 'insensitive',
        },
      },
      include: { facultad: true },
    });
  }

  /**
   * Busca un plan de estudio por su ID.
   */
  async findPlanById(idPlanEstudio: bigint) {
    return this.prisma.planEstudio.findUnique({
      where: { idPlanEstudio },
      include: { carrera: { include: { facultad: true } } },
    });
  }

  /**
   * Busca un plan de estudio por carrera y nombre exacto o insensible.
   */
  async findPlanByCarreraAndNombre(idCarrera: bigint, nombre: string) {
    return this.prisma.planEstudio.findFirst({
      where: {
        idCarrera,
        nombre: {
          equals: nombre.trim(),
          mode: 'insensitive',
        },
      },
      include: { carrera: true },
    });
  }

  /**
   * Obtiene el plan por defecto o primer plan vigente de una carrera.
   */
  async findDefaultPlanByCarrera(idCarrera: bigint) {
    return this.prisma.planEstudio.findFirst({
      where: {
        idCarrera,
        estadoVigencia: 'VIGENTE',
      },
      orderBy: { idPlanEstudio: 'asc' },
      include: { carrera: true },
    });
  }

  /**
   * Crea un nuevo plan de estudio asociado a una carrera.
   */
  async createPlanEstudio(
    idCarrera: bigint,
    nombre: string,
    estadoVigencia = 'VIGENTE',
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.planEstudio.create({
      data: {
        idCarrera,
        nombre: nombre.trim(),
        estadoVigencia,
      },
      include: { carrera: true },
    });
  }

  /**
   * Realiza un upsert transaccional de un estudiante utilizando carnetEstudiantil como clave única.
   */
  async upsertEstudianteInTx(
    tx: Prisma.TransactionClient,
    data: {
      idPlanEstudio: bigint;
      carnetEstudiantil: string;
      carnetIdentidad: string;
      nombreCompleto: string;
      correo: string;
      estado?: string;
    },
  ) {
    const existing = await tx.estudiante.findUnique({
      where: { carnetEstudiantil: data.carnetEstudiantil },
    });

    const isNew = !existing;

    const result = await tx.estudiante.upsert({
      where: { carnetEstudiantil: data.carnetEstudiantil },
      create: {
        idPlanEstudio: data.idPlanEstudio,
        carnetEstudiantil: data.carnetEstudiantil,
        carnetIdentidad: data.carnetIdentidad,
        nombreCompleto: data.nombreCompleto,
        correo: data.correo,
        estado: data.estado ?? 'ACTIVO',
      },
      update: {
        idPlanEstudio: data.idPlanEstudio,
        carnetIdentidad: data.carnetIdentidad,
        nombreCompleto: data.nombreCompleto,
        correo: data.correo,
        estado: data.estado ?? 'ACTIVO',
      },
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

    return { record: result, isNew };
  }

  /**
   * Busca un estudiante por su carnet estudiantil único.
   */
  async findByCarnetEstudiantil(carnetEstudiantil: string) {
    return this.prisma.estudiante.findUnique({
      where: { carnetEstudiantil },
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
   * Busca un estudiante por su ID de base de datos.
   */
  async findById(idEstudiante: bigint) {
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
   * Construye la condición WHERE de Prisma para filtros y búsqueda de estudiantes.
   */
  private buildWhereClause(
    filter: EstudianteQueryFilter,
  ): Prisma.EstudianteWhereInput {
    const where: Prisma.EstudianteWhereInput = {};

    if (!filter.incluirEliminados) {
      if (filter.estado) {
        where.estado = filter.estado;
      } else {
        where.estado = { not: 'ELIMINADO' };
      }
    } else if (filter.estado) {
      where.estado = filter.estado;
    }

    if (filter.idPlanEstudio) {
      where.idPlanEstudio = filter.idPlanEstudio;
    }

    if (filter.idCarrera) {
      where.planEstudio = {
        idCarrera: filter.idCarrera,
      };
    }

    if (filter.search && filter.search.trim().length > 0) {
      const term = filter.search.trim();
      where.OR = [
        { carnetEstudiantil: { contains: term, mode: 'insensitive' } },
        { carnetIdentidad: { contains: term, mode: 'insensitive' } },
        { nombreCompleto: { contains: term, mode: 'insensitive' } },
        { correo: { contains: term, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Consulta estudiantes con paginación, filtros por carrera, plan y búsqueda.
   */
  async findMany(filter: EstudianteQueryFilter) {
    const where = this.buildWhereClause(filter);

    return this.prisma.estudiante.findMany({
      where,
      skip: filter.skip,
      take: filter.take,
      orderBy: { nombreCompleto: 'asc' },
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
   * Cuenta la cantidad total de estudiantes que cumplen con el filtro.
   */
  async count(filter: EstudianteQueryFilter): Promise<number> {
    const where = this.buildWhereClause(filter);
    return this.prisma.estudiante.count({ where });
  }

  /**
   * Realiza un soft-delete cambiando el estado a 'ELIMINADO' para preservar el historial.
   */
  async softDelete(idEstudiante: bigint) {
    return this.prisma.estudiante.update({
      where: { idEstudiante },
      data: { estado: 'ELIMINADO' },
    });
  }

  /**
   * Restaura un estudiante previamente marcado como 'ELIMINADO'.
   */
  async restore(idEstudiante: bigint) {
    return this.prisma.estudiante.update({
      where: { idEstudiante },
      data: { estado: 'ACTIVO' },
    });
  }
}
