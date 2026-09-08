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
      num: '01',
      nombre: 'Programadas',
      subtitulo: 'Pendiente de Sorteo',
      cantidad: programados,
      porcentaje: pct(programados),
      icono: Clock,
      activo: programados > 0,
    },
    {
      num: '02',
      nombre: 'Área Sorteada',
      subtitulo: 'Temática Fijada',
      cantidad: areaSorteada,
      porcentaje: pct(areaSorteada),
      icono: Shuffle,
      activo: areaSorteada > 0,
    },
    {
      num: '03',
      nombre: 'Caso Asignado',
      subtitulo: 'En Resolución',
      cantidad: casoAsignado,
      porcentaje: pct(casoAsignado),
      icono: FileText,
      activo: casoAsignado > 0,
    },
    {
      num: '04',
      nombre: 'Defendidos',
      subtitulo: 'Tribunal Concluido',
      cantidad: defendidos,
      porcentaje: pct(defendidos),
      icono: CheckCircle,
      activo: defendidos > 0,
    },
    {
      num: '05',
      nombre: 'Calificados',
      subtitulo: 'Acta Registrada',
      cantidad: calificados,
      porcentaje: pct(calificados),
      icono: Award,
      activo: calificados > 0,
    },
  ]

  return (
    <div className="border border-line bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4 pb-3 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 uppercase">
              Flujo Reglamentario de Exámenes de Grado
            </h2>
            <span className="border border-line bg-surface px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
              Pipeline de Proceso
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isJefe && carreraNombre ? `Jurisdicción: ${carreraNombre}` : 'Seguimiento secuencial de postulantes por fase reglamentaria'}
          </p>
        </div>

        <Link
          to="/defensas"
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 hover:text-crimson transition-colors"
        >
          <span>Ver embudo detallado</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Grid de Etapas Unificado y Sobrio */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {etapas.map((etapa) => {
          const Icon = etapa.icono
          return (
            <div
              key={etapa.nombre}
              className={`flex flex-col justify-between border p-3.5 bg-surface transition-colors ${
                etapa.activo && etapa.num === '01' && etapa.cantidad > 0
                  ? 'border-crimson/30 bg-red-50/20'
                  : 'border-line'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                  Fase {etapa.num}
                </span>
                <span className="flex size-6 items-center justify-center border border-line bg-white text-neutral-600">
                  <Icon className="size-3.5" />
                </span>
              </div>

              <div className="my-2.5">
                <p className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
                  {loading ? '—' : etapa.cantidad}
                </p>
                <p className="text-xs font-semibold text-neutral-800 leading-tight mt-0.5">{etapa.nombre}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">{etapa.subtitulo}</p>
              </div>

              <div className="mt-auto pt-2 border-t border-line">
                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium mb-1">
                  <span>Proporción</span>
                  <span>{loading ? '—' : `${etapa.porcentaje}%`}</span>
                </div>
                <div className="h-1 w-full bg-neutral-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      etapa.num === '01' ? 'bg-crimson' : 'bg-neutral-800'
                    }`}
                    style={{ width: `${etapa.porcentaje}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Barra de Resumen Global */}
      <div className="mt-4 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
            <CheckCircle className="size-3 text-emerald-600" />
            {loading ? '...' : `${pct(concluidos)}% de Conclusión`}
          </span>
          <span className="text-neutral-600 text-[11px]">
            {loading ? 'Calculando...' : `${concluidos} de ${total} postulantes completaron el proceso`}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-neutral-500">
          <span>Total en Proceso: <strong className="text-neutral-900">{total}</strong></span>
          <span>•</span>
          <span className="text-crimson font-medium">{programados} pendientes de sorteo</span>
        </div>
      </div>
    </div>
  )
}
