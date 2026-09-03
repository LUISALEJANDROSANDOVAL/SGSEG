'use client'

import { useEffect, useState } from 'react'
import { AlertOctagon, BookOpen, CheckCircle2, Loader2 } from 'lucide-react'
import { casosApi, type CasoEstudio, type MetricasCasos } from '@/lib/casos.api'

export function GestionCasos() {
  const [casos, setCasos] = useState<CasoEstudio[]>([])
  const [metricas, setMetricas] = useState<MetricasCasos | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchData() {
      try {
        setLoading(true)
        const [casosResp, metricasResp] = await Promise.all([
          casosApi.getCasos({ limit: 5 }),
          casosApi.getMetricas(),
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
  }, [])

  const totalCasos = metricas?.totalCasos ?? casos.length
  const alertaStock = metricas?.stockCritico && metricas.stockCritico.length > 0 ? metricas.stockCritico[0] : null

  return (
    <section className="flex flex-col border border-line bg-white shadow-xs">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-crimson" />
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
              Gestión de Casos de Estudio
            </h2>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Inventario activo y control de límite de uso reglamentario
          </p>
        </div>
        <span className="hidden text-xs text-neutral-500 sm:block font-medium">
          {loading ? 'Cargando...' : `${totalCasos} casos registrados`}
        </span>
      </header>

      {loading ? (
        <div className="flex items-center justify-center p-8 text-neutral-400 gap-2 text-xs">
          <Loader2 className="size-4 animate-spin text-crimson" />
          <span>Cargando inventario de casos...</span>
        </div>
      ) : casos.length === 0 ? (
        <div className="p-6 text-center text-xs text-neutral-500">
          No hay casos de estudio registrados para su carrera.
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-line">
          {casos.map((caso) => {
            const usos = caso.usos ?? 0
            const umbral = caso.umbral ?? 2
            const agotado = caso.estadoEfectivo === 'AGOTADO' || usos >= umbral

            return (
              <li
                key={caso.idCasoEstudio}
                className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-neutral-50/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] tracking-wider text-neutral-500">
                    CASO-{caso.idCasoEstudio.padStart(3, '0')}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed font-medium text-neutral-900 text-pretty">
                    {caso.titulo}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {caso.area?.nombre} {caso.area?.carrera ? `— ${caso.area.carrera.nombre}` : ''}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    agotado
                      ? 'bg-crimson text-white'
                      : 'bg-surface text-neutral-600 ring-1 ring-line'
                  }`}
                >
                  {agotado ? `Agotado ${usos}/${umbral}` : `Uso ${usos}/${umbral}`}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {alertaStock ? (
        <div
          role="alert"
          className="flex items-start gap-3 bg-crimson px-5 py-4 text-white"
        >
          <AlertOctagon className="mt-0.5 size-4 shrink-0" />
          <p className="text-sm leading-relaxed text-pretty">
            <span className="font-semibold">ALERTA DE INVENTARIO:</span> {alertaStock.mensajeAlerta}
          </p>
        </div>
      ) : !loading && (
        <div className="flex items-center gap-2 border-t border-emerald-200 bg-emerald-50 px-5 py-3 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
          <span>Inventario reglamentario en niveles óptimos de disponibilidad.</span>
        </div>
      )}
    </section>
  )
}
