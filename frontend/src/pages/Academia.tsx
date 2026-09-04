import { useState, useEffect, useMemo } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { EncabezadoPagina } from '@/components/encabezado-pagina';
import api from '../lib/api';
import { GraduationCap, Landmark, BookOpen, Layers, Plus, X, ChevronRight, Check, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PaginaAcademia() {
  const { user } = useAuth();
  const esJefe = user?.rol === 'Jefe de Carrera';
  const jefeCarreraId = user?.carreraId || '1';

  // Si es Jefe de Carrera, inicia directamente en 'areas' y no puede ver facultades ni carreras
  const [activeTab, setActiveTab] = useState<'facultades' | 'carreras' | 'areas' | 'pensums'>(
    esJefe ? 'areas' : 'facultades'
  );
  const [facultades, setFacultades] = useState<any[]>([]);
  const [carreras, setCarreras] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [pensums, setPensums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Campos de formulario
  const [formNombre, setFormNombre] = useState('');
  const [selectedFacultadId, setSelectedFacultadId] = useState('');
  const [selectedCarreraId, setSelectedCarreraId] = useState(esJefe ? jefeCarreraId : '');
  const [selectedPensumIds, setSelectedPensumIds] = useState<string[]>([]);

  // Sincronizar si cambia el rol a Jefe
  useEffect(() => {
    if (esJefe) {
      setActiveTab('areas');
      setSelectedCarreraId(jefeCarreraId);
    }
  }, [esJefe, jefeCarreraId]);

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const [resFacs, resCarreras, resAreas, resPensums] = await Promise.all([
        api.get('/academia/facultades'),
        api.get('/academia/carreras'),
        api.get('/academia/areas'),
        api.get('/academia/pensums'),
      ]);
      setFacultades(resFacs.data);
      setCarreras(resCarreras.data);
      setAreas(resAreas.data);
      setPensums(resPensums.data);
    } catch (err) {
      console.error('Error al cargar datos académicos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  // Filtrar áreas y pensums para que el Jefe de Carrera solo vea los de su carrera
  const areasFiltradas = useMemo(() => {
    if (!esJefe) return areas;
    return areas.filter((a) => String(a.carreraId) === String(jefeCarreraId));
  }, [areas, esJefe, jefeCarreraId]);

  const pensumsFiltrados = useMemo(() => {
    if (!esJefe) return pensums;
    return pensums.filter((p) => String(p.carreraId) === String(jefeCarreraId));
  }, [pensums, esJefe, jefeCarreraId]);

  const carreraActualJefe = useMemo(() => {
    return carreras.find((c) => String(c.id) === String(jefeCarreraId))?.nombre || 'Ingeniería de Sistemas';
  }, [carreras, jefeCarreraId]);

  const abrirCrear = () => {
    setEditId(null);
    setFormNombre('');
    setSelectedFacultadId('');
    setSelectedCarreraId(esJefe ? jefeCarreraId : '');
    setSelectedPensumIds([]);
    setModalAbierto(true);
  };

  const abrirEditar = (item: any) => {
    setEditId(item.id);
    setFormNombre(item.nombre);
    if (activeTab === 'carreras') {
      setSelectedFacultadId(item.facultadId);
    } else if (activeTab === 'areas') {
      setSelectedCarreraId(item.carreraId);
      setSelectedPensumIds(item.pensums?.map((ap: any) => ap.pensumId) || []);
    } else if (activeTab === 'pensums') {
      setSelectedCarreraId(item.carreraId);
    }
    setModalAbierto(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'facultades') {
        if (!editId) await api.post('/academia/facultades', { nombre: formNombre });
        else await api.put(`/academia/facultades/${editId}`, { nombre: formNombre });
      } else if (activeTab === 'carreras') {
        const payload = { nombre: formNombre, facultadId: selectedFacultadId };
        if (!editId) await api.post('/academia/carreras', payload);
        else await api.put(`/academia/carreras/${editId}`, payload);
      } else if (activeTab === 'areas') {
        const payload = {
          nombre: formNombre,
          carreraId: selectedCarreraId,
          pensumIds: selectedPensumIds,
        };
        if (!editId) await api.post('/academia/areas', payload);
        else await api.put(`/academia/areas/${editId}`, payload);
      } else if (activeTab === 'pensums') {
        const payload = { nombre: formNombre, carreraId: selectedCarreraId };
        if (!editId) await api.post('/academia/pensums', payload);
        else await api.put(`/academia/pensums/${editId}`, payload);
      }

      setModalAbierto(false);
      fetchDatos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar cambios.');
    }
  };

  const togglePensumSelect = (id: string) => {
    setSelectedPensumIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  // Título del modal dinámico según pestaña activa
  const getModalTitle = () => {
    const accion = editId ? 'Editar' : 'Registrar';
    switch (activeTab) {
      case 'facultades': return `${accion} Facultad`;
      case 'carreras': return `${accion} Carrera`;
      case 'areas': return `${accion} Área Académica`;
      case 'pensums': return `${accion} Plan de Estudios (Pensum)`;
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 font-sans">
        <EncabezadoPagina
          titulo="Estructura Académica"
          descripcion="Administra facultades, carreras, áreas de especialización y planes de estudio vinculados."
          accion={
            (!esJefe || activeTab === 'areas' || activeTab === 'pensums') && (
              <button
                onClick={abrirCrear}
                className="flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
              >
                <Plus className="size-4" />
                Registrar nuevo
              </button>
            )
          }
        />

        {/* Insignia de Aislamiento Estricto para Jefe de Carrera (RNF-01, RNF-02) */}
        {esJefe && (
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
                  <span className="inline-flex items-center gap-1 bg-neutral-200 px-1.5 py-0.5 text-[10px] font-medium text-neutral-800">
                    <Lock className="h-2.5 w-2.5" /> Contexto Restringido
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-semibold text-neutral-900">
                  Visualizando y administrando únicamente la estructura de:{' '}
                  <span className="text-crimson font-bold">{carreraActualJefe}</span>
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-neutral-500 font-mono">
              carreraId: {jefeCarreraId}
            </span>
          </div>
        )}

        {/* Pestañas (Tabs) - Facultades y Carreras no visibles para Jefe de Carrera */}
        <div className="flex border-b border-line bg-white px-2">
          {!esJefe && (
            <>
              <button
                onClick={() => setActiveTab('facultades')}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'facultades'
                    ? 'border-ink text-ink font-bold'
                    : 'border-transparent text-neutral-400 hover:text-ink'
                }`}
              >
                <Landmark className="size-4" />
                Facultades
              </button>
              <button
                onClick={() => setActiveTab('carreras')}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'carreras'
                    ? 'border-ink text-ink font-bold'
                    : 'border-transparent text-neutral-400 hover:text-ink'
                }`}
              >
                <GraduationCap className="size-4" />
                Carreras
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('areas')}
            className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'areas'
                ? 'border-ink text-ink font-bold'
                : 'border-transparent text-neutral-400 hover:text-ink'
            }`}
          >
            <Layers className="size-4" />
            Áreas Académicas ({areasFiltradas.length})
          </button>
          <button
            onClick={() => setActiveTab('pensums')}
            className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'pensums'
                ? 'border-ink text-ink font-bold'
                : 'border-transparent text-neutral-400 hover:text-ink'
            }`}
          >
            <BookOpen className="size-4" />
            Pensums ({pensumsFiltrados.length})
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-ink border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* VISTA FACULTADES */}
            {!esJefe && activeTab === 'facultades' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facultades.map((f) => (
                  <div key={f.id} className="border border-line bg-white p-5 flex flex-col justify-between shadow-sm">
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight text-neutral-900">{f.nombre}</h3>
                      <p className="text-xs text-neutral-500 mt-1">{f.carreras.length} carreras asociadas</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                      <button
                        onClick={() => abrirEditar(f)}
                        className="text-xs font-medium text-neutral-600 hover:text-ink"
                      >
                        Editar facultad
                      </button>
                      <ChevronRight className="size-4 text-neutral-300" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA CARRERAS */}
            {!esJefe && activeTab === 'carreras' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {carreras.map((c) => (
                  <div key={c.id} className="border border-line bg-white p-5 flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-[9px] font-semibold tracking-[0.14em] text-neutral-400 uppercase">
                        {c.facultad?.nombre}
                      </span>
                      <h3 className="text-sm font-semibold tracking-tight text-neutral-900 mt-0.5">{c.nombre}</h3>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                      <button
                        onClick={() => abrirEditar(c)}
                        className="text-xs font-medium text-neutral-600 hover:text-ink"
                      >
                        Editar carrera
                      </button>
                      <ChevronRight className="size-4 text-neutral-300" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA AREAS ACADEMICAS */}
            {activeTab === 'areas' && (
              <div className="border border-line bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-line bg-surface">
                      <tr className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase font-semibold">
                        <th scope="col" className="px-5 py-3 font-medium">Área Académica</th>
                        <th scope="col" className="px-5 py-3 font-medium">Carrera</th>
                        <th scope="col" className="px-5 py-3 font-medium">Pensums Habilitados (RF-04)</th>
                        <th scope="col" className="px-5 py-3 font-medium text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {areasFiltradas.map((a) => (
                        <tr key={a.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-5 py-4 font-medium text-neutral-900">{a.nombre}</td>
                          <td className="px-5 py-4 text-neutral-600">{a.carrera?.nombre}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {a.pensums.map((ap: any) => (
                                <span key={ap.pensumId} className="inline-block bg-slate-100 px-2 py-0.5 text-xs text-neutral-700 font-medium">
                                  {ap.pensum?.nombre}
                                </span>
                              ))}
                              {a.pensums.length === 0 && (
                                <span className="text-xs text-neutral-400 italic">Ningún pensum vinculado</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => abrirEditar(a)}
                              className="text-xs font-semibold text-neutral-600 hover:text-ink"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {areasFiltradas.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-xs text-neutral-500">
                            No hay áreas académicas registradas para esta carrera.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VISTA PENSUMS */}
            {activeTab === 'pensums' && (
              <div className="border border-line bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-line bg-surface">
                      <tr className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase font-semibold">
                        <th scope="col" className="px-5 py-3 font-medium">Nombre de Pensum</th>
                        <th scope="col" className="px-5 py-3 font-medium">Carrera</th>
                        <th scope="col" className="px-5 py-3 font-medium text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {pensumsFiltrados.map((p) => (
                        <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-5 py-4 font-medium text-neutral-900">{p.nombre}</td>
                          <td className="px-5 py-4 text-neutral-600">{p.carrera?.nombre}</td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => abrirEditar(p)}
                              className="text-xs font-semibold text-neutral-600 hover:text-ink"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {pensumsFiltrados.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-xs text-neutral-500">
                            No hay planes de estudio registrados para esta carrera.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de Configuración Académica */}
        {modalAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white border border-line shadow-2xl p-6 relative">
              <button
                onClick={() => setModalAbierto(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-ink"
              >
                <X className="size-5" />
              </button>

              <h3 className="text-base font-semibold tracking-tight mb-4">{getModalTitle()}</h3>

              <form onSubmit={guardar} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-neutral-600">Denominación / Nombre</label>
                  <input
                    type="text"
                    required
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                  />
                </div>

                {activeTab === 'carreras' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-neutral-600">Facultad de pertenencia</label>
                    <select
                      value={selectedFacultadId}
                      required
                      onChange={(e) => setSelectedFacultadId(e.target.value)}
                      className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                    >
                      <option value="">Seleccionar facultad...</option>
                      {facultades.map((f) => (
                        <option key={f.id} value={f.id}>{f.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(activeTab === 'areas' || activeTab === 'pensums') && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-600">Carrera Vinculada</label>
                      {esJefe && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-crimson">
                          <Lock className="size-2.5" /> Bloqueado por Rol
                        </span>
                      )}
                    </div>
                    <select
                      value={selectedCarreraId}
                      required
                      disabled={esJefe}
                      onChange={(e) => setSelectedCarreraId(e.target.value)}
                      className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white disabled:bg-neutral-100 disabled:text-neutral-600 disabled:cursor-not-allowed"
                    >
                      <option value="">Seleccionar carrera...</option>
                      {carreras.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} {esJefe && String(c.id) === String(jefeCarreraId) ? '(Asignada)' : ''}
                        </option>
                      ))}
                    </select>
                    {esJefe && (
                      <span className="text-[10px] text-neutral-500 italic">
                        Los nuevos registros se enlazarán automáticamente a su carrera designada.
                      </span>
                    )}
                  </div>
                )}

                {activeTab === 'areas' && selectedCarreraId && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-600">Planes de Estudio Habilitados (Pensums)</label>
                    <div className="border border-line bg-surface p-3 flex flex-col gap-2 max-h-40 overflow-y-auto">
                      {pensums
                        .filter((p) => p.carreraId === selectedCarreraId)
                        .map((p) => {
                          const isSelected = selectedPensumIds.includes(p.id);
                          return (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => togglePensumSelect(p.id)}
                              className="flex items-center justify-between text-left text-xs text-neutral-700 border border-neutral-200 bg-white p-2 hover:border-neutral-400 select-none cursor-pointer"
                            >
                              <span>{p.nombre}</span>
                              {isSelected && <Check className="size-4 text-emerald-600" />}
                            </button>
                          );
                        })}
                      {pensums.filter((p) => p.carreraId === selectedCarreraId).length === 0 && (
                        <span className="text-xs italic text-neutral-400">Registre un pensum para esta carrera primero</span>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-2 w-full bg-ink py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
                >
                  Guardar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
