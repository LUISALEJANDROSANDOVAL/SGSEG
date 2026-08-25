import { Download, FileText } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'

const indicadores = [
  { etiqueta: 'Actas emitidas', valor: '182' },
  { etiqueta: 'Aprobación general', valor: '87,2%' },
  { etiqueta: 'Defensas externas', valor: '64' },
  { etiqueta: 'Promedio general', valor: '81,4' },
]

const porArea = [
  { area: 'Administración', defensas: 58, aprobacion: 91 },
  { area: 'Marketing', defensas: 42, aprobacion: 88 },
  { area: 'Contaduría', defensas: 34, aprobacion: 84 },
  { area: 'Ingeniería Comercial', defensas: 28, aprobacion: 79 },
  { area: 'Sistemas', defensas: 20, aprobacion: 76 },
]

const documentos = [
  { nombre: 'Acta consolidada de sorteo · Agosto 2026', formato: 'PDF', peso: '412 KB' },
  { nombre: 'Resultados de defensa interna · 2-2026', formato: 'XLSX', peso: '188 KB' },
  { nombre: 'Uso de casos de estudio por área', formato: 'XLSX', peso: '96 KB' },
  { nombre: 'Informe ejecutivo de coordinación', formato: 'PDF', peso: '640 KB' },
]

export default function PaginaReportes() {
  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <EncabezadoPagina
          titulo="Reportes"
          descripcion="Estadísticas de rendimiento por área, actas de sorteo y exportación de resultados de defensa para archivo institucional."
          accion={
            <button
              type="button"
              className="flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Download className="size-4" />
              Generar reporte
            </button>
          }
        />

        <section className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          {indicadores.map((dato) => (
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="border border-line bg-white">
            <header className="border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold tracking-tight">
                Rendimiento por área
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Defensas realizadas y porcentaje de aprobación
              </p>
            </header>
            <ul className="divide-y divide-line">
              {porArea.map((fila) => (
                <li key={fila.area} className="flex flex-col gap-2 px-5 py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-sm font-medium">{fila.area}</p>
                    <p className="text-xs text-neutral-500">
                      {fila.defensas} defensas · {fila.aprobacion}%
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-surface">
                    <div
                      className="h-full bg-ink"
                      style={{ width: `${fila.aprobacion}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-line bg-white">
            <header className="border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold tracking-tight">
                Documentos disponibles
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Archivos generados en el periodo actual
              </p>
            </header>
            <ul className="divide-y divide-line">
              {documentos.map((documento) => (
                <li
                  key={documento.nombre}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <FileText className="size-4 shrink-0 text-neutral-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-pretty">{documento.nombre}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {documento.formato} · {documento.peso}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 border border-line px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface"
                  >
                    Descargar
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
