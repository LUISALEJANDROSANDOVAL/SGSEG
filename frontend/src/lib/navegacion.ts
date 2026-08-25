import {
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  Settings,
  Shuffle,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type Rol = 'Coordinador General' | 'Secretario de Facultad' | 'Jefe de Carrera'

export const roles: Rol[] = [
  'Coordinador General',
  'Secretario de Facultad',
  'Jefe de Carrera',
]

export type ItemNavegacion = {
  nombre: string
  ruta: string
  icono: LucideIcon
  descripcion: string
  roles: Rol[]
}

export const navegacion: { grupo: string; items: ItemNavegacion[] }[] = [
  {
    grupo: 'General',
    items: [
      {
        nombre: 'Panel Principal',
        ruta: '/',
        icono: LayoutDashboard,
        descripcion:
          'Resumen ejecutivo con estudiantes pendientes, sorteados y filtro por pensum.',
        roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera'],
      },
      {
        nombre: 'Sorteo Digital',
        ruta: '/sorteo',
        icono: Shuffle,
        descripcion:
          'Selección aleatoria de áreas y casos para defensa interna y externa, con acta de resultados.',
        roles: ['Coordinador General', 'Secretario de Facultad'],
      },
    ],
  },
  {
    grupo: 'Coordinación',
    items: [
      {
        nombre: 'Gestión de Casos',
        ruta: '/casos',
        icono: ClipboardList,
        descripcion:
          'Inventario de casos de estudio, control del límite de 2 usos y alertas de stock crítico.',
        roles: ['Coordinador General', 'Jefe de Carrera'],
      },
      {
        nombre: 'Estudiantes',
        ruta: '/estudiantes',
        icono: Users,
        descripcion:
          'Padrón de postulantes por carrera y pensum, con estado de habilitación y sorteo.',
        roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera'],
      },
    ],
  },
  {
    grupo: 'Administración',
    items: [
      {
        nombre: 'Reportes',
        ruta: '/reportes',
        icono: FileBarChart,
        descripcion:
          'Actas, estadísticas de rendimiento por área y exportación de resultados de defensa.',
        roles: ['Coordinador General', 'Secretario de Facultad'],
      },
      {
        nombre: 'Configuración',
        ruta: '/configuracion',
        icono: Settings,
        descripcion:
          'Parámetros del sorteo, límite de usos, permisos por rol y calendario del semestre.',
        roles: ['Coordinador General'],
      },
    ],
  },
]

export const todasLasPaginas: ItemNavegacion[] = navegacion.flatMap(
  (seccion) => seccion.items,
)
