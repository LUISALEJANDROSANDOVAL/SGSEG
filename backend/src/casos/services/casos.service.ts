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
      const usos = (caso._count?.defensas ?? 0) + (caso._count?.sorteosCaso ?? 0);
      const umbral = caso.area.umbralDisponibilidad ?? 2;
      const esAgotado = caso.estado === 'AGOTADO' || (caso.estado === 'DISPONIBLE' && usos >= umbral);

      return {
        ...this.serializeBigInt(caso),
        usos,
        umbral,
        estadoEfectivo: esAgotado ? 'AGOTADO' : caso.estado,
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

    const usos = (caso._count?.defensas ?? 0) + (caso._count?.sorteosCaso ?? 0);
    const umbral = caso.area.umbralDisponibilidad ?? 2;

    return {
      ...this.serializeBigInt(caso),
      usos,
      umbral,
      estadoEfectivo:
        caso.estado === 'AGOTADO' || (caso.estado === 'DISPONIBLE' && usos >= umbral)
          ? 'AGOTADO'
          : caso.estado,
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
