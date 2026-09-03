import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  FilterDefensasDto,
  ProgramarDefensaDto,
  UpdateDefensaDto,
} from '../dto/defensas.dto';
import { DefensasRepository } from '../repositories/defensas.repository';

export interface ReglasSorteoCalculadas {
  modalidad: 'ANTICIPADO_CONJUNTO' | 'SEPARADO_DIA_DEFENSA';
  descripcionModalidad: string;
  fechaSorteoAreaRecomendada: string;
  fechaSorteoCasoRecomendada: string;
  plazoPreparacionDias?: number;
  tiempoResolucionHoras?: number;
  diasParaDefensa: number;
}

@Injectable()
export class DefensasService {
  constructor(private readonly repository: DefensasRepository) {}

  /**
   * Resuelve las carreras permitidas según el rol del usuario autenticado.
   */
  private async resolveAllowedCarreras(
    user: AuthenticatedUser,
  ): Promise<bigint[] | undefined> {
    if (user.rol === 'JEFE_CARRERA') {
      const ids = await this.repository.getUserCarreraIds(
        BigInt(user.idUsuario),
      );
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
   * Calcula las reglas de negocio reglamentarias según la Facultad y Carrera (UPTECSA).
   */
  calcularReglasSorteo(
    facultadNombre: string,
    carreraNombre: string,
    tipoDefensa: string,
    fechaDefensaInput: Date | string,
  ): ReglasSorteoCalculadas {
    const facLower = (facultadNombre ?? '').toLowerCase();
    const carLower = (carreraNombre ?? '').toLowerCase();
    const esPsicologia = carLower.includes('psicolog');
    const esFCT =
      facLower.includes('tecnolog') ||
      facLower.includes('ingenier') ||
      facLower.includes('fct');

    // Parseo UTC determinista para evitar desfasajes de zona horaria
    let defensaDate: Date;
    if (typeof fechaDefensaInput === 'string') {
      const parts = fechaDefensaInput.split('T')[0].split('-');
      defensaDate = new Date(
        Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])),
      );
    } else {
      defensaDate = new Date(
        Date.UTC(
          fechaDefensaInput.getUTCFullYear(),
          fechaDefensaInput.getUTCMonth(),
          fechaDefensaInput.getUTCDate(),
        ),
      );
    }

