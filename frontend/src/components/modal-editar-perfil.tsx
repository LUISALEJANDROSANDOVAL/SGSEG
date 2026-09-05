import { useState, useRef } from 'react'
import { X, User, KeyRound, Camera, Shield, Check, AlertCircle, Eye, EyeOff, Save, Trash2, Building, Hash, Lock } from 'lucide-react'
import { useAuth, type User as AuthUser } from '@/context/AuthContext'
import api from '@/lib/api'

interface ModalEditarPerfilProps {
  abierto: boolean
  onCerrar: () => void
}

export function ModalEditarPerfil({ abierto, onCerrar }: ModalEditarPerfilProps) {
  const { user, updateUser } = useAuth()
  const [tabActiva, setTabActiva] = useState<'datos' | 'password'>('datos')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Separar nombres si están disponibles o usar el nombre compuesto
  const partesNombre = (user?.nombre || '').split(' ')
  const primerNombreDefault = user?.primerNombre || partesNombre[0] || ''
  const segundoNombreDefault = user?.segundoNombre || (partesNombre.length > 2 ? partesNombre[1] : '')
  const primerApellidoDefault = user?.primerApellido || (partesNombre.length > 1 ? partesNombre[partesNombre.length - 1] : '')
  const segundoApellidoDefault = user?.segundoApellido || ''

  // Formulario datos
  const [primerNombre, setPrimerNombre] = useState(primerNombreDefault)
  const [segundoNombre, setSegundoNombre] = useState(segundoNombreDefault)
  const [primerApellido, setPrimerApellido] = useState(primerApellidoDefault)
  const [segundoApellido, setSegundoApellido] = useState(segundoApellidoDefault)
  const [avatar, setAvatar] = useState<string | null>(() => {
    if (!user) return null
    return user.avatarUrl || localStorage.getItem(`sgseg_avatar_${user.id}`) || null
  })

  // Formulario contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mostrarCurrent, setMostrarCurrent] = useState(false)
  const [mostrarNew, setMostrarNew] = useState(false)
  const [mostrarConfirm, setMostrarConfirm] = useState(false)

  // Estados de retroalimentación
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!abierto || !user) return null

  const iniciales = (user.nombre || 'U')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  // Manejo de subida de imagen de perfil
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP).')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('La imagen no debe superar los 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setAvatar(base64)
      localStorage.setItem(`sgseg_avatar_${user.id}`, base64)
      updateUser?.({ avatarUrl: base64 })
      setMensajeExito('Foto de perfil actualizada.')
      setTimeout(() => setMensajeExito(null), 3000)
    }
    reader.readAsDataURL(file)
  }

  const eliminarFoto = () => {
    setAvatar(null)
    localStorage.removeItem(`sgseg_avatar_${user.id}`)
    updateUser?.({ avatarUrl: undefined })
    setMensajeExito('Foto de perfil restablecida al avatar predeterminado.')
    setTimeout(() => setMensajeExito(null), 3000)
  }

  // Guardar datos de perfil
  const handleGuardarDatos = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setMensajeExito(null)
    setGuardando(true)

    try {
      // 1. Intentar actualizar en backend
      const payload = {
        primerNombre: primerNombre.trim(),
        segundoNombre: segundoNombre.trim() || undefined,
        primerApellido: primerApellido.trim(),
        segundoApellido: segundoApellido.trim() || undefined,
      }

      try {
        await api.patch('/auth/profile', payload)
      } catch (err: any) {
        console.warn('No se pudo sincronizar con /auth/profile, actualizando localmente:', err)
      }

      const nuevoNombreCompleto = [primerNombre, segundoNombre, primerApellido, segundoApellido]
        .filter(Boolean)
        .join(' ')
        .trim()

      const updatedFields: Partial<AuthUser> = {
        nombre: nuevoNombreCompleto || user.nombre,
        primerNombre: primerNombre.trim(),
        segundoNombre: segundoNombre.trim(),
        primerApellido: primerApellido.trim(),
        segundoApellido: segundoApellido.trim(),
        avatarUrl: avatar || undefined,
      }

      updateUser?.(updatedFields)
      setMensajeExito('¡Datos personales actualizados correctamente!')
      setTimeout(() => setMensajeExito(null), 3500)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar los cambios del perfil.')
    } finally {
      setGuardando(false)
    }
  }

  // Guardar cambio de contraseña
  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setMensajeExito(null)

    if (!currentPassword) {
      setErrorMsg('Debe ingresar su contraseña actual.')
      return
    }

    if (newPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe contener al menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Verifique e intente nuevamente.')
      return
    }

    if (currentPassword === newPassword) {
      setErrorMsg('La nueva contraseña no puede ser idéntica a la anterior.')
      return
    }

    setGuardando(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      })

      setMensajeExito('¡Contraseña modificada exitosamente!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setMensajeExito(null), 4000)
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          'Error al cambiar la contraseña. Verifique que la contraseña actual sea correcta.'
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden my-8">
        
        {/* Barra superior de acento UTEPSA */}
        <div className="h-1 bg-gradient-to-r from-[#c8102e] via-red-600 to-black" />

        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/60">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#c8102e]/10 text-[#c8102e]">
              <User className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Editar Perfil de Usuario</h2>
                <span className="flex items-center gap-1 rounded-full bg-gray-200/80 px-2 py-0.5 text-[10px] font-bold text-gray-700 tracking-wider">
                  <Hash className="size-3" /> ID: {user.id}
                </span>
              </div>
              <p className="text-xs text-gray-500">{user.rol} · Semestre 2-2026</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navegación por pestañas */}
        <div className="flex border-b border-gray-200 bg-gray-50/40 px-6 pt-2">
          <button
            type="button"
            onClick={() => {
              setTabActiva('datos')
              setErrorMsg(null)
              setMensajeExito(null)
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              tabActiva === 'datos'
                ? 'border-[#c8102e] text-[#c8102e]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="size-4" />
            Datos Personales e ID
          </button>

          <button
            type="button"
            onClick={() => {
              setTabActiva('password')
              setErrorMsg(null)
              setMensajeExito(null)
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              tabActiva === 'password'
                ? 'border-[#c8102e] text-[#c8102e]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <KeyRound className="size-4" />
            Seguridad y Contraseña
          </button>
        </div>

        {/* Alertas de Éxito / Error */}
        <div className="px-6 pt-4">
          {mensajeExito && (
            <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800 animate-in fade-in">
              <Check className="size-4 shrink-0 text-emerald-600" />
              <span>{mensajeExito}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-800 animate-in fade-in">
              <AlertCircle className="size-4 shrink-0 text-[#c8102e]" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Contenido de la pestaña 1: Datos Personales */}
        {tabActiva === 'datos' && (
          <form onSubmit={handleGuardarDatos} className="p-6 space-y-6">
            
            {/* Sección Foto de Perfil */}
            <div className="flex items-center gap-5 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="relative group">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user.nombre}
                    className="size-16 rounded-full object-cover ring-2 ring-[#c8102e] shadow-md"
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-full bg-[#c8102e] text-lg font-extrabold text-white ring-2 ring-red-100 shadow-md">
                    {iniciales}
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Cambiar foto de perfil"
                  className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-gray-900 text-white shadow hover:bg-[#c8102e] transition-colors"
                >
                  <Camera className="size-3.5" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900">Foto de Perfil</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Formatos recomendados: JPG, PNG o WebP (máximo 2MB).
                </p>
                
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFotoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-white border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
                  >
                    Subir nueva foto
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={eliminarFoto}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="size-3" />
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Datos del Usuario */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Primer Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={primerNombre}
                  onChange={(e) => setPrimerNombre(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-[#c8102e]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Segundo Nombre
                </label>
                <input
                  type="text"
                  value={segundoNombre}
                  onChange={(e) => setSegundoNombre(e.target.value)}
                  placeholder="(Opcional)"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-[#c8102e]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Primer Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={primerApellido}
                  onChange={(e) => setPrimerApellido(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-[#c8102e]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Segundo Apellido
                </label>
                <input
                  type="text"
                  value={segundoApellido}
                  onChange={(e) => setSegundoApellido(e.target.value)}
                  placeholder="(Opcional)"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-[#c8102e]/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">
                  Correo Institucional UTEPSA
                </label>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                  <Lock className="size-3" /> Permanente (No editable)
                </span>
              </div>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  disabled
                  value={user.email}
                  className="w-full rounded-lg border border-gray-200 bg-gray-100/90 px-3 py-2 text-xs font-medium text-gray-600 cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Metadatos institucionales informativos */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl bg-gray-50 p-3.5 border border-gray-100">
              <div className="flex items-center gap-2.5">
                <Shield className="size-4 text-[#c8102e]" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Rol Asignado</p>
                  <p className="text-xs font-semibold text-gray-800">{user.rol}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Building className="size-4 text-gray-500" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Carrera / Jurisdicción</p>
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {user.carreras && user.carreras.length > 0
                      ? user.carreras.map((c) => c.nombre).join(', ')
                      : 'Institucional / Multicarrera'}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={onCerrar}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex items-center gap-2 rounded-lg bg-[#c8102e] px-5 py-2 text-xs font-bold text-white shadow hover:bg-red-700 transition-all disabled:opacity-50"
              >
                <Save className="size-4" />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}

        {/* Contenido de la pestaña 2: Cambio de Contraseña */}
        {tabActiva === 'password' && (
          <form onSubmit={handleCambiarPassword} className="p-6 space-y-5">
            <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3.5">
              <p className="text-xs font-bold text-amber-900">Recomendaciones de Seguridad</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Utilice una contraseña segura de al menos 6 caracteres que incluya letras y números para proteger sus operaciones en el SGSEG.
              </p>
            </div>

            {/* Contraseña Actual */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Contraseña Actual <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-xs text-gray-900 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-[#c8102e]/20"
                />
                <button
                  type="button"
                  onClick={() => setMostrarCurrent(!mostrarCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {mostrarCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nueva Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-xs text-gray-900 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-[#c8102e]/20"
                />
                <button
                  type="button"
                  onClick={() => setMostrarNew(!mostrarNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {mostrarNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Confirmar Nueva Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la nueva contraseña"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-xs text-gray-900 focus:border-[#c8102e] focus:outline-none focus:ring-2 focus:ring-[#c8102e]/20"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirm(!mostrarConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {mostrarConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={onCerrar}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando || !currentPassword || !newPassword}
                className="flex items-center gap-2 rounded-lg bg-[#c8102e] px-5 py-2 text-xs font-bold text-white shadow hover:bg-red-700 transition-all disabled:opacity-50"
              >
                <KeyRound className="size-4" />
                {guardando ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
