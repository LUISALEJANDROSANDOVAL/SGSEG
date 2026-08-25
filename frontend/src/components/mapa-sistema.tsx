import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { todasLasPaginas } from '@/lib/navegacion'

export function MapaSistema() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold tracking-tight">Módulos del Sistema</h2>
        <p className="text-xs text-neutral-500">
          {todasLasPaginas.length} módulos habilitados
        </p>
      </div>

      <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {todasLasPaginas.map((pagina) => (
          <Link
            key={pagina.ruta}
            to={pagina.ruta}
            className="group flex flex-col gap-3 bg-white px-5 py-5 transition-colors hover:bg-surface"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex size-9 items-center justify-center bg-ink text-white">
                <pagina.icono className="size-4" />
              </span>
              <ArrowRight className="size-4 text-neutral-300 transition-colors group-hover:text-crimson" />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{pagina.nombre}</p>
              <p className="text-xs leading-relaxed text-pretty text-neutral-500">
                {pagina.descripcion}
              </p>
            </div>

            <p className="mt-auto border-t border-line pt-3 text-[11px] tracking-[0.1em] text-neutral-400 uppercase">
              {pagina.roles.length === 3
                ? 'Todos los perfiles'
                : pagina.roles.join(' · ')}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
