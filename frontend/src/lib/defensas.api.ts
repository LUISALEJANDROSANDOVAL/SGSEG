import api from './api';

export interface ReglasSorteo {
  modalidad: 'ANTICIPADO_CONJUNTO' | 'SEPARADO_DIA_DEFENSA';
  descripcionModalidad: string;
  fechaSorteoAreaRecomendada: string;
  fechaSorteoCasoRecomendada: string;
  plazoPreparacionDias?: number;
  tiempoResolucionHoras?: number;
  diasParaDefensa: number;
}

export interface Defensa {
  idDefensa: string;
  idInstancia: string;
  idTipoDefensa: string;
  idCasoUtilizado?: string | null;
  fechaDefensa: string;
  periodoAcademico: string;
  estadoDefensa: string; // 'PROGRAMADA' | 'AREA_SORTEADA' | 'CASO_ASIGNADO' | 'DEFENDIDO' | 'CALIFICADO'
  nota?: number | null;
  resultado?: string | null;
  tipoDefensa: {
    idTipoDefensa: string;
    nombre: string; // 'INTERNA' | 'EXTERNA'
    descripcion?: string;
  };
  reglasSorteo?: ReglasSorteo;
  instancia: {
    idInstancia: string;
    numeroInstancia: number;
    estadoInstancia: string;
    proceso: {
      idProceso: string;
      estadoProceso: string;
      estudiante: {
        idEstudiante: string;
        nombreCompleto: string;
        carnetEstudiantil: string;
        carnetIdentidad: string;
        correo: string;
        planEstudio: {
          idPlanEstudio: string;
          nombre: string;
          carrera: {
            idCarrera: string;
            nombre: string;
            facultad?: {
              idFacultad: string;
              nombre: string;
            };
          };
        };
      };
    };
  };
  casoUtilizado?: {
    idCasoEstudio: string;
    titulo: string;
    area?: {
      idArea: string;
      nombre: string;
    };
  } | null;
  sorteos?: Array<{
    idSorteo: string;
    fechaHora: string;
    area?: {
      areaResultado: {
        idArea: string;
        nombre: string;
      };
    };
    caso?: {
      casoSeleccionado: {
        idCasoEstudio: string;
        titulo: string;
      };
    };
  }>;
}

export interface EmbudoEstados {
  total: number;
  programados: number;
  areaSorteada: number;
  casoAsignado: number;
  defendidos: number;
  calificados: number;
}

export interface FilterDefensasParams {
  idFacultad?: string;
  idCarrera?: string;
  estadoDefensa?: string;
  tipoDefensa?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DefensasResponse {
  items: Defensa[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProgramarDefensaPayload {
  idEstudiante: string;
  tipoDefensa: 'INTERNA' | 'EXTERNA';
  fechaDefensa: string;
  periodoAcademico?: string;
}

export interface UpdateDefensaPayload {
  fechaDefensa?: string;
  tipoDefensa?: 'INTERNA' | 'EXTERNA';
  periodoAcademico?: string;
  estadoDefensa?: string;
  nota?: number;
  resultado?: string;
}

export const defensasApi = {
  /**
   * Obtiene el resumen del embudo de estados (Pipeline).
   */
  async getEmbudo(): Promise<EmbudoEstados> {
    const { data } = await api.get<EmbudoEstados>('/defensas/embudo');
    return data;
  },

  /**
   * Consulta las alertas operativas de defensas próximas sin sorteo.
   */
  async getAlertas(dias = 15): Promise<Defensa[]> {
    const { data } = await api.get<Defensa[]>('/defensas/alertas', {
      params: { dias },
    });
    return data;
  },

  /**
   * Consulta el calendario general de defensas con filtros.
   */
  async getDefensas(params: FilterDefensasParams = {}): Promise<DefensasResponse> {
    const cleanParams: Record<string, string | number> = {};
    if (params.idFacultad && params.idFacultad !== 'ALL') cleanParams.idFacultad = params.idFacultad;
    if (params.idCarrera && params.idCarrera !== 'ALL') cleanParams.idCarrera = params.idCarrera;
    if (params.estadoDefensa && params.estadoDefensa !== 'ALL') cleanParams.estadoDefensa = params.estadoDefensa;
    if (params.tipoDefensa && params.tipoDefensa !== 'ALL') cleanParams.tipoDefensa = params.tipoDefensa;
    if (params.fechaDesde) cleanParams.fechaDesde = params.fechaDesde;
    if (params.fechaHasta) cleanParams.fechaHasta = params.fechaHasta;
    if (params.search && params.search.trim().length > 0) cleanParams.search = params.search.trim();
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;

    const { data } = await api.get<DefensasResponse>('/defensas', { params: cleanParams });
    return data;
  },

  /**
   * Obtiene el detalle de una defensa con su historial.
   */
  async getDefensaById(idDefensa: string): Promise<Defensa> {
    const { data } = await api.get<Defensa>(`/defensas/${idDefensa}`);
    return data;
  },

  /**
   * Programa una nueva defensa para un estudiante.
   */
  async programarDefensa(
    payload: ProgramarDefensaPayload,
  ): Promise<{ mensaje: string; defensa: Defensa; reglasSorteo: ReglasSorteo }> {
    const { data } = await api.post<{ mensaje: string; defensa: Defensa; reglasSorteo: ReglasSorteo }>(
      '/defensas/programar',
      payload,
    );
    return data;
  },

  /**
   * Actualiza los datos de una defensa programada.
   */
  async updateDefensa(
    idDefensa: string,
    payload: UpdateDefensaPayload,
  ): Promise<{ mensaje: string; defensa: Defensa }> {
    const { data } = await api.put<{ mensaje: string; defensa: Defensa }>(
      `/defensas/${idDefensa}`,
      payload,
    );
    return data;
  },
};
