import { useAuth } from '@/context/AuthContext'
import { Calendar, Shuffle, PlusCircle, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

export function DashboardBanner() {
  const { user } = useAuth()

  const primerNombre = user?.primerNombre || user?.nombre?.split(' ')[0] || 'Usuario'

  const hoy = new Date().toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121316] via-[#1c1d22] to-[#3a060e] p-6 sm:p-8 text-white shadow-xl ring-1 ring-white/10">

      {/* Decorative Glow Effects & Patterns */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-[#c8102e]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        {/* Left column: Welcome text & context */}
        <div className="flex flex-col gap-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-[11px] font-semibold text-red-400 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
              Semestre 2-2026 · Período Activo
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-400 backdrop-blur-md">
              <Activity className="size-3" />
              Sistema 100% Operativo
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Hola, {primerNombre} <span className="inline-block animate-wave text-xl"></span>
          </h1>

          <p className="text-sm leading-relaxed text-gray-300 text-pretty">
            Bienvenido al panel central de <strong className="text-white">SGSEG UTEPSA</strong>. Supervisa el flujo de postulantes, la disponibilidad del inventario de casos con regla de 2 usos y la ejecución de sorteos con validez oficial.
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
            <span className="flex items-center gap-1.5 capitalize">
              <Calendar className="size-3.5 text-gray-400" />
              {hoy}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-gray-300">
              <ShieldCheck className="size-3.5 text-[#c8102e]" />
              Rol: <strong className="text-white font-medium">{user?.rol}</strong>
            </span>
          </div>
        </div>

        {/* Right column: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-stretch sm:shrink-0">
          <Link
            to="/sorteo"
            className="group flex items-center justify-center gap-2 rounded-xl bg-[#c8102e] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-red-900/30 transition-all duration-150 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Shuffle className="size-4 transition-transform group-hover:rotate-45" />
            <span>Ejecutar Sorteo Digital</span>
            <ArrowUpRight className="size-3.5 opacity-70 group-hover:opacity-100" />
          </Link>

          <div className="flex gap-2.5">
            <Link
              to="/defensas"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Calendar className="size-3.5 text-red-400" />
              <span>Cronograma</span>
            </Link>

            <Link
              to="/casos"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="size-3.5 text-emerald-400" />
              <span>Inventario</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
