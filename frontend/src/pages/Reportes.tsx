import { useEffect, useState } from 'react'
import {
  Download,
  Printer,
  ShieldCheck,
} from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { defensasApi, type EmbudoEstados, type Defensa } from '@/lib/defensas.api'
import { casosApi, type AreaAcademica, type MetricasCasos } from '@/lib/casos.api'
import { sorteosApi, type SorteoItem } from '@/lib/sorteos.api'
import { useAuth } from '@/context/AuthContext'
import { esJefeCarrera, getJefeCarreraId, getJefeCarreraNombre } from '@/lib/auth-helpers'

export default function PaginaReportes() {
  const { user } = useAuth()
  const isJefe = esJefeCarrera(user)
  const jefeCarreraId = getJefeCarreraId(user)
  const carreraNombre = getJefeCarreraNombre(user)

  const [embudo, setEmbudo] = useState<EmbudoEstados | null>(null)
  const [metricasCasos, setMetricasCasos] = useState<MetricasCasos | null>(null)
  const [areas, setAreas] = useState<AreaAcademica[]>([])
  const [sorteos, setSorteos] = useState<SorteoItem[]>([])
  const [defensas, setDefensas] = useState<Defensa[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const cargarReportes = async () => {
    setLoading(true)
    try {
      const idCarreraFiltro = isJefe && jefeCarreraId ? jefeCarreraId : undefined
      const [embudoData, casosData, areasData, sorteosData, defensasData] = await Promise.all([
        defensasApi.getEmbudo(),
        casosApi.getMetricas(idCarreraFiltro),
        casosApi.getAreas(idCarreraFiltro),
        sorteosApi.getHistorial({ idCarrera: idCarreraFiltro, limit: 100 }),
        defensasApi.getDefensas({ idCarrera: idCarreraFiltro, limit: 100 }),
      ])
      setEmbudo(embudoData)
      setMetricasCasos(casosData)
      setAreas(areasData)
      setSorteos(sorteosData.items)
      setDefensas(defensasData.items)
    } catch (e) {
      console.error('Error cargando reportes consolidados:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarReportes()
  }, [user, isJefe, jefeCarreraId])

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

        {/* Tarjetas KPI de Supervisión Global */}
        <section className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Total Defensas en Pipeline
            </p>
            <p className="mt-1.5 text-2xl font-bold text-neutral-900">
              {loading ? '—' : embudo ? embudo.total : 0}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Programadas en semestre 2-2026</p>
          </div>

          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Actas de Sorteo Emitidas
            </p>
            <p className="mt-1.5 text-2xl font-bold text-neutral-900">
              {loading ? '—' : sorteos.length}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Con hash criptográfico verificado</p>
          </div>

          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Casos Disponibles (&lt; 2 usos)
            </p>
            <p className="mt-1.5 text-2xl font-bold text-neutral-900">
              {loading ? '—' : metricasCasos ? metricasCasos.disponibles : 0}
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              {metricasCasos ? `${metricasCasos.agotados} agotados reglamentariamente` : ''}
            </p>
          </div>

          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Tasa de Conclusión
            </p>
            <p className="mt-1.5 text-2xl font-bold text-emerald-700">
              {embudo && embudo.total > 0
                ? `${Math.round(((embudo.defendidos + embudo.calificados) / embudo.total) * 100)}%`
                : '100%'}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {embudo ? `${embudo.calificados} postulantes calificados` : ''}
            </p>
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
      </div>
    </DashboardShell>
  )
}
