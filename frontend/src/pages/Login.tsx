import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  BookOpen,
  Award,
  ShieldCheck,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface CuentaDemo {
  email: string;
  pass: string;
  label: string;
  rol: string;
  detalle: string;
}

const CUENTAS_DEMO: CuentaDemo[] = [
  {
    email: 'coord@uni.edu.bo',
    pass: 'Admin123!',
    label: 'Coordinación General',
    rol: 'COORDINACION',
    detalle: 'Acceso total y configuración',
  },
  {
    email: 'jefe.sistemas@uni.edu.bo',
    pass: 'Admin123!',
    label: 'Jefe de Carrera',
    rol: 'JEFE_CARRERA',
    detalle: 'Ing. Sistemas / Casos y Áreas',
  },
  {
    email: 'secretaria@uni.edu.bo',
    pass: 'Admin123!',
    label: 'Secretaría Académica',
    rol: 'SECRETARIADO',
    detalle: 'Habilitación de postulantes',
  },
  {
    email: 'vicerrector@uni.edu.bo',
    pass: 'Admin123!',
    label: 'Vicerrectorado',
    rol: 'VICERRECTORADO',
    detalle: 'Supervisión y auditoría',
  },
];

export default function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoSelected, setDemoSelected] = useState<string | null>(null);

  const destination = (location.state as any)?.from?.pathname || '/';

  // Si ya hay un usuario autenticado y no está cargando, redirigir automáticamente
  useEffect(() => {
    if (!authLoading && user) {
      navigate(destination, { replace: true });
    }
  }, [user, authLoading, navigate, destination]);

  const executeLogin = async (userEmail: string, userPass: string) => {
    setError(null);
    setSubmitting(true);

    try {
      await login(userEmail, userPass);
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Error en las credenciales.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Por favor ingresa tu correo institucional y contraseña.');
      return;
    }
    await executeLogin(email, password);
  };

  const handleSelectDemo = async (cuenta: CuentaDemo) => {
    setEmail(cuenta.email);
    setPassword(cuenta.pass);
    setDemoSelected(cuenta.email);
    await executeLogin(cuenta.email, cuenta.pass);
  };

  return (
    <main className="flex min-h-screen font-sans antialiased bg-[#f8f9fa]">

      {/* ── PANEL IZQUIERDO – Branding Institucional UTEPSA ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden bg-[#c8102e]">

        {/* Formas geométricas sutiles de fondo */}
        <div className="absolute -top-28 -right-28 size-96 rotate-45 rounded-3xl bg-white/5" />
        <div className="absolute -bottom-20 -left-20 size-80 rotate-12 rounded-3xl bg-black/10" />
        <div className="absolute top-1/2 right-0 size-56 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

        {/* Patrón diagonal */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Bloque central de presentación */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center text-white max-w-lg">
          
          {/* Logo UTEPSA */}
          <div className="flex items-center justify-center size-28 rounded-full bg-white/10 ring-4 ring-white/20 shadow-2xl backdrop-blur-md p-4 transition-transform hover:scale-105 duration-300">
            <img
              src="/logo-uagrm.png"
              alt="Logo UTEPSA"
              className="size-20 object-contain drop-shadow-md"
            />
          </div>

          {/* Título institucional */}
          <div>
            <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold uppercase tracking-widest text-white/80 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
              Plataforma Oficial de Grado
            </span>
            <h1 className="text-4xl font-black tracking-tight drop-shadow-sm">
              SGSEG · UTEPSA
            </h1>
            <p className="mt-2 text-sm font-medium text-white/85 leading-relaxed">
              Sistema de Gestión Integral de Exámenes de Grado, Sorteo Algorítmico y Defensas
            </p>
            <div className="mt-4 mx-auto h-1 w-20 rounded-full bg-yellow-400 shadow-sm" />
          </div>

          {/* Tarjetas de pilares académicos */}
          <div className="flex flex-col gap-3 w-full">
            {[
              {
                icon: ShieldCheck,
                titulo: 'Sorteo Criptográfico Auditado',
                desc: 'Selección pseudoaleatoria CSPRNG con actas inmutables.',
              },
              {
                icon: BookOpen,
                titulo: 'Control de Casos y Plazos',
                desc: 'Límite reglamentario de 2 defensas por caso y control de stock.',
              },
              {
                icon: Award,
                titulo: 'Trazabilidad y Calificaciones',
                desc: 'Consolidación de notas internas y externas en tiempo real.',
              },
            ].map(({ icon: Icon, titulo, desc }) => (
              <div
                key={titulo}
                className="flex items-center gap-3.5 rounded-xl bg-white/10 p-3.5 text-left backdrop-blur-md border border-white/10 shadow-sm"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/20 shadow-inner">
                  <Icon className="size-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white leading-snug">{titulo}</p>
                  <p className="text-[11px] text-white/75 truncate mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-white/50 pt-2">
            Universidad Tecnológica Privada de Santa Cruz · © {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO – Formulario de Autenticación ── */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-white px-6 py-10 sm:px-12">

        {/* Encabezado móvil */}
        <div className="mb-6 flex flex-col items-center gap-2 lg:hidden">
          <img src="/logo-uagrm.png" alt="Logo UTEPSA" className="size-14 object-contain" />
          <h1 className="text-2xl font-black text-[#c8102e]">SGSEG UTEPSA</h1>
          <p className="text-xs text-gray-500">Gestión de Exámenes de Grado</p>
        </div>

        <div className="w-full max-w-md">

          {/* Selector de Cuentas de Demostración */}
          <div className="mb-7 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 shadow-sm">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="size-4 text-[#c8102e]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Acceso Rápido por Actor
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                JWT Backend Real
              </span>
            </div>

            <p className="text-[11px] text-gray-500 mb-3">
              Selecciona un perfil institucional para iniciar sesión automáticamente con credenciales verificadas en la base de datos:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {CUENTAS_DEMO.map((c) => {
                const isActive = demoSelected === c.email && submitting;
                return (
                  <button
                    key={c.email}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSelectDemo(c)}
                    className={`group relative flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all duration-150 ${
                      isActive
                        ? 'border-[#c8102e] bg-red-50/60 ring-2 ring-[#c8102e]/20'
                        : 'border-gray-200 bg-white hover:border-[#c8102e]/60 hover:bg-red-50/30 hover:shadow-sm'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-gray-900 group-hover:text-[#c8102e]">
                        {c.label}
                      </span>
                      {isActive ? (
                        <Loader2 className="size-3 animate-spin text-[#c8102e]" />
                      ) : (
                        <ArrowRight className="size-3 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#c8102e]" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 truncate mt-1">
                      {c.detalle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título de Formulario */}
          <div className="mb-6">
            <div className="h-1 w-10 rounded-full bg-[#c8102e]" />
            <h2 className="text-2xl font-black text-gray-900 mt-2.5">
              Iniciar Sesión
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Ingresa tus credenciales institucionales para acceder a tu panel.
            </p>
          </div>

          {/* Alerta de Error */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-in fade-in duration-200"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Correo */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-xs font-bold text-gray-700">
                Correo Institucional
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Mail className="size-4" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="usuario@uni.edu.bo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-bold text-gray-700">
                  Contraseña
                </label>
                <span className="text-[11px] text-gray-400">Default: Admin123!</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Lock className="size-4" />
                </span>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Botón Submit */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8102e] px-4 py-3 text-sm font-bold text-white shadow-md shadow-red-200 transition-all hover:bg-[#a50d26] hover:shadow-lg active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Autenticando en SGSEG...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Pie informativo */}
          <div className="mt-8 border-t border-gray-100 pt-4 text-center">
            <p className="text-xs text-gray-400">
              SGSEG · Módulo de Autenticación Centralizada UTEPSA
              <br />
              Servicios protegidos con JWT Bearer y Roles RBAC
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
