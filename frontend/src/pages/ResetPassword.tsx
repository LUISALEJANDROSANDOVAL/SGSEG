import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import api from '../lib/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('El token de restablecimiento es requerido.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifícalas e inténtalo de nuevo.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
      });

      setSuccess(
        res.data?.message ||
          '¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión con tu nueva clave.'
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'No se pudo restablecer la contraseña. El enlace puede haber expirado o ser inválido.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen font-sans antialiased bg-[#f8f9fa] items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        {/* Encabezado */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center justify-center size-14 rounded-2xl bg-red-50 ring-4 ring-red-100/60 text-[#c8102e] mb-3 shadow-inner">
            <KeyRound className="size-7" />
          </div>
          <span className="inline-block px-3 py-1 mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#c8102e] bg-red-50 rounded-full border border-red-100">
            Seguridad Institucional UTEPSA
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Restablecer Contraseña
          </h1>
          <p className="mt-1 text-xs text-gray-500 max-w-xs">
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta en SGSEG.
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-500" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Estado Exitoso */}
        {success ? (
          <div className="flex flex-col items-center text-center py-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3 animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              ¡Contraseña Restablecida!
            </h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              {success}
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8102e] py-3 text-sm font-bold text-white shadow-md hover:bg-[#a50d26] transition-all"
            >
              <ArrowLeft className="size-4" />
              Ir a Iniciar Sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Campo Token si no viene en la URL */}
            {!tokenFromUrl && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Token o Código de Recuperación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Pega el token recibido"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 text-xs font-mono text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20"
                />
              </div>
            )}

            {/* Nueva Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Lock className="size-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Lock className="size-4" />
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-[11px] text-gray-500 flex items-start gap-2">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Tu nueva contraseña será encriptada con algoritmo seguro de grado institucional.
              </span>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8102e] py-3 text-sm font-bold text-white shadow-md shadow-red-900/10 transition-all hover:bg-[#a50d26] disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? 'Guardando nueva clave...' : 'Guardar Nueva Contraseña'}
            </button>

            {/* Enlace volver */}
            <div className="mt-3 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#c8102e] transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
