import { AlertTriangle, BookOpen, GraduationCap, TrendingUp, Users } from 'lucide-react'

export function TarjetasKpi() {
  return (
    <section aria-label="Indicadores clave" className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
      <article className="flex flex-col gap-3 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            Total Estudiantes
          </p>
          <Users className="size-4 text-neutral-400" />
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">12.450</p>
        <p className="text-xs text-neutral-500">Matriculados en el semestre actual</p>
      </article>

      <article className="flex flex-col gap-3 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            Exámenes Activos
          </p>
          <AlertTriangle className="size-4 text-crimson" />
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">48</p>
        <p className="text-xs text-crimson">6 defensas programadas para hoy</p>
      </article>

      <article className="flex flex-col gap-3 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            Casos Disponibles
          </p>
          <BookOpen className="size-4 text-neutral-400" />
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">20</p>
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full bg-surface">
            <div className="h-full bg-ink" style={{ width: '62%' }} />
          </div>
          <p className="text-xs text-neutral-500">62% del inventario sin utilizar</p>
        </div>
      </article>

      <article className="flex flex-col gap-3 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            Tasa de Aprobación
          </p>
          <GraduationCap className="size-4 text-neutral-400" />
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">87,2%</p>
        <p className="flex items-center gap-1.5 text-xs text-neutral-500">
          <TrendingUp className="size-3.5" />
          +2,4 puntos frente al semestre anterior
        </p>
      </article>
    </section>
  )
}
