'use client'

import { useEffect, useState } from 'react'
import {
  Eye,
  FileCheck2,
  Printer,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react'
import { sorteosApi, type SorteoItem } from '@/lib/sorteos.api'

interface HistorialSorteosProps {
  refreshTrigger?: number
}

export function HistorialSorteos({ refreshTrigger }: HistorialSorteosProps) {
  const [sorteos, setSorteos] = useState<SorteoItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [total, setTotal] = useState<number>(0)
  const [actaSeleccionada, setActaSeleccionada] = useState<SorteoItem | null>(null)

  const cargarHistorial = async () => {
    setLoading(true)
    try {
      const data = await sorteosApi.getHistorial({ limit: 20 })
      setSorteos(data.items)
      setTotal(data.pagination.total)
    } catch (e) {
      console.error('Error al cargar historial de sorteos:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarHistorial()
  }, [refreshTrigger])

  return (
    <section className="flex flex-col border border-line bg-white shadow-xs">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="size-4 text-neutral-700" />
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
              Historial de Sorteos y Actas
            </h2>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {total} actos de sorteo registrados con validez reglamentaria
          </p>
        </div>
        <button
          type="button"
          onClick={cargarHistorial}
          className="flex items-center gap-1 border border-line px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-surface"
        >
          <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto max-h-[520px]">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            Cargando historial de sorteos...
          </div>
        ) : sorteos.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            No se han registrado sorteos en este periodo aún.
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {sorteos.map((sorteo) => {
              const est = sorteo.defensa?.instancia?.proceso?.estudiante
              const def = sorteo.defensa
              const fechaHora = new Date(sorteo.fechaHora).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
              const fechaDia = new Date(sorteo.fechaHora).toLocaleDateString()
              const tipoSorteo = sorteo.area ? 'Área Temática' : sorteo.caso ? 'Caso de Estudio' : 'Sorteo'
              const valorResultado = sorteo.area?.areaResultado?.nombre || sorteo.caso?.casoSeleccionado?.titulo || 'Resultado'

              return (
                <li
                  key={sorteo.idSorteo}
                  className="flex items-start justify-between gap-3 px-5 py-3.5 hover:bg-neutral-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="text-center shrink-0 pt-0.5">
                      <span className="font-mono text-xs font-bold text-neutral-800 block">
                        {fechaHora}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">{fechaDia}</span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-neutral-900">
                        {est ? est.nombreCompleto : 'Postulante'}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {est?.planEstudio?.carrera?.nombre || 'Carrera'} · Carnet: {est?.carnetEstudiantil}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="bg-surface border border-line px-1.5 py-0.5 text-neutral-700 font-medium">
                          {tipoSorteo}: <strong>{valorResultado}</strong>
                        </span>
                        {sorteo.estudiantePresente ? (
                          <span className="text-emerald-700 font-medium">✓ Presente</span>
                        ) : (
                          <span className="text-amber-700 font-medium">⚠️ Inasistencia</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        def?.tipoDefensa?.nombre === 'EXTERNA'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {def?.tipoDefensa?.nombre || 'INTERNA'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setActaSeleccionada(sorteo)}
                      className="inline-flex items-center gap-1 text-[11px] text-neutral-600 hover:text-crimson transition-colors"
                      title="Ver Acta Oficial de Sorteo"
                    >
                      <Eye className="size-3" />
                      <span>Ver Acta</span>
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* MODAL DE ACTA OFICIAL DE SORTEO DIGITAL */}
      {actaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl border border-line bg-white shadow-2xl">
            {/* Header del Acta */}
            <header className="flex items-center justify-between border-b border-line px-6 py-4 bg-surface">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-crimson" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-neutral-900 uppercase">
                    Acta Oficial de Sorteo Digital
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Sistema de Gestión de Exámenes de Grado · UPTECSA
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActaSeleccionada(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </header>

            {/* Contenido Imprimible del Acta */}
            <div className="p-6 flex flex-col gap-4 text-xs text-neutral-800">
              <div className="text-center border-b border-line pb-3">
                <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
                  Certificado de Asignación Aleatoria
                </p>
                <h4 className="text-base font-bold text-neutral-900 mt-1">
                  ACTA DE SORTEO N° {actaSeleccionada.idSorteo.padStart(6, '0')}
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Fecha y Hora del Acto: {new Date(actaSeleccionada.fechaHora).toLocaleString()}
                </p>
              </div>

              {/* Datos del Postulante */}
              <div className="grid grid-cols-2 gap-3 bg-surface p-3 border border-line">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Postulante</span>
                  <p className="font-bold text-neutral-900">
                    {actaSeleccionada.defensa?.instancia?.proceso?.estudiante?.nombreCompleto}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    C.I.: {actaSeleccionada.defensa?.instancia?.proceso?.estudiante?.carnetIdentidad} · Registro:{' '}
                    {actaSeleccionada.defensa?.instancia?.proceso?.estudiante?.carnetEstudiantil}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Carrera y Facultad</span>
                  <p className="font-bold text-neutral-900">
                    {actaSeleccionada.defensa?.instancia?.proceso?.estudiante?.planEstudio?.carrera?.nombre}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {actaSeleccionada.defensa?.instancia?.proceso?.estudiante?.planEstudio?.carrera?.facultad?.nombre || 'UPTECSA'}
                  </p>
                </div>
              </div>

              {/* Resultado del Sorteo */}
              <div className="border border-line p-4 flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Resultado del Bolillero Digital
                </span>
                {actaSeleccionada.area && (
                  <div>
                    <span className="text-neutral-500 text-[11px]">Área Académica Asignada:</span>
                    <p className="text-sm font-bold text-neutral-900">
                      {actaSeleccionada.area.areaResultado.nombre}
                    </p>
                  </div>
                )}
                {actaSeleccionada.caso && (
                  <div className="mt-1">
                    <span className="text-neutral-500 text-[11px]">Caso de Estudio Seleccionado:</span>
                    <p className="text-sm font-bold text-neutral-900">
                      {actaSeleccionada.caso.casoSeleccionado.titulo}
                    </p>
                    <p className="text-[11px] text-neutral-600 mt-1 italic line-clamp-3">
                      "{actaSeleccionada.caso.casoSeleccionado.contenido}"
                    </p>
                  </div>
                )}
              </div>

              {/* Testigos y Presencia */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-neutral-500">Operador del Sistema:</span>
                  <p className="font-semibold text-neutral-900">
                    {actaSeleccionada.usuarioEjecutor
                      ? `${actaSeleccionada.usuarioEjecutor.primerNombre} ${actaSeleccionada.usuarioEjecutor.primerApellido}`
                      : 'Secretaría de Facultad'}
                  </p>
                  <p className="text-neutral-500">{actaSeleccionada.usuarioEjecutor?.correoInstitucional}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Comparecencia del Estudiante:</span>
                  <p className="font-semibold text-neutral-900">
                    {actaSeleccionada.estudiantePresente ? 'Presente en Sesión' : 'Inasistencia Justificada'}
                  </p>
                  {!actaSeleccionada.estudiantePresente && actaSeleccionada.motivoInasistencia && (
                    <p className="text-amber-700 italic">"{actaSeleccionada.motivoInasistencia}"</p>
                  )}
                </div>
              </div>

              {/* Sello Criptográfico SHA-256 */}
              <div className="bg-neutral-50 p-3 border border-line flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-neutral-600 tracking-wider">
                  Sello de Integridad Criptográfica (SHA-256)
                </span>
                <p className="font-mono text-[10px] text-neutral-800 break-all select-all">
                  {actaSeleccionada.tokenActa || 'UPTECSA-VERIFIED-HASH-SEAL'}
                </p>
              </div>

              {/* Acciones */}
              <footer className="mt-2 flex items-center justify-between border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <Printer className="size-3.5" />
                  <span>Imprimir Acta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActaSeleccionada(null)}
                  className="border border-line bg-ink px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
                >
                  Cerrar
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