    const hoy = new Date();
    const hoyUtc = new Date(
      Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()),
    );
    const diffTime = defensaDate.getTime() - hoyUtc.getTime();
    const diasParaDefensa = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (esFCT || esPsicologia) {
      // Grupo A: Sorteo conjunto anticipado de Área y Caso
      let plazoDias = 7;
      if (
        carLower.includes('sistema') ||
        carLower.includes('electrónica') ||
        carLower.includes('electronica') ||
        carLower.includes('redes') ||
        carLower.includes('telecomunic') ||
        carLower.includes('eléctrica') ||
        carLower.includes('electrica')
      ) {
        plazoDias = 7;
      } else if (carLower.includes('industrial') || carLower.includes('comercial')) {
        plazoDias = 5;
      } else if (carLower.includes('mecánica') || carLower.includes('mecanica')) {
        plazoDias = 14;
      } else if (esPsicologia) {
        plazoDias = 10;
      }

      const fechaSorteo = new Date(defensaDate.getTime());
      fechaSorteo.setUTCDate(fechaSorteo.getUTCDate() - plazoDias);
      const fechaSorteoStr = fechaSorteo.toISOString().split('T')[0];

      return {
        modalidad: 'ANTICIPADO_CONJUNTO',
        descripcionModalidad: `Sorteo de Área y Caso simultáneo (${plazoDias} días de preparación previa)`,
        fechaSorteoAreaRecomendada: fechaSorteoStr,
        fechaSorteoCasoRecomendada: fechaSorteoStr,
        plazoPreparacionDias: plazoDias,
        diasParaDefensa,
      };
    } else {
      // Grupo B: FCE y FCJS (Área 5 días antes, Caso el mismo día de la defensa)
      const fechaSorteoArea = new Date(defensaDate.getTime());
      fechaSorteoArea.setUTCDate(fechaSorteoArea.getUTCDate() - 5);
      const fechaSorteoAreaStr = fechaSorteoArea.toISOString().split('T')[0];
      const fechaSorteoCasoStr = defensaDate.toISOString().split('T')[0];

      const tiempoResolucion = tipoDefensa.toUpperCase() === 'EXTERNA' ? 1.5 : 1.0;

      return {
        modalidad: 'SEPARADO_DIA_DEFENSA',
        descripcionModalidad: `Sorteo de Área 5 días antes; Asignación de Caso el mismo día (${tiempoResolucion} h de preparación)`,
        fechaSorteoAreaRecomendada: fechaSorteoAreaStr,
        fechaSorteoCasoRecomendada: fechaSorteoCasoStr,
        tiempoResolucionHoras: tiempoResolucion,
        diasParaDefensa,
      };
    }
  }

  /**
   * Programa una nueva defensa de examen de grado validando estudiante y plazos.
   */
  async programarDefensa(dto: ProgramarDefensaDto, user: AuthenticatedUser) {
    const idEstudiante = BigInt(dto.idEstudiante);
    const estudiante = await this.repository.findEstudianteById(idEstudiante);

    if (!estudiante) {
      throw new NotFoundException(
        `Estudiante con ID ${dto.idEstudiante} no encontrado.`,
      );
    }

    if (estudiante.estado === 'ELIMINADO') {
      throw new BadRequestException(
        'No se puede programar una defensa para un estudiante en estado ELIMINADO.',
      );
    }

    // Validación de roles: Si es Jefe de Carrera, solo puede programar para su carrera
    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(estudiante.planEstudio.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para programar defensas de estudiantes de otra carrera.',
        );
      }
    }

    const tipoDefensaRecord = await this.repository.findTipoDefensaByNombre(
      dto.tipoDefensa,
    );

    if (!tipoDefensaRecord) {
      throw new BadRequestException(
        `Tipo de defensa "${dto.tipoDefensa}" no válido o no configurado en el sistema.`,
      );
    }

    const fechaDefensaObj = new Date(dto.fechaDefensa);
    if (isNaN(fechaDefensaObj.getTime())) {
      throw new BadRequestException('La fecha de defensa proporcionada no es válida.');
    }

    const anioActual = new Date().getFullYear();
    const periodo = dto.periodoAcademico || `I-${anioActual}`;

    const defensa = await this.repository.programarDefensa(
      {
        idEstudiante,
        idTipoDefensa: tipoDefensaRecord.idTipoDefensa,
        fechaDefensa: fechaDefensaObj,
        periodoAcademico: periodo,
      },
      BigInt(user.idUsuario),
    );

    const carrera = estudiante.planEstudio.carrera;
    const facultad = carrera.facultad;
    const reglas = this.calcularReglasSorteo(
      facultad?.nombre || '',
      carrera.nombre,
      dto.tipoDefensa,
      fechaDefensaObj,
    );

    return {
      mensaje: 'Defensa de examen de grado programada exitosamente.',
      defensa: this.serializeBigInt(defensa),
      reglasSorteo: reglas,
    };
  }

  /**
   * Consulta el calendario general de defensas con filtros y reglas calculadas.
   */
  async findAll(filter: FilterDefensasDto, user: AuthenticatedUser) {
    const page = Math.max(1, Number(filter.page ?? 1));
    const limit = Math.max(1, Math.min(100, Number(filter.limit ?? 20)));
    const skip = (page - 1) * limit;

    const allowedCarreraIds = await this.resolveAllowedCarreras(user);

    const idFacultad = filter.idFacultad ? BigInt(filter.idFacultad) : undefined;
    const idCarrera = filter.idCarrera ? BigInt(filter.idCarrera) : undefined;
    const fechaDesde = filter.fechaDesde ? new Date(filter.fechaDesde) : undefined;
    const fechaHasta = filter.fechaHasta ? new Date(filter.fechaHasta) : undefined;

    const filterOptions = {
      idFacultad,
      idCarrera,
      estadoDefensa: filter.estadoDefensa,
      tipoDefensa: filter.tipoDefensa,
      fechaDesde,
      fechaHasta,
      search: filter.search,
      skip,
      take: limit,
    };

    const [defensas, total] = await Promise.all([
      this.repository.findDefensas(filterOptions, allowedCarreraIds),
      this.repository.countDefensas(filterOptions, allowedCarreraIds),
    ]);

    const items = defensas.map((def) => {
      const estudiante = def.instancia.proceso.estudiante;
      const carrera = estudiante.planEstudio.carrera;
      const facultad = carrera.facultad;

      const reglas = this.calcularReglasSorteo(
        facultad?.nombre || '',
        carrera.nombre,
        def.tipoDefensa.nombre,
        def.fechaDefensa,
      );

      return {
        ...this.serializeBigInt(def),
        reglasSorteo: reglas,
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
   * Obtiene el detalle de una defensa con su historial de sorteos y reglas.
   */
  async findById(idDefensa: string, user: AuthenticatedUser) {
    const defensa = await this.repository.findDefensaById(BigInt(idDefensa));

    if (!defensa) {
      throw new NotFoundException(`Defensa con ID ${idDefensa} no encontrada.`);
    }

    const estudiante = defensa.instancia.proceso.estudiante;
    const carrera = estudiante.planEstudio.carrera;
    const facultad = carrera.facultad;

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (!allowed?.includes(carrera.idCarrera)) {
        throw new ForbiddenException(
          'No tienes permisos para visualizar defensas de otra carrera.',
        );
      }
    }

    const reglas = this.calcularReglasSorteo(
      facultad?.nombre || '',
      carrera.nombre,
      defensa.tipoDefensa.nombre,
      defensa.fechaDefensa,
    );

    return {
      ...this.serializeBigInt(defensa),
      reglasSorteo: reglas,
    };
  }

  /**
   * Actualiza los datos de una defensa programada.
   */
  async update(idDefensa: string, dto: UpdateDefensaDto, user: AuthenticatedUser) {
    const id = BigInt(idDefensa);
    const existing = await this.repository.findDefensaById(id);

    if (!existing) {
      throw new NotFoundException(`Defensa con ID ${idDefensa} no encontrada.`);
    }

    if (user.rol === 'JEFE_CARRERA') {
      const allowed = await this.resolveAllowedCarreras(user);
      if (
        !allowed?.includes(
          existing.instancia.proceso.estudiante.planEstudio.idCarrera,
        )
      ) {
        throw new ForbiddenException(
          'No tienes permisos para modificar defensas de otra carrera.',
        );
      }
    }

    const fechaDefensa = dto.fechaDefensa ? new Date(dto.fechaDefensa) : undefined;

    const updated = await this.repository.updateDefensa(
      id,
      {
        fechaDefensa,
        periodoAcademico: dto.periodoAcademico,
        estadoDefensa: dto.estadoDefensa,
        nota: dto.nota,
        resultado: dto.resultado,
      },
      BigInt(user.idUsuario),
    );

    return {
      mensaje: 'Defensa actualizada exitosamente.',
      defensa: this.serializeBigInt(updated),
    };
  }

  /**
   * Obtiene el resumen del embudo de estados (Pipeline).
   */
  async getEmbudo(user: AuthenticatedUser) {
    const allowed = await this.resolveAllowedCarreras(user);
    return this.repository.getEmbudoEstados(allowed);
  }

  /**
   * Obtiene la lista de alertas operativas (defensas próximas sin sorteo).
   */
  async getAlertas(diasAnticipacion = 15, user: AuthenticatedUser) {
    const allowed = await this.resolveAllowedCarreras(user);
    const defensas = await this.repository.getAlertasOperativas(
      diasAnticipacion,
      allowed,
    );

    return defensas.map((def) => {
      const estudiante = def.instancia.proceso.estudiante;
      const carrera = estudiante.planEstudio.carrera;
      const facultad = carrera.facultad;
      const reglas = this.calcularReglasSorteo(
        facultad?.nombre || '',
        carrera.nombre,
        def.tipoDefensa.nombre,
        def.fechaDefensa,
      );

      return {
        ...this.serializeBigInt(def),
        reglasSorteo: reglas,
      };
    });
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
