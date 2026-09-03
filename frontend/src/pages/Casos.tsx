import React, { useEffect, useState } from 'react'
import {
  AlertOctagon,
  CheckCircle2,
  Eye,
  Filter,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { casosApi } from '@/lib/casos.api'
import type {
  AreaAcademica,
  CasoEstudio,
  MetricasCasos,
} from '@/lib/casos.api'

export default function PaginaCasos() {

  // Estados de datos
  const [casos, setCasos] = useState<CasoEstudio[]>([])
  const [areas, setAreas] = useState<AreaAcademica[]>([])
  const [metricas, setMetricas] = useState<MetricasCasos | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null)

  // Estados de filtrado y paginación
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedArea, setSelectedArea] = useState<string>('ALL')
  const [selectedEstado, setSelectedEstado] = useState<string>('ALL')
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCasosCount, setTotalCasosCount] = useState<number>(0)

  // Modales
  const [modalNuevoCaso, setModalNuevoCaso] = useState<boolean>(false)
  const [modalDetalleCaso, setModalDetalleCaso] = useState<CasoEstudio | null>(null)
  const [modalEditarCaso, setModalEditarCaso] = useState<CasoEstudio | null>(null)
  const [modalNuevaArea, setModalNuevaArea] = useState<boolean>(false)

  // Formulario nuevo caso
  const [formNuevo, setFormNuevo] = useState({
    idArea: '',
    titulo: '',
    contenido: '',
    documentoAdjunto: '',
  })

  // Formulario editar caso
  const [formEditar, setFormEditar] = useState({
    idArea: '',
    titulo: '',
    contenido: '',
    estado: 'DISPONIBLE',
    documentoAdjunto: '',
  })

  // Formulario nueva área
  const [formArea, setFormArea] = useState({
    nombre: '',
    umbralDisponibilidad: 2,
  })

  // Carga inicial y recarga
  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [metricasData, areasData, casosData] = await Promise.all([
        casosApi.getMetricas(),
        casosApi.getAreas(),
        casosApi.getCasos({
          page,
          limit: 10,
          search: searchTerm,
          idArea: selectedArea,
          estado: selectedEstado,
        }),
      ])

      setMetricas(metricasData)
      setAreas(areasData)
      setCasos(casosData.items)
      setTotalPages(casosData.pagination.totalPages)
      setTotalCasosCount(casosData.pagination.total)

      // Si el formulario de nuevo caso no tiene área seleccionada, asignar la primera
      if (areasData.length > 0 && !formNuevo.idArea) {
        setFormNuevo((prev) => ({ ...prev, idArea: areasData[0].idArea }))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar inventario de casos'
      setFeedback({ tipo: 'error', mensaje: msg })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [page, selectedArea, selectedEstado])

  // Búsqueda con debounce o click
  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    cargarDatos()
  }

  // Guardar nuevo caso
  const handleCrearCaso = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formNuevo.idArea || !formNuevo.titulo.trim() || !formNuevo.contenido.trim()) {
      setFeedback({ tipo: 'error', mensaje: 'Por favor complete todos los campos obligatorios.' })
      return
    }

    setActionLoading(true)
    try {
      await casosApi.createCaso({
        idArea: formNuevo.idArea,
        titulo: formNuevo.titulo.trim(),
        contenido: formNuevo.contenido.trim(),
        documentoAdjunto: formNuevo.documentoAdjunto.trim() || undefined,
      })

      setFeedback({ tipo: 'exito', mensaje: 'Caso de estudio registrado exitosamente.' })
      setModalNuevoCaso(false)
      setFormNuevo({
        idArea: areas[0]?.idArea || '',
        titulo: '',
        contenido: '',
        documentoAdjunto: '',
      })
      await cargarDatos()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar caso'
      setFeedback({ tipo: 'error', mensaje: msg })
    } finally {
      setActionLoading(false)
    }
  }

  // Guardar edición de caso
  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalEditarCaso) return

    setActionLoading(true)
    try {
      await casosApi.updateCaso(modalEditarCaso.idCasoEstudio, {
        idArea: formEditar.idArea || undefined,
        titulo: formEditar.titulo.trim(),
        contenido: formEditar.contenido.trim(),
        estado: formEditar.estado,
        documentoAdjunto: formEditar.documentoAdjunto.trim() || undefined,
      })

      setFeedback({ tipo: 'exito', mensaje: 'Caso de estudio actualizado correctamente.' })
      setModalEditarCaso(null)
      await cargarDatos()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar caso'
      setFeedback({ tipo: 'error', mensaje: msg })
    } finally {
      setActionLoading(false)
    }
  }

  // Alternar estado (activar/desactivar)
  const handleToggleEstado = async (caso: CasoEstudio) => {
    const accion = caso.estado === 'INACTIVO' ? 'activar' : 'inactivar'
    if (!window.confirm(`¿Desea ${accion} el caso "${caso.titulo}"?`)) return

    setActionLoading(true)
    try {
      await casosApi.toggleEstado(caso.idCasoEstudio)
      setFeedback({ tipo: 'exito', mensaje: `Estado del caso actualizado correctamente.` })
      await cargarDatos()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar estado del caso'
      setFeedback({ tipo: 'error', mensaje: msg })
    } finally {
      setActionLoading(false)
    }
  }

  // Guardar nueva área académica
  const handleCrearArea = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formArea.nombre.trim()) return

    // Tomar la primera carrera disponible de las áreas o '1'
    const idCarreraDefault = areas[0]?.idCarrera || '1'

    setActionLoading(true)
    try {
      await casosApi.createArea({
        idCarrera: idCarreraDefault,
        nombre: formArea.nombre.trim(),
        umbralDisponibilidad: Number(formArea.umbralDisponibilidad) || 2,
      })

      setFeedback({ tipo: 'exito', mensaje: `Área "${formArea.nombre}" creada exitosamente.` })
      setModalNuevaArea(false)
      setFormArea({ nombre: '', umbralDisponibilidad: 2 })
      await cargarDatos()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear área académica'
      setFeedback({ tipo: 'error', mensaje: msg })
    } finally {
      setActionLoading(false)
    }
  }

  // Abrir modal de edición
  const abrirModalEditar = (caso: CasoEstudio) => {
    setModalEditarCaso(caso)
    setFormEditar({
      idArea: caso.idArea,
      titulo: caso.titulo,
      contenido: caso.contenido,
      estado: caso.estado,
      documentoAdjunto: caso.documentoAdjunto || '',
    })
  }

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Encabezado */}
        <EncabezadoPagina
          titulo="Gestión de Casos de Estudio"
          descripcion="Banco de casos de estudio por Área del Conocimiento. Control automatizado del umbral de dos usos por caso y monitoreo preventivo de stock para la defensa de grado."
          accion={
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setModalNuevaArea(true)}
                className="flex items-center gap-1.5 border border-line bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Plus className="size-3.5" />
                Nueva Área
              </button>
              <button
                type="button"
                onClick={() => setModalNuevoCaso(true)}
                className="flex items-center gap-1.5 bg-crimson px-4 py-2 text-xs font-medium text-white hover:opacity-95 transition-opacity"
              >
                <Plus className="size-3.5" />
                Registrar Nuevo Caso
              </button>
            </div>
          }
        />

        {/* Mensaje de Feedback */}
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

        {/* Banner de Stock Crítico dinámico */}
        {metricas && metricas.stockCritico.length > 0 && (
          <div
            role="alert"
            className="flex flex-col gap-2 border border-crimson bg-crimson px-5 py-4 text-white shadow-sm"
          >
            <div className="flex items-center gap-2">
              <AlertOctagon className="size-5 shrink-0" />
              <span className="font-bold tracking-wide text-xs uppercase">
                ALERTA DE STOCK CRÍTICO EN BANCO DE CASOS
              </span>
            </div>
            <div className="mt-1 flex flex-col gap-1.5 pl-7 text-xs leading-relaxed opacity-95">
              {metricas.stockCritico.map((alerta) => (
                <p key={alerta.idArea}>
                  • <strong>{alerta.nombreArea}</strong> ({alerta.carrera}): cuenta con solo{' '}
                  <span className="underline font-semibold">{alerta.casosDisponibles} caso(s) disponible(s)</span> frente
                  al umbral mínimo reglamentario de {alerta.umbralRequerido}. Se requiere reposición de casos antes de
                  iniciar los sorteos.
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Tarjetas de Resumen (KPIs) */}
        <section className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Casos Registrados
            </p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-900">
              {metricas ? metricas.totalCasos : '—'}
            </p>
          </div>
          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Disponibles para Sorteo
            </p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-emerald-600">
              {metricas ? metricas.disponibles : '—'}
            </p>
          </div>
          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Agotados (Tope 2/2)
            </p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-crimson">
              {metricas ? metricas.agotados : '—'}
            </p>
          </div>
          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Áreas Cubiertas
            </p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-900">
              {metricas ? metricas.areasCubiertas : '—'}
            </p>
          </div>
        </section>

        {/* Barra de Filtros y Búsqueda */}
        <section className="border border-line bg-white p-4">
          <form onSubmit={handleBuscar} className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título o contenido del caso..."
                className="w-full border border-line bg-surface py-2 pl-9 pr-3 text-xs outline-none focus:border-neutral-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="size-3.5 text-neutral-400" />
              <select
                value={selectedArea}
                onChange={(e) => {
                  setSelectedArea(e.target.value)
                  setPage(1)
                }}
                className="border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
              >
                <option value="ALL">Todas las Áreas</option>
                {areas.map((a) => (
                  <option key={a.idArea} value={a.idArea}>
                    {a.nombre}
                  </option>
                ))}
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
                <option value="DISPONIBLE">Disponibles</option>
                <option value="AGOTADO">Agotados</option>
                <option value="INACTIVO">Inactivos</option>
              </select>

              <button
                type="submit"
                className="border border-line bg-surface px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Buscar
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedArea('ALL')
                  setSelectedEstado('ALL')
                  setPage(1)
                }}
                className="text-xs text-neutral-500 hover:underline px-1"
              >
                Limpiar
              </button>
            </div>
          </form>
        </section>

        {/* Tabla de Inventario de Casos */}
        <section className="border border-line bg-white">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
                Inventario de Casos de Estudio
              </h2>
              <p className="text-xs text-neutral-500">
                Mostrando {casos.length} de {totalCasosCount} casos registrados
              </p>
            </div>
            <button
              onClick={cargarDatos}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800"
              title="Recargar inventario"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-surface">
                <tr className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Código
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Caso de Estudio
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Área Académica
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Carrera
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Disponibilidad / Usos
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-xs text-neutral-400">
                      Cargando banco de casos...
                    </td>
                  </tr>
                ) : casos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-xs text-neutral-400">
                      No se encontraron casos de estudio con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  casos.map((caso) => {
                    const idCodigo = `CASO-${String(caso.idCasoEstudio).padStart(3, '0')}`
                    const estaAgotado = caso.estadoEfectivo === 'AGOTADO' || caso.usos >= caso.umbral
                    const isInactivo = caso.estado === 'INACTIVO'

                    return (
                      <tr key={caso.idCasoEstudio} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-neutral-500">
                          {idCodigo}
                        </td>
                        <td className="max-w-md px-5 py-3.5">
                          <p className="font-medium text-xs text-neutral-900 line-clamp-1">
                            {caso.titulo}
                          </p>
                          <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                            {caso.contenido}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-neutral-700">
                          {caso.area.nombre}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-neutral-500">
                          {caso.area.carrera?.nombre || 'General'}
                        </td>
                        <td className="px-5 py-3.5">
                          {isInactivo ? (
                            <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-neutral-100 text-neutral-500 border border-neutral-300">
                              Inactivo
                            </span>
                          ) : estaAgotado ? (
                            <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-crimson text-white">
                              Agotado ({caso.usos}/{caso.umbral})
                            </span>
                          ) : caso.usos > 0 ? (
                            <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300">
                              Uso {caso.usos}/{caso.umbral} (1 restante)
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-300">
                              Disponible (0/{caso.umbral})
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setModalDetalleCaso(caso)}
                              className="p-1 text-neutral-500 hover:text-neutral-900"
                              title="Ver detalle del caso"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => abrirModalEditar(caso)}
                              className="p-1 text-neutral-500 hover:text-neutral-900"
                              title="Editar planteamiento"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleEstado(caso)}
                              className={`p-1 ${
                                caso.estado === 'INACTIVO'
                                  ? 'text-emerald-600 hover:text-emerald-800'
                                  : 'text-neutral-400 hover:text-red-600'
                              }`}
                              title={caso.estado === 'INACTIVO' ? 'Activar caso' : 'Inactivar caso'}
                            >
                              <Power className="size-4" />
                            </button>
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

      {/* ── MODAL: REGISTRAR NUEVO CASO ── */}
      {modalNuevoCaso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl border border-line bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                  Registrar Caso de Estudio
                </h3>
                <p className="text-xs text-neutral-500">
                  El caso se asignará al banco del área de conocimiento seleccionada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevoCaso(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </header>

            <form onSubmit={handleCrearCaso} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Área del Conocimiento *
                </label>
                <select
                  value={formNuevo.idArea}
                  onChange={(e) => setFormNuevo({ ...formNuevo, idArea: e.target.value })}
                  required
                  className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                >
                  <option value="">Seleccione un área académica...</option>
                  {areas.map((a) => (
                    <option key={a.idArea} value={a.idArea}>
                      {a.nombre} ({a.carrera?.nombre})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Título del Caso de Estudio *
                </label>
                <input
                  type="text"
                  required
                  value={formNuevo.titulo}
                  onChange={(e) => setFormNuevo({ ...formNuevo, titulo: e.target.value })}
                  placeholder="Ej. Optimización de arquitectura para plataforma de alta concurrencia"
                  className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Planteamiento del Problema y Preguntas de Defensa *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formNuevo.contenido}
                  onChange={(e) => setFormNuevo({ ...formNuevo, contenido: e.target.value })}
                  placeholder="Describa el contexto de la empresa o situación problemática, los antecedentes técnicos y las preguntas/consignas concretas que el estudiante deberá resolver..."
                  className="w-full border border-line bg-surface p-3 text-xs leading-relaxed outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Enlace a documento adjunto o material anexo (opcional)
                </label>
                <input
                  type="text"
                  value={formNuevo.documentoAdjunto}
                  onChange={(e) => setFormNuevo({ ...formNuevo, documentoAdjunto: e.target.value })}
                  placeholder="URL o ruta de anexos técnicos..."
                  className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                />
              </div>

              <footer className="mt-2 flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setModalNuevoCaso(false)}
                  className="border border-line px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-crimson px-5 py-2 text-xs font-medium text-white hover:opacity-95 disabled:opacity-50"
                >
                  {actionLoading ? 'Guardando...' : 'Guardar Caso de Estudio'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VER DETALLE DE CASO ── */}
      {modalDetalleCaso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl border border-line bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <span className="font-mono text-xs text-neutral-500">
                  CASO-{String(modalDetalleCaso.idCasoEstudio).padStart(3, '0')}
                </span>
                <h3 className="text-sm font-semibold tracking-tight text-neutral-900 mt-0.5">
                  {modalDetalleCaso.titulo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalDetalleCaso(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-surface px-2.5 py-1 border border-line text-neutral-700">
                  Área: <strong>{modalDetalleCaso.area.nombre}</strong>
                </span>
                <span className="bg-surface px-2.5 py-1 border border-line text-neutral-700">
                  Carrera: <strong>{modalDetalleCaso.area.carrera?.nombre || 'General'}</strong>
                </span>
                <span className="bg-surface px-2.5 py-1 border border-line text-neutral-700">
                  Historial de usos: <strong>{modalDetalleCaso.usos} de {modalDetalleCaso.umbral}</strong>
                </span>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Planteamiento y Consignas
                </p>
                <div className="max-h-60 overflow-y-auto border border-line bg-surface p-4 text-xs leading-relaxed text-neutral-800 whitespace-pre-wrap">
                  {modalDetalleCaso.contenido}
                </div>
              </div>

              {modalDetalleCaso.documentoAdjunto && (
                <div>
                  <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    Documento Anexo
                  </p>
                  <p className="text-xs text-neutral-600 font-mono underline break-all">
                    {modalDetalleCaso.documentoAdjunto}
                  </p>
                </div>
              )}

              {modalDetalleCaso.defensas && modalDetalleCaso.defensas.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Defensas donde fue asignado
                  </p>
                  <ul className="divide-y divide-line border border-line text-xs">
                    {modalDetalleCaso.defensas.map((defensa) => (
                      <li key={defensa.idDefensa} className="p-2.5 flex items-center justify-between">
                        <span>
                          Postulante:{' '}
                          <strong>
                            {defensa.instancia?.proceso?.estudiante?.nombreCompleto || 'Estudiante'}
                          </strong>
                        </span>
                        <span className="text-neutral-500">
                          Fecha: {new Date(defensa.fechaDefensa).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <footer className="mt-2 flex items-center justify-end border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setModalDetalleCaso(null)}
                  className="border border-line px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cerrar
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDITAR CASO ── */}
      {modalEditarCaso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl border border-line bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                  Editar Caso de Estudio
                </h3>
                <p className="text-xs text-neutral-500">
                  CASO-{String(modalEditarCaso.idCasoEstudio).padStart(3, '0')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalEditarCaso(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </header>

            <form onSubmit={handleGuardarEdicion} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Área del Conocimiento
                </label>
                <select
                  value={formEditar.idArea}
                  onChange={(e) => setFormEditar({ ...formEditar, idArea: e.target.value })}
                  className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                >
                  {areas.map((a) => (
                    <option key={a.idArea} value={a.idArea}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Título del Caso *
                </label>
                <input
                  type="text"
                  required
                  value={formEditar.titulo}
                  onChange={(e) => setFormEditar({ ...formEditar, titulo: e.target.value })}
                  className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Planteamiento del Problema *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formEditar.contenido}
                  onChange={(e) => setFormEditar({ ...formEditar, contenido: e.target.value })}
                  className="w-full border border-line bg-surface p-3 text-xs leading-relaxed outline-none focus:border-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formEditar.estado}
                    onChange={(e) => setFormEditar({ ...formEditar, estado: e.target.value })}
                    className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                  >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="AGOTADO">Agotado</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Documento Anexo (opcional)
                  </label>
                  <input
                    type="text"
                    value={formEditar.documentoAdjunto}
                    onChange={(e) => setFormEditar({ ...formEditar, documentoAdjunto: e.target.value })}
                    className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                  />
                </div>
              </div>

              <footer className="mt-2 flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setModalEditarCaso(null)}
                  className="border border-line px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-crimson px-5 py-2 text-xs font-medium text-white hover:opacity-95 disabled:opacity-50"
                >
                  {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: NUEVA ÁREA ACADÉMICA ── */}
      {modalNuevaArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md border border-line bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                  Nueva Área Académica
                </h3>
                <p className="text-xs text-neutral-500">
                  Creación de área de conocimiento para el plan de estudios.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevaArea(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </header>

            <form onSubmit={handleCrearArea} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nombre del Área del Conocimiento *
                </label>
                <input
                  type="text"
                  required
                  value={formArea.nombre}
                  onChange={(e) => setFormArea({ ...formArea, nombre: e.target.value })}
                  placeholder="Ej. Ciberseguridad e Infraestructura Crítica"
                  className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Umbral mínimo de disponibilidad (casos requeridos)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={formArea.umbralDisponibilidad}
                  onChange={(e) => setFormArea({ ...formArea, umbralDisponibilidad: Number(e.target.value) })}
                  className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                />
                <p className="mt-1 text-[11px] text-neutral-500">
                  Si los casos disponibles descienden por debajo de este umbral, el sistema disparará una alerta preventiva.
                </p>
              </div>

              <footer className="mt-2 flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setModalNuevaArea(false)}
                  className="border border-line px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-crimson px-5 py-2 text-xs font-medium text-white hover:opacity-95 disabled:opacity-50"
                >
                  {actionLoading ? 'Guardando...' : 'Crear Área'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
