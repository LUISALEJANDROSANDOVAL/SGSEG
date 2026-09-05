import { useState, useEffect, useMemo, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import {
  estudiantesApi,
  type Estudiante,
  type Carrera,
  type BulkUpsertResult,
} from '@/lib/estudiantes.api'
import { defensasApi } from '@/lib/defensas.api'
import {
  Calendar,
  Search,
  Upload,
  RefreshCw,
  GraduationCap,
  Building2,
  BookOpen,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileSpreadsheet,
  Mail,
  CreditCard,
  User,
  UserPlus,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { esJefeCarrera as checkEsJefeCarrera, getJefeCarreraId } from '@/lib/auth-helpers'

export default function PaginaEstudiantes() {
  // Auth y perfil de rol
  const { user } = useAuth()
  const esJefeCarrera = checkEsJefeCarrera(user)
  const isJefe = esJefeCarrera
  const jefeCarreraId = getJefeCarreraId(user)

  // Estado principal de datos
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Filtros de búsqueda
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<string>(() => {
    if (isJefe && jefeCarreraId) {
      return String(jefeCarreraId)
    }
    return 'ALL'
  })
  const [planSeleccionado, setPlanSeleccionado] = useState<string>('ALL')
  const [filtroEstado, setFiltroEstado] = useState<string>('ACTIVO')
  const [busqueda, setBusqueda] = useState<string>('')
  const [debouncedBusqueda, setDebouncedBusqueda] = useState<string>('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [limitePorPagina, setLimitePorPagina] = useState(15)

  // Modales
  const [mostrarModalImportacion, setMostrarModalImportacion] = useState(false)
  const [estudianteAEliminar, setEstudianteAEliminar] = useState<Estudiante | null>(null)
  const [accionEnProgreso, setAccionEnProgreso] = useState(false)

  // Estado para Programar Defensa
  const [estudianteParaDefensa, setEstudianteParaDefensa] = useState<Estudiante | null>(null)
  const [tipoDefensaModal, setTipoDefensaModal] = useState<'INTERNA' | 'EXTERNA'>('INTERNA')
  const [fechaDefensaModal, setFechaDefensaModal] = useState<string>('')
  const [periodoDefensaModal, setPeriodoDefensaModal] = useState<string>('II-2026')
  const [isProgramandoDefensa, setIsProgramandoDefensa] = useState(false)

  // Modal Inscribir Nuevo Estudiante
  const [mostrarModalNuevoEstudiante, setMostrarModalNuevoEstudiante] = useState(false)
  const [nuevoCarnetEstudiantil, setNuevoCarnetEstudiantil] = useState('')
  const [nuevoCarnetIdentidad, setNuevoCarnetIdentidad] = useState('')
  const [nuevoNombreCompleto, setNuevoNombreCompleto] = useState('')
  const [nuevoCorreo, setNuevoCorreo] = useState('')
  const [nuevaCarreraId, setNuevaCarreraId] = useState<string>('')
  const [nuevoPlanId, setNuevoPlanId] = useState<string>('')
  const [programarDefensaInmediata, setProgramarDefensaInmediata] = useState(false)
  const [tipoDefensaNuevo, setTipoDefensaNuevo] = useState<'INTERNA' | 'EXTERNA'>('INTERNA')
  const [fechaDefensaNuevo, setFechaDefensaNuevo] = useState('')
  const [periodoDefensaNuevo, setPeriodoDefensaNuevo] = useState('II-2026')
  const [isInscribiendo, setIsInscribiendo] = useState(false)
  const [nuevoEstudianteFeedback, setNuevoEstudianteFeedback] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null)

  // Estado del formulario de importación masiva
  const [importJsonText, setImportJsonText] = useState('')
  const [carreraImportDefecto, setCarreraImportDefecto] = useState<string>('')
  const [crearPlanesFaltantes, setCrearPlanesFaltantes] = useState(true)
  const [resultadoImportacion, setResultadoImportacion] = useState<BulkUpsertResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Debounce para el input de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(busqueda)
      setPaginaActual(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [busqueda])

  // Cargar lista de carreras
  const cargarCarreras = useCallback(async () => {
    try {
      const data = await estudiantesApi.getCarreras()
      setCarreras(data)
      if (data.length > 0) {
        if (!carreraImportDefecto) {
          setCarreraImportDefecto(data[0].idCarrera)
        }
        if (isJefe && jefeCarreraId) {
          setCarreraSeleccionada(String(jefeCarreraId))
        } else if (isJefe) {
          setCarreraSeleccionada(data[0].idCarrera)
        }
      }
    } catch (err) {
      console.error('Error al cargar carreras:', err)
    }
  }, [carreraImportDefecto, isJefe, jefeCarreraId])

  // Cargar lista de estudiantes con filtros aplicados
  const cargarEstudiantes = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const resp = await estudiantesApi.getEstudiantes({
        idCarrera: carreraSeleccionada,
        idPlanEstudio: planSeleccionado,
        estado: filtroEstado,
        incluirEliminados: filtroEstado === 'ALL' || filtroEstado === 'ELIMINADO',
        search: debouncedBusqueda,
        page: paginaActual,
        limit: limitePorPagina,
      })
      setEstudiantes(resp.items || [])
      setTotalRegistros(resp.pagination?.total || 0)
      setTotalPages(resp.pagination?.totalPages || 1)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con el servidor'
      setErrorMsg(`No se pudo cargar la lista de estudiantes: ${msg}`)
      setEstudiantes([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [
    carreraSeleccionada,
    planSeleccionado,
    filtroEstado,
    debouncedBusqueda,
    paginaActual,
    limitePorPagina,
  ])

  // Carga inicial
  useEffect(() => {
    cargarCarreras()
  }, [cargarCarreras])

  useEffect(() => {
    cargarEstudiantes()
  }, [cargarEstudiantes])

  // Planes de estudio disponibles para la carrera seleccionada
  const planesDisponibles = useMemo(() => {
    if (carreraSeleccionada === 'ALL') {
      const todosLosPlanes: { id: string; nombre: string; carrera: string }[] = []
      carreras.forEach((c) => {
        c.planesEstudio?.forEach((p) => {
          todosLosPlanes.push({
            id: p.idPlanEstudio,
            nombre: `${p.nombre} (${c.nombre})`,
            carrera: c.nombre,
          })
        })
      })
      return todosLosPlanes
    }
    const c = carreras.find((item) => item.idCarrera === carreraSeleccionada)
    return (
      c?.planesEstudio?.map((p) => ({
        id: p.idPlanEstudio,
        nombre: p.nombre,
        carrera: c.nombre,
      })) || []
    )
  }, [carreras, carreraSeleccionada])

  // Limpiar plan seleccionado si cambia la carrera y el plan ya no pertenece
  const handleCambioCarrera = (nuevaCarrera: string) => {
    setCarreraSeleccionada(nuevaCarrera)
    setPlanSeleccionado('ALL')
    setPaginaActual(1)
  }

  // Refrescar manualmente
  const handleRefresh = () => {
    setIsRefreshing(true)
    cargarCarreras()
    cargarEstudiantes()
  }

  // Soft Delete
  const handleConfirmSoftDelete = async () => {
    if (!estudianteAEliminar) return
    setAccionEnProgreso(true)
    try {
      await estudiantesApi.softDelete(estudianteAEliminar.idEstudiante)
      setEstudianteAEliminar(null)
      cargarEstudiantes()
    } catch (err: unknown) {
      console.error('Error al desactivar estudiante:', err)
      alert('Error al desactivar estudiante')
    } finally {
      setAccionEnProgreso(false)
    }
  }

  // Restaurar Estudiante
  const handleRestore = async (idEstudiante: string) => {
    setAccionEnProgreso(true)
    try {
      await estudiantesApi.restore(idEstudiante)
      cargarEstudiantes()
    } catch (err: unknown) {
      console.error('Error al restaurar estudiante:', err)
      alert('Error al restaurar estudiante')
    } finally {
      setAccionEnProgreso(false)
    }
  }

  // Programar Defensa
  const handleProgramarDefensa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estudianteParaDefensa || !fechaDefensaModal) return
    setIsProgramandoDefensa(true)
    try {
      const resp = await defensasApi.programarDefensa({
        idEstudiante: estudianteParaDefensa.idEstudiante,
        tipoDefensa: tipoDefensaModal,
        fechaDefensa: fechaDefensaModal,
        periodoAcademico: periodoDefensaModal,
      })
      alert(
        `Defensa programada exitosamente para ${estudianteParaDefensa.nombreCompleto}.\n${resp.reglasSorteo?.descripcionModalidad || ''}`,
      )
      setEstudianteParaDefensa(null)
      setFechaDefensaModal('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al programar defensa'
      alert(`Error al programar defensa: ${msg}`)
    } finally {
      setIsProgramandoDefensa(false)
    }
  }

  // Abrir modal de inscripción
  const abrirModalNuevoEstudiante = () => {
    setNuevoEstudianteFeedback(null)
    const targetCarrera = esJefeCarrera
      ? (carreras[0]?.idCarrera || '')
      : (carreraSeleccionada !== 'ALL' ? carreraSeleccionada : (carreras[0]?.idCarrera || ''))

    setNuevaCarreraId(targetCarrera)
    const c = carreras.find((x) => x.idCarrera === targetCarrera)
    if (c?.planesEstudio && c.planesEstudio.length > 0) {
      setNuevoPlanId(c.planesEstudio[0].idPlanEstudio)
    } else {
      setNuevoPlanId('')
    }
    setMostrarModalNuevoEstudiante(true)
  }

  // Ejecutar inscripción individual
  const handleInscribirEstudiante = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoCarnetEstudiantil.trim() || !nuevoCarnetIdentidad.trim() || !nuevoNombreCompleto.trim()) {
      setNuevoEstudianteFeedback({ tipo: 'error', mensaje: 'Por favor complete todos los campos obligatorios (*).' })
      return
    }
    if (programarDefensaInmediata && !fechaDefensaNuevo) {
      setNuevoEstudianteFeedback({ tipo: 'error', mensaje: 'Si activó la opción de defensa, seleccione la fecha de defensa.' })
      return
    }

    setIsInscribiendo(true)
    setNuevoEstudianteFeedback(null)

    try {
      const resp = await estudiantesApi.createEstudiante({
        carnetEstudiantil: nuevoCarnetEstudiantil.trim(),
        carnetIdentidad: nuevoCarnetIdentidad.trim(),
        nombreCompleto: nuevoNombreCompleto.trim(),
        correo: nuevoCorreo.trim() || undefined,
        idCarrera: nuevaCarreraId || undefined,
        idPlanEstudio: nuevoPlanId || undefined,
      })

      let mensajeExito = `¡Estudiante ${resp.estudiante?.nombreCompleto || nuevoNombreCompleto} inscrito exitosamente en el padrón!`

      if (programarDefensaInmediata && fechaDefensaNuevo && resp.estudiante?.idEstudiante) {
        await defensasApi.programarDefensa({
          idEstudiante: resp.estudiante.idEstudiante,
          tipoDefensa: tipoDefensaNuevo,
          fechaDefensa: fechaDefensaNuevo,
          periodoAcademico: periodoDefensaNuevo,
        })
        mensajeExito += ' Además se ha programado su defensa de grado con éxito.'
      }

      setNuevoEstudianteFeedback({ tipo: 'exito', mensaje: mensajeExito })
      setNuevoCarnetEstudiantil('')
      setNuevoCarnetIdentidad('')
      setNuevoNombreCompleto('')
      setNuevoCorreo('')
      setProgramarDefensaInmediata(false)
      setFechaDefensaNuevo('')
      cargarEstudiantes()

      setTimeout(() => {
        setMostrarModalNuevoEstudiante(false)
        setNuevoEstudianteFeedback(null)
      }, 1600)
    } catch (err: any) {
      const responseMessage = err?.response?.data?.message
      const msg = Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : (responseMessage || err?.message || 'Error al inscribir al estudiante')
      setNuevoEstudianteFeedback({ tipo: 'error', mensaje: msg })
    } finally {
      setIsInscribiendo(false)
    }
  }

  // Cargar plantilla de ejemplo para importación
  const cargarPlantillaEjemplo = () => {
    const ejemplo = [
      {
        carnetEstudiantil: 'SIS-2024001',
        carnetIdentidad: '8392011 LP',
        nombreCompleto: 'Gabriel Leonardo Suarez Choque',
        correo: 'gabriel.suarez@estudiante.edu.bo',
        nombreCarrera: 'Ingeniería de Sistemas',
        nombrePlanEstudio: 'Plan 2024',
      },
      {
        carnetEstudiantil: 'INF-2024002',
        carnetIdentidad: '7482910 CB',
        nombreCompleto: 'Maria Fernanda Morales Rios',
        correo: 'maria.morales@estudiante.edu.bo',
        nombreCarrera: 'Ingeniería Informática',
        nombrePlanEstudio: 'Plan 2023',
      },
      {
        carnetEstudiantil: 'IND-2024003',
        carnetIdentidad: '6391024 SC',
        nombres: 'Jorge Andrés',
        primerApellido: 'Vaca',
        segundoApellido: 'Gutiérrez',
        nombreCarrera: 'Ingeniería Industrial',
      },
    ]
    setImportJsonText(JSON.stringify(ejemplo, null, 2))
  }

  // Ejecutar importación masiva transaccional
  const handleEjecutarImportacion = async () => {
    if (!importJsonText.trim()) {
      alert('Por favor pegue los datos en formato JSON')
      return
    }

    try {
      const parsedData = JSON.parse(importJsonText)
      if (!Array.isArray(parsedData)) {
        alert('El JSON debe ser un arreglo de estudiantes')
        return
      }

      setIsImporting(true)
      setResultadoImportacion(null)

      const result = await estudiantesApi.bulkUpsert({
        estudiantes: parsedData,
        idCarreraPorDefecto: carreraImportDefecto || undefined,
        crearPlanesFaltantes,
        batchSize: 50,
      })

      setResultadoImportacion(result)
      cargarCarreras()
      cargarEstudiantes()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de formato JSON o conexión'
      alert(`Error al procesar importación: ${msg}`)
    } finally {
      setIsImporting(false)
    }
  }

  // Formato de fecha
  const formatearFecha = (fechaIso?: string) => {
    if (!fechaIso) return '—'
    try {
      const d = new Date(fechaIso)
      return d.toLocaleDateString('es-BO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return fechaIso
    }
  }

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Encabezado Principal */}
        <EncabezadoPagina
          titulo="Padrón de Estudiantes"
          descripcion="Gestión académica, filtrado por carrera y plan de estudio, normalización e inserción masiva transaccional de postulantes."
          accion={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
                title="Actualizar datos"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span>Actualizar</span>
              </button>
              {!esJefeCarrera && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setResultadoImportacion(null)
                      setMostrarModalImportacion(true)
                    }}
                    className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-ink hover:text-ink cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Importar Padrón</span>
                  </button>
                  <button
                    type="button"
                    onClick={abrirModalNuevoEstudiante}
                    className="flex items-center gap-1.5 border border-ink bg-ink px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 shadow-xs cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>+ Inscribir Estudiante</span>
                  </button>
                </>
              )}
            </div>
          }
        />

        {/* Insignia de Aislamiento Estricto para Jefe de Carrera (RNF-01, RNF-02) */}
        {esJefeCarrera && (
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
                    Modo Lectura / Consulta
                  </span>
                </div>
                <p className="text-xs font-semibold text-neutral-900 mt-0.5">
                  Visualizando únicamente el padrón de postulantes de:{' '}
                  <span className="text-crimson">
                    {carreras.find((c) => String(c.idCarrera) === String(carreraSeleccionada))?.nombre || 'Carrera Asignada'}
                  </span>
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-neutral-500 font-mono">
              carreraId: {carreraSeleccionada}
            </span>
          </div>
        )}

        {/* Tarjetas de Resumen KPI */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Total Registrados
              </span>
              <User className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">
              {totalRegistros}
            </div>
            <span className="text-[11px] text-neutral-500">
              En el padrón institucional
            </span>
          </div>

          <div className="border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                {esJefeCarrera ? 'Mi Carrera' : 'Carreras Activas'}
              </span>
              <Building2 className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">
              {esJefeCarrera ? (carreras[0]?.nombre || 'Sistemas') : carreras.length}
            </div>
            <span className="text-[11px] text-neutral-500">
              {esJefeCarrera ? 'Gestión académica exclusiva' : 'Con programas de grado'}
            </span>
          </div>

          <div className="border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Planes Vigentes
              </span>
              <BookOpen className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">
              {carreras.reduce((acc, c) => acc + (c.planesEstudio?.length || 0), 0)}
            </div>
            <span className="text-[11px] text-neutral-500">
              Pensa académicos asociados
            </span>
          </div>

          <div className="border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Vista Actual
              </span>
              <GraduationCap className="h-4 w-4 text-crimson" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-crimson">
              {estudiantes.length}
            </div>
            <span className="text-[11px] text-neutral-500">
              Estudiantes listados en página
            </span>
          </div>
        </div>

        {/* Barra de Filtros por Carrera, Plan, Estado y Búsqueda */}
        <div className="flex flex-col gap-3 border border-line bg-white p-4">
          {/* Fila 1: Pestañas de Carrera */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="flex items-center gap-1 text-xs font-semibold text-neutral-700 uppercase tracking-wider mr-2">
              <Building2 className="h-3.5 w-3.5" /> Carrera:
            </span>
            {esJefeCarrera ? (
              // Modo Jefe de Carrera: Únicamente su carrera asignada, sin opción de "Todas las Carreras"
              carreras.map((c) => (
                <span
                  key={c.idCarrera}
                  className="inline-flex items-center gap-1.5 border border-ink bg-ink px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
                >
                  <Building2 className="h-3.5 w-3.5 text-neutral-300" />
                  <span>{c.nombre}</span>
                </span>
              ))
            ) : (
              // Modo Coordinación / Secretariado: Todas las Carreras y selector global
              <>
                <button
                  type="button"
                  onClick={() => handleCambioCarrera('ALL')}
                  className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium transition-all ${
                    carreraSeleccionada === 'ALL'
                      ? 'border border-ink bg-ink text-white shadow-xs'
                      : 'border border-line bg-surface text-neutral-600 hover:border-neutral-400 hover:bg-white'
                  }`}
                >
                  Todas las Carreras
                </button>
                {carreras.map((c) => (
                  <button
                    key={c.idCarrera}
                    type="button"
                    onClick={() => handleCambioCarrera(c.idCarrera)}
                    className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium transition-all ${
                      carreraSeleccionada === c.idCarrera
                        ? 'border border-ink bg-ink text-white shadow-xs'
                        : 'border border-line bg-surface text-neutral-600 hover:border-neutral-400 hover:bg-white'
                    }`}
                  >
                    {c.nombre}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Fila 2: Filtro por Plan, Estado y Caja de Búsqueda */}
          <div className="grid grid-cols-1 gap-3 pt-2 border-t border-line sm:grid-cols-12">
            {/* Selector de Plan */}
            <div className="sm:col-span-4 flex items-center gap-2">
              <label htmlFor="select-plan" className="text-xs font-medium text-neutral-600 whitespace-nowrap">
                Pensum / Plan:
              </label>
              <select
                id="select-plan"
                value={planSeleccionado}
                onChange={(e) => {
                  setPlanSeleccionado(e.target.value)
                  setPaginaActual(1)
                }}
                className="w-full border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 focus:border-ink focus:outline-hidden"
              >
                <option value="ALL">Todos los planes</option>
                {planesDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Estado */}
            <div className="sm:col-span-3 flex items-center gap-2">
              <label htmlFor="select-estado" className="text-xs font-medium text-neutral-600 whitespace-nowrap">
                Estado:
              </label>
              <select
                id="select-estado"
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value)
                  setPaginaActual(1)
                }}
                className="w-full border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 focus:border-ink focus:outline-hidden"
              >
                <option value="ACTIVO">Solo Activos</option>
                <option value="INACTIVO">Inactivos</option>
                <option value="ELIMINADO">Eliminados (Soft Delete)</option>
                <option value="ALL">Todos (incluye históricos)</option>
              </select>
            </div>

            {/* Campo de Búsqueda con debounce */}
            <div className="sm:col-span-5 relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por carnet, CI, nombre o correo..."
                className="w-full border border-line bg-surface py-1.5 pl-8 pr-8 text-xs text-neutral-800 placeholder-neutral-400 focus:border-ink focus:bg-white focus:outline-hidden"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje de Error si ocurre */}
        {errorMsg && (
          <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tabla de Estudiantes */}
        <section className="border border-line bg-white shadow-xs">
          <header className="flex flex-wrap items-center justify-between border-b border-line px-5 py-3.5 gap-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-neutral-700" />
              <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
                Padrón Oficial de Estudiantes
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span>
                Mostrando <strong className="text-neutral-900">{estudiantes.length}</strong> de{' '}
                <strong className="text-neutral-900">{totalRegistros}</strong> registros
              </span>
            </div>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="border-b border-line bg-surface">
                <tr className="text-[11px] font-semibold tracking-[0.1em] text-neutral-500 uppercase">
                  <th scope="col" className="px-5 py-3">
                    Carnet Estudiantil
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Estudiante / C.I.
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Correo Institucional
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Carrera
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Plan de Estudios
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Registro
                  </th>
                  <th scope="col" className="px-5 py-3 text-center">
                    Estado
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-neutral-400" />
                        <span className="text-xs">Cargando padrón de estudiantes...</span>
                      </div>
                    </td>
                  </tr>
                ) : estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <GraduationCap className="h-8 w-8 text-neutral-300" />
                        <span className="text-sm font-medium text-neutral-700">
                          No se encontraron estudiantes
                        </span>
                        <p className="text-xs text-neutral-400 max-w-sm">
                          {busqueda || carreraSeleccionada !== 'ALL' || planSeleccionado !== 'ALL'
                            ? 'Intenta ajustar o limpiar los filtros de búsqueda y carrera.'
                            : 'El padrón está vacío. Inscribe al primer estudiante o importa un archivo masivo.'}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={abrirModalNuevoEstudiante}
                            className="inline-flex items-center gap-1.5 border border-ink bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>Inscribir Estudiante</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  estudiantes.map((est) => {
                    const esEliminado = est.estado === 'ELIMINADO'
                    return (
                      <tr
                        key={est.idEstudiante}
                        className={`transition-colors hover:bg-neutral-50/80 ${
                          esEliminado ? 'bg-neutral-50/50 opacity-70' : ''
                        }`}
                      >
                        {/* Carnet Estudiantil */}
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-semibold tracking-wider text-ink bg-surface border border-line px-2 py-0.5">
                            {est.carnetEstudiantil}
                          </span>
                        </td>

                        {/* Nombre y CI */}
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-neutral-900">
                            {est.nombreCompleto}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                            <CreditCard className="h-3 w-3" />
                            <span>CI: {est.carnetIdentidad}</span>
                          </div>
                        </td>

                        {/* Correo */}
                        <td className="px-5 py-3.5 text-xs text-neutral-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{est.correo}</span>
                          </div>
                        </td>

                        {/* Carrera */}
                        <td className="px-5 py-3.5 text-xs text-neutral-700">
                          <div className="font-medium">
                            {est.planEstudio?.carrera?.nombre || '—'}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {est.planEstudio?.carrera?.facultad?.nombre || ''}
                          </div>
                        </td>

                        {/* Plan de Estudios */}
                        <td className="px-5 py-3.5 text-xs">
                          <span className="inline-flex items-center gap-1 bg-surface border border-line px-2 py-0.5 text-[11px] text-neutral-700 font-medium">
                            <Layers className="h-3 w-3 text-neutral-400" />
                            {est.planEstudio?.nombre || '—'}
                          </span>
                        </td>

                        {/* Fecha Registro */}
                        <td className="px-5 py-3.5 text-[11px] text-neutral-500 whitespace-nowrap">
                          {formatearFecha(est.fechaRegistro)}
                        </td>

                        {/* Estado */}
                        <td className="px-5 py-3.5 text-center">
                          {est.estado === 'ACTIVO' ? (
                            <span className="inline-block border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 tracking-wider uppercase">
                              Activo
                            </span>
                          ) : est.estado === 'ELIMINADO' ? (
                            <span className="inline-block border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 tracking-wider uppercase">
                              Eliminado
                            </span>
                          ) : (
                            <span className="inline-block border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 tracking-wider uppercase">
                              {est.estado}
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {esJefeCarrera ? (
                              <span className="text-[11px] font-medium text-neutral-400 italic">
                                Solo consulta
                              </span>
                            ) : esEliminado ? (
                              <button
                                type="button"
                                onClick={() => handleRestore(est.idEstudiante)}
                                disabled={accionEnProgreso}
                                className="inline-flex items-center gap-1 border border-emerald-300 bg-white px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50"
                                title="Restaurar estudiante a ACTIVO"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Restaurar</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEstudianteParaDefensa(est)}
                                  className="inline-flex items-center gap-1 border border-line bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:border-crimson hover:text-crimson hover:bg-red-50/40"
                                  title="Programar fecha de defensa para este postulante"
                                >
                                  <Calendar className="h-3 w-3 text-crimson" />
                                  <span>Programar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEstudianteAEliminar(est)}
                                  disabled={accionEnProgreso}
                                  className="inline-flex items-center gap-1 border border-line bg-white px-2 py-1 text-[11px] font-medium text-neutral-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                                  title="Desactivar estudiante (Soft Delete)"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Desactivar</span>
                                </button>
                              </>
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

          {/* Barra de Paginación */}
          {!isLoading && totalRegistros > 0 && (
            <footer className="flex flex-wrap items-center justify-between border-t border-line px-5 py-3 gap-3 bg-surface">
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <span>Registros por página:</span>
                <select
                  value={limitePorPagina}
                  onChange={(e) => {
                    setLimitePorPagina(Number(e.target.value))
                    setPaginaActual(1)
                  }}
                  className="border border-line bg-white px-2 py-1 text-xs focus:border-ink focus:outline-hidden"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600">
                  Página <strong className="text-neutral-900">{paginaActual}</strong> de{' '}
                  <strong className="text-neutral-900">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                    disabled={paginaActual <= 1}
                    className="border border-line bg-white p-1.5 text-neutral-700 transition-colors hover:border-ink hover:text-ink disabled:opacity-40 disabled:hover:border-line disabled:hover:text-neutral-700"
                    title="Página anterior"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaginaActual((prev) => Math.min(totalPages, prev + 1))}
                    disabled={paginaActual >= totalPages}
                    className="border border-line bg-white p-1.5 text-neutral-700 transition-colors hover:border-ink hover:text-ink disabled:opacity-40 disabled:hover:border-line disabled:hover:text-neutral-700"
                    title="Página siguiente"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </footer>
          )}
        </section>

        {/* MODAL DE IMPORTACIÓN MASIVA */}
        {mostrarModalImportacion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col border border-line bg-white shadow-2xl">
              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-neutral-800" />
                  <h3 className="text-base font-semibold text-neutral-900">
                    Importación Masiva Transaccional (Upsert)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarModalImportacion(false)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Contenido Modal */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <p className="text-neutral-600">
                  Pega un arreglo JSON con los registros de estudiantes. El servicio normalizará
                  automáticamente los nombres y carnets, asociará o creará los planes de estudio
                  faltantes y actualizará (upsert) registros existentes con el mismo carnet.
                </p>

                {/* Configuración de importación */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 bg-surface p-3 border border-line">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Carrera por defecto (si se omite en la fila):
                    </label>
                    {esJefeCarrera ? (
                      <div className="flex items-center gap-2 border border-blue-200 bg-blue-50/70 px-2.5 py-1.5 text-xs font-semibold text-blue-900">
                        <Building2 className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                        <span>{carreras[0]?.nombre || 'Sistemas'}</span>
                      </div>
                    ) : (
                      <select
                        value={carreraImportDefecto}
                        onChange={(e) => setCarreraImportDefecto(e.target.value)}
                        className="w-full border border-line bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-ink focus:outline-hidden"
                      >
                        {carreras.map((c) => (
                          <option key={c.idCarrera} value={c.idCarrera}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="check-crear-planes"
                      checked={crearPlanesFaltantes}
                      onChange={(e) => setCrearPlanesFaltantes(e.target.checked)}
                      className="h-4 w-4 border-line text-ink focus:ring-ink"
                    />
                    <label htmlFor="check-crear-planes" className="font-medium text-neutral-700 cursor-pointer">
                      Auto-crear Planes de Estudio no existentes
                    </label>
                  </div>
                </div>

                {/* Botón de Plantilla */}
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-700">JSON de Estudiantes:</span>
                  <button
                    type="button"
                    onClick={cargarPlantillaEjemplo}
                    className="flex items-center gap-1 text-[11px] font-semibold text-crimson hover:underline"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Cargar ejemplo de prueba</span>
                  </button>
                </div>

                {/* Editor de JSON */}
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="[&#10;  {&#10;    &quot;carnetEstudiantil&quot;: &quot;SIS-2024001&quot;,&#10;    &quot;carnetIdentidad&quot;: &quot;8392011 LP&quot;,&#10;    &quot;nombreCompleto&quot;: &quot;Carlos Perez&quot;,&#10;    &quot;nombreCarrera&quot;: &quot;Ingeniería de Sistemas&quot;&#10;  }&#10;]"
                  rows={8}
                  className="w-full border border-line bg-neutral-900 p-3 font-mono text-xs text-neutral-100 placeholder-neutral-500 focus:border-ink focus:outline-hidden"
                />

                {/* Resumen de Resultados tras ejecución */}
                {resultadoImportacion && (
                  <div className="border border-emerald-200 bg-emerald-50/80 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Carga Masiva Transaccional Completada Exitosamente</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 pt-1">
                      <div className="bg-white p-2 border border-emerald-200 text-center">
                        <span className="text-[10px] text-neutral-500 uppercase">Total</span>
                        <div className="font-bold text-neutral-900">
                          {resultadoImportacion.total}
                        </div>
                      </div>
                      <div className="bg-white p-2 border border-emerald-200 text-center">
                        <span className="text-[10px] text-emerald-600 uppercase">Nuevos</span>
                        <div className="font-bold text-emerald-700">
                          {resultadoImportacion.creados}
                        </div>
                      </div>
                      <div className="bg-white p-2 border border-emerald-200 text-center">
                        <span className="text-[10px] text-blue-600 uppercase">Actualizados</span>
                        <div className="font-bold text-blue-700">
                          {resultadoImportacion.actualizados}
                        </div>
                      </div>
                      <div className="bg-white p-2 border border-emerald-200 text-center">
                        <span className="text-[10px] text-neutral-500 uppercase">Planes Nuevos</span>
                        <div className="font-bold text-neutral-900">
                          {resultadoImportacion.planesCreados}
                        </div>
                      </div>
                    </div>

                    {resultadoImportacion.planesCreadosDetalle.length > 0 && (
                      <div className="text-[11px] text-emerald-900 pt-1">
                        <strong>Planes auto-creados:</strong>{' '}
                        {resultadoImportacion.planesCreadosDetalle.map((p) => p.nombre).join(', ')}
                      </div>
                    )}

                    {resultadoImportacion.errores.length > 0 && (
                      <div className="mt-2 border-t border-emerald-200 pt-2 text-red-700 text-[11px]">
                        <strong>Advertencias / Errores:</strong>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {resultadoImportacion.errores.map((err, idx) => (
                            <li key={idx}>
                              Fila {err.indice}: {err.mensaje}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="flex items-center justify-end gap-2 border-t border-line bg-surface px-6 py-3">
                <button
                  type="button"
                  onClick={() => setMostrarModalImportacion(false)}
                  className="border border-line bg-white px-4 py-2 text-xs font-medium text-neutral-700 hover:border-neutral-400"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleEjecutarImportacion}
                  disabled={isImporting || !importJsonText.trim()}
                  className="flex items-center gap-1.5 border border-ink bg-ink px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Procesando Transacción...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>Ejecutar Carga Masiva</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PARA PROGRAMAR DEFENSA DE ESTUDIANTE */}
        {estudianteParaDefensa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg border border-line bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                    Programar Defensa para Postulante
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {estudianteParaDefensa.nombreCompleto} ({estudianteParaDefensa.carnetEstudiantil})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEstudianteParaDefensa(null)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleProgramarDefensa} className="p-6 flex flex-col gap-4">
                <div className="bg-surface p-3 border border-line text-xs">
                  <p className="font-semibold text-neutral-800">
                    Carrera: {estudianteParaDefensa.planEstudio?.carrera?.nombre || '—'}
                  </p>
                  <p className="text-neutral-500 text-[11px]">
                    Facultad: {estudianteParaDefensa.planEstudio?.carrera?.facultad?.nombre || 'UPTECSA'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Tipo de Defensa *
                    </label>
                    <select
                      value={tipoDefensaModal}
                      onChange={(e) => setTipoDefensaModal(e.target.value as 'INTERNA' | 'EXTERNA')}
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
                      value={periodoDefensaModal}
                      onChange={(e) => setPeriodoDefensaModal(e.target.value)}
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
                    value={fechaDefensaModal}
                    onChange={(e) => setFechaDefensaModal(e.target.value)}
                    className="w-full border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-neutral-400"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-line pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setEstudianteParaDefensa(null)}
                    className="border border-line bg-white px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isProgramandoDefensa}
                    className="bg-crimson px-4 py-2 text-xs font-medium text-white hover:opacity-95 disabled:opacity-50"
                  >
                    {isProgramandoDefensa ? 'Programando...' : 'Confirmar Programación'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL PARA INSCRIBIR NUEVO ESTUDIANTE */}
        {mostrarModalNuevoEstudiante && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-xl border border-line bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 border border-line bg-white">
                    <UserPlus className="h-4 w-4 text-ink" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                      Inscribir Nuevo Postulante
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Registro oficial en el padrón para habilitación a defensa de grado
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevoEstudiante(false)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {nuevoEstudianteFeedback && (
                <div
                  className={`mx-6 mt-4 flex items-center gap-2 p-3 text-xs border ${
                    nuevoEstudianteFeedback.tipo === 'exito'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  {nuevoEstudianteFeedback.tipo === 'exito' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  )}
                  <span>{nuevoEstudianteFeedback.mensaje}</span>
                </div>
              )}

              {esJefeCarrera && (
                <div className="mx-6 mt-4 border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900 flex items-start gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Modo Jefe de Carrera:</span> El postulante quedará
                    inscrito bajo tu carrera académica autorizada.
                  </div>
                </div>
              )}

              <form onSubmit={handleInscribirEstudiante} className="p-6 flex flex-col gap-4">
                {/* Datos de Identificación */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Carnet Estudiantil (Código) *
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoCarnetEstudiantil}
                      onChange={(e) => setNuevoCarnetEstudiantil(e.target.value.toUpperCase())}
                      placeholder="ej. SIS-2024099"
                      className="w-full border border-line bg-surface px-3 py-2 text-xs font-mono font-medium outline-hidden focus:border-ink focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      C.I. (Carnet de Identidad) *
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoCarnetIdentidad}
                      onChange={(e) => setNuevoCarnetIdentidad(e.target.value)}
                      placeholder="ej. 8392011 SC"
                      className="w-full border border-line bg-surface px-3 py-2 text-xs outline-hidden focus:border-ink focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nombre Completo del Postulante *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoNombreCompleto}
                    onChange={(e) => setNuevoNombreCompleto(e.target.value)}
                    placeholder="ej. Gabriel Leonardo Suarez Choque"
                    className="w-full border border-line bg-surface px-3 py-2 text-xs outline-hidden focus:border-ink focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Correo Institucional o de Contacto
                  </label>
                  <input
                    type="email"
                    value={nuevoCorreo}
                    onChange={(e) => setNuevoCorreo(e.target.value)}
                    placeholder="ej. gabriel.suarez@estudiante.edu.bo"
                    className="w-full border border-line bg-surface px-3 py-2 text-xs outline-hidden focus:border-ink focus:bg-white"
                  />
                </div>

                {/* Carrera y Plan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-line">
                  {esJefeCarrera ? (
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Carrera Académica *
                      </label>
                      <div className="flex items-center gap-2 border border-blue-200 bg-blue-50/70 px-3 py-2 text-xs font-semibold text-blue-900">
                        <Building2 className="h-4 w-4 text-blue-700 shrink-0" />
                        <span>
                          {carreras.find((x) => x.idCarrera === nuevaCarreraId)?.nombre || carreras[0]?.nombre || 'Sistemas'}
                        </span>
                        <span className="ml-auto rounded-xs bg-blue-200/80 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
                          Tu Carrera Asignada
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Carrera Académica * <span className="text-[11px] font-normal text-neutral-500">(Asignación Global)</span>
                      </label>
                      <select
                        value={nuevaCarreraId}
                        onChange={(e) => {
                          const cid = e.target.value
                          setNuevaCarreraId(cid)
                          const selCarrera = carreras.find((x) => x.idCarrera === cid)
                          if (selCarrera?.planesEstudio && selCarrera.planesEstudio.length > 0) {
                            setNuevoPlanId(selCarrera.planesEstudio[0].idPlanEstudio)
                          } else {
                            setNuevoPlanId('')
                          }
                        }}
                        className="w-full border border-line bg-surface px-3 py-2 text-xs font-medium text-neutral-800 outline-hidden focus:border-ink focus:bg-white"
                      >
                        <option value="" disabled>-- Selecciona la carrera del postulante --</option>
                        {carreras.map((c) => (
                          <option key={c.idCarrera} value={c.idCarrera}>
                            {c.nombre} {c.facultad?.nombre ? `(${c.facultad.nombre})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Plan de Estudios *
                    </label>
                    <select
                      value={nuevoPlanId}
                      onChange={(e) => setNuevoPlanId(e.target.value)}
                      className="w-full border border-line bg-surface px-3 py-2 text-xs outline-hidden focus:border-ink focus:bg-white"
                    >
                      {(() => {
                        const c = carreras.find((x) => x.idCarrera === nuevaCarreraId)
                        if (!c || !c.planesEstudio || c.planesEstudio.length === 0) {
                          return <option value="">Plan General Automático</option>
                        }
                        return c.planesEstudio.map((p) => (
                          <option key={p.idPlanEstudio} value={p.idPlanEstudio}>
                            {p.nombre}
                          </option>
                        ))
                      })()}
                    </select>
                  </div>
                </div>

                {/* Sección opcional de Programación de Defensa */}
                <div className="border border-line bg-neutral-50/70 p-3.5 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={programarDefensaInmediata}
                      onChange={(e) => setProgramarDefensaInmediata(e.target.checked)}
                      className="h-4 w-4 rounded-xs border-neutral-300 text-crimson focus:ring-crimson"
                    />
                    <span className="text-xs font-semibold text-neutral-800">
                      ¿Habilitar y programar defensa de grado inmediatamente?
                    </span>
                  </label>
                  <p className="text-[11px] text-neutral-500 mt-1 pl-6">
                    Genera la inscripción y agenda de inmediato el examen de grado sin salir de esta pantalla.
                  </p>

                  {programarDefensaInmediata && (
                    <div className="mt-3 pl-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-line/60">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                          Tipo de Defensa *
                        </label>
                        <select
                          value={tipoDefensaNuevo}
                          onChange={(e) => setTipoDefensaNuevo(e.target.value as 'INTERNA' | 'EXTERNA')}
                          className="w-full border border-line bg-white px-2 py-1.5 text-xs outline-hidden focus:border-ink"
                        >
                          <option value="INTERNA">Interna</option>
                          <option value="EXTERNA">Externa</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                          Fecha Defensa *
                        </label>
                        <input
                          type="date"
                          required={programarDefensaInmediata}
                          value={fechaDefensaNuevo}
                          onChange={(e) => setFechaDefensaNuevo(e.target.value)}
                          className="w-full border border-line bg-white px-2 py-1.5 text-xs outline-hidden focus:border-ink"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                          Periodo Académico
                        </label>
                        <input
                          type="text"
                          value={periodoDefensaNuevo}
                          onChange={(e) => setPeriodoDefensaNuevo(e.target.value)}
                          className="w-full border border-line bg-white px-2 py-1.5 text-xs outline-hidden focus:border-ink"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 border-t border-line pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModalNuevoEstudiante(false)}
                    disabled={isInscribiendo}
                    className="border border-line bg-white px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isInscribiendo}
                    className="flex items-center gap-1.5 bg-ink px-5 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 shadow-xs"
                  >
                    {isInscribiendo ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Inscribiendo...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Inscribir Postulante</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMACIÓN DE SOFT DELETE */}
        {estudianteAEliminar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md border border-line bg-white p-6 shadow-2xl">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-6 w-6 shrink-0" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Confirmar Desactivación (Soft Delete)
                </h3>
              </div>

              <p className="mt-3 text-xs text-neutral-600 leading-relaxed">
                ¿Estás seguro de desactivar al estudiante{' '}
                <strong className="text-neutral-900">{estudianteAEliminar.nombreCompleto}</strong> (
                <span className="font-mono">{estudianteAEliminar.carnetEstudiantil}</span>)?
              </p>

              <div className="mt-2 rounded-xs border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800">
                ℹ️ <strong>Conservación Histórica:</strong> La información y los procesos de
                examen de grado asociados no serán eliminados físicamente de la base de datos.
                Podrás reactivarlo en cualquier momento.
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEstudianteAEliminar(null)}
                  disabled={accionEnProgreso}
                  className="border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSoftDelete}
                  disabled={accionEnProgreso}
                  className="border border-red-600 bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {accionEnProgreso ? 'Desactivando...' : 'Sí, desactivar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
