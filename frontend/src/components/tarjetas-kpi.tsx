import { useEffect, useState } from 'react'
import { AlertTriangle, BookOpen, GraduationCap, TrendingUp, Users } from 'lucide-react'
import { estudiantesApi } from '@/lib/estudiantes.api'
import { defensasApi, type EmbudoEstados } from '@/lib/defensas.api'
import { casosApi, type MetricasCasos } from '@/lib/casos.api'

export function TarjetasKpi() {
  const [totalEstudiantes, setTotalEstudiantes] = useState<number>(0)
  const [embudo, setEmbudo] = useState<EmbudoEstados | null>(null)
  const [metricasCasos, setMetricasCasos] = useState<MetricasCasos | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const [estudiantesData, embudoData, casosData] = await Promise.all([
          estudiantesApi.getEstudiantes({ limit: 1 }),
          defensasApi.getEmbudo(),
          casosApi.getMetricas(),
        ])
        setTotalEstudiantes(estudiantesData.pagination.total)
        setEmbudo(embudoData)
        setMetricasCasos(casosData)
      } catch (e) {
        console.error('Error cargando KPIs generales:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchKpis()
  }, [])

  const casosTotal = metricasCasos?.totalCasos || 0
  const casosDisp = metricasCasos?.disponibles || 0
  const porcentajeDisp = casosTotal > 0 ? Math.round((casosDisp / casosTotal) * 100) : 0

  return (
    <section aria-label="Indicadores clave" className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Total Postulantes */}
      <article className="flex flex-col gap-3 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            Padrón de Estudiantes
          </p>
          <Users className="size-4 text-neutral-400" />
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums text-neutral-900">
          {loading ? '—' : totalEstudiantes.toLocaleString()}
        </p>
        <p className="text-xs text-neutral-500">Postulantes registrados en UPTECSA</p>
      </article>

      {/* 2. Defensas Activas */}
      <article className="flex flex-col gap-3 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            Defensas en Cronograma
          </p>
          <AlertTriangle className="size-4 text-crimson" />
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums text-neutral-900">
          {loading ? '—' : embudo ? embudo.total : 0}
        </p>
        <p className="text-xs text-crimson">
          {embudo ? `${embudo.programados} pendientes de sorteo` : 'En seguimiento'}
        </p>
      </article>

      {/* 3. Casos Disponibles */}
      <article className="flex flex-col gap-3 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            Casos Disponibles
          </p>
          <BookOpen className="size-4 text-neutral-400" />
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums text-neutral-900">
          {loading ? '—' : casosDisp}
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full bg-surface">
            <div className="h-full bg-ink transition-all duration-500" style={{ width: `${porcentajeDisp}%` }} />
          </div>
          <p className="text-xs text-neutral-500">{porcentajeDisp}% del inventario disponible (&lt; 2 usos)</p>
        </div>
      </article>

      {/* 4. Tasa de Avance del Flujo */}
      <article className="flex flex-col gap-3 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            Procesos Concluidos
          </p>
          <GraduationCap className="size-4 text-neutral-400" />
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums text-neutral-900">
          {loading ? '—' : embudo ? embudo.defendidos + embudo.calificados : 0}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-emerald-700">
          <TrendingUp className="size-3.5" />
          {embudo && embudo.total > 0
            ? `${Math.round(((embudo.defendidos + embudo.calificados) / embudo.total) * 100)}% de avance en defensas`
            : 'Periodo académico activo'}
        </p>
      </article>
    </section>
  )
}
