import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { HistorialSorteos } from '@/components/historial-sorteos'
import { ModuloSorteo } from '@/components/modulo-sorteo'

const parametros = [
  { etiqueta: 'Tipo de defensa', valor: 'Interna y Externa' },
  { etiqueta: 'Áreas habilitadas', valor: '6 áreas' },
  { etiqueta: 'Casos disponibles', valor: '18 de 24' },
  { etiqueta: 'Testigo del acto', valor: 'Secretaría de Facultad' },
]

export default function PaginaSorteo() {
  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <EncabezadoPagina
          titulo="Sorteo Digital"
          descripcion="Asignación aleatoria y auditable de áreas y casos de estudio para la defensa de grado. Cada ejecución queda registrada en acta con sello de tiempo."
        />

        <section className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          {parametros.map((parametro) => (
            <div key={parametro.etiqueta} className="bg-white px-5 py-4">
              <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
                {parametro.etiqueta}
              </p>
              <p className="mt-1.5 text-sm font-medium">{parametro.valor}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ModuloSorteo />
          <HistorialSorteos />
        </div>
      </div>
    </DashboardShell>
  )
}
