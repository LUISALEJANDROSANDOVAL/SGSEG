import { useState, useRef } from 'react'
import {
  X,
  Pencil,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Camera,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { useAuth, type User as AuthUser } from '@/context/AuthContext'
import api from '@/lib/api'

interface ModalEditarPerfilProps {
  abierto: boolean
  onCerrar: () => void
}

export function ModalEditarPerfil({ abierto, onCerrar }: ModalEditarPerfilProps) {
  const { user, updateUser } = useAuth()
  const [tabActiva, setTabActiva] = useState<'acerca' | 'seguridad' | 'configuracion'>('acerca')
  const [modoEdicion, setModoEdicion] = useState(false)
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
  const [telefono, setTelefono] = useState('-')
  const [direccion, setDireccion] = useState('-')
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

  const nombresCompletos = [primerNombre, segundoNombre].filter(Boolean).join(' ') || primerNombreDefault
  const apellidosCompletos = [primerApellido, segundoApellido].filter(Boolean).join(' ') || primerApellidoDefault
  const nombreCompletoDisplay = [nombresCompletos, apellidosCompletos].filter(Boolean).join(' ') || user.nombre

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
      setMensajeExito('Foto de perfil actualizada exitosamente.')
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
  const handleGuardarDatos = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMsg(null)
    setMensajeExito(null)
    setGuardando(true)

    try {
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
      setModoEdicion(false)
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

  const passTieneMinimo6 = newPassword.length >= 6
  const passCoincide = Boolean(confirmPassword && newPassword === confirmPassword)

  const carreraNombre =
    user.carreras && user.carreras.length > 0
      ? user.carreras.map((c) => c.nombre).join(', ')
      : 'Sistemas / Multicarrera UTEPSA'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      
      {/* ── CONTENEDOR PRINCIPAL BLANCO ELEVADO ── */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8">
        
        {/* ── BARRA SUPERIOR DE PESTAÑAS (DENTRO DEL MODAL BLANCO - ALTO CONTRASTE) ── */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 pt-5 pb-0">
          <div className="flex items-center gap-6 sm:gap-8 text-sm">
            
            {/* Pestaña: Acerca de mí */}
            <button
              type="button"
              onClick={() => {
                setTabActiva('acerca')
                setErrorMsg(null)
                setMensajeExito(null)
              }}
              className={`relative pb-3.5 text-sm font-bold transition-all ${
                tabActiva === 'acerca'
                  ? 'text-[#c8102e]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Acerca de mí
              {tabActiva === 'acerca' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c8102e] rounded-full" />
              )}
            </button>

            {/* Pestaña: Seguridad y Contraseña */}
            <button
              type="button"
              onClick={() => {
                setTabActiva('seguridad')
                setErrorMsg(null)
                setMensajeExito(null)
              }}
              className={`relative pb-3.5 text-sm font-bold transition-all ${
                tabActiva === 'seguridad'
                  ? 'text-[#c8102e]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Seguridad y Contraseña
              {tabActiva === 'seguridad' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c8102e] rounded-full" />
              )}
            </button>

            {/* Pestaña: Configuración */}
            <button
              type="button"
              onClick={() => {
                setTabActiva('configuracion')
                setErrorMsg(null)
                setMensajeExito(null)
              }}
              className={`relative pb-3.5 text-sm font-bold transition-all ${
                tabActiva === 'configuracion'
                  ? 'text-[#c8102e]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Configuración
              {tabActiva === 'configuracion' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c8102e] rounded-full" />
              )}
            </button>
          </div>

          {/* Botón Cerrar Modal */}
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors -mt-3.5"
          >
            <X className="size-5" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>

        {/* ── NOTIFICACIONES DE FEEDBACK ── */}
        {(mensajeExito || errorMsg) && (
          <div className="px-6 pt-4 animate-in fade-in">
            {mensajeExito && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800">
                <Check className="size-4 shrink-0 text-emerald-600" />
                <span>{mensajeExito}</span>
              </div>
            )}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-[#c8102e]">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* ── CONTENIDO DEL MODAL ── */}
        <div className="p-6 sm:p-8">
          
          {/* PESTAÑA 1: ACERCA DE MÍ */}
          {tabActiva === 'acerca' && (
            <div className="relative">
              
              {/* Botón de edición tipo lápiz en la esquina superior derecha */}
              <div className="absolute top-0 right-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModoEdicion(!modoEdicion)}
                  title={modoEdicion ? 'Ver información' : 'Editar información del perfil'}
                  className={`flex size-9 items-center justify-center rounded-lg border transition-all ${
                    modoEdicion
                      ? 'border-[#c8102e] bg-red-50 text-[#c8102e]'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900 shadow-xs'
                  }`}
                >
                  {modoEdicion ? <X className="size-4" /> : <Pencil className="size-4" />}
                </button>
              </div>

              {/* Encabezado con Avatar y Fotografía */}
              <div className="flex items-center gap-5 pb-6 mb-6 border-b border-gray-100">
                <div className="relative group shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={user.nombre}
                      className="size-16 sm:size-18 rounded-full object-cover ring-2 ring-[#c8102e] shadow-sm"
                    />
                  ) : (
                    <div className="flex size-16 sm:size-18 items-center justify-center rounded-full bg-[#c8102e] text-xl font-bold text-white shadow-sm">
                      {iniciales}
                    </div>
                  )}
                  
                  {/* Botón de cámara visible solo al editar */}
                  {modoEdicion && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Cambiar foto de perfil"
                      className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-gray-900 text-white shadow hover:bg-[#c8102e] transition-colors"
                    >
                      <Camera className="size-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-10">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                      {nombreCompletoDisplay}
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-[10px] font-bold text-[#c8102e]">
                      <ShieldCheck className="size-3" />
                      {user.rol}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {user.email}
                  </p>

                  {/* Opciones de foto visibles solo al editar */}
                  {modoEdicion && (
                    <div className="mt-2 flex items-center gap-2 animate-in fade-in">
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
                        className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-2xs"
                      >
                        Actualizar foto
                      </button>
                      {avatar && (
                        <button
                          type="button"
                          onClick={eliminarFoto}
                          className="rounded-md px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── CAMPOS DE DATOS (2 COLUMNAS) ── */}
              {modoEdicion ? (
                <form onSubmit={handleGuardarDatos} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Nombre <span className="text-[#c8102e]">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={primerNombre}
                          onChange={(e) => setPrimerNombre(e.target.value)}
                          placeholder="Primer nombre"
                          className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#c8102e] focus:bg-white focus:ring-1 focus:ring-[#c8102e]/20"
                        />
                        <input
                          type="text"
                          value={segundoNombre}
                          onChange={(e) => setSegundoNombre(e.target.value)}
                          placeholder="Segundo nombre"
                          className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#c8102e] focus:bg-white focus:ring-1 focus:ring-[#c8102e]/20"
                        />
                      </div>
                    </div>

                    {/* Apellido */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Apellido <span className="text-[#c8102e]">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={primerApellido}
                          onChange={(e) => setPrimerApellido(e.target.value)}
                          placeholder="Primer apellido"
                          className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#c8102e] focus:bg-white focus:ring-1 focus:ring-[#c8102e]/20"
                        />
                        <input
                          type="text"
                          value={segundoApellido}
                          onChange={(e) => setSegundoApellido(e.target.value)}
                          placeholder="Segundo apellido"
                          className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#c8102e] focus:bg-white focus:ring-1 focus:ring-[#c8102e]/20"
                        />
                      </div>
                    </div>

                    {/* Dirección de correo */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-800">
                          Dirección de correo
                        </label>
                        <span className="text-[10px] text-gray-400 font-normal">
                          (No editable)
                        </span>
                      </div>
                      <input
                        type="email"
                        readOnly
                        disabled
                        value={user.email}
                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-mono text-gray-500 cursor-not-allowed select-all"
                      />
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Ej: +591 70000000"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#c8102e] focus:bg-white focus:ring-1 focus:ring-[#c8102e]/20"
                      />
                    </div>

                    {/* Departamento */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Departamento
                      </label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={user.rol}
                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    {/* Intereses / Carrera */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Intereses / Carrera
                      </label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={carreraNombre}
                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    {/* País */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        País
                      </label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value="Bolivia (Estado Plurinacional de)"
                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    {/* City/Town */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        City/Town
                      </label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value="Santa Cruz"
                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    {/* Dirección */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        placeholder="Dirección institucional o particular"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#c8102e] focus:bg-white focus:ring-1 focus:ring-[#c8102e]/20"
                      />
                    </div>
                  </div>

                  {/* Acciones de guardado */}
                  <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setModoEdicion(false)}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardando}
                      className="flex items-center gap-2 rounded-lg bg-[#c8102e] px-5 py-2 text-xs font-bold text-white shadow hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      <Save className="size-3.5" />
                      <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* ── MODO VISTA (ESTILO DE LA IMAGEN DE REFERENCIA) ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  {/* Nombre */}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">Nombre</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{nombresCompletos}</p>
                  </div>

                  {/* Apellido */}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">Apellido</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{apellidosCompletos}</p>
                  </div>

                  {/* Dirección de correo */}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">Dirección de correo</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{user.email}</p>
                  </div>

                  {/* Teléfono */}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">Teléfono</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{telefono}</p>
                  </div>

                  {/* Departamento */}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">Departamento</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{user.rol}</p>
                  </div>

                  {/* Intereses */}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">Intereses</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{carreraNombre}</p>
                  </div>

                  {/* País */}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">País</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Bolivia (Estado Plurinacional de)</p>
                  </div>

                  {/* City/Town */}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">City/Town</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Santa Cruz</p>
                  </div>

                  {/* Dirección */}
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm font-bold text-gray-800">Dirección</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{direccion}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA 2: SEGURIDAD Y CONTRASEÑA */}
          {tabActiva === 'seguridad' && (
            <form onSubmit={handleCambiarPassword} className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Seguridad de la Cuenta</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Actualice su contraseña periódicamente para proteger sus operaciones en el sistema SGSEG.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 max-w-lg">
                {/* Contraseña actual */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Contraseña Actual <span className="text-[#c8102e]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarCurrent ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 pr-10 text-xs text-gray-900 outline-none focus:border-[#c8102e] focus:bg-white focus:ring-1 focus:ring-[#c8102e]/20"
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
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Nueva Contraseña <span className="text-[#c8102e]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarNew ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 pr-10 text-xs text-gray-900 outline-none focus:border-[#c8102e] focus:bg-white focus:ring-1 focus:ring-[#c8102e]/20"
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

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Confirmar Nueva Contraseña <span className="text-[#c8102e]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita la nueva contraseña"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 pr-10 text-xs text-gray-900 outline-none focus:border-[#c8102e] focus:bg-white focus:ring-1 focus:ring-[#c8102e]/20"
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

                {/* Requisitos */}
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-100 flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2
                      className={`size-3.5 ${
                        passTieneMinimo6 ? 'text-emerald-600' : 'text-gray-300'
                      }`}
                    />
                    <span className={passTieneMinimo6 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                      Al menos 6 caracteres
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2
                      className={`size-3.5 ${
                        passCoincide ? 'text-emerald-600' : 'text-gray-300'
                      }`}
                    />
                    <span className={passCoincide ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                      Las contraseñas coinciden
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-start gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={guardando || !currentPassword || !newPassword || !passCoincide || !passTieneMinimo6}
                  className="flex items-center gap-2 rounded-lg bg-[#c8102e] px-5 py-2 text-xs font-bold text-white shadow hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  <KeyRound className="size-3.5" />
                  <span>{guardando ? 'Actualizando...' : 'Actualizar Contraseña'}</span>
                </button>
              </div>
            </form>
          )}

          {/* PESTAÑA 3: CONFIGURACIÓN */}
          {tabActiva === 'configuracion' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Configuración de Cuenta Institucional</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Parámetros generales de la sesión y entorno académico UTEPSA.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="text-xs font-bold text-gray-800">ID de Usuario</p>
                  <p className="text-sm font-mono text-gray-600 mt-0.5">#{user.id}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="text-xs font-bold text-gray-800">Período Académico</p>
                  <p className="text-sm text-gray-600 mt-0.5">Semestre 2-2026</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="text-xs font-bold text-gray-800">Estado de Cuenta</p>
                  <p className="text-sm font-semibold text-emerald-700 mt-0.5">ACTIVO (Verificado)</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="text-xs font-bold text-gray-800">Sede</p>
                  <p className="text-sm text-gray-600 mt-0.5">Campus Central Santa Cruz</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
