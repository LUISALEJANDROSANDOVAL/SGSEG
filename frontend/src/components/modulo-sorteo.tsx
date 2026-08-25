'use client'

import { useState } from 'react'
import { Loader2, Shuffle } from 'lucide-react'

const segmentos = [
  { etiqueta: 'CASO-014', color: '#000000' },
  { etiqueta: 'CASO-027', color: '#9E1B32' },
  { etiqueta: 'CASO-031', color: '#121212' },
  { etiqueta: 'CASO-042', color: '#6B7280' },
  { etiqueta: 'CASO-058', color: '#9E1B32' },
  { etiqueta: 'CASO-063', color: '#121212' },
]

const CIRCUNFERENCIA = 2 * Math.PI * 40
const PASO = CIRCUNFERENCIA / segmentos.length

export function ModuloSorteo() {
  const [girando, setGirando] = useState(false)
  const [angulo, setAngulo] = useState(0)
  const [resultado, setResultado] = useState<string | null>(null)

  function ejecutarSorteo() {
    if (girando) return
    setGirando(true)
    setResultado(null)
    const indice = Math.floor(Math.random() * segmentos.length)
    const gradosPorSegmento = 360 / segmentos.length
    setAngulo(
      (previo) =>
        previo + 1440 + (360 - (indice * gradosPorSegmento + gradosPorSegmento / 2)),
    )
    window.setTimeout(() => {
      setResultado(segmentos[indice].etiqueta)
      setGirando(false)
    }, 3000)
  }

  return (
    <section className="flex flex-col border border-line bg-white">
      <header className="border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight">Módulo de Sorteo</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Asignación aleatoria y auditable de casos de estudio
        </p>
      </header>

      <div className="flex flex-1 flex-col items-center gap-6 px-5 py-8">
        <div className="relative flex size-56 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute -top-1 left-1/2 z-10 size-0 -translate-x-1/2 border-x-6 border-t-10 border-x-transparent border-t-crimson"
          />
          <svg
            viewBox="0 0 100 100"
            role="img"
            aria-label="Rueda de selección de casos de estudio"
            className="size-full -rotate-90 transition-transform duration-[3000ms] ease-out"
            style={{ transform: `rotate(${angulo - 90}deg)` }}
          >
            {segmentos.map((segmento, indice) => (
              <circle
                key={segmento.etiqueta}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={segmento.color}
                strokeWidth="18"
                strokeDasharray={`${PASO - 0.6} ${CIRCUNFERENCIA - PASO + 0.6}`}
                strokeDashoffset={-PASO * indice}
              />
            ))}
            <circle cx="50" cy="50" r="27" fill="#FFFFFF" />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-[10px] tracking-[0.14em] text-neutral-500 uppercase">
              {girando ? 'Sorteando' : resultado ? 'Asignado' : 'En espera'}
            </span>
            <span className="text-base font-semibold tabular-nums">
              {resultado ?? '—'}
            </span>
          </div>
        </div>

        <dl className="grid w-full grid-cols-3 gap-px border border-line bg-line text-center">
          <div className="bg-white px-2 py-3">
            <dt className="text-[11px] text-neutral-500">Participantes</dt>
            <dd className="text-sm font-semibold tabular-nums">128</dd>
          </div>
          <div className="bg-white px-2 py-3">
            <dt className="text-[11px] text-neutral-500">Casos en rueda</dt>
            <dd className="text-sm font-semibold tabular-nums">6</dd>
          </div>
          <div className="bg-white px-2 py-3">
            <dt className="text-[11px] text-neutral-500">Sorteos hoy</dt>
            <dd className="text-sm font-semibold tabular-nums">14</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={ejecutarSorteo}
          disabled={girando}
          className="flex w-full items-center justify-center gap-2 bg-crimson px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {girando ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Shuffle className="size-4" />
          )}
          {girando ? 'Ejecutando sorteo...' : 'Ejecutar Sorteo Digital'}
        </button>
      </div>
    </section>
  )
}
