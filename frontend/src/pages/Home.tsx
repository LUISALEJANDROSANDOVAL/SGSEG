import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { GestionCasos } from '@/components/gestion-casos'
import { MapaSistema } from '@/components/mapa-sistema'
import { ModuloSorteo } from '@/components/modulo-sorteo'
import { TarjetasKpi } from '@/components/tarjetas-kpi'

export default function PaginaPanelPrincipal() {
  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <EncabezadoPagina
          titulo="Panel Principal"
          descripcion="Resumen operativo del Sistema de Gestión de Exámenes de Grado · Semestre 2-2026"
        />

        <TarjetasKpi />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ModuloSorteo />
          <GestionCasos />
        </div>

        <MapaSistema />
      </div>
    </DashboardShell>
  )
}
