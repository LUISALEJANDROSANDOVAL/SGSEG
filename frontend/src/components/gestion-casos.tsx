import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Plus, AlertOctagon, CheckCircle2 } from 'lucide-react'

interface CasoSimple {
  id: string
  titulo: string
  area: string
  usos: number
  estado: string
}

export function GestionCasos() {
  const [casos, setCasos] = useState<CasoSimple[]>([])

  useEffect(() => {
    try {
      const data = localStorage.getItem('sgseg_casos_inventario_real_v2')
      if (data) {
        setCasos(JSON.parse(data))
      }
    } catch {
      setCasos([])
    }
  }, [])

  const casosVisibles = casos.slice(0, 4)
  const casosInactivos = casos.filter((c) => c.usos >= 2 || c.estado === 'INACTIVO' || c.estado === 'AGOTADO').length

  return (
    <section className="flex flex-col border border-line bg-white shadow-2xs font-sans">
      <header className="flex items-center justify-between border-b border-line px-5 py-4 bg-surface">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-neutral-900">Gestión de Casos</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            Inventario activo de la carrera y límite de 2 usos
          </p>
        </div>
        <Link
          to="/casos"
          className="text-xs font-semibold text-crimson hover:underline"
        >
          Ver todos ({casos.length})
        </Link>
      </header>

      {casos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <BookOpen className="size-8 text-neutral-300 mb-2" />
          <p className="text-sm font-bold text-neutral-800">Inventario sin casos registrados</p>
          <p className="text-xs text-neutral-500 max-w-xs mt-1">
            No se han registrado casos de estudio para esta carrera aún.
          </p>
          <Link
            to="/casos"
            className="mt-4 inline-flex items-center gap-1.5 bg-crimson px-3 py-1.5 text-xs font-bold text-white hover:bg-crimson/90 transition-colors"
          >
            <Plus className="size-3.5" />
            Registrar Caso
          </Link>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-line">
          {casosVisibles.map((caso) => {
            const estaInactivo = caso.usos >= 2 || caso.estado === 'INACTIVO' || caso.estado === 'AGOTADO'
            return (
              <li
                key={caso.id}
                className="flex items-start justify-between gap-4 px-5 py-3.5 hover:bg-neutral-50/70 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-bold text-neutral-700">
                    {caso.id}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-neutral-900 line-clamp-1">
                    {caso.titulo}
                  </p>
                  <p className="text-[11px] text-neutral-500">{caso.area}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    estaInactivo
                      ? 'bg-red-50 text-crimson border border-red-200'
                      : caso.usos === 1
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {estaInactivo ? 'Inactivo (2/2)' : `Uso ${caso.usos}/2`}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {casosInactivos > 0 ? (
        <div
          role="alert"
          className="flex items-center gap-2.5 bg-red-50 border-t border-red-200 px-5 py-3 text-xs text-red-900"
        >
          <AlertOctagon className="size-4 shrink-0 text-crimson" />
          <p className="text-xs leading-relaxed">
            <span className="font-bold">AVISO:</span> {casosInactivos} {casosInactivos === 1 ? 'caso ha alcanzado' : 'casos han alcanzado'} el tope de 2 usos y {casosInactivos === 1 ? 'ha quedado inactivo' : 'han quedado inactivos'}.
          </p>
        </div>
      ) : casos.length > 0 ? (
        <div className="flex items-center gap-2 bg-emerald-50 border-t border-emerald-200 px-5 py-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
          <span>Todos los casos registrados se encuentran disponibles para sorteo.</span>
        </div>
      ) : null}
    </section>
  )
}
