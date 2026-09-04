import { useState, useMemo, useEffect } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { useAuth } from '@/context/AuthContext'
import {
  AlertOctagon,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  FileText,
  Paperclip,
  X,
  Eye,
  Download,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'

export interface CasoEstudio {
  id: string
  titulo: string
  area: string
  carreraId: string
  carreraNombre: string
  contenido: string
  documentoAdjunto?: {
    nombre: string
    tamano: string
  }
  usos: number
  estado: 'DISPONIBLE' | 'EN_USO' | 'AGOTADO' | 'REACTIVADO' | 'INACTIVO'
  fechaIngreso: string
  motivoReactivacion?: string
  fechaReactivacion?: string
  reactivadoPor?: string
}

// Repositorio limpio: sin datos simulados para el entorno de Jefe de Carrera
const CASOS_INICIALES: CasoEstudio[] = []

// Lista de áreas académicas asociadas a la carrera del Jefe de Carrera
const AREAS_SISTEMAS = [
  'Arquitectura de Software',
  'Inteligencia Artificial y Datos',
  'Ciberseguridad y Redes',
  'Bases de Datos',
]

const LOCAL_STORAGE_KEY = 'sgseg_casos_inventario_real_v2'

export default function PaginaCasos() {
  const { user } = useAuth()

  // 1. Estado principal del inventario de casos (sin datos simulados)
  const [casos, setCasos] = useState<CasoEstudio[]>(() => {
    try {
      // Limpiar versiones anteriores con datos falsos
      localStorage.removeItem('sgseg_casos_inventario_v1')
      const guardado = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (guardado) {
        return JSON.parse(guardado)
      }
    } catch {
      // Fallback a repositorio vacío
    }
    return CASOS_INICIALES
  })

  // Sincronizar en localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(casos))
  }, [casos])

  // 2. Filtros de búsqueda
  const [busqueda, setBusqueda] = useState('')
  const [areaFiltro, setAreaFiltro] = useState<string>('TODAS')
  const [estadoFiltro, setEstadoFiltro] = useState<string>('TODOS')

  // 3. Modales
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false)
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false)
  const [modalReactivarAbierto, setModalReactivarAbierto] = useState(false)
  const [casoSeleccionado, setCasoSeleccionado] = useState<CasoEstudio | null>(null)

  // 4. Formulario de Registro de Nuevo Caso (RF-01, RF-02)
  const [codigoInput, setCodigoInput] = useState('')
  const [tituloInput, setTituloInput] = useState('')
  const [areaInput, setAreaInput] = useState(AREAS_SISTEMAS[0])
  const [contenidoInput, setContenidoInput] = useState('')
  const [adjuntoNombre, setAdjuntoNombre] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [alertaExito, setAlertaExito] = useState<string | null>(null)

  // 5. Formulario de Reactivación Excepcional (RF-05)
  const [motivoReactivacion, setMotivoReactivacion] = useState('')
  const [autorizacionCheck, setAutorizacionCheck] = useState(false)
  const [reactivarError, setReactivarError] = useState<string | null>(null)

  // Autogenerar código secuencial al abrir el modal de registro
  const generarSiguienteCodigo = () => {
    const numeros = casos
      .map((c) => {
        const match = c.id.match(/\d+/)
        return match ? parseInt(match[0], 10) : 0
      })
      .filter((n) => !isNaN(n))

    const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 10
    const siguiente = (maxNumero + 1).toString().padStart(3, '0')
    return `CASO-${siguiente}`
  }

  const abrirModalRegistro = () => {
    setCodigoInput(generarSiguienteCodigo())
    setTituloInput('')
    setAreaInput(AREAS_SISTEMAS[0])
    setContenidoInput('')
    setAdjuntoNombre(null)
    setFormError(null)
    setModalRegistroAbierto(true)
  }

  // Guardar nuevo caso de estudio (RF-01, RF-02)
  const handleRegistrarCaso = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const codigoLimpio = codigoInput.trim().toUpperCase()
    const tituloLimpio = tituloInput.trim()
    const contenidoLimpio = contenidoInput.trim()

    if (!codigoLimpio) {
      setFormError('El código del caso es obligatorio.')
      return
    }

    // Validar no duplicidad de código (RF-02)
    const existe = casos.some((c) => c.id.toUpperCase() === codigoLimpio)
    if (existe) {
      setFormError(`El código "${codigoLimpio}" ya se encuentra en uso. Asigne uno diferente.`)
      return
    }

    if (tituloLimpio.length < 10) {
      setFormError('El título del caso debe tener al menos 10 caracteres explicativos.')
      return
    }

    if (contenidoLimpio.length < 30) {
      setFormError('El planteamiento / contenido del caso debe detallarse adecuadamente (mínimo 30 caracteres).')
      return
    }

    const hoy = new Date()
    const fechaFormateada = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`

    const nuevoCaso: CasoEstudio = {
      id: codigoLimpio,
      titulo: tituloLimpio,
      area: areaInput,
      carreraId: user?.carreraId || '1',
      carreraNombre: 'Ingeniería de Sistemas',
      contenido: contenidoLimpio,
      usos: 0,
      estado: 'DISPONIBLE',
      fechaIngreso: fechaFormateada,
      documentoAdjunto: adjuntoNombre
        ? {
            nombre: adjuntoNombre,
            tamano: '1.2 MB',
          }
        : undefined,
    }

    setCasos((prev) => [nuevoCaso, ...prev])
    setModalRegistroAbierto(false)
    setAlertaExito(`¡Caso de estudio "${nuevoCaso.id}" registrado exitosamente en el área de ${nuevoCaso.area}!`)
    setTimeout(() => setAlertaExito(null), 5000)
  }

  // Abrir modal de detalle
  const abrirDetalle = (caso: CasoEstudio) => {
    setCasoSeleccionado(caso)
    setModalDetalleAbierto(true)
  }

  // Abrir modal de reactivación (RF-05)
  const abrirModalReactivar = (caso: CasoEstudio) => {
    setCasoSeleccionado(caso)
    setMotivoReactivacion('')
    setAutorizacionCheck(false)
    setReactivarError(null)
    setModalReactivarAbierto(true)
  }

  // Ejecutar reactivación excepcional (RF-05)
  const handleReactivarCaso = (e: React.FormEvent) => {
    e.preventDefault()
    if (!casoSeleccionado) return

    if (motivoReactivacion.trim().length < 15) {
      setReactivarError('La justificación académica debe ser detallada (mínimo 15 caracteres).')
      return
    }

    if (!autorizacionCheck) {
      setReactivarError('Debe marcar la casilla de confirmación y autorización institucional.')
      return
    }

    const hoy = new Date()
    const fechaFormateada = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`

    setCasos((prev) =>
      prev.map((c) => {
        if (c.id === casoSeleccionado.id) {
          return {
            ...c,
            usos: 0, // Se reinicia para permitir nuevos sorteos
            estado: 'REACTIVADO',
            motivoReactivacion: motivoReactivacion.trim(),
            fechaReactivacion: fechaFormateada,
            reactivadoPor: user?.nombre || 'Jefe de Carrera',
          }
        }
        return c
      })
    )

    setModalReactivarAbierto(false)
    setAlertaExito(`El caso "${casoSeleccionado.id}" ha sido reactivado de forma excepcional para sorteos futuros.`)
    setTimeout(() => setAlertaExito(null), 5000)
  }

  // 6. Cálculo del Stock Crítico por Área (RF-15)
  const UMBRAL_CRITICO = 2
  const analisisStockPorArea = useMemo(() => {
    return AREAS_SISTEMAS.map((area) => {
      const casosArea = casos.filter((c) => c.area === area)
      const disponibles = casosArea.filter((c) => c.usos < 2 && c.estado !== 'AGOTADO').length
      const agotados = casosArea.filter((c) => c.usos >= 2).length
      return {
        area,
        total: casosArea.length,
        disponibles,
        agotados,
        esCritico: disponibles <= UMBRAL_CRITICO,
      }
    })
  }, [casos])

  const areasCriticas = useMemo(() => {
    return analisisStockPorArea.filter((a) => a.esCritico)
  }, [analisisStockPorArea])

  // 7. Filtrado dinámico de casos para la tabla
  const casosFiltrados = useMemo(() => {
    return casos.filter((caso) => {
      // Filtro de búsqueda por texto (código o título)
      const coincideBusqueda =
        busqueda.trim() === '' ||
        caso.id.toLowerCase().includes(busqueda.toLowerCase()) ||
        caso.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        caso.contenido.toLowerCase().includes(busqueda.toLowerCase())

      // Filtro por área académica
      const coincideArea = areaFiltro === 'TODAS' || caso.area === areaFiltro

      // Filtro por estado
      let coincideEstado = true
      if (estadoFiltro === 'DISPONIBLES') {
        coincideEstado = caso.usos === 0 && caso.estado !== 'INACTIVO' && caso.estado !== 'AGOTADO'
      } else if (estadoFiltro === 'EN_USO') {
        coincideEstado = caso.usos === 1 && caso.estado !== 'INACTIVO' && caso.estado !== 'AGOTADO'
      } else if (estadoFiltro === 'INACTIVOS') {
        coincideEstado = caso.usos >= 2 || caso.estado === 'INACTIVO' || caso.estado === 'AGOTADO'
      } else if (estadoFiltro === 'REACTIVADOS') {
        coincideEstado = caso.estado === 'REACTIVADO'
      }

      return coincideBusqueda && coincideArea && coincideEstado
    })
  }, [casos, busqueda, areaFiltro, estadoFiltro])

  // 8. Métricas generales del inventario
  const totalCasos = casos.length
  const totalDisponibles = casos.filter((c) => c.usos === 0 && c.estado !== 'INACTIVO' && c.estado !== 'AGOTADO').length
  const totalEnUso = casos.filter((c) => c.usos === 1 && c.estado !== 'INACTIVO' && c.estado !== 'AGOTADO').length
  const totalInactivos = casos.filter((c) => c.usos >= 2 || c.estado === 'INACTIVO' || c.estado === 'AGOTADO').length

  // Exportar inventario a formato CSV descargable
  const exportarCsv = () => {
    const encabezados = ['Código', 'Título', 'Área', 'Usos', 'Estado', 'Fecha Registro', 'Reactivado']
    const filas = casos.map((c) => [
      `"${c.id}"`,
      `"${c.titulo.replace(/"/g, '""')}"`,
      `"${c.area}"`,
      `${c.usos}/2`,
      `"${c.estado}"`,
      `"${c.fechaIngreso}"`,
      `"${c.motivoReactivacion ? 'SÍ: ' + c.motivoReactivacion.replace(/"/g, '""') : 'NO'}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [encabezados.join(','), ...filas.map((f) => f.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `inventario_casos_grado_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 font-sans">
        {/* Encabezado y Acción Principal */}
        <EncabezadoPagina
          titulo="Gestión de Casos de Estudio"
          descripcion="Inventario académico con control estricto del ciclo de vida (máximo 2 usos por caso). Al alcanzar el tope, el caso queda inactivo automáticamente para garantizar rotación continua en los sorteos."
          accion={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={exportarCsv}
                className="flex items-center gap-2 border border-line bg-white px-3.5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-surface active:scale-95 cursor-pointer"
                title="Exportar inventario activo a CSV"
              >
                <Download className="size-4 text-neutral-500" />
                Exportar CSV
              </button>

              <button
                type="button"
                onClick={abrirModalRegistro}
                className="flex items-center gap-2 bg-crimson px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-crimson/90 active:scale-95 cursor-pointer"
              >
                <Plus className="size-4" />
                Registrar nuevo caso
              </button>
            </div>
          }
        />

        {/* Notificación de Éxito Flotante */}
        {alertaExito && (
          <div className="flex items-center gap-3 border border-emerald-300 bg-emerald-50 px-5 py-3.5 text-emerald-800 text-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{alertaExito}</span>
          </div>
        )}

        {/* Banner de Contexto de Jurisdicción (RNF-02: Aislamiento) */}
        <div className="flex items-center justify-between border-l-4 border-crimson bg-surface px-4 py-2.5 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-crimson" />
            <span>
              <strong>Jurisdicción Académica:</strong> Carrera de <strong>Ingeniería de Sistemas</strong> (Áreas y Casos restringidos a su departamento).
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[11px] text-neutral-400">
            Rol: {user?.rol || 'Jefe de Carrera'}
          </span>
        </div>

        {/* Banner de Estado del Repositorio */}
        {casos.length === 0 ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-blue-200 bg-blue-50/70 p-4 text-blue-900">
            <div className="flex items-start gap-2.5">
              <BookOpen className="size-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Repositorio Inicial de Casos</p>
                <p className="text-xs text-blue-800 mt-0.5">
                  No hay casos registrados actualmente. Comience dando de alta casos de estudio para las áreas de su carrera usando el botón <strong>"Registrar nuevo caso"</strong>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={abrirModalRegistro}
              className="shrink-0 bg-blue-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-800 transition-colors cursor-pointer"
            >
              + Registrar Primer Caso
            </button>
          </div>
        ) : areasCriticas.length > 0 ? (
          <section
            role="alert"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-crimson bg-red-50 p-4 border border-red-200"
          >
            <div className="flex items-start gap-3 text-red-900">
              <AlertOctagon className="mt-0.5 size-5 shrink-0 text-crimson" />
              <div>
                <p className="text-sm font-bold tracking-tight">
                  ALERTA DE STOCK CRÍTICO EN {areasCriticas.length} {areasCriticas.length === 1 ? 'ÁREA' : 'ÁREAS'} ACADÉMICAS (RF-15)
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Se requiere la reposición inmediata de casos antes de la apertura del rol de sorteos. Áreas con disponibilidad vulnerable:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {areasCriticas.map((a) => (
                    <span
                      key={a.area}
                      className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs font-semibold text-crimson border border-red-300 shadow-2xs"
                    >
                      <span>{a.area}:</span>
                      <span className="font-mono">{a.disponibles} disp. ({a.agotados} inactivos)</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={abrirModalRegistro}
              className="shrink-0 bg-crimson px-3.5 py-2 text-xs font-bold text-white uppercase tracking-wider hover:bg-crimson/90 transition-colors cursor-pointer"
            >
              Reponer Caso
            </button>
          </section>
        ) : (
          <div className="flex items-center gap-2.5 border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>
              <strong>Inventario Saludable:</strong> Todas las áreas académicas de la carrera cuentan con margen suficiente de casos disponibles para sorteo.
            </span>
          </div>
        )}

        {/* Resumen de Indicadores Clave (KPIs de Casos) */}
        <section className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          <div className="bg-white px-5 py-4">
            <div className="flex items-center justify-between text-neutral-500">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase">Total Casos</p>
              <BookOpen className="size-4 text-neutral-400" />
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">{totalCasos}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">En el repositorio de la carrera</p>
          </div>

          <div className="bg-white px-5 py-4">
            <div className="flex items-center justify-between text-neutral-500">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase">Disponibles (0/2)</p>
              <span className="size-2 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-700">{totalDisponibles}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Listos para el próximo sorteo</p>
          </div>

          <div className="bg-white px-5 py-4">
            <div className="flex items-center justify-between text-neutral-500">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase">En Uso (1/2)</p>
              <span className="size-2 rounded-full bg-amber-500" />
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-amber-700">{totalEnUso}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Último uso restante</p>
          </div>

          <div className="bg-white px-5 py-4">
            <div className="flex items-center justify-between text-neutral-500">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase">Inactivos (2/2)</p>
              <span className="size-2 rounded-full bg-crimson" />
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-crimson">{totalInactivos}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Inactivos por límite de 2 usos (RF-04)</p>
          </div>
        </section>

        {/* Barra de Filtros y Búsqueda Interactiva (RF-19) */}
        <section className="flex flex-col gap-3 rounded-none border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por código (ej. CASO-014), título o palabra clave..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-line bg-surface py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-crimson focus:bg-white focus:outline-none"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filtro por Área Académica */}
            <div className="flex items-center gap-1.5">
              <Filter className="size-3.5 text-neutral-400" />
              <select
                value={areaFiltro}
                onChange={(e) => setAreaFiltro(e.target.value)}
                className="border border-line bg-surface px-2.5 py-2 text-xs font-medium text-neutral-700 focus:border-crimson focus:outline-none cursor-pointer"
              >
                <option value="TODAS">Todas las áreas ({AREAS_SISTEMAS.length})</option>
                {AREAS_SISTEMAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Estado de Uso */}
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="border border-line bg-surface px-2.5 py-2 text-xs font-medium text-neutral-700 focus:border-crimson focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los estados ({casos.length})</option>
              <option value="DISPONIBLES">Disponibles (0/2)</option>
              <option value="EN_USO">En Uso (1/2)</option>
              <option value="INACTIVOS">Inactivos (por límite de 2 usos)</option>
              <option value="REACTIVADOS">Reactivados</option>
            </select>

            {(busqueda || areaFiltro !== 'TODAS' || estadoFiltro !== 'TODOS') && (
              <button
                type="button"
                onClick={() => {
                  setBusqueda('')
                  setAreaFiltro('TODAS')
                  setEstadoFiltro('TODOS')
                }}
                className="text-xs text-crimson hover:underline px-2 py-1"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </section>

        {/* TABLA DE INVENTARIO DE CASOS DE ESTUDIO */}
        <section className="border border-line bg-white shadow-2xs">
          <header className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-neutral-900">
                Catálogo de Casos de Estudio de Grado
              </h2>
              <p className="text-xs text-neutral-500">
                Mostrando {casosFiltrados.length} de {casos.length} casos registrados en la carrera
              </p>
            </div>
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
              Límite reglamentario: 2 defensas
            </span>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="border-b border-line bg-white text-[11px] font-bold tracking-wider text-neutral-500 uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Código</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Caso de Estudio</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Área Académica</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Ingreso</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Adjunto</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-center">Desgaste / Usos</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {casosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                      <BookOpen className="size-8 mx-auto mb-2 text-neutral-300" />
                      <p className="text-sm font-bold text-neutral-800">
                        {casos.length === 0
                          ? 'No hay casos de estudio en el inventario'
                          : 'No se encontraron casos con los filtros aplicados'}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                        {casos.length === 0
                          ? 'El repositorio está listo y limpio. Registre su primer caso de estudio para comenzar la gestión de su carrera.'
                          : 'Intente con otros términos de búsqueda o ajuste los filtros de área o estado.'}
                      </p>
                      {casos.length === 0 && (
                        <button
                          type="button"
                          onClick={abrirModalRegistro}
                          className="mt-4 inline-flex items-center gap-2 bg-crimson px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-crimson/90 cursor-pointer"
                        >
                          <Plus className="size-4" />
                          Registrar Primer Caso
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  casosFiltrados.map((caso) => {
                    const estaInactivo = caso.usos >= 2 || caso.estado === 'INACTIVO' || caso.estado === 'AGOTADO'
                    const esReactivado = caso.estado === 'REACTIVADO'

                    return (
                      <tr key={caso.id} className="transition-colors hover:bg-neutral-50/70">
                        {/* Código */}
                        <td className="px-4 py-3.5 font-mono font-bold text-neutral-700 whitespace-nowrap">
                          <span className="inline-block rounded bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-800 border border-neutral-200">
                            {caso.id}
                          </span>
                        </td>

                        {/* Título y extracto */}
                        <td className="px-4 py-3.5 max-w-sm">
                          <button
                            type="button"
                            onClick={() => abrirDetalle(caso)}
                            className="text-left font-semibold text-neutral-900 hover:text-crimson transition-colors line-clamp-1 cursor-pointer"
                          >
                            {caso.titulo}
                          </button>
                          <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                            {caso.contenido}
                          </p>
                        </td>

                        {/* Área Académica */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-700">
                            <Layers className="size-3 text-neutral-400" />
                            {caso.area}
                          </span>
                        </td>

                        {/* Fecha de Ingreso */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-neutral-500 font-mono text-[11px]">
                          {caso.fechaIngreso}
                        </td>

                        {/* Adjunto */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {caso.documentoAdjunto ? (
                            <button
                              type="button"
                              onClick={() => abrirDetalle(caso)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-crimson"
                              title={caso.documentoAdjunto.nombre}
                            >
                              <Paperclip className="size-3.5 text-neutral-400" />
                              <span className="max-w-[100px] truncate">{caso.documentoAdjunto.nombre}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-neutral-300 italic">Sin adjunto</span>
                          )}
                        </td>

                        {/* Badge de Usos (0/2, 1/2, Inactivo 2/2, Reactivado) */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          {esReactivado ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 border border-blue-200">
                              <Sparkles className="size-3 text-blue-600" />
                              Reactivado ({caso.usos}/2)
                            </span>
                          ) : estaInactivo ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-crimson border border-red-200"
                              title="Inactivo automáticamente por límite reglamentario de 2 usos (RF-04)"
                            >
                              <AlertOctagon className="size-3 text-crimson" />
                              Inactivo (2/2)
                            </span>
                          ) : caso.usos === 1 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                              <AlertTriangle className="size-3 text-amber-600" />
                              En Uso (1/2)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="size-3 text-emerald-600" />
                              Disponible (0/2)
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => abrirDetalle(caso)}
                              className="inline-flex items-center gap-1 border border-line bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-surface hover:text-black transition-colors"
                              title="Ver planteamiento completo del caso"
                            >
                              <Eye className="size-3.5 text-neutral-500" />
                              Ver
                            </button>

                            {/* Botón de Reactivación Excepcional (RF-05) */}
                            {estaInactivo && (
                              <button
                                type="button"
                                onClick={() => abrirModalReactivar(caso)}
                                className="inline-flex items-center gap-1 border border-red-300 bg-red-50 px-2 py-1 text-[11px] font-bold text-crimson hover:bg-crimson hover:text-white transition-colors"
                                title="Reactivar caso inactivo bajo justificación de Jefe de Carrera (RF-05)"
                              >
                                <RotateCcw className="size-3" />
                                Reactivar
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
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* MODAL 1: REGISTRO DE NUEVO CASO DE ESTUDIO (RF-01, RF-02)                 */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {modalRegistroAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-2xl border border-line bg-white shadow-2xl animate-in zoom-in-95">
              <header className="flex items-center justify-between border-b border-line px-6 py-4 bg-surface">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded bg-crimson text-white">
                    <Plus className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">Registrar Nuevo Caso de Estudio</h3>
                    <p className="text-xs text-neutral-500">Módulo de Ingreso Académico · Límite inicial de 0/2 usos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalRegistroAbierto(false)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <X className="size-5" />
                </button>
              </header>

              <form onSubmit={handleRegistrarCaso} className="p-6 space-y-4 text-xs">
                {formError && (
                  <div className="flex items-center gap-2 border border-red-300 bg-red-50 p-3 text-red-700 rounded-none">
                    <AlertTriangle className="size-4 shrink-0 text-red-600" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Código único del caso (RF-02) */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Código Único del Caso (RF-02) <span className="text-crimson">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={codigoInput}
                        onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                        placeholder="CASO-093"
                        className="w-full border border-line bg-surface p-2 font-mono text-xs font-bold uppercase focus:border-crimson focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setCodigoInput(generarSiguienteCodigo())}
                        className="shrink-0 border border-line bg-surface px-2 py-1 text-[11px] font-medium text-neutral-600 hover:bg-white"
                        title="Autogenerar siguiente código consecutivo"
                      >
                        Generar
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">Identificador único irrepetible en la base de datos.</p>
                  </div>

                  {/* Área Académica */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Área Académica de la Carrera <span className="text-crimson">*</span>
                    </label>
                    <select
                      value={areaInput}
                      onChange={(e) => setAreaInput(e.target.value)}
                      className="w-full border border-line bg-surface p-2 text-xs font-medium focus:border-crimson focus:bg-white focus:outline-none cursor-pointer"
                    >
                      {AREAS_SISTEMAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-neutral-400 mt-1">Área sobre la cual el estudiante será evaluado.</p>
                  </div>
                </div>

                {/* Título del caso */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Título o Tema Principal del Caso <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={250}
                    value={tituloInput}
                    onChange={(e) => setTituloInput(e.target.value)}
                    placeholder="Ej. Diseño e implementación de arquitectura reactiva en microservicios..."
                    className="w-full border border-line bg-surface p-2 text-xs focus:border-crimson focus:bg-white focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>Nombre formal con el que figurará en el acta de sorteo.</span>
                    <span>{tituloInput.length}/250</span>
                  </div>
                </div>

                {/* Contenido / Planteamiento del Caso */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Planteamiento y Alcance del Caso <span className="text-crimson">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contenidoInput}
                    onChange={(e) => setContenidoInput(e.target.value)}
                    placeholder="Describa la problemática, requerimientos técnicos, restricciones y entregables esperados que el postulante deberá resolver durante su defensa..."
                    className="w-full border border-line bg-surface p-2 text-xs focus:border-crimson focus:bg-white focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Este texto será entregado al estudiante tras el sorteo oficial.
                  </p>
                </div>

                {/* Carga de Documento Adjunto (Opcional) */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Documento de Soporte o Anexo (PDF / Word)
                  </label>
                  <div className="border-2 border-dashed border-line bg-surface/50 p-4 text-center hover:bg-surface transition-colors">
                    <Paperclip className="size-5 mx-auto text-neutral-400 mb-1" />
                    {adjuntoNombre ? (
                      <div className="flex items-center justify-center gap-2 text-xs font-medium text-neutral-800">
                        <span>Archivo seleccionado: <strong>{adjuntoNombre}</strong></span>
                        <button
                          type="button"
                          onClick={() => setAdjuntoNombre(null)}
                          className="text-crimson hover:underline text-[11px]"
                        >
                          (Quitar)
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-neutral-600 font-medium">Haga clic o arrastre el archivo anexo aquí</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Formatos permitidos: PDF, DOCX (Máx. 10 MB)</p>
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAdjuntoNombre(e.target.files[0].name)
                            }
                          }}
                          className="mt-2 text-xs text-neutral-500 file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:font-semibold file:bg-neutral-200 file:text-neutral-700 hover:file:bg-neutral-300"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setModalRegistroAbierto(false)}
                    className="border border-line px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-surface"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-crimson px-5 py-2 text-xs font-bold text-white hover:bg-crimson/90 shadow-sm"
                  >
                    <Plus className="size-4" />
                    Guardar Caso de Estudio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* MODAL 2: REACTIVACIÓN EXCEPCIONAL DE CASO AGOTADO (RF-05)                  */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {modalReactivarAbierto && casoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-lg border border-line bg-white shadow-2xl animate-in zoom-in-95">
              <header className="flex items-center justify-between border-b border-line px-6 py-4 bg-red-50">
                <div className="flex items-center gap-2 text-crimson">
                  <RotateCcw className="size-5" />
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">Reactivación Excepcional de Caso (RF-05)</h3>
                    <p className="text-xs text-red-700">Autorización institucional de reutilización extraordinaria</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalReactivarAbierto(false)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <X className="size-5" />
                </button>
              </header>

              <form onSubmit={handleReactivarCaso} className="p-6 space-y-4 text-xs">
                {reactivarError && (
                  <div className="flex items-center gap-2 border border-red-300 bg-red-50 p-3 text-red-700">
                    <AlertTriangle className="size-4 shrink-0 text-red-600" />
                    <span>{reactivarError}</span>
                  </div>
                )}

                <div className="bg-surface p-3.5 border border-line">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Caso Seleccionado</p>
                  <p className="font-mono font-bold text-sm text-neutral-900 mt-0.5">{casoSeleccionado.id}</p>
                  <p className="text-xs text-neutral-700 font-medium mt-1">{casoSeleccionado.titulo}</p>
                  <p className="text-[11px] text-neutral-500 mt-1">Área: {casoSeleccionado.area} · Usos acumulados: 2/2</p>
                </div>

                <div className="border border-amber-200 bg-amber-50 p-3 text-amber-900 flex items-start gap-2">
                  <ShieldAlert className="size-4 shrink-0 text-amber-600 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Advertencia de Auditoría:</strong> El reglamento establece que los casos que alcanzaron 2 usos deben retirarse. La reactivación solo procede bajo circunstancias excepcionales aprobadas por la Dirección de Carrera.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Motivo / Justificación Académica Obligatoria <span className="text-crimson">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={motivoReactivacion}
                    onChange={(e) => setMotivoReactivacion(e.target.value)}
                    placeholder="Ej. Caso reactivado por solicitud del Consejo de Carrera ante stock crítico en el área de especialización..."
                    className="w-full border border-line bg-surface p-2 text-xs focus:border-crimson focus:bg-white focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>Mínimo 15 caracteres. Quedará grabado en la bitácora de auditoría.</span>
                    <span>{motivoReactivacion.length} caracteres</span>
                  </div>
                </div>

                <label className="flex items-start gap-2 border border-line p-3 bg-surface/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autorizacionCheck}
                    onChange={(e) => setAutorizacionCheck(e.target.checked)}
                    className="mt-0.5 accent-crimson size-4"
                  />
                  <span className="text-[11px] text-neutral-700">
                    Confirmo como <strong>{user?.nombre || 'Jefe de Carrera'}</strong> que esta reactivación cumple con las normativas académicas vigentes.
                  </span>
                </label>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setModalReactivarAbierto(false)}
                    className="border border-line px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-surface"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-crimson px-5 py-2 text-xs font-bold text-white hover:bg-crimson/90 shadow-sm"
                  >
                    <RotateCcw className="size-4" />
                    Autorizar Reactivación
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {/* MODAL 3: DETALLE Y LECTURA COMPLETA DEL CASO                                */}
        {/* ═══════════════════════════════════════════════════════════════════════════ */}
        {modalDetalleAbierto && casoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-2xl border border-line bg-white shadow-2xl animate-in zoom-in-95">
              <header className="flex items-center justify-between border-b border-line px-6 py-4 bg-surface">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-5 text-crimson" />
                  <div>
                    <span className="font-mono text-xs font-bold text-crimson bg-red-100 px-2 py-0.5 rounded">
                      {casoSeleccionado.id}
                    </span>
                    <span className="text-xs text-neutral-500 ml-2">Área: {casoSeleccionado.area}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalDetalleAbierto(false)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <X className="size-5" />
                </button>
              </header>

              <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
                <div>
                  <h4 className="text-base font-bold text-neutral-900 leading-snug">
                    {casoSeleccionado.titulo}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-neutral-500">
                    <span>Fecha de registro: <strong>{casoSeleccionado.fechaIngreso}</strong></span>
                    <span>•</span>
                    <span>Carrera: <strong>{casoSeleccionado.carreraNombre}</strong></span>
                    <span>•</span>
                    <span>
                      Usos acumulados: <strong>{casoSeleccionado.usos} de 2</strong>
                    </span>
                  </div>
                </div>

                <div className="border border-line bg-surface p-4">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Planteamiento Oficial del Caso de Grado
                  </h5>
                  <p className="text-xs text-neutral-800 leading-relaxed whitespace-pre-line font-serif text-justify">
                    {casoSeleccionado.contenido}
                  </p>
                </div>

                {casoSeleccionado.documentoAdjunto && (
                  <div className="flex items-center justify-between border border-line p-3 bg-neutral-50">
                    <div className="flex items-center gap-2.5">
                      <FileText className="size-5 text-crimson" />
                      <div>
                        <p className="font-medium text-neutral-900">{casoSeleccionado.documentoAdjunto.nombre}</p>
                        <p className="text-[10px] text-neutral-400">Anexo técnico ({casoSeleccionado.documentoAdjunto.tamano})</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Descargando documento de prueba: ${casoSeleccionado.documentoAdjunto?.nombre}`)}
                      className="flex items-center gap-1.5 border border-line bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      <Download className="size-3.5" />
                      Descargar
                    </button>
                  </div>
                )}

                {casoSeleccionado.motivoReactivacion && (
                  <div className="border border-blue-200 bg-blue-50 p-3.5 text-blue-900">
                    <p className="font-bold text-[11px] flex items-center gap-1">
                      <RotateCcw className="size-3.5 text-blue-700" />
                      Registro de Reactivación Excepcional (RF-05)
                    </p>
                    <p className="text-xs mt-1 italic">"{casoSeleccionado.motivoReactivacion}"</p>
                    <p className="text-[10px] text-blue-700 mt-2">
                      Autorizado por: {casoSeleccionado.reactivadoPor} · Fecha: {casoSeleccionado.fechaReactivacion}
                    </p>
                  </div>
                )}
              </div>

              <footer className="flex items-center justify-between border-t border-line px-6 py-3.5 bg-surface">
                <span className="text-[11px] text-neutral-400">
                  {casoSeleccionado.usos >= 2 ? '⚠️ Retirado del sorteo' : '✓ Habilitado para sorteo'}
                </span>
                <button
                  type="button"
                  onClick={() => setModalDetalleAbierto(false)}
                  className="bg-neutral-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-neutral-800"
                >
                  Cerrar
                </button>
              </footer>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
