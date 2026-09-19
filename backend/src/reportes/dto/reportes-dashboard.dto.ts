import { IsOptional, IsString } from 'class-validator';

export class FilterDashboardEjecutivoDto {
  @IsOptional()
  @IsString()
  idFacultad?: string;

  @IsOptional()
  @IsString()
  idCarrera?: string;

  @IsOptional()
  @IsString()
  periodoAcademico?: string;
}

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

export interface DashboardEjecutivoResponse {
  timestamp: string;
  filtrosAplicados: {
    idFacultad?: string;
    idCarrera?: string;
    periodoAcademico?: string;
  };
  resumenGlobal: MetricasResumenGlobal;
  stockCritico: AreaStockCriticoItem[];
  distribucionFacultades: MetricasFacultadItem[];
  distribucionCarreras: Array<{
    idCarrera: string;
    carrera: string;
    facultad: string;
    casosDisponibles: number;
    stockCriticoAreas: number;
    defensasConcluidas: number;
    postulantesPendientes: number;
    promedioNota: number;
  }>;
}
