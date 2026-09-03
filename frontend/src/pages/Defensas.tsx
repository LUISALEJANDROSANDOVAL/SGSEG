import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Filter,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { defensasApi } from '@/lib/defensas.api'
import type { Defensa, EmbudoEstados } from '@/lib/defensas.api'
import { estudiantesApi } from '@/lib/estudiantes.api'
import type { Estudiante } from '@/lib/estudiantes.api'

export default function PaginaDefensas() {
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
      const [embudoData, alertasData, defensasData] = await Promise.all([
        defensasApi.getEmbudo(),
        defensasApi.getAlertas(15),
        defensasApi.getDefensas({
          page,
          limit: 10,
          search: searchTerm,
          estadoDefensa: selectedEstado,
          tipoDefensa: selectedTipo,
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
            <button
              type="button"
              onClick={abrirModalProgramar}
              className="flex items-center gap-1.5 bg-crimson px-4 py-2 text-xs font-medium text-white hover:opacity-95 transition-opacity"
            >
              <Plus className="size-3.5" />
              Programar Fecha de Defensa
            </button>
          }
        />

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
          <section className="border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs mb-2">
              <AlertTriangle className="size-4 text-amber-700" />
              <span>
                ALERTAS OPERATIVAS: {alertas.length} POSTULANTE(S) CON DEFENSA PRÓXIMA SIN SORTEO
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-900">
              {alertas.slice(0, 4).map((alerta) => (
                <div
                  key={alerta.idDefensa}
                  className="bg-white/80 p-2.5 border border-amber-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {alerta.instancia.proceso.estudiante.nombreCompleto}
                    </p>
                    <p className="text-[11px] text-neutral-600">
                      {alerta.instancia.proceso.estudiante.planEstudio.carrera.nombre} ·{' '}
                      {alerta.tipoDefensa.nombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 border border-amber-300">
                      Fecha: {new Date(alerta.fechaDefensa).toLocaleDateString()}
                    </span>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Sorteo sugerido: {alerta.reglasSorteo?.fechaSorteoAreaRecomendada || 'Pendiente'}
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
            <table className="w-full min-w-[800px] text-left text-sm">
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
                    <td colSpan={7} className="px-5 py-8 text-center text-xs text-neutral-400">
                      Cargando cronograma de defensas...
                    </td>
                  </tr>
                ) : defensas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-xs text-neutral-400">
                      No hay defensas programadas con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  defensas.map((defensa) => {
                    const est = defensa.instancia.proceso.estudiante
                    const carrera = est.planEstudio.carrera
                    const fechaDefensaFormat = new Date(defensa.fechaDefensa).toLocaleDateString()

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
                          <button
                            type="button"
                            onClick={() => setModalDetalle(defensa)}
                            className="p-1 text-neutral-500 hover:text-neutral-900"
                            title="Ver detalles reglamentarios"
                          >
                            <Eye className="size-4" />
                          </button>
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
    </DashboardShell>
  )
}
