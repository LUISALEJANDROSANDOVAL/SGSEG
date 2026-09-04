import { Link } from 'react-router-dom'
import { ArrowRight, Dices } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { GestionCasos } from '@/components/gestion-casos'
import { HistorialSorteos } from '@/components/historial-sorteos'
import { MapaSistema } from '@/components/mapa-sistema'
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

        {/* Acceso Rápido al Módulo Dedicado de Sorteos */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-crimson/20 bg-gradient-to-r from-red-50 via-white to-red-50/40 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xs bg-crimson text-white shadow-xs">
              <Dices className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Bolillero Digital Criptográfico — Sorteo en 2 Fases
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Fase 1: Sorteo de Área Temática · Fase 2: Asignación de Caso de Estudio con Sello Criptográfico SHA-256.
              </p>
            </div>
          </div>
          <Link
            to="/sorteos"
            className="inline-flex items-center gap-2 shrink-0 bg-crimson px-4 py-2.5 text-xs font-bold text-white hover:opacity-95 transition-opacity shadow-xs"
          >
            <span>Ir al Módulo de Sorteo</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GestionCasos />
          <HistorialSorteos />
        </div>

        <MapaSistema />
      </div>
    </DashboardShell>
  )
}
