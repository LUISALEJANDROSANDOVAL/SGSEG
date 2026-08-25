import { Bell, Lock, Menu, Search, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { navegacion, roles, type Rol } from '@/lib/navegacion'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [rol, setRol] = useState<Rol>('Coordinador General')
  const location = useLocation()
  const rutaActual = location.pathname

  const iniciales = rol
    .split(' ')
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')

  return (
    <div className="min-h-screen bg-surface text-ink">
      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 z-30 bg-ink/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink text-white transition-transform duration-200 lg:translate-x-0 ${
          menuAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center bg-crimson text-sm font-bold tracking-tight">
              U
            </span>
            <span className="text-sm leading-tight font-semibold text-balance">
              UTEPSA
              <span className="block text-xs font-normal text-white/55">
                Gestión Académica
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMenuAbierto(false)}
            className="text-white/60 hover:text-white lg:hidden"
          >
            <X className="size-5" />
            <span className="sr-only">Cerrar menú</span>
          </button>
        </div>

        <div className="border-b border-white/10 px-6 py-4">
          <label
            htmlFor="selector-rol"
            className="text-[11px] font-medium tracking-[0.14em] text-white/35 uppercase"
          >
            Perfil activo
          </label>
          <select
            id="selector-rol"
            value={rol}
            onChange={(evento) => setRol(evento.target.value as Rol)}
            className="mt-2 w-full border border-white/15 bg-ink-soft px-3 py-2 text-sm text-white focus:border-crimson focus:outline-none"
          >
            {roles.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-6">
          {navegacion.map((seccion) => (
            <div key={seccion.grupo} className="flex flex-col gap-1">
              <p className="px-3 pb-2 text-[11px] font-medium tracking-[0.14em] text-white/35 uppercase">
                {seccion.grupo}
              </p>
              {seccion.items.map((item) => {
                const activo = rutaActual === item.ruta
                const permitido = item.roles.includes(rol)

                return (
                  <Link
                    key={item.ruta}
                    to={item.ruta}
                    onClick={() => setMenuAbierto(false)}
                    aria-current={activo ? 'page' : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                      activo
                        ? 'bg-ink-soft font-medium text-white'
                        : 'text-white/60 hover:bg-ink-soft hover:text-white'
                    }`}
                  >
                    <item.icono className="size-4 shrink-0" />
                    <span className="flex-1">{item.nombre}</span>
                    {!permitido && (
                      <>
                        <Lock className="size-3.5 text-white/30" />
                        <span className="sr-only">Sin permiso para este perfil</span>
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-6 py-4 text-xs text-white/40">
          Semestre 2-2026 · v1.4.0
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-line bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            className="text-ink lg:hidden"
          >
            <Menu className="size-5" />
            <span className="sr-only">Abrir menú</span>
          </button>

          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              placeholder="Buscar estudiantes, casos o exámenes..."
              aria-label="Búsqueda global"
              className="w-full border border-line bg-surface py-2.5 pr-3 pl-9 text-sm text-ink placeholder:text-neutral-400 focus:border-ink focus:bg-white focus:outline-none"
            />
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button type="button" className="relative text-ink-soft">
              <Bell className="size-5" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-crimson" />
              <span className="sr-only">Notificaciones: hay alertas nuevas</span>
            </button>

            <div className="flex items-center gap-3 border-l border-line pl-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm leading-tight font-medium">Andrea Salazar</p>
                <p className="text-xs text-neutral-500">{rol}</p>
              </div>
              <span className="flex size-9 items-center justify-center bg-ink text-xs font-semibold text-white">
                {iniciales}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
