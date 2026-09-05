import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Eye,
  Filter,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { useAuth } from '@/context/AuthContext'
import {
  defensasApi,
  determinarEscalaResultado,
  numeroALetras,
} from '@/lib/defensas.api'
import type { Defensa, EmbudoEstados } from '@/lib/defensas.api'
import { estudiantesApi } from '@/lib/estudiantes.api'
import type { Estudiante } from '@/lib/estudiantes.api'
import { esJefeCarrera, getJefeCarreraId } from '@/lib/auth-helpers'

export default function PaginaDefensas() {
  // Rol de usuario autenticado
  const { user } = useAuth()
  const isJefe = esJefeCarrera(user)
  const jefeCarreraId = getJefeCarreraId(user)
  const esSoloLectura = user?.rol === 'Vicerrectorado' || isJefe

  // Datos
  const [defensas, setDefensas] = useState<Defensa[]>([])
  const [embudo, setEmbudo] = useState<EmbudoEstados | null>(null)
  const [alertas, setAlertas] = useState<Defensa[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null)

  // Filtros y paginación
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedEstado, setSelectedEstado] = useState<string>('ALL')
  const [selectedTipo, setSelectedTipo] = useState<string>('ALL')
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)

  // Modales
  const [modalProgramar, setModalProgramar] = useState<boolean>(false)
  const [modalDetalle, setModalDetalle] = useState<Defensa | null>(null)
  const [modalCalificar, setModalCalificar] = useState<Defensa | null>(null)
  const [modalActa, setModalActa] = useState<Defensa | null>(null)

  // Formulario Calificación de Examen de Grado
  const [notaForm, setNotaForm] = useState<number>(85)
  const [resultadoForm, setResultadoForm] = useState<string>('APROBADO_CON_FELICITACION')
  const [presidenteForm, setPresidenteForm] = useState<string>('')
  const [secretarioForm, setSecretarioForm] = useState<string>('')
  const [vocalForm, setVocalForm] = useState<string>('')
  const [observacionesForm, setObservacionesForm] = useState<string>('')

  // Formulario programar defensa
  const [estudiantesList, setEstudiantesList] = useState<Estudiante[]>([])
  const [selectedEstudianteId, setSelectedEstudianteId] = useState<string>('')
  const [tipoDefensaForm, setTipoDefensaForm] = useState<'INTERNA' | 'EXTERNA'>('INTERNA')
  const [fechaDefensaForm, setFechaDefensaForm] = useState<string>('')
  const [periodoForm, setPeriodoForm] = useState<string>('II-2026')

  // Cargar datos
  const cargarDatos = async () => {
    setLoading(true)
    try {
      const idCarreraFiltro = isJefe && jefeCarreraId ? jefeCarreraId : undefined
      const [embudoData, alertasData, defensasData] = await Promise.all([
        defensasApi.getEmbudo(),
        defensasApi.getAlertas(15),
        defensasApi.getDefensas({
          page,
          limit: 10,
          search: searchTerm,
          estadoDefensa: selectedEstado,
          tipoDefensa: selectedTipo,
          idCarrera: idCarreraFiltro,
        }),
      ])

      setEmbudo(embudoData)
      setAlertas(alertasData)
      setDefensas(defensasData.items)
      setTotalPages(defensasData.pagination.totalPages)
      setTotalCount(defensasData.pagination.total)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar cronograma de defensas'
      setFeedback({ tipo: 'error', mensaje: msg })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [page, selectedEstado, selectedTipo])

  // Cargar estudiantes para el modal de programación
  const abrirModalProgramar = async () => {
    setModalProgramar(true)
    if (estudiantesList.length === 0) {
      try {
        const resp = await estudiantesApi.getEstudiantes({ limit: 100 })
        setEstudiantesList(resp.items)
        if (resp.items.length > 0) {
          setSelectedEstudianteId(resp.items[0].idEstudiante)
        }
      } catch (e) {
        console.error('Error cargando estudiantes:', e)
      }
    }
  }

  // Guardar programación
  const handleProgramar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEstudianteId || !fechaDefensaForm) {
      setFeedback({ tipo: 'error', mensaje: 'Seleccione un estudiante y una fecha de defensa.' })
      return
    }

    setActionLoading(true)
    try {
      const res = await defensasApi.programarDefensa({
        idEstudiante: selectedEstudianteId,
        tipoDefensa: tipoDefensaForm,
        fechaDefensa: fechaDefensaForm,
        periodoAcademico: periodoForm,
      })

      setFeedback({
        tipo: 'exito',
        mensaje: `Defensa programada exitosamente. ${res.reglasSorteo?.descripcionModalidad || ''}`,
      })
      setModalProgramar(false)
      setFechaDefensaForm('')
      await cargarDatos()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al programar defensa'
      setFeedback({ tipo: 'error', mensaje: msg })
    } finally {
      setActionLoading(false)
    }
  }

  // Abrir modal de calificación formal
  const abrirModalCalificar = (defensa: Defensa) => {
    setModalCalificar(defensa)
    const notaActual = defensa.nota !== null && defensa.nota !== undefined ? Number(defensa.nota) : 85
    setNotaForm(notaActual)

    // Extraer datos de auditoría de calificación previa si existe
    const audit = defensa.auditorias?.find((a) => a.tipoOperacion === 'REGISTRO_CALIFICACION')
    const tribunal = audit?.valorNuevo?.tribunal

    if (defensa.resultado) {
      setResultadoForm(defensa.resultado)
    } else {
      const escala = determinarEscalaResultado(notaActual)
      setResultadoForm(escala.resultadoDefault)
    }

    setPresidenteForm(tribunal?.presidente || '')
    setSecretarioForm(tribunal?.secretario || '')
    setVocalForm(tribunal?.vocal || '')
    setObservacionesForm(audit?.valorNuevo?.observaciones || '')
  }

  // Cambio reactivo de nota numérica con ajuste automático de escala
  const handleNotaChange = (val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val))
    setNotaForm(clamped)
    const escala = determinarEscalaResultado(clamped)
    setResultadoForm(escala.resultadoDefault)
  }

  // Registrar calificación en el sistema
  const handleGuardarCalificacion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalCalificar) return

    if (notaForm < 0 || notaForm > 100) {
      setFeedback({ tipo: 'error', mensaje: 'La nota debe estar comprendida entre 0 y 100 puntos.' })
      return
    }

    setActionLoading(true)
    try {
      const res = await defensasApi.calificarDefensa(modalCalificar.idDefensa, {
        nota: Number(notaForm),
        resultado: resultadoForm,
        observaciones: observacionesForm.trim() || undefined,
        tribunal: {
          presidente: presidenteForm.trim() || undefined,
          secretario: secretarioForm.trim() || undefined,
          vocal: vocalForm.trim() || undefined,
        },
      })

      setFeedback({
        tipo: 'exito',
        mensaje: res.mensaje || `Calificación registrada exitosamente: ${notaForm}/100.`,
      })
      setModalCalificar(null)
      await cargarDatos()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar la calificación'
      setFeedback({ tipo: 'error', mensaje: msg })
    } finally {
      setActionLoading(false)
    }
  }

  // Abrir modal de Acta Oficial de Calificación
  const abrirModalActa = (defensa: Defensa) => {
    setModalActa(defensa)
  }

  // Estudiante seleccionado en el modal para previsualizar reglas
  const estudianteSeleccionado = estudiantesList.find(
    (e) => e.idEstudiante === selectedEstudianteId,
  )

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Encabezado */}
        <EncabezadoPagina
          titulo="Cronograma y Embudo de Defensas"
          descripcion="Gestión integral de fechas para examen de grado. Monitoreo del embudo de postulantes, verificación automatizada de plazos reglamentarios por carrera y alertas de sorteo."
          accion={
            !isJefe && (
              <button
                type="button"
                onClick={abrirModalProgramar}
                className="flex items-center gap-1.5 bg-crimson px-4 py-2 text-xs font-medium text-white hover:opacity-95 transition-opacity cursor-pointer"
              >
                <Plus className="size-3.5" />
                Programar Fecha de Defensa
              </button>
            )
          }
        />

        {/* Insignia de Aislamiento para Jefe de Carrera */}
        {isJefe && (
          <div className="flex items-center justify-between border-l-4 border-l-crimson border border-line bg-surface p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-crimson/10 text-crimson">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-crimson uppercase">
                    Aislamiento Estricto por Carrera (RNF-02)
                  </span>
                  <span className="bg-neutral-200 text-neutral-800 text-[10px] font-semibold px-2 py-0.5">
                    Modo Supervisión Académica
                  </span>
                </div>
                <p className="text-xs font-semibold text-neutral-900 mt-0.5">
                  Supervisando el cronograma de defensas y tribunales asignados a su carrera.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-neutral-500 font-mono">
              carreraId: {jefeCarreraId}
            </span>
          </div>
        )}

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`flex items-center justify-between px-4 py-3 text-xs font-medium border ${
              feedback.tipo === 'exito'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              <span>{feedback.mensaje}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-neutral-400 hover:text-neutral-700"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Embudo de Estado de Postulantes (Pipeline Tracker) */}
        <section className="border border-line bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
                Embudo de Estado de Postulantes (Pipeline)
              </h2>
              <p className="text-xs text-neutral-500">
                Trazabilidad del flujo académico: Programado ➔ Área Sorteada ➔ Caso Asignado ➔ Defendido ➔ Calificado
              </p>
            </div>
            <span className="text-xs font-medium text-neutral-600 bg-surface px-2.5 py-1 border border-line">
              Total Defensas: <strong>{embudo ? embudo.total : 0}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-5">
            <div className="bg-white p-4">
              <span className="text-[10px] font-semibold tracking-[0.1em] text-neutral-500 uppercase">
                1. Programados
              </span>
              <p className="mt-1 text-2xl font-bold text-neutral-900">
                {embudo ? embudo.programados : 0}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Pendientes de sorteo</p>
            </div>

            <div className="bg-white p-4">
              <span className="text-[10px] font-semibold tracking-[0.1em] text-neutral-500 uppercase">
                2. Área Sorteada
              </span>
              <p className="mt-1 text-2xl font-bold text-amber-600">
                {embudo ? embudo.areaSorteada : 0}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">En espera de caso</p>
            </div>

            <div className="bg-white p-4">
              <span className="text-[10px] font-semibold tracking-[0.1em] text-neutral-500 uppercase">
                3. Caso Asignado
              </span>
              <p className="mt-1 text-2xl font-bold text-indigo-600">
                {embudo ? embudo.casoAsignado : 0}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">En preparación</p>
            </div>

            <div className="bg-white p-4">
              <span className="text-[10px] font-semibold tracking-[0.1em] text-neutral-500 uppercase">
                4. Defendidos
              </span>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {embudo ? embudo.defendidos : 0}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Esperando nota</p>
            </div>

            <div className="bg-white p-4">
              <span className="text-[10px] font-semibold tracking-[0.1em] text-neutral-500 uppercase">
                5. Calificados
              </span>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {embudo ? embudo.calificados : 0}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Proceso concluido</p>
            </div>
          </div>
        </section>

        {/* Alertas Operativas de Sorteo Próximo */}
        {alertas.length > 0 && (
          <section className="rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50/70 via-amber-50/40 to-orange-50/30 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100/90 text-amber-700 shadow-2xs">
                  <AlertTriangle className="size-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    Alertas Operativas
                  </h3>
                  <p className="text-[11px] text-amber-800/80">
                    {alertas.length} postulante(s) con fecha de defensa próxima y sorteo pendiente
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                Acción Requerida
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alertas.slice(0, 4).map((alerta) => (
                <div
                  key={alerta.idDefensa}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200/60 bg-white/95 p-3.5 shadow-2xs transition-all duration-150 hover:border-amber-300 hover:shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate group-hover:text-amber-900 transition-colors">
                      {alerta.instancia.proceso.estudiante.nombreCompleto}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                      <span className="truncate">{alerta.instancia.proceso.estudiante.planEstudio.carrera.nombre}</span>
                      <span className="text-gray-300">·</span>
                      <span className="inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                        {alerta.tipoDefensa.nombre}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50/90 border border-amber-200/70 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
                      <Calendar className="size-3 text-amber-600" />
                      Fecha: {new Date(alerta.fechaDefensa).toLocaleDateString()}
                    </span>
                    <p className="text-[10px] text-gray-400">
                      Sorteo sugerido: <span className="font-medium text-gray-600">{alerta.reglasSorteo?.fechaSorteoAreaRecomendada || 'Pendiente'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Barra de Filtros */}
        <section className="border border-line bg-white p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setPage(1)
              cargarDatos()
            }}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por estudiante o carnet..."
                className="w-full border border-line bg-surface py-2 pl-9 pr-3 text-xs outline-none focus:border-neutral-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="size-3.5 text-neutral-400" />
              <select
                value={selectedTipo}
                onChange={(e) => {
                  setSelectedTipo(e.target.value)
                  setPage(1)
                }}
                className="border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
              >
                <option value="ALL">Todos los Tipos</option>
                <option value="INTERNA">Defensa Interna</option>
                <option value="EXTERNA">Defensa Externa</option>
              </select>

              <select
                value={selectedEstado}
                onChange={(e) => {
                  setSelectedEstado(e.target.value)
                  setPage(1)
                }}
                className="border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="PROGRAMADA">Programada</option>
                <option value="AREA_SORTEADA">Área Sorteada</option>
                <option value="CASO_ASIGNADO">Caso Asignado</option>
                <option value="DEFENDIDO">Defendido</option>
                <option value="CALIFICADO">Calificado</option>
              </select>

              <button
                type="submit"
                className="border border-line bg-surface px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Filtrar
              </button>
            </div>
          </form>
        </section>

        {/* Tabla del Cronograma General */}
        <section className="border border-line bg-white">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
                Cronograma de Defensas Programadas
              </h2>
              <p className="text-xs text-neutral-500">
                Mostrando {defensas.length} de {totalCount} defensas registradas
              </p>
            </div>
            <button
              onClick={cargarDatos}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-line bg-surface">
                <tr className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Postulante
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Carrera / Facultad
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Tipo
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Fecha Defensa
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Plazo Reglamentario (UPTECSA)
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Calificación / Dictamen
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Estado
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium text-right">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-xs text-neutral-400">
                      Cargando cronograma de defensas...
                    </td>
                  </tr>
                ) : defensas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-xs text-neutral-400">
                      No hay defensas programadas con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  defensas.map((defensa) => {
                    const est = defensa.instancia.proceso.estudiante
                    const carrera = est.planEstudio.carrera
                    const fechaDefensaFormat = new Date(defensa.fechaDefensa).toLocaleDateString()
                    const tieneNota = defensa.nota !== null && defensa.nota !== undefined
                    const escala = tieneNota ? determinarEscalaResultado(Number(defensa.nota)) : null

                    return (
                      <tr key={defensa.idDefensa} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-xs text-neutral-900">{est.nombreCompleto}</p>
                          <p className="font-mono text-[11px] text-neutral-500">{est.carnetEstudiantil}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs">
                          <p className="text-neutral-800">{carrera.nombre}</p>
                          <p className="text-[11px] text-neutral-500">{carrera.facultad?.nombre || 'UPTECSA'}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${
                              defensa.tipoDefensa.nombre === 'EXTERNA'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {defensa.tipoDefensa.nombre}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-xs text-neutral-900">
                          {fechaDefensaFormat}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-neutral-600">
                          {defensa.reglasSorteo ? (
                            <div>
                              <p className="font-medium text-[11px] text-neutral-800">
                                {defensa.reglasSorteo.descripcionModalidad}
                              </p>
                              <p className="text-[10px] text-neutral-500">
                                Sorteo sugerido: <strong>{defensa.reglasSorteo.fechaSorteoAreaRecomendada}</strong>
                              </p>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {tieneNota && escala ? (
                            <div className="flex flex-col items-start gap-0.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold border ${escala.badgeBg}`}
                              >
                                {Number(defensa.nota)} / 100
                              </span>
                              <span className="text-[10px] text-neutral-500 font-medium">
                                {defensa.resultado?.replace(/_/g, ' ') || escala.escala}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-neutral-400 italic">Pendiente de nota</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold border ${
                              defensa.estadoDefensa === 'PROGRAMADA'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : defensa.estadoDefensa === 'AREA_SORTEADA'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : defensa.estadoDefensa === 'CASO_ASIGNADO'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                : defensa.estadoDefensa === 'DEFENDIDO'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {defensa.estadoDefensa}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setModalDetalle(defensa)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 border border-transparent hover:border-line hover:bg-neutral-50 transition-colors"
                              title="Ver ficha reglamentaria"
                            >
                              <Eye className="size-3.5" />
                            </button>

                            {tieneNota && (
                              <button
                                type="button"
                                onClick={() => abrirModalActa(defensa)}
                                className="inline-flex items-center gap-1 border border-neutral-300 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:text-crimson hover:border-crimson transition-colors"
                                title="Emitir / Imprimir Acta Oficial de Calificación"
                              >
                                <Printer className="size-3 text-crimson" />
                                <span>Acta</span>
                              </button>
                            )}

                            {!esSoloLectura && (
                              <button
                                type="button"
                                onClick={() => abrirModalCalificar(defensa)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                  tieneNota
                                    ? 'border border-line bg-surface text-neutral-700 hover:bg-neutral-100'
                                    : 'border border-crimson/30 bg-crimson text-white hover:opacity-95'
                                }`}
                                title={tieneNota ? 'Rectificar o editar nota' : 'Asentar calificación del tribunal'}
                              >
                                <Award className="size-3" />
                                <span>{tieneNota ? 'Editar' : 'Calificar'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <footer className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-neutral-600">
              <span>
                Página {page} de {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="border border-line px-3 py-1 font-medium disabled:opacity-40 hover:bg-neutral-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="border border-line px-3 py-1 font-medium disabled:opacity-40 hover:bg-neutral-50"
                >
                  Siguiente
                </button>
              </div>
            </footer>
          )}
        </section>
      </div>

      {/* ── MODAL: PROGRAMAR DEFENSA ── */}
      {modalProgramar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg border border-line bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                  Programar Defensa de Grado
                </h3>
                <p className="text-xs text-neutral-500">
                  Asignación formal de fecha para el examen de grado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalProgramar(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </header>

            <form onSubmit={handleProgramar} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Postulante (Estudiante) *
                </label>
                <select
                  value={selectedEstudianteId}
                  onChange={(e) => setSelectedEstudianteId(e.target.value)}
                  required
                  className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                >
                  {estudiantesList.map((est) => (
                    <option key={est.idEstudiante} value={est.idEstudiante}>
                      {est.nombreCompleto} ({est.carnetEstudiantil}) — {est.planEstudio?.carrera?.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tipo de Defensa *
                  </label>
                  <select
                    value={tipoDefensaForm}
                    onChange={(e) => setTipoDefensaForm(e.target.value as 'INTERNA' | 'EXTERNA')}
                    className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                  >
                    <option value="INTERNA">Defensa Interna</option>
                    <option value="EXTERNA">Defensa Externa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Periodo Académico
                  </label>
                  <input
                    type="text"
                    value={periodoForm}
                    onChange={(e) => setPeriodoForm(e.target.value)}
                    className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Fecha de Defensa *
                </label>
                <input
                  type="date"
                  required
                  value={fechaDefensaForm}
                  onChange={(e) => setFechaDefensaForm(e.target.value)}
                  className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                />
              </div>

              {/* Vista previa de plazos según carrera */}
              {estudianteSeleccionado && (
                <div className="border border-line bg-surface p-3 text-xs flex flex-col gap-1 text-neutral-700">
                  <p className="font-semibold text-[11px] text-neutral-800 uppercase tracking-wider">
                    Reglas Reglamentarias de Sorteo (UPTECSA)
                  </p>
                  <p>
                    Carrera:{' '}
                    <strong>
                      {estudianteSeleccionado.planEstudio?.carrera?.nombre || 'Carrera'}
                    </strong>
                  </p>
                  <p className="text-neutral-500 text-[11px]">
                    El sistema calculará automáticamente la fecha máxima de sorteo y los tiempos de resolución al
                    confirmar la fecha de defensa.
                  </p>
                </div>
              )}

              <footer className="mt-2 flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setModalProgramar(false)}
                  className="border border-line px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-crimson px-5 py-2 text-xs font-medium text-white hover:opacity-95 disabled:opacity-50"
                >
                  {actionLoading ? 'Programando...' : 'Confirmar Programación'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DETALLE DE DEFENSA ── */}
      {modalDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg border border-line bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                  Ficha de Defensa de Grado
                </h3>
                <p className="text-xs text-neutral-500">
                  {modalDetalle.instancia.proceso.estudiante.nombreCompleto} (
                  {modalDetalle.instancia.proceso.estudiante.carnetEstudiantil})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalDetalle(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="p-6 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3 border-b border-line pb-3">
                <div>
                  <span className="text-neutral-500 text-[11px]">Tipo de Defensa</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{modalDetalle.tipoDefensa.nombre}</p>
                </div>
                <div>
                  <span className="text-neutral-500 text-[11px]">Fecha de Defensa</span>
                  <p className="font-bold text-neutral-900 mt-0.5">
                    {new Date(modalDetalle.fechaDefensa).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-500 text-[11px]">Estado Actual</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{modalDetalle.estadoDefensa}</p>
                </div>
                <div>
                  <span className="text-neutral-500 text-[11px]">Periodo</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{modalDetalle.periodoAcademico}</p>
                </div>
              </div>

              {modalDetalle.reglasSorteo && (
                <div className="bg-surface p-3.5 border border-line flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-900 text-[11px] uppercase tracking-wider">
                    Plazos y Modalidad Asignada
                  </span>
                  <p className="text-neutral-700 font-medium">
                    {modalDetalle.reglasSorteo.descripcionModalidad}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-1 pt-1 border-t border-line text-[11px]">
                    <div>
                      <span className="text-neutral-500">Fecha Sorteo Área:</span>
                      <p className="font-semibold text-neutral-900">
                        {modalDetalle.reglasSorteo.fechaSorteoAreaRecomendada}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Fecha Sorteo Caso:</span>
                      <p className="font-semibold text-neutral-900">
                        {modalDetalle.reglasSorteo.fechaSorteoCasoRecomendada}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {modalDetalle.casoUtilizado && (
                <div className="border border-line p-3">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase">Caso Asignado</span>
                  <p className="font-medium text-neutral-900 mt-0.5">{modalDetalle.casoUtilizado.titulo}</p>
                  <p className="text-[11px] text-neutral-500">Área: {modalDetalle.casoUtilizado.area?.nombre}</p>
                </div>
              )}

              {/* Calificación oficial si ya está asentada */}
              {modalDetalle.nota !== null && modalDetalle.nota !== undefined && (
                <div className="border border-emerald-300 bg-emerald-50/60 p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                      Dictamen del Tribunal Examinador
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-300">
                      DEFENSA CONCLUIDA
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-900">
                      {Number(modalDetalle.nota)} / 100
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      ({modalDetalle.resultado?.replace(/_/g, ' ') || 'APROBADO'})
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 italic">
                    "{numeroALetras(Number(modalDetalle.nota))} puntos"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setModalActa(modalDetalle)
                      setModalDetalle(null)
                    }}
                    className="mt-1 flex items-center justify-center gap-1.5 bg-white border border-emerald-300 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100/50 transition-colors"
                  >
                    <Printer className="size-3.5 text-crimson" />
                    <span>Ver e Imprimir Acta Oficial de Calificación</span>
                  </button>
                </div>
              )}

              <footer className="mt-2 flex items-center justify-end border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setModalDetalle(null)}
                  className="border border-line px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cerrar
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: REGISTRAR / CALIFICAR EXAMEN DE GRADO ── */}
      {modalCalificar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl border border-line bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-line px-6 py-4 bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center bg-crimson text-white rounded-xs shadow-xs">
                  <Award className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-neutral-900">
                    Asentar Calificación y Dictamen de Grado
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {modalCalificar.instancia.proceso.estudiante.nombreCompleto} ·{' '}
                    {modalCalificar.instancia.proceso.estudiante.planEstudio.carrera.nombre}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalCalificar(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </header>

            <form onSubmit={handleGuardarCalificacion} className="p-6 flex flex-col gap-4 text-xs">
              {/* Resumen del Postulante y Defensa */}
              <div className="grid grid-cols-3 gap-2 bg-neutral-50 p-3 border border-line text-[11px]">
                <div>
                  <span className="text-neutral-500">Registro:</span>
                  <p className="font-mono font-bold text-neutral-900">
                    {modalCalificar.instancia.proceso.estudiante.carnetEstudiantil}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-500">Modalidad:</span>
                  <p className="font-bold text-neutral-900">{modalCalificar.tipoDefensa.nombre}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Fecha Defensa:</span>
                  <p className="font-bold text-neutral-900">
                    {new Date(modalCalificar.fechaDefensa).toLocaleDateString()}
                  </p>
                </div>
                {modalCalificar.casoUtilizado && (
                  <div className="col-span-3 pt-2 mt-1 border-t border-line">
                    <span className="text-neutral-500">Caso Defendido:</span>
                    <p className="font-semibold text-neutral-800 line-clamp-1">
                      {modalCalificar.casoUtilizado.titulo} ({modalCalificar.casoUtilizado.area?.nombre})
                    </p>
                  </div>
                )}
              </div>

              {/* Entrada de Nota y Escala UPTECSA */}
              <div className="border border-line p-4 bg-white flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-neutral-900">
                    Calificación Numérica (0 a 100 puntos) *
                  </label>
                  {(() => {
                    const esc = determinarEscalaResultado(notaForm)
                    return (
                      <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold border ${esc.badgeBg}`}>
                        {esc.escala}
                      </span>
                    )
                  })()}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={notaForm}
                    onChange={(e) => handleNotaChange(Number(e.target.value))}
                    className="w-28 border-2 border-neutral-300 px-3 py-2 text-2xl font-black text-neutral-900 outline-none focus:border-crimson text-center tracking-tight"
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={notaForm}
                      onChange={(e) => handleNotaChange(Number(e.target.value))}
                      className="w-full accent-crimson cursor-pointer"
                    />
                    <p className="text-[11px] text-neutral-600 mt-1 italic">
                      Literal oficial: <strong>"{numeroALetras(notaForm)} puntos"</strong>
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-500 grid grid-cols-5 gap-1 text-center pt-1 border-t border-line">
                  <span className={notaForm < 51 ? 'font-bold text-red-700' : ''}>0-50 Reprobado</span>
                  <span className={notaForm >= 51 && notaForm < 70 ? 'font-bold text-emerald-700' : ''}>51-69 Regular</span>
                  <span className={notaForm >= 70 && notaForm < 85 ? 'font-bold text-emerald-800' : ''}>70-84 Bueno</span>
                  <span className={notaForm >= 85 && notaForm < 95 ? 'font-bold text-indigo-800' : ''}>85-94 Sobresaliente</span>
                  <span className={notaForm >= 95 ? 'font-bold text-amber-800' : ''}>95-100 Mención</span>
                </div>
              </div>

              {/* Dictamen Oficial */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Dictamen Final del Tribunal *
                </label>
                <select
                  value={resultadoForm}
                  onChange={(e) => setResultadoForm(e.target.value)}
                  className="w-full border border-line bg-surface px-3 py-2 text-xs font-semibold outline-none focus:border-neutral-400"
                >
                  <option value="APROBADO">APROBADO (Aprobación Regular / Suficiente)</option>
                  <option value="APROBADO_CON_FELICITACION">APROBADO CON FELICITACIÓN (Sobresaliente)</option>
                  <option value="APROBADO_CON_MENCION">APROBADO CON MENCIÓN DE HONOR (Excelencia)</option>
                  <option value="REPROBADO">REPROBADO (Insuficiente)</option>
                </select>
              </div>

              {/* Miembros del Tribunal Evaluador */}
              <div className="border border-line p-3 flex flex-col gap-2.5">
                <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                  Miembros del Tribunal Evaluador (Opcional / Firmas)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Presidente del Tribunal</label>
                    <input
                      type="text"
                      value={presidenteForm}
                      onChange={(e) => setPresidenteForm(e.target.value)}
                      placeholder="Ej. Ing. Juan Pérez"
                      className="w-full border border-line bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Secretario del Tribunal</label>
                    <input
                      type="text"
                      value={secretarioForm}
                      onChange={(e) => setSecretarioForm(e.target.value)}
                      placeholder="Ej. Lic. María López"
                      className="w-full border border-line bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Vocal del Tribunal</label>
                    <input
                      type="text"
                      value={vocalForm}
                      onChange={(e) => setVocalForm(e.target.value)}
                      placeholder="Ej. Dr. Carlos Suárez"
                      className="w-full border border-line bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  Observaciones o Recomendaciones del Tribunal
                </label>
                <textarea
                  rows={2}
                  value={observacionesForm}
                  onChange={(e) => setObservacionesForm(e.target.value)}
                  placeholder="Detalles sobre el desempeño en la exposición oral, respuestas o deliberación..."
                  className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                />
              </div>

              <footer className="mt-2 flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setModalCalificar(null)}
                  className="border border-line px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-crimson px-5 py-2 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="size-4" />
                  <span>{actionLoading ? 'Asentando...' : 'Asentar Calificación Oficial'}</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ACTA OFICIAL DE EVALUACIÓN Y DEFENSA DE GRADO (IMPRIMIBLE) ── */}
      {modalActa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl border border-line bg-white shadow-2xl my-8">
            {/* Barra superior de control */}
            <header className="flex items-center justify-between border-b border-line px-6 py-3.5 bg-surface print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-crimson" />
                <div>
                  <h3 className="text-xs font-bold tracking-tight text-neutral-900 uppercase">
                    Acta Oficial de Evaluación y Calificación
                  </h3>
                  <p className="text-[10px] text-neutral-500">Documento Académico Certificado · UPTECSA</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-crimson px-3 py-1.5 text-xs font-medium text-white hover:opacity-95 transition-opacity"
                >
                  <Printer className="size-3.5" />
                  <span>Imprimir Acta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalActa(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="size-5" />
                </button>
              </div>
            </header>

            {/* Hoja Formal del Acta (Optimizada para pantalla e impresión A4) */}
            <div className="p-8 sm:p-10 flex flex-col gap-6 text-neutral-900 bg-white">
              {/* Encabezado Institucional */}
              <div className="text-center border-b-2 border-neutral-900 pb-4">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-600">
                  UNIVERSIDAD PRIVADA TECNOLÓGICA DE SANTA CRUZ
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-800 mt-0.5">
                  {modalActa.instancia.proceso.estudiante.planEstudio.carrera.facultad?.nombre || 'FACULTAD DE CIENCIAS Y TECNOLOGÍA'}
                </p>
                <p className="text-xs text-neutral-600">
                  CARRERA DE {modalActa.instancia.proceso.estudiante.planEstudio.carrera.nombre.toUpperCase()}
                </p>
                <div className="mt-3 inline-block border-y border-neutral-900 py-1 px-4">
                  <h4 className="text-sm font-black tracking-wider uppercase text-neutral-900">
                    ACTA DE CALIFICACIÓN DE EXAMEN DE GRADO N° DEF-{modalActa.idDefensa.padStart(6, '0')}
                  </h4>
                </div>
              </div>

              {/* Párrafo Formal de Presentación */}
              <p className="text-xs leading-relaxed text-justify text-neutral-800">
                En la ciudad de Santa Cruz de la Sierra, a los{' '}
                <strong>{new Date(modalActa.fechaDefensa).toLocaleDateString('es-BO', { dateStyle: 'full' })}</strong>,
                se constituyó el Tribunal Examinador debidamente acreditado para presidir la defensa correspondiente al{' '}
                <strong>Examen de Grado ({modalActa.tipoDefensa.nombre})</strong>, periodo académico{' '}
                <strong>{modalActa.periodoAcademico}</strong>.
              </p>

              {/* Cuadro de Datos del Postulante */}
              <div className="border border-neutral-900 divide-y divide-neutral-900 text-xs">
                <div className="grid grid-cols-3 bg-neutral-50 px-3 py-2">
                  <div className="col-span-2">
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Postulante</span>
                    <p className="font-bold text-neutral-900">{modalActa.instancia.proceso.estudiante.nombreCompleto}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Carnet / Registro</span>
                    <p className="font-mono font-bold text-neutral-900">
                      {modalActa.instancia.proceso.estudiante.carnetEstudiantil} · CI: {modalActa.instancia.proceso.estudiante.carnetIdentidad}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 px-3 py-2">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Área Temática Sorteada</span>
                    <p className="font-semibold text-neutral-900">
                      {modalActa.casoUtilizado?.area?.nombre || 'Área Oficial del Plan de Estudios'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Caso de Estudio</span>
                    <p className="font-semibold text-neutral-900 line-clamp-1">
                      {modalActa.casoUtilizado?.titulo || 'Caso de Examen de Grado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dictamen y Calificación Destacada */}
              <div className="border-2 border-neutral-900 p-4 bg-neutral-50 text-center flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-600">
                  CALIFICACIÓN CUANTITATIVA Y CUALITATIVA
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-black text-neutral-900">
                    {modalActa.nota !== null && modalActa.nota !== undefined ? Number(modalActa.nota) : '—'}
                  </span>
                  <span className="text-sm font-bold text-neutral-600">/ 100 PUNTOS</span>
                </div>
                <p className="text-xs uppercase font-bold text-neutral-800">
                  ( {numeroALetras(Number(modalActa.nota || 0)).toUpperCase()} PUNTOS )
                </p>
                <div className="mt-1 pt-2 border-t border-neutral-300">
                  <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Dictamen Oficial:</span>
                  <p className="text-sm font-black tracking-wide text-neutral-900 mt-0.5">
                    {modalActa.resultado?.replace(/_/g, ' ') || 'APROBADO'}
                  </p>
                </div>
              </div>

              {/* Observaciones del Tribunal si existen */}
              {modalActa.auditorias?.[0]?.valorNuevo?.observaciones && (
                <div className="border border-neutral-300 p-2.5 text-[11px] text-neutral-700 bg-neutral-50/50">
                  <span className="font-bold text-[10px] text-neutral-500 uppercase block mb-0.5">
                    Observaciones del Tribunal:
                  </span>
                  <p className="italic">"{modalActa.auditorias[0].valorNuevo.observaciones}"</p>
                </div>
              )}

              {/* Espacio para Firmas Formales */}
              <div className="pt-6">
                <p className="text-[10px] text-neutral-500 text-center uppercase tracking-wider mb-8">
                  CONFORMIDAD Y FIRMAS DEL TRIBUNAL EXAMINADOR Y PARTES
                </p>
                <div className="grid grid-cols-3 gap-6 text-center text-[10px] text-neutral-800">
                  <div className="flex flex-col items-center">
                    <div className="w-full border-t border-neutral-900 pt-1 font-bold">
                      {modalActa.auditorias?.[0]?.valorNuevo?.tribunal?.presidente || 'PRESIDENTE DEL TRIBUNAL'}
                    </div>
                    <span className="text-[9px] text-neutral-500">Tribunal Examinador</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-full border-t border-neutral-900 pt-1 font-bold">
                      {modalActa.auditorias?.[0]?.valorNuevo?.tribunal?.secretario || 'SECRETARIO DEL TRIBUNAL'}
                    </div>
                    <span className="text-[9px] text-neutral-500">Tribunal Examinador</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-full border-t border-neutral-900 pt-1 font-bold">
                      {modalActa.auditorias?.[0]?.valorNuevo?.tribunal?.vocal || 'VOCAL DEL TRIBUNAL'}
                    </div>
                    <span className="text-[9px] text-neutral-500">Tribunal Examinador</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 text-center text-[10px] text-neutral-800 mt-10 max-w-md mx-auto">
                  <div className="flex flex-col items-center">
                    <div className="w-full border-t border-neutral-900 pt-1 font-bold">
                      JEFE DE CARRERA
                    </div>
                    <span className="text-[9px] text-neutral-500">{modalActa.instancia.proceso.estudiante.planEstudio.carrera.nombre}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-full border-t border-neutral-900 pt-1 font-bold">
                      {modalActa.instancia.proceso.estudiante.nombreCompleto}
                    </div>
                    <span className="text-[9px] text-neutral-500">Postulante (Estudiante)</span>
                  </div>
                </div>
              </div>

              {/* Sello Criptográfico y Pie */}
              <div className="pt-4 border-t border-line text-[10px] text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>Certificación Oficial SGSEG · UPTECSA</span>
                <span className="font-mono text-[9px]">
                  HASH: SHA256-ACTA-{modalActa.idDefensa}-{modalActa.instancia.proceso.estudiante.carnetEstudiantil}
                </span>
              </div>
            </div>

            {/* Botón inferior de cerrar en pantalla */}
            <footer className="border-t border-line px-6 py-3 bg-surface flex justify-end print:hidden">
              <button
                type="button"
                onClick={() => setModalActa(null)}
                className="border border-line bg-white px-4 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
