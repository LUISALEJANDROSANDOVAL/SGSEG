import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  CreateAreaDto,
  CreateCasoDto,
  FilterCasosDto,
  FilterVistaCasosDto,
  ReactivarCasoEspecialDto,
  UpdateCasoDto,
} from '../dto/casos.dto';
import { CasosRepository } from '../repositories/casos.repository';

@Injectable()
export class CasosService {
  constructor(private readonly repository: CasosRepository) {}

  /**
   * Resuelve las carreras permitidas según el rol del usuario autenticado.
   * Si es JEFE_CARRERA, restringe exclusivamente a las suyas.
   * Si es COORDINACION, VICERRECTORADO o SUPER_ADMIN, no impone restricción.
   */
  private async resolveAllowedCarreras(
    user: AuthenticatedUser,
  ): Promise<bigint[] | undefined> {
    if (user.rol === 'JEFE_CARRERA') {
      const userCarreraIds = await this.repository.getUserCarreraIds(
        BigInt(user.idUsuario),
      );
      if (userCarreraIds.length === 0) {
        throw new ForbiddenException(
          'No tienes carreras asignadas a tu cuenta de Jefe de Carrera.',
        );
      }
      return userCarreraIds;
    }
    return undefined;
  }

  /**
   * Obtiene la lista paginada de casos con filtros, cálculo de usos y estado efectivo.
   */
  async findAll(filter: FilterCasosDto, user: AuthenticatedUser) {
    const page = Math.max(1, Number(filter.page ?? 1));
    const limit = Math.max(1, Math.min(100, Number(filter.limit ?? 20)));
    const skip = (page - 1) * limit;

    const allowedCarreraIds = await this.resolveAllowedCarreras(user);

    const idCarrera = filter.idCarrera ? BigInt(filter.idCarrera) : undefined;
    const idArea = filter.idArea ? BigInt(filter.idArea) : undefined;

    const filterOptions = {
      idCarrera,
      idArea,
      estado: filter.estado,
      search: filter.search,
      skip,
      take: limit,
    };

    const [casos, total] = await Promise.all([
      this.repository.findCasos(filterOptions, allowedCarreraIds),
      this.repository.countCasos(filterOptions, allowedCarreraIds),
    ]);

    const items = casos.map((caso) => {
      const usos = caso._count?.defensas ?? 0;
      const umbral = caso.area.umbralDisponibilidad ?? 2;
      let estadoEfectivo = caso.estado;
      if (caso.estado === 'REACTIVADO_ESPECIAL') {
        estadoEfectivo = 'REACTIVADO_ESPECIAL';
      } else if (caso.estado === 'AGOTADO' || (caso.estado === 'DISPONIBLE' && usos >= umbral)) {
        estadoEfectivo = 'AGOTADO';
      }

      return {
        ...this.serializeBigInt(caso),
        usos,
        umbral,
        estadoEfectivo,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene el detalle de un caso específico validando permisos de carrera.
   */
  async findById(idCaso: string, user: AuthenticatedUser) {
    const caso = await this.repository.findCasoById(BigInt(idCaso));

    if (!caso) {
      throw new NotFoundException(`Caso de estudio con ID ${idCaso} no encontrado.`);
    }

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(caso.area.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para visualizar casos de esta carrera.',
        );
      }
    }

    const usos = caso._count?.defensas ?? 0;
    const umbral = caso.area.umbralDisponibilidad ?? 2;
    let estadoEfectivo = caso.estado;
    if (caso.estado === 'REACTIVADO_ESPECIAL') {
      estadoEfectivo = 'REACTIVADO_ESPECIAL';
    } else if (caso.estado === 'AGOTADO' || (caso.estado === 'DISPONIBLE' && usos >= umbral)) {
      estadoEfectivo = 'AGOTADO';
    }

    return {
      ...this.serializeBigInt(caso),
      usos,
      umbral,
      estadoEfectivo,
    };
  }

  /**
   * Registra un nuevo caso de estudio validando pertenencia de carrera y área.
   */
  async create(dto: CreateCasoDto, user: AuthenticatedUser) {
    const idArea = BigInt(dto.idArea);
    const area = await this.repository.findAreaById(idArea);

    if (!area) {
      throw new NotFoundException(`El área académica con ID ${dto.idArea} no existe.`);
    }

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(area.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para registrar casos en áreas de otra carrera.',
        );
      }
    }

    const nuevoCaso = await this.repository.createCaso(
      {
        idArea,
        titulo: dto.titulo,
        contenido: dto.contenido,
        documentoAdjunto: dto.documentoAdjunto,
        estado: 'DISPONIBLE',
      },
      BigInt(user.idUsuario),
    );

    return {
      mensaje: 'Caso de estudio registrado exitosamente.',
      caso: this.serializeBigInt(nuevoCaso),
    };
  }

