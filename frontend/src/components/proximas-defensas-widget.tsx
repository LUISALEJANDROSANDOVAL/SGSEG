import { useEffect, useState } from 'react'
import { defensasApi, type Defensa } from '@/lib/defensas.api'
import { useAuth } from '@/context/AuthContext'
import { esJefeCarrera, getJefeCarreraId } from '@/lib/auth-helpers'
import { Calendar, Clock, Shuffle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export function ProximasDefensasWidget() {
  const { user } = useAuth()
  const isJefe = esJefeCarrera(user)
  const carreraId = getJefeCarreraId(user)
  const navigate = useNavigate()

  const [defensas, setDefensas] = useState<Defensa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProximas() {
      try {
        setLoading(true)
        const idCarreraFiltro = isJefe && carreraId ? carreraId : undefined
        const resp = await defensasApi.getDefensas({
          limit: 5,
          idCarrera: idCarreraFiltro,
        })
        setDefensas(resp.items || [])
      } catch (err) {
        console.error('Error al cargar próximas defensas:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProximas()
  }, [user, isJefe, carreraId])

  const getDiasRestantes = (fechaStr: string) => {
    if (!fechaStr) return ''
    const fecha = new Date(fechaStr)
    const hoy = new Date()
    const diffTime = fecha.getTime() - hoy.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Mañana'
    if (diffDays < 0) return `Hace ${Math.abs(diffDays)} d`
    return `En ${diffDays} días`
  }

  return (
    <section className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-red-50 text-[#c8102e]">
              <Calendar className="size-4" />
            </span>
            <h2 className="text-sm font-bold tracking-tight text-gray-900">
              Próximas Defensas en Agenda
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Postulantes con fecha de examen de grado programada
          </p>
        </div>

        <Link
          to="/defensas"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#c8102e] hover:text-red-700 transition-colors"
        >
          <span>Ver calendario</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </header>

      {loading ? (
        <div className="py-8 text-center text-xs text-gray-400">
          Cargando agenda de defensas...
        </div>
      ) : defensas.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs font-semibold text-gray-700">Sin defensas pendientes</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Todas las defensas del ciclo han sido completadas o no hay fechas agendadas.</p>
        </div>
      ) : (
        <div className="flex-1 divide-y divide-gray-100">
          {defensas.map((defensa) => {
            const estudiante = defensa.instancia?.proceso?.estudiante
            const diasTexto = getDiasRestantes(defensa.fechaDefensa)
            const esUrgente = diasTexto.includes('Hoy') || diasTexto.includes('Mañana') || diasTexto.includes('1') || diasTexto.includes('2')

            const fechaFormateada = defensa.fechaDefensa
              ? new Date(defensa.fechaDefensa).toLocaleDateString('es-BO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Por definir'

            return (
              <div
                key={defensa.idDefensa}
                className="flex items-center justify-between gap-3 py-3.5 hover:bg-gray-50/80 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 font-bold text-xs">
                    {estudiante?.nombreCompleto?.split(' ').map(p => p[0]).slice(0, 2).join('') || 'ES'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {estudiante?.nombreCompleto || 'Postulante'}
                      </p>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                        defensa.tipoDefensa?.nombre === 'EXTERNA'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {defensa.tipoDefensa?.nombre || 'DEFENSA'}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {estudiante?.planEstudio?.carrera?.nombre || 'Carrera'} · Reg: {estudiante?.carnetEstudiantil}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <Clock className="size-3" /> {fechaFormateada}
                      </span>
                      <span>•</span>
                      <span className={`font-bold ${esUrgente ? 'text-[#c8102e]' : 'text-gray-600'}`}>
                        {diasTexto}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {defensa.estadoDefensa === 'PROGRAMADA' ? (
                    <button
                      type="button"
                      onClick={() => navigate('/sorteo')}
                      className="flex items-center gap-1 rounded-lg bg-[#c8102e] px-2.5 py-1.5 text-[11px] font-bold text-white shadow hover:bg-red-700 transition-colors"
                      title="Ejecutar sorteo para este postulante"
                    >
                      <Shuffle className="size-3" />
                      <span className="hidden sm:inline">Sortear</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="size-3" />
                      {defensa.estadoDefensa.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
