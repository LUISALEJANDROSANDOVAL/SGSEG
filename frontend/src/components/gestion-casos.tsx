import { useEffect, useState } from 'react'
import { AlertOctagon, BookOpen, CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import { casosApi, type CasoEstudio, type MetricasCasos } from '@/lib/casos.api'
import { useAuth } from '@/context/AuthContext'
import { esJefeCarrera, getJefeCarreraId } from '@/lib/auth-helpers'
import { Link } from 'react-router-dom'

export function GestionCasos() {
  const { user } = useAuth()
  const isJefe = esJefeCarrera(user)
  const carreraId = getJefeCarreraId(user)

  const [casos, setCasos] = useState<CasoEstudio[]>([])
  const [metricas, setMetricas] = useState<MetricasCasos | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchData() {
      try {
        setLoading(true)
        const idCarreraFiltro = isJefe && carreraId ? carreraId : undefined
        const [casosResp, metricasResp] = await Promise.all([
          casosApi.getCasos({ limit: 5, idCarrera: idCarreraFiltro }),
          casosApi.getMetricas(idCarreraFiltro),
        ])
        if (isMounted) {
          setCasos(casosResp.items)
          setMetricas(metricasResp)
        }
      } catch (err) {
        console.error('Error al cargar casos de estudio:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [user, isJefe, carreraId])

  const totalCasos = metricas?.totalCasos ?? casos.length
  const alertaStock = metricas?.stockCritico && metricas.stockCritico.length > 0 ? metricas.stockCritico[0] : null

  return (
    <section className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <BookOpen className="size-4" />
            </span>
            <h2 className="text-sm font-bold tracking-tight text-gray-900">
              Inventario de Casos de Estudio
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Límite reglamentario de 2 usos por caso y monitoreo de stock
          </p>
        </div>

        <Link
          to="/casos"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#c8102e] hover:text-red-700 transition-colors"
        >
          <span>Gestionar inventario</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-gray-400 gap-2 text-xs">
          <Loader2 className="size-4 animate-spin text-[#c8102e]" />
          <span>Cargando inventario de casos...</span>
        </div>
      ) : casos.length === 0 ? (
        <div className="py-10 text-center text-xs text-gray-400">
          No hay casos de estudio registrados para su área académica.
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-gray-100">
          {casos.map((caso) => {
            const usos = caso.usos ?? 0
            const umbral = caso.umbral ?? 2
            const agotado = caso.estadoEfectivo === 'AGOTADO' || usos >= umbral
            const primerUso = usos === 1

            return (
              <li
                key={caso.idCasoEstudio}
                className="flex items-start justify-between gap-4 py-3.5 hover:bg-gray-50/80 rounded-xl px-2 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
                      CASO-{String(caso.idCasoEstudio).padStart(3, '0')}
                    </span>
                    <span className="text-xs font-semibold text-gray-900 truncate max-w-xs sm:max-w-sm">
                      {caso.titulo}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-gray-500 truncate">
                    {caso.area?.nombre} {caso.area?.carrera ? `— ${caso.area.carrera.nombre}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      agotado
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : primerUso
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {agotado ? `Agotado (${usos}/${umbral})` : primerUso ? `1 uso (${usos}/${umbral})` : `Disponible (${usos}/${umbral})`}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {alertaStock ? (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-3 text-red-800 text-xs"
        >
          <AlertOctagon className="mt-0.5 size-4 shrink-0 text-[#c8102e]" />
          <p className="leading-relaxed">
            <strong className="font-bold text-red-900">Alerta de Stock Crítico:</strong> {alertaStock.mensajeAlerta}
          </p>
        </div>
      ) : !loading && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50/70 border border-emerald-200/80 px-4 py-2.5 text-xs text-emerald-800 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>Inventario reglamentario en niveles óptimos de disponibilidad.</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-white/80 rounded px-2 py-0.5 border border-emerald-200">
            {totalCasos} casos
          </span>
        </div>
      )}
    </section>
  )
}
