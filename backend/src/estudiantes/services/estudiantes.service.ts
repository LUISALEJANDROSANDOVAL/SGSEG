import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Readable } from 'stream';
import * as ExcelJS from 'exceljs';
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
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

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
    user?: AuthenticatedUser,
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
        carreraCache.set(
          dto.nombreCarreraPorDefecto.toLowerCase(),
          carrera.idCarrera,
        );
      }
    }

    // Validación de frontera de carrera para Jefe de Carrera
    if (user && user.rol === 'JEFE_CARRERA') {
      const allowedCarreraIds = await this.repository.getUserCarreraIds(
        BigInt(user.idUsuario),
      );
      if (allowedCarreraIds.length === 0) {
        throw new ForbiddenException(
          'No tienes carreras asignadas a tu cuenta de Jefe de Carrera.',
        );
      }
      if (defaultCarreraId && !allowedCarreraIds.includes(defaultCarreraId)) {
        throw new ForbiddenException(
          'No tienes permisos para realizar importaciones en una carrera ajena.',
        );
      }
      if (!defaultCarreraId && allowedCarreraIds.length > 0) {
        defaultCarreraId = allowedCarreraIds[0];
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
        const msg =
          err instanceof Error ? err.message : 'Error de normalización';
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
      correoInstitucional: string;
      correoPersonal?: string;
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
              const carreraDb = await this.repository.findCarreraByName(
                norm.nombreCarrera,
              );
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
            const planTargetName =
              norm.nombrePlanEstudio ?? dto.nombrePlanPorDefecto;

            if (planTargetName) {
              const existingPlan =
                await this.repository.findPlanByCarreraAndNombre(
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
                const defaultPlan =
                  await this.repository.findDefaultPlanByCarrera(carreraId);
                if (defaultPlan) {
                  finalPlanId = defaultPlan.idPlanEstudio;
                }
              }
            } else {
              // Buscar plan por defecto o vigente de la carrera
              const defaultPlan =
                await this.repository.findDefaultPlanByCarrera(carreraId);
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
            mensaje:
              'No se encontró ni pudo crearse un plan de estudio válido.',
          });
          continue;
        }

        validPreparedItems.push({
          index: item.index,
          carnetEstudiantil: norm.carnetEstudiantil,
          carnetIdentidad: norm.carnetIdentidad,
          nombreCompleto: norm.nombreCompleto,
          correoInstitucional: norm.correoInstitucional,
          correoPersonal: norm.correoPersonal,
          estado: norm.estado,
          idPlanEstudio: finalPlanId,
        });
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Error al resolver plan';
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
              correoInstitucional: student.correoInstitucional,
              correoPersonal: student.correoPersonal,
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
        const msg =
          err instanceof Error ? err.message : 'Error en transacción de lote';
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
  async create(dto: CreateEstudianteDto, user?: AuthenticatedUser) {
    if (user && user.rol === 'JEFE_CARRERA') {
      const allowed = await this.repository.getUserCarreraIds(
        BigInt(user.idUsuario),
      );

      if (dto.idCarrera && !allowed.includes(BigInt(dto.idCarrera))) {
        throw new ForbiddenException(
          'No tienes permisos para inscribir estudiantes en una carrera ajena a la tuya.',
        );
      }

      if (dto.idPlanEstudio) {
        const plan = await this.repository.findPlanById(BigInt(dto.idPlanEstudio));
        if (plan && !allowed.includes(plan.idCarrera)) {
          throw new ForbiddenException(
            'El plan de estudio seleccionado no pertenece a tu carrera asignada.',
          );
        }
      }

      // Si no especificó carrera ni plan, asignar automáticamente su primera carrera autorizada
      if (!dto.idCarrera && !dto.idPlanEstudio && allowed.length > 0) {
        dto.idCarrera = allowed[0].toString();
      }
    }

    const correoFinal = dto.correoInstitucional || (dto.correoPersonal ? undefined : dto.correo);

    const norm = this.normalizer.normalizeRecord({
      carnetEstudiantil: dto.carnetEstudiantil,
      carnetIdentidad: dto.carnetIdentidad,
      nombreCompleto: dto.nombreCompleto,
      correoInstitucional: correoFinal,
      correoPersonal: dto.correoPersonal,
      idCarrera: dto.idCarrera,
      idPlanEstudio: dto.idPlanEstudio,
      nombrePlanEstudio: dto.nombrePlanEstudio,
      estado: dto.estado,
    });

    let planId: bigint | undefined = norm.idPlanEstudio;

    if (planId) {
      const planExiste = await this.repository.findPlanById(planId);
      if (!planExiste) {
        planId = undefined; // El ID provisto no existe en BD, resolver por carrera
      }
    }

    if (!planId) {
      if (!norm.idCarrera) {
        throw new BadRequestException(
          'Debe especificar un idPlanEstudio o un idCarrera válido.',
        );
      }

      const carreraExiste = await this.repository.findCarreraById(norm.idCarrera);
      if (!carreraExiste) {
        throw new BadRequestException(
          'La carrera académica seleccionada no existe en el sistema.',
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
        idPlanEstudio: planId,
        carnetEstudiantil: norm.carnetEstudiantil,
        carnetIdentidad: norm.carnetIdentidad,
        nombreCompleto: norm.nombreCompleto,
        correoInstitucional: norm.correoInstitucional,
        correoPersonal: norm.correoPersonal ?? dto.correoPersonal ?? null,
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
  async findAll(filter: FilterEstudiantesDto, user?: AuthenticatedUser) {
    const page = Math.max(1, Number(filter.page ?? 1));
    const limit = Math.max(1, Math.min(100, Number(filter.limit ?? 20)));
    const skip = (page - 1) * limit;

    let allowedCarreraIds: bigint[] | undefined;
    if (user && user.rol === 'JEFE_CARRERA') {
      allowedCarreraIds = await this.repository.getUserCarreraIds(
        BigInt(user.idUsuario),
      );
      if (allowedCarreraIds.length === 0) {
        allowedCarreraIds = [BigInt(-1)];
      }
    }

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
        allowedCarreraIds,
      }),
      this.repository.count({
        idCarrera,
        idPlanEstudio,
        search: filter.search,
        estado: filter.estado,
        incluirEliminados: filter.incluirEliminados,
        allowedCarreraIds,
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
   * Busca un estudiante por su carnet estudiantil validando permisos de carrera.
   */
  async findByCarnet(carnetEstudiantil: string, user?: AuthenticatedUser) {
    const normalizedCarnet = this.normalizer.normalizeCarnet(carnetEstudiantil);
    const estudiante =
      await this.repository.findByCarnetEstudiantil(normalizedCarnet);

    if (!estudiante) {
      throw new NotFoundException(
        `Estudiante con carnet ${carnetEstudiantil} no encontrado`,
      );
    }

    if (user && user.rol === 'JEFE_CARRERA') {
      const allowed = await this.repository.getUserCarreraIds(
        BigInt(user.idUsuario),
      );
      if (!allowed.includes(estudiante.planEstudio.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para consultar estudiantes de otra carrera.',
        );
      }
    }

    return this.serializeBigInt(estudiante);
  }

  /**
   * Busca un estudiante por su ID primario validando permisos de carrera.
   */
  async findById(
    idEstudiante: number | string | bigint,
    user?: AuthenticatedUser,
  ) {
    const estudiante = await this.repository.findById(BigInt(idEstudiante));

    if (!estudiante) {
      throw new NotFoundException(
        `Estudiante con ID ${idEstudiante} no encontrado`,
      );
    }

    if (user && user.rol === 'JEFE_CARRERA') {
      const allowed = await this.repository.getUserCarreraIds(
        BigInt(user.idUsuario),
      );
      if (!allowed.includes(estudiante.planEstudio.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para consultar estudiantes de otra carrera.',
        );
      }
    }

    return this.serializeBigInt(estudiante);
  }

  /**
   * Actualiza los datos de un estudiante validando permisos de carrera.
   */
  async update(
    idEstudiante: number | string | bigint,
    dto: UpdateEstudianteDto,
    user?: AuthenticatedUser,
  ) {
    const id = BigInt(idEstudiante);
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException(
        `Estudiante con ID ${idEstudiante} no encontrado`,
      );
    }

    if (user && user.rol === 'JEFE_CARRERA') {
      const allowed = await this.repository.getUserCarreraIds(
        BigInt(user.idUsuario),
      );
      if (!allowed.includes(existing.planEstudio.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para modificar estudiantes de otra carrera.',
        );
      }
      if (dto.idPlanEstudio) {
        const targetPlan = await this.repository.findPlanById(
          BigInt(dto.idPlanEstudio),
        );
        if (targetPlan && !allowed.includes(targetPlan.idCarrera)) {
          throw new ForbiddenException(
            'No puedes reasignar al estudiante a un plan de otra carrera.',
          );
        }
      }
    }

    const data: {
      idPlanEstudio?: bigint;
      carnetIdentidad?: string;
      nombreCompleto?: string;
      correoInstitucional?: string;
      estado?: string;
    } = {};

    if (dto.idPlanEstudio) data.idPlanEstudio = BigInt(dto.idPlanEstudio);
    if (dto.carnetIdentidad)
      data.carnetIdentidad = this.normalizer.normalizeCi(dto.carnetIdentidad);
    if (dto.nombreCompleto)
      data.nombreCompleto = this.normalizer.normalizeNombreCompleto(
        dto.nombreCompleto,
      );
    if (dto.correoInstitucional) data.correoInstitucional = this.normalizer.normalizeCorreo(dto.correoInstitucional);
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
  async softDelete(
    idEstudiante: number | string | bigint,
    user?: AuthenticatedUser,
  ) {
    const id = BigInt(idEstudiante);
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException(
        `Estudiante con ID ${idEstudiante} no encontrado`,
      );
    }

    if (user && user.rol === 'JEFE_CARRERA') {
      const allowed = await this.repository.getUserCarreraIds(
        BigInt(user.idUsuario),
      );
      if (!allowed.includes(existing.planEstudio.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para eliminar estudiantes de otra carrera.',
        );
      }
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
  async restore(
    idEstudiante: number | string | bigint,
    user?: AuthenticatedUser,
  ) {
    const id = BigInt(idEstudiante);
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException(
        `Estudiante con ID ${idEstudiante} no encontrado`,
      );
    }

    if (user && user.rol === 'JEFE_CARRERA') {
      const allowed = await this.repository.getUserCarreraIds(
        BigInt(user.idUsuario),
      );
      if (!allowed.includes(existing.planEstudio.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para restaurar estudiantes de otra carrera.',
        );
      }
    }

    const updated = await this.repository.restore(id);
    return {
      mensaje: `Estudiante ${existing.carnetEstudiantil} restaurado a estado ACTIVO.`,
      estudiante: this.serializeBigInt(updated),
    };
  }

  /**
   * Obtiene la lista de carreras con sus facultades y planes vigentes (filtradas si es Jefe de Carrera).
   */
  async getCarreras(user?: AuthenticatedUser) {
    let allowedCarreraIds: bigint[] | undefined;
    if (user && user.rol === 'JEFE_CARRERA') {
      allowedCarreraIds = await this.repository.getUserCarreraIds(
        BigInt(user.idUsuario),
      );
    }
    const carreras = await this.repository.findCarrerasWithPlans(allowedCarreraIds);
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

  /**
   * Importa estudiantes desde un archivo Excel o CSV (Módulo 3).
   * Compatible con los formatos oficiales de la Facultad de Ciencias Empresariales, Coordinación y Secretaría.
   */
  async importarEstudiantesDesdeArchivo(
    file: any,
    opciones?: {
      idCarreraPorDefecto?: string;
      crearPlanesFaltantes?: boolean | string;
    },
    user?: AuthenticatedUser,
  ): Promise<BulkEstudiantesResultDto> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No se ha proporcionado ningún archivo para importar.');
    }

    const workbook = new ExcelJS.Workbook();
    let loaded = false;

    // 1. Intentar cargar como Excel (.xlsx)
    try {
      await workbook.xlsx.load(file.buffer);
      loaded = true;
    } catch {
      // Si falla, probar como CSV
    }

    // 2. Si no cargó como xlsx, intentar como CSV
    if (!loaded) {
      try {
        const stream = Readable.from(file.buffer);
        await workbook.csv.read(stream);
        loaded = true;
      } catch (err: unknown) {
        throw new BadRequestException(
          'El archivo no tiene un formato válido (.xlsx o .csv). Verifique el archivo.',
        );
      }
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet || worksheet.rowCount === 0) {
      throw new BadRequestException('El archivo no contiene filas o está vacío.');
    }

    // Función auxiliar para normalizar nombres de encabezados (sin acentos, minúsculas, sin espacios)
    const norm = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    // Palabras clave para detectar la fila de encabezados
    const headerKeywords = [
      'carnet',
      'registro',
      'ru',
      'codigo',
      'ci',
      'cedula',
      'identidad',
      'nombre',
      'estudiante',
      'postulante',
      'carrera',
      'plan',
    ];

    let headerRowNumber = 1;
    let foundHeaders = false;
    const maxSearchRows = Math.min(10, worksheet.rowCount);

    for (let r = 1; r <= maxSearchRows; r++) {
      const row = worksheet.getRow(r);
      let matchCount = 0;
      row.eachCell((cell) => {
        const val = cell.value ? norm(cell.value.toString()) : '';
        if (val && headerKeywords.some((kw) => val.includes(kw))) {
          matchCount++;
        }
      });

      if (matchCount >= 2) {
        headerRowNumber = r;
        foundHeaders = true;
        break;
      }
    }

    // Mapeo de columnas a tipos de campos
    const columnMap: {
      carnet?: number;
      ci?: number;
      nombreCompleto?: number;
      paterno?: number;
      materno?: number;
      nombres?: number;
      carrera?: number;
      plan?: number;
      idPlan?: number;
      correo?: number;
      correoPersonal?: number;
    } = {};

    const headerRow = worksheet.getRow(headerRowNumber);
    headerRow.eachCell((cell, colNumber) => {
      const text = cell.value ? norm(cell.value.toString()) : '';
      if (!text) return;

      // 1. Correo electrónico (debe evaluarse antes de CI para no colisionar con 'institu-ci-onal')
      if (text.includes('correo') || text.includes('email') || text.includes('mail')) {
        if (text.includes('personal') || text.includes('otro')) {
          if (!columnMap.correoPersonal) columnMap.correoPersonal = colNumber;
        } else {
          if (!columnMap.correo) columnMap.correo = colNumber;
        }
      }
      // 2. Carnet de Identidad (CI / Cédula / Documento / DNI)
      else if (
        text.includes('identidad') ||
        text.includes('cedula') ||
        text.includes('documento') ||
        text.includes('dni') ||
        text === 'ci' ||
        text.startsWith('ci')
      ) {
        if (!columnMap.ci) columnMap.ci = colNumber;
      }
      // 3. Carnet Estudiantil (Registro / RU / Código / Matrícula)
      else if (
        text.includes('estudiantil') ||
        text.includes('registro') ||
        text === 'ru' ||
        text.includes('codestudiante') ||
        text.includes('matricula') ||
        text === 'codigo' ||
        text === 'cod' ||
        text === 'carnet'
      ) {
        if (!columnMap.carnet) columnMap.carnet = colNumber;
      }
      // 4. Nombre Completo o partes
      else if (
        text.includes('nombrecompleto') ||
        text.includes('apellidosynombres') ||
        text.includes('nombresyapellidos') ||
        text.includes('estudiante') ||
        text.includes('postulante') ||
        text.includes('alumno')
      ) {
        if (!columnMap.nombreCompleto) columnMap.nombreCompleto = colNumber;
      } else if (
        text.includes('paterno') ||
        text.includes('primerapellido') ||
        text === 'apellido1'
      ) {
        columnMap.paterno = colNumber;
      } else if (
        text.includes('materno') ||
        text.includes('segundoapellido') ||
        text === 'apellido2'
      ) {
        columnMap.materno = colNumber;
      } else if (text === 'nombres' || text.includes('nombredel') || text === 'nombre') {
        columnMap.nombres = colNumber;
      }
      // 5. Carrera / Programa / Facultad
      else if (
        text.includes('carrera') ||
        text.includes('programa') ||
        text.includes('facultad')
      ) {
        if (!columnMap.carrera) columnMap.carrera = colNumber;
      }
      // 6. Plan de Estudio / Pensum / Malla
      else if (text.includes('idplan')) {
        columnMap.idPlan = colNumber;
      } else if (
        text.includes('plan') ||
        text.includes('pensum') ||
        text.includes('version') ||
        text.includes('malla')
      ) {
        if (!columnMap.plan) columnMap.plan = colNumber;
      }
    });

    const getCellValue = (row: ExcelJS.Row, col?: number): string | undefined => {
      if (!col) return undefined;
      const cell = row.getCell(col);
      if (!cell || cell.value === null || cell.value === undefined) return undefined;
      // Extraer valor de hipervínculos o fórmulas si existen
      if (typeof cell.value === 'object' && 'text' in (cell.value as any)) {
        return (cell.value as any).text?.toString().trim();
      }
      return cell.value.toString().trim();
    };

    const estudiantes: RawEstudianteInputDto[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= headerRowNumber) return;

      const carnetEstudiantil = getCellValue(row, columnMap.carnet);
      const carnetIdentidad = getCellValue(row, columnMap.ci);

      // Si la fila no tiene carnet ni CI, es probablemente una fila vacía o de pie de página
      if (!carnetEstudiantil && !carnetIdentidad) return;

      const nombreCompletoDirecto = getCellValue(row, columnMap.nombreCompleto);
      const paterno = getCellValue(row, columnMap.paterno);
      const materno = getCellValue(row, columnMap.materno);
      const nombres = getCellValue(row, columnMap.nombres);

      const nombreCarrera = getCellValue(row, columnMap.carrera);
      const nombrePlanEstudio = getCellValue(row, columnMap.plan);
      const correoInstitucional = getCellValue(row, columnMap.correo);
      const correoPersonal = getCellValue(row, columnMap.correoPersonal);

      const idPlanRaw = getCellValue(row, columnMap.idPlan);
      let idPlanEstudio: number | undefined;
      if (idPlanRaw && !isNaN(Number(idPlanRaw))) {
        idPlanEstudio = Number(idPlanRaw);
      }

      estudiantes.push({
        carnetEstudiantil: carnetEstudiantil ?? '',
        carnetIdentidad: carnetIdentidad ?? '',
        nombreCompleto: nombreCompletoDirecto,
        primerApellido: paterno,
        segundoApellido: materno,
        nombres,
        nombreCarrera,
        nombrePlanEstudio,
        idPlanEstudio,
        correoInstitucional,
        correoPersonal,
      });
    });

    if (estudiantes.length === 0) {
      throw new BadRequestException(
        'No se encontraron filas con datos de estudiantes en el archivo. Revise que incluya columnas como Carnet, CI y Nombre.',
      );
    }

    const dto = new BulkEstudiantesInputDto();
    dto.estudiantes = estudiantes;

    if (opciones?.idCarreraPorDefecto && opciones.idCarreraPorDefecto !== 'ALL') {
      dto.idCarreraPorDefecto = opciones.idCarreraPorDefecto;
    }

    if (opciones?.crearPlanesFaltantes !== undefined) {
      dto.crearPlanesFaltantes =
        opciones.crearPlanesFaltantes === true ||
        opciones.crearPlanesFaltantes === 'true';
    } else {
      dto.crearPlanesFaltantes = true;
    }

    dto.batchSize = 50;

    return this.bulkUpsertEstudiantes(dto, user);
  }
}
