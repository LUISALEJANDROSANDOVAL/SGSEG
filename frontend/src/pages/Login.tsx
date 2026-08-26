import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader } from 'lucide-react';

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0c] text-white font-sans antialiased">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0c] to-[#050507]"></div>
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-violet-600/10 blur-[128px]"></div>
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-blue-500/10 blur-[128px]"></div>

      <div className="relative w-full max-w-[420px] px-6">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl ring-1 ring-white/20">
            <span className="text-xl font-bold tracking-wider text-blue-400">S</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            SGSEG
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Sistema de Gestión de Exámenes de Grado
          </p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-white/10">
          <h2 className="text-lg font-semibold tracking-tight text-white mb-6">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-neutral-300">
                Correo Institucional
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-neutral-500">
                  <Mail className="size-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="ejemplo@sgseg.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-blue-500 focus:bg-black/40 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-neutral-300">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-neutral-500">
                  <Lock className="size-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-blue-500 focus:bg-black/40 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/35 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0c] disabled:opacity-50"
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
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-neutral-500">
          UAGRM · © 2026 Todos los derechos reservados.
        </p>
      </div>
    </main>
  );
}
