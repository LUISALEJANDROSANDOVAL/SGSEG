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
} from 'lucide-react'
import { sorteosApi } from '@/lib/sorteos.api'

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
}

export default function SorteoEnVivo() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [sesion, setSesion] = useState<SesionLiveState | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Polling de sincronización en tiempo real (cada 1.5s)
  const syncLiveState = useCallback(async () => {
    if (!token) {
      setError('No se proporcionó un token de sorteo válido.')
      setCargando(false)
      return
    }

    try {
      const data = await sorteosApi.getSesionLive(token)
      if (data) {
        setSesion(data)
        setError(null)
      }
    } catch {
      // Si el backend no responde o hubo error de red, no interrumpir la visualización
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => {
    syncLiveState()
    const interval = setInterval(syncLiveState, 1500)
    return () => clearInterval(interval)
  }, [syncLiveState])

  if (cargando && !sesion) {
    return (
      <div className="min-h-screen bg-[#121316] text-white flex flex-col items-center justify-center p-6">
        <div className="size-10 border-2 border-crimson border-t-transparent animate-spin rounded-full mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
          Conectando con el Acto de Sorteo...
        </p>
      </div>
    )
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-[#121316] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="size-12 rounded-full bg-red-900/30 border border-crimson flex items-center justify-center text-crimson mb-4">
          <AlertCircle className="size-6" />
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

  return (
    <div className="min-h-screen bg-surface pb-12">
      {/* Cabecera Institucional UTEPSA */}
      <header className="sticky top-0 z-30 border-b border-line bg-white shadow-2xs">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center bg-crimson text-white font-bold text-xs">
              U
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-crimson uppercase">
                UTEPSA · Grado
              </p>
              <h1 className="text-xs font-extrabold text-neutral-900">
                Sorteo Digital en Vivo
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>EN VIVO</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal para Móvil */}
      <main className="mx-auto max-w-md px-4 pt-4 flex flex-col gap-4">
        {/* Tarjeta del Postulante */}
        <section className="border border-line bg-white p-4 shadow-xs border-l-4 border-l-crimson">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
            Postulante en Sala
          </span>
          <h2 className="text-base font-bold text-neutral-900 mt-0.5">
            {sesion?.nombreEstudiante || 'Postulante'}
          </h2>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-[10px] text-neutral-500 uppercase">Carrera</p>
              <p className="font-semibold text-neutral-800">{sesion?.carrera || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase">Registro / CI</p>
              <p className="font-mono text-neutral-800 font-medium">{sesion?.carnet || '—'}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-[11px] text-neutral-500">
            <span>Modalidad: <strong>Defensa {sesion?.tipoDefensa || 'Interna'}</strong></span>
            <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
              Presente en Sala
            </span>
          </div>
        </section>

        {/* Estado en Vivo de los Giros */}
        <section className="flex flex-col gap-3">
          {/* Indicador de Giro Activo */}
          {(sesion?.fase === 'AREA_GIRANDO' || sesion?.fase === 'CASO_GIRANDO') && (
            <div className="border border-crimson/30 bg-crimson/5 p-4 text-center animate-pulse">
              <div className="mx-auto size-8 border-2 border-crimson border-t-transparent animate-spin rounded-full mb-2" />
              <p className="text-xs font-bold text-crimson uppercase tracking-wide">
                {sesion.fase === 'AREA_GIRANDO'
                  ? 'Girando Ruleta de Áreas en Sala...'
                  : 'Girando Ruleta de Casos de Estudio...'}
              </p>
              <p className="text-[11px] text-neutral-600 mt-1">
                Selección criptográfica CSPRNG en curso. Aguarde el resultado oficial.
              </p>
            </div>
          )}

          {/* 1. Área Académica Asignada */}
          <div className="border border-line bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                <Layers className="size-4 text-crimson" />
                <span>1. Área Temática</span>
              </div>
              {sesion?.areaGanadora ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  Asignada
                </span>
              ) : (
                <span className="text-[10px] font-mono text-neutral-400">
                  Pendiente
                </span>
              )}
            </div>

            {sesion?.areaGanadora ? (
              <div className="border-l-2 border-l-crimson pl-3 animate-fade-in">
                <span className="text-[10px] font-mono font-bold text-crimson uppercase">
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
                El sorteo de área académica aún no ha sido iniciado por el operador.
              </p>
            )}
          </div>

          {/* 2. Caso de Estudio Adjudicado */}
          <div className="border border-line bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                <BookOpen className="size-4 text-crimson" />
                <span>2. Caso de Estudio</span>
              </div>
              {sesion?.casoGanador ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  Adjudicado
                </span>
              ) : (
                <span className="text-[10px] font-mono text-neutral-400">
                  Pendiente
                </span>
              )}
            </div>

            {sesion?.casoGanador ? (
              <div className="border-l-2 border-l-emerald-600 pl-3 animate-fade-in">
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                  {sesion.casoGanador.codigo}
                </span>
                <h3 className="text-sm font-bold text-neutral-900 mt-1.5">
                  {sesion.casoGanador.titulo}
                </h3>
                {sesion.casoGanador.contenido && (
                  <p className="text-xs text-neutral-600 mt-1 line-clamp-3">
                    {sesion.casoGanador.contenido}
                  </p>
                )}
                {sesion.casoGanador.plazoHoras && (
                  <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-neutral-800">
                    <Clock className="size-3.5 text-amber-600" />
                    <span>Plazo de Entrega: {sesion.casoGanador.plazoHoras} Horas Continuas</span>
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
            <div className="border border-emerald-300 bg-emerald-50/70 p-4 shadow-xs animate-fade-in border-l-4 border-l-emerald-600">
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
                <span>Copia oficial despachada a {sesion.correo}</span>
              </div>
            </div>
          )}
        </section>

        {/* Pie de Página Móvil */}
        <footer className="mt-4 text-center text-[10px] font-mono text-neutral-400">
          Sincronización en tiempo real con servidor universitario SGSEG
        </footer>
      </main>
    </div>
  )
}
