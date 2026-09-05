import { useEffect, useState } from 'react'
import { AlertTriangle, BookOpen, GraduationCap, TrendingUp, Users, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react'
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
    <section aria-label="Indicadores clave" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      
      {/* 1. Padrón de Postulantes */}
      <Link
        to="/estudiantes"
        className="group relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200"
      >
        <div className="flex items-center justify-between">
          <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-transform group-hover:scale-110">
            <Users className="size-5" />
          </span>
          <span className="flex items-center gap-1 rounded-full bg-blue-50/80 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            Padrón Activo
            <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            Postulantes Registrados
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-gray-900 tabular-nums">
              {loading ? '—' : totalEstudiantes.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <CheckCircle2 className="size-3" /> Habilitados
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="truncate">
            {isJefe && carreraNombre ? carreraNombre : 'Padrón institucional UTEPSA'}
          </span>
          <span className="font-semibold text-blue-600 group-hover:underline">Ver padrón</span>
        </div>
      </Link>

      {/* 2. Defensas en Cronograma */}
      <Link
        to="/defensas"
        className="group relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-red-200"
      >
        <div className="flex items-center justify-between">
          <span className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-[#c8102e] ring-1 ring-red-100 transition-transform group-hover:scale-110">
            <AlertTriangle className="size-5" />
          </span>
          {embudo && embudo.programados > 0 ? (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold text-[#c8102e] animate-pulse">
              {embudo.programados} Por Sortear
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Al Día
            </span>
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            Defensas en Cronograma
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-gray-900 tabular-nums">
              {loading ? '—' : totalDefensas}
            </span>
            <span className="text-xs text-gray-500">
              ({embudo?.areaSorteada || 0} con área)
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-red-600 font-semibold truncate">
            {embudo ? `${embudo.programados} pendientes de sorteo` : 'En seguimiento'}
          </span>
          <span className="font-semibold text-[#c8102e] group-hover:underline">Ver fechas</span>
        </div>
      </Link>

      {/* 3. Casos Disponibles */}
      <Link
        to="/casos"
        className="group relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-200"
      >
        <div className="flex items-center justify-between">
          <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 transition-transform group-hover:scale-110">
            <BookOpen className="size-5" />
          </span>
          {stockCriticoCount > 0 ? (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
              <ShieldAlert className="size-3" /> {stockCriticoCount} Área(s) Alerta
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Stock Óptimo
            </span>
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            Casos Disponibles
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-gray-900 tabular-nums">
              {loading ? '—' : casosDisp}
            </span>
            <span className="text-xs text-gray-500">
              de {casosTotal} totales
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1.5 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>Disponibilidad</span>
            <span className="font-bold text-gray-800">{porcentajeDisp}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                porcentajeDisp > 40 ? 'bg-emerald-500' : porcentajeDisp > 20 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${porcentajeDisp}%` }}
            />
          </div>
        </div>
      </Link>

      {/* 4. Tasa de Culminación */}
      <Link
        to="/reportes"
        className="group relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-purple-200"
      >
        <div className="flex items-center justify-between">
          <span className="flex size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-100 transition-transform group-hover:scale-110">
            <GraduationCap className="size-5" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            <TrendingUp className="size-3" />
            {tasaExito}% Avance
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            Defensas Concluidas
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-gray-900 tabular-nums">
              {loading ? '—' : concluidos}
            </span>
            <span className="text-xs text-gray-500">
              ({embudo?.calificados || 0} con acta)
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="truncate text-emerald-700 font-semibold">
            Semestre 2-2026 activo
          </span>
          <span className="font-semibold text-purple-600 group-hover:underline">Ver actas</span>
        </div>
      </Link>

    </section>
  )
}
