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

import type { Rol } from '@/context/AuthContext'
export type { Rol }

export const roles: Rol[] = [
  'Coordinador General',
  'Secretario de Facultad',
  'Jefe de Carrera',
  'Vicerrectorado',
  'Registro',
  'Defensas de Grado',
  'Administrador General',
]

const TODOS_LOS_ROLES: Rol[] = [
  'Coordinador General',
  'Secretario de Facultad',
  'Jefe de Carrera',
  'Vicerrectorado',
  'Registro',
  'Defensas de Grado',
  'Administrador General',
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
        roles: TODOS_LOS_ROLES,
      },
      {
        nombre: 'Sorteo Digital',
        ruta: '/sorteo',
        icono: Shuffle,
        descripcion:
          'Selección aleatoria de áreas y casos para defensa interna y externa, con acta de resultados.',
        roles: TODOS_LOS_ROLES,
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
        roles: TODOS_LOS_ROLES,
      },
      {
        nombre: 'Estudiantes',
        ruta: '/estudiantes',
        icono: Users,
        descripcion:
          'Padrón de postulantes por carrera y pensum, con estado de habilitación y sorteo.',
        roles: TODOS_LOS_ROLES,
      },
      {
        nombre: 'Cronograma y Defensas',
        ruta: '/defensas',
        icono: Calendar,
        descripcion:
          'Calendario general de defensas, embudo de estados y verificación de plazos reglamentarios.',
        roles: TODOS_LOS_ROLES,
      },
      {
        nombre: 'Estructura Académica',
        ruta: '/academia',
        icono: GraduationCap,
        descripcion:
          'Gestión de facultades, carreras, áreas académicas y pensums vinculados.',
        roles: TODOS_LOS_ROLES,
      },
      {
        nombre: 'Usuarios y Roles',
        ruta: '/usuarios',
        icono: ShieldCheck,
        descripcion:
          'Administración de accesos, perfiles de usuario y activación/desactivación de cuentas.',
        roles: TODOS_LOS_ROLES,
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
        roles: TODOS_LOS_ROLES,
      },
      {
        nombre: 'Configuración',
        ruta: '/configuracion',
        icono: Settings,
        descripcion:
          'Parámetros del sorteo, límite de usos, permisos por rol y calendario del semestre.',
        roles: TODOS_LOS_ROLES,
      },
    ],
  },
]

export const todasLasPaginas: ItemNavegacion[] = navegacion.flatMap(
  (seccion) => seccion.items,
)
