import { useEffect, useState } from 'react'
import { defensasApi, type EmbudoEstados } from '@/lib/defensas.api'
import { useAuth } from '@/context/AuthContext'
import { esJefeCarrera, getJefeCarreraId, getJefeCarreraNombre } from '@/lib/auth-helpers'
import { Shuffle, FileText, Award, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export function EmbudoFlujoWidget() {
  const { user } = useAuth()
  const isJefe = esJefeCarrera(user)
  const carreraId = getJefeCarreraId(user)
  const carreraNombre = getJefeCarreraNombre(user)

  const [embudo, setEmbudo] = useState<EmbudoEstados | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEmbudo() {
      try {
        setLoading(true)
        const data = await defensasApi.getEmbudo()
        setEmbudo(data)
      } catch (err) {
        console.error('Error al cargar embudo:', err)
      } finally {
        setLoading(false)
      }
    }
    loadEmbudo()
  }, [user, isJefe, carreraId])

  const total = embudo?.total || 0
  const programados = embudo?.programados || 0
  const areaSorteada = embudo?.areaSorteada || 0
  const casoAsignado = embudo?.casoAsignado || 0
  const defendidos = embudo?.defendidos || 0
  const calificados = embudo?.calificados || 0
  const concluidos = defendidos + calificados

  const pct = (val: number) => (total > 0 ? Math.round((val / total) * 100) : 0)

  const etapas = [
    {
      nombre: 'Programadas',
      subtitulo: 'Pendiente de Sorteo',
      cantidad: programados,
      porcentaje: pct(programados),
      icono: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeColor: 'bg-amber-500',
    },
    {
      nombre: 'Área Sorteada',
      subtitulo: 'Temática Fijada',
      cantidad: areaSorteada,
      porcentaje: pct(areaSorteada),
      icono: Shuffle,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeColor: 'bg-blue-500',
    },
    {
      nombre: 'Caso Asignado',
      subtitulo: 'En Resolución',
      cantidad: casoAsignado,
      porcentaje: pct(casoAsignado),
      icono: FileText,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      badgeColor: 'bg-purple-500',
    },
    {
      nombre: 'Defendidos',
      subtitulo: 'Tribunal Concluido',
      cantidad: defendidos,
      porcentaje: pct(defendidos),
      icono: CheckCircle,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      badgeColor: 'bg-indigo-500',
    },
    {
      nombre: 'Calificados',
      subtitulo: 'Acta Registrada',
      cantidad: calificados,
      porcentaje: pct(calificados),
      icono: Award,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeColor: 'bg-emerald-500',
    },
  ]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Pipeline y Avance de Exámenes de Grado
            </h2>
            <span className="rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-[10px] font-extrabold text-[#c8102e]">
              En Tiempo Real
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {isJefe && carreraNombre ? `Jurisdicción: ${carreraNombre}` : 'Seguimiento integral de postulantes por fase reglamentaria'}
          </p>
        </div>

        <Link
          to="/defensas"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#c8102e] hover:text-red-700 transition-colors"
        >
          <span>Ver embudo detallado</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Grid de Etapas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {etapas.map((etapa, idx) => {
          const Icon = etapa.icono
          return (
            <div
              key={etapa.nombre}
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${etapa.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white shadow-xs">
                  <Icon className="size-4" />
                </span>
                <span className="text-[10px] font-bold opacity-60">Fase 0{idx + 1}</span>
              </div>

              <div className="my-3">
                <p className="text-2xl font-extrabold tracking-tight tabular-nums">
                  {loading ? '—' : etapa.cantidad}
                </p>
                <p className="text-xs font-bold leading-tight mt-0.5">{etapa.nombre}</p>
                <p className="text-[10px] opacity-75">{etapa.subtitulo}</p>
              </div>

              <div className="mt-auto pt-2 border-t border-current/10">
                <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                  <span>Proporción</span>
                  <span>{loading ? '—' : `${etapa.porcentaje}%`}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${etapa.badgeColor} transition-all duration-500`}
                    style={{ width: `${etapa.porcentaje}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Barra de Resumen Global */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gray-50 p-4 border border-gray-100 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle className="size-4" />
          </span>
          <div>
            <p className="font-bold text-gray-900">
              {loading ? '...' : `${pct(concluidos)}% de Conclusión Global`}
            </p>
            <p className="text-[11px] text-gray-500">
              {loading ? 'Calculando...' : `${concluidos} de ${total} postulantes completaron el proceso`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-gray-500">Total en Proceso: <strong className="text-gray-900">{total}</strong></span>
          <span>•</span>
          <span className="text-amber-600 font-semibold">{programados} pendientes de sorteo</span>
        </div>
      </div>
    </div>
  )
}
