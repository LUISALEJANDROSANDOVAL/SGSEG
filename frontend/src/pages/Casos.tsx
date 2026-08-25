import { AlertOctagon } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'

const resumen = [
  { etiqueta: 'Casos registrados', valor: '24' },
  { etiqueta: 'Disponibles', valor: '18' },
  { etiqueta: 'Agotados (2/2)', valor: '6' },
  { etiqueta: 'Áreas cubiertas', valor: '6' },
]

const inventario = [
  {
    id: 'CASO-014',
    titulo: 'Reestructuración financiera de una PyME boliviana',
    area: 'Administración',
    usos: 1,
    ingreso: '12/03/2026',
  },
  {
    id: 'CASO-027',
    titulo: 'Plan de marketing digital para retail regional',
    area: 'Marketing',
    usos: 2,
    ingreso: '02/04/2026',
  },
  {
    id: 'CASO-031',
    titulo: 'Optimización logística en cadena de suministro',
    area: 'Ingeniería Comercial',
    usos: 1,
    ingreso: '18/04/2026',
  },
  {
    id: 'CASO-042',
    titulo: 'Auditoría interna y control de riesgos operativos',
    area: 'Contaduría',
    usos: 2,
    ingreso: '05/05/2026',
  },
  {
    id: 'CASO-056',
    titulo: 'Transformación digital de una entidad financiera',
    area: 'Sistemas',
    usos: 0,
    ingreso: '21/05/2026',
  },
  {
    id: 'CASO-063',
    titulo: 'Gestión del talento en empresa de servicios',
    area: 'Administración',
    usos: 1,
    ingreso: '09/06/2026',
  },
]

export default function PaginaCasos() {
  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <EncabezadoPagina
          titulo="Gestión de Casos"
          descripcion="Inventario de casos de estudio con control estricto del límite de dos usos por caso. Al alcanzar el tope, el caso se retira automáticamente del sorteo."
          accion={
            <button
              type="button"
              className="bg-crimson px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Registrar nuevo caso
            </button>
          }
        />

        <div
          role="alert"
          className="flex items-start gap-3 border border-crimson bg-crimson px-5 py-4 text-white"
        >
          <AlertOctagon className="mt-0.5 size-4 shrink-0" />
          <p className="text-sm leading-relaxed text-pretty">
            <span className="font-semibold">STOCK CRÍTICO:</span> El área de
            Administración tiene 1 caso disponible frente a 9 estudiantes pendientes.
            Reposición urgente antes del 30/08.
          </p>
        </div>

        <section className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          {resumen.map((dato) => (
            <div key={dato.etiqueta} className="bg-white px-5 py-4">
              <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
                {dato.etiqueta}
              </p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                {dato.valor}
              </p>
            </div>
          ))}
        </section>

        <section className="border border-line bg-white">
          <header className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Inventario activo</h2>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-surface">
                <tr className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Código
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Caso de estudio
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Área
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Ingreso
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Usos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {inventario.map((caso) => {
                  const agotado = caso.usos >= 2
                  return (
                    <tr key={caso.id}>
                      <td className="px-5 py-4 font-mono text-[11px] tracking-wider text-neutral-500">
                        {caso.id}
                      </td>
                      <td className="max-w-sm px-5 py-4 text-pretty">{caso.titulo}</td>
                      <td className="px-5 py-4 text-neutral-600">{caso.area}</td>
                      <td className="px-5 py-4 text-neutral-500">{caso.ingreso}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[11px] font-medium ${
                            agotado
                              ? 'bg-crimson text-white'
                              : 'bg-surface text-neutral-600 ring-1 ring-line'
                          }`}
                        >
                          {agotado ? 'Agotado 2/2' : `Uso ${caso.usos}/2`}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
