import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  CrearEnlaceEspectadorDto,
  FilterSorteosDto,
  FinalizarSorteoDto,
  SortearAreaDto,
  SortearCasoDto,
  SorteoConjuntoDto,
} from '../dto/sorteos.dto';
import { SorteosRepository } from '../repositories/sorteos.repository';

@Injectable()
export class SorteosService {
  constructor(private readonly repository: SorteosRepository) {}

  /**
   * Genera un token hash SHA-256 criptográfico para el acta de sorteo.
   */
  generarTokenActa(
    idSorteo: bigint | string,
    idDefensa: bigint | string,
    idResultado: bigint | string,
    fechaHora: Date | string,
  ): string {
    const payload = `UPTECSA-ACTA:${idSorteo}:${idDefensa}:${idResultado}:${fechaHora}:INTEGRIDAD-VERIFICADA`;
    return crypto.createHash('sha256').update(payload).digest('hex').substring(0, 32).toUpperCase();
  }

  /**
   * Selección pseudoaleatoria uniforme y criptográficamente segura (CSPRNG).
   */
  seleccionarGanadorCSPRNG<T>(elementos: T[]): { elemento: T; indice: number } {
    if (!elementos || elementos.length === 0) {
      throw new BadRequestException('El conjunto de selección para el sorteo no puede estar vacío.');
    }
    const indice = crypto.randomInt(0, elementos.length);
    return { elemento: elementos[indice], indice };
  }

  /**
   * Resuelve las carreras permitidas para un usuario según su rol.
   */
  private async resolveAllowedCarreras(
    user: AuthenticatedUser,
  ): Promise<bigint[] | undefined> {
    if (user.rol === 'JEFE_CARRERA') {
      const ids = await this.repository.getUserCarreraIds(BigInt(user.idUsuario));
      if (ids.length === 0) {
        throw new ForbiddenException(
          'No tienes carreras asignadas a tu cuenta de Jefe de Carrera.',
        );
      }
      return ids;
    }
    return undefined;
  }

