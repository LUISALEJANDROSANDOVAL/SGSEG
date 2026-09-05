import { Menu, X, LogOut, ChevronRight, UserCog } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { navegacion } from '@/lib/navegacion'
import { useAuth } from '@/context/AuthContext'
import { NotificacionesPopover } from './notificaciones-popover'
import { ModalEditarPerfil } from './modal-editar-perfil'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false)
  const { user, logout, checkRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const rutaActual = location.pathname

  if (!user) return null

  const iniciales = user.nombre
    .split(' ')
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-gray-900 font-sans">

      {/* Mobile overlay */}
      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white text-gray-900 shadow-xl border-r border-gray-200 transition-transform duration-300 lg:translate-x-0 ${
          menuAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Subtle top red accent bar */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-0.5 bg-[#c8102e]" />

        {/* ── Logo header ── */}
        <div className="relative flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black ring-2 ring-gray-200 p-1">
              <img src="/logo-uagrm.png" alt="Logo UTEPSA" className="size-7 object-contain" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-extrabold tracking-wide text-gray-900">UTEPSA</p>
              <p className="text-[10px] font-normal text-gray-400">Gestión Académica</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMenuAbierto(false)}
            className="text-gray-400 transition-colors hover:text-gray-700 lg:hidden"
          >
            <X className="size-5" />
            <span className="sr-only">Cerrar menú</span>
          </button>
        </div>

        {/* ── User info (Clickable to edit profile, avatar & password) ── */}
        <div className="relative border-b border-gray-100 px-3.5 py-3">
          <div className="flex items-center justify-between mb-1.5 px-1.5">
            <p className="text-[9px] font-bold tracking-[0.18em] text-gray-400 uppercase">
              Usuario Conectado
            </p>
            <span className="text-[9px] font-bold text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
              ID: #{user.id}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setModalPerfilAbierto(true)}
            title="Haga clic para editar su foto, datos o cambiar contraseña"
            className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all duration-150 hover:bg-red-50/70 hover:ring-1 hover:ring-[#c8102e]/20"
          >
            <div className="relative shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.nombre}
                  className="size-9 rounded-full object-cover ring-2 ring-[#c8102e] shadow-sm"
                />
              ) : (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#c8102e] text-xs font-bold text-white ring-2 ring-red-100 shadow-sm transition-transform group-hover:scale-105">
                  {iniciales}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-gray-900 text-white shadow ring-1 ring-white">
                <UserCog className="size-2" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate group-hover:text-[#c8102e] transition-colors">
                {user.nombre}
              </p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.rol}</p>
            </div>
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="relative flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-5">
          {navegacion.map((seccion) => {
            const itemsFiltrados = seccion.items.filter((item) =>
              checkRole(item.roles)
            )
            if (itemsFiltrados.length === 0) return null

            return (
              <div key={seccion.grupo} className="flex flex-col gap-0.5">
                <p className="px-3 pb-1.5 text-[10px] font-bold tracking-[0.16em] text-gray-400 uppercase">
                  {seccion.grupo}
                </p>
                {itemsFiltrados.map((item) => {
                  const activo = rutaActual === item.ruta
                  return (
                    <Link
                      key={item.ruta}
                      to={item.ruta}
                      onClick={() => setMenuAbierto(false)}
                      aria-current={activo ? 'page' : undefined}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
                        activo
                          ? 'bg-[#c8102e]/10 font-semibold text-[#c8102e]'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icono className={`size-4 shrink-0 transition-transform group-hover:scale-110 ${activo ? 'text-[#c8102e]' : 'text-gray-400'}`} />
                      <span className="flex-1">{item.nombre}</span>
                      {activo && <ChevronRight className="size-3.5 text-[#c8102e]/60" />}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* ── Logout ── */}
        <div className="relative border-t border-gray-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 transition-all hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="size-4 shrink-0" />
            <span className="flex-1 text-left">Cerrar Sesión</span>
          </button>
        </div>

        <div className="relative border-t border-gray-100 px-5 py-3 text-[10px] text-gray-400">
          Semestre 2-2026 · v1.4.0
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex min-h-screen flex-col lg:pl-64">

        {/* ── Top header ── */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-gray-200 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              className="text-gray-600 transition-colors hover:text-gray-900 lg:hidden"
            >
              <Menu className="size-5" />
              <span className="sr-only">Abrir menú</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-bold text-gray-900">SGSEG</span>
              <span className="text-gray-300">/</span>
              <span className="font-medium text-gray-600">Sistema de Graduación UTEPSA</span>
            </div>
          </div>

          {/* Right section with functional Notifications */}
          <div className="flex items-center gap-3">
            <NotificacionesPopover />
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      {/* ── Modal Editar Perfil ── */}
      <ModalEditarPerfil
        abierto={modalPerfilAbierto}
        onCerrar={() => setModalPerfilAbierto(false)}
      />
    </div>
  )
}

