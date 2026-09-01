import { useState, useEffect, useRef, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { useAuth } from '../context/AuthContext'
import api from '@/lib/api'
import {
  X,
  UserPlus,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  FileCheck,
} from 'lucide-react'

export interface Estudiante {
  id?: string
  registro: string
  nombre: string
  ci?: string
  correo?: string
  carrera: string
  pensum: string
  estado: string
  createdAt?: string
}

const filtros = ['Todos los pensum', 'Pensum 2019', 'Pensum 2022', 'Pensum 2024']

const estilosEstado: Record<string, string> = {
  Sorteado: 'bg-ink text-white',
  Pendiente: 'bg-surface text-neutral-600 ring-1 ring-line',
  Observado: 'bg-crimson text-white',
}

export default function PaginaEstudiantes() {
  const { user } = useAuth()
  const [listaEstudiantes, setListaEstudiantes] = useState<Estudiante[]>([])
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(true)
  const [filtroSeleccionado, setFiltroSeleccionado] = useState('Todos los pensum')

  // Control de modales
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false)

  // Campos del formulario individual
  const [formRegistro, setFormRegistro] = useState('')
  const [formNombre, setFormNombre] = useState('')
  const [formCi, setFormCi] = useState('')
  const [formCorreo, setFormCorreo] = useState('')
  const [formCarrera, setFormCarrera] = useState('Sistemas')
  const [formPensum, setFormPensum] = useState('2024')
  const [formEstado, setFormEstado] = useState('Pendiente')
  const [guardandoEstudiante, setGuardandoEstudiante] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null)

  // Estados para Importación Excel / Dropzone
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [progresoSubida, setProgresoSubida] = useState<number>(0)
  const [estadoImportacion, setEstadoImportacion] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [errorImportacion, setErrorImportacion] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Roles permitidos: Coordinador General, Jefe de Carrera, Vicerrectorado
  const tienePermiso = user && ['Coordinador General', 'Jefe de Carrera', 'Vicerrectorado'].includes(user.rol)

  // Carga inicial y obtención de estudiantes desde la API real (GET /estudiantes)
  const cargarEstudiantes = useCallback(async () => {
    try {
      setCargandoEstudiantes(true)
      const res = await api.get('/estudiantes')
      if (Array.isArray(res.data)) {
        setListaEstudiantes(res.data)
      } else if (res.data?.estudiantes && Array.isArray(res.data.estudiantes)) {
        setListaEstudiantes(res.data.estudiantes)
      }
    } catch (err: any) {
      console.error('Error al obtener estudiantes:', err)
      // Mantener lista vacía o previa en caso de fallo
    } finally {
      setCargandoEstudiantes(false)
    }
  }, [])

  useEffect(() => {
    cargarEstudiantes()
  }, [cargarEstudiantes])

  // Agregar estudiante individual conectando con API (POST /estudiantes)
  const handleAgregarEstudiante = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorFormulario(null)
    setGuardandoEstudiante(true)

    const nuevoEstudiante = {
      registro: formRegistro.trim(),
      nombre: formNombre.trim(),
      ci: formCi.trim() || undefined,
      correo: formCorreo.trim() || undefined,
      carrera: formCarrera,
      pensum: formPensum,
      estado: formEstado,
    }

    try {
      await api.post('/estudiantes', nuevoEstudiante)
      // Refrescar lista desde la API
      await cargarEstudiantes()

      // Limpiar formulario y cerrar modal
      setFormRegistro('')
      setFormNombre('')
      setFormCi('')
      setFormCorreo('')
      setFormCarrera('Sistemas')
      setFormPensum('2024')
      setFormEstado('Pendiente')
      setModalAbierto(false)
    } catch (err: any) {
      console.error('Error al registrar estudiante:', err)
      const msg = err.response?.data?.message || 'Error al registrar estudiante en el servidor.'
      setErrorFormulario(msg)
    } finally {
      setGuardandoEstudiante(false)
    }
  }

  // Manejo de Dropzone (Drag & Drop)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Solo desactivar si salimos del contenedor raíz del dropzone
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      validarYSeleccionarArchivo(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      validarYSeleccionarArchivo(files[0])
    }
  }

  const validarYSeleccionarArchivo = (file: File) => {
    setErrorImportacion(null)
    setMensajeExito(null)
    setEstadoImportacion('idle')
    setProgresoSubida(0)

    const extensionValida = /\.(xlsx|xls|csv)$/i.test(file.name)
    if (!extensionValida) {
      setErrorImportacion('Formato no soportado. Por favor sube un archivo Excel (.xlsx, .xls) o CSV (.csv).')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorImportacion('El archivo es demasiado grande. El límite máximo es de 15 MB.')
      return
    }

    setArchivoSeleccionado(file)
  }

  // Subida del archivo Excel mediante FormData (api.post('/estudiantes/importar', formData))
  const handleSubirArchivo = async () => {
    if (!archivoSeleccionado) return

    setEstadoImportacion('uploading')
    setErrorImportacion(null)
    setMensajeExito(null)
    setProgresoSubida(0)

    const formData = new FormData()
    formData.append('file', archivoSeleccionado)

    try {
      const response = await api.post('/estudiantes/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setProgresoSubida(Math.min(percent, 90))
          }
        },
      })

      setProgresoSubida(100)
      setEstadoImportacion('processing')

      // Pequeña pausa visual para mostrar el estado de procesamiento
      setTimeout(async () => {
        setEstadoImportacion('success')
        const total = response.data?.totalImportados ?? 'Varios'
        setMensajeExito(
          response.data?.message || `¡Padrón importado con éxito! Se procesaron ${total} estudiantes.`
        )

        // Refrescar inmediatamente la tabla con el padrón importado
        await cargarEstudiantes()
      }, 500)
    } catch (err: any) {
      console.error('Error al importar archivo:', err)
      setEstadoImportacion('error')
      const msg =
        err.response?.data?.message ||
        'Ocurrió un error al subir y procesar el archivo Excel. Verifica el formato de columnas.'
      setErrorImportacion(msg)
    }
  }

  // Descarga de Plantilla de Ejemplo
  const descargarPlantilla = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'registro,nombre,ci,correo,carrera,pensum,estado\n' +
      '2023-11223,Alejandro Sandoval,8473921 SC,alejandro.sandoval@utepsa.edu.bo,Sistemas,2024,Pendiente\n' +
      '2023-44556,Laura Chacon,9182736 SC,laura.chacon@utepsa.edu.bo,Marketing,2022,Pendiente\n' +
      '2023-77889,Mauricio Vargas,7382910 SC,mauricio.vargas@utepsa.edu.bo,Contaduría,2019,Observado\n' +
      '2024-00122,Valeria Menacho,8291029 SC,valeria.menacho@utepsa.edu.bo,Ingeniería Comercial,2024,Pendiente'

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'plantilla_padron_estudiantes.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Generar y cargar datos de prueba rápidos
  const cargarDatosPruebaDemo = () => {
    const csvContent =
      'registro,nombre,ci,correo,carrera,pensum,estado\n' +
      '2024-90011,Sofia Beatriz Morales,9384920 SC,sofia.morales@utepsa.edu.bo,Sistemas,2024,Pendiente\n' +
      '2024-90022,Carlos Eduardo Justiniano,8473821 SC,carlos.justiniano@utepsa.edu.bo,Marketing,2022,Pendiente\n' +
      '2024-90033,Daniela Aguilera Ribera,7394812 SC,daniela.aguilera@utepsa.edu.bo,Administración,2019,Sorteado\n' +
      '2024-90044,Mateo Fernando Roca,8172930 SC,mateo.roca@utepsa.edu.bo,Contaduría,2024,Pendiente\n' +
      '2024-90055,Gabriela Suarez Melgar,9201948 SC,gabriela.suarez@utepsa.edu.bo,Ingeniería Comercial,2022,Observado'

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const demoFile = new File([blob], 'padron_estudiantes_demo_2026.csv', { type: 'text/csv' })
    validarYSeleccionarArchivo(demoFile)
  }

  const cerrarModalImportacion = () => {
    setModalImportarAbierto(false)
    setArchivoSeleccionado(null)
    setErrorImportacion(null)
    setMensajeExito(null)
    setEstadoImportacion('idle')
    setProgresoSubida(0)
  }

  // Filtrado de estudiantes
  const estudiantesFiltrados = listaEstudiantes.filter((estudiante) => {
    if (filtroSeleccionado === 'Todos los pensum') return true
    const anioPensum = filtroSeleccionado.replace('Pensum ', '')
    return estudiante.pensum === anioPensum
  })

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <EncabezadoPagina
          titulo="Estudiantes"
          descripcion="Padrón de postulantes al examen de grado con su estado de habilitación, carrera y plan de estudios vigente."
          accion={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => cargarEstudiantes()}
                title="Refrescar lista"
                className="flex items-center justify-center border border-line bg-white p-2.5 text-neutral-600 transition-colors hover:border-ink hover:text-ink"
              >
                <RefreshCw className={`size-4 ${cargandoEstudiantes ? 'animate-spin' : ''}`} />
              </button>

              {tienePermiso && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorFormulario(null)
                      setModalAbierto(true)
                    }}
                    className="flex items-center gap-2 bg-[#c8102e] text-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#a50d26]"
                  >
                    <UserPlus className="size-4" />
                    Agregar estudiante
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorImportacion(null)
                      setMensajeExito(null)
                      setEstadoImportacion('idle')
                      setProgresoSubida(0)
                      setModalImportarAbierto(true)
                    }}
                    className="flex items-center gap-2 border border-ink bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-ink hover:text-white"
                  >
                    <Upload className="size-4" />
                    Importar padrón
                  </button>
                </>
              )}
            </div>
          }
        />

        {/* Filtros de Pensum */}
        <div className="flex flex-wrap items-center gap-2">
          {filtros.map((filtro) => (
            <button
              key={filtro}
              type="button"
              onClick={() => setFiltroSeleccionado(filtro)}
              aria-pressed={filtroSeleccionado === filtro}
              className={`border px-3.5 py-2 text-xs font-medium transition-colors ${
                filtroSeleccionado === filtro
                  ? 'border-ink bg-ink text-white'
                  : 'border-line bg-white text-neutral-600 hover:border-ink'
              }`}
            >
              {filtro}
            </button>
          ))}
        </div>

        {/* Tabla de Estudiantes con API en vivo */}
        <section className="border border-line bg-white">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight">Padrón de Estudiantes Postulantes</h2>
              {cargandoEstudiantes && (
                <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <Loader2 className="size-3 animate-spin text-[#c8102e]" />
                  Actualizando...
                </span>
              )}
            </div>
            <span className="text-xs text-neutral-500">{estudiantesFiltrados.length} registros</span>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-surface">
                <tr className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Registro
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Estudiante
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Carrera
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Pensum
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {cargandoEstudiantes && listaEstudiantes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-neutral-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-6 animate-spin text-[#c8102e]" />
                        <span>Cargando padrón desde la base de datos...</span>
                      </div>
                    </td>
                  </tr>
                ) : estudiantesFiltrados.length > 0 ? (
                  estudiantesFiltrados.map((estudiante, idx) => (
                    <tr
                      key={`${estudiante.registro}-${idx}`}
                      className="transition-colors hover:bg-neutral-50/70"
                    >
                      <td className="px-5 py-4 font-mono text-[11px] tracking-wider font-semibold text-neutral-700">
                        {estudiante.registro}
                      </td>
                      <td className="px-5 py-4 font-medium text-neutral-900">
                        <div>{estudiante.nombre}</div>
                        {estudiante.correo && (
                          <div className="text-[11px] text-neutral-400">{estudiante.correo}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-neutral-600">{estudiante.carrera}</td>
                      <td className="px-5 py-4 text-neutral-500">
                        <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-mono">
                          {estudiante.pensum}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[11px] font-medium ${
                            estilosEstado[estudiante.estado] || 'bg-surface text-neutral-600 ring-1 ring-line'
                          }`}
                        >
                          {estudiante.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-neutral-400">
                      No se encontraron estudiantes para este filtro. Importa un archivo Excel o registra nuevos
                      alumnos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal Agregar Estudiante Individual */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-line shadow-2xl p-6 relative">
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-ink"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-base font-semibold tracking-tight mb-4">Agregar Nuevo Estudiante</h3>

            {errorFormulario && (
              <div className="mb-4 flex items-start gap-2.5 bg-crimson/10 border border-crimson/20 p-3 text-xs text-crimson">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorFormulario}</span>
              </div>
            )}

            <form onSubmit={handleAgregarEstudiante} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-600">Registro Estudiantil *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 2023-01984"
                  value={formRegistro}
                  onChange={(e) => setFormRegistro(e.target.value)}
                  className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-600">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez Gómez"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-neutral-600">C.I.</label>
                  <input
                    type="text"
                    placeholder="Ej: 8976543 SC"
                    value={formCi}
                    onChange={(e) => setFormCi(e.target.value)}
                    className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-neutral-600">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="Ej: juan.perez@utepsa.edu.bo"
                    value={formCorreo}
                    onChange={(e) => setFormCorreo(e.target.value)}
                    className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-neutral-600">Carrera</label>
                  <select
                    value={formCarrera}
                    onChange={(e) => setFormCarrera(e.target.value)}
                    className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                  >
                    <option value="Sistemas">Sistemas</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Administración">Administración</option>
                    <option value="Contaduría">Contaduría</option>
                    <option value="Ingeniería Comercial">Ingeniería Comercial</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-neutral-600">Pensum</label>
                  <select
                    value={formPensum}
                    onChange={(e) => setFormPensum(e.target.value)}
                    className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                  >
                    <option value="2019">Pensum 2019</option>
                    <option value="2022">Pensum 2022</option>
                    <option value="2024">Pensum 2024</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-600">Estado de Habilitación</label>
                <select
                  value={formEstado}
                  onChange={(e) => setFormEstado(e.target.value)}
                  className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Sorteado">Sorteado</option>
                  <option value="Observado">Observado</option>
                </select>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="border border-line px-4 py-2 text-sm font-medium hover:bg-surface"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEstudiante}
                  className="flex items-center gap-2 bg-[#c8102e] text-white px-4 py-2 text-sm font-medium hover:bg-[#a50d26] disabled:opacity-50"
                >
                  {guardandoEstudiante && <Loader2 className="size-4 animate-spin" />}
                  {guardandoEstudiante ? 'Guardando...' : 'Registrar Estudiante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Interactivo de Importación con Dropzone y Barra de Progreso */}
      {modalImportarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-line shadow-2xl p-6 relative">
            <button
              onClick={cerrarModalImportacion}
              className="absolute top-4 right-4 text-neutral-400 hover:text-ink transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <FileSpreadsheet className="size-5 text-[#c8102e]" />
              <h3 className="text-base font-semibold tracking-tight">Importar Padrón de Estudiantes</h3>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Arrastra o selecciona un archivo Excel (<code>.xlsx</code>, <code>.xls</code>) o <code>.csv</code> con el
              listado de alumnos postulantes.
            </p>

            {/* Mensajes de Alerta / Estado */}
            {errorImportacion && (
              <div className="mb-4 flex items-start gap-2.5 bg-crimson/10 border border-crimson/20 p-3 text-xs text-crimson animate-in fade-in">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorImportacion}</span>
              </div>
            )}

            {mensajeExito && (
              <div className="mb-4 flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <p className="font-semibold">{mensajeExito}</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Los cambios ya se encuentran reflejados en la tabla del padrón.
                  </p>
                </div>
              </div>
            )}

            {/* Dropzone Interactivo */}
            {!archivoSeleccionado ? (
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-[#c8102e] bg-red-50/60 scale-[1.01]'
                    : 'border-line bg-surface/50 hover:border-ink hover:bg-surface'
                }`}
              >
                <div
                  className={`rounded-full p-3 transition-colors ${
                    isDragging ? 'bg-red-100 text-[#c8102e]' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  <Upload className={`size-6 ${isDragging ? 'animate-bounce' : ''}`} />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-neutral-800 block">
                    {isDragging ? 'Suelta el archivo aquí...' : 'Arrastra tu archivo Excel aquí'}
                  </span>
                  <span className="text-xs text-neutral-500 mt-1 block">
                    o <span className="text-[#c8102e] font-medium underline">haz clic para examinar tu equipo</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                  <span>Formatos soportados:</span>
                  <span className="bg-neutral-200/80 px-1.5 py-0.5 rounded text-neutral-700 font-semibold">.XLSX</span>
                  <span className="bg-neutral-200/80 px-1.5 py-0.5 rounded text-neutral-700 font-semibold">.XLS</span>
                  <span className="bg-neutral-200/80 px-1.5 py-0.5 rounded text-neutral-700 font-semibold">.CSV</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-line bg-surface p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 text-[#c8102e] p-2.5 rounded">
                      <FileCheck className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800 truncate max-w-[280px]">
                        {archivoSeleccionado.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {(archivoSeleccionado.size / 1024).toFixed(1)} KB •{' '}
                        {archivoSeleccionado.name.split('.').pop()?.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {estadoImportacion === 'idle' && (
                    <button
                      onClick={() => {
                        setArchivoSeleccionado(null)
                        setErrorImportacion(null)
                        setMensajeExito(null)
                        setProgresoSubida(0)
                      }}
                      className="text-xs text-neutral-500 hover:text-crimson font-medium underline"
                    >
                      Cambiar archivo
                    </button>
                  )}
                </div>

                {/* Barra de Progreso y Estado de Carga */}
                {(estadoImportacion === 'uploading' ||
                  estadoImportacion === 'processing' ||
                  estadoImportacion === 'success') && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-neutral-700 flex items-center gap-1.5">
                        {estadoImportacion === 'uploading' && (
                          <>
                            <Loader2 className="size-3.5 animate-spin text-[#c8102e]" />
                            Subiendo archivo mediante FormData...
                          </>
                        )}
                        {estadoImportacion === 'processing' && (
                          <>
                            <Loader2 className="size-3.5 animate-spin text-blue-600" />
                            Procesando registros en base de datos...
                          </>
                        )}
                        {estadoImportacion === 'success' && (
                          <>
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            Procesamiento finalizado
                          </>
                        )}
                      </span>
                      <span className="font-mono font-semibold text-neutral-800">{progresoSubida}%</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden bg-neutral-200 rounded-full">
                      <div
                        className={`h-full transition-all duration-300 ${
                          estadoImportacion === 'success' ? 'bg-emerald-600' : 'bg-[#c8102e]'
                        }`}
                        style={{ width: `${progresoSubida}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Controles de Acción y Plantillas */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={descargarPlantilla}
                  className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-ink font-medium transition-colors"
                >
                  <Download className="size-3.5" />
                  Descargar Plantilla
                </button>
                <button
                  type="button"
                  onClick={cargarDatosPruebaDemo}
                  className="text-xs text-[#c8102e] hover:underline font-medium"
                >
                  Cargar demo
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cerrarModalImportacion}
                  className="border border-line px-4 py-2 text-sm font-medium hover:bg-surface transition-colors"
                >
                  {estadoImportacion === 'success' ? 'Cerrar' : 'Cancelar'}
                </button>

                {estadoImportacion !== 'success' && (
                  <button
                    type="button"
                    disabled={!archivoSeleccionado || estadoImportacion === 'uploading' || estadoImportacion === 'processing'}
                    onClick={handleSubirArchivo}
                    className="flex items-center gap-2 bg-[#c8102e] text-white px-5 py-2 text-sm font-medium hover:bg-[#a50d26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {(estadoImportacion === 'uploading' || estadoImportacion === 'processing') && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    {estadoImportacion === 'uploading'
                      ? 'Subiendo...'
                      : estadoImportacion === 'processing'
                      ? 'Procesando...'
                      : 'Importar Padrón'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
