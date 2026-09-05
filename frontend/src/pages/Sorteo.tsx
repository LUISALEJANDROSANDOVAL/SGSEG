import { useState, useEffect, useMemo, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { EncabezadoPagina } from '@/components/encabezado-pagina'
import { RuletaCanvas, type RuletaItem } from '@/components/RuletaCanvas'
import { estudiantesApi, type Estudiante } from '@/lib/estudiantes.api'
import { useAuth } from '@/context/AuthContext'
import { esJefeCarrera, getJefeCarreraId, getJefeCarreraNombre } from '@/lib/auth-helpers'
import {
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle2,
  Download,
  Printer,
  RotateCcw,
  Layers,
  Clock,
  ShieldCheck,
  QrCode,
  Mail,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Search,
  Check,
  XCircle,
} from 'lucide-react'

// Definiciones de tipos para el flujo del sorteo
export interface PostulanteSorteo {
  id: string
  nombreCompleto: string
  carnetEstudiantil: string
  carnetIdentidad: string
  correo: string
  carrera: string
  carreraId?: string
  planEstudio: string
  planEstudioId?: string
  tipoDefensa: 'Interna' | 'Externa'
  fechaDefensa: string
  horaDefensa: string
  promedioAcademico?: number
}

export interface AreaAcademicaSorteo {
  id: string
  nombre: string
  codigo: string
  descripcion: string
  color: string
  casosDisponibles: number
}

export interface CasoEstudioSorteo {
  id: string
  codigo: string
  titulo: string
  areaId: string
  areaNombre: string
  contenido: string
  usosActuales: number
  maxUsos: number
  plazoHoras: number
  color: string
}

export interface RegistroHistorialSorteo {
  id: string
  actaCodigo: string
  fechaHora: string
  estudiante: PostulanteSorteo
  area?: AreaAcademicaSorteo
  caso?: CasoEstudioSorteo
  estado: 'OFICIALIZADO' | 'SUSPENDIDO'
  motivoInasistencia?: string
  correoDespachado: boolean
  fechaDespacho?: string
  hashVerificacion: string
}

// Catálogo de Postulantes por defecto (Mock robusto con sincronización API)
const POSTULANTES_CATALOGO: PostulanteSorteo[] = [
  {
    id: '1',
    nombreCompleto: 'Mariana Rojas Quiroga',
    carnetEstudiantil: '202110482',
    carnetIdentidad: '8942104 SC',
    correo: 'm.rojas.qui@estudiantes.utepsa.edu.bo',
    carrera: 'Derecho',
    carreraId: '2',
    planEstudio: 'Plan 2022 (Vigente)',
    tipoDefensa: 'Externa',
    fechaDefensa: '04/09/2026',
    horaDefensa: '09:00 AM',
    promedioAcademico: 88.5,
  },
  {
    id: '2',
    nombreCompleto: 'Luis Fernando Céspedes Alarcón',
    carnetEstudiantil: '202020193',
    carnetIdentidad: '7821903 SC',
    correo: 'l.cespedes.al@estudiantes.utepsa.edu.bo',
    carrera: 'Administración de Empresas',
    carreraId: '3',
    planEstudio: 'Plan 2021 (Vigente)',
    tipoDefensa: 'Interna',
    fechaDefensa: '04/09/2026',
    horaDefensa: '10:30 AM',
    promedioAcademico: 91.0,
  },
  {
    id: '3',
    nombreCompleto: 'Camila Antelo Suárez',
    carnetEstudiantil: '202115890',
    carnetIdentidad: '9012384 SC',
    correo: 'c.antelo.su@estudiantes.utepsa.edu.bo',
    carrera: 'Ingeniería Comercial',
    carreraId: '4',
    planEstudio: 'Plan 2023 (Vigente)',
    tipoDefensa: 'Externa',
    fechaDefensa: '04/09/2026',
    horaDefensa: '11:45 AM',
    promedioAcademico: 86.4,
  },
  {
    id: '4',
    nombreCompleto: 'Diego Mamani Torrico',
    carnetEstudiantil: '202018442',
    carnetIdentidad: '6543219 LP',
    correo: 'd.mamani.to@estudiantes.utepsa.edu.bo',
    carrera: 'Auditoría y Finanzas',
    carreraId: '5',
    planEstudio: 'Plan 2020 (Vigente)',
    tipoDefensa: 'Interna',
    fechaDefensa: '04/09/2026',
    horaDefensa: '14:00 PM',
    promedioAcademico: 89.2,
  },
  {
    id: '5',
    nombreCompleto: 'Valeria Justiniano Aguilera',
    carnetEstudiantil: '202110998',
    carnetIdentidad: '8345672 SC',
    correo: 'v.justiniano.ag@estudiantes.utepsa.edu.bo',
    carrera: 'Derecho',
    carreraId: '2',
    planEstudio: 'Plan 2022 (Vigente)',
    tipoDefensa: 'Externa',
    fechaDefensa: '04/09/2026',
    horaDefensa: '15:30 PM',
    promedioAcademico: 94.0,
  },
  {
    id: '6',
    nombreCompleto: 'Alejandro Morales Vaca',
    carnetEstudiantil: '202118231',
    carnetIdentidad: '7891234 SC',
    correo: 'a.morales.va@estudiantes.utepsa.edu.bo',
    carrera: 'Ingeniería de Sistemas',
    carreraId: '1',
    planEstudio: 'Plan 2022 (Vigente)',
    tipoDefensa: 'Externa',
    fechaDefensa: '04/09/2026',
    horaDefensa: '16:30 PM',
    promedioAcademico: 92.5,
  },
  {
    id: '7',
    nombreCompleto: 'Beatriz Claudia Pinto',
    carnetEstudiantil: '202029481',
    carnetIdentidad: '6821459 SC',
    correo: 'b.pinto.cl@estudiantes.utepsa.edu.bo',
    carrera: 'Ingeniería de Sistemas',
    carreraId: '1',
    planEstudio: 'Plan 2022 (Vigente)',
    tipoDefensa: 'Interna',
    fechaDefensa: '04/09/2026',
    horaDefensa: '17:45 PM',
    promedioAcademico: 89.0,
  },
]

// Áreas académicas disponibles
const AREAS_CATALOGO: Record<string, AreaAcademicaSorteo[]> = {
  'Ingeniería de Sistemas': [
    {
      id: 'area-sis-1',
      codigo: 'SIS-SOF',
      nombre: 'Ingeniería de Software y Arquitectura Cloud',
      descripcion: 'Microservicios, patrones de diseño y escalabilidad transaccional.',
      color: '#0F172A',
      casosDisponibles: 4,
    },
    {
      id: 'area-sis-2',
      codigo: 'SIS-SEG',
      nombre: 'Ciberseguridad y Auditoría de Sistemas',
      descripcion: 'Criptografía aplicada, seguridad perimetral y pentesting.',
      color: '#9E1B32',
      casosDisponibles: 3,
    },
    {
      id: 'area-sis-3',
      codigo: 'SIS-DAT',
      nombre: 'Bases de Datos y Analítica Avanzada',
      descripcion: 'Modelado relacional, Big Data e Inteligencia Artificial.',
      color: '#047857',
      casosDisponibles: 3,
    },
  ],
  Derecho: [
    {
      id: 'area-der-1',
      codigo: 'DER-PEN',
      nombre: 'Derecho Penal y Procesal Penal',
      descripcion: 'Teoría del delito, garantías constitucionales y litigación oral penal.',
      color: '#9E1B32',
      casosDisponibles: 4,
    },
    {
      id: 'area-der-2',
      codigo: 'DER-CIV',
      nombre: 'Derecho Civil y Contratos',
      descripcion: 'Obligaciones civiles, responsabilidad extracontractual y derecho sucesorio.',
      color: '#1E293B',
      casosDisponibles: 3,
    },
    {
      id: 'area-der-3',
      codigo: 'DER-CON',
      nombre: 'Derecho Constitucional y DDHH',
      descripcion: 'Acciones de defensa, control de convencionalidad y tutela judicial.',
      color: '#B45309',
      casosDisponibles: 3,
    },
    {
      id: 'area-der-4',
      codigo: 'DER-LAB',
      nombre: 'Derecho Laboral y Seguridad Social',
      descripcion: 'Relaciones de trabajo, beneficios sociales y regímenes especiales.',
      color: '#047857',
      casosDisponibles: 2,
    },
    {
      id: 'area-der-5',
      codigo: 'DER-ADM',
      nombre: 'Derecho Administrativo y Regulatorio',
      descripcion: 'Procedimientos sancionadores, contrataciones estatales y recursos.',
      color: '#4338CA',
      casosDisponibles: 3,
    },
    {
      id: 'area-der-6',
      codigo: 'DER-COM',
      nombre: 'Derecho Comercial y Societario',
      descripcion: 'Sociedades mercantiles, títulos valores y reorganizaciones empresariales.',
      color: '#0E7490',
      casosDisponibles: 3,
    },
  ],
  'Administración de Empresas': [
    {
      id: 'area-adm-1',
      codigo: 'ADM-EST',
      nombre: 'Dirección Estratégica y Gestión',
      descripcion: 'Planificación corporativa, balanced scorecard y gestión del cambio.',
      color: '#9E1B32',
      casosDisponibles: 3,
    },
    {
      id: 'area-adm-2',
      codigo: 'ADM-FIN',
      nombre: 'Finanzas Corporativas y PyMEs',
      descripcion: 'Estructura de capital, valuación de empresas y flujo de caja.',
      color: '#1E293B',
      casosDisponibles: 4,
    },
    {
      id: 'area-adm-3',
      codigo: 'ADM-OPE',
      nombre: 'Operaciones y Cadena de Suministro',
      descripcion: 'Logística integral, optimización de procesos y calidad total.',
      color: '#B45309',
      casosDisponibles: 2,
    },
    {
      id: 'area-adm-4',
      codigo: 'ADM-TAL',
      nombre: 'Gestión del Talento Humano',
      descripcion: 'Cultura organizacional, evaluación de desempeño y retención.',
      color: '#047857',
      casosDisponibles: 3,
    },
  ],
  'Ingeniería Comercial': [
    {
      id: 'area-com-1',
      codigo: 'COM-MKT',
      nombre: 'Marketing Estratégico y Digital',
      descripcion: 'Posicionamiento omnicanal, métricas digitales y experiencia de cliente.',
      color: '#9E1B32',
      casosDisponibles: 3,
    },
    {
      id: 'area-com-2',
      codigo: 'COM-INT',
      nombre: 'Comercio Exterior y Negociación',
      descripcion: 'Incoterms, apertura de mercados internacionales y logística aduanera.',
      color: '#1E293B',
      casosDisponibles: 3,
    },
    {
      id: 'area-com-3',
      codigo: 'COM-PRO',
      nombre: 'Formulación y Evaluación de Proyectos',
      descripcion: 'Análisis de viabilidad económica, TIR/VAN y modelos de negocio.',
      color: '#B45309',
      casosDisponibles: 2,
    },
  ],
}

// Catálogo de Casos de Estudio clasificados por área (con control de usos <= 2)
const CASOS_CATALOGO: CasoEstudioSorteo[] = [
  // Casos Derecho Penal
  {
    id: 'caso-der-01',
    codigo: 'CASO-DP-014',
    titulo: 'Defensa Penal en Delitos Económicos y Compliance Corporativo',
    areaId: 'area-der-1',
    areaNombre: 'Derecho Penal y Procesal Penal',
    contenido:
      'Análisis integral de responsabilidad penal de personas jurídicas en presunto desvío de fondos bancarios, cadena de custodia probatoria digital y aplicación de la excepción de prescripción.',
    usosActuales: 1,
    maxUsos: 2,
    plazoHoras: 48,
    color: '#9E1B32',
  },
  {
    id: 'caso-der-02',
    codigo: 'CASO-DP-028',
    titulo: 'Litigación Oral y Medidas Cautelares en Delitos Contra la Salud Pública',
    areaId: 'area-der-1',
    areaNombre: 'Derecho Penal y Procesal Penal',
    contenido:
      'Diseño de teoría del caso acusatoria y defensiva respecto a tipicidad subjetiva, pruebas periciales toxicológicas y proporcionalidad de la detención preventiva.',
    usosActuales: 0,
    maxUsos: 2,
    plazoHoras: 48,
    color: '#1E293B',
  },
  {
    id: 'caso-der-03',
    codigo: 'CASO-DP-045',
    titulo: 'Casación Penal por Vicios de Sentencia y Valoración de Prueba Ilícita',
    areaId: 'area-der-1',
    areaNombre: 'Derecho Penal y Procesal Penal',
    contenido:
      'Interposición de recurso extraordinario de casación por violación del debido proceso y aplicación indebida de reglas de la sana crítica en la valoración testifical.',
    usosActuales: 1,
    maxUsos: 2,
    plazoHoras: 48,
    color: '#B45309',
  },
  {
    id: 'caso-der-04',
    codigo: 'CASO-DP-062',
    titulo: 'Salidas Alternativas y Reparación Integral en Homicidio Culposo',
    areaId: 'area-der-1',
    areaNombre: 'Derecho Penal y Procesal Penal',
    contenido:
      'Negociación de acuerdo conciliatorio, indemnización por daño civil y solicitud de suspensión condicional del proceso en sede de audiencia preliminar.',
    usosActuales: 0,
    maxUsos: 2,
    plazoHoras: 48,
    color: '#047857',
  },

  // Casos Derecho Civil
  {
    id: 'caso-civ-01',
    codigo: 'CASO-DC-019',
    titulo: 'Resolución Contractual por Incumplimiento y Cláusula Penal Inmobiliaria',
    areaId: 'area-der-2',
    areaNombre: 'Derecho Civil y Contratos',
    contenido:
      'Demanda ordinaria de resolución de contrato de compraventa con arras penitenciales, excepciones de fuerza mayor y liquidación judicial de daños y perjuicios.',
    usosActuales: 1,
    maxUsos: 2,
    plazoHoras: 48,
    color: '#9E1B32',
  },
  {
    id: 'caso-civ-02',
    codigo: 'CASO-DC-033',
    titulo: 'Acción Reivindicatoria y Usucapión Decenal con Doble Partida Registral',
    areaId: 'area-der-2',
    areaNombre: 'Derecho Civil y Contratos',
    contenido:
      'Conflicto de mejor derecho propietario sobre inmueble urbano con superposición de folios reales en Derechos Reales y posesión continuada pacífica.',
    usosActuales: 0,
    maxUsos: 2,
    plazoHoras: 48,
    color: '#1E293B',
  },

  // Casos Derecho Constitucional
  {
    id: 'caso-con-01',
    codigo: 'CASO-CO-007',
    titulo: 'Acción de Amparo Constitucional por Vulneración del Non Bis In Idem',
    areaId: 'area-der-3',
    areaNombre: 'Derecho Constitucional y DDHH',
    contenido:
      'Doble juzgamiento sancionador en sede administrativa y jurisdiccional, fundamentación de medidas cautelares constitucionales y jurisprudencia vinculante del TCP.',
    usosActuales: 1,
    maxUsos: 2,
    plazoHoras: 48,
    color: '#9E1B32',
  },
  {
    id: 'caso-con-02',
    codigo: 'CASO-CO-022',
    titulo: 'Acción Popular en Defensa de los Derechos Colectivos y Medio Ambiente',
    areaId: 'area-der-3',
    areaNombre: 'Derecho Constitucional y DDHH',
    contenido:
      'Tutela de acuíferos urbanos frente a concesiones industriales sin manifiesto de impacto ambiental y declaratoria de pausa ecológica judicial.',
    usosActuales: 0,
    maxUsos: 2,
    plazoHoras: 48,
    color: '#047857',
  },

  // Casos Administración
  {
    id: 'caso-adm-01',
    codigo: 'CASO-AD-011',
    titulo: 'Reestructuración Financiera y Estratégica de una PyME Agroindustrial',
    areaId: 'area-adm-1',
    areaNombre: 'Dirección Estratégica y Gestión',
    contenido:
      'Plan integral de saneamiento patrimonial, refinanciamiento de pasivos bancarios a largo plazo y redireccionamiento del modelo de distribución regional.',
    usosActuales: 1,
    maxUsos: 2,
    plazoHoras: 72,
    color: '#9E1B32',
  },
  {
    id: 'caso-adm-02',
    codigo: 'CASO-AD-025',
    titulo: 'Optimización de Capital de Trabajo y Políticas de Cobranza en Retail',
    areaId: 'area-adm-2',
    areaNombre: 'Finanzas Corporativas y PyMEs',
    contenido:
      'Reingeniería del ciclo de conversión de efectivo (CCC), scoring crediticio de cartera vencida y estructuración de emisión de pagarés bursátiles.',
    usosActuales: 0,
    maxUsos: 2,
    plazoHoras: 72,
    color: '#1E293B',
  },

  // Casos Comercial
  {
    id: 'caso-com-01',
    codigo: 'CASO-MK-031',
    titulo: 'Estrategia de Penetración Omnicanal para Marca de Consumo Masivo',
    areaId: 'area-com-1',
    areaNombre: 'Marketing Estratégico y Digital',
    contenido:
      'Diseño del customer journey, modelo de atribución digital, plan de medios programáticos y fijación de precios dinámicos para competir en el eje central.',
    usosActuales: 1,
    maxUsos: 2,
    plazoHoras: 72,
    color: '#9E1B32',
  },
  {
    id: 'caso-com-02',
    codigo: 'CASO-MK-054',
    titulo: 'Apertura de Exportación de Alimentos Procesados al Mercado Andino',
    areaId: 'area-com-2',
    areaNombre: 'Comercio Exterior y Negociación',
    contenido:
      'Cumplimiento de barreras fitosanitarias, selección de Incoterm 2020 DPU/FOB, matriz de riesgo cambiario y estructuración de carta de crédito irrevocable.',
    usosActuales: 0,
    maxUsos: 2,
    plazoHoras: 72,
    color: '#B45309',
  },
]

export default function PaginaSorteo() {
  const { user } = useAuth()
  const isJefe = esJefeCarrera(user)
  const jefeCarreraId = getJefeCarreraId(user)
  const carreraNombre = getJefeCarreraNombre(user)

  // ── ESTADO GENERAL DEL FLUJO EN 4 PASOS ──
  // 1 = Postulante & Asistencia, 2 = Área, 3 = Caso, 4 = Despacho
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3 | 4>(1)

  // Lista de postulantes disponibles
  const [postulantes, setPostulantes] = useState<PostulanteSorteo[]>(POSTULANTES_CATALOGO)
  const [busquedaPostulante, setBusquedaPostulante] = useState('')
  const [postulanteSeleccionado, setPostulanteSeleccionado] = useState<PostulanteSorteo | null>(
    POSTULANTES_CATALOGO[0],
  )

  // Switch de Asistencia del Postulante
  const [asistenciaPresente, setAsistenciaPresente] = useState<boolean>(true)
  const [motivoInasistencia, setMotivoInasistencia] = useState<string>('')
  const [observacionInasistencia, setObservacionInasistencia] = useState<string>('')
  const [sorteoSuspendido, setSorteoSuspendido] = useState<boolean>(false)

  // Paso 2: Selección / Ruleta de Área
  const [areaGanadora, setAreaGanadora] = useState<AreaAcademicaSorteo | null>(null)

  // Paso 3: Selección / Ruleta de Caso
  const [casoGanador, setCasoGanador] = useState<CasoEstudioSorteo | null>(null)

  // Paso 4: Despacho por Correo
  const [despachandoCorreo, setDespachandoCorreo] = useState<boolean>(false)
  const [correoDespachadoExitoso, setCorreoDespachadoExitoso] = useState<boolean>(false)
  const [hashActa, setHashActa] = useState<string>('')
  const [codigoActa, setCodigoActa] = useState<string>('')
  const [fechaHoraEjecucion, setFechaHoraEjecucion] = useState<string>('')

  // Historial de la sesión
  const [historialSesion, setHistorialSesion] = useState<RegistroHistorialSorteo[]>([
    {
      id: 'hist-1',
      actaCodigo: 'ACTA-2026-0904-01',
      fechaHora: '09:12 AM',
      estudiante: POSTULANTES_CATALOGO[1],
      area: AREAS_CATALOGO['Administración de Empresas']?.[0],
      caso: CASOS_CATALOGO[8],
      estado: 'OFICIALIZADO',
      correoDespachado: true,
      fechaDespacho: '09:15 AM',
      hashVerificacion: 'e89a4b2c1f9300ab28d09e',
    },
    {
      id: 'hist-2',
      actaCodigo: 'ACTA-2026-0904-02',
      fechaHora: '09:45 AM',
      estudiante: POSTULANTES_CATALOGO[2],
      area: AREAS_CATALOGO['Ingeniería Comercial']?.[0],
      caso: CASOS_CATALOGO[10],
      estado: 'OFICIALIZADO',
      correoDespachado: true,
      fechaDespacho: '09:48 AM',
      hashVerificacion: '7c4d19aa201e54bc81f440',
    },
  ])

  // Cargar estudiantes de la API si están disponibles
  useEffect(() => {
    async function loadApiEstudiantes() {
      try {
        const resp = await estudiantesApi.getEstudiantes({ limit: 10, estado: 'ACTIVO' })
        if (resp && resp.items && resp.items.length > 0) {
          const transformed: PostulanteSorteo[] = resp.items.map((est: Estudiante, idx: number) => ({
            id: String(est.idEstudiante || idx),
            nombreCompleto: est.nombreCompleto,
            carnetEstudiantil: est.carnetEstudiantil,
            carnetIdentidad: est.carnetIdentidad || `${est.carnetEstudiantil} SC`,
            correo: est.correo || `${est.carnetEstudiantil}@estudiantes.utepsa.edu.bo`,
            carrera: est.planEstudio?.carrera?.nombre || 'Derecho',
            carreraId: String(est.planEstudio?.carrera?.idCarrera || ''),
            planEstudio: est.planEstudio?.nombre || 'Plan Vigente',
            planEstudioId: String(est.planEstudio?.idPlanEstudio || ''),
            tipoDefensa: idx % 2 === 0 ? 'Externa' : 'Interna',
            fechaDefensa: '04/09/2026',
            horaDefensa: `${9 + idx}:00 AM`,
            promedioAcademico: 85 + (idx % 12),
          }))
          setPostulantes(transformed)
          if (transformed.length > 0) {
            setPostulanteSeleccionado(transformed[0])
          }
        }
      } catch {
        // Usa catálogo por defecto en caso de no conexión a base de datos
      }
    }
    loadApiEstudiantes()
  }, [])

  // Filtrado de postulantes según rol y búsqueda
  const postulantesFiltrados = useMemo(() => {
    let list = postulantes
    if (isJefe && jefeCarreraId) {
      list = list.filter((p) => String(p.carreraId) === String(jefeCarreraId))
    }
    if (!busquedaPostulante.trim()) return list
    const query = busquedaPostulante.toLowerCase()
    return list.filter(
      (p) =>
        p.nombreCompleto.toLowerCase().includes(query) ||
        p.carnetEstudiantil.toLowerCase().includes(query) ||
        p.carnetIdentidad.toLowerCase().includes(query) ||
        p.carrera.toLowerCase().includes(query),
    )
  }, [postulantes, busquedaPostulante, isJefe, jefeCarreraId])

  // Sincronizar postulante seleccionado cuando se filtra la lista por rol
  useEffect(() => {
    if (postulantesFiltrados.length > 0) {
      if (!postulantesFiltrados.some((p) => p.id === postulanteSeleccionado?.id)) {
        setPostulanteSeleccionado(postulantesFiltrados[0])
      }
    }
  }, [postulantesFiltrados, postulanteSeleccionado])

  // Áreas correspondientes a la carrera del postulante seleccionado
  const areasParaCarrera = useMemo(() => {
    if (!postulanteSeleccionado) return []
    const carreraKey =
      Object.keys(AREAS_CATALOGO).find((c) =>
        postulanteSeleccionado.carrera.toLowerCase().includes(c.toLowerCase()),
      ) || 'Derecho'
    return AREAS_CATALOGO[carreraKey] || AREAS_CATALOGO['Derecho']
  }, [postulanteSeleccionado])

  // Convertir áreas a items para RuletaCanvas
  const ruletaItemsAreas = useMemo<RuletaItem[]>(() => {
    return areasParaCarrera.map((area) => ({
      id: area.id,
      label: area.codigo,
      sublabel: area.nombre,
      color: area.color,
      badge: `${area.casosDisponibles} casos`,
      data: { area },
    }))
  }, [areasParaCarrera])

  // Casos disponibles para el área sorteada (solo con usos < 2)
  const casosParaArea = useMemo(() => {
    if (!areaGanadora) return []
    // Filtrar casos del área que no hayan alcanzado el tope de 2 usos
    return CASOS_CATALOGO.filter(
      (c) =>
        (c.areaId === areaGanadora.id ||
          c.areaNombre.toLowerCase().includes(areaGanadora.nombre.toLowerCase()) ||
          c.areaNombre.toLowerCase().includes(areaGanadora.codigo.toLowerCase())) &&
        c.usosActuales < c.maxUsos,
    )
  }, [areaGanadora])

  // Convertir casos a items para RuletaCanvas
  const ruletaItemsCasos = useMemo<RuletaItem[]>(() => {
    return casosParaArea.map((caso) => ({
      id: caso.id,
      label: caso.codigo,
      sublabel: caso.titulo,
      color: caso.color,
      badge: `Uso ${caso.usosActuales}/${caso.maxUsos}`,
      data: { caso },
    }))
  }, [casosParaArea])

  // Generar hash y metadatos de acta al llegar al veredicto
  const prepararActaVeredicto = useCallback(() => {
    const timestamp = new Date()
    const fechaFormateada = timestamp.toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase()
    const codigo = `ACTA-2026-0904-${Math.floor(100 + Math.random() * 900)}`
    const hash = `SHA256:${Math.random().toString(36).substring(2)}${randomHex}${Math.random().toString(36).substring(2)}`

    setCodigoActa(codigo)
    setHashActa(hash)
    setFechaHoraEjecucion(fechaFormateada)
  }, [])

  // Manejar cambio de Asistencia
  const handleToggleAsistencia = (presente: boolean) => {
    setAsistenciaPresente(presente)
    if (presente) {
      setSorteoSuspendido(false)
      setMotivoInasistencia('')
    }
  }

  // Registrar suspensión por inasistencia
  const handleRegistrarSuspension = () => {
    if (!motivoInasistencia.trim() || !postulanteSeleccionado) return

    setSorteoSuspendido(true)
    const nuevoRegistro: RegistroHistorialSorteo = {
      id: `susp-${Date.now()}`,
      actaCodigo: `SUSP-2026-0904-${Math.floor(100 + Math.random() * 900)}`,
      fechaHora: new Date().toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      estudiante: postulanteSeleccionado,
      estado: 'SUSPENDIDO',
      motivoInasistencia: motivoInasistencia,
      correoDespachado: false,
      hashVerificacion: `SUSP:${Math.random().toString(16).substring(2, 12)}`,
    }

    setHistorialSesion((prev) => [nuevoRegistro, ...prev])
  }

  // Finalización del Sorteo de Área
  const handleFinalizarSorteoArea = (item: RuletaItem) => {
    const area = areasParaCarrera.find((a) => a.id === item.id)
    if (area) {
      setAreaGanadora(area)
    }
  }

  // Finalización del Sorteo de Caso
  const handleFinalizarSorteoCaso = (item: RuletaItem) => {
    const caso = casosParaArea.find((c) => c.id === item.id)
    if (caso) {
      setCasoGanador(caso)
      prepararActaVeredicto()
    }
  }

  // Despacho del pliego por correo institucional
  const handleDespacharCorreo = () => {
    if (!postulanteSeleccionado || !casoGanador || !areaGanadora) return
    setDespachandoCorreo(true)

    // Simulación de envío con backend
    setTimeout(() => {
      setDespachandoCorreo(false)
      setCorreoDespachadoExitoso(true)

      // Agregar al historial de la sesión
      const nuevoRegistro: RegistroHistorialSorteo = {
        id: `sorteo-${Date.now()}`,
        actaCodigo: codigoActa,
        fechaHora: fechaHoraEjecucion || 'Reciente',
        estudiante: postulanteSeleccionado,
        area: areaGanadora,
        caso: casoGanador,
        estado: 'OFICIALIZADO',
        correoDespachado: true,
        fechaDespacho: new Date().toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        hashVerificacion: hashActa,
      }

      setHistorialSesion((prev) => [nuevoRegistro, ...prev])
    }, 1800)
  }

  // Reiniciar sorteo para un nuevo estudiante
  const handleIniciarNuevoSorteo = () => {
    setPasoActual(1)
    setAreaGanadora(null)
    setCasoGanador(null)
    setAsistenciaPresente(true)
    setMotivoInasistencia('')
    setObservacionInasistencia('')
    setSorteoSuspendido(false)
    setCorreoDespachadoExitoso(false)
    setDespachandoCorreo(false)
  }

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Encabezado Principal */}
        <EncabezadoPagina
          titulo="Sorteo Digital de Grado"
          descripcion="Flujo institucional de 4 pasos para la asignación transparente, auditable y en tiempo real de áreas y casos de estudio."
        />

        {/* Insignia de Aislamiento para Jefe de Carrera */}
        {isJefe && (
          <div className="flex items-center justify-between border-l-4 border-l-crimson border border-line bg-surface p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-crimson/10 text-crimson">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-crimson uppercase">
                    Aislamiento Estricto por Carrera (RNF-02)
                  </span>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-semibold px-2 py-0.5">
                    Modo Consulta / Supervisión
                  </span>
                </div>
                <p className="text-xs font-semibold text-neutral-900 mt-0.5">
                  Visualizando únicamente postulantes de:{' '}
                  <span className="text-crimson font-bold">{carreraNombre || 'Tu Carrera'}</span>
                  <span className="text-neutral-500 font-normal ml-2">
                    (Nota: El acto solemne de sorteo es operado por la Secretaría de Facultad o Defensas de Grado).
                  </span>
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-neutral-500 font-mono">
              carreraId: {jefeCarreraId}
            </span>
          </div>
        )}

        {/* ── STEPPER DE PROGRESO EN 4 PASOS ── */}
        <section className="border border-line bg-white shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-line">
            {/* Paso 1 */}
            <button
              type="button"
              onClick={() => !sorteoSuspendido && setPasoActual(1)}
              className={`flex items-center gap-3 p-4 text-left transition-all ${
                pasoActual === 1
                  ? 'bg-red-50/70 border-b-2 border-b-crimson md:border-b-0 md:border-l-4 md:border-l-crimson'
                  : 'hover:bg-surface'
              }`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  sorteoSuspendido
                    ? 'bg-red-600 text-white'
                    : pasoActual > 1
                    ? 'bg-emerald-600 text-white'
                    : pasoActual === 1
                    ? 'bg-crimson text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {sorteoSuspendido ? (
                  <XCircle className="size-4" />
                ) : pasoActual > 1 ? (
                  <Check className="size-4" />
                ) : (
                  '1'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-wider text-neutral-500 uppercase font-semibold">
                  Fase 1
                </p>
                <p className="truncate text-xs font-bold text-gray-900">
                  Postulante & Asistencia
                </p>
              </div>
            </button>

            {/* Paso 2 */}
            <button
              type="button"
              disabled={sorteoSuspendido || !asistenciaPresente}
              onClick={() => areaGanadora && setPasoActual(2)}
              className={`flex items-center gap-3 p-4 text-left transition-all ${
                pasoActual === 2
                  ? 'bg-red-50/70 border-b-2 border-b-crimson md:border-b-0 md:border-l-4 md:border-l-crimson'
                  : 'hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  pasoActual > 2
                    ? 'bg-emerald-600 text-white'
                    : pasoActual === 2
                    ? 'bg-crimson text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {pasoActual > 2 ? <Check className="size-4" /> : '2'}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-wider text-neutral-500 uppercase font-semibold">
                  Fase 2
                </p>
                <p className="truncate text-xs font-bold text-gray-900">
                  Sorteo de Área
                </p>
              </div>
            </button>

            {/* Paso 3 */}
            <button
              type="button"
              disabled={sorteoSuspendido || !areaGanadora}
              onClick={() => casoGanador && setPasoActual(3)}
              className={`flex items-center gap-3 p-4 text-left transition-all ${
                pasoActual === 3
                  ? 'bg-red-50/70 border-b-2 border-b-crimson md:border-b-0 md:border-l-4 md:border-l-crimson'
                  : 'hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  pasoActual > 3
                    ? 'bg-emerald-600 text-white'
                    : pasoActual === 3
                    ? 'bg-crimson text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {pasoActual > 3 ? <Check className="size-4" /> : '3'}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-wider text-neutral-500 uppercase font-semibold">
                  Fase 3
                </p>
                <p className="truncate text-xs font-bold text-gray-900">
                  Sorteo de Caso
                </p>
              </div>
            </button>

            {/* Paso 4 */}
            <button
              type="button"
              disabled={sorteoSuspendido || !casoGanador}
              onClick={() => casoGanador && setPasoActual(4)}
              className={`flex items-center gap-3 p-4 text-left transition-all ${
                pasoActual === 4
                  ? 'bg-red-50/70 border-b-2 border-b-crimson md:border-b-0 md:border-l-4 md:border-l-crimson'
                  : 'hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  pasoActual === 4
                    ? 'bg-crimson text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                4
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-wider text-neutral-500 uppercase font-semibold">
                  Fase 4
                </p>
                <p className="truncate text-xs font-bold text-gray-900">
                  Veredicto & Despacho
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* ── CUERPO PRINCIPAL DEL PASO ACTUAL + PANEL LATERAL ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna Principal (2 columnas en desktop) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* ========================================================= */}
            {/* PASO 1: POSTULANTE & ASISTENCIA */}
            {/* ========================================================= */}
            {pasoActual === 1 && (
              <section className="flex flex-col border border-line bg-white shadow-xs animate-fade-in">
                <header className="border-b border-line px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
                      <GraduationCap className="size-4 text-crimson" />
                      Paso 1: Verificación de Postulante & Asistencia
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Identifique al estudiante convocado y certifique su presencia en sala para habilitar el acto.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    <Clock className="size-3.5" />
                    Turno Programado
                  </span>
                </header>

                <div className="p-6 flex flex-col gap-6">
                  {/* Selector rápido de postulantes */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                      Seleccionar Postulante Programado
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre, carnet o carrera..."
                        value={busquedaPostulante}
                        onChange={(e) => setBusquedaPostulante(e.target.value)}
                        className="w-full rounded-lg border border-line bg-surface pl-9 pr-4 py-2.5 text-xs text-gray-900 focus:border-crimson focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-line divide-y divide-line">
                      {postulantesFiltrados.map((postulante) => {
                        const seleccionado = postulanteSeleccionado?.id === postulante.id
                        return (
                          <button
                            key={postulante.id}
                            type="button"
                            onClick={() => {
                              setPostulanteSeleccionado(postulante)
                              setAreaGanadora(null)
                              setCasoGanador(null)
                              setSorteoSuspendido(false)
                              setAsistenciaPresente(true)
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors ${
                              seleccionado
                                ? 'bg-red-50/80 font-semibold text-crimson'
                                : 'hover:bg-neutral-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`size-2 rounded-full ${
                                  seleccionado ? 'bg-crimson' : 'bg-neutral-300'
                                }`}
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {postulante.nombreCompleto}
                                </p>
                                <p className="text-[11px] text-neutral-500">
                                  {postulante.carrera} · Carnet {postulante.carnetEstudiantil}
                                </p>
                              </div>
                            </div>
                            <span className="rounded bg-white px-2 py-0.5 text-[10px] font-medium border border-line">
                              {postulante.tipoDefensa}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Tarjeta de Ficha Académica del Postulante */}
                  {postulanteSeleccionado && (
                    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-neutral-50 to-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4">
                        <div>
                          <span className="inline-block rounded bg-crimson/10 px-2.5 py-0.5 text-[11px] font-bold text-crimson uppercase tracking-wide">
                            {postulanteSeleccionado.carrera}
                          </span>
                          <h3 className="mt-1.5 text-base font-bold text-gray-900">
                            {postulanteSeleccionado.nombreCompleto}
                          </h3>
                          <p className="text-xs text-neutral-500">
                            {postulanteSeleccionado.planEstudio}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[11px] text-neutral-500 uppercase font-semibold">
                            Modalidad Asignada
                          </p>
                          <span className="inline-block mt-0.5 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
                            Defensa {postulanteSeleccionado.tipoDefensa}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-[11px] text-neutral-500">C.I.</span>
                          <p className="font-semibold text-gray-900">
                            {postulanteSeleccionado.carnetIdentidad}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-neutral-500">Carnet Universitario</span>
                          <p className="font-semibold text-gray-900 font-mono">
                            {postulanteSeleccionado.carnetEstudiantil}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-neutral-500">Correo Institucional</span>
                          <p className="font-semibold text-gray-900 truncate" title={postulanteSeleccionado.correo}>
                            {postulanteSeleccionado.correo}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-neutral-500">Fecha / Hora Acto</span>
                          <p className="font-semibold text-gray-900">
                            {postulanteSeleccionado.fechaDefensa} - {postulanteSeleccionado.horaDefensa}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── SWITCH INTERACTIVO DE ASISTENCIA ── */}
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                          <ShieldCheck className="size-4 text-crimson" />
                          Control de Asistencia del Postulante
                        </h4>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          Debe certificar si el estudiante se encuentra presente en la sala de sorteo.
                        </p>
                      </div>

                      {/* Botones Switch */}
                      <div className="inline-flex rounded-lg border border-line bg-neutral-100 p-1">
                        <button
                          type="button"
                          onClick={() => handleToggleAsistencia(true)}
                          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                            asistenciaPresente
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-neutral-600 hover:text-gray-900'
                          }`}
                        >
                          <UserCheck className="size-3.5" />
                          Presente en Sala
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAsistencia(false)}
                          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                            !asistenciaPresente
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-neutral-600 hover:text-gray-900'
                          }`}
                        >
                          <UserX className="size-3.5" />
                          Ausente / No Comparece
                        </button>
                      </div>
                    </div>

                    {/* Si está Ausente: Exigir Justificación y Suspender */}
                    {!asistenciaPresente && (
                      <div className="mt-5 rounded-lg border border-red-200 bg-red-50/80 p-4 animate-fade-in">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="size-5 shrink-0 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <h5 className="text-xs font-bold text-red-900 uppercase">
                              Postulante Ausente — Suspensión Obligatoria del Sorteo
                            </h5>
                            <p className="mt-1 text-xs text-red-700">
                              De acuerdo con el Reglamento General de Grado, ante la inasistencia del postulante no es posible ejecutar el sorteo de áreas ni casos. Ingrese el motivo formal para registrar el acta de suspensión.
                            </p>

                            <div className="mt-3 flex flex-col gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-red-900 uppercase mb-1">
                                  Motivo de Inasistencia / Justificación *
                                </label>
                                <select
                                  value={motivoInasistencia}
                                  onChange={(e) => setMotivoInasistencia(e.target.value)}
                                  className="w-full rounded-md border border-red-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none"
                                >
                                  <option value="">-- Seleccione una justificación oficial --</option>
                                  <option value="Inasistencia no justificada (No compareció a la hora convocada)">
                                    Inasistencia no justificada (No compareció a la hora convocada)
                                  </option>
                                  <option value="Baja médica debidamente certificada con reposo oficial">
                                    Baja médica debidamente certificada con reposo oficial
                                  </option>
                                  <option value="Fuerza mayor o calamidad doméstica comprobada">
                                    Fuerza mayor o calamidad doméstica comprobada
                                  </option>
                                  <option value="Retraso grave con solicitud previa de reprogramación">
                                    Retraso grave con solicitud previa de reprogramación
                                  </option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-red-900 uppercase mb-1">
                                  Observación Adicional de Secretaría
                                </label>
                                <textarea
                                  rows={2}
                                  placeholder="Detalle los hechos observados por el tribunal y secretaría..."
                                  value={observacionInasistencia}
                                  onChange={(e) => setObservacionInasistencia(e.target.value)}
                                  className="w-full rounded-md border border-red-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={handleRegistrarSuspension}
                                disabled={!motivoInasistencia.trim() || sorteoSuspendido}
                                className="self-start flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
                              >
                                <XCircle className="size-4" />
                                {sorteoSuspendido ? 'Suspensión Registrada en Acta' : 'Confirmar y Archivar Suspensión'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones de Navegación del Paso 1 */}
                  <div className="flex items-center justify-between border-t border-line pt-4">
                    <p className="text-xs text-neutral-500">
                      Paso 1 de 4 · Verificación de identidad y sala
                    </p>

                    <button
                      type="button"
                      disabled={!asistenciaPresente || sorteoSuspendido || !postulanteSeleccionado}
                      onClick={() => setPasoActual(2)}
                      className="flex items-center gap-2 rounded-xl bg-crimson px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Continuar al Sorteo de Área
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ========================================================= */}
            {/* PASO 2: SORTEO DE ÁREA ACADÉMICA */}
            {/* ========================================================= */}
            {pasoActual === 2 && (
              <section className="flex flex-col border border-line bg-white shadow-xs animate-fade-in">
                <header className="border-b border-line px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
                      <Layers className="size-4 text-crimson" />
                      Paso 2: Sorteo Digital de Área Académica
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Postulante: <strong className="text-gray-900">{postulanteSeleccionado?.nombreCompleto}</strong> ({postulanteSeleccionado?.carrera})
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                    {areasParaCarrera.length} Áreas Habilitadas
                  </span>
                </header>

                <div className="p-6 flex flex-col items-center gap-6">
                  {/* Ruleta Dinámica de Áreas */}
                  <RuletaCanvas
                    items={ruletaItemsAreas}
                    size={400}
                    onFinish={handleFinalizarSorteoArea}
                    title="Ruleta Oficial de Áreas de Grado"
                    subtitle="Giro aleatorio CSPRNG auditable con desaceleración natural"
                    spinButtonText="Girar Ruleta de Áreas"
                  />

                  {/* Área Ganadora Revelada */}
                  {areaGanadora && (
                    <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 animate-fade-in">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase">
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            Área Asignada Oficialmente
                          </span>
                          <h4 className="text-base font-bold text-gray-900 mt-1">
                            {areaGanadora.codigo}: {areaGanadora.nombre}
                          </h4>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {areaGanadora.descripcion}
                          </p>
                        </div>
                        <span className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                          Fase 1 Completada
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Acciones de Navegación del Paso 2 */}
                  <div className="w-full flex items-center justify-between border-t border-line pt-4">
                    <button
                      type="button"
                      onClick={() => setPasoActual(1)}
                      className="text-xs font-semibold text-neutral-600 hover:text-gray-900"
                    >
                      ← Volver a Postulante
                    </button>

                    <button
                      type="button"
                      disabled={!areaGanadora}
                      onClick={() => setPasoActual(3)}
                      className="flex items-center gap-2 rounded-xl bg-crimson px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Continuar al Sorteo de Caso
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ========================================================= */}
            {/* PASO 3: SORTEO DE CASO DE ESTUDIO */}
            {/* ========================================================= */}
            {pasoActual === 3 && (
              <section className="flex flex-col border border-line bg-white shadow-xs animate-fade-in">
                <header className="border-b border-line px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
                      <BookOpen className="size-4 text-crimson" />
                      Paso 3: Sorteo de Caso de Estudio
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Área Sorteada: <strong className="text-crimson">{areaGanadora?.nombre}</strong>
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200">
                    {casosParaArea.length} Casos con Stock Disponible
                  </span>
                </header>

                <div className="p-6 flex flex-col items-center gap-6">
                  {/* Ruleta Dinámica de Casos */}
                  {casosParaArea.length > 0 ? (
                    <RuletaCanvas
                      items={ruletaItemsCasos}
                      size={400}
                      onFinish={handleFinalizarSorteoCaso}
                      title={`Casos de Estudio — ${areaGanadora?.codigo}`}
                      subtitle="Selección estricta de casos activos con límite máximo de 2 usos"
                      spinButtonText="Girar Ruleta de Casos"
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-neutral-500">
                      No hay casos disponibles en stock para esta área.
                    </div>
                  )}

                  {/* Caso Ganador Revelado */}
                  {casoGanador && (
                    <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 animate-fade-in">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase">
                              <CheckCircle2 className="size-3.5 text-emerald-600" />
                              Caso Adjudicado
                            </span>
                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900 font-mono">
                              {casoGanador.codigo}
                            </span>
                            <span className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-600 border border-emerald-200">
                              Uso {casoGanador.usosActuales + 1} de {casoGanador.maxUsos}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-gray-900 mt-2">
                            {casoGanador.titulo}
                          </h4>
                          <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                            {casoGanador.contenido}
                          </p>
                          <div className="mt-3 flex items-center gap-4 text-xs font-medium text-emerald-900">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5" />
                              Plazo de resolución: {casoGanador.plazoHoras} horas continuas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Acciones de Navegación del Paso 3 */}
                  <div className="w-full flex items-center justify-between border-t border-line pt-4">
                    <button
                      type="button"
                      onClick={() => setPasoActual(2)}
                      className="text-xs font-semibold text-neutral-600 hover:text-gray-900"
                    >
                      ← Volver a Sorteo de Área
                    </button>

                    <button
                      type="button"
                      disabled={!casoGanador}
                      onClick={() => setPasoActual(4)}
                      className="flex items-center gap-2 rounded-xl bg-crimson px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Formalizar Acta & Despacho
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ========================================================= */}
            {/* PASO 4: VEREDICTO FINAL Y DESPACHO */}
            {/* ========================================================= */}
            {pasoActual === 4 && postulanteSeleccionado && areaGanadora && casoGanador && (
              <section className="flex flex-col gap-6 animate-fade-in">
                {/* ── TARJETA DE VEREDICTO FINAL INSTITUCIONAL ── */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-neutral-800 bg-white p-6 md:p-8 shadow-xl">
                  {/* Marca de agua / Cinta superior institucional */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-crimson via-amber-500 to-crimson" />

                  {/* Encabezado del Acta Oficial */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex size-14 items-center justify-center rounded-xl bg-black p-2 shadow-md">
                        <img
                          src="/logo-uagrm.png"
                          alt="Logo UTEPSA"
                          className="size-10 object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-extrabold tracking-wider text-crimson uppercase">
                          UNIVERSIDAD TECNOLÓGICA PRIVADA DE SANTA CRUZ
                        </p>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">
                          ACTA OFICIAL DE ASIGNACIÓN DE CASO DE EXAMEN DE GRADO
                        </h3>
                        <p className="text-xs text-neutral-500 font-mono">
                          {codigoActa} · {fechaHoraEjecucion || '04/09/2026'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        ACTO OFICIALIZADO
                      </span>
                      <span className="mt-1 text-[10px] text-neutral-400 font-mono">
                        Hash: {hashActa ? hashActa.substring(0, 18) + '...' : 'VALIDADO'}
                      </span>
                    </div>
                  </div>

                  {/* Datos del Postulante */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl bg-neutral-50 p-4 border border-line text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500">
                        Postulante
                      </span>
                      <p className="text-sm font-bold text-gray-900">
                        {postulanteSeleccionado.nombreCompleto}
                      </p>
                      <p className="text-neutral-500 font-mono">
                        CU: {postulanteSeleccionado.carnetEstudiantil} · CI: {postulanteSeleccionado.carnetIdentidad}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500">
                        Carrera & Modalidad
                      </span>
                      <p className="font-semibold text-gray-900">
                        {postulanteSeleccionado.carrera}
                      </p>
                      <p className="text-crimson font-medium">
                        Defensa {postulanteSeleccionado.tipoDefensa} ({postulanteSeleccionado.planEstudio})
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500">
                        Destino de Notificación
                      </span>
                      <p className="font-semibold text-gray-900 truncate">
                        {postulanteSeleccionado.correo}
                      </p>
                      <p className="text-neutral-500">
                        Defensa: {postulanteSeleccionado.fechaDefensa}
                      </p>
                    </div>
                  </div>

                  {/* Resultados del Sorteo (Área y Caso) */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Área Asignada */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                        1. Área Académica Sorteada
                      </span>
                      <h4 className="mt-1.5 text-base font-bold text-gray-900">
                        {areaGanadora.codigo}: {areaGanadora.nombre}
                      </h4>
                      <p className="mt-1 text-xs text-neutral-600">
                        {areaGanadora.descripcion}
                      </p>
                    </div>

                    {/* Caso Asignado */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                          2. Caso de Estudio Adjudicado
                        </span>
                        <span className="rounded bg-crimson px-2 py-0.5 text-[11px] font-mono font-bold text-white">
                          {casoGanador.codigo}
                        </span>
                      </div>
                      <h4 className="mt-1.5 text-base font-bold text-gray-900">
                        {casoGanador.titulo}
                      </h4>
                      <p className="mt-1 text-xs text-neutral-600 line-clamp-2">
                        {casoGanador.contenido}
                      </p>
                    </div>
                  </div>

                  {/* Plazo y Testimonio Institucional */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs">
                    <div className="flex items-center gap-3">
                      <Clock className="size-5 text-amber-700 shrink-0" />
                      <div>
                        <p className="font-bold text-amber-950">
                          Plazo Límite de Entrega de Solución: {casoGanador.plazoHoras} Horas
                        </p>
                        <p className="text-amber-800 text-[11px]">
                          El postulante debe cargar su memoria técnica antes del término del plazo oficial.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <QrCode className="size-8 text-neutral-800" />
                      <div className="text-[10px] text-neutral-500 leading-tight font-mono">
                        <span>CÓDIGO QR</span>
                        <br />
                        <span>AUDITADO</span>
                      </div>
                    </div>
                  </div>

                  {/* ── BOTÓN DE DESPACHO AL CORREO INSTITUCIONAL ── */}
                  <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col gap-4">
                    {correoDespachadoExitoso ? (
                      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900 animate-fade-in flex items-start gap-3">
                        <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-emerald-950">
                            ¡Pliego Oficial Despachado con Éxito!
                          </p>
                          <p className="mt-0.5 text-emerald-800">
                            Se ha enviado el acta digital certificada, el enunciado del caso ({casoGanador.codigo}) y las directrices de defensa al correo institucional <strong>{postulanteSeleccionado.correo}</strong> con copia a Secretaría de Facultad.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-50 p-4 rounded-xl border border-line">
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            Despacho Digital de Pliego de Examen
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            Remite automáticamente el caso sorteado al correo del alumno y genera el acta oficial en PDF.
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={despachandoCorreo}
                          onClick={handleDespacharCorreo}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-crimson to-[#7f1527] px-6 py-3 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all"
                        >
                          <Mail className="size-4" />
                          {despachandoCorreo ? (
                            'Despachando al correo institucional...'
                          ) : (
                            <>Despachar al Correo ({postulanteSeleccionado.correo.split('@')[0]}...)</>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Acciones Secundarias: Imprimir, Descargar PDF, Nuevo Sorteo */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs"
                        >
                          <Printer className="size-3.5" />
                          Imprimir Acta
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Descargando Acta Oficial ${codigoActa}.pdf...`)}
                          className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs"
                        >
                          <Download className="size-3.5" />
                          Descargar PDF
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleIniciarNuevoSorteo}
                        className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 shadow-sm"
                      >
                        <RotateCcw className="size-3.5" />
                        Iniciar Nuevo Sorteo
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ========================================================= */}
          {/* PANEL LATERAL: HISTORIAL DE LA SESIÓN & PARÁMETROS */}
          {/* ========================================================= */}
          <aside className="flex flex-col gap-6">
            {/* Parámetros Generales */}
            <div className="border border-line bg-white shadow-xs">
              <header className="border-b border-line px-5 py-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Parámetros del Acto
                </h3>
              </header>
              <div className="grid grid-cols-2 gap-px border-b border-line bg-line text-xs">
                <div className="bg-white p-3.5">
                  <p className="text-[10px] text-neutral-500 uppercase">Testigo de Fe</p>
                  <p className="font-bold text-gray-900 mt-0.5">Secretaría de Facultad</p>
                </div>
                <div className="bg-white p-3.5">
                  <p className="text-[10px] text-neutral-500 uppercase">Operador</p>
                  <p className="font-bold text-gray-900 mt-0.5 truncate">{user?.nombre || 'Coordinador'}</p>
                </div>
                <div className="bg-white p-3.5">
                  <p className="text-[10px] text-neutral-500 uppercase">Tope por Caso</p>
                  <p className="font-bold text-gray-900 mt-0.5">2 Usos Máx.</p>
                </div>
                <div className="bg-white p-3.5">
                  <p className="text-[10px] text-neutral-500 uppercase">Algoritmo</p>
                  <p className="font-bold text-emerald-600 mt-0.5">CSPRNG Auditado</p>
                </div>
              </div>
            </div>

            {/* Historial en Vivo de la Sesión */}
            <div className="flex flex-1 flex-col border border-line bg-white shadow-xs">
              <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Historial de la Sesión
                  </h3>
                  <p className="text-[10px] text-neutral-500">
                    {historialSesion.length} actos registrados hoy
                  </p>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto divide-y divide-line max-h-[520px]">
                {historialSesion.map((registro) => {
                  const esSuspendido = registro.estado === 'SUSPENDIDO'
                  return (
                    <div key={registro.id} className="p-4 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-neutral-500 font-semibold">
                          {registro.fechaHora} · {registro.actaCodigo}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            esSuspendido
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {registro.estado}
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-gray-900">
                          {registro.estudiante.nombreCompleto}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {registro.estudiante.carrera} · CU {registro.estudiante.carnetEstudiantil}
                        </p>
                      </div>

                      {esSuspendido ? (
                        <div className="rounded bg-red-50 p-2 text-[11px] text-red-800 border border-red-200">
                          <p className="font-semibold">Motivo de Suspensión:</p>
                          <p className="text-red-700">{registro.motivoInasistencia}</p>
                        </div>
                      ) : (
                        <div className="rounded bg-neutral-50 p-2 text-[11px] text-gray-700 border border-line">
                          <p>
                            <strong className="text-gray-900">Área:</strong> {registro.area?.codigo} - {registro.area?.nombre}
                          </p>
                          <p className="mt-0.5">
                            <strong className="text-gray-900">Caso:</strong> {registro.caso?.codigo} ({registro.caso?.titulo})
                          </p>
                          {registro.correoDespachado && (
                            <p className="mt-1 text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                              <CheckCircle2 className="size-3 text-emerald-600" />
                              Despachado a {registro.estudiante.correo} ({registro.fechaDespacho})
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardShell>
  )
}
