import api from './api';

export interface AreaAcademica {
  idArea: string;
  idCarrera: string;
  nombre: string;
  umbralDisponibilidad: number;
  estado: string;
  carrera?: {
    idCarrera: string;
    nombre: string;
    facultad?: {
      idFacultad: string;
      nombre: string;
    };
  };
  _count?: {
    casos: number;
  };
}

export interface CasoEstudio {
  idCasoEstudio: string;
  idArea: string;
  titulo: string;
  contenido: string;
  documentoAdjunto?: string | null;
  estado: string;
  estadoEfectivo?: string;
  usos: number;
  umbral: number;
  area: AreaAcademica;
  _count?: {
    defensas: number;
    sorteosCaso: number;
  };
  defensas?: Array<{
    idDefensa: string;
    fechaDefensa: string;
    resultado?: string;
    instancia?: {
      proceso?: {
        estudiante?: {
          nombreCompleto: string;
          carnetEstudiantil: string;
        };
      };
    };
  }>;
}

export interface MetricasCasos {
  totalCasos: number;
  disponibles: number;
  agotados: number;
  inactivos: number;
  areasCubiertas: number;
  stockCritico: Array<{
    idArea: string;
    nombreArea: string;
    carrera: string;
    casosDisponibles: number;
    umbralRequerido: number;
    mensajeAlerta: string;
  }>;
}

export interface FilterCasosParams {
  idCarrera?: string;
  idArea?: string;
  estado?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CasosResponse {
  items: CasoEstudio[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCasoPayload {
  idArea: string;
  titulo: string;
  contenido: string;
  documentoAdjunto?: string;
}

export interface UpdateCasoPayload {
  idArea?: string;
  titulo?: string;
  contenido?: string;
  estado?: string;
  documentoAdjunto?: string;
}

export interface CreateAreaPayload {
  idCarrera: string;
  nombre: string;
  umbralDisponibilidad?: number;
}

export const casosApi = {
  /**
   * Obtiene las métricas generales de casos y áreas con alertas de stock.
   */
  async getMetricas(idCarrera?: string): Promise<MetricasCasos> {
    const params = idCarrera && idCarrera !== 'ALL' ? { idCarrera } : {};
    const { data } = await api.get<MetricasCasos>('/casos/metricas', { params });
    return data;
  },

  /**
   * Obtiene la lista de áreas académicas vigentes para el usuario y carrera.
   */
  async getAreas(idCarrera?: string): Promise<AreaAcademica[]> {
    const params = idCarrera && idCarrera !== 'ALL' ? { idCarrera } : {};
    const { data } = await api.get<AreaAcademica[]>('/casos/areas', { params });
    return data;
  },

  /**
   * Registra una nueva área académica para una carrera.
   */
  async createArea(payload: CreateAreaPayload): Promise<AreaAcademica> {
    const { data } = await api.post<AreaAcademica>('/casos/areas', payload);
    return data;
  },

  /**
   * Consulta el inventario paginado de casos con filtros.
   */
  async getCasos(params: FilterCasosParams = {}): Promise<CasosResponse> {
    const cleanParams: Record<string, string | number> = {};
    if (params.idCarrera && params.idCarrera !== 'ALL') cleanParams.idCarrera = params.idCarrera;
    if (params.idArea && params.idArea !== 'ALL') cleanParams.idArea = params.idArea;
    if (params.estado && params.estado !== 'ALL') cleanParams.estado = params.estado;
    if (params.search && params.search.trim().length > 0) cleanParams.search = params.search.trim();
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;

    const { data } = await api.get<CasosResponse>('/casos', { params: cleanParams });
    return data;
  },

  /**
   * Obtiene el detalle completo de un caso de estudio.
   */
  async getCasoById(idCaso: string): Promise<CasoEstudio> {
    const { data } = await api.get<CasoEstudio>(`/casos/${idCaso}`);
    return data;
  },

  /**
   * Registra un nuevo caso de estudio.
   */
  async createCaso(payload: CreateCasoPayload): Promise<{ mensaje: string; caso: CasoEstudio }> {
    const { data } = await api.post<{ mensaje: string; caso: CasoEstudio }>('/casos', payload);
    return data;
  },

  /**
   * Actualiza el planteamiento o título de un caso existente.
   */
  async updateCaso(
    idCaso: string,
    payload: UpdateCasoPayload,
  ): Promise<{ mensaje: string; caso: CasoEstudio }> {
    const { data } = await api.put<{ mensaje: string; caso: CasoEstudio }>(`/casos/${idCaso}`, payload);
    return data;
  },

  /**
   * Alterna el estado del caso (DISPONIBLE <-> INACTIVO).
   */
  async toggleEstado(idCaso: string): Promise<{ mensaje: string; caso: CasoEstudio }> {
    const { data } = await api.patch<{ mensaje: string; caso: CasoEstudio }>(
      `/casos/${idCaso}/estado`,
    );
    return data;
  },

  /**
   * Reactiva de forma extraordinaria un caso agotado por excepción académica (Solo Jefe de Carrera).
   */
  async reactivarCasoEspecial(
    idCaso: string,
    motivo: string,
  ): Promise<{ mensaje: string; caso: CasoEstudio }> {
    const { data } = await api.patch<{ mensaje: string; caso: CasoEstudio }>(
      `/casos/${idCaso}/reactivar-especial`,
      { motivo },
    );
    return data;
  },

  /**
   * Obtiene la lista optimizada de casos para una carrera mediante vista SQL.
   */
  async getCasosPorCarreraVista(
    idCarrera: string,
    params: { idArea?: string; estado?: string; search?: string; page?: number; limit?: number } = {},
  ): Promise<VistaCasosResponse> {
    const cleanParams: Record<string, string | number> = {};
    if (params.idArea && params.idArea !== 'ALL') cleanParams.idArea = params.idArea;
    if (params.estado && params.estado !== 'ALL') cleanParams.estado = params.estado;
    if (params.search && params.search.trim().length > 0) cleanParams.search = params.search.trim();
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;

    const { data } = await api.get<VistaCasosResponse>(`/casos/vistas/carrera/${idCarrera}/casos`, {
      params: cleanParams,
    });
    return data;
  },

  /**
   * Obtiene el resumen consolidado de áreas y stock para una carrera mediante vista SQL.
   */
  async getAreasPorCarreraVista(idCarrera: string): Promise<VistaAreaItem[]> {
    const { data } = await api.get<VistaAreaItem[]>(`/casos/vistas/carrera/${idCarrera}/areas`);
    return data;
  },
};

export interface VistaCasoItem {
  idCasoEstudio: string;
  titulo: string;
  contenido: string;
  documentoAdjunto?: string | null;
  estadoBase: string;
  idArea: string;
  nombreArea: string;
  umbralDisponibilidad: number;
  estadoArea: string;
  idCarrera: string;
  nombreCarrera: string;
  idFacultad: string;
  nombreFacultad: string;
  totalUsos: number;
  totalSorteos: number;
  estadoEfectivo: string;
  esDisponibleParaSorteo: boolean;
}

export interface VistaCasosResponse {
  items: VistaCasoItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VistaAreaItem {
  idArea: string;
  nombreArea: string;
  umbralDisponibilidad: number;
  estadoArea: string;
  idCarrera: string;
  nombreCarrera: string;
  idFacultad: string;
  nombreFacultad: string;
  totalCasos: number;
  casosDisponibles: number;
  casosAgotados: number;
  casosInactivos: number;
  stockCritico: boolean;
  mensajeAlerta: string;
}