  /**
   * Ejecuta el sorteo digital de Área Temática.
   */
  async sortearArea(dto: SortearAreaDto, user: AuthenticatedUser) {
    const idDefensa = BigInt(dto.idDefensa);
    const defensa = await this.repository.findDefensaWithDetails(idDefensa);

    if (!defensa) {
      throw new NotFoundException(`Defensa con ID ${dto.idDefensa} no encontrada.`);
    }

    const estudiante = defensa.instancia.proceso.estudiante;
    const carrera = estudiante.planEstudio.carrera;

    // Validación RBAC de carrera para Jefe de Carrera
    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(carrera.idCarrera)) {
        throw new ForbiddenException('No tienes permisos para realizar sorteos de otra carrera.');
      }
    }

    // Verificar si ya tiene un sorteo de área activo
    const tieneArea = defensa.sorteos.some((s) => s.area !== null && s.estadoSorteo === 'ACTIVO');
    if (tieneArea) {
      throw new BadRequestException(
        'Esta defensa ya cuenta con un área académica sorteada y registrada en el acta.',
      );
    }

    // Obtener áreas vigentes disponibles
    const areas = await this.repository.findAreasDisponibles(
      estudiante.idPlanEstudio,
      carrera.idCarrera,
    );

    if (areas.length === 0) {
      throw new BadRequestException(
        `No existen áreas académicas vigentes configuradas para la carrera "${carrera.nombre}".`,
      );
    }

    // Selección aleatoria CSPRNG
    const { elemento: areaGanadora, indice } = this.seleccionarGanadorCSPRNG<any>(areas);

    // Obtener configuración de sorteo de área
    const config = await this.repository.findOrCreateConfigSorteoArea(
      carrera.idCarrera,
      defensa.idTipoDefensa,
    );

    const poolAreaIds = areas.map((a: any) => a.idArea);

    const sorteo = await this.repository.ejecutarSorteoArea({
      idDefensa,
      idUsuarioEjecutor: BigInt(user.idUsuario),
      idPlanEstudioContexto: estudiante.idPlanEstudio,
      fechaDefensaContexto: defensa.fechaDefensa,
      estudiantePresente: dto.estudiantePresente ?? true,
      motivoInasistencia: dto.motivoInasistencia,
      idConfigSorteoArea: config.idConfigSorteoArea,
      idAreaResultado: areaGanadora.idArea,
      poolAreaIds,
    });

    const tokenActa = this.generarTokenActa(
      sorteo.idSorteo,
      idDefensa,
      areaGanadora.idArea,
      sorteo.fechaHora,
    );

    return {
      mensaje: 'Sorteo digital de área académica ejecutado con éxito.',
      sorteo: this.serializeBigInt(sorteo),
      areaGanadora: this.serializeBigInt(areaGanadora),
      indiceGanador: indice,
      totalParticipantes: areas.length,
      poolAreas: this.serializeBigInt(areas),
      tokenActa,
    };
  }

  /**
   * Ejecuta el sorteo digital de Caso de Estudio dentro del Área previamente sorteada.
   */
  async sortearCaso(dto: SortearCasoDto, user: AuthenticatedUser) {
    const idDefensa = BigInt(dto.idDefensa);
    const defensa = await this.repository.findDefensaWithDetails(idDefensa);

    if (!defensa) {
      throw new NotFoundException(`Defensa con ID ${dto.idDefensa} no encontrada.`);
    }

    const estudiante = defensa.instancia.proceso.estudiante;
    const carrera = estudiante.planEstudio.carrera;

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(carrera.idCarrera)) {
        throw new ForbiddenException('No tienes permisos para realizar sorteos de otra carrera.');
      }
    }

    // Verificar si ya tiene caso asignado
    if (defensa.idCasoUtilizado) {
      throw new BadRequestException('Esta defensa ya tiene un caso de estudio asignado.');
    }

    // Buscar el sorteo de área previo
    const sorteoArea = defensa.sorteos.find(
      (s) => s.area !== null && s.estadoSorteo === 'ACTIVO',
    );

    if (!sorteoArea || !sorteoArea.area) {
      throw new BadRequestException(
        'Debe realizar primero el sorteo de área académica antes de sortear el caso de estudio.',
      );
    }

    const idAreaResultado = sorteoArea.area.idAreaResultado;

    // Buscar casos disponibles en el área con < 2 usos
    const casos = await this.repository.findCasosDisponibles(idAreaResultado);

    if (casos.length === 0) {
      throw new BadRequestException(
        'Stock crítico agotado: No existen casos de estudio disponibles en esta área. Contacte a la Jefatura de Carrera para habilitar nuevos casos.',
      );
    }

    // Selección aleatoria CSPRNG
    const { elemento: casoGanador, indice } = this.seleccionarGanadorCSPRNG<any>(casos);

    const config = await this.repository.findOrCreateConfigSorteoCaso(
      carrera.idCarrera,
      defensa.idTipoDefensa,
    );

    // Calcular plazo límite de entrega según tipo de defensa y anticipación
    const ahora = new Date();
    let plazoLimite: Date | undefined;
    if (defensa.tipoDefensa.nombre === 'INTERNA') {
      plazoLimite = new Date(ahora.getTime() + 60 * 60 * 1000); // 1 hora
    } else {
      plazoLimite = new Date(ahora.getTime() + 90 * 60 * 1000); // 1.5 horas
    }

    const sorteo = await this.repository.ejecutarSorteoCaso({
      idDefensa,
      idUsuarioEjecutor: BigInt(user.idUsuario),
      idPlanEstudioContexto: estudiante.idPlanEstudio,
      fechaDefensaContexto: defensa.fechaDefensa,
      estudiantePresente: dto.estudiantePresente ?? true,
      motivoInasistencia: dto.motivoInasistencia,
      idConfigSorteoCaso: config.idConfigSorteoCaso,
      idCasoSeleccionado: casoGanador.idCasoEstudio,
      plazoLimiteEntrega: plazoLimite,
    });

    const tokenActa = this.generarTokenActa(
      sorteo.idSorteo,
      idDefensa,
      casoGanador.idCasoEstudio,
      sorteo.fechaHora,
    );

    return {
      mensaje: 'Sorteo digital de caso de estudio ejecutado exitosamente.',
      sorteo: this.serializeBigInt(sorteo),
      casoGanador: this.serializeBigInt(casoGanador),
      indiceGanador: indice,
      totalCasosEnPool: casos.length,
      plazoLimiteEntrega: plazoLimite.toISOString(),
      tokenActa,
    };
  }

  /**
   * Ejecuta el sorteo conjunto anticipado de Área y Caso (FCT y Psicología).
   */
  async sorteoConjunto(dto: SorteoConjuntoDto, user: AuthenticatedUser) {
    const idDefensa = BigInt(dto.idDefensa);
    const defensa = await this.repository.findDefensaWithDetails(idDefensa);

    if (!defensa) {
      throw new NotFoundException(`Defensa con ID ${dto.idDefensa} no encontrada.`);
    }

    const estudiante = defensa.instancia.proceso.estudiante;
    const carrera = estudiante.planEstudio.carrera;

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(carrera.idCarrera)) {
        throw new ForbiddenException('No tienes permisos para realizar sorteos de otra carrera.');
      }
    }

    if (defensa.idCasoUtilizado) {
      throw new BadRequestException('Esta defensa ya tiene un caso asignado.');
    }

    // 1. Obtener áreas y sortear
    const areas = await this.repository.findAreasDisponibles(
      estudiante.idPlanEstudio,
      carrera.idCarrera,
    );

    if (areas.length === 0) {
      throw new BadRequestException('No existen áreas académicas disponibles para la carrera.');
    }

    const { elemento: areaGanadora, indice: indiceArea } = this.seleccionarGanadorCSPRNG<any>(areas);

    // 2. Obtener casos del área ganadora y sortear
    const casos = await this.repository.findCasosDisponibles(areaGanadora.idArea);

    if (casos.length === 0) {
      throw new BadRequestException(
        `Stock crítico agotado: No existen casos disponibles en el área "${areaGanadora.nombre}".`,
      );
    }

    const { elemento: casoGanador, indice: indiceCaso } = this.seleccionarGanadorCSPRNG<any>(casos);

    const [configArea, configCaso] = await Promise.all([
      this.repository.findOrCreateConfigSorteoArea(carrera.idCarrera, defensa.idTipoDefensa),
      this.repository.findOrCreateConfigSorteoCaso(carrera.idCarrera, defensa.idTipoDefensa),
    ]);

    const resultado = await this.repository.ejecutarSorteoConjunto({
      idDefensa,
      idUsuarioEjecutor: BigInt(user.idUsuario),
      idPlanEstudioContexto: estudiante.idPlanEstudio,
      fechaDefensaContexto: defensa.fechaDefensa,
      estudiantePresente: dto.estudiantePresente ?? true,
      motivoInasistencia: dto.motivoInasistencia,
      idConfigSorteoArea: configArea.idConfigSorteoArea,
      idAreaResultado: areaGanadora.idArea,
      poolAreaIds: areas.map((a: any) => a.idArea),
      idConfigSorteoCaso: configCaso.idConfigSorteoCaso,
      idCasoSeleccionado: casoGanador.idCasoEstudio,
      plazoLimiteEntrega: defensa.fechaDefensa,
    });

    const tokenActa = this.generarTokenActa(
      resultado.sorteoCaso.idSorteo,
      idDefensa,
      casoGanador.idCasoEstudio,
      resultado.sorteoCaso.fechaHora,
    );

    return {
      mensaje: 'Sorteo conjunto anticipado de área y caso de estudio ejecutado exitosamente.',
      areaGanadora: this.serializeBigInt(areaGanadora),
      indiceArea,
      casoGanador: this.serializeBigInt(casoGanador),
      indiceCaso,
      tokenActa,
      sorteo: this.serializeBigInt(resultado),
    };
  }

  /**
   * Consulta el historial general de sorteos.
   */
  async findHistorial(filter: FilterSorteosDto, user: AuthenticatedUser) {
    const page = Math.max(1, Number(filter.page ?? 1));
    const limit = Math.max(1, Math.min(100, Number(filter.limit ?? 20)));
    const skip = (page - 1) * limit;

    const allowedCarreraIds = await this.resolveAllowedCarreras(user);
    const idCarrera = filter.idCarrera ? BigInt(filter.idCarrera) : undefined;

    const [items, total] = await Promise.all([
      this.repository.findHistorial(
        { idCarrera, search: filter.search, skip, take: limit },
        allowedCarreraIds,
      ),
      this.repository.countHistorial(
        { idCarrera, search: filter.search },
        allowedCarreraIds,
      ),
    ]);

    return {
      items: this.serializeBigInt(items),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene los detalles de un sorteo por ID (Acta de Sorteo).
   */
  async findSorteoById(idSorteo: string, user: AuthenticatedUser) {
    const sorteo = await this.repository.findSorteoById(BigInt(idSorteo));

    if (!sorteo) {
      throw new NotFoundException(`Sorteo con ID ${idSorteo} no encontrado.`);
    }

    const carrera =
      sorteo.defensa.instancia.proceso.estudiante.planEstudio.carrera;

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(carrera.idCarrera)) {
        throw new ForbiddenException('No tienes permisos para visualizar actas de otra carrera.');
      }
    }

    const resultadoId =
      sorteo.area?.idAreaResultado ?? sorteo.caso?.idCasoSeleccionado ?? BigInt(0);

    const tokenActa = this.generarTokenActa(
      sorteo.idSorteo,
      sorteo.idDefensa,
      resultadoId,
      sorteo.fechaHora,
    );

    return {
      ...this.serializeBigInt(sorteo),
      tokenActa,
    };
  }

  /**
   * Finaliza el sorteo y persiste atómicamente la asignación del caso (Área, Caso, Estudiante).
   * Controla concurrencia y genera el código y token de integridad del acta.
   */
  async finalizarSorteo(dto: FinalizarSorteoDto, user: AuthenticatedUser) {
    const idDefensa = BigInt(dto.idDefensa);
    const defensa = await this.repository.findDefensaWithDetails(idDefensa);

    if (!defensa) {
      throw new NotFoundException(`Defensa con ID ${dto.idDefensa} no encontrada.`);
    }

    const estudiante = defensa.instancia.proceso.estudiante;
    const carrera = estudiante.planEstudio.carrera;

    // Validación RBAC de carrera para Jefe de Carrera
    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(carrera.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para finalizar sorteos de otra carrera.',
        );
      }
    }

    // Calcular plazo reglamentario según tipo de defensa
    const ahora = new Date();
    let plazoLimite: Date | undefined;
    if (defensa.tipoDefensa.nombre === 'INTERNA') {
      plazoLimite = new Date(ahora.getTime() + 60 * 60 * 1000); // 1 hora
    } else {
      plazoLimite = new Date(ahora.getTime() + 90 * 60 * 1000); // 1.5 horas
    }

    const ano = ahora.getFullYear();
    const codigoActa = `ACTA-DEF-${defensa.idDefensa}-${ano}`;
    const tokenActa = this.generarTokenActa(
      defensa.sorteos[0]?.idSorteo ?? BigInt(0),
      defensa.idDefensa,
      BigInt(dto.idCaso),
      ahora,
    );

    const asignacion = await this.repository.finalizarYAsignarSorteo({
      idDefensa,
      idEstudiante: estudiante.idEstudiante,
      idArea: BigInt(dto.idArea),
      idCaso: BigInt(dto.idCaso),
      idUsuarioEjecutor: BigInt(user.idUsuario),
      idPlanEstudioContexto: estudiante.idPlanEstudio,
      fechaDefensaContexto: defensa.fechaDefensa,
      estudiantePresente: dto.estudiantePresente ?? true,
      motivoInasistencia: dto.motivoInasistencia,
      tokenActa,
      codigoActa,
      plazoLimiteEntrega: plazoLimite,
    });

    // Si había una sesión de espectador activa vinculada, notificar la finalización
    if (dto.tokenSesionLive) {
      try {
        await this.repository.actualizarFaseSesionEspectador(
          dto.tokenSesionLive,
          'ACTA_OFICIALIZADA',
          { asignacion: this.serializeBigInt(asignacion) },
        );
      } catch {
        // No bloquear la finalización si la sesión de espectador no existía
      }
    }

    return {
      mensaje: 'Sorteo finalizado y asignación de caso persistida oficialmente.',
      asignacion: this.serializeBigInt(asignacion),
      codigoActa,
      tokenActa,
      plazoLimiteEntrega: plazoLimite.toISOString(),
    };
  }

  /**
   * Genera un enlace temporal con expiración y slug único para el espectador móvil.
   */
  async generarEnlaceEspectador(
    dto: CrearEnlaceEspectadorDto,
    user: AuthenticatedUser,
  ) {
    const idDefensa = BigInt(dto.idDefensa);
    const defensa = await this.repository.findDefensaWithDetails(idDefensa);

    if (!defensa) {
      throw new NotFoundException(`Defensa con ID ${dto.idDefensa} no encontrada.`);
    }

    const estudiante = defensa.instancia.proceso.estudiante;
    const carrera = estudiante.planEstudio.carrera;

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(carrera.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para generar enlaces de otra carrera.',
        );
      }
    }

    const duracionMinutos = dto.duracionMinutos && dto.duracionMinutos > 0 ? dto.duracionMinutos : 120;
    const fechaExpiracion = new Date(Date.now() + duracionMinutos * 60 * 1000);
    const token = crypto.randomUUID();
    const slug = `sorteo-${crypto.randomBytes(4).toString('hex')}`;

    const sesion = await this.repository.crearSesionEspectador({
      token,
      slug,
      idDefensa,
      idEstudiante: estudiante.idEstudiante,
      fechaExpiracion,
      fase: 'ESPERANDO',
    });

    return {
      mensaje: 'Enlace de espectador generado exitosamente.',
      token: sesion.token,
      slug: sesion.slug,
      urlEspectador: `/sorteos/espectador/${sesion.slug}`,
      fechaExpiracion: sesion.fechaExpiracion.toISOString(),
      estudiante: {
        nombreCompleto: estudiante.nombreCompleto,
        carnetEstudiantil: estudiante.carnetEstudiantil,
        correoInstitucional: estudiante.correoInstitucional,
      },
    };
  }

  /**
   * Consulta pública en modo solo lectura del estado del sorteo para el estudiante.
   */
  async obtenerVistaEspectador(identificador: string) {
    const sesion = await this.repository.findSesionEspectadorByTokenOrSlug(
      identificador,
    );

    if (!sesion) {
      throw new NotFoundException('Enlace de sorteo no encontrado o inexistente.');
    }

    const ahora = new Date();
    if (ahora > sesion.fechaExpiracion || !sesion.activo) {
      return {
        fase: 'EXPIRADO',
        mensaje: 'Este enlace temporal de sorteo ha expirado.',
        expirado: true,
      };
    }

    const asignacion = sesion.defensa.asignacionCaso;

    return {
      token: sesion.token,
      slug: sesion.slug,
      fase: sesion.fase,
      estadoPayload: sesion.estadoPayload,
      estudiante: {
        nombreCompleto: sesion.estudiante.nombreCompleto,
        carnetEstudiantil: sesion.estudiante.carnetEstudiantil,
        carrera: sesion.estudiante.planEstudio.carrera.nombre,
      },
      defensa: {
        idDefensa: sesion.defensa.idDefensa.toString(),
        fechaDefensa: sesion.defensa.fechaDefensa,
        tipoDefensa: sesion.defensa.tipoDefensa.nombre,
        estadoDefensa: sesion.defensa.estadoDefensa,
        asignacion: asignacion
          ? {
              idAsignacion: asignacion.idAsignacion.toString(),
              area: asignacion.area.nombre,
              casoTitulo: asignacion.caso.titulo,
              casoContenido: asignacion.caso.contenido,
              codigoActa: asignacion.codigoActa,
              tokenActa: asignacion.tokenActa,
              plazoLimiteEntrega: asignacion.plazoLimiteEntrega,
              estado: asignacion.estado,
            }
          : null,
      },
      fechaExpiracion: sesion.fechaExpiracion.toISOString(),
      expirado: false,
    };
  }

  /**
   * Consulta la asignación de una defensa por ID.
   */
  async consultarAsignacion(idDefensa: string, user: AuthenticatedUser) {
    const idDef = BigInt(idDefensa);
    const asignacion = await this.repository.findAsignacionByDefensa(idDef);

    if (!asignacion) {
      throw new NotFoundException(`No existe asignación de caso para la defensa ${idDefensa}.`);
    }

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      const idCarrera = asignacion.estudiante.planEstudio.carrera.idCarrera;
      if (!allowed?.includes(idCarrera)) {
        throw new ForbiddenException('No tienes permisos para ver la asignación de otra carrera.');
      }
    }

    return this.serializeBigInt(asignacion);
  }

  /**
   * Serializa campos BigInt a string para formato JSON.
   */
  private serializeBigInt<T = any>(obj: unknown): T {
    return JSON.parse(
      JSON.stringify(obj, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    ) as T;
  }
}
