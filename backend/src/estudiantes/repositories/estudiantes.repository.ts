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
  allowedCarreraIds?: bigint[];
}

@Injectable()
export class EstudiantesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene los IDs de carreras asignadas al usuario.
   */
  async getUserCarreraIds(idUsuario: bigint): Promise<bigint[]> {
    const uc = await this.prisma.usuarioCarrera.findMany({
      where: { idUsuario },
      select: { idCarrera: true },
    });
    return uc.map((r) => r.idCarrera);
  }

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
  async findCarrerasWithPlans(allowedCarreraIds?: bigint[]) {
    const where: Prisma.CarreraWhereInput = {};
    if (allowedCarreraIds && allowedCarreraIds.length > 0) {
      where.idCarrera = { in: allowedCarreraIds };
    }

    return this.prisma.carrera.findMany({
      where,
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
   * Busca una carrera por nombre (búsqueda insensible a mayúsculas/minúsculas y tildes).
   */
  async findCarreraByName(nombre: string) {
    const clean = nombre.trim();
    if (!clean) return null;

    // 1. Coincidencia directa insensible
    const direct = await this.prisma.carrera.findFirst({
      where: {
        nombre: {
          equals: clean,
          mode: 'insensitive',
        },
      },
      include: { facultad: true },
    });
    if (direct) return direct;

    // 2. Coincidencia parcial insensible en base de datos
    const partial = await this.prisma.carrera.findFirst({
      where: {
        nombre: {
          contains: clean,
          mode: 'insensitive',
        },
      },
      include: { facultad: true },
    });
    if (partial) return partial;

    // 3. Coincidencia normalizando tildes y caracteres especiales
    const stripAccents = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const targetNormalized = stripAccents(clean);
    const todas = await this.prisma.carrera.findMany({
      include: { facultad: true },
    });

    for (const c of todas) {
      const cNorm = stripAccents(c.nombre);
      if (
        cNorm === targetNormalized ||
        cNorm.includes(targetNormalized) ||
        targetNormalized.includes(cNorm)
      ) {
        return c;
      }
      // Manejo de siglas y atajos comunes
      if (
        (targetNormalized === 'adm' || targetNormalized.includes('administracion')) &&
        cNorm.includes('administracion')
      ) {
        return c;
      }
      if (
        (targetNormalized === 'ico' || targetNormalized.includes('comercial')) &&
        cNorm.includes('comercial')
      ) {
        return c;
      }
      if (
        (targetNormalized === 'cpa' || targetNormalized.includes('contaduria') || targetNormalized.includes('auditoria')) &&
        cNorm.includes('contaduria')
      ) {
        return c;
      }
      if (
        (targetNormalized === 'ifi' || targetNormalized.includes('financiera')) &&
        cNorm.includes('financiera')
      ) {
        return c;
      }
      if (
        (targetNormalized === 'sis' || targetNormalized.includes('sistemas')) &&
        cNorm.includes('sistemas')
      ) {
        return c;
      }
    }

    return null;
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
    const clean = nombre.trim();
    if (!clean) return null;

    const direct = await this.prisma.planEstudio.findFirst({
      where: {
        idCarrera,
        nombre: {
          equals: clean,
          mode: 'insensitive',
        },
      },
      include: { carrera: true },
    });
    if (direct) return direct;

    const partial = await this.prisma.planEstudio.findFirst({
      where: {
        idCarrera,
        nombre: {
          contains: clean,
          mode: 'insensitive',
        },
      },
      include: { carrera: true },
    });
    if (partial) return partial;

    // Si el texto contiene el año (ej. "2026"), buscar planes que contengan ese año
    const yearMatch = clean.match(/\d{4}/);
    if (yearMatch) {
      const year = yearMatch[0];
      const byYear = await this.prisma.planEstudio.findFirst({
        where: {
          idCarrera,
          nombre: {
            contains: year,
            mode: 'insensitive',
          },
        },
        include: { carrera: true },
      });
      if (byYear) return byYear;
    }

    return null;
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
      correoInstitucional: string;
      correoPersonal?: string | null;
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
        correoInstitucional: data.correoInstitucional,
        correoPersonal: data.correoPersonal ?? null,
        estado: data.estado ?? 'ACTIVO',
      },
      update: {
        idPlanEstudio: data.idPlanEstudio,
        carnetIdentidad: data.carnetIdentidad,
        nombreCompleto: data.nombreCompleto,
        correoInstitucional: data.correoInstitucional,
        ...(data.correoPersonal !== undefined ? { correoPersonal: data.correoPersonal } : {}),
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

    if (filter.allowedCarreraIds && filter.allowedCarreraIds.length > 0) {
      if (filter.idCarrera) {
        if (filter.allowedCarreraIds.includes(filter.idCarrera)) {
          where.planEstudio = { idCarrera: filter.idCarrera };
        } else {
          where.idEstudiante = BigInt(-1);
          return where;
        }
      } else {
        where.planEstudio = { idCarrera: { in: filter.allowedCarreraIds } };
      }
    } else if (filter.idCarrera) {
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
        { correoInstitucional: { contains: term, mode: 'insensitive' } },
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
