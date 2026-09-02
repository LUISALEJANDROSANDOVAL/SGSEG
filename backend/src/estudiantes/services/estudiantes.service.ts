import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BulkEstudiantesInputDto,
  BulkEstudiantesResultDto,
  CreateEstudianteDto,
  FilterEstudiantesDto,
  RawEstudianteInputDto,
  UpdateEstudianteDto,
} from '../dto/estudiante.dto';
import {
  EstudiantesNormalizerService,
  NormalizedEstudiante,
} from './estudiantes-normalizer.service';
import { EstudiantesRepository } from '../repositories/estudiantes.repository';

@Injectable()
export class EstudiantesService {
  constructor(
    private readonly repository: EstudiantesRepository,
    private readonly normalizer: EstudiantesNormalizerService,
  ) {}

  /**
   * Procesa la normalización e inserción/actualización masiva transaccional de estudiantes.
   */
  async bulkUpsertEstudiantes(
    dto: BulkEstudiantesInputDto,
  ): Promise<BulkEstudiantesResultDto> {
    const startTime = Date.now();
    const result: BulkEstudiantesResultDto = {
      total: dto.estudiantes?.length ?? 0,
      creados: 0,
      actualizados: 0,
      planesCreados: 0,
      planesCreadosDetalle: [],
      errores: [],
      duracionMs: 0,
    };

    if (!dto.estudiantes || dto.estudiantes.length === 0) {
      result.duracionMs = Date.now() - startTime;
      return result;
    }

    // Cache local en memoria para evitar consultas redundantes de carreras y planes
    const carreraCache = new Map<string, bigint>();
    const planCache = new Map<string, bigint>();

    // 1. Resolver carrera por defecto si fue provista
    let defaultCarreraId: bigint | undefined;
    if (dto.idCarreraPorDefecto) {
      defaultCarreraId = BigInt(dto.idCarreraPorDefecto);
    } else if (dto.nombreCarreraPorDefecto) {
      const carrera = await this.repository.findCarreraByName(
        dto.nombreCarreraPorDefecto,
      );
      if (carrera) {
        defaultCarreraId = carrera.idCarrera;
        carreraCache.set(dto.nombreCarreraPorDefecto.toLowerCase(), carrera.idCarrera);
      }
    }

    // 2. Normalizar cada fila y preparar resolución de planes
    const normalizedRows: Array<{
      index: number;
      raw: RawEstudianteInputDto;
      normalized: NormalizedEstudiante;
    }> = [];

    for (let i = 0; i < dto.estudiantes.length; i++) {
      const raw = dto.estudiantes[i];
      try {
        const normalized = this.normalizer.normalizeRecord(raw);

        if (!normalized.carnetEstudiantil) {
          result.errores.push({
            indice: i,
            mensaje: 'Fila omitida: Carnet estudiantil no válido o vacío.',
          });
          continue;
        }

        if (!normalized.carnetIdentidad) {
          result.errores.push({
            indice: i,
            carnet: normalized.carnetEstudiantil,
            mensaje: 'Fila omitida: Carnet de identidad no válido o vacío.',
          });
          continue;
        }

        if (!normalized.nombreCompleto) {
          result.errores.push({
            indice: i,
            carnet: normalized.carnetEstudiantil,
            mensaje: 'Fila omitida: Nombre completo no válido o vacío.',
          });
          continue;
        }

        normalizedRows.push({ index: i, raw, normalized });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error de normalización';
        result.errores.push({
          indice: i,
          mensaje: `Error al procesar fila: ${msg}`,
        });
      }
    }

    // 3. Resolver y crear planes de estudio necesarios
    const validPreparedItems: Array<{
      index: number;
      carnetEstudiantil: string;
      carnetIdentidad: string;
      nombreCompleto: string;
      correo: string;
      estado: string;
      idPlanEstudio: bigint;
    }> = [];

    for (const item of normalizedRows) {
      const norm = item.normalized;

      try {
        let finalPlanId: bigint | undefined = norm.idPlanEstudio;

        if (!finalPlanId) {
          // Resolver ID de Carrera
          let carreraId = norm.idCarrera ?? defaultCarreraId;

          if (!carreraId && norm.nombreCarrera) {
            const cacheKey = norm.nombreCarrera.toLowerCase();
            if (carreraCache.has(cacheKey)) {
              carreraId = carreraCache.get(cacheKey);
            } else {
              const carreraDb = await this.repository.findCarreraByName(norm.nombreCarrera);
              if (carreraDb) {
                carreraId = carreraDb.idCarrera;
                carreraCache.set(cacheKey, carreraDb.idCarrera);
              }
            }
          }

          if (!carreraId) {
            result.errores.push({
              indice: item.index,
              carnet: norm.carnetEstudiantil,
              mensaje:
                'No se pudo determinar la carrera ni el plan de estudio para el estudiante.',
            });
            continue;
          }

          // Resolver Plan de Estudio para la carrera
          const planKey = `${carreraId}:${(norm.nombrePlanEstudio ?? dto.nombrePlanPorDefecto ?? 'DEFAULT').toLowerCase()}`;

          if (planCache.has(planKey)) {
            finalPlanId = planCache.get(planKey);
          } else {
            const planTargetName = norm.nombrePlanEstudio ?? dto.nombrePlanPorDefecto;

            if (planTargetName) {
              const existingPlan = await this.repository.findPlanByCarreraAndNombre(
                carreraId,
                planTargetName,
              );

              if (existingPlan) {
                finalPlanId = existingPlan.idPlanEstudio;
              } else if (dto.crearPlanesFaltantes !== false) {
                // Auto-crear plan de estudio para la carrera
                const createdPlan = await this.repository.createPlanEstudio(
                  carreraId,
                  planTargetName,
                  'VIGENTE',
                );
                finalPlanId = createdPlan.idPlanEstudio;
                result.planesCreados++;
                result.planesCreadosDetalle.push({
                  idPlanEstudio: String(createdPlan.idPlanEstudio),
                  idCarrera: String(carreraId),
                  nombre: createdPlan.nombre,
                  estadoVigencia: createdPlan.estadoVigencia,
                });
              } else {
                // Si no se deben crear, buscar plan por defecto de la carrera
                const defaultPlan = await this.repository.findDefaultPlanByCarrera(carreraId);
                if (defaultPlan) {
                  finalPlanId = defaultPlan.idPlanEstudio;
                }
              }
            } else {
              // Buscar plan por defecto o vigente de la carrera
              const defaultPlan = await this.repository.findDefaultPlanByCarrera(carreraId);
              if (defaultPlan) {
                finalPlanId = defaultPlan.idPlanEstudio;
              } else if (dto.crearPlanesFaltantes !== false) {
                const currentYear = new Date().getFullYear();
                const defaultName = `PLAN GENERAL (${currentYear})`;
                const createdPlan = await this.repository.createPlanEstudio(
                  carreraId,
                  defaultName,
                  'VIGENTE',
                );
                finalPlanId = createdPlan.idPlanEstudio;
                result.planesCreados++;
                result.planesCreadosDetalle.push({
                  idPlanEstudio: String(createdPlan.idPlanEstudio),
                  idCarrera: String(carreraId),
                  nombre: createdPlan.nombre,
                  estadoVigencia: createdPlan.estadoVigencia,
                });
              }
            }

            if (finalPlanId) {
              planCache.set(planKey, finalPlanId);
            }
          }
        }

        if (!finalPlanId) {
          result.errores.push({
            indice: item.index,
            carnet: norm.carnetEstudiantil,
            mensaje: 'No se encontró ni pudo crearse un plan de estudio válido.',
          });
          continue;
        }

        validPreparedItems.push({
          index: item.index,
          carnetEstudiantil: norm.carnetEstudiantil,
          carnetIdentidad: norm.carnetIdentidad,
          nombreCompleto: norm.nombreCompleto,
          correo: norm.correo,
          estado: norm.estado,
          idPlanEstudio: finalPlanId,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al resolver plan';
        result.errores.push({
          indice: item.index,
          carnet: norm.carnetEstudiantil,
          mensaje: `Error al preparar datos: ${msg}`,
        });
      }
    }

    // 4. Inserción / Upsert transaccional por bloques (chunks)
    const batchSize = dto.batchSize && dto.batchSize > 0 ? dto.batchSize : 50;

    for (let i = 0; i < validPreparedItems.length; i += batchSize) {
      const chunk = validPreparedItems.slice(i, i + batchSize);

      try {
        await this.repository.executeInTransaction(async (tx) => {
          for (const student of chunk) {
            const { isNew } = await this.repository.upsertEstudianteInTx(tx, {
              idPlanEstudio: student.idPlanEstudio,
              carnetEstudiantil: student.carnetEstudiantil,
              carnetIdentidad: student.carnetIdentidad,
              nombreCompleto: student.nombreCompleto,
              correo: student.correo,
              estado: student.estado,
            });

            if (isNew) {
              result.creados++;
            } else {
              result.actualizados++;
            }
          }
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error en transacción de lote';
        for (const failedItem of chunk) {
          result.errores.push({
            indice: failedItem.index,
            carnet: failedItem.carnetEstudiantil,
            mensaje: `Fallo en inserción transaccional de bloque: ${msg}`,
          });
        }
      }
    }

    result.duracionMs = Date.now() - startTime;
    return result;
  }

  /**
   * Crea o actualiza individualmente un estudiante.
   */
  async create(dto: CreateEstudianteDto) {
    const norm = this.normalizer.normalizeRecord({
      carnetEstudiantil: dto.carnetEstudiantil,
      carnetIdentidad: dto.carnetIdentidad,
      nombreCompleto: dto.nombreCompleto,
      correo: dto.correo,
      idCarrera: dto.idCarrera,
      idPlanEstudio: dto.idPlanEstudio,
      nombrePlanEstudio: dto.nombrePlanEstudio,
      estado: dto.estado,
    });

    let planId: bigint | undefined = norm.idPlanEstudio;

    if (!planId) {
      if (!norm.idCarrera) {
        throw new BadRequestException(
          'Debe especificar un idPlanEstudio o un idCarrera válido.',
        );
      }

      const defaultPlan = await this.repository.findDefaultPlanByCarrera(
        norm.idCarrera,
      );

      if (defaultPlan) {
        planId = defaultPlan.idPlanEstudio;
      } else {
        const currentYear = new Date().getFullYear();
        const createdPlan = await this.repository.createPlanEstudio(
          norm.idCarrera,
          norm.nombrePlanEstudio ?? `PLAN GENERAL (${currentYear})`,
          'VIGENTE',
        );
        planId = createdPlan.idPlanEstudio;
      }
    }

    const { record, isNew } = await this.repository.executeInTransaction((tx) =>
      this.repository.upsertEstudianteInTx(tx, {
        idPlanEstudio: planId!,
        carnetEstudiantil: norm.carnetEstudiantil,
        carnetIdentidad: norm.carnetIdentidad,
        nombreCompleto: norm.nombreCompleto,
        correo: norm.correo,
        estado: norm.estado,
      }),
    );

    return {
      operacion: isNew ? 'CREADO' : 'ACTUALIZADO',
      estudiante: this.serializeBigInt(record),
    };
  }

  /**
   * Obtiene la lista de estudiantes filtrada por carrera, plan, estado y término de búsqueda.
   */
  async findAll(filter: FilterEstudiantesDto) {
    const page = Math.max(1, Number(filter.page ?? 1));
    const limit = Math.max(1, Math.min(100, Number(filter.limit ?? 20)));
    const skip = (page - 1) * limit;

    const idCarrera = filter.idCarrera ? BigInt(filter.idCarrera) : undefined;
    const idPlanEstudio = filter.idPlanEstudio
      ? BigInt(filter.idPlanEstudio)
      : undefined;

    const [items, total] = await Promise.all([
      this.repository.findMany({
        idCarrera,
        idPlanEstudio,
        search: filter.search,
        estado: filter.estado,
        incluirEliminados: filter.incluirEliminados,
        skip,
        take: limit,
      }),
      this.repository.count({
        idCarrera,
        idPlanEstudio,
        search: filter.search,
        estado: filter.estado,
        incluirEliminados: filter.incluirEliminados,
      }),
    ]);

    return {
      items: items.map((item) => this.serializeBigInt(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca un estudiante por su carnet estudiantil.
   */
  async findByCarnet(carnetEstudiantil: string) {
    const normalizedCarnet = this.normalizer.normalizeCarnet(carnetEstudiantil);
    const estudiante = await this.repository.findByCarnetEstudiantil(normalizedCarnet);

    if (!estudiante) {
      throw new NotFoundException(
        `Estudiante con carnet ${carnetEstudiantil} no encontrado`,
      );
    }

    return this.serializeBigInt(estudiante);
  }

  /**
   * Busca un estudiante por su ID primario.
   */
  async findById(idEstudiante: number | string | bigint) {
    const estudiante = await this.repository.findById(BigInt(idEstudiante));

    if (!estudiante) {
      throw new NotFoundException(
        `Estudiante con ID ${idEstudiante} no encontrado`,
      );
    }

    return this.serializeBigInt(estudiante);
  }

  /**
   * Actualiza los datos de un estudiante.
   */
  async update(idEstudiante: number | string | bigint, dto: UpdateEstudianteDto) {
    const id = BigInt(idEstudiante);
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Estudiante con ID ${idEstudiante} no encontrado`);
    }

    const data: {
      idPlanEstudio?: bigint;
      carnetIdentidad?: string;
      nombreCompleto?: string;
      correo?: string;
      estado?: string;
    } = {};

    if (dto.idPlanEstudio) data.idPlanEstudio = BigInt(dto.idPlanEstudio);
    if (dto.carnetIdentidad) data.carnetIdentidad = this.normalizer.normalizeCi(dto.carnetIdentidad);
    if (dto.nombreCompleto) data.nombreCompleto = this.normalizer.normalizeNombreCompleto(dto.nombreCompleto);
    if (dto.correo) data.correo = this.normalizer.normalizeCorreo(dto.correo);
    if (dto.estado) data.estado = dto.estado.trim().toUpperCase();

    const result = await this.repository.executeInTransaction((tx) =>
      tx.estudiante.update({
        where: { idEstudiante: id },
        data,
        include: {
          planEstudio: {
            include: {
              carrera: {
                include: { facultad: true },
              },
            },
          },
        },
      }),
    );

    return this.serializeBigInt(result);
  }

  /**
   * Soft-delete de un estudiante (marca su estado como 'ELIMINADO' para preservar el historial).
   */
  async softDelete(idEstudiante: number | string | bigint) {
    const id = BigInt(idEstudiante);
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Estudiante con ID ${idEstudiante} no encontrado`);
    }

    const updated = await this.repository.softDelete(id);
    return {
      mensaje: `Estudiante ${existing.carnetEstudiantil} desactivado/eliminado correctamente (soft delete).`,
      estudiante: this.serializeBigInt(updated),
    };
  }

  /**
   * Restaura un estudiante con soft-delete previo.
   */
  async restore(idEstudiante: number | string | bigint) {
    const id = BigInt(idEstudiante);
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Estudiante con ID ${idEstudiante} no encontrado`);
    }

    const updated = await this.repository.restore(id);
    return {
      mensaje: `Estudiante ${existing.carnetEstudiantil} restaurado a estado ACTIVO.`,
      estudiante: this.serializeBigInt(updated),
    };
  }

  /**
   * Obtiene la lista de todas las carreras con sus facultades y planes vigentes.
   */
  async getCarreras() {
    const carreras = await this.repository.findCarrerasWithPlans();
    return carreras.map((c) => this.serializeBigInt(c));
  }

  /**
   * Serializa objetos con campos BigInt a string para compatibilidad JSON.
   */
  private serializeBigInt<T = any>(obj: unknown): T {
    return JSON.parse(
      JSON.stringify(obj, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    ) as T;
  }
}
