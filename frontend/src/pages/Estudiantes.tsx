import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'

const filtros = ['Todos los pensum', 'Pensum 2019', 'Pensum 2022', 'Pensum 2024']

const estudiantes = [
  {
    registro: '2019-04812',
    nombre: 'Mariana Rojas Quiroga',
    carrera: 'Marketing',
    pensum: '2019',
    estado: 'Sorteado',
  },
  {
    registro: '2020-01377',
    nombre: 'Luis Fernando Céspedes',
    carrera: 'Administración',
    pensum: '2019',
    estado: 'Sorteado',
  },
  {
    registro: '2021-06540',
    nombre: 'Camila Antelo Suárez',
    carrera: 'Contaduría',
    pensum: '2022',
    estado: 'Pendiente',
  },
  {
    registro: '2021-07188',
    nombre: 'Diego Mamani Torrico',
    carrera: 'Ingeniería Comercial',
    pensum: '2022',
    estado: 'Pendiente',
  },
  {
    registro: '2022-02904',
    nombre: 'Valeria Ibáñez Peña',
    carrera: 'Sistemas',
    pensum: '2024',
    estado: 'Observado',
  },
  {
    registro: '2022-03551',
    nombre: 'Jorge Andrés Vaca',
    carrera: 'Administración',
    pensum: '2024',
    estado: 'Pendiente',
  },
]

const estilosEstado: Record<string, string> = {
  Sorteado: 'bg-ink text-white',
  Pendiente: 'bg-surface text-neutral-600 ring-1 ring-line',
  Observado: 'bg-crimson text-white',
}

export default function PaginaEstudiantes() {
  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <EncabezadoPagina
          titulo="Estudiantes"
          descripcion="Padrón de postulantes al examen de grado con su estado de habilitación, carrera y plan de estudios vigente."
          accion={
            <button
              type="button"
              className="border border-ink px-4 py-2.5 text-sm font-medium transition-colors hover:bg-ink hover:text-white"
            >
              Importar padrón
            </button>
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          {filtros.map((filtro, indice) => (
            <button
              key={filtro}
              type="button"
              aria-pressed={indice === 0}
              className={`border px-3.5 py-2 text-xs font-medium transition-colors ${
                indice === 0
                  ? 'border-ink bg-ink text-white'
                  : 'border-line bg-white text-neutral-600 hover:border-ink'
              }`}
            >
              {filtro}
            </button>
          ))}
        </div>

        <section className="border border-line bg-white">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">
              Padrón semestre 2-2026
            </h2>
            <span className="text-xs text-neutral-500">248 registros</span>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-surface">
                <tr className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Registro
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Estudiante
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Carrera
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Pensum
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {estudiantes.map((estudiante) => (
                  <tr key={estudiante.registro}>
                    <td className="px-5 py-4 font-mono text-[11px] tracking-wider text-neutral-500">
                      {estudiante.registro}
                    </td>
                    <td className="px-5 py-4 font-medium">{estudiante.nombre}</td>
                    <td className="px-5 py-4 text-neutral-600">
                      {estudiante.carrera}
                    </td>
                    <td className="px-5 py-4 text-neutral-500">{estudiante.pensum}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-medium ${estilosEstado[estudiante.estado]}`}
                      >
                        {estudiante.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
