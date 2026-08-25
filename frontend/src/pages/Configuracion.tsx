import { Check, Minus } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { roles, todasLasPaginas } from '@/lib/navegacion'

const parametros = [
  {
    titulo: 'Límite de usos por caso',
    valor: '2 usos',
    detalle: 'Al alcanzar el tope el caso se retira automáticamente del sorteo.',
  },
  {
    titulo: 'Umbral de stock crítico',
    valor: '3 casos por área',
    detalle: 'Dispara la alerta roja en el panel de coordinación.',
  },
  {
    titulo: 'Semilla del sorteo',
    valor: 'Aleatoria por sesión',
    detalle: 'Se registra en el acta junto al sello de tiempo del acto.',
  },
  {
    titulo: 'Calendario del semestre',
    valor: '18/08 — 12/12/2026',
    detalle: 'Ventana habilitada para defensas internas y externas.',
  },
]

export default function PaginaConfiguracion() {
  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <EncabezadoPagina
          titulo="Configuración"
          descripcion="Parámetros del sorteo, control de acceso por perfil y calendario académico. Solo el Coordinador General puede modificar estos valores."
          accion={
            <button
              type="button"
              className="bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Guardar cambios
            </button>
          }
        />

        <section className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
          {parametros.map((parametro) => (
            <div key={parametro.titulo} className="flex flex-col gap-1 bg-white px-5 py-5">
              <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
                {parametro.titulo}
              </p>
              <p className="text-lg font-semibold tracking-tight">{parametro.valor}</p>
              <p className="text-xs leading-relaxed text-pretty text-neutral-500">
                {parametro.detalle}
              </p>
            </div>
          ))}
        </section>

        <section className="border border-line bg-white">
          <header className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">
              Control de acceso por perfil
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Módulos habilitados para cada rol del sistema
            </p>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line bg-surface">
                <tr className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Módulo
                  </th>
                  {roles.map((rol) => (
                    <th key={rol} scope="col" className="px-5 py-3 font-medium">
                      {rol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {todasLasPaginas.map((pagina) => (
                  <tr key={pagina.ruta}>
                    <td className="px-5 py-4 font-medium">{pagina.nombre}</td>
                    {roles.map((rol) => {
                      const permitido = pagina.roles.includes(rol)
                      return (
                        <td key={rol} className="px-5 py-4">
                          {permitido ? (
                            <Check className="size-4 text-ink" />
                          ) : (
                            <Minus className="size-4 text-neutral-300" />
                          )}
                          <span className="sr-only">
                            {permitido ? 'Permitido' : 'Sin acceso'}
                          </span>
                        </td>
                      )
                    })}
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
