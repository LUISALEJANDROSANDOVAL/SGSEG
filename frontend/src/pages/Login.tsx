import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  BookOpen,
  Award,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Estados para Modal de Recuperación de Contraseña
  const [modalRecuperarAbierto, setModalRecuperarAbierto] = useState(false);
  const [pasoRecuperacion, setPasoRecuperacion] = useState<1 | 2 | 3>(1);
  const [correoRecuperacion, setCorreoRecuperacion] = useState('');
  const [tokenRecuperacion, setTokenRecuperacion] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
  const [cargandoRecuperacion, setCargandoRecuperacion] = useState(false);
  const [errorRecuperacion, setErrorRecuperacion] = useState<string | null>(null);
  const [exitoRecuperacion, setExitoRecuperacion] = useState<string | null>(null);

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

  const handleSolicitarRecuperacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRecuperacion(null);
    setCargandoRecuperacion(true);

    try {
      const response = await api.post('/auth/recuperar-password', {
        email: correoRecuperacion.trim(),
      });
      const token = response.data?.token;
      if (token) {
        setTokenRecuperacion(token);
        setPasoRecuperacion(2);
      } else {
        setExitoRecuperacion(
          response.data?.message ||
            `Se han enviado las instrucciones de restablecimiento al correo institucional ${correoRecuperacion}.`
        );
        setPasoRecuperacion(3);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'No se pudo procesar la solicitud de recuperación. Verifique el correo ingresado.';
      setErrorRecuperacion(msg);
    } finally {
      setCargandoRecuperacion(false);
    }
  };

  const handleGuardarNuevaPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRecuperacion(null);

    if (nuevaPassword.length < 6) {
      setErrorRecuperacion('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setErrorRecuperacion('Las contraseñas no coinciden. Verifícalas e inténtalo de nuevo.');
      return;
    }

    setCargandoRecuperacion(true);

    try {
      const res = await api.post('/auth/reset-password', {
        token: tokenRecuperacion,
        newPassword: nuevaPassword,
      });
      setExitoRecuperacion(
        res.data?.message || '¡Contraseña actualizada exitosamente!'
      );
      setPasoRecuperacion(3);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'No se pudo restablecer la contraseña. El enlace puede haber expirado.';
      setErrorRecuperacion(msg);
    } finally {
      setCargandoRecuperacion(false);
    }
  };

  const abrirModalRecuperacion = () => {
    setCorreoRecuperacion(email || '');
    setTokenRecuperacion('');
    setNuevaPassword('');
    setConfirmarPassword('');
    setErrorRecuperacion(null);
    setExitoRecuperacion(null);
    setPasoRecuperacion(1);
    setModalRecuperarAbierto(true);
  };

  const cerrarModalRecuperacion = () => {
    if (pasoRecuperacion === 3 && correoRecuperacion) {
      setEmail(correoRecuperacion);
      setPassword('');
    }
    setModalRecuperarAbierto(false);
    setPasoRecuperacion(1);
    setErrorRecuperacion(null);
    setExitoRecuperacion(null);
  };

  return (
    <main className="flex min-h-screen font-sans antialiased bg-surface text-neutral-900">
      {/* ── PANEL IZQUIERDO – Branding Institucional UTEPSA (Restaurado al diseño anterior) ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden bg-[#c8102e]">
        {/* Formas geométricas decorativas de fondo */}
        <div className="absolute -top-28 -right-28 size-96 rotate-45 rounded-3xl bg-white/5" />
        <div className="absolute -bottom-20 -left-20 size-80 rotate-12 rounded-3xl bg-black/10" />
        <div className="absolute top-1/2 right-0 size-56 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

        {/* Patrón diagonal */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Bloque central de presentación */}
        <div className="relative z-10 flex flex-col items-center gap-7 px-8 lg:px-10 text-center text-white max-w-xl xl:max-w-2xl w-full">
          {/* Logo UTEPSA */}
          <div className="flex items-center justify-center size-24 rounded-full bg-white/10 ring-4 ring-white/20 shadow-2xl backdrop-blur-md p-3.5 transition-transform hover:scale-105 duration-300">
            <img
              src="/logo-uagrm.png"
              alt="Logo UTEPSA"
              className="size-16 object-contain drop-shadow-md"
            />
          </div>

          {/* Título institucional */}
          <div className="w-full max-w-xl">
            <span className="inline-block px-3.5 py-1 mb-3 text-xs font-semibold uppercase tracking-widest text-white/85 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
              Plataforma Oficial de Grado
            </span>
            <h1 className="text-2xl lg:text-3xl xl:text-[32px] font-black tracking-tight leading-snug drop-shadow-sm text-balance">
              Sistema de Gestión Integral de Exámenes de Grado, Sorteo Algorítmico y Defensas
            </h1>
            <p className="mt-3 text-sm font-bold text-white tracking-wider uppercase drop-shadow-sm">
              SGSEG · UTEPSA
            </p>
            <div className="mt-4 mx-auto h-1 w-24 rounded-full bg-white shadow-sm" />
          </div>

          {/* Tarjetas de pilares académicos */}
          <div className="flex flex-col gap-3 w-full max-w-md">
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

          <div className="text-[11px] text-white/60 pt-1 font-medium">
            SGSEG · UTEPSA · © {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO – Formulario de Autenticación ── */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-surface px-6 py-12 sm:px-12">
        {/* Encabezado móvil */}
        <div className="mb-6 flex flex-col items-center gap-2 lg:hidden text-center max-w-sm">
          <img src="/logo-uagrm.png" alt="Logo UTEPSA" className="size-12 object-contain" />
          <h1 className="text-base font-bold text-neutral-900 leading-snug">
            Sistema de Gestión Integral de Exámenes de Grado
          </h1>
          <span className="border border-line bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-crimson">
            SGSEG · UTEPSA
          </span>
        </div>

        {/* Tarjeta del formulario estilo Dashboard */}
        <div className="w-full max-w-md border border-line bg-white p-7 sm:p-8 shadow-xs">
          {/* Header con barrita de acento carmesí idéntica al dashboard */}
          <div className="mb-6">
            <div className="h-1 w-8 bg-crimson mb-3" />
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">
              Iniciar Sesión
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Ingresa tus credenciales institucionales para acceder a tu panel.
            </p>
          </div>

          {/* Alerta de Error con diseño nítido */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-in fade-in"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Correo */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold text-neutral-700">
                Correo Institucional
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                  <Mail className="size-4" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="vicerrector@uni.edu.bo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full border border-line bg-surface py-2 pl-9 pr-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-ink focus:bg-white outline-none transition-colors disabled:bg-neutral-100"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-semibold text-neutral-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={abrirModalRecuperacion}
                  className="text-xs font-medium text-crimson hover:underline focus:outline-none transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                  <Lock className="size-4" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full border border-line bg-surface py-2 pl-9 pr-9 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-ink focus:bg-white outline-none transition-colors disabled:bg-neutral-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2.5 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer focus:outline-none"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Botón Submit rectangular con diseño de Dashboard */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 bg-crimson py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-95 shadow-xs transition-opacity focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Autenticando en SGSEG...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Pie informativo estilo Dashboard */}
          <div className="mt-8 border-t border-line pt-4 text-center">
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              SGSEG · Módulo de Autenticación Centralizada UTEPSA
              <br />
              Servicios protegidos con JWT Bearer y Roles RBAC
            </p>
            <p className="mt-2 text-[10px] text-neutral-400">
              © {new Date().getFullYear()} Universidad Tecnológica Privada de Santa Cruz.
              <br />
              Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* ── MODAL RECUPERACIÓN DE CONTRASEÑA ── */}
      {modalRecuperarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md border border-line bg-white p-6 sm:p-7 shadow-xl relative animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={cerrarModalRecuperacion}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-700 transition-colors border border-transparent hover:border-line"
            >
              <X className="size-4" />
            </button>

            {/* PASO 1: Ingreso de Correo Institucional */}
            {pasoRecuperacion === 1 && (
              <>
                <div className="flex items-center gap-3 mb-4 border-b border-line pb-3">
                  <div className="flex size-9 items-center justify-center border border-crimson/20 bg-red-50 text-crimson">
                    <KeyRound className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 leading-tight">
                      Recuperar Contraseña
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Acceso institucional seguro UTEPSA
                    </p>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                  Ingresa tu correo institucional registrado para verificar tu identidad y restablecer tu clave de acceso.
                </p>

                {errorRecuperacion && (
                  <div className="mb-4 flex items-start gap-2 border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                    <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{errorRecuperacion}</span>
                  </div>
                )}

                <form onSubmit={handleSolicitarRecuperacion} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700">
                      Correo Institucional *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                        <Mail className="size-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="usuario@utepsa.edu.bo"
                        value={correoRecuperacion}
                        onChange={(e) => setCorreoRecuperacion(e.target.value)}
                        className="w-full border border-line bg-surface py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-ink focus:bg-white outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={cerrarModalRecuperacion}
                      className="border border-line bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:border-ink hover:text-ink transition-colors shadow-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={cargandoRecuperacion || !correoRecuperacion.trim()}
                      className="flex items-center gap-1.5 bg-crimson px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-95 shadow-xs transition-opacity disabled:opacity-60"
                    >
                      {cargandoRecuperacion && <Loader2 className="size-3.5 animate-spin" />}
                      <span>{cargandoRecuperacion ? 'Verificando...' : 'Continuar'}</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* PASO 2: Ingreso de Nueva Contraseña */}
            {pasoRecuperacion === 2 && (
              <>
                <div className="flex items-center gap-3 mb-4 border-b border-line pb-3">
                  <div className="flex size-9 items-center justify-center border border-amber-200 bg-amber-50 text-amber-700">
                    <Lock className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 leading-tight">
                      Nueva Contraseña
                    </h3>
                    <p className="text-[11px] text-neutral-500 truncate max-w-[240px]">
                      {correoRecuperacion}
                    </p>
                  </div>
                </div>

                <div className="mb-4 border border-emerald-200 bg-emerald-50/70 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>Identidad institucional verificada. Ingresa tu nueva clave.</span>
                </div>

                {errorRecuperacion && (
                  <div className="mb-4 flex items-start gap-2 border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                    <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{errorRecuperacion}</span>
                  </div>
                )}

                <form onSubmit={handleGuardarNuevaPassword} className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700">
                      Nueva Contraseña *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                        <Lock className="size-4" />
                      </span>
                      <input
                        type={mostrarNuevaPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        value={nuevaPassword}
                        onChange={(e) => setNuevaPassword(e.target.value)}
                        className="w-full border border-line bg-surface py-2 pl-9 pr-9 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-ink focus:bg-white outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarNuevaPassword(!mostrarNuevaPassword)}
                        className="absolute inset-y-0 right-2.5 flex items-center text-neutral-400 hover:text-neutral-700"
                      >
                        {mostrarNuevaPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700">
                      Confirmar Contraseña *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                        <Lock className="size-4" />
                      </span>
                      <input
                        type={mostrarConfirmarPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Repite la contraseña"
                        value={confirmarPassword}
                        onChange={(e) => setConfirmarPassword(e.target.value)}
                        className="w-full border border-line bg-surface py-2 pl-9 pr-9 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-ink focus:bg-white outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
                        className="absolute inset-y-0 right-2.5 flex items-center text-neutral-400 hover:text-neutral-700"
                      >
                        {mostrarConfirmarPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={cerrarModalRecuperacion}
                      className="border border-line bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:border-ink hover:text-ink transition-colors shadow-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={cargandoRecuperacion || !nuevaPassword || !confirmarPassword}
                      className="flex items-center gap-1.5 bg-crimson px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-95 shadow-xs transition-opacity disabled:opacity-60"
                    >
                      {cargandoRecuperacion && <Loader2 className="size-3.5 animate-spin" />}
                      <span>{cargandoRecuperacion ? 'Guardando...' : 'Guardar Contraseña'}</span>
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* PASO 3: Confirmación Exitosa */}
            {pasoRecuperacion === 3 && (
              <div className="flex flex-col items-center text-center py-2 animate-in zoom-in-95 duration-200">
                <div className="flex size-12 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600 mb-3 shadow-xs">
                  <CheckCircle2 className="size-7" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">
                  ¡Contraseña Actualizada!
                </h3>
                <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                  {exitoRecuperacion || 'Tu contraseña institucional ha sido restablecida exitosamente.'}
                </p>
                <div className="border border-line bg-surface p-3 text-xs text-neutral-600 mb-4 text-left w-full">
                  <p className="font-semibold text-neutral-900 mb-0.5">Acceso seguro:</p>
                  <p>
                    Ya puedes ingresar al panel institucional con tu nueva clave de acceso.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cerrarModalRecuperacion}
                  className="flex w-full items-center justify-center gap-2 bg-crimson py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-95 shadow-xs transition-opacity"
                >
                  <ArrowRight className="size-3.5" />
                  <span>Iniciar Sesión Ahora</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
