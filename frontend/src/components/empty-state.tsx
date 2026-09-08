import type { ReactNode } from 'react'
import { FolderSearch, type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  titulo?: string
  descripcion?: string
  icono?: LucideIcon
  accion?: ReactNode
  className?: string
}

export function EmptyState({
  titulo = 'No se encontraron registros',
  descripcion = 'No hay datos disponibles para los filtros o criterios de búsqueda seleccionados.',
  icono: Icono = FolderSearch,
  accion,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 sm:p-12 text-center border border-dashed border-line bg-surface/50 ${className}`}
    >
      <span className="flex size-11 items-center justify-center border border-line bg-white text-neutral-400 mb-3 shadow-2xs">
        <Icono className="size-5" />
      </span>

      <h3 className="text-sm font-semibold tracking-tight text-neutral-800">
        {titulo}
      </h3>

      <p className="mt-1 max-w-sm text-xs text-neutral-500 leading-relaxed">
        {descripcion}
      </p>

      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
