import { useState, useEffect } from 'react';
import { Check, Minus } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { EncabezadoPagina } from '@/components/encabezado-pagina';
import { roles, todasLasPaginas } from '@/lib/navegacion';
import api from '../lib/api';

export default function PaginaConfiguracion() {
  const [carreras, setCarreras] = useState<any[]>([]);
  const [selectedCarreraId, setSelectedCarreraId] = useState('');
  const [selectedTipoDefensa, setSelectedTipoDefensa] = useState<'INTERNA' | 'EXTERNA'>('INTERNA');

  // Valores de configuración de sorteo (RF-05)
  const [mismoMomento, setMismoMomento] = useState(true);
  const [anticipacionDefensa, setAnticipacionDefensa] = useState(24);
  const [plazoResolucion, setPlazoResolucion] = useState(48);
  const [unidadTiempo, setUnidadTiempo] = useState<'HORAS' | 'DIAS_CALENDARIO' | 'DIAS_HABILES'>('HORAS');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCarreras = async () => {
    try {
      const res = await api.get('/academia/carreras');
      setCarreras(res.data);
      if (res.data.length > 0) {
        setSelectedCarreraId(res.data[0].id);
      }
    } catch (err) {
      console.error('Error al cargar carreras', err);
    }
  };

  const fetchConfig = async (cId: string, tipo: string) => {
    if (!cId) return;
    setLoading(true);
    try {
      const res = await api.get(`/sorteo-config/carrera/${cId}`);
      const config = res.data.find((c: any) => c.tipoDefensa === tipo);
      if (config) {
        setMismoMomento(config.mismoMomento);
        setAnticipacionDefensa(config.anticipacionDefensa);
        setPlazoResolucion(config.plazoResolucion);
        setUnidadTiempo(config.unidadTiempo);
      } else {
        // Valores por defecto
        setMismoMomento(true);
        setAnticipacionDefensa(24);
        setPlazoResolucion(48);
        setUnidadTiempo('HORAS');
      }
    } catch (err) {
      console.error('Error al cargar configuración', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarreras();
  }, []);

  useEffect(() => {
    if (selectedCarreraId) {
      fetchConfig(selectedCarreraId, selectedTipoDefensa);
    }
  }, [selectedCarreraId, selectedTipoDefensa]);

  const guardarCambios = async () => {
    setSaving(true);
    try {
      const payload = {
        carreraId: selectedCarreraId,
        tipoDefensa: selectedTipoDefensa,
        mismoMomento,
        anticipacionDefensa,
        plazoResolucion,
        unidadTiempo,
      };
      await api.post('/sorteo-config', payload);
      alert('Configuración guardada correctamente.');
    } catch (err) {
      alert('Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 font-sans">
        <EncabezadoPagina
          titulo="Configuración"
          descripcion="Define las reglas de sorteo y plazos operativos por carrera y tipo de defensa, además de auditar el control de acceso."
          accion={
            <button
              type="button"
              onClick={guardarCambios}
              disabled={saving || !selectedCarreraId}
              className="bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Guardando...' : 'Guardar configuración'}
            </button>
          }
        />

        {/* Sección RF-05: Reglas de sorteo */}
        <section className="border border-line bg-white shadow-sm">
          <header className="border-b border-line px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Procedimiento y Reglas de Sorteo (RF-05)</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Parámetros operativos específicos por carrera y tipo de defensa</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCarreraId}
                onChange={(e) => setSelectedCarreraId(e.target.value)}
                className="border border-line bg-surface px-3 py-1.5 text-xs font-medium outline-none focus:border-ink"
              >
                {carreras.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>

              <select
                value={selectedTipoDefensa}
                onChange={(e) => setSelectedTipoDefensa(e.target.value as any)}
                className="border border-line bg-surface px-3 py-1.5 text-xs font-medium outline-none focus:border-ink"
              >
                <option value="INTERNA">Defensa Interna</option>
                <option value="EXTERNA">Defensa Externa</option>
              </select>
            </div>
          </header>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="size-6 animate-spin rounded-full border-2 border-ink border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line">
              <div className="p-5 flex flex-col gap-4">
                <h3 className="text-xs font-semibold text-neutral-800 tracking-wider uppercase">Secuencia del Sorteo</h3>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 border border-neutral-100 p-3 bg-neutral-50/50">
                    <input
                      type="checkbox"
                      id="mismoMomento"
                      checked={mismoMomento}
                      onChange={(e) => setMismoMomento(e.target.checked)}
                      className="size-4"
                    />
                    <div>
                      <label htmlFor="mismoMomento" className="text-xs font-semibold text-neutral-800 select-none block">
                        Área y Caso en el mismo acto
                      </label>
                      <span className="text-[11px] text-neutral-500">
                        Si está marcado, el estudiante sortea el área y el caso en el mismo sorteo.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Unidad de Tiempo Aplicable</label>
                  <select
                    value={unidadTiempo}
                    onChange={(e) => setUnidadTiempo(e.target.value as any)}
                    className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                  >
                    <option value="HORAS">Horas</option>
                    <option value="DIAS_CALENDARIO">Días Calendario</option>
                    <option value="DIAS_HABILES">Días Hábiles</option>
                  </select>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <h3 className="text-xs font-semibold text-neutral-800 tracking-wider uppercase">Plazos y Anticipación</h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    Anticipación respecto a la defensa ({unidadTiempo.toLowerCase()})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={anticipacionDefensa}
                    onChange={(e) => setAnticipacionDefensa(Number(e.target.value))}
                    className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                  />
                  <span className="text-[11px] text-neutral-400">
                    Tiempo de holgura mínimo entre el acto de sorteo y el día de la defensa.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    Plazo disponible para resolver el caso ({unidadTiempo.toLowerCase()})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={plazoResolucion}
                    onChange={(e) => setPlazoResolucion(Number(e.target.value))}
                    className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                  />
                  <span className="text-[11px] text-neutral-400">
                    Límite otorgado al estudiante para desarrollar y entregar la solución de su caso.
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Sección RF-03: Control de acceso por perfil */}
        <section className="border border-line bg-white shadow-sm">
          <header className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">
              Control de acceso por perfil (RF-03)
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Auditoría visual de los módulos habilitados por rol en el sistema
            </p>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line bg-surface">
                <tr className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase font-semibold">
                  <th scope="col" className="px-5 py-3 font-medium">Módulo</th>
                  {roles.map((rol) => (
                    <th key={rol} scope="col" className="px-5 py-3 font-medium">{rol}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {todasLasPaginas.map((pagina) => (
                  <tr key={pagina.ruta} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-neutral-900">{pagina.nombre}</td>
                    {roles.map((rol) => {
                      const permitido = pagina.roles.includes(rol)
                      return (
                        <td key={rol} className="px-5 py-4">
                          {permitido ? (
                            <Check className="size-4 text-ink" />
                          ) : (
                            <Minus className="size-4 text-neutral-300" />
                          )}
                          <span className="sr-only">
                            {permitido ? 'Permitido' : 'Sin acceso'}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
