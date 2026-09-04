'use client'

import { useEffect, useState, useRef } from 'react'
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  Loader2,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  Shuffle,
  Sparkles,
} from 'lucide-react'
import { useAuth, normalizarRol } from '@/context/AuthContext'
import { defensasApi, type Defensa } from '@/lib/defensas.api'
import {
  sorteosApi,
  type AreaResultado,
  type CasoResultado,
} from '@/lib/sorteos.api'
import { casosApi, type AreaAcademica, type CasoEstudio } from '@/lib/casos.api'
import { RuletaSvg, type SectorRuleta } from './ruleta-svg'

interface ModuloSorteoProps {
  onSorteoCompletado?: () => void
}

type FaseSorteo = 'FASE_1_AREA' | 'FASE_2_CASO' | 'FINALIZADO'

export function ModuloSorteo({ onSorteoCompletado }: ModuloSorteoProps) {
  const { user } = useAuth()
  const userRolCode = user ? normalizarRol(user.rol).code : 'COORDINACION'
  const esVicerrectorado = userRolCode === 'VICERRECTORADO'

  // Lista de defensas pendientes
  const [defensasPendientes, setDefensasPendientes] = useState<Defensa[]>([])
  const [selectedDefensaId, setSelectedDefensaId] = useState<string>('')
  const [loadingDefensas, setLoadingDefensas] = useState<boolean>(true)

  // Presencia del estudiante
  const [estudiantePresente, setEstudiantePresente] = useState<boolean>(true)
  const [motivoInasistencia, setMotivoInasistencia] = useState<string>('')

  // Control de Fases del Sorteo
  const [faseActual, setFaseActual] = useState<FaseSorteo>('FASE_1_AREA')
  const [areasCarrera, setAreasCarrera] = useState<AreaAcademica[]>([])
  const [casosArea, setCasosArea] = useState<CasoEstudio[]>([])
  const [loadingOpciones, setLoadingOpciones] = useState<boolean>(false)

  // Animación y giro de la Ruleta
  const [girando, setGirando] = useState<boolean>(false)
  const [angulo, setAngulo] = useState<number>(0)
  const anguloRef = useRef<number>(0)
  anguloRef.current = angulo

  // Resultados
  const [areaGanadora, setAreaGanadora] = useState<AreaResultado | null>(null)
  const [casoGanador, setCasoGanador] = useState<CasoResultado | null>(null)
  const [tokenActa, setTokenActa] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function extractErrorMessage(err: unknown, fallback: string): string {
    const axiosMsg = (err as any)?.response?.data?.message
    if (Array.isArray(axiosMsg)) return axiosMsg.join(', ')
    if (typeof axiosMsg === 'string' && axiosMsg.trim().length > 0) return axiosMsg
    if (err instanceof Error) return err.message
    return fallback
  }

  // Cargar defensas pendientes de sorteo
  const cargarDefensas = async () => {
    setLoadingDefensas(true)
    try {
      const resp = await defensasApi.getDefensas({ limit: 50 })
      const pendientes = resp.items.filter(
        (d) => d.estadoDefensa === 'PROGRAMADA' || d.estadoDefensa === 'AREA_SORTEADA',
      )
      setDefensasPendientes(pendientes)
      if (pendientes.length > 0) {
        if (!selectedDefensaId || !pendientes.some((p) => p.idDefensa === selectedDefensaId)) {
          setSelectedDefensaId(pendientes[0].idDefensa)
        }
      } else {
        setSelectedDefensaId('')
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

  // Cargar áreas o casos según la defensa seleccionada y su estado
  useEffect(() => {
    if (!defensaActual) {
      setAreasCarrera([])
      setCasosArea([])
      return
    }

    const idCarrera = defensaActual.instancia.proceso.estudiante.planEstudio.carrera.idCarrera

    async function cargarContextoDefensa() {
      setLoadingOpciones(true)
      setErrorMsg(null)
      try {
        if (defensaActual?.estadoDefensa === 'AREA_SORTEADA') {
          // Obtener detalle completo de la defensa para identificar el área ya sorteada
          const detalle = await defensasApi.getDefensaById(defensaActual.idDefensa)
          const sorteoConArea = detalle.sorteos?.find(
            (s) => s.area && s.area.areaResultado,
          )

          if (sorteoConArea && sorteoConArea.area) {
            const res = sorteoConArea.area.areaResultado
            const areaPrevia: AreaResultado = {
              idArea: res.idArea,
              nombre: res.nombre,
              idCarrera: idCarrera,
              umbralDisponibilidad: 2,
              estado: 'ACTIVO',
            }
            setAreaGanadora(areaPrevia)
            setFaseActual('FASE_2_CASO')

            // Cargar casos de estudio disponibles para esta área
            const respCasos = await casosApi.getCasos({
              idArea: res.idArea,
              estado: 'DISPONIBLE',
            })
            setCasosArea(respCasos.items)
          } else {
            // Fallback a áreas de la carrera
            const respAreas = await casosApi.getAreas(idCarrera)
            setAreasCarrera(respAreas)
            setFaseActual('FASE_1_AREA')
          }
        } else {
          // Estado PROGRAMADA: Iniciar en Fase 1 (Sorteo de Área)
          setFaseActual('FASE_1_AREA')
          setAreaGanadora(null)
          setCasoGanador(null)
          setCasosArea([])
          const respAreas = await casosApi.getAreas(idCarrera)
          setAreasCarrera(respAreas)
        }
      } catch (err) {
        console.error('Error al cargar contexto de sorteo:', err)
      } finally {
        setLoadingOpciones(false)
      }
    }

    cargarContextoDefensa()
  }, [selectedDefensaId, estadoDefensa])

  // Generar sectores SVG para la ruleta según la Fase activa
  const sectoresRuleta: SectorRuleta[] =
    faseActual === 'FASE_1_AREA'
      ? areasCarrera.map((area) => ({
          id: area.idArea,
          label: area.nombre,
        }))
      : casosArea.map((caso) => ({
          id: caso.idCasoEstudio,
          label: caso.titulo,
        }))

  // Cálculo matemático para que el sector ganador se alinee con el puntero superior (12 en punto)
  const animarGiroExacto = (
    winnerIndex: number,
    totalSectores: number,
    onFinish: () => void,
  ) => {
    setGirando(true)
    setErrorMsg(null)

    const numSectores = Math.max(totalSectores, 1)
    const anguloSector = 360 / numSectores
    const sliceMidAngle = winnerIndex * anguloSector + anguloSector / 2

    // 4 vueltas completas (1440°) más el offset necesario para que sliceMidAngle quede en 0° (12 en punto)
    const currentRot = anguloRef.current
    const targetDelta = 1440 + ((360 - ((currentRot + sliceMidAngle) % 360)) % 360)
    const finalAngle = currentRot + targetDelta

    setAngulo(finalAngle)

    window.setTimeout(() => {
      setGirando(false)
      onFinish()
    }, 3200)
  }

  // 1. Sortear Área (Fase 1)
  const handleSortearArea = async () => {
    if (!selectedDefensaId || girando || esVicerrectorado) return

    try {
      const resp = await sorteosApi.sortearArea({
        idDefensa: selectedDefensaId,
        estudiantePresente,
        motivoInasistencia: !estudiantePresente ? motivoInasistencia : undefined,
      })

      // Encontrar el índice del área ganadora en la ruleta
      const winnerIndex = areasCarrera.findIndex(
        (a) => a.idArea === resp.areaGanadora.idArea || a.nombre === resp.areaGanadora.nombre,
      )
      const validIndex = winnerIndex >= 0 ? winnerIndex : 0

      animarGiroExacto(validIndex, areasCarrera.length, async () => {
        setAreaGanadora(resp.areaGanadora)
        setTokenActa(resp.tokenActa)
        setMensajeExito(
          `¡Área sorteada con éxito! Se seleccionó: ${resp.areaGanadora.nombre}. Proceda ahora a la Fase 2 (Sorteo de Caso).`,
        )

        // Cargar casos de la nueva área ganadora y pasar a Fase 2
        setLoadingOpciones(true)
        try {
          const respCasos = await casosApi.getCasos({
            idArea: resp.areaGanadora.idArea,
            estado: 'DISPONIBLE',
          })
          setCasosArea(respCasos.items)
          setFaseActual('FASE_2_CASO')
        } catch (e) {
          console.error('Error al cargar casos del área ganadora:', e)
        } finally {
          setLoadingOpciones(false)
        }

        await cargarDefensas()
        onSorteoCompletado?.()
      })
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err, 'Error al ejecutar sorteo de área.'))
    }
  }

  // 2. Sortear Caso de Estudio (Fase 2)
  const handleSortearCaso = async () => {
    if (!selectedDefensaId || girando || esVicerrectorado) return

    try {
      const resp = await sorteosApi.sortearCaso({
        idDefensa: selectedDefensaId,
        estudiantePresente,
        motivoInasistencia: !estudiantePresente ? motivoInasistencia : undefined,
      })

      const winnerIndex = casosArea.findIndex(
        (c) =>
          c.idCasoEstudio === resp.casoGanador.idCasoEstudio ||
          c.titulo === resp.casoGanador.titulo,
      )
      const validIndex = winnerIndex >= 0 ? winnerIndex : 0

      animarGiroExacto(validIndex, casosArea.length, async () => {
        setCasoGanador(resp.casoGanador)
        setTokenActa(resp.tokenActa)
        setMensajeExito(
          `¡Caso de estudio asignado exitosamente! Caso: "${resp.casoGanador.titulo}". Acta oficial emitida.`,
        )
        setFaseActual('FINALIZADO')
        await cargarDefensas()
        onSorteoCompletado?.()
      })
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err, 'Error al ejecutar sorteo de caso.'))
    }
  }

  // 3. Sorteo Conjunto (FCT y Psicología)
  const handleSorteoConjunto = async () => {
    if (!selectedDefensaId || girando || esVicerrectorado) return

    try {
      const resp = await sorteosApi.sorteoConjunto({
        idDefensa: selectedDefensaId,
        estudiantePresente,
        motivoInasistencia: !estudiantePresente ? motivoInasistencia : undefined,
      })

      const winnerIndex = areasCarrera.findIndex(
        (a) => a.idArea === resp.areaGanadora.idArea || a.nombre === resp.areaGanadora.nombre,
      )
      const validIndex = winnerIndex >= 0 ? winnerIndex : 0

      animarGiroExacto(validIndex, areasCarrera.length, async () => {
        setAreaGanadora(resp.areaGanadora)
        setCasoGanador(resp.casoGanador)
        setTokenActa(resp.tokenActa)
        setMensajeExito(
          `¡Sorteo conjunto anticipado completado! Área: ${resp.areaGanadora.nombre} | Caso: "${resp.casoGanador.titulo}".`,
        )
        setFaseActual('FINALIZADO')
        await cargarDefensas()
        onSorteoCompletado?.()
      })
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err, 'Error al ejecutar sorteo conjunto.'))
    }
  }

  return (
    <section className="flex flex-col border border-line bg-white shadow-xs">
      {/* Encabezado */}
      <header className="border-b border-line px-5 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shuffle className="size-4 text-crimson" />
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
              Bolillero Digital Criptográfico — Sorteo en 2 Fases
            </h2>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Fase 1: Sorteo de Área Temática · Fase 2: Asignación de Caso de Estudio específico
          </p>
        </div>
        <button
          type="button"
          onClick={cargarDefensas}
          className="text-neutral-400 hover:text-neutral-700 p-1 transition-colors"
          title="Recargar postulantes pendientes"
        >
          <RotateCw className={`size-3.5 ${loadingDefensas ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-5 px-5 py-6">
        {/* Aviso Exclusivo para Rol Vicerrectorado (Solo Lectura) */}
        {esVicerrectorado && (
          <div className="border border-blue-300 bg-blue-50/80 p-3.5 text-xs text-blue-900 flex items-center gap-2.5 font-medium">
            <ShieldAlert className="size-4 shrink-0 text-blue-700" />
            <span>
              <strong>Modo Supervisión y Auditoría (Solo Lectura):</strong> El rol Vicerrectorado no posee autorización operativa para ejecutar sorteos.
            </span>
          </div>
        )}

        {/* Indicador de Fases (1: Área / 2: Caso) */}
        <div className="grid grid-cols-2 gap-2 border border-line bg-surface p-1.5 text-xs">
          <div
            className={`flex items-center justify-center gap-2 py-2 font-semibold transition-colors ${
              faseActual === 'FASE_1_AREA'
                ? 'bg-crimson text-white shadow-xs'
                : areaGanadora
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-neutral-500'
            }`}
          >
            <BookOpen className="size-3.5" />
            <span>Fase 1: Área Temática {areaGanadora ? '✓' : ''}</span>
          </div>
          <div
            className={`flex items-center justify-center gap-2 py-2 font-semibold transition-colors ${
              faseActual === 'FASE_2_CASO'
                ? 'bg-crimson text-white shadow-xs'
                : casoGanador
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-neutral-500'
            }`}
          >
            <Award className="size-3.5" />
            <span>Fase 2: Caso de Estudio {casoGanador ? '✓' : ''}</span>
          </div>
        </div>

        {/* Selector de Postulante Programado */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Postulante y Defensa Programada *
          </label>
          {loadingDefensas ? (
            <div className="text-xs text-neutral-400 py-2 flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin text-crimson" />
              <span>Cargando postulantes programados...</span>
            </div>
          ) : defensasPendientes.length === 0 ? (
            <div className="border border-line bg-surface p-3 text-xs text-neutral-500">
              No hay postulantes con defensas pendientes de sorteo en este momento.
            </div>
          ) : (
            <select
              value={selectedDefensaId}
              onChange={(e) => {
                setSelectedDefensaId(e.target.value)
                setAreaGanadora(null)
                setCasoGanador(null)
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
                {defensaActual.estadoDefensa === 'AREA_SORTEADA'
                  ? 'Fase 2: Pendiente Sorteo de Caso'
                  : 'Fase 1: Pendiente Sorteo de Área'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600">
              <div>
                <span className="text-neutral-500">Carrera:</span>{' '}
                <strong>{defensaActual.instancia.proceso.estudiante.planEstudio.carrera.nombre}</strong>
              </div>
              <div>
                <span className="text-neutral-500">Tipo de Defensa:</span>{' '}
                <strong>{defensaActual.tipoDefensa.nombre}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-500">Regla Reglamentaria UTEPSA:</span>{' '}
                <span className="text-neutral-800 font-medium">
                  {defensaActual.reglasSorteo?.descripcionModalidad || 'Plazo reglamentario UTEPSA'}
                </span>
              </div>
            </div>

            {/* Checkbox de presencia reglamentaria */}
            <div className="pt-2 border-t border-line flex flex-col gap-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={estudiantePresente}
                  onChange={(e) => setEstudiantePresente(e.target.checked)}
                  disabled={girando || esVicerrectorado}
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
                  disabled={girando || esVicerrectorado}
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

        {/* Ruleta Visual Dividida en 2 Fases */}
        <div className="flex flex-col items-center justify-center py-2">
          {loadingOpciones ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-xs text-neutral-400">
              <Loader2 className="size-6 animate-spin text-crimson" />
              <span>Cargando opciones reglamentarias para la ruleta...</span>
            </div>
          ) : sectoresRuleta.length === 0 ? (
            <div className="border border-line bg-surface p-6 text-center text-xs text-neutral-500 max-w-sm">
              No se encontraron opciones disponibles para sortear en esta etapa.
            </div>
          ) : (
            <RuletaSvg
              sectores={sectoresRuleta}
              anguloRotacion={angulo}
              girando={girando}
              tamano={330}
              faseLabel={
                faseActual === 'FASE_1_AREA'
                  ? `Fase 1: Sorteo de Área (${sectoresRuleta.length} áreas oficiales)`
                  : `Fase 2: Sorteo de Caso (${sectoresRuleta.length} casos de ${areaGanadora?.nombre || 'área'})`
              }
            />
          )}
        </div>

        {/* Acciones de Sorteo según Modalidad y Fase */}
        <div className="flex flex-col gap-2">
          {/* FASE 1: Sorteo de Área */}
          {faseActual === 'FASE_1_AREA' && !esFCToPsicologia && (
            <button
              type="button"
              disabled={girando || !selectedDefensaId || esVicerrectorado || loadingOpciones}
              onClick={handleSortearArea}
              className="flex items-center justify-center gap-2 bg-crimson px-4 py-3 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              <Shuffle className="size-4" />
              {esVicerrectorado
                ? 'Operación no autorizada para Vicerrectorado (Solo Lectura)'
                : 'Girar Ruleta: Sortear Área Temática (Fase 1)'}
            </button>
          )}

          {/* FASE 1: Sorteo Conjunto Anticipado para FCT y Psicología */}
          {faseActual === 'FASE_1_AREA' && esFCToPsicologia && (
            <button
              type="button"
              disabled={girando || !selectedDefensaId || esVicerrectorado || loadingOpciones}
              onClick={handleSorteoConjunto}
              className="flex items-center justify-center gap-2 bg-crimson px-4 py-3 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              <Sparkles className="size-4" />
              {esVicerrectorado
                ? 'Operación no autorizada para Vicerrectorado (Solo Lectura)'
                : 'Ejecutar Sorteo Conjunto Anticipado (Área + Caso)'}
            </button>
          )}

          {/* FASE 2: Sorteo de Caso de Estudio */}
          {faseActual === 'FASE_2_CASO' && (
            <button
              type="button"
              disabled={
                girando ||
                !selectedDefensaId ||
                esVicerrectorado ||
                loadingOpciones ||
                casosArea.length === 0
              }
              onClick={handleSortearCaso}
              className="flex items-center justify-center gap-2 bg-crimson px-4 py-3 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              <Award className="size-4" />
              {esVicerrectorado
                ? 'Operación no autorizada para Vicerrectorado (Solo Lectura)'
                : `Girar Ruleta: Sortear Caso de Estudio de ${areaGanadora?.nombre || 'Área'} (Fase 2)`}
            </button>
          )}
        </div>

        {/* Tarjetas de Resultados */}
        {(areaGanadora || casoGanador) && (
          <div className="flex flex-col gap-2.5 pt-2">
            {areaGanadora && (
              <div className="bg-blue-50/90 border border-blue-200 p-3 text-xs text-blue-950 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-700 uppercase font-semibold block tracking-wider">
                    Área Académica Sorteada (Fase 1)
                  </span>
                  <span className="text-sm font-bold text-blue-900">{areaGanadora.nombre}</span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2.5 py-1 font-bold border border-blue-300 rounded-xs">
                  Área Habilitada
                </span>
              </div>
            )}

            {casoGanador && (
              <div className="bg-purple-50/90 border border-purple-200 p-3 text-xs text-purple-950 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-purple-700 uppercase font-semibold tracking-wider">
                    Caso de Estudio Asignado (Fase 2)
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 font-bold border border-purple-300 rounded-xs">
                    Asignación Concluida
                  </span>
                </div>
                <span className="font-bold text-sm text-purple-950">{casoGanador.titulo}</span>
                <p className="text-[11px] text-purple-800/90 italic leading-relaxed">
                  "{casoGanador.contenido}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Certificado de Integridad Criptográfica del Acta */}
        {tokenActa && (
          <div className="border border-emerald-300 bg-emerald-50/60 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <ShieldCheck className="size-4 text-emerald-700" />
              <span>ACTA OFICIAL DE SORTEO — SELLO CRIPTOGRÁFICO SHA-256</span>
            </div>
            <div className="bg-white p-2.5 border border-emerald-200 font-mono text-[11px] text-neutral-800 break-all select-all font-semibold">
              {tokenActa}
            </div>
            <div className="flex items-center justify-between text-[10px] text-emerald-800">
              <span>Algoritmo CSPRNG auditado sin sesgos</span>
              <span className="flex items-center gap-1">
                <FileCheck2 className="size-3 text-emerald-600" />
                Validez legal institucional
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
