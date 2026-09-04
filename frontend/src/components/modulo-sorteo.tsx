'use client'

import { useState } from 'react'
import { RuletaCanvas, type RuletaItem } from './RuletaCanvas'

const CASOS_MOCK: RuletaItem[] = [
  {
    id: 'CASO-014',
    label: 'CASO-014',
    sublabel: 'Reestructuración Financiera PyME',
    color: '#9E1B32',
    badge: '1/2 Usos',
  },
  {
    id: 'CASO-027',
    label: 'CASO-027',
    sublabel: 'Plan de Marketing Retail',
    color: '#1E293B',
    badge: '0/2 Usos',
  },
  {
    id: 'CASO-031',
    label: 'CASO-031',
    sublabel: 'Optimización Logística Supply Chain',
    color: '#0F172A',
    badge: '1/2 Usos',
  },
  {
    id: 'CASO-042',
    label: 'CASO-042',
    sublabel: 'Auditoría y Control de Riesgos',
    color: '#B45309',
    badge: '0/2 Usos',
  },
  {
    id: 'CASO-058',
    label: 'CASO-058',
    sublabel: 'Transformación Digital Bancaria',
    color: '#047857',
    badge: '1/2 Usos',
  },
  {
    id: 'CASO-063',
    label: 'CASO-063',
    sublabel: 'Gestión Estratégica del Talento',
    color: '#4338CA',
    badge: '0/2 Usos',
  },
]

export function ModuloSorteo({
  items = CASOS_MOCK,
  onSorteoCompletado,
}: {
  items?: RuletaItem[]
  onSorteoCompletado?: (item: RuletaItem) => void
}) {
  const [seleccionado, setSeleccionado] = useState<RuletaItem | null>(null)

  const handleFinish = (item: RuletaItem) => {
    setSeleccionado(item)
    if (onSorteoCompletado) {
      onSorteoCompletado(item)
    }
  }

  return (
    <section className="flex flex-col border border-line bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-gray-900">
            Módulo de Sorteo Dinámico
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            Asignación aleatoria auditada con física de desaceleración natural
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          En línea
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center gap-6 px-5 py-6">
        <RuletaCanvas
          items={items}
          size={360}
          onFinish={handleFinish}
          spinButtonText="Ejecutar Sorteo Digital"
        />

        <dl className="grid w-full grid-cols-3 gap-px border border-line bg-line text-center text-xs">
          <div className="bg-white px-2 py-3">
            <dt className="text-[11px] text-neutral-500">Total en Rueda</dt>
            <dd className="text-sm font-bold text-gray-900 tabular-nums">
              {items.length}
            </dd>
          </div>
          <div className="bg-white px-2 py-3">
            <dt className="text-[11px] text-neutral-500">Algoritmo</dt>
            <dd className="text-sm font-bold text-gray-900">CSPRNG</dd>
          </div>
          <div className="bg-white px-2 py-3">
            <dt className="text-[11px] text-neutral-500">Fase Actual</dt>
            <dd className="text-sm font-bold text-crimson">
              {seleccionado ? 'Asignado' : 'Listo'}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
