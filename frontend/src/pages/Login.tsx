import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader, GraduationCap, BookOpen, Award } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center text-white">
          {/* Logo */}
          <div className="flex items-center justify-center size-32 rounded-full bg-white/10 ring-4 ring-white/20 shadow-2xl backdrop-blur-sm p-4">
            <img
              src="/logo-uagrm.png"
              alt="Logo UAGRM"
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
              { icon: BookOpen,      label: 'Control académico integrado' },
              { icon: Award,         label: 'Reportes y estadísticas' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left backdrop-blur-sm">
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
          <img src="/logo-uagrm.png" alt="Logo UAGRM" className="size-16 object-contain" />
          <h1 className="text-2xl font-extrabold text-[#c8102e]">UTEPSA</h1>
          <p className="text-xs text-gray-500 text-center">Sistema de Gestión de Exámenes de Grado</p>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-1 h-1 w-10 rounded-full bg-[#c8102e]" />
            <h2 className="text-3xl font-extrabold text-gray-900 mt-3">
              Iniciar Sesión
            </h2>
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
                  placeholder="usuario@uagrm.edu.bo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Contraseña
              </label>
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
            <br />Todos los derechos reservados.
          </p>
        </div>
      </div>
    </main>
  );
}
