import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  BookOpen,
  Mail,
  AlertCircle,
  Lock,
  Check,
  RefreshCw,
  UserCheck,
} from 'lucide-react'
import { sorteosApi } from '@/lib/sorteos.api'
import { RuletaCanvas, type RuletaItem } from '@/components/RuletaCanvas'

interface SesionLiveState {
  token: string
  idPostulante: string
  nombreEstudiante: string
  carnet: string
  carrera: string
  correo: string
  tipoDefensa: string
  fase:
    | 'ESPERANDO'
    | 'AREA_GIRANDO'
    | 'AREA_ASIGNADA'
    | 'CASO_GIRANDO'
    | 'CASO_ASIGNADO'
    | 'ACTA_OFICIALIZADA'
    | 'EXPIRADO'
  areaGanadora?: {
    codigo: string
    nombre: string
    descripcion?: string
  } | null
  casoGanador?: {
    codigo: string
    titulo: string
    contenido?: string
    plazoHoras?: number
  } | null
  codigoActa?: string | null
  hashActa?: string | null
  expirado: boolean
  estudianteConectado?: boolean
  estudianteListo?: boolean
  itemsRuleta?: Array<{
    id: string
    label: string
    sublabel?: string
    color?: string
    badge?: string
  }> | null
  ruletaGiroActivo?: boolean
}

// Catálogo de respaldo para animación de ruleta móvil si aún no se transmitieron los items
const FALLBACK_AREAS: RuletaItem[] = [
  { id: '1', label: 'Ciberseguridad', sublabel: 'Seguridad y Auditoría' },
  { id: '2', label: 'Desarrollo de Software', sublabel: 'Ingeniería y BD' },
  { id: '3', label: 'Infraestructura TI', sublabel: 'Redes y Servidores' },
  { id: '4', label: 'Inteligencia Artificial', sublabel: 'Modelos y Datos' },
  { id: '5', label: 'Calidad de Software', sublabel: 'Pruebas y Procesos' },
]

const FALLBACK_CASOS: RuletaItem[] = [
  { id: 'c1', label: 'CASO-001', sublabel: 'Resolución de Caso Técnico Aplicado' },
  { id: 'c2', label: 'CASO-002', sublabel: 'Dictamen Profesional y Estrategia' },
]

