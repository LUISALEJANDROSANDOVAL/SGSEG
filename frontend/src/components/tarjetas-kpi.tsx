import { useEffect, useState } from 'react'
import { AlertTriangle, BookOpen, GraduationCap, Users, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react'
import { estudiantesApi } from '@/lib/estudiantes.api'
import { defensasApi, type EmbudoEstados } from '@/lib/defensas.api'
import { casosApi, type MetricasCasos } from '@/lib/casos.api'
import { useAuth } from '@/context/AuthContext'
import { esJefeCarrera, getJefeCarreraId, getJefeCarreraNombre } from '@/lib/auth-helpers'
import { Link } from 'react-router-dom'

export function TarjetasKpi() {
  const { user } = useAuth()
  const isJefe = esJefeCarrera(user)
  const carreraId = getJefeCarreraId(user)
  const carreraNombre = getJefeCarreraNombre(user)

  const [totalEstudiantes, setTotalEstudiantes] = useState<number>(0)
  const [embudo, setEmbudo] = useState<EmbudoEstados | null>(null)
  const [metricasCasos, setMetricasCasos] = useState<MetricasCasos | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const idCarreraFiltro = isJefe && carreraId ? carreraId : undefined
        const [estudiantesData, embudoData, casosData] = await Promise.all([
          estudiantesApi.getEstudiantes({ idCarrera: idCarreraFiltro, limit: 1 }),
          defensasApi.getEmbudo(),
          casosApi.getMetricas(idCarreraFiltro),
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
  }, [user, isJefe, carreraId])

  const casosTotal = metricasCasos?.totalCasos || 0
  const casosDisp = metricasCasos?.disponibles || 0
  const porcentajeDisp = casosTotal > 0 ? Math.round((casosDisp / casosTotal) * 100) : 0
  const stockCriticoCount = metricasCasos?.stockCritico?.length || 0

  const concluidos = (embudo?.defendidos || 0) + (embudo?.calificados || 0)
  const totalDefensas = embudo?.total || 0
  const tasaExito = totalDefensas > 0 ? Math.round((concluidos / totalDefensas) * 100) : 0

  return (
    <section aria-label="Indicadores clave" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      
      {/* 1. Padrón de Postulantes */}
      <Link
        to="/estudiantes"
        className="group border border-line bg-white p-5 shadow-xs transition-colors hover:border-ink block"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Postulantes Registrados
          </span>
          <span className="flex size-8 items-center justify-center border border-line bg-surface text-neutral-700">
            <Users className="size-4" />
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {loading ? '—' : totalEstudiantes.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
              <CheckCircle2 className="size-3 text-emerald-600" /> Habilitados
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[11px] text-neutral-500">
          <span className="truncate max-w-[160px]">
            {isJefe && carreraNombre ? carreraNombre : 'Padrón UTEPSA'}
          </span>
          <span className="inline-flex items-center gap-0.5 font-medium text-neutral-700 group-hover:text-crimson">
            Ver padrón <ArrowUpRight className="size-3" />
          </span>
        </div>
      </Link>

      {/* 2. Defensas en Cronograma */}
      <Link
        to="/defensas"
        className="group border border-line bg-white p-5 shadow-xs transition-colors hover:border-ink block"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Defensas Programadas
          </span>
          <span className="flex size-8 items-center justify-center border border-line bg-surface text-neutral-700">
            <AlertTriangle className="size-4 text-crimson" />
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {loading ? '—' : totalDefensas}
            </span>
            {embudo && embudo.programados > 0 ? (
              <span className="border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-crimson">
                {embudo.programados} por sortear
              </span>
            ) : (
              <span className="border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                Al día
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[11px] text-neutral-500">
          <span className="truncate text-crimson font-medium">
            {embudo ? `${embudo.programados} pendientes de sorteo` : 'En seguimiento'}
          </span>
          <span className="inline-flex items-center gap-0.5 font-medium text-neutral-700 group-hover:text-crimson">
            Agenda <ArrowUpRight className="size-3" />
          </span>
        </div>
      </Link>

      {/* 3. Casos Disponibles */}
      <Link
        to="/casos"
        className="group border border-line bg-white p-5 shadow-xs transition-colors hover:border-ink block"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Casos Disponibles
          </span>
          <span className="flex size-8 items-center justify-center border border-line bg-surface text-neutral-700">
            <BookOpen className="size-4" />
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {loading ? '—' : casosDisp}
            </span>
            <span className="text-xs text-neutral-500">
              de {casosTotal} totales
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-line flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-500">Disponibilidad ({porcentajeDisp}%)</span>
            {stockCriticoCount > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-crimson font-semibold">
                <ShieldAlert className="size-3" /> {stockCriticoCount} en alerta
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">Stock óptimo</span>
            )}
          </div>
          <div className="h-1.5 w-full bg-neutral-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                porcentajeDisp > 40 ? 'bg-emerald-600' : porcentajeDisp > 20 ? 'bg-amber-500' : 'bg-crimson'
              }`}
              style={{ width: `${porcentajeDisp}%` }}
            />
          </div>
        </div>
      </Link>

      {/* 4. Tasa de Culminación */}
      <Link
        to="/reportes"
        className="group border border-line bg-white p-5 shadow-xs transition-colors hover:border-ink block"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Defensas Concluidas
          </span>
          <span className="flex size-8 items-center justify-center border border-line bg-surface text-neutral-700">
            <GraduationCap className="size-4" />
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {loading ? '—' : concluidos}
            </span>
            <span className="border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700">
              {tasaExito}% del período
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[11px] text-neutral-500">
          <span className="text-neutral-600 truncate">
            {embudo?.calificados || 0} con acta registrada
          </span>
          <span className="inline-flex items-center gap-0.5 font-medium text-neutral-700 group-hover:text-crimson">
            Reportes <ArrowUpRight className="size-3" />
          </span>
        </div>
      </Link>

    </section>
  )
}
