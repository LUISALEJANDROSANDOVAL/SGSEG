import api from './api';

export interface AreaResultado {
  idArea: string;
  idCarrera: string;
  nombre: string;
  umbralDisponibilidad: number;
  estado: string;
}

export interface CasoResultado {
  idCasoEstudio: string;
  idArea: string;
  titulo: string;
  contenido: string;
  documentoAdjunto?: string | null;
  estado: string;
}

export interface SorteoItem {
  idSorteo: string;
  idDefensa: string;
  idUsuarioEjecutor: string;
  idPlanEstudioContexto: string;
  fechaHora: string;
  fechaDefensaContexto: string;
  estadoSorteo: string;
  estudiantePresente: boolean;
  motivoInasistencia?: string | null;
  tokenActa?: string;
  usuarioEjecutor?: {
    idUsuario: string;
    primerNombre: string;
    primerApellido: string;
    correoInstitucional: string;
    rol?: {
      nombre: string;
    };
  };
  defensa: {
    idDefensa: string;
    fechaDefensa: string;
    periodoAcademico: string;
    estadoDefensa: string;
    tipoDefensa: {
      idTipoDefensa: string;
      nombre: string;
    };
    instancia: {
      proceso: {
        estudiante: {
          idEstudiante: string;
          nombreCompleto: string;
          carnetEstudiantil: string;
          carnetIdentidad: string;
          planEstudio: {
            nombre: string;
            carrera: {
              idCarrera: string;
              nombre: string;
              facultad?: {
                nombre: string;
              };
            };
          };
        };
      };
    };
  };
  area?: {
    idAreaResultado: string;
    areaResultado: AreaResultado;
    pool?: Array<{
      area: AreaResultado;
    }>;
  };
  caso?: {
    idCasoSeleccionado: string;
    plazoLimiteEntrega?: string | null;
    casoSeleccionado: CasoResultado;
  };
}

export interface SorteoAreaResponse {
  mensaje: string;
  sorteo: any;
  areaGanadora: AreaResultado;
  indiceGanador: number;
  totalParticipantes: number;
  poolAreas: AreaResultado[];
  tokenActa: string;
}

export interface SorteoCasoResponse {
  mensaje: string;
  sorteo: any;
  casoGanador: CasoResultado;
  indiceGanador: number;
  totalCasosEnPool: number;
  plazoLimiteEntrega: string;
  tokenActa: string;
}

export interface SorteoConjuntoResponse {
  mensaje: string;
  areaGanadora: AreaResultado;
  indiceArea: number;
  casoGanador: CasoResultado;
  indiceCaso: number;
  tokenActa: string;
  sorteo: any;
}

export interface HistorialSorteosResponse {
  items: SorteoItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sorteosApi = {
  /**
   * Ejecuta el sorteo digital de Área Temática.
   */
  async sortearArea(payload: {
    idDefensa: string;
    estudiantePresente?: boolean;
    motivoInasistencia?: string;
  }): Promise<SorteoAreaResponse> {
    const { data } = await api.post<SorteoAreaResponse>('/sorteos/area', payload);
    return data;
  },

  /**
   * Ejecuta el sorteo digital de Caso de Estudio dentro del Área asignada.
   */
  async sortearCaso(payload: {
    idDefensa: string;
    estudiantePresente?: boolean;
    motivoInasistencia?: string;
  }): Promise<SorteoCasoResponse> {
    const { data } = await api.post<SorteoCasoResponse>('/sorteos/caso', payload);
    return data;
  },

  /**
   * Ejecuta el sorteo simultáneo anticipado (FCT y Psicología).
   */
  async sorteoConjunto(payload: {
    idDefensa: string;
    estudiantePresente?: boolean;
    motivoInasistencia?: string;
  }): Promise<SorteoConjuntoResponse> {
    const { data } = await api.post<SorteoConjuntoResponse>('/sorteos/conjunto', payload);
    return data;
  },

  /**
   * Consulta el historial general de sorteos con filtros.
   */
  async getHistorial(params: {
    idCarrera?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<HistorialSorteosResponse> {
    const clean: Record<string, string | number> = {};
    if (params.idCarrera && params.idCarrera !== 'ALL') clean.idCarrera = params.idCarrera;
    if (params.search && params.search.trim().length > 0) clean.search = params.search.trim();
    if (params.page) clean.page = params.page;
    if (params.limit) clean.limit = params.limit;

    const { data } = await api.get<HistorialSorteosResponse>('/sorteos', { params: clean });
    return data;
  },

  /**
   * Obtiene los detalles de un sorteo y su acta oficial.
   */
  async getSorteoById(idSorteo: string): Promise<SorteoItem> {
    const { data } = await api.get<SorteoItem>(`/sorteos/${idSorteo}`);
    return data;
  },

  /**
   * Consulta pública del estado en vivo para el celular del estudiante.
   */
  async getSesionLive(token: string): Promise<any> {
    const { data } = await api.get(`/sorteos/live/${token}`);
    return data;
  },

  /**
   * Crea una sesión en vivo de sorteo.
   */
  async crearSesionLive(payload: {
    idPostulante: string;
    nombreEstudiante: string;
    carnet: string;
    carrera: string;
    correo: string;
    tipoDefensa: string;
  }): Promise<any> {
    const { data } = await api.post('/sorteos/live/crear', payload);
    return data;
  },

  /**
   * Actualiza el estado de la sesión en vivo (giro, ganador de área, caso, etc.).
   */
  async actualizarSesionLive(token: string, update: any): Promise<any> {
    const { data } = await api.post('/sorteos/live/actualizar', { token, update });
    return data;
  },

  /**
   * Expira formalmente la sesión en vivo.
   */
  async expirarSesionLive(token: string): Promise<any> {
    const { data } = await api.post('/sorteos/live/expirar', { token });
    return data;
  },

  /**
   * Despacha la notificación oficial del sorteo al correo institucional del alumno.
   */
  async notificarEstudiante(dto: {
    correo: string;
    nombreEstudiante: string;
    carnet: string;
    carrera: string;
    areaNombre: string;
    casoCodigo: string;
    casoTitulo: string;
    casoContenido?: string;
    plazoHoras: number;
    codigoActa: string;
    hashActa: string;
  }): Promise<any> {
    const { data } = await api.post('/sorteos/notificar-estudiante', dto);
    return data;
  },

  /**
   * Heartbeat / Ping de presencia desde el móvil del estudiante en tiempo real.
   */
  async conectarEstudianteLive(token: string): Promise<any> {
    const { data } = await api.post('/sorteos/live/conectar', { token });
    return data;
  },

  /**
   * Confirmación explícita del estudiante de que está listo para iniciar el sorteo.
   */
  async confirmarEstudianteListoLive(token: string): Promise<any> {
    const { data } = await api.post('/sorteos/live/confirmar-listo', { token });
    return data;
  },

  /**
   * Despacha la invitación con el link de seguimiento en vivo al correo del estudiante.
   */
  async notificarInicioSorteo(payload: {
    token: string;
    correo: string;
    nombreEstudiante: string;
    carnet: string;
    carrera: string;
    linkLive: string;
  }): Promise<any> {
    const { data } = await api.post('/sorteos/live/notificar-inicio', payload);
    return data;
  },
};

