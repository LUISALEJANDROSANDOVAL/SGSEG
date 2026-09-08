import { useAuth } from '@/context/AuthContext'
import { Calendar, Shuffle, PlusCircle, ShieldCheck, Activity, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function DashboardBanner() {
  const { user } = useAuth()

  const primerNombre = user?.primerNombre || user?.nombre?.split(' ')[0] || 'Usuario'

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  const hoy = new Date().toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="relative border border-line bg-white p-6 border-l-4 border-l-crimson shadow-xs">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        {/* Columna Izquierda: Saludo Institucional y Contexto */}
        <div className="flex flex-col gap-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 border border-line bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700">
              <span className="size-1.5 rounded-full bg-crimson" />
              Semestre 2-2026 · Período Activo
            </span>
            <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
              <Activity className="size-3 text-emerald-600" />
              Sistema 100% Operativo
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
            {saludo}, {primerNombre}
          </h1>

          <p className="text-xs sm:text-sm leading-relaxed text-neutral-600">
            Bienvenido al panel central de <strong className="text-neutral-900 font-semibold">SGSEG UTEPSA</strong>. Supervisión integral del flujo de defensas, disponibilidad del banco de casos de estudio bajo la regla de 2 usos y registro oficial de sorteos de grado.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 pt-1">
            <span className="flex items-center gap-1.5 capitalize">
              <Calendar className="size-3.5 text-neutral-400" />
              {hoy}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-neutral-700">
              <ShieldCheck className="size-3.5 text-crimson" />
              Jurisdicción: <strong className="font-semibold text-neutral-900">{user?.rol}</strong>
            </span>
          </div>
        </div>

        {/* Columna Derecha: Acciones Rápidas Sobrias */}
        <div className="flex flex-wrap items-center gap-2.5 lg:flex-col lg:items-stretch sm:shrink-0">
          <Link
            to="/sorteo"
            className="flex items-center justify-center gap-2 bg-crimson px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-opacity"
          >
            <Shuffle className="size-3.5" />
            <span>Ejecutar Sorteo Digital</span>
            <ChevronRight className="size-3.5 opacity-80" />
          </Link>

          <div className="flex gap-2">
            <Link
              to="/defensas"
              className="flex-1 inline-flex items-center justify-center gap-1.5 border border-line bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-ink hover:text-ink shadow-xs"
            >
              <Calendar className="size-3.5 text-neutral-500" />
              <span>Cronograma</span>
            </Link>

            <Link
              to="/casos"
              className="flex-1 inline-flex items-center justify-center gap-1.5 border border-line bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-ink hover:text-ink shadow-xs"
            >
              <PlusCircle className="size-3.5 text-neutral-500" />
              <span>Inventario</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
