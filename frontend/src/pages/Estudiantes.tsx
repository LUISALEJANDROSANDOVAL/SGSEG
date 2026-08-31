import { useState, useRef } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { useAuth } from '../context/AuthContext'
import { X, UserPlus, Upload, FileSpreadsheet, Download, AlertCircle } from 'lucide-react'

const filtros = ['Todos los pensum', 'Pensum 2019', 'Pensum 2022', 'Pensum 2024']

const estudiantesIniciales = [
  {
    registro: '2019-04812',
    nombre: 'Mariana Rojas Quiroga',
    carrera: 'Marketing',
    pensum: '2019',
    estado: 'Sorteado',
  },
  {
    registro: '2020-01377',
    nombre: 'Luis Fernando Céspedes',
    carrera: 'Administración',
    pensum: '2019',
    estado: 'Sorteado',
  },
  {
    registro: '2021-06540',
    nombre: 'Camila Antelo Suárez',
    carrera: 'Contaduría',
    pensum: '2022',
    estado: 'Pendiente',
  },
  {
    registro: '2021-07188',
    nombre: 'Diego Mamani Torrico',
    carrera: 'Ingeniería Comercial',
    pensum: '2022',
    estado: 'Pendiente',
  },
  {
    registro: '2022-02904',
    nombre: 'Valeria Ibáñez Peña',
    carrera: 'Sistemas',
    pensum: '2024',
    estado: 'Observado',
  },
  {
    registro: '2022-03551',
    nombre: 'Jorge Andrés Vaca',
    carrera: 'Administración',
    pensum: '2024',
    estado: 'Pendiente',
  },
]

const estilosEstado: Record<string, string> = {
  Sorteado: 'bg-ink text-white',
  Pendiente: 'bg-surface text-neutral-600 ring-1 ring-line',
  Observado: 'bg-crimson text-white',
}

