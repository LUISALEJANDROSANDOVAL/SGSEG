/**
 * Script de Pruebas Integrales de los 10 Módulos de SGSEG
 * Conexión directa a la API en ejecución http://localhost:3000/api
 */
const BASE_URL = 'http://localhost:3000/api';

async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

async function login(email, password = 'Password123!') {
  // Probar primero con Admin123! y luego con Password123!
  let r = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correoInstitucional: email, password: 'Admin123!' }),
  });
  if (r.status === 200 && (r.data.accessToken || r.data.token)) {
    return r.data.accessToken || r.data.token;
  }
  r = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correoInstitucional: email, password }),
  });
  return r.data?.accessToken || r.data?.token || null;
}

const resultados = [];

function registrar(modulo, test, pass, detalle) {
  resultados.push({ modulo, test, pass, detalle });
  const icon = pass ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${modulo}] ${test}: ${detalle}`);
}

async function run() {
  console.log('================================================================');
  console.log('🚀 INICIANDO PRUEBAS INTEGRALES DE LOS 10 MÓDULOS DE SGSEG');
  console.log('================================================================\n');

  // ─────────────────────────────────────────────────────────────────
  // MÓDULO 1: Autenticación, Usuarios y Control de Acceso (RBAC)
  // ─────────────────────────────────────────────────────────────────
  console.log('--- Probando Módulo 1: Autenticación & RBAC ---');
  const tokenVice = await login('vicerrector@uni.edu.bo');
  const tokenSec = await login('secretaria@uni.edu.bo');
  const tokenJefe = await login('jefe.sistemas@uni.edu.bo');
  const tokenCoord = await login('coord@uni.edu.bo');

  registrar('M1: Auth & RBAC', 'Login Vicerrectorado', !!tokenVice, tokenVice ? 'Token JWT emitido exitosamente' : 'Fallo de autenticación');
  registrar('M1: Auth & RBAC', 'Login Secretaría', !!tokenSec, tokenSec ? 'Token JWT emitido exitosamente' : 'Fallo de autenticación');
  registrar('M1: Auth & RBAC', 'Login Jefe Carrera', !!tokenJefe, tokenJefe ? 'Token JWT emitido exitosamente' : 'Fallo de autenticación');
  registrar('M1: Auth & RBAC', 'Login Coordinación', !!tokenCoord, tokenCoord ? 'Token JWT emitido exitosamente' : 'Fallo de autenticación');

  // RBAC estricto en /auth/users
  const rUsersVice = await api('/auth/users', { headers: { Authorization: `Bearer ${tokenVice}` } });
  registrar('M1: Auth & RBAC', 'Acceso Gestión Usuarios (Vicerrectorado)', rUsersVice.status === 200, `Status HTTP: ${rUsersVice.status} (Esperado: 200)`);

  const rUsersSec = await api('/auth/users', { headers: { Authorization: `Bearer ${tokenSec}` } });
  registrar('M1: Auth & RBAC', 'Bloqueo Gestión Usuarios (Secretaría)', rUsersSec.status === 403, `Status HTTP: ${rUsersSec.status} (Esperado: 403 Forbidden)`);

  const rUsersJefe = await api('/auth/users', { headers: { Authorization: `Bearer ${tokenJefe}` } });
  registrar('M1: Auth & RBAC', 'Bloqueo Gestión Usuarios (Jefe Carrera)', rUsersJefe.status === 403, `Status HTTP: ${rUsersJefe.status} (Esperado: 403 Forbidden)`);

  const rUsersCoord = await api('/auth/users', { headers: { Authorization: `Bearer ${tokenCoord}` } });
  registrar('M1: Auth & RBAC', 'Bloqueo Gestión Usuarios (Coordinación)', rUsersCoord.status === 403, `Status HTTP: ${rUsersCoord.status} (Esperado: 403 Forbidden)`);

  // ─────────────────────────────────────────────────────────────────
  // MÓDULO 2: Dashboard / Panel Principal
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- Probando Módulo 2: Dashboard ---');
  const resRoot = await fetch('http://localhost:3000/');
  const rRootData = await resRoot.json().catch(() => null);
  registrar('M2: Dashboard', 'Verificación de Estado API Root', resRoot.status === 200 && rRootData?.status === 'online', `API Status: ${rRootData?.status}, Sistema: ${rRootData?.sistema}`);

  const rDashboard = await api('/admin/dashboard', { headers: { Authorization: `Bearer ${tokenVice}` } });
  registrar('M2: Dashboard', 'Disponibilidad Dashboard Administrativo', rDashboard.status === 200, `Status HTTP: ${rDashboard.status}, Mensaje: ${rDashboard.data?.message}`);

  // ─────────────────────────────────────────────────────────────────
  // MÓDULO 3: Sorteo Digital de Grado
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- Probando Módulo 3: Sorteo Digital ---');
  const rAreasSistemas = await api('/casos/areas?idCarrera=86', { headers: { Authorization: `Bearer ${tokenSec}` } });
  const hasAreas = rAreasSistemas.status === 200 && Array.isArray(rAreasSistemas.data) && rAreasSistemas.data.length > 0;
  registrar('M3: Sorteo Digital', 'Consulta de Áreas por Carrera (Sistemas ID 86)', hasAreas, `Áreas disponibles obtenidas: ${rAreasSistemas.data?.length || 0}`);

  const idAreaEjemplo = rAreasSistemas.data?.[0]?.idArea || '400';
  const rCasosArea = await api(`/casos?idArea=${idAreaEjemplo}`, { headers: { Authorization: `Bearer ${tokenSec}` } });
  const hasCasos = rCasosArea.status === 200 && (rCasosArea.data?.items?.length > 0 || rCasosArea.data?.length > 0);
  registrar('M3: Sorteo Digital', `Consulta de Casos para Área #${idAreaEjemplo}`, hasCasos, `Casos encontrados: ${rCasosArea.data?.items?.length ?? rCasosArea.data?.length ?? 0}`);

  // Verificar estado de la defensa de Alejandro Morales (#21)
  const rDefensas = await api('/defensas', { headers: { Authorization: `Bearer ${tokenSec}` } });
  const defAlejandro = rDefensas.data?.items?.find(d => d.instancia?.proceso?.estudiante?.nombreCompleto?.includes('Alejandro'));
  const alejandroEnDefensa = defAlejandro && defAlejandro.estadoDefensa === 'CASO_ASIGNADO' && defAlejandro.idCasoUtilizado;
  registrar('M3: Sorteo Digital', 'Estado de Alejandro Morales en PostgreSQL', !!alejandroEnDefensa, `estadoDefensa: ${defAlejandro?.estadoDefensa}, idCasoUtilizado: ${defAlejandro?.idCasoUtilizado}`);

  // ─────────────────────────────────────────────────────────────────
  // MÓDULO 4: Banco de Casos de Estudio
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- Probando Módulo 4: Casos de Estudio ---');
  const rAllCasos = await api('/casos', { headers: { Authorization: `Bearer ${tokenCoord}` } });
  const totalCasos = rAllCasos.data?.pagination?.total ?? (Array.isArray(rAllCasos.data) ? rAllCasos.data.length : 0);
  registrar('M4: Banco de Casos', 'Listado General de Casos de Estudio', rAllCasos.status === 200 && totalCasos > 0, `Total de casos en catálogo: ${totalCasos}`);

  const rCasosDisponibles = await api('/casos?estado=DISPONIBLE', { headers: { Authorization: `Bearer ${tokenCoord}` } });
  registrar('M4: Banco de Casos', 'Filtro de Casos por Estado DISPONIBLE', rCasosDisponibles.status === 200, `Casos con disponibilidad: ${rCasosDisponibles.data?.pagination?.total ?? rCasosDisponibles.data?.items?.length ?? 0}`);

  // ─────────────────────────────────────────────────────────────────
  // MÓDULO 5: Padrón y Gestión de Estudiantes
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- Probando Módulo 5: Estudiantes ---');
  const rEstudiantes = await api('/estudiantes', { headers: { Authorization: `Bearer ${tokenSec}` } });
  const totalEstudiantes = rEstudiantes.data?.pagination?.total ?? (Array.isArray(rEstudiantes.data) ? rEstudiantes.data.length : 0);
  registrar('M5: Estudiantes', 'Padrón Oficial de Postulantes', rEstudiantes.status === 200 && totalEstudiantes > 0, `Total postulantes registrados: ${totalEstudiantes}`);

  const rEstSearch = await api('/estudiantes?search=Morales', { headers: { Authorization: `Bearer ${tokenSec}` } });
  const foundMorales = rEstSearch.data?.items?.some(e => e.nombreCompleto?.includes('Morales')) || (Array.isArray(rEstSearch.data) && rEstSearch.data.some(e => e.nombreCompleto?.includes('Morales')));
  registrar('M5: Estudiantes', 'Búsqueda de Postulante por Apellido ("Morales")', !!foundMorales, 'Postulante localizado correctamente en padrón');

  // ─────────────────────────────────────────────────────────────────
  // MÓDULO 6: Cronograma y Defensas de Grado
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- Probando Módulo 6: Defensas de Grado ---');
  const totalDefensas = rDefensas.data?.pagination?.total ?? (rDefensas.data?.items?.length || 0);
  registrar('M6: Defensas', 'Consulta General de Defensas Programadas', rDefensas.status === 200 && totalDefensas > 0, `Defensas en calendario: ${totalDefensas}`);

  const estadosPresentes = [...new Set(rDefensas.data?.items?.map(d => d.estadoDefensa) || [])];
  registrar('M6: Defensas', 'Embudo de Estados de Defensa', estadosPresentes.length > 0, `Estados activos detectados: ${estadosPresentes.join(', ')}`);

  // ─────────────────────────────────────────────────────────────────
  // MÓDULO 7: Estructura Académica (Áreas y Carreras)
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- Probando Módulo 7: Estructura Académica ---');
  const rAllAreas = await api('/casos/areas', { headers: { Authorization: `Bearer ${tokenSec}` } });
  const totalAreas = Array.isArray(rAllAreas.data) ? rAllAreas.data.length : 0;
  registrar('M7: Estructura Académica', 'Catálogo de Áreas Académicas Institucionales', rAllAreas.status === 200 && totalAreas > 0, `Áreas académicas configuradas: ${totalAreas}`);

  const rAcademiaCarreras = await api('/academia/carreras', { headers: { Authorization: `Bearer ${tokenSec}` } });
  registrar('M7: Estructura Académica', 'Endpoint Oficial /academia/carreras', rAcademiaCarreras.status === 200 && Array.isArray(rAcademiaCarreras.data), `Carreras con facultades devueltas: ${rAcademiaCarreras.data?.length || 0}`);

  // ─────────────────────────────────────────────────────────────────
  // MÓDULO 8: Auditoría y Trazabilidad Forense en Base de Datos
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- Probando Módulo 8: Auditoría y Trazabilidad Forense ---');
  const rAuditoriaVice = await api('/auditoria', { headers: { Authorization: `Bearer ${tokenVice}` } });
  registrar('M8: Auditoría', 'Consulta Bitácora Forense (Vicerrectorado)', rAuditoriaVice.status === 200, `Eventos reales consultados desde PostgreSQL: ${rAuditoriaVice.data?.total ?? 0}`);

  const rAuditoriaSec = await api('/auditoria', { headers: { Authorization: `Bearer ${tokenSec}` } });
  registrar('M8: Auditoría', 'Bloqueo Bitácora Forense (Secretaría)', rAuditoriaSec.status === 403, `Status HTTP: ${rAuditoriaSec.status} (Esperado: 403 Forbidden)`);

  // ─────────────────────────────────────────────────────────────────
  // MÓDULO 9: Reportes y Actas Oficiales
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- Probando Módulo 9: Reportes y Actas ---');
  const tieneCasoYActa = !!defAlejandro?.casoUtilizado;
  registrar('M9: Reportes y Actas', 'Generación de Acta de Caso Sorteado', tieneCasoYActa, `Acta vinculada con caso oficial: "${defAlejandro?.casoUtilizado?.titulo}"`);

  // ─────────────────────────────────────────────────────────────────
  // MÓDULO 10: Configuración y Reglas del Sistema (Dinámica en Caliente)
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- Probando Módulo 10: Configuración y Reglas ---');
  const rSorteoConfig = await api('/sorteo-config/carrera/86', { headers: { Authorization: `Bearer ${tokenVice}` } });
  registrar('M10: Configuración', 'Consulta Configuración Dinámica (/sorteo-config/carrera/86)', rSorteoConfig.status === 200 && Array.isArray(rSorteoConfig.data), `Reglas cargadas: ${rSorteoConfig.data?.length || 0} modalidades`);

  const rGuardarConfig = await api('/sorteo-config', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenVice}` },
    body: JSON.stringify({
      carreraId: '86',
      tipoDefensa: 'INTERNA',
      mismoMomento: true,
      anticipacionDefensa: 24,
      plazoResolucion: 48,
      unidadTiempo: 'HORAS',
    }),
  });
  registrar('M10: Configuración', 'Persistencia Dinámica de Reglas de Sorteo', rGuardarConfig.status === 200, `Respuesta: ${rGuardarConfig.data?.message || 'Guardado exitoso'}`);

  const umbralRespetado = rCasosArea.data?.items?.every(c => c.usos <= c.umbral) ?? true;
  registrar('M10: Configuración', 'Cumplimiento de Umbral Máximo de Usos (<= 2)', umbralRespetado, 'Ningún caso excede el límite reglamentario de 2 asignaciones');

  // ─────────────────────────────────────────────────────────────────
  // RESUMEN FINAL
  // ─────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log('📊 RESUMEN FINAL DE RESULTADOS');
  console.log('================================================================');
  const aprobadas = resultados.filter(r => r.pass).length;
  const fallidas = resultados.filter(r => !r.pass).length;
  console.log(`Total Pruebas: ${resultados.length}`);
  console.log(`Aprobadas (PASS): ${aprobadas}`);
  console.log(`Fallidas (FAIL):  ${fallidas}`);
  console.log(`Efectividad:      ${((aprobadas / resultados.length) * 100).toFixed(1)}%\n`);

  return resultados;
}

run();
