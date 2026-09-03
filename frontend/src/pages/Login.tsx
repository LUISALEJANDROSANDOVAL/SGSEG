import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
  Lock,
  Mail,
  AlertCircle,
  Loader,
  GraduationCap,
  BookOpen,
  Award,
  UserCheck,
  KeyRound,
  CheckCircle2,
  X,
  ArrowLeft,
} from 'lucide-react';
import type { Rol } from '../context/AuthContext';

const ROLES_RAPIDOS: { rol: Rol; label: string; color: string }[] = [
  { rol: 'Coordinador General', label: 'Coordinadora General', color: '#c8102e' },
  { rol: 'Jefe de Carrera', label: 'Jefe de Carrera', color: '#9b1c1c' },
  { rol: 'Secretario de Facultad', label: 'Secretario de Facultad', color: '#b91c1c' },
  { rol: 'Vicerrectorado', label: 'Vicerrectorado', color: '#7f1d1d' },
];

export default function Login() {
  const { login, loginAsRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para Modal de Recuperación de Contraseña
  const [modalRecuperarAbierto, setModalRecuperarAbierto] = useState(false);
  const [correoRecuperacion, setCorreoRecuperacion] = useState('');
  const [cargandoRecuperacion, setCargandoRecuperacion] = useState(false);
  const [errorRecuperacion, setErrorRecuperacion] = useState<string | null>(null);
  const [exitoRecuperacion, setExitoRecuperacion] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error en las credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRecuperacion(null);
    setExitoRecuperacion(null);
    setCargandoRecuperacion(true);

    try {
      const response = await api.post('/auth/recuperar-password', {
        email: correoRecuperacion.trim(),
      });
      setExitoRecuperacion(
        response.data?.message ||
          `Se han enviado las instrucciones de restablecimiento al correo institucional ${correoRecuperacion}.`
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'No se pudo procesar la solicitud de recuperación. Intenta nuevamente.';
      setErrorRecuperacion(msg);
    } finally {
      setCargandoRecuperacion(false);
    }
  };

  const abrirModalRecuperacion = () => {
    setCorreoRecuperacion(email || '');
    setErrorRecuperacion(null);
    setExitoRecuperacion(null);
    setModalRecuperarAbierto(true);
  };

  const cerrarModalRecuperacion = () => {
    setModalRecuperarAbierto(false);
    setErrorRecuperacion(null);
    setExitoRecuperacion(null);
  };

  return (
    <main className="flex min-h-screen font-sans antialiased">
      {/* ── LEFT PANEL – Institutional branding ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden bg-[#c8102e]">
        {/* Diagonal decorative shapes */}
        <div className="absolute -top-24 -right-24 size-80 rotate-45 rounded-3xl bg-white/5" />
        <div className="absolute bottom-0 -left-16 size-64 rotate-12 rounded-3xl bg-black/10" />
        <div className="absolute top-1/2 right-0 size-48 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

        {/* Animated diagonal stripe pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center text-white">
          {/* Logo */}
          <div className="flex items-center justify-center size-32 rounded-full bg-white/10 ring-4 ring-white/20 shadow-2xl backdrop-blur-sm p-4">
            <img
              src="/logo-uagrm.png"
              alt="Logo UTEPSA"
              className="size-24 object-contain drop-shadow-lg"
            />
          </div>

          {/* Title block */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70 mb-2">
              Universidad Tecnológica Privada de Santa Cruz
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
              UTEPSA
            </h1>
            <p className="mt-1 text-base font-medium text-white/80 leading-relaxed">
              Sistema de Gestión de Exámenes de Grado
            </p>
            <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-yellow-400" />
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {[
              { icon: GraduationCap, label: 'Gestión de sorteos de temas' },
              { icon: BookOpen, label: 'Control académico integrado' },
              { icon: Award, label: 'Reportes y estadísticas' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left backdrop-blur-sm"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <Icon className="size-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white/90">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom footer text */}
        <p className="absolute bottom-6 text-xs text-white/40">
          UTEPSA · © {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>

      {/* ── RIGHT PANEL – Login form ── */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-white px-6 py-12">
        {/* Mobile-only logo */}
        <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
          <img src="/logo-uagrm.png" alt="Logo UTEPSA" className="size-16 object-contain" />
          <h1 className="text-2xl font-extrabold text-[#c8102e]">UTEPSA</h1>
          <p className="text-xs text-gray-500 text-center">
            Sistema de Gestión de Exámenes de Grado
          </p>
        </div>

        <div className="w-full max-w-md">
          {/* ── Acceso rápido por rol ── */}
          <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <UserCheck className="size-4 text-[#c8102e]" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Ingresar como
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ROLES_RAPIDOS.map(({ rol, label }) => (
                <button
                  key={rol}
                  type="button"
                  onClick={() => {
                    loginAsRole(rol);
                    navigate('/');
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[#c8102e]/20 bg-white px-3 py-2.5 text-left text-xs font-semibold text-[#c8102e] shadow-sm transition-all hover:bg-[#c8102e] hover:text-white hover:shadow-md active:scale-95"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#c8102e]/10 text-[10px] font-black group-hover:bg-white/20">
                    {label.charAt(0)}
                  </span>
                  <span className="leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-1 h-1 w-10 rounded-full bg-[#c8102e]" />
            <h2 className="text-3xl font-extrabold text-gray-900 mt-3">Iniciar Sesión</h2>
            <p className="mt-2 text-sm text-gray-500">
              Ingresa tus credenciales institucionales para continuar.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="size-5 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Correo Institucional
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
                  <Mail className="size-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="usuario@utepsa.edu.bo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={abrirModalRecuperacion}
                  className="text-xs font-semibold text-[#c8102e] hover:underline focus:outline-none transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
                  <Lock className="size-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8102e] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-[#a50d26] hover:shadow-red-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                'Ingresar al Sistema'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">UTEPSA</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Universidad Tecnológica Privada de Santa Cruz.
            <br />
            Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* ── MODAL RECUPERACIÓN DE CONTRASEÑA ── */}
      {modalRecuperarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 relative">
            <button
              type="button"
              onClick={cerrarModalRecuperacion}
              className="absolute top-4 right-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <X className="size-5" />
            </button>

            {!exitoRecuperacion ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-[#c8102e]">
                    <KeyRound className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Recuperar Contraseña
                    </h3>
                    <p className="text-xs text-gray-500">
                      Acceso institucional seguro UTEPSA
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  Ingresa tu correo institucional registrado para recibir un enlace seguro de restablecimiento de clave.
                </p>

                {errorRecuperacion && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{errorRecuperacion}</span>
                  </div>
                )}

                <form onSubmit={handleRecuperarPassword} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Correo Institucional *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <Mail className="size-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="usuario@utepsa.edu.bo"
                        value={correoRecuperacion}
                        onChange={(e) => setCorreoRecuperacion(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20"
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={cerrarModalRecuperacion}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={cargandoRecuperacion || !correoRecuperacion.trim()}
                      className="flex items-center gap-2 rounded-xl bg-[#c8102e] px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-[#a50d26] disabled:opacity-60"
                    >
                      {cargandoRecuperacion && <Loader className="size-4 animate-spin" />}
                      {cargandoRecuperacion ? 'Enviando...' : 'Enviar enlace'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-2">
                <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ¡Correo Enviado!
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  {exitoRecuperacion}
                </p>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-500 mb-6 text-left w-full">
                  <p className="font-semibold text-gray-700 mb-1">Pasos siguientes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Abre tu cliente de correo institucional.</li>
                    <li>Haz clic en el enlace recibido antes de que expire (15 min).</li>
                    <li>Ingresa tu nueva contraseña para acceder.</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={cerrarModalRecuperacion}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8102e] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#a50d26] transition-all"
                >
                  <ArrowLeft className="size-4" />
                  Volver al inicio de sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
