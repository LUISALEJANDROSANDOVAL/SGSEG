import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { useAuth } from '@/context/AuthContext'
import { Search } from 'lucide-react'

type BitacoraEntry = {
  id: string
  fecha: string
  usuario: string
  rol: string
  accion: string
  detalles: string
  facultadId: string
  carreraId: string
}

// Datos simulados con cruce de diferentes facultades y carreras
const logsMock: BitacoraEntry[] = [
  {
    id: 'LOG-001',
    fecha: '2026-08-27 10:15:00',
    usuario: 'Juan Pérez',
    rol: 'Jefe de Carrera',
    accion: 'Sorteo Ejecutado',
    detalles: 'Se asignó CASO-042 al estudiante 12345678.',
    facultadId: 'FAC-001',
    carreraId: 'CAR-001'
  },
  {
    id: 'LOG-002',
    fecha: '2026-08-27 09:30:12',
    usuario: 'Ana Gómez',
    rol: 'Secretario de Facultad',
    accion: 'Inicio de Sesión',
    detalles: 'Acceso exitoso al sistema.',
    facultadId: 'FAC-001',
    carreraId: 'CAR-002'
  },
  {
    id: 'LOG-003',
    fecha: '2026-08-26 16:45:22',
    usuario: 'Luis Sandoval',
    rol: 'Jefe de Carrera',
    accion: 'Creación de Caso',
    detalles: 'Se registró el caso CASO-063 (Auditoría interna).',
    facultadId: 'FAC-002',
    carreraId: 'CAR-003'
  },
  {
    id: 'LOG-004',
    fecha: '2026-08-26 14:20:05',
    usuario: 'María Torres',
    rol: 'Vicerrectorado',
    accion: 'Consulta de Reporte',
    detalles: 'Se exportó el acta consolidada de agosto 2026.',
    facultadId: 'GLOBAL', // Acciones globales
    carreraId: 'GLOBAL'
  },
  {
    id: 'LOG-005',
    fecha: '2026-08-25 11:10:45',
    usuario: 'Carlos Arnez',
    rol: 'Jefe de Carrera',
    accion: 'Sorteo Ejecutado',
    detalles: 'Se asignó CASO-014 al estudiante 87654321.',
    facultadId: 'FAC-001',
    carreraId: 'CAR-001'
  }
]

export default function PaginaAuditoria() {
  const { user } = useAuth()
  
  // Estado para los filtros manuales
  const [filtroFacultad, setFiltroFacultad] = useState<string>('TODAS')
  const [filtroAccion, setFiltroAccion] = useState<string>('')
  
  // Determinar si el usuario tiene una vista restringida por facultad
  // Vicerrectorado y Coordinador General ven todo. Secretarios y Jefes ven solo su facultad.
  const tieneRestriccionFacultad = user?.rol === 'Secretario de Facultad' || user?.rol === 'Jefe de Carrera'
  const facultadRestringida = user?.facultadId || 'FAC-001' // Fallback para los mocks

  // Lógica de filtrado
  const logsFiltrados = logsMock.filter((log) => {
    // 1. Filtro por restricción de rol
    if (tieneRestriccionFacultad) {
      if (log.facultadId !== facultadRestringida && log.facultadId !== 'GLOBAL') {
        return false
      }
    } else {
      // 2. Filtro manual por facultad (solo disponible si no hay restricción)
      if (filtroFacultad !== 'TODAS' && log.facultadId !== filtroFacultad) {
        return false
      }
    }

    // 3. Filtro por búsqueda de acción/usuario (opcional extra)
    if (filtroAccion && !log.accion.toLowerCase().includes(filtroAccion.toLowerCase()) && !log.usuario.toLowerCase().includes(filtroAccion.toLowerCase())) {
      return false
    }

    return true
  })

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <EncabezadoPagina
          titulo="Auditoría y Bitácora"
          descripcion="Registro inmutable de todas las acciones, modificaciones y sorteos del sistema."
        />

        {/* Barra de Filtros */}
        <section className="flex flex-col gap-4 border border-line bg-white p-5 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-neutral-600">Buscar (Acción o Usuario)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Ej. Sorteo, Juan..."
                value={filtroAccion}
                onChange={(e) => setFiltroAccion(e.target.value)}
                className="w-full border border-line bg-surface py-2 pl-9 pr-3 text-sm focus:border-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          {!tieneRestriccionFacultad && (
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600">Filtrar por Facultad</label>
              <select
                value={filtroFacultad}
                onChange={(e) => setFiltroFacultad(e.target.value)}
                className="w-full border border-line bg-surface py-2 pl-3 pr-8 text-sm focus:border-neutral-400 focus:outline-none"
              >
                <option value="TODAS">Todas las Facultades</option>
                <option value="FAC-001">Ciencias y Tecnología (FAC-001)</option>
                <option value="FAC-002">Ciencias Económicas (FAC-002)</option>
              </select>
            </div>
          )}

          {tieneRestriccionFacultad && (
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600">Ámbito de Auditoría</label>
              <div className="w-full border border-line bg-surface px-3 py-2 text-sm text-neutral-500 cursor-not-allowed">
                Facultad Actual ({facultadRestringida})
              </div>
            </div>
          )}
        </section>

        {/* Tabla de Bitácora */}
        <div className="overflow-hidden border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-line/50 text-xs text-neutral-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Fecha y Hora</th>
                  <th scope="col" className="px-5 py-3 font-medium">Usuario / Rol</th>
                  <th scope="col" className="px-5 py-3 font-medium">Acción</th>
                  <th scope="col" className="px-5 py-3 font-medium">Ubicación</th>
                  <th scope="col" className="px-5 py-3 font-medium">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {logsFiltrados.length > 0 ? (
                  logsFiltrados.map((log) => (
                    <tr key={log.id} className="transition-colors hover:bg-surface/50">
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="font-medium">{log.fecha.split(' ')[0]}</span>
                        <span className="ml-2 text-xs text-neutral-500">{log.fecha.split(' ')[1]}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-neutral-900">{log.usuario}</div>
                        <div className="text-[11px] text-neutral-500">{log.rol}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-sm bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800">
                          {log.accion}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-neutral-500">
                        {log.facultadId !== 'GLOBAL' ? (
                          <>
                            <div>{log.facultadId}</div>
                            <div>{log.carreraId}</div>
                          </>
                        ) : (
                          <span className="italic">Sistema Global</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-neutral-600">
                        {log.detalles}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-neutral-500">
                      No hay registros que coincidan con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
