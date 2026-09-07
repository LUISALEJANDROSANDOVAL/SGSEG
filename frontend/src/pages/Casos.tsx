import React, { useEffect, useState } from 'react'
import {
  AlertOctagon,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Filter,
  FolderKanban,
  Layers,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { TableSkeleton } from '@/components/table-skeleton'
import { EmptyState } from '@/components/empty-state'
import { useAuth } from '@/context/AuthContext'
import { casosApi } from '@/lib/casos.api'
import type {
  AreaAcademica,
  CasoEstudio,
  MetricasCasos,
  VistaAreaItem,
} from '@/lib/casos.api'
import { estudiantesApi } from '@/lib/estudiantes.api'
import type { Carrera } from '@/lib/estudiantes.api'
import { esJefeCarrera, getJefeCarreraId } from '@/lib/auth-helpers'

export default function PaginaCasos() {

  // Contexto de autenticación
  const { user } = useAuth()
  const isJefe = esJefeCarrera(user)
  const jefeCarreraId = getJefeCarreraId(user)

  // Estados de datos
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [selectedCarrera, setSelectedCarrera] = useState<string>('ALL')
  const [casos, setCasos] = useState<CasoEstudio[]>([])
  const [areas, setAreas] = useState<AreaAcademica[]>([])
  const [vistaAreasCarrera, setVistaAreasCarrera] = useState<VistaAreaItem[]>([])
  const [tabActiva, setTabActiva] = useState<'areas' | 'casos'>('areas')
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
  const [mostrarTodasAlertas, setMostrarTodasAlertas] = useState<boolean>(false)
  const [areasColapsadas, setAreasColapsadas] = useState<Record<string, boolean>>({})

  const toggleExpandArea = (idArea: string) => {
    setAreasColapsadas((prev) => ({
      ...prev,
      [idArea]: !prev[idArea],
    }))
  }

  // Modales
  const [modalNuevoCaso, setModalNuevoCaso] = useState<boolean>(false)
  const [modalDetalleCaso, setModalDetalleCaso] = useState<CasoEstudio | null>(null)
  const [modalEditarCaso, setModalEditarCaso] = useState<CasoEstudio | null>(null)
  const [modalNuevaArea, setModalNuevaArea] = useState<boolean>(false)
  const [modalReactivar, setModalReactivar] = useState<CasoEstudio | null>(null)
  const [motivoReactivar, setMotivoReactivar] = useState<string>('')

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
    idCarrera: '',
    nombre: '',
    umbralDisponibilidad: 2,
  })

  // Inicialización de carreras según el rol del usuario
  useEffect(() => {
    const initCarreras = async () => {
      try {
        const lista = await estudiantesApi.getCarreras()
        setCarreras(lista)

        if (isJefe) {
          if (jefeCarreraId) {
            setSelectedCarrera(String(jefeCarreraId))
          } else if (lista.length > 0) {
            setSelectedCarrera(String(lista[0].idCarrera))
          }
        }
      } catch (err) {
        console.error('Error al inicializar lista de carreras', err)
      }
    }
    initCarreras()
  }, [user, isJefe, jefeCarreraId])

  // Carga inicial y recarga optimizada
  const cargarDatos = async () => {
    setLoading(true)
    try {
      const idCarreraParam = selectedCarrera !== 'ALL' ? selectedCarrera : undefined

      const [metricasData, areasData, casosData, areasVistaData] = await Promise.all([
        casosApi.getMetricas(idCarreraParam),
        casosApi.getAreas(idCarreraParam),
        idCarreraParam
          ? casosApi.getCasosPorCarreraVista(idCarreraParam, {
              page,
              limit: 50,
              search: searchTerm,
              idArea: selectedArea,
              estado: selectedEstado,
            })
          : casosApi.getCasos({
              page,
              limit: 50,
              search: searchTerm,
              idCarrera: idCarreraParam,
              idArea: selectedArea,
              estado: selectedEstado,
            }),
        idCarreraParam ? casosApi.getAreasPorCarreraVista(idCarreraParam) : Promise.resolve([]),
      ])

      setMetricas(metricasData)
      setAreas(areasData)
      setVistaAreasCarrera(areasVistaData)

      // Unificar estructura de casos para la tabla
      const itemsMapeados: CasoEstudio[] = casosData.items.map((item: any) => ({
        idCasoEstudio: String(item.idCasoEstudio),
        idArea: String(item.idArea),
        titulo: item.titulo,
        contenido: item.contenido,
        documentoAdjunto: item.documentoAdjunto,
        estado: item.estadoBase ?? item.estado,
        estadoEfectivo: item.estadoEfectivo ?? item.estado,
        usos: item.totalUsos ?? item.usos ?? 0,
        umbral: item.umbralDisponibilidad ?? item.umbral ?? 2,
        area: item.area || {
          idArea: String(item.idArea),
          idCarrera: String(item.idCarrera),
          nombre: item.nombreArea || '',
          umbralDisponibilidad: Number(item.umbralDisponibilidad ?? 2),
          estado: item.estadoArea || 'ACTIVO',
          carrera: {
            idCarrera: String(item.idCarrera),
            nombre: item.nombreCarrera || '',
            facultad: {
              idFacultad: String(item.idFacultad || '1'),
              nombre: item.nombreFacultad || '',
            },
          },
        },
        _count: item._count || {
          defensas: item.totalUsos ?? 0,
          sorteosCaso: item.totalSorteos ?? 0,
        },
      }))

      setCasos(itemsMapeados)
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
  }, [page, selectedArea, selectedEstado, selectedCarrera])

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

    // Tomar la carrera del formulario, la carrera seleccionada en filtro o la primera disponible
    const idCarreraDefault =
      formArea.idCarrera ||
      (selectedCarrera !== 'ALL'
        ? selectedCarrera
        : areas[0]?.idCarrera || (user?.carreras && user.carreras[0]?.idCarrera) || '1')

    setActionLoading(true)
    try {
      await casosApi.createArea({
        idCarrera: idCarreraDefault,
        nombre: formArea.nombre.trim(),
        umbralDisponibilidad: Number(formArea.umbralDisponibilidad) || 2,
      })

      setFeedback({ tipo: 'exito', mensaje: `Área "${formArea.nombre}" creada exitosamente.` })
      setModalNuevaArea(false)
      setFormArea({ idCarrera: '', nombre: '', umbralDisponibilidad: 2 })
      await cargarDatos()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear área académica'
      setFeedback({ tipo: 'error', mensaje: msg })
    } finally {
      setActionLoading(false)
    }
  }

  // Reactivar caso por excepción extraordinaria (Jefe de Carrera)
  const handleReactivarCasoEspecial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalReactivar || motivoReactivar.trim().length < 10) {
      setFeedback({ tipo: 'error', mensaje: 'Debe ingresar una justificación técnica o resolución de al menos 10 caracteres.' })
      return
    }

    setActionLoading(true)
    try {
      const res = await casosApi.reactivarCasoEspecial(
        modalReactivar.idCasoEstudio,
        motivoReactivar.trim(),
      )
      setFeedback({ tipo: 'exito', mensaje: res.mensaje || 'Caso reactivado por caso especial exitosamente.' })
      setModalReactivar(null)
      setMotivoReactivar('')
      await cargarDatos()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al reactivar caso de estudio'
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

        {/* Banner de Stock Crítico dinámico institucional */}
        {metricas && metricas.stockCritico.length > 0 && (
          <section
            role="alert"
            className="border-l-4 border-l-crimson border border-line bg-white p-4 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center bg-crimson/10 text-crimson">
                  <AlertOctagon className="size-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Alerta de Stock Crítico en Banco de Casos
                    </h3>
                    <span className="inline-flex items-center gap-1 bg-crimson/10 border border-crimson/20 px-2 py-0.5 text-[11px] font-semibold text-crimson">
                      <span className="size-1.5 rounded-full bg-crimson animate-pulse" />
                      {metricas.stockCritico.length} áreas con stock bajo
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Áreas con menos de 2 casos disponibles. Se requiere incorporar nuevos casos antes de iniciar sorteos.
                  </p>
                </div>
              </div>

              {metricas.stockCritico.length > 6 && (
                <button
                  type="button"
                  onClick={() => setMostrarTodasAlertas(!mostrarTodasAlertas)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-line px-3 py-1.5 transition-colors"
                >
                  {mostrarTodasAlertas ? (
                    <>
                      <ChevronUp className="size-3.5" />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-3.5" />
                      Ver todas ({metricas.stockCritico.length})
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Lista organizada en tarjetas sobrias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {(mostrarTodasAlertas ? metricas.stockCritico : metricas.stockCritico.slice(0, 6)).map((alerta) => (
                <div
                  key={alerta.idArea}
                  className="group relative flex items-center justify-between gap-3 border border-line bg-surface p-3 transition-colors hover:border-crimson/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-neutral-900 truncate group-hover:text-crimson transition-colors">
                      {alerta.nombreArea}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {alerta.carrera}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium border ${
                        alerta.casosDisponibles === 0
                          ? 'bg-crimson/10 text-crimson border-crimson/30'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {alerta.casosDisponibles} de {alerta.umbralRequerido} disp.
                    </span>

                    <button
                      type="button"
                      title={`Registrar nuevo caso en ${alerta.nombreArea}`}
                      onClick={() => {
                        setFormNuevo((prev) => ({ ...prev, idArea: String(alerta.idArea) }))
                        setModalNuevoCaso(true)
                      }}
                      className="flex size-6.5 items-center justify-center bg-white text-neutral-600 border border-line hover:bg-neutral-50 hover:text-crimson transition-colors cursor-pointer"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tarjetas de Resumen (KPIs: Áreas de la Carrera primero, luego Casos) */}
        <section className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Áreas de la Carrera
            </p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-900">
              {metricas ? metricas.areasCubiertas : '—'}
            </p>
          </div>
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

            {/* Filtro de Carrera */}
            <div className="flex items-center gap-1.5">
              <Building2 className="size-3.5 text-neutral-400" />
              {user?.rolCode === 'JEFE_CARRERA' ? (
                <div className="border border-line bg-surface px-3 py-2 text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Carrera:</span>
                  <span>
                    {carreras.find((c) => String(c.idCarrera) === selectedCarrera)?.nombre ||
                      user.carreras?.[0]?.nombre ||
                      'Carrera Asignada'}
                  </span>
                </div>
              ) : (
                <select
                  value={selectedCarrera}
                  onChange={(e) => {
                    setSelectedCarrera(e.target.value)
                    setSelectedArea('ALL')
                    setPage(1)
                  }}
                  className="border border-line bg-surface px-3 py-2 text-xs font-medium outline-none focus:border-neutral-400"
                >
                  <option value="ALL">Todas las Carreras</option>
                  {carreras.map((c) => (
                    <option key={c.idCarrera} value={c.idCarrera}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              )}
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
                <option value="REACTIVADO_ESPECIAL">Reactivados Especiales</option>
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

        {/* Pestañas de Vista: Áreas de Grado primero, luego Casos de Estudio */}
        <div className="flex items-center gap-2 border-b border-line pb-px">
          <button
            type="button"
            onClick={() => setTabActiva('areas')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
              tabActiva === 'areas'
                ? 'border-crimson text-crimson font-semibold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Layers className="size-3.5" />
            <span>Áreas Académicas y Stock</span>
            <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-mono text-neutral-600">
              {areas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('casos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
              tabActiva === 'casos'
                ? 'border-crimson text-crimson font-semibold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <FolderKanban className="size-3.5" />
            <span>Inventario de Casos</span>
            <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-mono text-neutral-600">
              {totalCasosCount}
            </span>
          </button>
        </div>

        {/* Tabla de Inventario de Casos */}
        {tabActiva === 'casos' && (
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
                    <td colSpan={6} className="p-0">
                      <TableSkeleton filas={5} columnas={6} className="border-0" />
                    </td>
                  </tr>
                ) : casos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6">
                      <EmptyState
                        titulo="No se encontraron casos de estudio"
                        descripcion={
                          searchTerm || selectedCarrera !== 'ALL' || selectedArea !== 'ALL' || selectedEstado !== 'ALL'
                            ? 'Intenta ajustar o limpiar los filtros de búsqueda, carrera o estado.'
                            : 'El banco de casos está vacío. Registra el primer caso académico.'
                        }
                        icono={FolderKanban}
                        accion={
                          <button
                            type="button"
                            onClick={() => setModalNuevoCaso(true)}
                            className="inline-flex items-center gap-1.5 border border-ink bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 cursor-pointer"
                          >
                            <Plus className="size-3.5" />
                            <span>Registrar Caso</span>
                          </button>
                        }
                      />
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
                          ) : caso.estado === 'REACTIVADO_ESPECIAL' ? (
                            <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-300">
                              Reactivado Especial ({caso.usos} usos)
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
                            {user?.rolCode === 'JEFE_CARRERA' && estaAgotado && (
                              <button
                                type="button"
                                onClick={() => {
                                  setModalReactivar(caso)
                                  setMotivoReactivar('')
                                }}
                                className="flex items-center gap-1 rounded bg-purple-50 border border-purple-200 px-2 py-1 text-[11px] font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                                title="Reactivar caso por excepción académica (Jefe de Carrera)"
                              >
                                <RotateCcw className="size-3" />
                                <span>Reactivar</span>
                              </button>
                            )}
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
      )}

        {/* Vista Maestro-Detalle: Banco de Casos Organizado por Áreas */}
        {tabActiva === 'areas' && (
          <div className="flex flex-col gap-4">
            <header className="flex flex-wrap items-center justify-between gap-3 border border-line bg-white p-4 shadow-xs">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-neutral-900">
                  Banco de Casos por Área de Grado (Maestro - Detalle)
                </h2>
                <p className="text-xs text-neutral-500">
                  {selectedCarrera !== 'ALL'
                    ? `Visualizando casos de estudio agrupados por área para ${carreras.find((c) => String(c.idCarrera) === selectedCarrera)?.nombre || 'la Carrera'}.`
                    : 'Visualice y administre directamente cada área académica con sus casos de estudio anidados y control de stock.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const lista = vistaAreasCarrera.length > 0 ? vistaAreasCarrera : areas
                    const allCol = Object.keys(areasColapsadas).length > 0 && Object.values(areasColapsadas).every(Boolean)
                    const next: Record<string, boolean> = {}
                    lista.forEach((a: any) => {
                      next[String(a.idArea)] = !allCol
                    })
                    setAreasColapsadas(next)
                  }}
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-900 border border-line bg-surface px-3 py-1.5 cursor-pointer shadow-2xs"
                >
                  Expandir / Contraer Todo
                </button>
                <button
                  type="button"
                  onClick={cargarDatos}
                  className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 border border-line bg-surface px-3 py-1.5 cursor-pointer shadow-2xs"
                  title="Recargar datos"
                >
                  <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
            </header>

            {loading ? (
              <div className="border border-line bg-white p-6 shadow-xs">
                <TableSkeleton filas={4} columnas={5} className="border-0" />
              </div>
            ) : (vistaAreasCarrera.length > 0 ? vistaAreasCarrera : areas).length === 0 ? (
              <div className="border border-line bg-white p-8 shadow-xs">
                <EmptyState
                  titulo="No se encontraron áreas de grado"
                  descripcion="No hay áreas registradas para la carrera seleccionada."
                  icono={Layers}
                  accion={
                    <button
                      type="button"
                      onClick={() => setModalNuevaArea(true)}
                      className="inline-flex items-center gap-1.5 border border-ink bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 cursor-pointer shadow-xs"
                    >
                      <Plus className="size-3.5" />
                      <span>Registrar Área</span>
                    </button>
                  }
                />
              </div>
            ) : (
              (vistaAreasCarrera.length > 0 ? vistaAreasCarrera : areas).map((areaItem: any) => {
                const idArea = String(areaItem.idArea)
                const idCodigo = `AREA-${idArea.padStart(3, '0')}`
                const nombreArea = areaItem.nombreArea || areaItem.nombre
                const carreraNombre = areaItem.nombreCarrera || areaItem.carrera?.nombre || '—'
                const totalCasos = areaItem.totalCasos ?? areaItem._count?.casos ?? 0
                const disponibles = areaItem.casosDisponibles ?? areaItem._count?.casos ?? 0
                const agotados = areaItem.casosAgotados ?? 0
                const umbral = areaItem.umbralDisponibilidad ?? 2
                const esCritico = areaItem.stockCritico ?? (disponibles < umbral)
                const estaColapsada = !!areasColapsadas[idArea]

                // Casos pertenecientes a esta área
                const casosDeEstaArea = casos.filter(
                  (c) => String(c.idArea || c.area?.idArea) === idArea,
                )

                return (
                  <div
                    key={idArea}
                    className={`border border-line bg-white shadow-xs transition-all ${
                      esCritico ? 'border-l-4 border-l-crimson' : 'border-l-4 border-l-emerald-600'
                    }`}
                  >
                    {/* Encabezado del Área (Maestro) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-line bg-neutral-50/60">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleExpandArea(idArea)}
                          className="flex size-7 items-center justify-center border border-line bg-white text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer shadow-2xs"
                          title={estaColapsada ? 'Expandir casos' : 'Contraer casos'}
                        >
                          {estaColapsada ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronUp className="size-4" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-neutral-500 font-bold">
                              {idCodigo}
                            </span>
                            <h3 className="text-sm font-bold text-neutral-900">
                              {nombreArea}
                            </h3>
                            <span className="border border-line bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                              {carreraNombre}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            Umbral mínimo para sorteo: {umbral} casos disponibles
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Métricas del Área */}
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <span className="border border-line bg-white px-2.5 py-1 text-neutral-700 shadow-2xs">
                            <strong>{totalCasos}</strong> casos
                          </span>
                          <span className="border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800 font-semibold shadow-2xs">
                            <strong>{disponibles}</strong> disp.
                          </span>
                          {agotados > 0 && (
                            <span className="border border-crimson/20 bg-crimson/10 px-2.5 py-1 text-crimson font-semibold shadow-2xs">
                              <strong>{agotados}</strong> agotados
                            </span>
                          )}
                        </div>

                        {/* Semáforo */}
                        {esCritico ? (
                          <span className="inline-flex items-center gap-1 border border-crimson/30 bg-crimson/10 px-2.5 py-1 text-xs font-semibold text-crimson shadow-2xs">
                            <AlertTriangle className="size-3.5" />
                            Stock Crítico
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-2xs">
                            <CheckCircle2 className="size-3.5" />
                            Stock Adecuado
                          </span>
                        )}

                        {/* Botón rápido Nuevo Caso para esta área */}
                        <button
                          type="button"
                          onClick={() => {
                            setFormNuevo((prev) => ({ ...prev, idArea }))
                            setModalNuevoCaso(true)
                          }}
                          className="flex items-center gap-1.5 border border-crimson bg-crimson px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#821528] transition-colors shadow-2xs cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                          <span>+ Caso</span>
                        </button>
                      </div>
                    </div>

                    {/* Contenido Anidado: Casos de Estudio de esta Área (Detalle) */}
                    {!estaColapsada && (
                      <div className="p-0">
                        {casosDeEstaArea.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="border-b border-line bg-surface text-[10px] uppercase text-neutral-500 font-mono tracking-wider">
                                <tr>
                                  <th scope="col" className="px-5 py-2.5 font-semibold">Código</th>
                                  <th scope="col" className="px-5 py-2.5 font-semibold">Caso de Estudio</th>
                                  <th scope="col" className="px-5 py-2.5 font-semibold text-center">Disponibilidad / Usos</th>
                                  <th scope="col" className="px-5 py-2.5 font-semibold text-right">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-line">
                                {casosDeEstaArea.map((caso) => {
                                  const idCodigoCaso = `CASO-${String(caso.idCasoEstudio).padStart(3, '0')}`
                                  const estaAgotado = (caso.usos ?? 0) >= (caso.umbral ?? 2)
                                  return (
                                    <tr key={caso.idCasoEstudio} className="hover:bg-neutral-50/70 transition-colors">
                                      <td className="px-5 py-3 font-mono font-bold text-neutral-700 whitespace-nowrap">
                                        {idCodigoCaso}
                                      </td>
                                      <td className="px-5 py-3">
                                        <p className="font-bold text-neutral-900 leading-snug">
                                          {caso.titulo}
                                        </p>
                                        <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                                          {caso.contenido}
                                        </p>
                                      </td>
                                      <td className="px-5 py-3 text-center whitespace-nowrap">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold border ${
                                            estaAgotado
                                              ? 'border-crimson/30 bg-crimson/10 text-crimson'
                                              : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                          }`}
                                        >
                                          {estaAgotado ? `Agotado (${caso.usos}/${caso.umbral})` : `Disponible (${caso.usos}/${caso.umbral})`}
                                        </span>
                                      </td>
                                      <td className="px-5 py-3 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                          <button
                                            type="button"
                                            onClick={() => setModalDetalleCaso(caso)}
                                            className="p-1.5 text-neutral-500 hover:text-neutral-900 border border-transparent hover:border-line transition-colors cursor-pointer"
                                            title="Ver detalle del caso"
                                          >
                                            <Eye className="size-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => abrirModalEditar(caso)}
                                            className="p-1.5 text-neutral-500 hover:text-neutral-900 border border-transparent hover:border-line transition-colors cursor-pointer"
                                            title="Editar caso"
                                          >
                                            <Pencil className="size-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50/30">
                            <p>No hay casos de estudio registrados en esta área aún.</p>
                            <button
                              type="button"
                              onClick={() => {
                                setFormNuevo((prev) => ({ ...prev, idArea }))
                                setModalNuevoCaso(true)
                              }}
                              className="mt-2 text-xs text-crimson font-semibold hover:underline cursor-pointer"
                            >
                              + Cargar el primer caso para habilitar el sorteo de esta área
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
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

              {user?.rolCode === 'JEFE_CARRERA' &&
                (modalDetalleCaso.estadoEfectivo === 'AGOTADO' ||
                  modalDetalleCaso.usos >= modalDetalleCaso.umbral) && (
                  <div className="border border-purple-200 bg-purple-50 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-purple-900">
                        Caso Agotado ({modalDetalleCaso.usos}/{modalDetalleCaso.umbral} usos)
                      </p>
                      <p className="text-[11px] text-purple-700">
                        Como Jefe de Carrera, tiene la facultad de reactivar este caso por excepción académica.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const c = modalDetalleCaso
                        setModalDetalleCaso(null)
                        setModalReactivar(c)
                        setMotivoReactivar('')
                      }}
                      className="flex items-center gap-1.5 bg-purple-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-800 transition-colors shrink-0"
                    >
                      <RotateCcw className="size-3.5" />
                      Reactivar Especial
                    </button>
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
              {selectedCarrera === 'ALL' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Carrera Académica *
                  </label>
                  <select
                    required
                    value={formArea.idCarrera}
                    onChange={(e) => setFormArea({ ...formArea, idCarrera: e.target.value })}
                    className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                  >
                    <option value="">Seleccione una carrera...</option>
                    {carreras.map((c) => (
                      <option key={c.idCarrera} value={c.idCarrera}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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

      {/* ── MODAL: REACTIVACIÓN EXTRAORDINARIA POR CASO ESPECIAL (JEFE DE CARRERA) ── */}
      {modalReactivar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg border border-line bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-line px-6 py-4 bg-purple-50/70">
              <div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-200 text-purple-900 mb-1">
                  Potestad Exclusiva: Jefe de Carrera
                </span>
                <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                  Reactivación Extraordinaria por Caso Especial
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalReactivar(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </header>

            <form onSubmit={handleReactivarCasoEspecial} className="p-6 flex flex-col gap-4">
              <div className="border border-line bg-surface p-3 text-xs flex flex-col gap-1.5">
                <p>
                  <strong>Caso:</strong> CASO-{String(modalReactivar.idCasoEstudio).padStart(3, '0')} - {modalReactivar.titulo}
                </p>
                <p>
                  <strong>Área:</strong> {modalReactivar.area.nombre} ({modalReactivar.area.carrera?.nombre || 'General'})
                </p>
                <p>
                  <strong>Usos registrados:</strong> {modalReactivar.usos} de {modalReactivar.umbral} (Límite reglamentario alcanzado)
                </p>
              </div>

              <div className="border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
                <strong>Nota Reglamentaria:</strong> Al confirmar, el caso quedará en estado <strong>REACTIVADO ESPECIAL</strong> y volverá a participar en el banco de casos disponibles para ser asignado en una nueva defensa. Esta operación quedará registrada en la auditoría inmutable del sistema con su firma digital y motivo.
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Justificación Académica / Motivo de la Excepción *
                </label>
                <textarea
                  required
                  rows={4}
                  value={motivoReactivar}
                  onChange={(e) => setMotivoReactivar(e.target.value)}
                  placeholder="Especifique las razones académicas, resolución de carrera o caso fortuito que justifican habilitar este caso nuevamente (mínimo 10 caracteres)..."
                  className="w-full border border-line bg-surface p-3 text-xs leading-relaxed outline-none focus:border-neutral-400"
                />
                {motivoReactivar.trim().length > 0 && motivoReactivar.trim().length < 10 && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    Ingrese al menos 10 caracteres para fundamentar la excepción reglamentaria ({motivoReactivar.trim().length}/10).
                  </p>
                )}
              </div>

              <footer className="mt-2 flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setModalReactivar(null)}
                  className="border border-line px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || motivoReactivar.trim().length < 10}
                  className="bg-purple-700 px-5 py-2 text-xs font-medium text-white hover:bg-purple-800 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Reactivando...' : 'Confirmar Reactivación Especial'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
