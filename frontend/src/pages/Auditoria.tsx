import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { EncabezadoPagina } from '@/components/encabezado-pagina';
import { Search, RefreshCw, Eye, Calendar, ShieldCheck, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { auditoriaApi, type RegistroAuditoriaItem } from '@/lib/auditoria.api';

export default function PaginaAuditoria() {
  const [logs, setLogs] = useState<RegistroAuditoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroAccion, setFiltroAccion] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODAS');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal de detalles JSON
  const [detalleModal, setDetalleModal] = useState<RegistroAuditoriaItem | null>(null);

  const fetchLogs = async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditoriaApi.getLogs({
        page: currentPage,
        limit: 25,
        search: filtroAccion.trim() || undefined,
        tipoOperacion: filtroTipo !== 'TODAS' ? filtroTipo : undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      });

      setLogs(res.data || []);
      setTotal(res.total || 0);
      setPage(res.page || 1);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      console.error('Error al cargar bitácora de auditoría:', err);
      setError(
        err.response?.data?.message ||
          'No se pudo cargar los registros de auditoría. Verifica que cuentes con permisos de Vicerrectorado o Administrador.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filtroTipo, fechaInicio, fechaFin]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const formatearFecha = (iso: string) => {
    try {
      const d = new Date(iso);
      return {
        fecha: d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }),
        hora: d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    } catch {
      return { fecha: iso, hora: '' };
    }
  };

  const getBadgeColor = (tipo: string) => {
    if (tipo.includes('SORTEO')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (tipo.includes('CALIFICADA') || tipo.includes('ACTUALIZADA')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (tipo.includes('CREACION') || tipo.includes('CREADO')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (tipo.includes('REACTIV') || tipo.includes('ESPECIAL')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (tipo.includes('ELIMIN') || tipo.includes('INACT')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-neutral-100 text-neutral-800 border-neutral-200';
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <EncabezadoPagina
          titulo="Auditoría y Trazabilidad Institucional"
          descripcion="Registro criptográfico e inmutable de eventos sensibles, sorteos y operaciones administrativas del SGSEG."
          accion={
            <button
              type="button"
              onClick={() => fetchLogs(page)}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-line bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-surface cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar Bitácora
            </button>
          }
        />

        {/* Tarjeta Informativa Superior */}
        <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900">
                Trazabilidad Activa en Base de Datos PostgreSQL
              </div>
              <div className="text-xs text-neutral-500">
                Se han registrado <strong className="text-neutral-800">{total}</strong> eventos auditados con integridad referencial.
              </div>
            </div>
          </div>
          <div className="text-xs font-medium text-neutral-500">
            Vista exclusiva para: <span className="font-semibold text-neutral-800">Vicerrectorado</span> y <span className="font-semibold text-neutral-800">Super Admin</span>
          </div>
        </div>

        {/* Barra de Filtros */}
        <form
          onSubmit={handleBuscar}
          className="grid grid-cols-1 gap-4 border border-line bg-white p-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-600">Buscar en Descripción / Usuario</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Ej. Sorteo, Alejandro, Casos..."
                value={filtroAccion}
                onChange={(e) => setFiltroAccion(e.target.value)}
                className="w-full border border-line bg-surface py-2 pl-9 pr-3 text-xs focus:border-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-600">Tipo de Operación</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full border border-line bg-surface py-2 pl-3 pr-8 text-xs focus:border-neutral-400 focus:outline-none"
            >
              <option value="TODAS">Todas las operaciones</option>
              <option value="SORTEO_FINALIZADO">Sorteos Concluidos</option>
              <option value="ASIGNACION_CASO">Asignaciones de Casos</option>
              <option value="SORTEO_AREA">Sorteo de Área Temática</option>
              <option value="CREACION_CASO">Creación de Caso</option>
              <option value="MODIFICACION_CASO">Modificación de Caso</option>
              <option value="REACTIVACION_CASO_ESPECIAL">Reactivación Extraordinaria</option>
              <option value="DEFENSA_PROGRAMADA">Programación de Defensa</option>
              <option value="DEFENSA_CALIFICADA">Calificación de Defensa</option>
              <option value="CONFIGURACION_ACTUALIZADA">Actualización de Reglas</option>
              <option value="ENVIO_CORREO">Envíos de Correo Electrónico</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-600">Desde (Fecha Inicio)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full border border-line bg-surface py-2 pl-9 pr-3 text-xs focus:border-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600">Hasta (Fecha Fin)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border border-line bg-surface py-2 pl-9 pr-3 text-xs focus:border-neutral-400 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-auto h-[35px] border border-ink bg-ink px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 cursor-pointer"
            >
              Filtrar
            </button>
          </div>
        </form>

        {/* Mensaje de Error */}
        {error && (
          <div className="border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Tabla de Bitácora */}
        <div className="overflow-hidden border border-line bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-line/50 font-semibold text-neutral-600">
                <tr>
                  <th scope="col" className="px-5 py-3">ID / Fecha y Hora</th>
                  <th scope="col" className="px-5 py-3">Responsable (Usuario)</th>
                  <th scope="col" className="px-5 py-3">Operación</th>
                  <th scope="col" className="px-5 py-3">Descripción de los Hechos</th>
                  <th scope="col" className="px-5 py-3 text-right">Detalle Forense</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-neutral-500">
                      <div className="inline-flex items-center gap-2">
                        <RefreshCw className="size-4 animate-spin text-neutral-400" />
                        <span>Consultando eventos de auditoría desde PostgreSQL...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => {
                    const { fecha, hora } = formatearFecha(log.fechaHora);
                    const badgeClass = getBadgeColor(log.tipoOperacion);
                    const tienePayload = !!(log.valorNuevo || log.valorAnterior);

                    return (
                      <tr key={log.id} className="transition-colors hover:bg-surface/60">
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <div className="font-mono text-[11px] font-semibold text-neutral-800">
                            #{log.id}
                          </div>
                          <div className="text-neutral-500">
                            <span>{fecha}</span>
                            <span className="ml-1.5 font-mono text-[11px] text-neutral-400">{hora}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-neutral-900">{log.usuario}</div>
                          <div className="text-[11px] text-neutral-500">
                            {log.correoUsuario || log.rol}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-xs border px-2 py-0.5 text-[11px] font-medium ${badgeClass}`}
                          >
                            {log.tipoOperacion}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-neutral-700">
                          <div>{log.descripcion}</div>
                          {log.motivo && (
                            <div className="mt-1 text-[11px] italic text-neutral-500">
                              Motivo: {log.motivo}
                            </div>
                          )}
                          {log.casoTitulo && (
                            <div className="mt-0.5 text-[11px] text-neutral-500">
                              Caso: <span className="font-medium text-neutral-700">{log.casoTitulo}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {tienePayload ? (
                            <button
                              type="button"
                              onClick={() => setDetalleModal(log)}
                              className="inline-flex items-center gap-1.5 border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition hover:bg-neutral-200 cursor-pointer"
                            >
                              <Eye className="size-3 text-neutral-500" />
                              Ver Payload
                            </button>
                          ) : (
                            <span className="text-[11px] text-neutral-400 italic">Sin payload</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-neutral-500">
                      No se encontraron registros de auditoría que coincidan con los criterios seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginador */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-line bg-white px-5 py-3 text-xs text-neutral-600">
              <div>
                Página <span className="font-semibold text-neutral-900">{page}</span> de{' '}
                <span className="font-semibold text-neutral-900">{totalPages}</span> ({total} registros)
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => fetchLogs(page - 1)}
                  className="inline-flex items-center gap-1 border border-line bg-white px-2.5 py-1 font-medium transition hover:bg-surface disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" /> Anterior
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => fetchLogs(page + 1)}
                  className="inline-flex items-center gap-1 border border-line bg-white px-2.5 py-1 font-medium transition hover:bg-surface disabled:opacity-40 cursor-pointer"
                >
                  Siguiente <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalle Forense JSON */}
      {detalleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col border border-line bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Evidencia Forense #{detalleModal.id} — {detalleModal.tipoOperacion}
                </h3>
                <p className="text-xs text-neutral-500">{detalleModal.descripcion}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetalleModal(null)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-mono">
              {detalleModal.valorAnterior && (
                <div>
                  <div className="font-sans font-semibold text-neutral-700 mb-1">
                    Estado Anterior (Antes de la operación):
                  </div>
                  <pre className="max-h-48 overflow-auto border border-line bg-surface p-3 text-[11px] text-neutral-800">
                    {JSON.stringify(detalleModal.valorAnterior, null, 2)}
                  </pre>
                </div>
              )}

              {detalleModal.valorNuevo && (
                <div>
                  <div className="font-sans font-semibold text-neutral-700 mb-1">
                    Estado Nuevo / Payload Registrado:
                  </div>
                  <pre className="max-h-48 overflow-auto border border-line bg-surface p-3 text-[11px] text-neutral-800">
                    {JSON.stringify(detalleModal.valorNuevo, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="border-t border-line bg-surface/50 px-5 py-3 text-right">
              <button
                type="button"
                onClick={() => setDetalleModal(null)}
                className="border border-line bg-white px-4 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-surface cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
