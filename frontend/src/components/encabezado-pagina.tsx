export function EncabezadoPagina({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string
  descripcion: string
  accion?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-balance">{titulo}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-pretty text-neutral-500">
          {descripcion}
        </p>
      </div>
      {accion}
    </div>
  )
}
