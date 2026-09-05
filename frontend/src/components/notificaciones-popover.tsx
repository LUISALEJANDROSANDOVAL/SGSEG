import { useState, useEffect, useRef } from 'react'
import { Bell, CalendarClock, PackageX, CheckCircle2, RefreshCw, ChevronRight, X, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { defensasApi, type Defensa } from '@/lib/defensas.api'
import { casosApi, type MetricasCasos } from '@/lib/casos.api'

interface NotificacionItem {
  id: string
  tipo: 'defensa_sin_sorteo' | 'stock_critico' | 'sistema'
  titulo: string
  descripcion: string
  detalle?: string
  fecha?: string
  urgencia: 'alta' | 'media' | 'baja'
  ruta: string
  leida: boolean
}

export function NotificacionesPopover() {
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([])
  const [filtro, setFiltro] = useState<'todas' | 'defensas' | 'casos'>('todas')
  const [idsLeidos, setIdsLeidos] = useState<string[]>(() => {
    try {
      const guardados = localStorage.getItem('sgseg_notif_leidas')
      return guardados ? JSON.parse(guardados) : []
    } catch {
      return []
    }
  })

  const contenedorRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Guardar IDs leídos en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sgseg_notif_leidas', JSON.stringify(idsLeidos))
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [idsLeidos])

  // Cargar notificaciones y alertas desde el backend
  const cargarAlertas = async () => {
    setCargando(true)
    try {
      const items: NotificacionItem[] = []

      // 1. Consultar alertas operativas de defensas próximas
      try {
        const alertasDefensas: Defensa[] = await defensasApi.getAlertas(30)
        if (Array.isArray(alertasDefensas)) {
          alertasDefensas.forEach((defensa) => {
            const estudiante = defensa.instancia?.proceso?.estudiante
            const postulante = estudiante?.nombreCompleto || 'Postulante asignado'
            const carrera = estudiante?.planEstudio?.carrera?.nombre || 'Carrera'
            const fechaStr = defensa.fechaDefensa
              ? new Date(defensa.fechaDefensa).toLocaleDateString('es-BO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Fecha por definir'

            items.push({
              id: `defensa-${defensa.idDefensa}`,
              tipo: 'defensa_sin_sorteo',
              titulo: 'Defensa próxima sin sorteo',
              descripcion: `${postulante} · ${carrera}`,
              detalle: `Defensa programada para el ${fechaStr}`,
              fecha: fechaStr,
              urgencia: 'alta',
              ruta: `/defensas?search=${encodeURIComponent(estudiante?.carnetEstudiantil || '')}`,
              leida: idsLeidos.includes(`defensa-${defensa.idDefensa}`),
            })
          })
        }
      } catch (err) {
        console.warn('No se pudieron obtener alertas de defensas:', err)
      }

      // 2. Consultar alertas de casos con stock crítico
      try {
        const metricas: MetricasCasos = await casosApi.getMetricas()
        if (metricas?.stockCritico && metricas.stockCritico.length > 0) {
          metricas.stockCritico.forEach((areaStock, idx) => {
            items.push({
              id: `stock-${areaStock.idArea || idx}`,
              tipo: 'stock_critico',
              titulo: 'Stock crítico de casos de estudio',
              descripcion: `Área: ${areaStock.nombreArea} (${areaStock.carrera || 'Carrera'})`,
              detalle: areaStock.mensajeAlerta || `Solo quedan ${areaStock.casosDisponibles} casos disponibles (umbral: ${areaStock.umbralRequerido})`,
              urgencia: 'media',
              ruta: `/casos?search=${encodeURIComponent(areaStock.nombreArea || '')}`,
              leida: idsLeidos.includes(`stock-${areaStock.idArea || idx}`),
            })
          })
        }
      } catch (err) {
        console.warn('No se pudieron obtener métricas de stock:', err)
      }

      // 3. Notificación informativa del sistema
      items.push({
        id: 'sistema-bienvenida-semestre',
        tipo: 'sistema',
        titulo: 'Sistema SGSEG Operativo',
        descripcion: 'Período académico Semestre 2-2026 en curso.',
        detalle: 'Reglas de 2 usos por caso y validaciones DDL activas.',
        urgencia: 'baja',
        ruta: '/reportes',
        leida: idsLeidos.includes('sistema-bienvenida-semestre'),
      })

      setNotificaciones(items)
    } finally {
      setCargando(false)
    }
  }

  // Cargar alertas al montar
  useEffect(() => {
    cargarAlertas()
    const interval = setInterval(cargarAlertas, 60000)
    return () => clearInterval(interval)
  }, [])

  // Cerrar popover al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
        setAbierto(false)
      }
    }
    if (abierto) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [abierto])

  const noLeidas = notificaciones.filter((n) => !idsLeidos.includes(n.id))
  const cantidadNoLeidas = noLeidas.length

  const marcarComoLeida = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!idsLeidos.includes(id)) {
      setIdsLeidos((prev) => [...prev, id])
    }
  }

  const marcarTodasComoLeidas = () => {
    const todosLosIds = notificaciones.map((n) => n.id)
    setIdsLeidos((prev) => Array.from(new Set([...prev, ...todosLosIds])))
  }

  const handleItemClick = (notif: NotificacionItem) => {
    marcarComoLeida(notif.id)
    setAbierto(false)
    navigate(notif.ruta)
  }

  const notificacionesFiltradas = notificaciones.filter((n) => {
    if (filtro === 'defensas') return n.tipo === 'defensa_sin_sorteo'
    if (filtro === 'casos') return n.tipo === 'stock_critico'
    return true
  })

  return (
    <div className="relative" ref={contenedorRef}>
      {/* Botón de la campana */}
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        aria-expanded={abierto}
        aria-label={`Notificaciones: ${cantidadNoLeidas} no leídas`}
        className={`relative rounded-lg p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#c8102e]/30 ${
          abierto
            ? 'bg-red-50 text-[#c8102e]'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Bell className="size-5 transition-transform" />
        
        {cantidadNoLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-[#c8102e] text-[10px] font-extrabold text-white ring-2 ring-white shadow-sm">
            {cantidadNoLeidas > 9 ? '9+' : cantidadNoLeidas}
          </span>
        )}
      </button>

      {/* Popover / Menú desplegable */}
      {abierto && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header del menú */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#c8102e]/10 text-[#c8102e]">
                <Bell className="size-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-gray-900 tracking-tight">Centro de Notificaciones</h3>
                <p className="text-[10px] text-gray-500">
                  {cantidadNoLeidas === 0
                    ? 'No hay alertas pendientes'
                    : `${cantidadNoLeidas} alerta${cantidadNoLeidas > 1 ? 's' : ''} sin revisar`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={cargarAlertas}
                title="Actualizar alertas"
                className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                <RefreshCw className={`size-3.5 ${cargando ? 'animate-spin text-[#c8102e]' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                title="Cerrar"
                className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Filtros de categorías */}
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 bg-white text-[11px]">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setFiltro('todas')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  filtro === 'todas'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Todas ({notificaciones.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltro('defensas')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  filtro === 'defensas'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Defensas
              </button>
              <button
                type="button"
                onClick={() => setFiltro('casos')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  filtro === 'casos'
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Casos
              </button>
            </div>

            {cantidadNoLeidas > 0 && (
              <button
                type="button"
                onClick={marcarTodasComoLeidas}
                className="text-[10px] font-semibold text-[#c8102e] hover:underline"
              >
                Marcar leídas
              </button>
            )}
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 bg-white">
            {cargando && notificaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-gray-400">
                <RefreshCw className="size-5 animate-spin text-[#c8102e] mb-2" />
                Cargando notificaciones...
              </div>
            ) : notificacionesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-green-50 text-green-600 mb-2">
                  <CheckCircle2 className="size-5" />
                </div>
                <p className="text-xs font-semibold text-gray-800">¡Todo al día!</p>
                <p className="text-[11px] text-gray-400 mt-0.5">No hay notificaciones en esta categoría.</p>
              </div>
            ) : (
              notificacionesFiltradas.map((notif) => {
                const esLeida = idsLeidos.includes(notif.id)
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`group relative flex cursor-pointer items-start gap-3 p-3.5 text-left transition-all duration-150 hover:bg-gray-50 ${
                      esLeida ? 'opacity-70 bg-white' : 'bg-red-50/20'
                    }`}
                  >
                    {/* Indicador de no leída */}
                    {!esLeida && (
                      <span className="absolute left-1.5 top-5 size-1.5 rounded-full bg-[#c8102e]" />
                    )}

                    {/* Icono temático */}
                    <div className="shrink-0 mt-0.5 ml-1">
                      {notif.tipo === 'defensa_sin_sorteo' && (
                        <span className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
                          <CalendarClock className="size-4" />
                        </span>
                      )}
                      {notif.tipo === 'stock_critico' && (
                        <span className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                          <PackageX className="size-4" />
                        </span>
                      )}
                      {notif.tipo === 'sistema' && (
                        <span className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                          <Sparkles className="size-4" />
                        </span>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs ${esLeida ? 'font-medium text-gray-800' : 'font-bold text-gray-900'}`}>
                          {notif.titulo}
                        </p>
                        {notif.urgencia === 'alta' && !esLeida && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-extrabold text-red-700 uppercase tracking-wider">
                            Urgente
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-medium text-gray-700 mt-0.5 truncate">
                        {notif.descripcion}
                      </p>

                      {notif.detalle && (
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {notif.detalle}
                        </p>
                      )}
                    </div>

                    {/* Flecha de navegación al hacer hover */}
                    <ChevronRight className="size-4 text-gray-300 group-hover:text-[#c8102e] group-hover:translate-x-0.5 transition-all self-center" />
                  </div>
                )
              })
            )}
          </div>

          {/* Footer del Popover */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setAbierto(false)
                navigate('/defensas')
              }}
              className="font-semibold text-gray-600 hover:text-[#c8102e] transition-colors"
            >
              Ver Cronograma de Defensas
            </button>
            <button
              type="button"
              onClick={() => {
                setAbierto(false)
                navigate('/casos')
              }}
              className="font-semibold text-gray-600 hover:text-[#c8102e] transition-colors"
            >
              Ver Inventario de Casos
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
