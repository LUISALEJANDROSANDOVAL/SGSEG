
interface TableSkeletonProps {
  filas?: number
  columnas?: number
  className?: string
}

export function TableSkeleton({ filas = 5, columnas = 4, className = '' }: TableSkeletonProps) {
  return (
    <div className={`w-full divide-y divide-line overflow-hidden border border-line bg-white ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center gap-4 bg-surface px-4 py-3">
        {Array.from({ length: columnas }).map((_, colIdx) => (
          <div
            key={colIdx}
            className="h-3.5 bg-neutral-200/70 animate-pulse rounded-xs"
            style={{ width: `${Math.max(60, 100 - colIdx * 15)}px` }}
          />
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: filas }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: columnas }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-3.5 bg-neutral-100 animate-pulse rounded-xs"
              style={{
                width: colIdx === 0 ? '140px' : colIdx === 1 ? '180px' : '90px',
                opacity: 1 - rowIdx * 0.1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
