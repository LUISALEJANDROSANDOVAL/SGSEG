'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Loader2,
  RotateCw,
  ShieldCheck,
  Shuffle,
  Sparkles,
} from 'lucide-react'
import { defensasApi, type Defensa } from '@/lib/defensas.api'
import {
  sorteosApi,
  type AreaResultado,
  type CasoResultado,
} from '@/lib/sorteos.api'

interface ModuloSorteoProps {
  onSorteoCompletado?: () => void
}

export function ModuloSorteo({ onSorteoCompletado }: ModuloSorteoProps) {
  // Lista de defensas pendientes
  const [defensasPendientes, setDefensasPendientes] = useState<Defensa[]>([])
  const [selectedDefensaId, setSelectedDefensaId] = useState<string>('')
  const [loadingDefensas, setLoadingDefensas] = useState<boolean>(true)

  // Presencia del estudiante
  const [estudiantePresente, setEstudiantePresente] = useState<boolean>(true)
  const [motivoInasistencia, setMotivoInasistencia] = useState<string>('')

  // Animación del bolillero
  const [girando, setGirando] = useState<boolean>(false)
  const [angulo, setAngulo] = useState<number>(0)

  // Resultado
  const [resultadoTexto, setResultadoTexto] = useState<string | null>(null)
  const [areaGanadora, setAreaGanadora] = useState<AreaResultado | null>(null)
  const [casoGanador, setCasoGanador] = useState<CasoResultado | null>(null)
  const [tokenActa, setTokenActa] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Cargar defensas pendientes de sorteo
  const cargarDefensas = async () => {
    setLoadingDefensas(true)
    try {
      const resp = await defensasApi.getDefensas({ limit: 50 })
      // Filtrar defensas que requieran sorteo (PROGRAMADA o AREA_SORTEADA)
      const pendientes = resp.items.filter(
        (d) => d.estadoDefensa === 'PROGRAMADA' || d.estadoDefensa === 'AREA_SORTEADA',
      )
      setDefensasPendientes(pendientes)
      if (pendientes.length > 0 && !selectedDefensaId) {
        setSelectedDefensaId(pendientes[0].idDefensa)
      }
    } catch (e) {
      console.error('Error al cargar defensas para sorteo:', e)
    } finally {
      setLoadingDefensas(false)
    }
  }

  useEffect(() => {
    cargarDefensas()
  }, [])

  const defensaActual = defensasPendientes.find((d) => d.idDefensa === selectedDefensaId)
  const esFCToPsicologia = defensaActual?.reglasSorteo?.modalidad === 'ANTICIPADO_CONJUNTO'
  const estadoDefensa = defensaActual?.estadoDefensa

  // Ejecutar animación de la ruleta
  const animarGiro = (callback: () => void) => {
    setGirando(true)
    setResultadoTexto(null)
    setAreaGanadora(null)
    setCasoGanador(null)
    setTokenActa(null)
    setMensajeExito(null)
    setErrorMsg(null)

    const vueltas = 1440 + Math.floor(Math.random() * 360)
    setAngulo((prev) => prev + vueltas)

    window.setTimeout(() => {
      callback()
      setGirando(false)
    }, 2800)
  }

  // 1. Sortear Área
  const handleSortearArea = async () => {
    if (!selectedDefensaId || girando) return
    animarGiro(async () => {
      try {
        const resp = await sorteosApi.sortearArea({
          idDefensa: selectedDefensaId,
          estudiantePresente,
          motivoInasistencia: !estudiantePresente ? motivoInasistencia : undefined,
        })
        setResultadoTexto(resp.areaGanadora.nombre)
        setAreaGanadora(resp.areaGanadora)
        setTokenActa(resp.tokenActa)
        setMensajeExito(resp.mensaje)
        cargarDefensas()
        onSorteoCompletado?.()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error en sorteo de área'
        setErrorMsg(msg)
      }
    })
  }

  // 2. Sortear Caso
  const handleSortearCaso = async () => {
    if (!selectedDefensaId || girando) return
    animarGiro(async () => {
      try {
        const resp = await sorteosApi.sortearCaso({
          idDefensa: selectedDefensaId,
          estudiantePresente,
          motivoInasistencia: !estudiantePresente ? motivoInasistencia : undefined,
        })
        setResultadoTexto(resp.casoGanador.titulo)
        setCasoGanador(resp.casoGanador)
        setTokenActa(resp.tokenActa)
        setMensajeExito(resp.mensaje)
        cargarDefensas()
        onSorteoCompletado?.()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error en sorteo de caso'
        setErrorMsg(msg)
      }
    })
  }

  // 3. Sorteo Conjunto (FCT y Psicología)
  const handleSorteoConjunto = async () => {
    if (!selectedDefensaId || girando) return
    animarGiro(async () => {
      try {
        const resp = await sorteosApi.sorteoConjunto({
          idDefensa: selectedDefensaId,
          estudiantePresente,
          motivoInasistencia: !estudiantePresente ? motivoInasistencia : undefined,
        })
        setResultadoTexto(`${resp.areaGanadora.nombre} ➔ ${resp.casoGanador.titulo}`)
        setAreaGanadora(resp.areaGanadora)
        setCasoGanador(resp.casoGanador)
        setTokenActa(resp.tokenActa)
        setMensajeExito(resp.mensaje)
        cargarDefensas()
        onSorteoCompletado?.()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error en sorteo conjunto'
        setErrorMsg(msg)
      }
    })
  }

  return (
    <section className="flex flex-col border border-line bg-white shadow-xs">
      <header className="border-b border-line px-5 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shuffle className="size-4 text-crimson" />
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
              Bolillero Digital Criptográfico
            </h2>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Algoritmo CSPRNG sin sesgos con generación automática de Acta y Hash SHA-256
          </p>
        </div>
        <button
          type="button"
          onClick={cargarDefensas}
          className="text-neutral-400 hover:text-neutral-700 p-1"
          title="Recargar defensas pendientes"
        >
          <RotateCw className={`size-3.5 ${loadingDefensas ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-5 px-5 py-6">
        {/* Selector de Postulante Programado */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Postulante y Defensa Programada *
          </label>
          {loadingDefensas ? (
            <div className="text-xs text-neutral-400 py-2">Cargando postulantes programados...</div>
          ) : defensasPendientes.length === 0 ? (
            <div className="border border-line bg-surface p-3 text-xs text-neutral-500">
              No hay postulantes con defensas pendientes de sorteo en este momento. Puede programar una nueva fecha
              en el módulo de defensas.
            </div>
          ) : (
            <select
              value={selectedDefensaId}
              onChange={(e) => {
                setSelectedDefensaId(e.target.value)
                setResultadoTexto(null)
                setTokenActa(null)
                setMensajeExito(null)
                setErrorMsg(null)
              }}
              disabled={girando}
              className="w-full border border-line bg-surface px-3 py-2 text-xs font-medium outline-none focus:border-neutral-500"
            >
              {defensasPendientes.map((def) => {
                const est = def.instancia.proceso.estudiante
                return (
                  <option key={def.idDefensa} value={def.idDefensa}>
                    {est.nombreCompleto} ({est.carnetEstudiantil}) — {est.planEstudio.carrera.nombre} [
                    {def.tipoDefensa.nombre}] · Estado: {def.estadoDefensa}
                  </option>
                )
              })}
            </select>
          )}
        </div>

        {/* Ficha contextual del postulante seleccionado */}
        {defensaActual && (
          <div className="border border-line bg-surface p-3.5 text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="font-semibold text-neutral-800">
                {defensaActual.instancia.proceso.estudiante.nombreCompleto}
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                  defensaActual.estadoDefensa === 'AREA_SORTEADA'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {defensaActual.estadoDefensa}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600">
              <div>
                <span className="text-neutral-500">Carrera:</span>{' '}
                <strong>{defensaActual.instancia.proceso.estudiante.planEstudio.carrera.nombre}</strong>
              </div>
              <div>
                <span className="text-neutral-500">Tipo Defensa:</span>{' '}
                <strong>{defensaActual.tipoDefensa.nombre}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-500">Regla Reglamentaria:</span>{' '}
                <span className="text-neutral-800">
                  {defensaActual.reglasSorteo?.descripcionModalidad || 'Plazo reglamentario UPTECSA'}
                </span>
              </div>
            </div>

            {/* Checkbox de presencia del estudiante */}
            <div className="pt-2 border-t border-line flex flex-col gap-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={estudiantePresente}
                  onChange={(e) => setEstudiantePresente(e.target.checked)}
                  disabled={girando}
                  className="rounded-xs border-line text-crimson focus:ring-crimson"
                />
                <span className="text-[11px] font-medium text-neutral-700">
                  Estudiante presente en el acto de sorteo (conforme a reglamento)
                </span>
              </label>

              {!estudiantePresente && (
                <input
                  type="text"
                  placeholder="Justificación / Motivo de inasistencia..."
                  value={motivoInasistencia}
                  onChange={(e) => setMotivoInasistencia(e.target.value)}
                  className="w-full border border-line bg-white px-2.5 py-1.5 text-xs outline-none focus:border-neutral-400"
                />
              )}
            </div>
          </div>
        )}

        {/* Mensajes de Alerta / Error */}
        {errorMsg && (
          <div className="border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {mensajeExito && (
          <div className="border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Ruleta Digital Interactiva */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative flex size-52 items-center justify-center">
            {/* Flecha indicadora superior */}
            <span
              aria-hidden="true"
              className="absolute -top-1.5 left-1/2 z-20 size-0 -translate-x-1/2 border-x-8 border-t-12 border-x-transparent border-t-crimson drop-shadow-xs"
            />
            {/* Rueda animada SVG */}
            <svg
              viewBox="0 0 100 100"
              role="img"
              aria-label="Rueda de sorteo aleatorio"
              className="size-full -rotate-90 transition-transform duration-[2800ms] cubic-bezier(0.15, 0.9, 0.25, 1)"
              style={{ transform: `rotate(${angulo - 90}deg)` }}
            >
              {[
                '#0F172A',
                '#9E1B32',
                '#1E293B',
                '#B91C1C',
                '#334155',
                '#9E1B32',
              ].map((color, i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke={color}
                  strokeWidth="16"
                  strokeDasharray={`${(2 * Math.PI * 38) / 6 - 1} ${2 * Math.PI * 38}`}
                  strokeDashoffset={-((2 * Math.PI * 38) / 6) * i}
                />
              ))}
              <circle cx="50" cy="50" r="26" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
            </svg>

            <div className="absolute flex flex-col items-center text-center px-4">
              <span className="text-[10px] tracking-[0.14em] text-neutral-500 uppercase font-semibold">
                {girando ? 'Sorteando...' : resultadoTexto ? 'Ganador' : 'En Espera'}
              </span>
              <span className="text-xs font-bold text-neutral-900 mt-1 line-clamp-2 max-w-[130px]">
                {girando ? (
                  <Loader2 className="size-5 animate-spin text-crimson mx-auto my-1" />
                ) : (
                  resultadoTexto ?? '—'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones de Sorteo según Modalidad Reglamentaria */}
        <div className="flex flex-col gap-2">
          {estadoDefensa === 'PROGRAMADA' && esFCToPsicologia && (
            <button
              type="button"
              disabled={girando || !selectedDefensaId}
              onClick={handleSorteoConjunto}
              className="flex items-center justify-center gap-2 bg-crimson px-4 py-3 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              <Sparkles className="size-4" />
              Ejecutar Sorteo Conjunto Anticipado (Área + Caso)
            </button>
          )}

          {estadoDefensa === 'PROGRAMADA' && (
            <button
              type="button"
              disabled={girando || !selectedDefensaId}
              onClick={handleSortearArea}
              className="flex items-center justify-center gap-2 bg-ink px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              <Shuffle className="size-3.5" />
              Sortear Área Temática (Fase 1)
            </button>
          )}

          {estadoDefensa === 'AREA_SORTEADA' && (
            <button
              type="button"
              disabled={girando || !selectedDefensaId}
              onClick={handleSortearCaso}
              className="flex items-center justify-center gap-2 bg-crimson px-4 py-3 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              <Award className="size-4" />
              Sortear Caso de Estudio (Fase 2)
            </button>
          )}
        </div>

        {/* Tarjeta del Token Criptográfico del Acta si se generó */}
        {(areaGanadora || casoGanador) && (
          <div className="flex flex-col gap-2">
            {areaGanadora && (
              <div className="bg-blue-50 border border-blue-200 p-2.5 text-xs text-blue-950 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-700 uppercase font-semibold block">Área Sorteada</span>
                  <span className="font-bold">{areaGanadora.nombre}</span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 font-medium border border-blue-300">
                  Habilitada
                </span>
              </div>
            )}
            {casoGanador && (
              <div className="bg-purple-50 border border-purple-200 p-2.5 text-xs text-purple-950 flex flex-col gap-1">
                <span className="text-[10px] text-purple-700 uppercase font-semibold block">Caso Asignado</span>
                <span className="font-bold">{casoGanador.titulo}</span>
                <p className="text-[11px] text-purple-800 italic line-clamp-2">
                  "{casoGanador.contenido}"
                </p>
              </div>
            )}
          </div>
        )}

        {tokenActa && (
          <div className="border border-emerald-300 bg-emerald-50/50 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <ShieldCheck className="size-4 text-emerald-700" />
              <span>ACTA GENERADA CON SELLO DE INTEGRIDAD SHA-256</span>
            </div>
            <div className="bg-white p-2.5 border border-emerald-200 font-mono text-[11px] text-neutral-800 break-all select-all">
              {tokenActa}
            </div>
            <p className="text-[10px] text-emerald-800">
              Este token auditable certifica la validez matemática y reglamentaria de la asignación.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
