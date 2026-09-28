/** Detecta si una carrera pertenece a Psicología */
export function esPsicologiaCarrera(nombre: string): boolean {
  return nombre.toLowerCase().includes('psicolog');
}

/** Detecta si una carrera pertenece a la Facultad de Ciencias Empresariales */
export function esCarreraEmpresariales(carreraNombre: string, facultadNombre?: string): boolean {
  const c = carreraNombre.toLowerCase();
  const f = (facultadNombre ?? '').toLowerCase();
  return (
    f.includes('empresarial') ||
    c.includes('empresarial') ||
    c.includes('comercial') ||
    c.includes('administra') ||
    c.includes('marketing') ||
    c.includes('financiera') ||
    c.includes('contadur') ||
    c.includes('comercio') ||
    c.includes('turismo') ||
    c.includes('comunicaci') ||
    c.includes('negocio')
  );
}

/** Detecta si la carrera usa modalidad "solo área" (sin sorteo de caso) */
export function esModalidadSoloArea(carreraNombre: string, facultadNombre?: string): boolean {
  return (
    esPsicologiaCarrera(carreraNombre) ||
    esCarreraEmpresariales(carreraNombre, facultadNombre)
  );
}