export default function PaginaEstudiantes() {
  const { user } = useAuth()
  const [listaEstudiantes, setListaEstudiantes] = useState(estudiantesIniciales)
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

  // Estados para Importación
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [previewEstudiantes, setPreviewEstudiantes] = useState<any[]>([])
  const [errorImportacion, setErrorImportacion] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Roles permitidos: Coordinador General, Jefe de Carrera, Vicerrectorado
  const tienePermiso = user && ['Coordinador General', 'Jefe de Carrera', 'Vicerrectorado'].includes(user.rol)

  const handleAgregarEstudiante = (e: React.FormEvent) => {
    e.preventDefault()
    
    const nuevoEstudiante = {
      registro: formRegistro,
      nombre: formNombre,
      carrera: formCarrera,
      pensum: formPensum,
      estado: formEstado,
    }

    setListaEstudiantes([nuevoEstudiante, ...listaEstudiantes])
    
    // Limpiar formulario y cerrar modal
    setFormRegistro('')
    setFormNombre('')
    setFormCi('')
    setFormCorreo('')
    setFormCarrera('Sistemas')
    setFormPensum('2024')
    setFormEstado('Pendiente')
    setModalAbierto(false)
  }

  // Descarga de Plantilla de Ejemplo
  const descargarPlantilla = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "registro,nombre,carrera,pensum,estado\n"
      + "2023-11223,Alejandro Sandoval,Sistemas,2024,Pendiente\n"
      + "2023-44556,Laura Chacon,Marketing,2022,Pendiente\n"
      + "2023-77889,Mauricio Vargas,Contaduria,2019,Observado"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "plantilla_estudiantes.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Carga de datos de prueba para simular archivo
  const cargarDatosPruebaImport = () => {
    const mockRows = [
      { registro: '2023-88123', nombre: 'Andrea Paz Gonzales', carrera: 'Sistemas', pensum: '2024', estado: 'Pendiente' },
      { registro: '2023-88456', nombre: 'Bruno Diaz Cabrera', carrera: 'Ingeniería Comercial', pensum: '2022', estado: 'Pendiente' },
      { registro: '2023-88789', nombre: 'Carla Vaca Flores', carrera: 'Marketing', pensum: '2019', estado: 'Observado' },
    ]
    setPreviewEstudiantes(mockRows)
    setArchivoSeleccionado(new File(["registro,nombre,carrera,pensum,estado"], "padron_simulado.csv", { type: "text/csv" }))
    setErrorImportacion(null)
  }

  // Lector de archivo CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setArchivoSeleccionado(file)
    setErrorImportacion(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split('\n')
        if (lines.length < 2) {
          setErrorImportacion('El archivo no contiene suficientes filas.')
          return
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const rows = []

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue
          const values = lines[i].split(',').map(v => v.trim())
          const rowData: Record<string, string> = {}
          headers.forEach((header, index) => {
            rowData[header] = values[index] || ''
          })

          rows.push({
            registro: rowData.registro || `REG-${Math.floor(10000 + Math.random() * 90000)}`,
            nombre: rowData.nombre || 'Desconocido',
            carrera: rowData.carrera || 'Sistemas',
            pensum: rowData.pensum || '2024',
            estado: rowData.estado || 'Pendiente',
          })
        }
        setPreviewEstudiantes(rows)
      } catch (err) {
        setErrorImportacion('Error al leer o parsear el archivo CSV.')
      }
    }
    reader.readAsText(file)
  }

  const confirmarImportacion = () => {
    if (previewEstudiantes.length === 0) return
    setListaEstudiantes([...previewEstudiantes, ...listaEstudiantes])
    
    // Limpiar estados de importación
    setArchivoSeleccionado(null)
    setPreviewEstudiantes([])
    setModalImportarAbierto(false)
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
              {tienePermiso && (
                <>
                  <button
                    type="button"
                    onClick={() => setModalAbierto(true)}
                    className="flex items-center gap-2 bg-[#c8102e] text-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#a50d26]"
                  >
                    <UserPlus className="size-4" />
                    Agregar estudiante
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalImportarAbierto(true)}
                    className="border border-ink bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-ink hover:text-white"
                  >
                    Importar
                  </button>
                </>
              )}
            </div>
          }
        />

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

        <section className="border border-line bg-white">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">
              Padrón semestre 2-2026
            </h2>
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
                {estudiantesFiltrados.map((estudiante, idx) => (
                  <tr key={`${estudiante.registro}-${idx}`}>
                    <td className="px-5 py-4 font-mono text-[11px] tracking-wider text-neutral-500">
                      {estudiante.registro}
                    </td>
                    <td className="px-5 py-4 font-medium">{estudiante.nombre}</td>
                    <td className="px-5 py-4 text-neutral-600">
                      {estudiante.carrera}
                    </td>
                    <td className="px-5 py-4 text-neutral-500">{estudiante.pensum}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-medium ${estilosEstado[estudiante.estado] || 'bg-surface text-neutral-600'}`}
                      >
                        {estudiante.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {estudiantesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-neutral-400">
                      No se encontraron estudiantes para este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal Agregar Estudiante */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-line shadow-2xl p-6 relative">
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-ink"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-base font-semibold tracking-tight mb-4">
              Agregar Nuevo Estudiante
            </h3>

            <form onSubmit={handleAgregarEstudiante} className="flex flex-col gap-4">
              {/* Carnet Estudiantil (Registro) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-600">Registro Estudiantil</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 2023-01984"
                  value={formRegistro}
                  onChange={(e) => setFormRegistro(e.target.value)}
                  className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                />
              </div>

              {/* Nombre Completo */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-600">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez Gómez"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                />
              </div>

              {/* Carnet Identidad (C.I.) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-600">Carnet de Identidad (C.I.)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 8976543 SC"
                  value={formCi}
                  onChange={(e) => setFormCi(e.target.value)}
                  className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                />
              </div>

              {/* Correo Electrónico */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-600">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="Ej: juan.perez@uagrm.edu.bo"
                  value={formCorreo}
                  onChange={(e) => setFormCorreo(e.target.value)}
                  className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Carrera */}
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

                {/* Pensum */}
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

              {/* Estado */}
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

              {/* Acciones */}
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
                  className="bg-[#c8102e] text-white px-4 py-2 text-sm font-medium hover:bg-[#a50d26]"
                >
                  Registrar Estudiante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Importar Padrón */}
      {modalImportarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-line shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setModalImportarAbierto(false)
                setArchivoSeleccionado(null)
                setPreviewEstudiantes([])
                setErrorImportacion(null)
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-ink"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-base font-semibold tracking-tight mb-2">
              Importar Padrón de Estudiantes
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Sube un archivo de texto en formato CSV separado por comas para agregar múltiples registros.
            </p>

            {errorImportacion && (
              <div className="mb-4 flex items-start gap-2.5 bg-crimson/10 border border-crimson/20 p-3 text-xs text-crimson">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorImportacion}</span>
              </div>
            )}

            {/* Zona de Arrastre / Selección */}
            {!archivoSeleccionado ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-line p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-ink transition-colors bg-surface/50"
              >
                <Upload className="size-8 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-600">Arrastra tu archivo CSV aquí o haz clic para buscar</span>
                <span className="text-[11px] text-neutral-400">Archivos .csv de hasta 5MB</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="border border-line bg-surface p-4 flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="size-6 text-[#c8102e]" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-700">{archivoSeleccionado.name}</p>
                    <p className="text-xs text-neutral-400">{(archivoSeleccionado.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setArchivoSeleccionado(null)
                    setPreviewEstudiantes([])
                    setErrorImportacion(null)
                  }}
                  className="text-xs text-neutral-500 hover:text-crimson font-medium underline"
                >
                  Quitar archivo
                </button>
              </div>
            )}

            {/* Preview de Datos */}
            {previewEstudiantes.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Vista Previa (Primeros {Math.min(3, previewEstudiantes.length)} de {previewEstudiantes.length} registros)
                </p>
                <div className="border border-line max-h-40 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface border-b border-line text-[10px] uppercase font-bold text-neutral-500">
                      <tr>
                        <th className="px-3 py-2">Registro</th>
                        <th className="px-3 py-2">Nombre</th>
                        <th className="px-3 py-2">Carrera</th>
                        <th className="px-3 py-2">Pensum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {previewEstudiantes.slice(0, 3).map((est, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 font-mono text-[10px]">{est.registro}</td>
                          <td className="px-3 py-1.5 font-medium">{est.nombre}</td>
                          <td className="px-3 py-1.5 text-neutral-600">{est.carrera}</td>
                          <td className="px-3 py-1.5 text-neutral-500">{est.pensum}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Controles de Acción y Utilidades */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={descargarPlantilla}
                  className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-ink font-medium"
                >
                  <Download className="size-3.5" />
                  Descargar Plantilla
                </button>
                <button
                  type="button"
                  onClick={cargarDatosPruebaImport}
                  className="text-xs text-[#c8102e] hover:underline font-medium"
                >
                  Cargar datos demo
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalImportarAbierto(false)
                    setArchivoSeleccionado(null)
                    setPreviewEstudiantes([])
                    setErrorImportacion(null)
                  }}
                  className="border border-line px-4 py-2 text-sm font-medium hover:bg-surface"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={previewEstudiantes.length === 0}
                  onClick={confirmarImportacion}
                  className="bg-[#c8102e] text-white px-4 py-2 text-sm font-medium hover:bg-[#a50d26] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Importar ({previewEstudiantes.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}


