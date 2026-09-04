import { useState, useEffect } from 'react'
import { Download, FileText, Layers, CheckCircle2 } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { useAuth } from '@/context/AuthContext'

interface CasoSimple {
  id: string
  titulo: string
  area: string
  usos: number
  estado: string
  fechaIngreso: string
}

export default function PaginaReportes() {
  const { user } = useAuth()
  const [casos, setCasos] = useState<CasoSimple[]>([])

  useEffect(() => {
    try {
      const data = localStorage.getItem('sgseg_casos_inventario_real_v2')
      if (data) {
        setCasos(JSON.parse(data))
      }
    } catch {
      setCasos([])
    }
  }, [])

  const totalCasos = casos.length
  const disponibles = casos.filter((c) => c.usos === 0 && c.estado !== 'INACTIVO' && c.estado !== 'AGOTADO').length
  const enUso = casos.filter((c) => c.usos === 1 && c.estado !== 'INACTIVO' && c.estado !== 'AGOTADO').length
  const inactivos = casos.filter((c) => c.usos >= 2 || c.estado === 'INACTIVO' || c.estado === 'AGOTADO').length

  // Agrupar casos por área
  const resumenPorArea = [
    'Arquitectura de Software',
    'Inteligencia Artificial y Datos',
    'Ciberseguridad y Redes',
    'Bases de Datos',
  ].map((area) => {
    const casosArea = casos.filter((c) => c.area === area)
    const disp = casosArea.filter((c) => c.usos < 2 && c.estado !== 'INACTIVO' && c.estado !== 'AGOTADO').length
    const inac = casosArea.filter((c) => c.usos >= 2 || c.estado === 'INACTIVO' || c.estado === 'AGOTADO').length
    return {
      area,
      total: casosArea.length,
      disponibles: disp,
      inactivos: inac,
    }
  })

  // Exportar reporte consolidado a CSV
  const descargarReporteConsolidado = () => {
    if (casos.length === 0) {
      alert('No hay casos registrados para exportar en este momento.')
      return
    }

    const encabezados = ['Código', 'Título', 'Área Académica', 'Usos Acumulados', 'Estado Oficial', 'Fecha Ingreso']
    const filas = casos.map((c) => [
      `"${c.id}"`,
      `"${c.titulo.replace(/"/g, '""')}"`,
      `"${c.area}"`,
      `${c.usos}/2`,
      `"${c.usos >= 2 ? 'INACTIVO (2/2)' : c.estado}"`,
      `"${c.fechaIngreso}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [encabezados.join(','), ...filas.map((f) => f.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `reporte_inventario_casos_carrera_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 font-sans">
        <EncabezadoPagina
          titulo="Reportes y Actas de Grado"
          descripcion="Informe consolidado de inventario de casos, disponibilidad por área y estado de defensas de la carrera."
          accion={
            <button
              type="button"
              onClick={descargarReporteConsolidado}
              className="flex items-center gap-2 bg-crimson px-4 py-2.5 text-xs font-bold text-white transition-opacity hover:bg-crimson/90 cursor-pointer shadow-sm"
            >
              <Download className="size-4" />
              Exportar Informe de Casos
            </button>
          }
        />

        {/* Indicadores reales */}
        <section className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4 shadow-2xs">
          <div className="bg-white px-5 py-4">
            <p className="text-[11px] font-bold tracking-[0.12em] text-neutral-500 uppercase">
              Total Casos Carrera
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">{totalCasos}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">En inventario oficial</p>
          </div>

          <div className="bg-white px-5 py-4">
            <p className="text-[11px] font-bold tracking-[0.12em] text-neutral-500 uppercase">
              Casos Disponibles
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-700">{disponibles}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Habilitados para sorteo (0/2)</p>
          </div>

          <div className="bg-white px-5 py-4">
            <p className="text-[11px] font-bold tracking-[0.12em] text-neutral-500 uppercase">
              Casos en Uso
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-amber-700">{enUso}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">1 defensa restante (1/2)</p>
          </div>

          <div className="bg-white px-5 py-4">
            <p className="text-[11px] font-bold tracking-[0.12em] text-neutral-500 uppercase">
              Casos Inactivos
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-crimson">{inactivos}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Límite alcanzado (2/2)</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Desglose por área de la carrera */}
          <section className="border border-line bg-white shadow-2xs">
            <header className="border-b border-line px-5 py-4 bg-surface">
              <h2 className="text-sm font-bold tracking-tight text-neutral-900">
                Disponibilidad por Área de la Carrera
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Carrera de Ingeniería de Sistemas ({user?.nombre || 'Jefe de Carrera'})
              </p>
            </header>
            <ul className="divide-y divide-line">
              {resumenPorArea.map((fila) => (
                <li key={fila.area} className="flex flex-col gap-2 px-5 py-3.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Layers className="size-3.5 text-neutral-400" />
                      <p className="text-xs font-semibold text-neutral-800">{fila.area}</p>
                    </div>
                    <p className="text-xs text-neutral-600 font-mono">
                      {fila.disponibles} disp. · {fila.inactivos} inactivos
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-surface">
                    <div
                      className="h-full bg-crimson"
                      style={{
                        width: fila.total > 0 ? `${(fila.disponibles / fila.total) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Documentos y Actas de la Carrera */}
          <section className="border border-line bg-white shadow-2xs">
            <header className="border-b border-line px-5 py-4 bg-surface">
              <h2 className="text-sm font-bold tracking-tight text-neutral-900">
                Plantillas y Formatos Oficiales
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Formatos de actas y constancias para el Jefe de Carrera
              </p>
            </header>
            <ul className="divide-y divide-line">
              <li className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-50">
                <FileText className="size-4 shrink-0 text-neutral-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-800">Formato Oficial de Acta de Sorteo Digital</p>
                  <p className="text-[11px] text-neutral-500">Plantilla UTEPSA · Semestre 2-2026</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Descargando plantilla oficial de acta en PDF.')}
                  className="shrink-0 border border-line px-3 py-1 text-xs font-medium hover:bg-surface"
                >
                  Descargar
                </button>
              </li>
              <li className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-50">
                <FileText className="size-4 shrink-0 text-neutral-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-800">Formulario de Reactivación Excepcional de Casos</p>
                  <p className="text-[11px] text-neutral-500">Respaldo documental firmado por Jefatura (RF-05)</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Descargando formulario de reactivación excepcional.')}
                  className="shrink-0 border border-line px-3 py-1 text-xs font-medium hover:bg-surface"
                >
                  Descargar
                </button>
              </li>
              <li className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-50">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-800">Inventario Actual de Casos Registrados</p>
                  <p className="text-[11px] text-neutral-500">{totalCasos} casos cargados en el repositorio</p>
                </div>
                <button
                  type="button"
                  onClick={descargarReporteConsolidado}
                  className="shrink-0 border border-line px-3 py-1 text-xs font-medium hover:bg-surface"
                >
                  Exportar CSV
                </button>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