  /**
   * Actualiza los datos de un caso de estudio.
   */
  async update(idCaso: string, dto: UpdateCasoDto, user: AuthenticatedUser) {
    const id = BigInt(idCaso);
    const casoExistente = await this.repository.findCasoById(id);

    if (!casoExistente) {
      throw new NotFoundException(`Caso de estudio con ID ${idCaso} no encontrado.`);
    }

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(casoExistente.area.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para modificar casos de esta carrera.',
        );
      }
    }

    let idAreaFinal = casoExistente.idArea;
    if (dto.idArea) {
      idAreaFinal = BigInt(dto.idArea);
      const nuevaArea = await this.repository.findAreaById(idAreaFinal);
      if (!nuevaArea) {
        throw new NotFoundException(`El área académica con ID ${dto.idArea} no existe.`);
      }
      if (user.rol === 'JEFE_CARRERA') {
        const allowed = await this.resolveAllowedCarreras(user);
        if (!allowed?.includes(nuevaArea.idCarrera)) {
          throw new ForbiddenException(
            'No puedes reasignar este caso a un área que no pertenece a tu carrera.',
          );
        }
      }
    }

    const casoActualizado = await this.repository.updateCaso(
      id,
      {
        idArea: idAreaFinal,
        titulo: dto.titulo,
        contenido: dto.contenido,
        estado: dto.estado,
        documentoAdjunto: dto.documentoAdjunto,
      },
      BigInt(user.idUsuario),
    );

    return {
      mensaje: 'Caso de estudio actualizado correctamente.',
      caso: this.serializeBigInt(casoActualizado),
    };
  }

  /**
   * Alterna el estado de un caso entre ACTIVO/DISPONIBLE e INACTIVO (baja lógica).
   */
  async toggleEstado(idCaso: string, user: AuthenticatedUser) {
    const id = BigInt(idCaso);
    const caso = await this.repository.findCasoById(id);

    if (!caso) {
      throw new NotFoundException(`Caso de estudio con ID ${idCaso} no encontrado.`);
    }

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(caso.area.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para cambiar el estado de casos de esta carrera.',
        );
      }
    }

    const nuevoEstado = caso.estado === 'INACTIVO' ? 'DISPONIBLE' : 'INACTIVO';
    const updated = await this.repository.setEstadoCaso(
      id,
      nuevoEstado,
      BigInt(user.idUsuario),
    );

    return {
      mensaje: `Caso ${updated.titulo} marcado como ${nuevoEstado}.`,
      caso: this.serializeBigInt(updated),
    };
  }

  /**
   * Reactiva de forma extraordinaria un caso de estudio por caso especial (Exclusivo Jefe de Carrera).
   */
  async reactivarCasoEspecial(
    idCaso: string,
    dto: ReactivarCasoEspecialDto,
    user: AuthenticatedUser,
  ) {
    if (user.rol !== 'JEFE_CARRERA') {
      throw new ForbiddenException(
        'Solo el Jefe de Carrera tiene la potestad reglamentaria de reactivar casos por excepción.',
      );
    }

    const id = BigInt(idCaso);
    const caso = await this.repository.findCasoById(id);

    if (!caso) {
      throw new NotFoundException(`Caso de estudio con ID ${idCaso} no encontrado.`);
    }

    const allowed = await this.resolveAllowedCarreras(user);
    if (!allowed?.includes(caso.area.idCarrera)) {
      throw new ForbiddenException(
        'No tienes permisos para reactivar casos de una carrera distinta a la tuya.',
      );
    }

    const updated = await this.repository.reactivarCasoEspecial(
      id,
      dto.motivo,
      BigInt(user.idUsuario),
    );

    const usos = updated._count?.defensas ?? 0;
    const umbral = updated.area.umbralDisponibilidad ?? 2;

    return {
      mensaje: `Caso "${updated.titulo}" reactivado excepcionalmente para un nuevo uso.`,
      caso: {
        ...this.serializeBigInt(updated),
        usos,
        umbral,
        estadoEfectivo: 'REACTIVADO_ESPECIAL',
      },
    };
  }

  /**
   * Consulta las áreas académicas disponibles para el usuario y carrera.
   */
  async getAreas(idCarrera: string | undefined, user: AuthenticatedUser) {
    const allowed = await this.resolveAllowedCarreras(user);
    const carreraId = idCarrera ? BigInt(idCarrera) : undefined;
    const areas = await this.repository.findAreas(carreraId, allowed);
    return areas.map((a) => this.serializeBigInt(a));
  }

  /**
   * Crea una nueva área académica para una carrera.
   */
  async createArea(dto: CreateAreaDto, user: AuthenticatedUser) {
    const idCarrera = BigInt(dto.idCarrera);

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para crear áreas en carreras ajenas.',
        );
      }
    }

    const nuevaArea = await this.repository.createArea({
      idCarrera,
      nombre: dto.nombre,
      umbralDisponibilidad: dto.umbralDisponibilidad,
    });

    return this.serializeBigInt(nuevaArea);
  }

  /**
   * Obtiene las métricas cuantitativas y alertas de stock crítico.
   */
  async getMetricas(idCarrera: string | undefined, user: AuthenticatedUser) {
    const allowed = await this.resolveAllowedCarreras(user);
    const carreraId = idCarrera ? BigInt(idCarrera) : undefined;
    return this.repository.getMetricas(carreraId, allowed);
  }

  /**
   * Obtiene los casos de estudio optimizados pertenecientes a una carrera mediante vista SQL.
   */
  async getCasosPorCarreraVista(
    idCarreraStr: string,
    filter: FilterVistaCasosDto,
    user: AuthenticatedUser,
  ) {
    const idCarrera = BigInt(idCarreraStr);

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para visualizar casos de una carrera distinta a la tuya.',
        );
      }
    }

    const page = Math.max(1, Number(filter.page ?? 1));
    const limit = Math.max(1, Math.min(100, Number(filter.limit ?? 20)));
    const skip = (page - 1) * limit;

    const idArea = filter.idArea && filter.idArea !== 'ALL' ? BigInt(filter.idArea) : undefined;

    const { items, total } = await this.repository.findCasosPorCarreraVista(idCarrera, {
      idArea,
      estado: filter.estado,
      search: filter.search,
      skip,
      take: limit,
    });

    const mappedItems = items.map((row) => ({
      idCasoEstudio: String(row.id_caso_estudio),
      titulo: row.titulo,
      contenido: row.contenido,
      documentoAdjunto: row.documento_adjunto,
      estadoBase: row.estado_base,
      idArea: String(row.id_area),
      nombreArea: row.nombre_area,
      umbralDisponibilidad: Number(row.umbral_disponibilidad),
      estadoArea: row.estado_area,
      idCarrera: String(row.id_carrera),
      nombreCarrera: row.nombre_carrera,
      idFacultad: String(row.id_facultad),
      nombreFacultad: row.nombre_facultad,
      totalUsos: Number(row.total_usos),
      totalSorteos: Number(row.total_sorteos),
      estadoEfectivo: row.estado_efectivo,
      esDisponibleParaSorteo: Boolean(row.es_disponible_para_sorteo),
    }));

    return {
      items: mappedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene la agregación optimizada de áreas y su stock pertenecientes a una carrera mediante vista SQL.
   */
  async getAreasPorCarreraVista(idCarreraStr: string, user: AuthenticatedUser) {
    const idCarrera = BigInt(idCarreraStr);

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para visualizar áreas de una carrera distinta a la tuya.',
        );
      }
    }

    const rows = await this.repository.findAreasPorCarreraVista(idCarrera);

    return rows.map((row) => ({
      idArea: String(row.id_area),
      nombreArea: row.nombre_area,
      umbralDisponibilidad: Number(row.umbral_disponibilidad),
      estadoArea: row.estado_area,
      idCarrera: String(row.id_carrera),
      nombreCarrera: row.nombre_carrera,
      idFacultad: String(row.id_facultad),
      nombreFacultad: row.nombre_facultad,
      totalCasos: Number(row.total_casos),
      casosDisponibles: Number(row.casos_disponibles),
      casosAgotados: Number(row.casos_agotados),
      casosInactivos: Number(row.casos_inactivos),
      stockCritico: Boolean(row.stock_critico),
      mensajeAlerta: row.mensaje_alerta,
    }));
  }

  /**
   * Serializa objetos con campos BigInt a string para formato JSON.
   */
  private serializeBigInt<T = any>(obj: unknown): T {
    return JSON.parse(
      JSON.stringify(obj, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    ) as T;
  }
}
