const historial = [
  {
    hora: '09:12',
    estudiante: 'Mariana Rojas Quiroga',
    area: 'Marketing',
    caso: 'CASO-027',
    defensa: 'Externa',
  },
  {
    hora: '09:34',
    estudiante: 'Luis Fernando Céspedes',
    area: 'Administración',
    caso: 'CASO-014',
    defensa: 'Interna',
  },
  {
    hora: '10:05',
    estudiante: 'Camila Antelo Suárez',
    area: 'Contaduría',
    caso: 'CASO-042',
    defensa: 'Externa',
  },
  {
    hora: '10:41',
    estudiante: 'Diego Mamani Torrico',
    area: 'Ingeniería Comercial',
    caso: 'CASO-031',
    defensa: 'Interna',
  },
]

export function HistorialSorteos() {
  return (
    <section className="flex flex-col border border-line bg-white">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Historial del Acto</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Sorteos ejecutados hoy · 04 de 12 programados
          </p>
        </div>
        <button
          type="button"
          className="border border-line px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface"
        >
          Exportar acta
        </button>
      </header>

      <ul className="flex-1 divide-y divide-line">
        {historial.map((registro) => (
          <li key={registro.hora} className="flex items-start gap-4 px-5 py-4">
            <span className="font-mono text-xs text-neutral-500">{registro.hora}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{registro.estudiante}</p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {registro.area} · {registro.caso}
              </p>
            </div>
            <span
              className={`shrink-0 px-2.5 py-1 text-[11px] font-medium ${
                registro.defensa === 'Externa'
                  ? 'bg-ink text-white'
                  : 'bg-surface text-neutral-600 ring-1 ring-line'
              }`}
            >
              {registro.defensa}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
