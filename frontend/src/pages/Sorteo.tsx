import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { HistorialSorteos } from '@/components/historial-sorteos'
import { ModuloSorteo } from '@/components/modulo-sorteo'
import { defensasApi, type EmbudoEstados } from '@/lib/defensas.api'
import { casosApi } from '@/lib/casos.api'

export default function PaginaSorteo() {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const [embudo, setEmbudo] = useState<EmbudoEstados | null>(null)
  const [stockCasos, setStockCasos] = useState<{ totalCasos: number; casosDisponibles: number } | null>(null)

  const cargarKpis = async () => {
    try {
      const [embudoData, casosData] = await Promise.all([
        defensasApi.getEmbudo(),
        casosApi.getMetricas(),
      ])
      setEmbudo(embudoData)
      setStockCasos({
        totalCasos: casosData.totalCasos,
        casosDisponibles: casosData.disponibles,
      })
    } catch (e) {
      console.error('Error cargando KPIs de sorteo:', e)
    }
  }

  useEffect(() => {
    cargarKpis()
  }, [refreshTrigger])

  const handleSorteoCompletado = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <EncabezadoPagina
          titulo="Sorteo Digital de Examen de Grado"
          descripcion="Asignación pseudoaleatoria y auditable de áreas temáticas y casos de estudio mediante CSPRNG. Cada acto emite acta oficial firmada digitalmente con hash SHA-256."
        />

        {/* Indicadores clave en tiempo real */}
        <section className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Pendientes de Sorteo
            </p>
            <p className="mt-1.5 text-2xl font-bold text-neutral-900">
              {embudo ? embudo.programados : 0}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Defensas programadas activas</p>
          </div>

          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Áreas Sorteada
            </p>
            <p className="mt-1.5 text-2xl font-bold text-amber-600">
              {embudo ? embudo.areaSorteada : 0}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">En espera de sorteo de caso</p>
          </div>

          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Casos Disponibles
            </p>
            <p className="mt-1.5 text-2xl font-bold text-neutral-900">
              {stockCasos ? `${stockCasos.casosDisponibles} de ${stockCasos.totalCasos}` : '—'}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Con menos de 2 usos reglamentarios</p>
          </div>

          <div className="bg-white px-5 py-4">
            <p className="text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
              Garantía de Auditoría
            </p>
            <p className="mt-1.5 text-sm font-bold text-emerald-700">
              CSPRNG + SHA-256
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Sello inmutable en acta oficial</p>
          </div>
        </section>

        {/* Módulo de Sorteo y su Historial en Tiempo Real */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ModuloSorteo onSorteoCompletado={handleSorteoCompletado} />
          <HistorialSorteos refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </DashboardShell>
  )
}
