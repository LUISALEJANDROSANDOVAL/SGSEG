import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Building2,
  Download,
  Filter,
  Printer,
  ShieldCheck,
} from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { defensasApi, type EmbudoEstados, type Defensa } from '@/lib/defensas.api'
import { casosApi, type AreaAcademica, type MetricasCasos } from '@/lib/casos.api'
import { sorteosApi, type SorteoItem } from '@/lib/sorteos.api'
import { reportesApi, type DashboardEjecutivoData } from '@/lib/reportes.api'
import { useAuth } from '@/context/AuthContext'
import { esJefeCarrera, getJefeCarreraId, getJefeCarreraNombre } from '@/lib/auth-helpers'

export default function PaginaReportes() {
  const { user } = useAuth()
  const isJefe = esJefeCarrera(user)
  const jefeCarreraId = getJefeCarreraId(user)
  const carreraNombre = getJefeCarreraNombre(user)

  const [dashboardData, setDashboardData] = useState<DashboardEjecutivoData | null>(null)
  const [filtroFacultad, setFiltroFacultad] = useState<string>('')
  const [filtroCarrera, setFiltroCarrera] = useState<string>('')
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('')

  const [embudo, setEmbudo] = useState<EmbudoEstados | null>(null)
  const [metricasCasos, setMetricasCasos] = useState<MetricasCasos | null>(null)
  const [areas, setAreas] = useState<AreaAcademica[]>([])
  const [sorteos, setSorteos] = useState<SorteoItem[]>([])
  const [defensas, setDefensas] = useState<Defensa[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const cargarReportes = async () => {
    setLoading(true)
    try {
      const idCarreraFiltro = isJefe && jefeCarreraId ? jefeCarreraId : filtroCarrera || undefined
      const idFacultadFiltro = isJefe ? undefined : filtroFacultad || undefined

      const [embudoData, casosData, areasData, sorteosData, defensasData, dashboardEjecutivo] = await Promise.all([
        defensasApi.getEmbudo(),
        casosApi.getMetricas(idCarreraFiltro),
        casosApi.getAreas(idCarreraFiltro),
        sorteosApi.getHistorial({ idCarrera: idCarreraFiltro, limit: 100 }),
        defensasApi.getDefensas({ idCarrera: idCarreraFiltro, limit: 100 }),
        reportesApi.getDashboardEjecutivo({
          idCarrera: idCarreraFiltro,
          idFacultad: idFacultadFiltro,
          periodoAcademico: filtroPeriodo || undefined,
        }).catch((err) => {
          console.warn('Dashboard ejecutivo endpoint fallback:', err);
          return null;
        }),
      ])

      setEmbudo(embudoData)
      setMetricasCasos(casosData)
      setAreas(areasData)
      setSorteos(sorteosData.items)
      setDefensas(defensasData.items)
      if (dashboardEjecutivo) {
        setDashboardData(dashboardEjecutivo)
      }
    } catch (e) {
      console.error('Error cargando reportes consolidados:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarReportes()
  }, [user, isJefe, jefeCarreraId, filtroFacultad, filtroCarrera, filtroPeriodo])

  // Exportar reporte consolidado en CSV
  const exportarCSV = () => {
    if (defensas.length === 0) return

    const encabezados = [
      'ID_DEFENSA',
      'ESTUDIANTE',
      'CARNET_ESTUDIANTIL',
      'CI',
      'CARRERA',
      'FACULTAD',
      'TIPO_DEFENSA',
      'FECHA_DEFENSA',
      'ESTADO_ACTUAL',
      'MODALIDAD_SORTEO',
      'FECHA_RECOMENDADA_SORTEO',
      'CASO_ASIGNADO',
    ]

    const filas = defensas.map((d) => {
      const est = d.instancia.proceso.estudiante
      const car = est.planEstudio.carrera
      return [
        d.idDefensa,
        `"${est.nombreCompleto.replace(/"/g, '""')}"`,
        `"${est.carnetEstudiantil}"`,
        `"${est.carnetIdentidad}"`,
        `"${car.nombre}"`,
        `"${car.facultad?.nombre || 'UPTECSA'}"`,
        d.tipoDefensa.nombre,
        new Date(d.fechaDefensa).toLocaleDateString(),
        d.estadoDefensa,
        `"${d.reglasSorteo?.descripcionModalidad || ''}"`,
        d.reglasSorteo?.fechaSorteoAreaRecomendada || '',
        `"${d.casoUtilizado?.titulo || 'Sin asignar'}"`,
      ].join(',')
    })

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [encabezados.join(','), ...filas].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    const slugCarrera = isJefe && carreraNombre ? `_${carreraNombre.toLowerCase().replace(/\s+/g, '_')}` : '_consolidado'
    link.setAttribute('download', `reporte_defensas${slugCarrera}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <EncabezadoPagina
          titulo={isJefe ? `Reporte de Programa: ${carreraNombre || 'Carrera'}` : 'Informes y Reportes Consolidados'}
          descripcion={
            isJefe
              ? 'Métricas académicas, rendimiento por área temática y exportación del padrón exclusivo de su carrera.'
              : 'Panel estratégico para Vicerrectorado, Dirección Académica y Coordinación. Métricas operativas, rendimiento por área y exportación de padrones auditados.'
          }
          accion={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Printer className="size-3.5" />
                <span>Imprimir Resumen</span>
              </button>
              <button
                type="button"
                onClick={exportarCSV}
                className="flex items-center gap-2 bg-crimson px-4 py-2 text-xs font-semibold text-white hover:opacity-95 transition-opacity"
              >
                <Download className="size-3.5" />
                <span>Exportar Padrón (CSV)</span>
              </button>
            </div>
          }
        />

        {/* Insignia de Aislamiento para Jefe de Carrera */}
        {isJefe && (
          <div className="flex items-center justify-between border-l-4 border-l-crimson border border-line bg-surface p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-crimson/10 text-crimson">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-crimson uppercase">
                    Aislamiento Estricto por Carrera (RNF-02)
                  </span>
                  <span className="bg-neutral-200 text-neutral-800 text-[10px] font-semibold px-2 py-0.5">
                    Reporte de Carrera
                  </span>
                </div>
                <p className="text-xs font-semibold text-neutral-900 mt-0.5">
                  Visualizando inventario, métricas de aprobación y padrón exclusivo de:{' '}
                  <span className="text-crimson font-bold">{carreraNombre || 'Tu Carrera'}</span>
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-neutral-500 font-mono">
              carreraId: {jefeCarreraId}
            </span>
          </div>
        )}

        {/* Barra de Filtros Ejecutivos (para Vicerrectorado y Coordinación) */}
        {!isJefe && (
          <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-surface p-3.5 text-xs">
            <div className="flex items-center gap-2 text-neutral-600 font-medium">
              <Filter className="size-4 text-crimson" />
              <span>Filtros Ejecutivos:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500">Facultad:</span>
                <select
                  value={filtroFacultad}
                  onChange={(e) => setFiltroFacultad(e.target.value)}
                  className="border border-line bg-white px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:border-crimson"
                >
                  <option value="">Todas las Facultades</option>
                  <option value="1">Ciencias y Tecnología (FCT)</option>
                  <option value="2">Ciencias Empresariales (FCE)</option>
                  <option value="3">Ciencias Jurídicas y Sociales (FCJS)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500">Carrera:</span>
                <select
                  value={filtroCarrera}
                  onChange={(e) => setFiltroCarrera(e.target.value)}
                  className="border border-line bg-white px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:border-crimson"
                >
                  <option value="">Todas las Carreras</option>
                  {dashboardData?.distribucionCarreras.map((c) => (
                    <option key={c.idCarrera} value={c.idCarrera}>
                      {c.carrera}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500">Período:</span>
                <select
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                  className="border border-line bg-white px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:border-crimson"
                >
                  <option value="">Todos los Períodos</option>
                  <option value="2-2026">Semestre 2-2026</option>
                  <option value="1-2026">Semestre 1-2026</option>
                </select>
              </div>

              {(filtroFacultad || filtroCarrera || filtroPeriodo) && (
                <button
                  type="button"
                  onClick={() => {
                    setFiltroFacultad('')
                    setFiltroCarrera('')
                    setFiltroPeriodo('')
                  }}
                  className="text-[11px] text-crimson hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tarjetas KPI de Supervisión Ejecutiva */}
        <section className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-5">
          {/* KPI 1: Casos Disponibles */}
          <div className="bg-white px-4 py-4">
            <p className="text-[10.5px] tracking-[0.1em] text-neutral-500 uppercase font-semibold">
              Casos Disponibles
            </p>
            <p className="mt-1.5 text-2xl font-bold text-neutral-900">
              {loading
                ? '—'
                : dashboardData
                ? dashboardData.resumenGlobal.casosDisponibles
                : metricasCasos
                ? metricasCasos.disponibles
                : 0}
            </p>
            <p className="text-[10.5px] text-neutral-500 mt-0.5">
              {dashboardData ? `${dashboardData.resumenGlobal.casosAgotados} agotados (≥ 2 usos)` : '< 2 usos reglamentarios'}
            </p>
          </div>

          {/* KPI 2: Áreas en Stock Crítico */}
          <div className="bg-white px-4 py-4">
            <p className="text-[10.5px] tracking-[0.1em] text-neutral-500 uppercase font-semibold">
              Stock Crítico Áreas
            </p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold ${
                  (dashboardData?.resumenGlobal.areasStockCritico || 0) > 0 ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                {loading
                  ? '—'
                  : dashboardData
                  ? dashboardData.resumenGlobal.areasStockCritico
                  : metricasCasos
                  ? metricasCasos.stockCritico.length
                  : 0}
              </span>
              {(dashboardData?.resumenGlobal.areasStockCritico || 0) > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-1.5 py-0.5 rounded-xs">
                  Alerta
                </span>
              )}
            </div>
            <p className="text-[10.5px] text-neutral-500 mt-0.5">Por debajo de umbral mínimo</p>
          </div>

          {/* KPI 3: Defensas Concluidas */}
          <div className="bg-white px-4 py-4">
            <p className="text-[10.5px] tracking-[0.1em] text-neutral-500 uppercase font-semibold">
              Defensas Concluidas
            </p>
            <p className="mt-1.5 text-2xl font-bold text-neutral-900">
              {loading
                ? '—'
                : dashboardData
                ? dashboardData.resumenGlobal.defensasConcluidas
                : embudo
                ? embudo.calificados
                : 0}
            </p>
            <p className="text-[10.5px] text-emerald-700 mt-0.5 font-medium">
              {dashboardData
                ? `${dashboardData.resumenGlobal.defensasAprobadas} aprobadas · Nota prom: ${dashboardData.resumenGlobal.promedioGeneralNotas}`
                : 'Con dictamen de tribunal'}
            </p>
          </div>

          {/* KPI 4: Postulantes Pendientes */}
          <div className="bg-white px-4 py-4">
            <p className="text-[10.5px] tracking-[0.1em] text-neutral-500 uppercase font-semibold">
              Postulantes Pendientes
            </p>
            <p className="mt-1.5 text-2xl font-bold text-amber-700">
              {loading
                ? '—'
                : dashboardData
                ? dashboardData.resumenGlobal.postulantesPendientes
                : embudo
                ? embudo.programados + embudo.areaSorteada + embudo.casoAsignado
                : 0}
            </p>
            <p className="text-[10.5px] text-neutral-500 mt-0.5">En espera de sorteo o defensa</p>
          </div>

          {/* KPI 5: Actas Oficiales Emitidas */}
          <div className="bg-white px-4 py-4">
            <p className="text-[10.5px] tracking-[0.1em] text-neutral-500 uppercase font-semibold">
              Actas Emitidas
            </p>
            <p className="mt-1.5 text-2xl font-bold text-neutral-900">
              {loading ? '—' : dashboardData ? dashboardData.resumenGlobal.actasEmitidas : sorteos.length}
            </p>
            <p className="text-[10.5px] text-neutral-500 mt-0.5">Certificadas con hash SHA-256</p>
          </div>
        </section>

        {/* Embudo y Distribución */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Distribución por Áreas Académicas */}
          <section className="border border-line bg-white shadow-xs">
            <header className="border-b border-line px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
                  Inventario de Áreas Académicas
                </h2>
                <p className="text-xs text-neutral-500">
                  Disponibilidad de casos y estado de stock por área de conocimiento
                </p>
              </div>
              <span className="text-xs font-semibold bg-surface border border-line px-2.5 py-1">
                {areas.length} Áreas
              </span>
            </header>

            <ul className="divide-y divide-line max-h-[400px] overflow-y-auto">
              {areas.length === 0 ? (
                <li className="p-6 text-center text-xs text-neutral-400">
                  No hay áreas registradas actualmente.
                </li>
              ) : (
                areas.map((area) => {
                  const numCasos = area._count?.casos || 0
                  return (
                    <li key={area.idArea} className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50/60">
                      <div>
                        <p className="text-xs font-bold text-neutral-900">{area.nombre}</p>
                        <p className="text-[11px] text-neutral-500">
                          {area.carrera?.nombre || 'Carrera'} · Umbral mínimo: {area.umbralDisponibilidad} casos
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 text-[11px] font-bold bg-surface border border-line text-neutral-800">
                          {numCasos} casos
                        </span>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {numCasos >= area.umbralDisponibilidad ? '✓ Stock Óptimo' : '⚠️ Stock Crítico'}
                        </p>
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </section>

          {/* Últimos Sorteos Realizados con Hash */}
          <section className="border border-line bg-white shadow-xs">
            <header className="border-b border-line px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
                  Actas Recientes Registradas
                </h2>
                <p className="text-xs text-neutral-500">
                  Histórico de actos oficiales con certificación SHA-256
                </p>
              </div>
              <ShieldCheck className="size-4 text-neutral-600" />
            </header>

            <ul className="divide-y divide-line max-h-[400px] overflow-y-auto">
              {sorteos.length === 0 ? (
                <li className="p-6 text-center text-xs text-neutral-400">
                  No se han generado actas de sorteo todavía.
                </li>
              ) : (
                sorteos.slice(0, 5).map((s) => {
                  const est = s.defensa?.instancia?.proceso?.estudiante
                  const fecha = new Date(s.fechaHora).toLocaleDateString()
                  const res = s.area?.areaResultado?.nombre || s.caso?.casoSeleccionado?.titulo || 'Resultado'

                  return (
                    <li key={s.idSorteo} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50/60">
                      <div>
                        <p className="text-xs font-bold text-neutral-900">{est?.nombreCompleto}</p>
                        <p className="text-[11px] text-neutral-500">
                          {res} · {fecha}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5">
                        Acta #{s.idSorteo}
                      </span>
                    </li>
                  )
                })
              )}
            </ul>
          </section>
        </div>
        {/* Alerta de Áreas en Stock Crítico */}
        {dashboardData && dashboardData.stockCritico.length > 0 && (
          <section className="border-l-4 border-l-red-600 border border-line bg-white shadow-xs">
            <header className="border-b border-line px-5 py-3.5 flex items-center justify-between bg-red-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-red-700">
                  Alerta Operativa: Áreas Temáticas con Stock Crítico de Casos
                </h2>
              </div>
              <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-xs">
                {dashboardData.stockCritico.length} en riesgo
              </span>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line bg-surface text-neutral-500 font-semibold text-[10.5px] uppercase">
                    <th className="px-5 py-2.5">Área Académica</th>
                    <th className="px-5 py-2.5">Carrera / Facultad</th>
                    <th className="px-5 py-2.5 text-center">Disponibles</th>
                    <th className="px-5 py-2.5 text-center">Umbral Requerido</th>
                    <th className="px-5 py-2.5 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {dashboardData.stockCritico.map((item) => (
                    <tr key={item.idArea} className="hover:bg-red-50/30">
                      <td className="px-5 py-2.5 font-bold text-neutral-900">{item.nombreArea}</td>
                      <td className="px-5 py-2.5 text-neutral-600">
                        {item.carrera} · <span className="text-neutral-400">{item.facultad}</span>
                      </td>
                      <td className="px-5 py-2.5 text-center font-bold text-red-600">
                        {item.casosDisponibles} casos
                      </td>
                      <td className="px-5 py-2.5 text-center text-neutral-500">
                        {item.umbralRequerido} casos
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                            item.estadoAlerta === 'AGOTADO'
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.estadoAlerta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Matriz Ejecutiva por Facultad (Vicerrectorado y Coordinación) */}
        {!isJefe && dashboardData && dashboardData.distribucionFacultades.length > 0 && (
          <section className="border border-line bg-white shadow-xs">
            <header className="border-b border-line px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-crimson" />
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
                    Consolidado Institucional por Facultad
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Métricas de supervisión universitaria, aprobación y casos activos en FCT, FCE y FCJS
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold bg-surface border border-line px-2.5 py-1">
                {dashboardData.distribucionFacultades.length} Facultades
              </span>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line bg-surface text-neutral-500 font-semibold text-[10.5px] uppercase">
                    <th className="px-5 py-2.5">Facultad</th>
                    <th className="px-5 py-2.5 text-center">Carreras</th>
                    <th className="px-5 py-2.5 text-center">Casos Disponibles</th>
                    <th className="px-5 py-2.5 text-center">Stock Crítico</th>
                    <th className="px-5 py-2.5 text-center">Defensas Concluidas</th>
                    <th className="px-5 py-2.5 text-center">En Pipeline</th>
                    <th className="px-5 py-2.5 text-center">Nota Promedio</th>
                    <th className="px-5 py-2.5 text-right">Tasa Aprobación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {dashboardData.distribucionFacultades.map((fac) => (
                    <tr key={fac.idFacultad} className="hover:bg-neutral-50/60">
                      <td className="px-5 py-3 font-bold text-neutral-900">{fac.nombreFacultad}</td>
                      <td className="px-5 py-3 text-center text-neutral-600">{fac.totalCarreras}</td>
                      <td className="px-5 py-3 text-center font-bold text-neutral-800">
                        {fac.casosDisponibles}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                            fac.areasStockCritico > 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {fac.areasStockCritico} áreas
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-emerald-700 font-bold">
                        {fac.defensasConcluidas}
                      </td>
                      <td className="px-5 py-3 text-center text-amber-700 font-semibold">
                        {fac.postulantesPendientes}
                      </td>
                      <td className="px-5 py-3 text-center font-mono text-neutral-800">
                        {fac.promedioNota > 0 ? fac.promedioNota : '—'}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-neutral-900">
                        {fac.tasaAprobacion}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  )
}
