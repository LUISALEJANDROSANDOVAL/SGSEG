import { useEffect, useRef, useState, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react'

export interface RuletaItem {
  id: string
  label: string
  sublabel?: string
  color?: string
  textColor?: string
  badge?: string
  data?: Record<string, unknown>
}

interface RuletaCanvasProps {
  items: RuletaItem[]
  onFinish?: (selectedItem: RuletaItem, index: number) => void
  disabled?: boolean
  size?: number
  targetIndex?: number | null
  title?: string
  subtitle?: string
  spinButtonText?: string
  accentColor?: string
}

// Paleta institucional por defecto
const COLORES_DEFAULT = [
  '#9E1B32', // Carmín Institucional
  '#1E293B', // Pizarra Profundo
  '#0F172A', // Tinta / Onyx
  '#B45309', // Ámbar Académico
  '#047857', // Esmeralda
  '#4338CA', // Índigo Real
  '#831843', // Borgoña
  '#0E7490', // Cyan Oscuro
]

export function RuletaCanvas({
  items,
  onFinish,
  disabled = false,
  size = 460,
  targetIndex = null,
  title,
  subtitle,
  spinButtonText = 'Iniciar Giro Aleatorio',
  accentColor = '#9E1B32',
}: RuletaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [ganador, setGanador] = useState<RuletaItem | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [needleBounce, setNeedleBounce] = useState(0)

  // Referencias mutables para el ciclo de animación físico
  const rotationRef = useRef<number>(0) // en radianes
  const animFrameRef = useRef<number | null>(null)
  const lastSectorPassedRef = useRef<number>(-1)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Inicializar Web Audio API para ticks sintéticos
  const playTickSound = useCallback(() => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtxRef.current = new AudioCtx()
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(520, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.035)

      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.04)
    } catch {
      // Audio no disponible o silenciado
    }
  }, [soundEnabled])

  const triggerInstitutionalConfetti = useCallback(() => {
    // Ráfaga institucional UTEPSA
    const end = Date.now() + 2.5 * 1000
    const colors = ['#9E1B32', '#C5A059', '#1E293B', '#F59E0B', '#FFFFFF', '#10B981']

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 65,
        origin: { x: 0.15, y: 0.7 },
        colors,
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 65,
        origin: { x: 0.85, y: 0.7 },
        colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [])

  // Dibujar la ruleta en el Canvas
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || items.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const displaySize = size
    canvas.width = displaySize * dpr
    canvas.height = displaySize * dpr
    ctx.scale(dpr, dpr)

    const centerX = displaySize / 2
    const centerY = displaySize / 2
    const outerRadius = displaySize / 2 - 18
    const innerHubRadius = 42
    const numSlices = items.length
    const sliceAngle = (2 * Math.PI) / numSlices

    ctx.clearRect(0, 0, displaySize, displaySize)

    // 1. Sombra exterior elegante
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)'
    ctx.shadowBlur = 18
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 8
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius + 8, 0, 2 * Math.PI)
    ctx.fillStyle = '#1e293b'
    ctx.fill()
    ctx.restore()

    // 2. Anillo metálico exterior (Bisel institucional)
    const rimGradient = ctx.createLinearGradient(
      centerX - outerRadius,
      centerY - outerRadius,
      centerX + outerRadius,
      centerY + outerRadius,
    )
    rimGradient.addColorStop(0, '#334155')
    rimGradient.addColorStop(0.3, '#64748b')
    rimGradient.addColorStop(0.5, '#f8fafc')
    rimGradient.addColorStop(0.7, '#475569')
    rimGradient.addColorStop(1, '#1e293b')

    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius + 8, 0, 2 * Math.PI)
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI, true)
    ctx.fillStyle = rimGradient
    ctx.fill()

    // 3. Slices / Segmentos de la ruleta
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotationRef.current)

    for (let i = 0; i < numSlices; i++) {
      const item = items[i]
      const startAngle = i * sliceAngle
      const endAngle = startAngle + sliceAngle
      const baseColor = item.color || COLORES_DEFAULT[i % COLORES_DEFAULT.length]

      // Segmento
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, outerRadius, startAngle, endAngle)
      ctx.closePath()

      // Gradiente sutil radial dentro de la rebanada
      const sliceGrad = ctx.createRadialGradient(
        0,
        0,
        innerHubRadius,
        0,
        0,
        outerRadius,
      )
      sliceGrad.addColorStop(0, baseColor)
      sliceGrad.addColorStop(1, adjustColorBrightness(baseColor, -20))

      ctx.fillStyle = sliceGrad
      ctx.fill()

      // Línea divisoria elegante
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Remaches metálicos en el borde exterior
      const pegAngle = startAngle + sliceAngle / 2
      const pegX = (outerRadius - 6) * Math.cos(pegAngle)
      const pegY = (outerRadius - 6) * Math.sin(pegAngle)
      ctx.beginPath()
      ctx.arc(pegX, pegY, 3, 0, 2 * Math.PI)
      ctx.fillStyle = '#f8fafc'
      ctx.fill()
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1
      ctx.stroke()

      // 4. Texto y etiquetas del slice
      ctx.save()
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'

      const textColor = item.textColor || '#FFFFFF'
      ctx.fillStyle = textColor

      // Ajuste tipográfico dinámico según cantidad de elementos
      const maxTextLength = numSlices > 10 ? 16 : 24
      let labelText = item.label
      if (labelText.length > maxTextLength) {
        labelText = labelText.substring(0, maxTextLength - 2) + '...'
      }

      const fontSize = numSlices > 12 ? 11 : numSlices > 8 ? 12 : 13
      ctx.font = `600 ${fontSize}px Inter, sans-serif`
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      // Dibujar texto principal
      const textRadius = outerRadius - 22
      ctx.fillText(labelText, textRadius, 0)

      // Subetiqueta / Badge si existe
      if (item.sublabel && numSlices <= 8) {
        ctx.font = '500 10px Inter, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.fillText(item.sublabel, textRadius, 14)
      }

      ctx.restore()
    }

    ctx.restore()

    // 5. Núcleo central / Botón central cromado (Hub)
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerHubRadius, 0, 2 * Math.PI)
    const hubGrad = ctx.createRadialGradient(
      centerX - 10,
      centerY - 10,
      4,
      centerX,
      centerY,
      innerHubRadius,
    )
    hubGrad.addColorStop(0, '#ffffff')
    hubGrad.addColorStop(0.3, '#f1f5f9')
    hubGrad.addColorStop(0.7, '#cbd5e1')
    hubGrad.addColorStop(1, '#64748b')
    ctx.fillStyle = hubGrad
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#94a3b8'
    ctx.stroke()
    ctx.restore()

    // Círculo institucional interno
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerHubRadius - 10, 0, 2 * Math.PI)
    ctx.fillStyle = accentColor
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = '#ffffff'
    ctx.stroke()

    // Icono / Texto UTEPSA en el centro
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 11px Inter, sans-serif'
    ctx.fillText('SGSEG', centerX, centerY)
  }, [items, size, accentColor])

  // Ajustar brillo de colores hexadecimales
  function adjustColorBrightness(hex: string, percent: number) {
    let num = parseInt(hex.replace('#', ''), 16)
    if (isNaN(num)) return hex
    if (hex.length === 4) {
      num = parseInt(
        hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3],
        16,
      )
    }
    const r = Math.min(255, Math.max(0, (num >> 16) + percent))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent))
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  // Redibujar al cambiar tamaño, items o color
  useEffect(() => {
    drawWheel()
  }, [drawWheel])

  // Calcular índice que coincide con el puntero superior (apunta a las 12 en punto = -PI/2)
  const getPointerIndex = useCallback(
    (currentAngle: number) => {
      const numSlices = items.length
      if (numSlices === 0) return 0
      const sliceAngle = (2 * Math.PI) / numSlices

      // El puntero está fijo en -PI/2 (arriba / 12 en punto)
      // Queremos saber qué segmento contiene (-PI/2 - currentAngle) mod 2PI
      let normalized = ((-Math.PI / 2 - currentAngle) % (2 * Math.PI))
      if (normalized < 0) normalized += 2 * Math.PI

      return Math.floor(normalized / sliceAngle) % numSlices
    },
    [items.length],
  )

  // Ejecutar giro con física natural de desaceleración
  const girarRuleta = () => {
    if (isSpinning || disabled || items.length === 0) return

    setIsSpinning(true)
    setGanador(null)

    const numSlices = items.length
    const sliceAngle = (2 * Math.PI) / numSlices

    // Determinar índice objetivo aleatorio si no se especificó targetIndex
    const selectedIdx =
      targetIndex !== null && targetIndex >= 0 && targetIndex < numSlices
        ? targetIndex
        : Math.floor(Math.random() * numSlices)

    // Posición angular exacta donde la flecha (a las 12 en punto) apunta al centro del sector seleccionado
    const targetOffset = selectedIdx * sliceAngle + sliceAngle / 2
    // Número de giros completos (entre 5 y 8 vueltas para emoción física)
    const fullSpins = 6 + Math.floor(Math.random() * 3)

    // Ajustar ángulo final
    const currentAngle = rotationRef.current % (2 * Math.PI)
    // El puntero apunta a -PI/2 en coordenadas de canvas.
    let desiredTargetAngle = -Math.PI / 2 - targetOffset
    while (desiredTargetAngle <= currentAngle) {
      desiredTargetAngle += 2 * Math.PI
    }
    const totalRotationNeeded =
      desiredTargetAngle - currentAngle + fullSpins * 2 * Math.PI

    const startAngle = rotationRef.current
    const targetFinalAngle = startAngle + totalRotationNeeded

    // Parámetros de simulación física (4.6 segundos con curva de desaceleración suave)
    const duration = 4600 // ms
    const startTime = performance.now()
    lastSectorPassedRef.current = getPointerIndex(startAngle)

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Curva de desaceleración natural (Quintic Ease-Out)
      const ease = 1 - Math.pow(1 - progress, 4.5)
      const newAngle = startAngle + totalRotationNeeded * ease
      rotationRef.current = newAngle

      // Detección de paso de sector para sonido y rebote del puntero
      const currentSector = getPointerIndex(newAngle)
      if (currentSector !== lastSectorPassedRef.current) {
        lastSectorPassedRef.current = currentSector
        playTickSound()
        // Animación de rebote del puntero
        setNeedleBounce(progress < 0.85 ? (1 - progress) * 8 : 1)
        setTimeout(() => setNeedleBounce(0), 60)
      }

      drawWheel()

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Finalización exacta
        rotationRef.current = targetFinalAngle
        drawWheel()
        setIsSpinning(false)
        const itemGanador = items[selectedIdx]
        setGanador(itemGanador)
        triggerInstitutionalConfetti()

        if (onFinish) {
          onFinish(itemGanador, selectedIdx)
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }

  // Cancelar animación si se desmonta
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Encabezado contextual */}
      {(title || subtitle) && (
        <div className="mb-4 text-center">
          {title && (
            <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5 max-w-sm">{subtitle}</p>
          )}
        </div>
      )}

      {/* Contenedor del Canvas con Puntero Superior */}
      <div
        className="relative flex items-center justify-center select-none"
        style={{ width: size, height: size }}
      >
        {/* Puntero Superior (Needle / Flipper con rebote) */}
        <div
          className="absolute top-0 left-1/2 z-20 -translate-x-1/2 pointer-events-none transition-transform duration-75"
          style={{
            transform: `translateX(-50%) rotate(${needleBounce * -3}deg)`,
            transformOrigin: 'top center',
          }}
        >
          <div className="relative flex flex-col items-center">
            <svg
              width="36"
              height="42"
              viewBox="0 0 36 42"
              fill="none"
              className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
            >
              <path
                d="M18 40L6 10C5 7 7 4 10 4H26C29 4 31 7 30 10L18 40Z"
                fill="#C5A059"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <circle cx="18" cy="11" r="5" fill="#9E1B32" />
            </svg>
          </div>
        </div>

        {/* Canvas de la ruleta */}
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="rounded-full cursor-pointer transition-transform active:scale-[0.99]"
          onClick={!isSpinning && !disabled ? girarRuleta : undefined}
        />

        {/* Control de Audio flotante */}
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute bottom-2 right-2 z-10 rounded-full bg-white/90 p-2 text-gray-600 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-gray-900"
          title={soundEnabled ? 'Silenciar ruleta' : 'Activar sonido'}
        >
          {soundEnabled ? (
            <Volume2 className="size-4 text-emerald-600" />
          ) : (
            <VolumeX className="size-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Resultado Destacado */}
      {ganador && !isSpinning && (
        <div className="mt-5 w-full max-w-md animate-fade-in-up rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-4 text-center shadow-sm">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold tracking-wider text-amber-800 uppercase">
            Resultado Oficial Sorteado
          </span>
          <p className="mt-2 text-lg font-bold text-gray-900">{ganador.label}</p>
          {ganador.sublabel && (
            <p className="mt-0.5 text-xs text-gray-600">{ganador.sublabel}</p>
          )}
        </div>
      )}

      {/* Botón de Giro Principal */}
      <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-2">
        <button
          type="button"
          onClick={girarRuleta}
          disabled={isSpinning || disabled || items.length === 0}
          className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9E1B32] to-[#7f1527] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-crimson/20 transition-all hover:shadow-lg hover:shadow-crimson/30 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`size-4 transition-transform ${
              isSpinning ? 'animate-spin' : 'group-hover:rotate-180 duration-500'
            }`}
          />
          {isSpinning ? 'Sorteando en vivo...' : spinButtonText}
        </button>

        {items.length === 0 && (
          <p className="text-xs text-red-500">
            No hay elementos disponibles para sortear en esta categoría.
          </p>
        )}
      </div>
    </div>
  )
}
