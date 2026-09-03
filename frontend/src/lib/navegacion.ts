import {
  Calendar,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  Settings,
  Shuffle,
  Users,
  GraduationCap,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

export type Rol =
  | 'Coordinador General'
  | 'Secretario de Facultad'
  | 'Jefe de Carrera'
  | 'Vicerrectorado'
  | 'Registro'
  | 'Defensas de Grado'

export const roles: Rol[] = [
  'Coordinador General',
  'Secretario de Facultad',
  'Jefe de Carrera',
  'Vicerrectorado',
  'Registro',
  'Defensas de Grado',
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
        roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera', 'Vicerrectorado', 'Registro', 'Defensas de Grado'],
      },
      {
        nombre: 'Sorteo Digital',
        ruta: '/sorteo',
        icono: Shuffle,
        descripcion:
          'Selección aleatoria de áreas y casos para defensa interna y externa, con acta de resultados.',
        roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera', 'Vicerrectorado'],
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
        roles: ['Coordinador General', 'Jefe de Carrera', 'Vicerrectorado'],
      },
      {
        nombre: 'Estudiantes',
        ruta: '/estudiantes',
        icono: Users,
        descripcion:
          'Padrón de postulantes por carrera y pensum, con estado de habilitación y sorteo.',
        roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera', 'Vicerrectorado', 'Registro', 'Defensas de Grado'],
      },
      {
        nombre: 'Cronograma y Defensas',
        ruta: '/defensas',
        icono: Calendar,
        descripcion:
          'Calendario general de defensas, embudo de estados y verificación de plazos reglamentarios.',
        roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera', 'Vicerrectorado'],
      },
      {
        nombre: 'Estructura Académica',
        ruta: '/academia',
        icono: GraduationCap,
        descripcion:
          'Gestión de facultades, carreras, áreas académicas y pensums vinculados.',
        roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera', 'Vicerrectorado'],
      },
      {
        nombre: 'Usuarios y Roles',
        ruta: '/usuarios',
        icono: ShieldCheck,
        descripcion:
          'Administración de accesos, perfiles de usuario y activación/desactivación de cuentas.',
        roles: ['Coordinador General'],
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
        roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera', 'Vicerrectorado', 'Registro', 'Defensas de Grado'],
      },
      {
        nombre: 'Configuración',
        ruta: '/configuracion',
        icono: Settings,
        descripcion:
          'Parámetros del sorteo, límite de usos, permisos por rol y calendario del semestre.',
        roles: ['Coordinador General', 'Vicerrectorado'],
      },
    ],
  },
]

export const todasLasPaginas: ItemNavegacion[] = navegacion.flatMap(
  (seccion) => seccion.items,
)
