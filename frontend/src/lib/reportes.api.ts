import api from './api';

export interface MetricasResumenGlobal {
  totalCasos: number;
  casosDisponibles: number;
  casosAgotados: number;
  areasStockCritico: number;
  defensasConcluidas: number;
  defensasAprobadas: number;
  defensasReprobadas: number;
  promedioGeneralNotas: number;
  postulantesPendientes: number;
  actasEmitidas: number;
}

export interface AreaStockCriticoItem {
  idArea: string;
  nombreArea: string;
  idCarrera: string;
  carrera: string;
  facultad: string;
  casosDisponibles: number;
  umbralRequerido: number;
  estadoAlerta: 'CRITICO' | 'AGOTADO';
}

export interface MetricasFacultadItem {
  idFacultad: string;
  nombreFacultad: string;
  totalCarreras: number;
  casosDisponibles: number;
  areasStockCritico: number;
  defensasConcluidas: number;
  postulantesPendientes: number;
  promedioNota: number;
  tasaAprobacion: number;
}

export interface MetricasCarreraItem {
  idCarrera: string;
  carrera: string;
  facultad: string;
  casosDisponibles: number;
  stockCriticoAreas: number;
  defensasConcluidas: number;
  postulantesPendientes: number;
  promedioNota: number;
}

export interface DashboardEjecutivoData {
  timestamp: string;
  filtrosAplicados: {
    idFacultad?: string;
    idCarrera?: string;
    periodoAcademico?: string;
  };
  resumenGlobal: MetricasResumenGlobal;
  stockCritico: AreaStockCriticoItem[];
  distribucionFacultades: MetricasFacultadItem[];
  distribucionCarreras: MetricasCarreraItem[];
}

export const reportesApi = {
  /**
   * Obtiene el consolidado analítico del Dashboard Ejecutivo.
   */
  async getDashboardEjecutivo(params?: {
    idFacultad?: string;
    idCarrera?: string;
    periodoAcademico?: string;
  }): Promise<DashboardEjecutivoData> {
    const { data } = await api.get('/reportes/dashboard-ejecutivo', { params });
    return data;
  },
};
