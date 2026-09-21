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
  const rol = String(user.rol || '').trim().toLowerCase();
  const code = String(user.rolCode || '').trim().toUpperCase();
  return rol === 'jefe de carrera' || code === 'JEFE_CARRERA';
}

/**
 * Determina si el usuario autenticado tiene el rol de Vicerrectorado.
 */
export function esVicerrectorado(user: User | null | undefined): boolean {
  if (!user) return false;
  const rol = String(user.rol || '').trim().toLowerCase();
  const code = String(user.rolCode || '').trim().toUpperCase();
  return (
    rol === 'vicerrectorado' ||
    rol === 'vicerrector' ||
    rol.includes('vicerrector') ||
    code === 'VICERRECTORADO' ||
    code === 'VICERRECTOR' ||
    code.includes('VICERRECTOR')
  );
}

/**
 * Determina si el usuario tiene permiso formal para operar/iniciar el sorteo digital.
 * Vicerrectorado y Jefe de Carrera tienen prohibición reglamentaria (solo observadores).
 */
export function esOperadorSorteo(user: User | null | undefined): boolean {
  if (!user) return false;
  if (esVicerrectorado(user) || esJefeCarrera(user)) return false;
  const rol = String(user.rol || '').trim().toLowerCase();
  const code = String(user.rolCode || '').trim().toUpperCase();
  return (
    code === 'SECRETARIADO' ||
    code === 'COORDINACION' ||
    code === 'SUPER_ADMIN' ||
    rol === 'secretario de facultad' ||
    rol === 'coordinador general' ||
    rol === 'administrador general'
  );
}

/**
 * Determina si el usuario puede crear, editar o reactivar casos de estudio.
 * Vicerrectorado solo tiene permiso de lectura/auditoría.
 */
export function puedeGestionarCasos(user: User | null | undefined): boolean {
  if (!user) return false;
  if (esVicerrectorado(user)) return false;
  const rol = String(user.rol || '').trim().toLowerCase();
  const code = String(user.rolCode || '').trim().toUpperCase();
  return (
    code === 'JEFE_CARRERA' ||
    code === 'COORDINACION' ||
    code === 'SUPER_ADMIN' ||
    rol === 'jefe de carrera' ||
    rol === 'coordinador general' ||
    rol === 'administrador general'
  );
}

/**
 * Determina si el usuario puede inscribir, importar o alterar estudiantes.
 * Vicerrectorado y Jefe de Carrera solo tienen consulta/auditoría.
 */
export function puedeGestionarEstudiantes(user: User | null | undefined): boolean {
  if (!user) return false;
  if (esVicerrectorado(user) || esJefeCarrera(user)) return false;
  const rol = String(user.rol || '').trim().toLowerCase();
  const code = String(user.rolCode || '').trim().toUpperCase();
  return (
    code === 'COORDINACION' ||
    code === 'SECRETARIADO' ||
    code === 'SUPER_ADMIN' ||
    rol === 'coordinador general' ||
    rol === 'secretario de facultad' ||
    rol === 'administrador general'
  );
}

/**
 * Determina si el usuario puede programar o calificar defensas.
 * Vicerrectorado solo tiene supervisión y auditoría de actas.
 */
export function puedeGestionarDefensas(user: User | null | undefined): boolean {
  if (!user) return false;
  if (esVicerrectorado(user) || esJefeCarrera(user)) return false;
  const rol = String(user.rol || '').trim().toLowerCase();
  const code = String(user.rolCode || '').trim().toUpperCase();
  return (
    code === 'COORDINACION' ||
    code === 'SECRETARIADO' ||
    code === 'SUPER_ADMIN' ||
    rol === 'coordinador general' ||
    rol === 'secretario de facultad' ||
    rol === 'administrador general'
  );
}

/**
 * Determina si el usuario puede crear o editar usuarios y asignar roles (especialmente Jefe de Carrera).
 * Estrictamente reservado para Vicerrectorado y Administrador General (Super Admin).
 * Secretaría de Facultad, Jefe de Carrera y Coordinación NO pueden gestionar roles ni usuarios.
 */
export function puedeGestionarUsuarios(user: User | null | undefined): boolean {
  if (!user) return false;
  if (esVicerrectorado(user)) return true;
  const rol = String(user.rol || '').trim().toLowerCase();
  const code = String(user.rolCode || '').trim().toUpperCase();
  return (
    code === 'SUPER_ADMIN' ||
    rol === 'administrador general' ||
    rol === 'super admin' ||
    rol === 'admin'
  );
}


