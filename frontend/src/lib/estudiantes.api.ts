import api from './api';

export const apiClient = api;

export interface PlanEstudio {
  idPlanEstudio: string;
  idCarrera: string;
  nombre: string;
  estadoVigencia: string;
}

export interface Facultad {
  idFacultad: string;
  nombre: string;
}

export interface Carrera {
  idCarrera: string;
  idFacultad: string;
  nombre: string;
  facultad?: Facultad;
  planesEstudio?: PlanEstudio[];
}

export interface Estudiante {
  idEstudiante: string;
  idPlanEstudio: string;
  carnetEstudiantil: string;
  carnetIdentidad: string;
  nombreCompleto: string;
  correo: string;
  estado: string;
  fechaRegistro: string;
  planEstudio?: PlanEstudio & {
    carrera?: Carrera & {
      facultad?: Facultad;
    };
  };
}

export interface FilterEstudiantesParams {
  idCarrera?: string;
  idPlanEstudio?: string;
  search?: string;
  estado?: string;
  incluirEliminados?: boolean;
  page?: number;
  limit?: number;
}

export interface EstudiantesResponse {
  items: Estudiante[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RawEstudianteInput {
  carnetEstudiantil: string;
  carnetIdentidad: string;
  nombreCompleto?: string;
  nombres?: string;
  primerApellido?: string;
  segundoApellido?: string;
  correo?: string;
  idCarrera?: string;
  nombreCarrera?: string;
  idPlanEstudio?: string;
  nombrePlanEstudio?: string;
}

export interface BulkUpsertPayload {
  estudiantes: RawEstudianteInput[];
  idCarreraPorDefecto?: string;
  nombreCarreraPorDefecto?: string;
  nombrePlanPorDefecto?: string;
  crearPlanesFaltantes?: boolean;
  batchSize?: number;
}

export interface BulkUpsertResult {
  total: number;
  creados: number;
  actualizados: number;
  planesCreados: number;
  planesCreadosDetalle: Array<{
    idPlanEstudio: string;
    idCarrera: string;
    nombre: string;
    estadoVigencia: string;
  }>;
  errores: Array<{
    indice?: number;
    carnet?: string;
    mensaje: string;
  }>;
  duracionMs: number;
}

export const estudiantesApi = {
  /**
   * Obtiene la lista de estudiantes con filtrado por carrera, plan y búsqueda.
   */
  async getEstudiantes(params: FilterEstudiantesParams = {}): Promise<EstudiantesResponse> {
    const cleanParams: Record<string, string | number | boolean> = {};
    if (params.idCarrera && params.idCarrera !== 'ALL') cleanParams.idCarrera = params.idCarrera;
    if (params.idPlanEstudio && params.idPlanEstudio !== 'ALL') cleanParams.idPlanEstudio = params.idPlanEstudio;
    if (params.search && params.search.trim().length > 0) cleanParams.search = params.search.trim();
    if (params.estado && params.estado !== 'ALL') cleanParams.estado = params.estado;
    if (params.incluirEliminados !== undefined) cleanParams.incluirEliminados = params.incluirEliminados;
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;

    const { data } = await apiClient.get<EstudiantesResponse>('/estudiantes', {
      params: cleanParams,
    });
    return data;
  },

  /**
   * Obtiene las carreras con sus facultades y planes vigentes.
   */
  async getCarreras(): Promise<Carrera[]> {
    const { data } = await apiClient.get<Carrera[]>('/estudiantes/carreras');
    return data;
  },

  /**
   * Obtiene un estudiante por su carnet institucional.
   */
  async getEstudianteByCarnet(carnet: string): Promise<Estudiante> {
    const { data } = await apiClient.get<Estudiante>(`/estudiantes/carnet/${encodeURIComponent(carnet)}`);
    return data;
  },

  /**
   * Ejecuta la carga e inserción/actualización masiva transaccional.
   */
  async bulkUpsert(payload: BulkUpsertPayload): Promise<BulkUpsertResult> {
    const { data } = await apiClient.post<BulkUpsertResult>('/estudiantes/bulk-upsert', payload);
    return data;
  },

  /**
   * Crea o inscribe individualmente a un nuevo estudiante postulante.
   */
  async createEstudiante(payload: {
    carnetEstudiantil: string;
    carnetIdentidad: string;
    nombreCompleto: string;
    correo?: string;
    idCarrera?: string;
    idPlanEstudio?: string;
    nombrePlanEstudio?: string;
    estado?: string;
  }): Promise<{ operacion: string; estudiante: Estudiante }> {
    const { data } = await apiClient.post<{ operacion: string; estudiante: Estudiante }>(
      '/estudiantes',
      payload,
    );
    return data;
  },

  /**
   * Soft-delete de un estudiante para preservar su historial.
   */
  async softDelete(idEstudiante: string): Promise<{ mensaje: string; estudiante: Estudiante }> {
    const { data } = await apiClient.delete<{ mensaje: string; estudiante: Estudiante }>(
      `/estudiantes/${idEstudiante}`,
    );
    return data;
  },

  /**
   * Restaura un estudiante eliminado lógicamente.
   */
  async restore(idEstudiante: string): Promise<{ mensaje: string; estudiante: Estudiante }> {
    const { data } = await apiClient.patch<{ mensaje: string; estudiante: Estudiante }>(
      `/estudiantes/${idEstudiante}/restore`,
    );
    return data;
  },
};