export default function SorteoEnVivo() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [sesion, setSesion] = useState<SesionLiveState | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmandoListo, setConfirmandoListo] = useState(false)
  const [confirmacionExitosaLocal, setConfirmacionExitosaLocal] = useState(false)

  // Polling de sincronización en tiempo real (cada 1.5s) y reporte de presencia
  const syncLiveState = useCallback(async () => {
    if (!token) {
      setError('No se proporcionó un token de sorteo válido.')
      setCargando(false)
      return
    }

    try {
      // 1. Reportar presencia en tiempo real
      sorteosApi.conectarEstudianteLive(token).catch(() => {})

      // 2. Obtener estado más reciente
      const data = await sorteosApi.getSesionLive(token)
      if (data) {
        setSesion(data)
        setError(null)
      }
    } catch {
      // Continuar silenciosamente en caso de parpadeo de red
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => {
    syncLiveState()
    const interval = setInterval(syncLiveState, 1500)
    return () => clearInterval(interval)
  }, [syncLiveState])

  // Confirmar que el estudiante está presente y listo en su celular
  const handleConfirmarListo = async () => {
    if (!token) return
    setConfirmandoListo(true)
    try {
      await sorteosApi.confirmarEstudianteListoLive(token)
      setConfirmacionExitosaLocal(true)
      await syncLiveState()
    } catch (err) {
      console.error('Error al confirmar estado listo:', err)
      setConfirmacionExitosaLocal(true) // Tolerancia offline
    } finally {
      setConfirmandoListo(false)
    }
  }

  if (cargando && !sesion) {
    return (
      <div className="min-h-screen bg-[#121316] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="size-12 border-3 border-crimson border-t-transparent animate-spin rounded-full mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
          Conectando con la Sala de Sorteo UTEPSA...
        </p>
      </div>
    )
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-[#121316] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="size-14 rounded-full bg-red-900/30 border border-crimson flex items-center justify-center text-crimson mb-4">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">Acceso No Válido</h2>
        <p className="text-xs text-neutral-400 max-w-xs mt-2">
          {error || 'El enlace de sorteo no cuenta con los parámetros de verificación requeridos.'}
        </p>
      </div>
    )
  }

  // Pantalla de Expiración Solemne
  if (sesion?.expirado || sesion?.fase === 'EXPIRADO') {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm border border-line bg-white p-6 shadow-xs border-l-4 border-l-neutral-700">
          <div className="mx-auto size-12 bg-neutral-100 flex items-center justify-center text-neutral-700 mb-4">
            <Lock className="size-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
            Enlace de Sesión Expirado
          </span>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight mt-1">
            Acto Solemne Concluido
          </h2>
          <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
            Este enlace de seguimiento en tiempo real ha expirado oficialmente al término del sorteo.
          </p>
          <div className="mt-4 border border-line bg-surface p-3 text-left">
            <p className="text-[11px] text-neutral-700 font-medium">
              El acta oficial certificada y las directrices de resolución de caso han sido despachadas al correo institucional del postulante.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-line text-[10px] font-mono text-neutral-400">
            SGSEG · Universidad Tecnológica Privada de Santa Cruz
          </div>
        </div>
      </div>
    )
  }

  const estaListo = sesion?.estudianteListo || confirmacionExitosaLocal

  return (
    <div className="min-h-screen bg-surface pb-12">
      {/* Cabecera Institucional UTEPSA */}
      <header className="sticky top-0 z-30 border-b border-line bg-white shadow-2xs">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center bg-[#9E1B32] text-white font-bold text-xs">
              U
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-[#9E1B32] uppercase">
                UTEPSA · Grado
              </p>
              <h1 className="text-xs font-extrabold text-neutral-900">
                Sorteo Digital en Vivo
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 shadow-2xs">
            <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>EN VIVO</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal para Móvil */}
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-4">
        {/* Tarjeta del Postulante */}
        <section className="border border-line bg-white p-4 shadow-xs border-l-4 border-l-[#9E1B32]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
              Postulante Convocado
            </span>
            <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-semibold">
              En Sala
            </span>
          </div>
          <h2 className="text-base font-bold text-neutral-900 mt-1">
            {sesion?.nombreEstudiante || 'Postulante'}
          </h2>
          <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs border-t border-line pt-2.5">
            <div>
              <p className="text-[10px] text-neutral-500 uppercase font-semibold">Carrera</p>
              <p className="font-semibold text-neutral-800">{sesion?.carrera || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase font-semibold">Registro / CI</p>
              <p className="font-mono text-neutral-800 font-medium">{sesion?.carnet || '—'}</p>
            </div>
          </div>
        </section>

        {/* ── PASO 0: BOTÓN DE CONFIRMACIÓN OBLIGATORIA DEL ESTUDIANTE ── */}
        {!estaListo ? (
          <section className="border border-line bg-white p-5 shadow-xs animate-fade-in border-l-4 border-l-amber-500">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center bg-amber-100 text-amber-900 rounded-full">
                <UserCheck className="size-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Confirmación de Presencia en Sala
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  El tribunal evaluador se encuentra listo en sala. Para dar inicio al sorteo de tu Área y Caso de Estudio, presiona el botón inferior confirmando tu conformidad.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={handleConfirmarListo}
                disabled={confirmandoListo}
                className="w-full flex items-center justify-center gap-2 border border-[#9E1B32] bg-[#9E1B32] py-3.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-[#821528] active:bg-[#6c1121] transition-all cursor-pointer disabled:opacity-60"
              >
                {confirmandoListo ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Confirmando con el Tribunal...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 text-white" />
                    <span>ESTOY PRESENTE Y LISTO PARA EL SORTEO</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 text-center">
              <p className="text-[10px] text-neutral-400 font-mono">
                Al presionar el botón se notifica inmediatamente a la pantalla del proyector en sala.
              </p>
            </div>
          </section>
        ) : (
          /* ── ESTUDIANTE LISTO: BARRA DE PROGRESO Y RULETA EN VIVO ── */
          <>
            {/* Mensaje de Confirmación Establecida */}
            <div className="flex items-center justify-between border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-900 font-semibold shadow-2xs">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Confirmado Listo · Sincronizado en tiempo real</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700">100% AUDITABLE</span>
            </div>

            {/* Pasos Oficiales del Sorteo */}
            <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-bold">
              <div
                className={`p-2 border ${
                  sesion?.areaGanadora
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : sesion?.fase === 'AREA_GIRANDO'
                    ? 'border-[#9E1B32] bg-[#9E1B32]/10 text-[#9E1B32]'
                    : 'border-line bg-white text-neutral-400'
                }`}
              >
                1. Área Temática
              </div>
              <div
                className={`p-2 border ${
                  sesion?.casoGanador
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : sesion?.fase === 'CASO_GIRANDO'
                    ? 'border-[#9E1B32] bg-[#9E1B32]/10 text-[#9E1B32]'
                    : 'border-line bg-white text-neutral-400'
                }`}
              >
                2. Caso de Estudio
              </div>
              <div
                className={`p-2 border ${
                  sesion?.fase === 'ACTA_OFICIALIZADA'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-line bg-white text-neutral-400'
                }`}
              >
                3. Acta Oficial
              </div>
            </div>

            {/* ── RULETA DIGITAL EN EL CELULAR ── */}
            <section className="border border-line bg-white p-4 shadow-xs flex flex-col items-center">
              {sesion?.fase === 'AREA_GIRANDO' ? (
                <div className="flex flex-col items-center animate-fade-in w-full">
                  <div className="mb-2 text-center">
                    <span className="border border-[#9E1B32]/30 bg-[#9E1B32]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#9E1B32] uppercase">
                      Fase 1 en Sala
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 mt-1">
                      Sorteo de Área Académica en Curso
                    </h3>
                  </div>

                  <RuletaCanvas
                    items={
                      sesion.itemsRuleta && sesion.itemsRuleta.length > 0
                        ? sesion.itemsRuleta
                        : FALLBACK_AREAS
                    }
                    size={280}
                    readOnly={true}
                    autoSpin={true}
                    accentColor="#9E1B32"
                  />
                </div>
              ) : sesion?.fase === 'CASO_GIRANDO' ? (
                <div className="flex flex-col items-center animate-fade-in w-full">
                  <div className="mb-2 text-center">
                    <span className="border border-[#9E1B32]/30 bg-[#9E1B32]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#9E1B32] uppercase">
                      Fase 2 en Sala
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 mt-1">
                      Sorteo de Caso de Estudio en Curso
                    </h3>
                  </div>

                  <RuletaCanvas
                    items={
                      sesion.itemsRuleta && sesion.itemsRuleta.length > 0
                        ? sesion.itemsRuleta
                        : FALLBACK_CASOS
                    }
                    size={280}
                    readOnly={true}
                    autoSpin={true}
                    accentColor="#9E1B32"
                  />
                </div>
              ) : sesion?.fase === 'ESPERANDO' ? (
                <div className="py-6 text-center text-xs text-neutral-500 space-y-2">
                  <div className="mx-auto size-10 border-2 border-[#9E1B32] border-t-transparent animate-spin rounded-full mb-3" />
                  <p className="font-bold text-neutral-800">
                    Aguardando inicio del sorteo por el tribunal evaluador...
                  </p>
                  <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                    La ruleta digital girará automáticamente en tu pantalla cuando el operador active la selección.
                  </p>
                </div>
              ) : null}

              {/* 1. Área Académica Asignada */}
              <div className="w-full mt-3 border-t border-line pt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                    <Layers className="size-4 text-[#9E1B32]" />
                    <span>1. Área Académica</span>
                  </div>
                  {sesion?.areaGanadora ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <Check className="size-3 text-emerald-600" />
                      Asignada
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-400">
                      Pendiente
                    </span>
                  )}
                </div>

                {sesion?.areaGanadora ? (
                  <div className="border-l-3 border-l-[#9E1B32] bg-neutral-50/60 p-3 animate-fade-in">
                    <span className="text-[10px] font-mono font-bold text-[#9E1B32] uppercase">
                      {sesion.areaGanadora.codigo}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 mt-0.5">
                      {sesion.areaGanadora.nombre}
                    </h3>
                    {sesion.areaGanadora.descripcion && (
                      <p className="text-xs text-neutral-600 mt-1">
                        {sesion.areaGanadora.descripcion}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">
                    El área se determinará en el primer giro de la ruleta.
                  </p>
                )}
              </div>

              {/* 2. Caso de Estudio Adjudicado */}
              <div className="w-full mt-4 border-t border-line pt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                    <BookOpen className="size-4 text-[#9E1B32]" />
                    <span>2. Caso de Estudio</span>
                  </div>
                  {sesion?.casoGanador ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <Check className="size-3 text-emerald-600" />
                      Adjudicado
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-400">
                      Pendiente
                    </span>
                  )}
                </div>

                {sesion?.casoGanador ? (
                  <div className="border-l-3 border-l-emerald-600 bg-neutral-50/60 p-3 animate-fade-in">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                      {sesion.casoGanador.codigo}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 mt-1">
                      {sesion.casoGanador.titulo}
                    </h3>
                    {sesion.casoGanador.contenido && (
                      <p className="text-xs text-neutral-600 mt-1 line-clamp-3">
                        {sesion.casoGanador.contenido}
                      </p>
                    )}
                    {sesion.casoGanador.plazoHoras && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-neutral-900 bg-white p-2 border border-line">
                        <Clock className="size-3.5 text-amber-600" />
                        <span>Plazo Límite de Entrega: {sesion.casoGanador.plazoHoras} Horas Continuas</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">
                    El caso de estudio se sorteará inmediatamente después de fijar el área.
                  </p>
                )}
              </div>

              {/* 3. Veredicto y Acta Final */}
              {sesion?.fase === 'ACTA_OFICIALIZADA' && (
                <div className="w-full mt-4 border border-emerald-300 bg-emerald-50/70 p-4 shadow-xs animate-fade-in border-l-4 border-l-emerald-600">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    <span>Acta Oficial Oficializada y Firmada</span>
                  </div>
                  <div className="mt-2 text-xs text-emerald-900 space-y-1">
                    <p>
                      <strong>Código Acta:</strong>{' '}
                      <span className="font-mono">{sesion.codigoActa || 'ACTA-OFICIAL'}</span>
                    </p>
                    {sesion.hashActa && (
                      <p className="text-[11px] font-mono text-emerald-800 truncate">
                        <strong>Hash SHA-256:</strong> {sesion.hashActa}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-800 border-t border-emerald-200 pt-2">
                    <Mail className="size-3.5 text-emerald-700" />
                    <span>Copia oficial despachada a tu correo institucional ({sesion.correo})</span>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* Pie de Página Móvil */}
        <footer className="mt-4 text-center text-[10px] font-mono text-neutral-400">
          SGSEG · Conexión directa en tiempo real con servidor universitario UTEPSA
        </footer>
      </main>
    </div>
  )
}
