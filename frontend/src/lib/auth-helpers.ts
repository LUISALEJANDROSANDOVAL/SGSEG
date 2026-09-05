import type { User } from '@/context/AuthContext';

/**
 * Resuelve de forma determinista el ID de la carrera asignada al usuario.
 * Evalúa tanto la propiedad directa `user.carreraId` como la relación `user.carreras[0].idCarrera`.
 */
export function getJefeCarreraId(user: User | null | undefined): string | undefined {
  if (!user) return undefined;
  if (user.carreraId && String(user.carreraId).trim() !== '') {
    return String(user.carreraId);
  }
  if (user.carreras && user.carreras.length > 0 && user.carreras[0]?.idCarrera) {
    return String(user.carreras[0].idCarrera);
  }
  return undefined;
}

/**
 * Obtiene el nombre legible de la carrera asignada al Jefe de Carrera si está disponible.
 */
export function getJefeCarreraNombre(user: User | null | undefined): string | undefined {
  if (!user) return undefined;
  if (user.carreras && user.carreras.length > 0 && user.carreras[0]?.nombre) {
    return user.carreras[0].nombre;
  }
  return undefined;
}

/**
 * Determina si el usuario autenticado tiene el rol de Jefe de Carrera.
 */
export function esJefeCarrera(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.rol === 'Jefe de Carrera' || user.rolCode === 'JEFE_CARRERA';
}
