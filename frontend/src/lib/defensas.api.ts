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
  auditorias?: Array<{
    idRegistroAuditoria: string;
    tipoOperacion: string;
    fechaHora: string;
    valorNuevo?: {
      nota?: number;
      resultado?: string;
      estadoDefensa?: string;
      tribunal?: {
        presidente?: string;
        secretario?: string;
        vocal?: string;
      };
      observaciones?: string;
    };
    usuario?: {
      idUsuario: string;
      primerNombre: string;
      primerApellido: string;
      correoInstitucional: string;
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

export interface TribunalData {
  presidente?: string;
  secretario?: string;
  vocal?: string;
}

export interface CalificarDefensaPayload {
  nota: number;
  resultado: string;
  estadoDefensa?: string;
  observaciones?: string;
  tribunal?: TribunalData;
}

export interface UpdateDefensaPayload {
  fechaDefensa?: string;
  tipoDefensa?: 'INTERNA' | 'EXTERNA';
  periodoAcademico?: string;
  estadoDefensa?: string;
  nota?: number;
  resultado?: string;
  observaciones?: string;
  tribunal?: TribunalData;
}

/**
 * Convierte un número de 0 a 100 en su representación textual literal en español.
 */
export function numeroALetras(num: number): string {
  if (num < 0 || num > 100) return String(num);
  const entero = Math.floor(num);
  const decimales = Math.round((num - entero) * 100);

  const unidades = [
    'Cero', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve',
    'Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve',
  ];

  const decenas = [
    '', '', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa',
  ];

  let literal = '';

  if (entero === 100) {
    literal = 'Cien';
  } else if (entero < 20) {
    literal = unidades[entero];
  } else if (entero < 30) {
    if (entero === 20) literal = 'Veinte';
    else {
      const u = entero - 20;
      const acentos = ['', 'Veintiuno', 'Veintidós', 'Veintitrés', 'Veinticuatro', 'Veinticinco', 'Veintiséis', 'Veintisiete', 'Veintiocho', 'Veintinueve'];
      literal = acentos[u] || `Veinti${unidades[u].toLowerCase()}`;
    }
  } else {
    const d = Math.floor(entero / 10);
    const u = entero % 10;
    if (u === 0) {
      literal = decenas[d];
    } else {
      literal = `${decenas[d]} y ${unidades[u].toLowerCase()}`;
    }
  }

  if (decimales > 0) {
    return `${literal} con ${decimales}/100`;
  }
  return literal;
}

/**
 * Determina el resultado académico oficial y estilo según la escala UPTECSA (0 - 100).
 */
export function determinarEscalaResultado(nota: number): {
  escala: string;
  resultadoDefault: string;
  color: string;
  badgeBg: string;
} {
  if (nota < 51) {
    return {
      escala: 'Insuficiente / Reprobado',
      resultadoDefault: 'REPROBADO',
      color: 'text-red-700',
      badgeBg: 'bg-red-50 text-red-800 border-red-300',
    };
  }
  if (nota < 70) {
    return {
      escala: 'Aprobado (Regular)',
      resultadoDefault: 'APROBADO',
      color: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    };
  }
  if (nota < 85) {
    return {
      escala: 'Aprobado (Bueno)',
      resultadoDefault: 'APROBADO',
      color: 'text-emerald-800',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    };
  }
  if (nota < 95) {
    return {
      escala: 'Aprobado con Felicitación (Sobresaliente)',
      resultadoDefault: 'APROBADO_CON_FELICITACION',
      color: 'text-indigo-800',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    };
  }
  return {
    escala: 'Aprobado con Mención de Honor (Excelente)',
    resultadoDefault: 'APROBADO_CON_MENCION',
    color: 'text-amber-800',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
  };
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
   * Registra la calificación formal y dictamen del tribunal para una defensa.
   */
  async calificarDefensa(
    idDefensa: string,
    payload: CalificarDefensaPayload,
  ): Promise<{ mensaje: string; defensa: Defensa }> {
    const { data } = await api.put<{ mensaje: string; defensa: Defensa }>(
      `/defensas/${idDefensa}/calificar`,
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
