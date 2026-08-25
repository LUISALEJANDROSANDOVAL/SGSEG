import { AlertOctagon } from 'lucide-react'

const casos = [
  {
    id: 'CASO-014',
    titulo: 'Reestructuración financiera de una PyME boliviana',
    area: 'Administración',
    usos: 1,
  },
  {
    id: 'CASO-027',
    titulo: 'Plan de marketing digital para retail regional',
    area: 'Marketing',
    usos: 2,
  },
  {
    id: 'CASO-031',
    titulo: 'Optimización logística en cadena de suministro',
    area: 'Ingeniería Comercial',
    usos: 1,
  },
  {
    id: 'CASO-042',
    titulo: 'Auditoría interna y control de riesgos operativos',
    area: 'Contaduría',
    usos: 2,
  },
]

export function GestionCasos() {
  return (
    <section className="flex flex-col border border-line bg-white">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Gestión de Casos</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Inventario activo y límite de uso por caso
          </p>
        </div>
        <span className="hidden text-xs text-neutral-500 sm:block">
          4 casos en circulación
        </span>
      </header>

      <ul className="flex-1 divide-y divide-line">
        {casos.map((caso) => {
          const agotado = caso.usos >= 2
          return (
            <li
              key={caso.id}
              className="flex items-start justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="font-mono text-[11px] tracking-wider text-neutral-500">
                  {caso.id}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-pretty">
                  {caso.titulo}
                </p>
                <p className="mt-1 text-xs text-neutral-500">{caso.area}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  agotado
                    ? 'bg-crimson text-white'
                    : 'bg-surface text-neutral-600 ring-1 ring-line'
                }`}
              >
                {agotado ? 'Agotado 2/2' : `Uso ${caso.usos}/2`}
              </span>
            </li>
          )
        })}
      </ul>

      <div
        role="alert"
        className="flex items-start gap-3 bg-crimson px-5 py-4 text-white"
      >
        <AlertOctagon className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm leading-relaxed text-pretty">
          <span className="font-semibold">ALERTA:</span> Stock crítico en el área de
          Administración — Reposición urgente.
        </p>
      </div>
    </section>
  )
}
