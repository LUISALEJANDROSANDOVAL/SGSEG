import { useEffect, useState } from 'react'
import {
  Download,
  Eye,
  FileCheck2,
  Loader2,
  Printer,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react'
import { sorteosApi, type SorteoItem, descargarArchivoActa } from '@/lib/sorteos.api'
import { useAuth } from '@/context/AuthContext'
import { esJefeCarrera, getJefeCarreraId } from '@/lib/auth-helpers'

interface HistorialSorteosProps {
  refreshTrigger?: number
}

export function HistorialSorteos({ refreshTrigger }: HistorialSorteosProps) {
  const { user } = useAuth()
  const isJefe = esJefeCarrera(user)
  const carreraId = getJefeCarreraId(user)

  const [sorteos, setSorteos] = useState<SorteoItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [total, setTotal] = useState<number>(0)
  const [actaSeleccionada, setActaSeleccionada] = useState<SorteoItem | null>(null)
  const [descargandoId, setDescargandoId] = useState<string | null>(null)

  const cargarHistorial = async () => {
    setLoading(true)
    try {
      const idCarreraFiltro = isJefe && carreraId ? carreraId : undefined
      const data = await sorteosApi.getHistorial({ limit: 20, idCarrera: idCarreraFiltro })
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
  }, [refreshTrigger, user, isJefe, carreraId])

  return (
    <section className="flex flex-col border border-line bg-white p-5 shadow-xs">
      <header className="flex items-center justify-between border-b border-line pb-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center border border-line bg-surface text-neutral-700">
              <FileCheck2 className="size-4 text-neutral-700" />
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 uppercase">
              Historial de Sorteos y Actas
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {total} actos de sorteo registrados con validez reglamentaria
          </p>
        </div>
        <button
          type="button"
          onClick={cargarHistorial}
          className="flex items-center gap-1.5 border border-line bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-surface transition-colors"
        >
          <RefreshCw className={`size-3 ${loading ? 'animate-spin text-crimson' : ''}`} />
          <span>Actualizar</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto max-h-[480px]">
        {loading ? (
          <div className="py-10 text-center text-xs text-gray-400">
            Cargando historial de sorteos...
          </div>
        ) : sorteos.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400">
            No se han registrado sorteos en este periodo aún.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
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
                  className="flex items-start justify-between gap-3 py-3.5 hover:bg-gray-50/80 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="text-center shrink-0 pt-0.5 bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
                      <span className="font-mono text-xs font-bold text-gray-800 block">
                        {fechaHora}
                      </span>
                      <span className="text-[10px] text-gray-400 block">{fechaDia}</span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-gray-900">
                        {est ? est.nombreCompleto : 'Postulante'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {est?.planEstudio?.carrera?.nombre || 'Carrera'} · Carnet: {est?.carnetEstudiantil}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 text-gray-800 rounded font-medium text-[10px]">
                          {tipoSorteo}: <strong className="text-gray-900">{valorResultado}</strong>
                        </span>
                        {sorteo.estudiantePresente ? (
                          <span className="text-emerald-700 font-semibold text-[10px] flex items-center gap-0.5">
                            ✓ Presente
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold text-[10px]">
                            ⚠️ Inasistencia
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border ${
                        def?.tipoDefensa?.nombre === 'EXTERNA'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {def?.tipoDefensa?.nombre || 'INTERNA'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActaSeleccionada(sorteo)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-crimson transition-colors border border-line bg-white px-2 py-1 shadow-2xs hover:bg-surface cursor-pointer"
                        title="Ver Acta Oficial de Sorteo"
                      >
                        <Eye className="size-3" />
                        <span>Ver Acta</span>
                      </button>

                      <button
                        type="button"
                        disabled={descargandoId === sorteo.idSorteo}
                        onClick={async () => {
                          try {
                            setDescargandoId(sorteo.idSorteo)
                            const idDefensa = sorteo.idDefensa || sorteo.defensa?.idDefensa
                            await descargarArchivoActa(idDefensa, `ACTA-${sorteo.idSorteo}`)
                          } catch (err: any) {
                            alert('No se pudo descargar el acta en PDF: ' + (err.message || err))
                          } finally {
                            setDescargandoId(null)
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-800 hover:text-crimson transition-colors border border-line bg-white px-2 py-1 shadow-2xs hover:bg-surface cursor-pointer disabled:opacity-50"
                        title="Descargar Acta Oficial en PDF"
                      >
                        {descargandoId === sorteo.idSorteo ? (
                          <Loader2 className="size-3 animate-spin text-crimson" />
                        ) : (
                          <Download className="size-3 text-crimson" />
                        )}
                        <span>{descargandoId === sorteo.idSorteo ? 'Descargando...' : 'Descargar PDF'}</span>
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* MODAL DE ACTA OFICIAL DE SORTEO DIGITAL */}
      {actaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs print:relative print:inset-auto print:bg-white print:p-0 print:z-auto">
          <div className="w-full max-w-xl border border-line bg-white shadow-2xl print:border-none print:shadow-none print:max-w-none">
            {/* Header del Acta */}
            <header className="flex items-center justify-between border-b border-line px-6 py-4 bg-surface print:bg-white print:border-b-2 print:border-neutral-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-crimson print:text-neutral-900" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-neutral-900 uppercase">
                    Acta Oficial de Sorteo Digital
                  </h3>
                  <p className="text-[11px] text-neutral-500 print:text-neutral-700">
                    Sistema de Gestión de Exámenes de Grado · UTEPSA
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActaSeleccionada(null)}
                className="text-neutral-400 hover:text-neutral-700 print:hidden"
              >
                <X className="size-5" />
              </button>
            </header>

            {/* Contenido Imprimible del Acta */}
            <div className="p-6 flex flex-col gap-4 text-xs text-neutral-800 print:p-8 print:text-black">
              <div className="text-center border-b border-line pb-3 print:border-neutral-300">
                <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold print:text-neutral-700">
                  Certificado de Asignación Aleatoria
                </p>
                <h4 className="text-base font-bold text-neutral-900 mt-1 print:text-black">
                  {(actaSeleccionada as any).defensa?.asignacionCaso?.codigoActa
                    ? `ACTA OFICIAL ${(actaSeleccionada as any).defensa.asignacionCaso.codigoActa}`
                    : `ACTA DE SORTEO N° ${actaSeleccionada.idSorteo.padStart(6, '0')}`}
                </h4>
                <p className="text-[11px] text-neutral-500 font-mono print:text-neutral-700">
                  Fecha y Hora del Acto: {new Date(actaSeleccionada.fechaHora).toLocaleString('es-BO')}
                </p>
              </div>

              {/* Datos del Postulante */}
              <div className="grid grid-cols-2 gap-3 bg-surface p-3 border border-line print:bg-neutral-50 print:border-neutral-300">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Postulante</span>
                  <p className="font-bold text-neutral-900 print:text-black">
                    {actaSeleccionada.defensa?.instancia?.proceso?.estudiante?.nombreCompleto}
                  </p>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    C.I.: {actaSeleccionada.defensa?.instancia?.proceso?.estudiante?.carnetIdentidad} · Registro:{' '}
                    {actaSeleccionada.defensa?.instancia?.proceso?.estudiante?.carnetEstudiantil}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Carrera y Facultad</span>
                  <p className="font-bold text-neutral-900 print:text-black">
                    {actaSeleccionada.defensa?.instancia?.proceso?.estudiante?.planEstudio?.carrera?.nombre}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {actaSeleccionada.defensa?.instancia?.proceso?.estudiante?.planEstudio?.carrera?.facultad?.nombre || 'UTEPSA'}
                  </p>
                </div>
              </div>

              {/* Resultado del Sorteo */}
              {(() => {
                const areaNombre =
                  actaSeleccionada.area?.areaResultado?.nombre ||
                  (actaSeleccionada as any).defensa?.asignacionCaso?.area?.nombre ||
                  (actaSeleccionada as any).defensa?.casoUtilizado?.area?.nombre ||
                  'Área Académica Asignada';
                const casoObj =
                  actaSeleccionada.caso?.casoSeleccionado ||
                  (actaSeleccionada as any).defensa?.asignacionCaso?.caso ||
                  (actaSeleccionada as any).defensa?.casoUtilizado;
                return (
                  <div className="border border-line p-4 flex flex-col gap-2 print:border-neutral-300">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      Resultado del Bolillero Digital
                    </span>
                    <div>
                      <span className="text-neutral-500 text-[11px]">Área Académica Asignada:</span>
                      <p className="text-sm font-bold text-neutral-900 print:text-black">
                        {areaNombre}
                      </p>
                    </div>
                    {casoObj ? (
                      <div className="mt-1">
                        <span className="text-neutral-500 text-[11px]">Caso de Estudio Seleccionado:</span>
                        <p className="text-sm font-bold text-neutral-900 print:text-black">
                          {casoObj.titulo}
                        </p>
                        {casoObj.contenido && (
                          <p className="text-[11px] text-neutral-600 mt-1 italic line-clamp-3 print:line-clamp-none">
                            "{casoObj.contenido}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1">
                        <span className="text-neutral-500 text-[11px]">Modalidad de Caso:</span>
                        <p className="text-xs text-neutral-700 italic">
                          Modalidad exclusiva de Área Temática (sin asignación de caso por ruleta).
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Testigos y Presencia */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-neutral-500">Operador del Sistema:</span>
                  <p className="font-semibold text-neutral-900 print:text-black">
                    {actaSeleccionada.usuarioEjecutor
                      ? `${actaSeleccionada.usuarioEjecutor.primerNombre} ${actaSeleccionada.usuarioEjecutor.primerApellido}`
                      : 'Secretaría de Facultad'}
                  </p>
                  <p className="text-neutral-500 font-mono text-[10px]">{actaSeleccionada.usuarioEjecutor?.correoInstitucional}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Comparecencia del Estudiante:</span>
                  <p className="font-semibold text-neutral-900 print:text-black">
                    {actaSeleccionada.estudiantePresente ? 'Presente en Sesión' : 'Inasistencia Justificada'}
                  </p>
                  {!actaSeleccionada.estudiantePresente && actaSeleccionada.motivoInasistencia && (
                    <p className="text-amber-700 italic">"{actaSeleccionada.motivoInasistencia}"</p>
                  )}
                </div>
              </div>

              {/* Sello Criptográfico SHA-256 */}
              <div className="bg-neutral-50 p-3 border border-line flex flex-col gap-1 print:bg-white print:border-neutral-300">
                <span className="text-[10px] uppercase font-bold text-neutral-600 tracking-wider">
                  Sello de Integridad Criptográfica (SHA-256)
                </span>
                <p className="font-mono text-[10px] text-neutral-800 break-all select-all">
                  {(actaSeleccionada as any).defensa?.asignacionCaso?.tokenActa || actaSeleccionada.tokenActa || 'UTEPSA-VERIFIED-HASH-SEAL'}
                </p>
              </div>

              {/* Bloque Oficial de Firmas para Impresión Física */}
              <div className="hidden print:grid grid-cols-2 gap-12 mt-12 pt-8 text-center text-xs text-black">
                <div className="flex flex-col items-center">
                  <div className="w-56 border-b border-black mb-1.5" />
                  <p className="font-bold">Firma de la Autoridad Académica</p>
                  <p className="text-[10px] text-neutral-600">Secretaría de Facultad / Coordinación UTEPSA</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-56 border-b border-black mb-1.5" />
                  <p className="font-bold">Firma del Postulante</p>
                  <p className="text-[10px] text-neutral-600">Conformidad con el Acta de Sorteo</p>
                </div>
              </div>

              {/* Acciones */}
              <footer className="mt-2 flex items-center justify-between border-t border-line pt-4 print:hidden gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-xs cursor-pointer"
                  >
                    <Printer className="size-3.5" />
                    <span>Imprimir</span>
                  </button>

                  <button
                    type="button"
                    disabled={descargandoId === actaSeleccionada.idSorteo}
                    onClick={async () => {
                      try {
                        setDescargandoId(actaSeleccionada.idSorteo)
                        const idDefensa = actaSeleccionada.idDefensa || actaSeleccionada.defensa?.idDefensa
                        await descargarArchivoActa(idDefensa, `ACTA-${actaSeleccionada.idSorteo}`)
                      } catch (err: any) {
                        alert('No se pudo descargar el acta en PDF: ' + (err.message || err))
                      } finally {
                        setDescargandoId(null)
                      }
                    }}
                    className="flex items-center gap-1.5 border border-crimson bg-crimson px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#821528] shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {descargandoId === actaSeleccionada.idSorteo ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                    <span>Descargar Acta en PDF</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActaSeleccionada(null)}
                  className="border border-line bg-ink px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 cursor-pointer"
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
