import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  AreaStockCriticoItem,
  DashboardEjecutivoResponse,
  FilterDashboardEjecutivoDto,
  MetricasFacultadItem,
  MetricasResumenGlobal,
} from '../dto/reportes-dashboard.dto';
import { ReportesRepository } from '../repositories/reportes.repository';

@Injectable()
export class ReportesService {
  constructor(private readonly repository: ReportesRepository) {}

  /**
   * Genera el consolidado ejecutivo con indicadores globales, stock crítico y distribución por facultad y carrera.
   */
  async getDashboardEjecutivo(
    dto: FilterDashboardEjecutivoDto,
    user: AuthenticatedUser,
  ): Promise<DashboardEjecutivoResponse> {
    let allowedCarreras: bigint[] | undefined;
    let filterCarreraId: bigint | undefined = dto.idCarrera ? BigInt(dto.idCarrera) : undefined;
    const filterFacultadId: bigint | undefined = dto.idFacultad ? BigInt(dto.idFacultad) : undefined;

    // RBAC: Jefe de Carrera con aislamiento estricto (RNF-02)
    if (user.rol === 'JEFE_CARRERA') {
      allowedCarreras = await this.repository.findCarrerasByUsuario(BigInt(user.idUsuario));

      if (filterCarreraId && !allowedCarreras.includes(filterCarreraId)) {
        throw new ForbiddenException(
          'No tienes permisos para visualizar métricas ejecutivas de otra carrera.',
        );
      }

      if (!filterCarreraId && allowedCarreras.length > 0) {
        filterCarreraId = allowedCarreras[0];
      }
    }

    // 1. Obtener estructura académica (Facultad -> Carrera -> Área -> Casos)
    const facultades = await this.repository.getEstructuraAcademica({
      idFacultad: filterFacultadId,
      allowedCarreraIds: allowedCarreras,
      idCarrera: filterCarreraId,
    });

    // 2. Obtener defensas y notas según filtros
    const defensas = await this.repository.getDefensasMetricas({
      idFacultad: filterFacultadId,
      allowedCarreraIds: allowedCarreras,
      idCarrera: filterCarreraId,
      periodoAcademico: dto.periodoAcademico,
    });

    // 3. Contar actas emitidas
    const actasEmitidas = await this.repository.countActasEmitidas(
      allowedCarreras,
      filterCarreraId,
    );

    // Contadores globales
    let totalCasos = 0;
    let casosDisponibles = 0;
    let casosAgotados = 0;
    const stockCritico: AreaStockCriticoItem[] = [];

    // Mapas para acumulación por facultad y por carrera
    const facultadesMap = new Map<
      string,
      {
        nombre: string;
        carrerasCount: number;
        casosDisponibles: number;
        areasCriticas: number;
        defensasConcluidas: number;
        postulantesPendientes: number;
        sumaNotas: number;
        totalNotas: number;
        aprobadas: number;
      }
    >();

    const carrerasMap = new Map<
      string,
      {
        nombre: string;
        facultad: string;
        casosDisponibles: number;
        areasCriticas: number;
        defensasConcluidas: number;
        postulantesPendientes: number;
        sumaNotas: number;
        totalNotas: number;
      }
    >();

    // Procesar casos y áreas
    for (const fac of facultades) {
      const facIdStr = String(fac.idFacultad);
      if (!facultadesMap.has(facIdStr)) {
        facultadesMap.set(facIdStr, {
          nombre: fac.nombre,
          carrerasCount: fac.carreras.length,
          casosDisponibles: 0,
          areasCriticas: 0,
          defensasConcluidas: 0,
          postulantesPendientes: 0,
          sumaNotas: 0,
          totalNotas: 0,
          aprobadas: 0,
        });
      }
      const facEntry = facultadesMap.get(facIdStr)!;

      for (const car of fac.carreras) {
        const carIdStr = String(car.idCarrera);
        if (!carrerasMap.has(carIdStr)) {
          carrerasMap.set(carIdStr, {
            nombre: car.nombre,
            facultad: fac.nombre,
            casosDisponibles: 0,
            areasCriticas: 0,
            defensasConcluidas: 0,
            postulantesPendientes: 0,
            sumaNotas: 0,
            totalNotas: 0,
          });
        }
        const carEntry = carrerasMap.get(carIdStr)!;

        for (const area of car.areasAcademicas) {
          let areaDisponibles = 0;

          for (const caso of area.casos) {
            totalCasos++;
            const usos = caso._count.defensas;

            if (caso.estado === 'REACTIVADO_ESPECIAL') {
              casosDisponibles++;
              areaDisponibles++;
            } else if (caso.estado === 'AGOTADO' || usos >= area.umbralDisponibilidad) {
              casosAgotados++;
            } else if (caso.estado === 'ACTIVO' || caso.estado === 'DISPONIBLE') {
              casosDisponibles++;
              areaDisponibles++;
            }
          }

          facEntry.casosDisponibles += areaDisponibles;
          carEntry.casosDisponibles += areaDisponibles;

          // Alerta de stock crítico si no alcanza el umbral mínimo reglamentario
          if (areaDisponibles < area.umbralDisponibilidad) {
            stockCritico.push({
              idArea: String(area.idArea),
              nombreArea: area.nombre,
              idCarrera: carIdStr,
              carrera: car.nombre,
              facultad: fac.nombre,
              casosDisponibles: areaDisponibles,
              umbralRequerido: area.umbralDisponibilidad,
              estadoAlerta: areaDisponibles === 0 ? 'AGOTADO' : 'CRITICO',
            });
            facEntry.areasCriticas++;
            carEntry.areasCriticas++;
          }
        }
      }
    }

    // Procesar métricas de defensas
    let defensasConcluidas = 0;
    let defensasAprobadas = 0;
    let defensasReprobadas = 0;
    let sumaNotasGlobal = 0;
    let conteoNotasGlobal = 0;
    let postulantesPendientes = 0;

    for (const d of defensas) {
      const car = d.instancia.proceso.estudiante.planEstudio.carrera;
      const carIdStr = String(car.idCarrera);
      const facIdStr = String(car.idFacultad);

      const facEntry = facultadesMap.get(facIdStr);
      const carEntry = carrerasMap.get(carIdStr);

      if (d.estadoDefensa === 'CALIFICADA') {
        defensasConcluidas++;
        if (facEntry) facEntry.defensasConcluidas++;
        if (carEntry) carEntry.defensasConcluidas++;

        if (d.nota !== null && d.nota !== undefined) {
          const numNota = Number(d.nota);
          sumaNotasGlobal += numNota;
          conteoNotasGlobal++;

          if (facEntry) {
            facEntry.sumaNotas += numNota;
            facEntry.totalNotas++;
          }
          if (carEntry) {
            carEntry.sumaNotas += numNota;
            carEntry.totalNotas++;
          }

          if (numNota >= 51 || d.resultado === 'APROBADO') {
            defensasAprobadas++;
            if (facEntry) facEntry.aprobadas++;
          } else {
            defensasReprobadas++;
          }
        }
      } else {
        // En espera de sorteo o en desarrollo de defensa
        postulantesPendientes++;
        if (facEntry) facEntry.postulantesPendientes++;
        if (carEntry) carEntry.postulantesPendientes++;
      }
    }

    const promedioGeneralNotas =
      conteoNotasGlobal > 0 ? Math.round((sumaNotasGlobal / conteoNotasGlobal) * 100) / 100 : 0;

    const resumenGlobal: MetricasResumenGlobal = {
      totalCasos,
      casosDisponibles,
      casosAgotados,
      areasStockCritico: stockCritico.length,
      defensasConcluidas,
      defensasAprobadas,
      defensasReprobadas,
      promedioGeneralNotas,
      postulantesPendientes,
      actasEmitidas,
    };

    // Transformar agrupaciones a listas estructuradas
    const distribucionFacultades: MetricasFacultadItem[] = Array.from(
      facultadesMap.entries(),
    ).map(([idFac, val]) => {
      const prom = val.totalNotas > 0 ? Math.round((val.sumaNotas / val.totalNotas) * 100) / 100 : 0;
      const tasa =
        val.defensasConcluidas > 0
          ? Math.round((val.aprobadas / val.defensasConcluidas) * 100)
          : 100;
      return {
        idFacultad: idFac,
        nombreFacultad: val.nombre,
        totalCarreras: val.carrerasCount,
        casosDisponibles: val.casosDisponibles,
        areasStockCritico: val.areasCriticas,
        defensasConcluidas: val.defensasConcluidas,
        postulantesPendientes: val.postulantesPendientes,
        promedioNota: prom,
        tasaAprobacion: tasa,
      };
    });

    const distribucionCarreras = Array.from(carrerasMap.entries()).map(([idCar, val]) => {
      const prom = val.totalNotas > 0 ? Math.round((val.sumaNotas / val.totalNotas) * 100) / 100 : 0;
      return {
        idCarrera: idCar,
        carrera: val.nombre,
        facultad: val.facultad,
        casosDisponibles: val.casosDisponibles,
        stockCriticoAreas: val.areasCriticas,
        defensasConcluidas: val.defensasConcluidas,
        postulantesPendientes: val.postulantesPendientes,
        promedioNota: prom,
      };
    });

    return {
      timestamp: new Date().toISOString(),
      filtrosAplicados: {
        idFacultad: dto.idFacultad,
        idCarrera: filterCarreraId ? String(filterCarreraId) : undefined,
        periodoAcademico: dto.periodoAcademico,
      },
      resumenGlobal,
      stockCritico,
      distribucionFacultades,
      distribucionCarreras,
    };
  }
}
