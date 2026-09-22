import api from './api';

export interface RegistroAuditoriaItem {
  id: string;
  idRegistroAuditoria: string;
  fecha: string;
  fechaHora: string;
  tipoOperacion: string;
  accion: string;
  descripcion: string;
  detalles: string;
  motivo?: string | null;
  idUsuario?: string | null;
  usuario: string;
  correoUsuario?: string | null;
  rol: string;
  idCasoEstudio?: string | null;
  casoTitulo?: string | null;
  idDefensa?: string | null;
  idSorteo?: string | null;
  valorAnterior?: any;
  valorNuevo?: any;
}

export interface AuditoriaResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: RegistroAuditoriaItem[];
}

export const auditoriaApi = {
  getLogs: async (params?: {
    tipoOperacion?: string;
    search?: string;
    fechaInicio?: string;
    fechaFin?: string;
    page?: number;
    limit?: number;
  }): Promise<AuditoriaResponse> => {
    const res = await api.get<AuditoriaResponse>('/auditoria', { params });
    return res.data;
  },
};
