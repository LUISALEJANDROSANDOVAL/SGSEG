import { DashboardShell } from '@/components/dashboard-shell'
import { DashboardBanner } from '@/components/dashboard-banner'
import { TarjetasKpi } from '@/components/tarjetas-kpi'
import { EmbudoFlujoWidget } from '@/components/embudo-flujo-widget'
import { ProximasDefensasWidget } from '@/components/proximas-defensas-widget'
import { GestionCasos } from '@/components/gestion-casos'
import { HistorialSorteos } from '@/components/historial-sorteos'

export default function PaginaPanelPrincipal() {
  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 pb-8">
        {/* Banner Hero Principal */}
        <DashboardBanner />

        {/* Tarjetas Métricas KPI */}
        <TarjetasKpi />

        {/* Pipeline / Embudo Visual de Fases */}
        <EmbudoFlujoWidget />

        {/* Cuadrícula Principal de Operaciones */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProximasDefensasWidget />
          <GestionCasos />
        </div>

        {/* Historial de Sorteos y Actas Oficiales */}
        <HistorialSorteos />
      </div>
    </DashboardShell>
  )
}

