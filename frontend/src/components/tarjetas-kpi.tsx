import { useState, useEffect } from 'react'
import { AlertTriangle, BookOpen, GraduationCap, Users } from 'lucide-react'
import { estudiantesApi } from '@/lib/estudiantes.api'

export function TarjetasKpi() {
  const [totalEstudiantes, setTotalEstudiantes] = useState<number>(0)
  const [casosDisponibles, setCasosDisponibles] = useState<number>(0)
  const [casosInactivos, setCasosInactivos] = useState<number>(0)

  useEffect(() => {
    // 1. Cargar conteo real de casos desde storage
    try {
      const data = localStorage.getItem('sgseg_casos_inventario_real_v2')
      if (data) {
        const casos = JSON.parse(data)
        const disp = casos.filter((c: any) => c.usos === 0 && c.estado !== 'INACTIVO' && c.estado !== 'AGOTADO').length
        const inact = casos.filter((c: any) => c.usos >= 2 || c.estado === 'INACTIVO' || c.estado === 'AGOTADO').length
        setCasosDisponibles(disp)
        setCasosInactivos(inact)
      } else {
        setCasosDisponibles(0)
        setCasosInactivos(0)
      }
    } catch {
      setCasosDisponibles(0)
      setCasosInactivos(0)
    }

    // 2. Cargar conteo real de estudiantes desde la API
    estudiantesApi
      .getEstudiantes({ limit: 1 })
      .then((res) => {
        if (res && res.pagination) {
          setTotalEstudiantes(res.pagination.total || 0)
        }
      })
      .catch(() => {
        setTotalEstudiantes(0)
      })
  }, [])

  return (
    <section
      aria-label="Indicadores clave"
      className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4 font-sans shadow-2xs"
    >
      <article className="flex flex-col gap-2 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[0.12em] text-neutral-500 uppercase">
            Estudiantes en Padrón
          </p>
          <Users className="size-4 text-neutral-400" />
        </div>
        <p className="text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
          {totalEstudiantes}
        </p>
        <p className="text-xs text-neutral-500">Postulantes registrados en el sistema</p>
      </article>

      <article className="flex flex-col gap-2 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[0.12em] text-neutral-500 uppercase">
            Casos Disponibles (0/2)
          </p>
          <BookOpen className="size-4 text-emerald-600" />
        </div>
        <p className="text-3xl font-bold tracking-tight text-emerald-700 tabular-nums">
          {casosDisponibles}
        </p>
        <p className="text-xs text-neutral-500">Listos para rol de sorteos</p>
      </article>

      <article className="flex flex-col gap-2 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[0.12em] text-neutral-500 uppercase">
            Casos Inactivos (2/2)
          </p>
          <AlertTriangle className="size-4 text-crimson" />
        </div>
        <p className="text-3xl font-bold tracking-tight text-crimson tabular-nums">
          {casosInactivos}
        </p>
        <p className="text-xs text-neutral-500">Retirados por límite de uso (RF-04)</p>
      </article>

      <article className="flex flex-col gap-2 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[0.12em] text-neutral-500 uppercase">
            Defensas Programadas
          </p>
          <GraduationCap className="size-4 text-neutral-400" />
        </div>
        <p className="text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
          0
        </p>
        <p className="text-xs text-neutral-500">Periodo académico 2-2026</p>
      </article>
    </section>
  )
}
