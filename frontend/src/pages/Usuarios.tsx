import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { EncabezadoPagina } from '@/components/encabezado-pagina';
import api from '../lib/api';
import { Edit2, ToggleRight, Plus, AlertCircle, X, Shield } from 'lucide-react';

export default function PaginaUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [carreras, setCarreras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario de edición/creación
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRol, setFormRol] = useState('Secretario de Facultad');
  const [formCarreraId, setFormCarreraId] = useState('');
  const [formActivo, setFormActivo] = useState(true);

  const rolesDisponibles = [
    'Coordinador General',
    'Secretario de Facultad',
    'Jefe de Carrera',
    'Vicerrectorado',
    'Registro',
    'Defensas de Grado',
  ];

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const [resUsers, resCarreras] = await Promise.all([
        api.get('/auth/users').catch(() => api.get('/users')),
        api.get('/estudiantes/carreras').catch(() => api.get('/academia/carreras')),
      ]);
      setUsuarios(Array.isArray(resUsers.data) ? resUsers.data : []);
      setCarreras(Array.isArray(resCarreras.data) ? resCarreras.data : []);
    } catch (err: any) {
      setError('Error al cargar la información de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const abrirModalCrear = () => {
    setEditId(null);
    setFormNombre('');
    setFormEmail('');
    setFormPassword('');
    setFormRol('Secretario de Facultad');
    setFormCarreraId('');
    setFormActivo(true);
    setModalAbierto(true);
  };

  const abrirModalEditar = (u: any) => {
    setEditId(u.id);
    setFormNombre(u.nombre);
    setFormEmail(u.email);
    setFormPassword(''); // Contraseña vacía por seguridad al editar
    setFormRol(u.rol);
    setFormCarreraId(u.carreraId || '');
    setFormActivo(u.activo);
    setModalAbierto(true);
  };

  const guardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRol === 'Jefe de Carrera' && !formCarreraId) {
      alert('Debe asignar obligatoriamente una Carrera al usuario con rol "Jefe de Carrera".');
      return;
    }
    try {
      const payload: any = {
        nombre: formNombre,
        email: formEmail,
        rol: formRol,
        carreraId: formRol === 'Jefe de Carrera' ? formCarreraId : null,
        activo: formActivo,
      };

      if (!editId) {
        // Creación requiere contraseña
        if (!formPassword) {
          alert('Debe especificar una contraseña');
          return;
        }
        payload.password = formPassword;
        await api.post('/users', payload);
      } else {
        // Edición opcional de contraseña
        if (formPassword) {
          payload.password = formPassword;
        }
        await api.put(`/users/${editId}`, payload);
      }

      setModalAbierto(false);
      fetchDatos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar el usuario.');
    }
  };

  const desactivarUsuario = async (id: string) => {
    if (!confirm('¿Está seguro de desactivar esta cuenta?')) return;
    try {
      await api.patch(`/users/${id}/deactivate`);
      fetchDatos();
    } catch (err) {
      alert('Error al desactivar el usuario.');
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 font-sans">
        <EncabezadoPagina
          titulo="Usuarios y Roles"
          descripcion="Panel de control para registrar cuentas institucionales, asignar roles y controlar estados de activación."
          accion={
            <button
              onClick={abrirModalCrear}
              className="flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
            >
              <Plus className="size-4" />
              Nuevo usuario
            </button>
          }
        />

        {error && (
          <div className="flex items-center gap-3 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-ink border-t-transparent"></div>
          </div>
        ) : (
          <section className="border border-line bg-white shadow-sm">
            <header className="border-b border-line px-5 py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight">Cuentas Registradas</h2>
              <span className="text-xs text-neutral-500">{usuarios.length} usuarios</span>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-line bg-surface">
                  <tr className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase font-semibold">
                    <th scope="col" className="px-5 py-3 font-medium">Nombre</th>
                    <th scope="col" className="px-5 py-3 font-medium">Email</th>
                    <th scope="col" className="px-5 py-3 font-medium">Rol</th>
                    <th scope="col" className="px-5 py-3 font-medium">Carrera Asignada</th>
                    <th scope="col" className="px-5 py-3 font-medium">Estado</th>
                    <th scope="col" className="px-5 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-neutral-900">{u.nombre}</td>
                      <td className="px-5 py-4 text-neutral-600">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                          <Shield className="size-3 text-slate-500" />
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-neutral-500">
                        {u.rol === 'Jefe de Carrera' ? (
                          u.carrera?.nombre || 'No asignada'
                        ) : (
                          <span className="text-xs italic text-neutral-400">Global</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full ${
                            u.activo
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirModalEditar(u)}
                            className="p-1.5 text-neutral-500 hover:text-ink transition-colors hover:bg-neutral-100 rounded"
                            title="Editar usuario"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          {u.activo && (
                            <button
                              onClick={() => desactivarUsuario(u.id)}
                              className="p-1.5 text-neutral-500 hover:text-red-600 transition-colors hover:bg-red-50 rounded"
                              title="Desactivar cuenta"
                            >
                              <ToggleRight className="size-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Modal de Usuario */}
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
                {editId ? 'Editar Cuenta' : 'Registrar Nuevo Usuario'}
              </h3>

              <form onSubmit={guardarUsuario} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-neutral-600">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-600">Email Institucional</label>
                    {editId && <span className="text-[10px] text-neutral-400 font-normal">Permanente (No editable)</span>}
                  </div>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editId)}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className={`w-full border border-line px-3 py-2 text-sm outline-none ${
                      editId
                        ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
                        : 'bg-surface focus:border-ink focus:bg-white'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-neutral-600">
                    Contraseña {editId && <span className="text-neutral-400 font-normal">(Opcional para actualizar)</span>}
                  </label>
                  <input
                    type="password"
                    required={!editId}
                    placeholder={editId ? 'Dejar vacío para no cambiar' : 'Contraseña inicial'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-neutral-600">Rol del Sistema</label>
                  <select
                    value={formRol}
                    onChange={(e) => setFormRol(e.target.value)}
                    className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                  >
                    {rolesDisponibles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {formRol === 'Jefe de Carrera' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-neutral-600">Carrera Vinculada</label>
                    <select
                      value={formCarreraId}
                      required
                      onChange={(e) => setFormCarreraId(e.target.value)}
                      className="w-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white"
                    >
                      <option value="">Seleccione carrera...</option>
                      {carreras.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="formActivo"
                    checked={formActivo}
                    onChange={(e) => setFormActivo(e.target.checked)}
                    className="size-4"
                  />
                  <label htmlFor="formActivo" className="text-xs font-semibold text-neutral-600 select-none">
                    Cuenta Activa
                  </label>
                </div>

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
