// Catálogo Oficial Sincronizado de Áreas y Casos para SGSEG (UTEPSA)
// Este catálogo sirve como soporte integral y fallback transparente para todas las carreras.

export interface AreaAcademicaSorteo {
  id: string
  codigo: string
  nombre: string
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

export const AREAS_CATALOGO_COMPLETO: Record<string, AreaAcademicaSorteo[]> = {
  "Administración General": [
    {
      "id": "15",
      "codigo": "AREA-015",
      "nombre": "Gerencia Contemporánea",
      "descripcion": "Área académica oficial de Administración General: Gerencia Contemporánea.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "16",
      "codigo": "AREA-016",
      "nombre": "Gestión de Talento Humano",
      "descripcion": "Área académica oficial de Administración General: Gestión de Talento Humano.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "17",
      "codigo": "AREA-017",
      "nombre": "Desarrollo de Negocios",
      "descripcion": "Área académica oficial de Administración General: Desarrollo de Negocios.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "18",
      "codigo": "AREA-018",
      "nombre": "Decisiones Financiera de Inversiones",
      "descripcion": "Área académica oficial de Administración General: Decisiones Financiera de Inversiones.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "19",
      "codigo": "AREA-019",
      "nombre": "Dirección Estratégica",
      "descripcion": "Área académica oficial de Administración General: Dirección Estratégica.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ],
  "Comercio Internacional": [
    {
      "id": "44",
      "codigo": "AREA-044",
      "nombre": "Comercio y Negocios Internacionales",
      "descripcion": "Área académica oficial de Comercio Internacional: Comercio y Negocios Internacionales.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "45",
      "codigo": "AREA-045",
      "nombre": "Gestión Aduanera",
      "descripcion": "Área académica oficial de Comercio Internacional: Gestión Aduanera.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "46",
      "codigo": "AREA-046",
      "nombre": "Internacionalización de la Empresa",
      "descripcion": "Área académica oficial de Comercio Internacional: Internacionalización de la Empresa.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "47",
      "codigo": "AREA-047",
      "nombre": "Logística y Distribución Física Internacional",
      "descripcion": "Área académica oficial de Comercio Internacional: Logística y Distribución Física Internacional.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "48",
      "codigo": "AREA-048",
      "nombre": "Workshop Avanzado en Comercio y Negocios Internacionales",
      "descripcion": "Área académica oficial de Comercio Internacional: Workshop Avanzado en Comercio y Negocios Internacionales.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ],
  "Comunicación Estratégica y Digital": [
    {
      "id": "20",
      "codigo": "AREA-020",
      "nombre": "Fundamentos de Comunicación",
      "descripcion": "Área académica oficial de Comunicación Estratégica y Digital: Fundamentos de Comunicación.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "21",
      "codigo": "AREA-021",
      "nombre": "Periodismo Corporativo y Digital",
      "descripcion": "Área académica oficial de Comunicación Estratégica y Digital: Periodismo Corporativo y Digital.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "22",
      "codigo": "AREA-022",
      "nombre": "Publicidad y Merchandising",
      "descripcion": "Área académica oficial de Comunicación Estratégica y Digital: Publicidad y Merchandising.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "23",
      "codigo": "AREA-023",
      "nombre": "Producción Audiovisual",
      "descripcion": "Área académica oficial de Comunicación Estratégica y Digital: Producción Audiovisual.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "24",
      "codigo": "AREA-024",
      "nombre": "Comunicación Estratégica y Digital",
      "descripcion": "Área académica oficial de Comunicación Estratégica y Digital: Comunicación Estratégica y Digital.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ],
  "Contaduría Pública": [
    {
      "id": "40",
      "codigo": "AREA-040",
      "nombre": "Contabilidad General",
      "descripcion": "Área académica oficial de Contaduría Pública: Contabilidad General.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "41",
      "codigo": "AREA-041",
      "nombre": "Contabilidad de Costos",
      "descripcion": "Área académica oficial de Contaduría Pública: Contabilidad de Costos.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "42",
      "codigo": "AREA-042",
      "nombre": "Administración Financiera",
      "descripcion": "Área académica oficial de Contaduría Pública: Administración Financiera.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "43",
      "codigo": "AREA-043",
      "nombre": "Auditoría Financiera",
      "descripcion": "Área académica oficial de Contaduría Pública: Auditoría Financiera.",
      "color": "#821528",
      "casosDisponibles": 1
    }
  ],
  "Derecho": [
    {
      "id": "1",
      "codigo": "AREA-001",
      "nombre": "Derecho Civil",
      "descripcion": "Área académica oficial de Derecho: Derecho Civil.",
      "color": "#9E1B32",
      "casosDisponibles": 5
    },
    {
      "id": "2",
      "codigo": "AREA-002",
      "nombre": "Derecho Penal",
      "descripcion": "Área académica oficial de Derecho: Derecho Penal.",
      "color": "#121316",
      "casosDisponibles": 5
    },
    {
      "id": "3",
      "codigo": "AREA-003",
      "nombre": "Derecho Comercial",
      "descripcion": "Área académica oficial de Derecho: Derecho Comercial.",
      "color": "#1E293B",
      "casosDisponibles": 5
    },
    {
      "id": "4",
      "codigo": "AREA-004",
      "nombre": "Derecho Constitucional",
      "descripcion": "Área académica oficial de Derecho: Derecho Constitucional.",
      "color": "#821528",
      "casosDisponibles": 5
    }
  ],
  "Electrónica y Sistemas": [
    {
      "id": "69",
      "codigo": "AREA-069",
      "nombre": "Instrumentación Electrónica y Procesos",
      "descripcion": "Área académica oficial de Electrónica y Sistemas: Instrumentación Electrónica y Procesos.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "70",
      "codigo": "AREA-070",
      "nombre": "Automatismos Electrónicos",
      "descripcion": "Área académica oficial de Electrónica y Sistemas: Automatismos Electrónicos.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "71",
      "codigo": "AREA-071",
      "nombre": "Sistemas de Electricidad y Electrónica de Potencia",
      "descripcion": "Área académica oficial de Electrónica y Sistemas: Sistemas de Electricidad y Electrónica de Potencia.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "72",
      "codigo": "AREA-072",
      "nombre": "Diseño de Control",
      "descripcion": "Área académica oficial de Electrónica y Sistemas: Diseño de Control.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "73",
      "codigo": "AREA-073",
      "nombre": "Evaluación de Prototipado",
      "descripcion": "Área académica oficial de Electrónica y Sistemas: Evaluación de Prototipado.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ],
  "Industrial y Comercial": [
    {
      "id": "54",
      "codigo": "AREA-054",
      "nombre": "Apoyo Técnico 1",
      "descripcion": "Área académica oficial de Industrial y Comercial: Apoyo Técnico 1.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "55",
      "codigo": "AREA-055",
      "nombre": "Apoyo Técnico 2",
      "descripcion": "Área académica oficial de Industrial y Comercial: Apoyo Técnico 2.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "56",
      "codigo": "AREA-056",
      "nombre": "Producción",
      "descripcion": "Área académica oficial de Industrial y Comercial: Producción.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "57",
      "codigo": "AREA-057",
      "nombre": "Evaluación Financiera de Proyectos 1",
      "descripcion": "Área académica oficial de Industrial y Comercial: Evaluación Financiera de Proyectos 1.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "58",
      "codigo": "AREA-058",
      "nombre": "Evaluación Financiera de Proyectos 2",
      "descripcion": "Área académica oficial de Industrial y Comercial: Evaluación Financiera de Proyectos 2.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ],
  "Ingeniería Comercial": [
    {
      "id": "25",
      "codigo": "AREA-025",
      "nombre": "Investigación y Análisis de Mercado Empresarial",
      "descripcion": "Área académica oficial de Ingeniería Comercial: Investigación y Análisis de Mercado Empresarial.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "26",
      "codigo": "AREA-026",
      "nombre": "Dirección Estratégica",
      "descripcion": "Área académica oficial de Ingeniería Comercial: Dirección Estratégica.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "27",
      "codigo": "AREA-027",
      "nombre": "Marketing Estratégico e Innovación",
      "descripcion": "Área académica oficial de Ingeniería Comercial: Marketing Estratégico e Innovación.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "28",
      "codigo": "AREA-028",
      "nombre": "Gestión Comercial",
      "descripcion": "Área académica oficial de Ingeniería Comercial: Gestión Comercial.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "29",
      "codigo": "AREA-029",
      "nombre": "Gestión Emprendedora",
      "descripcion": "Área académica oficial de Ingeniería Comercial: Gestión Emprendedora.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ],
  "Ingeniería Eléctrica": [
    {
      "id": "74",
      "codigo": "AREA-074",
      "nombre": "Máquinas e Instalaciones Eléctricas",
      "descripcion": "Área académica oficial de Ingeniería Eléctrica: Máquinas e Instalaciones Eléctricas.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "75",
      "codigo": "AREA-075",
      "nombre": "Sistemas de Generación con Energías Alternativas",
      "descripcion": "Área académica oficial de Ingeniería Eléctrica: Sistemas de Generación con Energías Alternativas.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "76",
      "codigo": "AREA-076",
      "nombre": "Líneas de Transmisión y Redes de Distribución",
      "descripcion": "Área académica oficial de Ingeniería Eléctrica: Líneas de Transmisión y Redes de Distribución.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "77",
      "codigo": "AREA-077",
      "nombre": "Simulaciones de Redes Eléctricas",
      "descripcion": "Área académica oficial de Ingeniería Eléctrica: Simulaciones de Redes Eléctricas.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "78",
      "codigo": "AREA-078",
      "nombre": "Aplicaciones para la Industria",
      "descripcion": "Área académica oficial de Ingeniería Eléctrica: Aplicaciones para la Industria.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ],
  "Ingeniería Financiera": [
    {
      "id": "35",
      "codigo": "AREA-035",
      "nombre": "Fundamentos y Análisis Financiero Operativos",
      "descripcion": "Área académica oficial de Ingeniería Financiera: Fundamentos y Análisis Financiero Operativos.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "36",
      "codigo": "AREA-036",
      "nombre": "Gestión Financiera a Corto Plazo",
      "descripcion": "Área académica oficial de Ingeniería Financiera: Gestión Financiera a Corto Plazo.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "37",
      "codigo": "AREA-037",
      "nombre": "Finanzas Largo Plazo",
      "descripcion": "Área académica oficial de Ingeniería Financiera: Finanzas Largo Plazo.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "38",
      "codigo": "AREA-038",
      "nombre": "Valoración de Empresas",
      "descripcion": "Área académica oficial de Ingeniería Financiera: Valoración de Empresas.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "39",
      "codigo": "AREA-039",
      "nombre": "Modelación Financiera",
      "descripcion": "Área académica oficial de Ingeniería Financiera: Modelación Financiera.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ],
  "Marketing y Publicidad": [
    {
      "id": "30",
      "codigo": "AREA-030",
      "nombre": "Investigación y Análisis de Mercados",
      "descripcion": "Área académica oficial de Marketing y Publicidad: Investigación y Análisis de Mercados.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "31",
      "codigo": "AREA-031",
      "nombre": "Plan de Marketing",
      "descripcion": "Área académica oficial de Marketing y Publicidad: Plan de Marketing.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "32",
      "codigo": "AREA-032",
      "nombre": "Publicidad y Merchandising",
      "descripcion": "Área académica oficial de Marketing y Publicidad: Publicidad y Merchandising.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "33",
      "codigo": "AREA-033",
      "nombre": "Marketing Digital",
      "descripcion": "Área académica oficial de Marketing y Publicidad: Marketing Digital.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "34",
      "codigo": "AREA-034",
      "nombre": "Métricas de Marketing e Insights",
      "descripcion": "Área académica oficial de Marketing y Publicidad: Métricas de Marketing e Insights.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ],
  "Mecánica": [
    {
      "id": "59",
      "codigo": "AREA-059",
      "nombre": "Mecánica de Equipos Agroindustriales",
      "descripcion": "Área académica oficial de Mecánica: Mecánica de Equipos Agroindustriales.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "60",
      "codigo": "AREA-060",
      "nombre": "Mecánica de Máquinas Agroindustriales",
      "descripcion": "Área académica oficial de Mecánica: Mecánica de Máquinas Agroindustriales.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "61",
      "codigo": "AREA-061",
      "nombre": "Mecánica de Motores Automotrices",
      "descripcion": "Área académica oficial de Mecánica: Mecánica de Motores Automotrices.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "62",
      "codigo": "AREA-062",
      "nombre": "Mecánica de Sistemas Automotrices",
      "descripcion": "Área académica oficial de Mecánica: Mecánica de Sistemas Automotrices.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "63",
      "codigo": "AREA-063",
      "nombre": "Mecánica de Equipos Industriales",
      "descripcion": "Área académica oficial de Mecánica: Mecánica de Equipos Industriales.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ],
  "Psicología": [
    {
      "id": "10",
      "codigo": "AREA-010",
      "nombre": "Psicología Comunitaria",
      "descripcion": "Área académica oficial de Psicología: Psicología Comunitaria.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "11",
      "codigo": "AREA-011",
      "nombre": "Psicología Clínica",
      "descripcion": "Área académica oficial de Psicología: Psicología Clínica.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "12",
      "codigo": "AREA-012",
      "nombre": "Psicología Forense",
      "descripcion": "Área académica oficial de Psicología: Psicología Forense.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "13",
      "codigo": "AREA-013",
      "nombre": "Psicología Educativa",
      "descripcion": "Área académica oficial de Psicología: Psicología Educativa.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "14",
      "codigo": "AREA-014",
      "nombre": "Psicología Organizacional",
      "descripcion": "Área académica oficial de Psicología: Psicología Organizacional.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ],
  "Redes y Telecomunicaciones": [
    {
      "id": "79",
      "codigo": "AREA-079",
      "nombre": "Diseño de Redes Corporativas",
      "descripcion": "Área académica oficial de Redes y Telecomunicaciones: Diseño de Redes Corporativas.",
      "color": "#9E1B32",
      "casosDisponibles": 4
    },
    {
      "id": "80",
      "codigo": "AREA-080",
      "nombre": "Servicios de Telecomunicaciones",
      "descripcion": "Área académica oficial de Redes y Telecomunicaciones: Servicios de Telecomunicaciones.",
      "color": "#121316",
      "casosDisponibles": 4
    },
    {
      "id": "81",
      "codigo": "AREA-081",
      "nombre": "Infraestructura de TI",
      "descripcion": "Área académica oficial de Redes y Telecomunicaciones: Infraestructura de TI.",
      "color": "#1E293B",
      "casosDisponibles": 3
    },
    {
      "id": "82",
      "codigo": "AREA-082",
      "nombre": "Gestión de Redes",
      "descripcion": "Área académica oficial de Redes y Telecomunicaciones: Gestión de Redes.",
      "color": "#821528",
      "casosDisponibles": 4
    },
    {
      "id": "83",
      "codigo": "AREA-083",
      "nombre": "Ciberseguridad",
      "descripcion": "Área académica oficial de Redes y Telecomunicaciones: Ciberseguridad.",
      "color": "#047857",
      "casosDisponibles": 4
    }
  ],
  "Relaciones Internacionales": [
    {
      "id": "5",
      "codigo": "AREA-005",
      "nombre": "Comercio y Negocios Internacionales",
      "descripcion": "Área académica oficial de Relaciones Internacionales: Comercio y Negocios Internacionales.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "6",
      "codigo": "AREA-006",
      "nombre": "Análisis y Gestión de la Resolución de Conflictos",
      "descripcion": "Área académica oficial de Relaciones Internacionales: Análisis y Gestión de la Resolución de Conflictos.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "7",
      "codigo": "AREA-007",
      "nombre": "Sostenibilidad y Cooperación",
      "descripcion": "Área académica oficial de Relaciones Internacionales: Sostenibilidad y Cooperación.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "8",
      "codigo": "AREA-008",
      "nombre": "Diplomacia y Política Exterior de Bolivia",
      "descripcion": "Área académica oficial de Relaciones Internacionales: Diplomacia y Política Exterior de Bolivia.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "9",
      "codigo": "AREA-009",
      "nombre": "Gestión Interdisciplinario en Relaciones Internacionales",
      "descripcion": "Área académica oficial de Relaciones Internacionales: Gestión Interdisciplinario en Relaciones Internacionales.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ],
  "Sistemas": [
    {
      "id": "64",
      "codigo": "AREA-064",
      "nombre": "Desarrollo de Software y Base de Datos",
      "descripcion": "Área académica oficial de Sistemas: Desarrollo de Software y Base de Datos.",
      "color": "#9E1B32",
      "casosDisponibles": 6
    },
    {
      "id": "65",
      "codigo": "AREA-065",
      "nombre": "Ingeniería y Calidad de Software",
      "descripcion": "Área académica oficial de Sistemas: Ingeniería y Calidad de Software.",
      "color": "#121316",
      "casosDisponibles": 5
    },
    {
      "id": "66",
      "codigo": "AREA-066",
      "nombre": "Infraestructura de TI",
      "descripcion": "Área académica oficial de Sistemas: Infraestructura de TI.",
      "color": "#1E293B",
      "casosDisponibles": 4
    },
    {
      "id": "67",
      "codigo": "AREA-067",
      "nombre": "Inteligencia Artificial",
      "descripcion": "Área académica oficial de Sistemas: Inteligencia Artificial.",
      "color": "#821528",
      "casosDisponibles": 5
    },
    {
      "id": "68",
      "codigo": "AREA-068",
      "nombre": "Ciberseguridad",
      "descripcion": "Área académica oficial de Sistemas: Ciberseguridad.",
      "color": "#047857",
      "casosDisponibles": 6
    }
  ],
  "Turismo": [
    {
      "id": "49",
      "codigo": "AREA-049",
      "nombre": "Gerencia Contemporánea",
      "descripcion": "Área académica oficial de Turismo: Gerencia Contemporánea.",
      "color": "#9E1B32",
      "casosDisponibles": 1
    },
    {
      "id": "50",
      "codigo": "AREA-050",
      "nombre": "Dirección Estratégica",
      "descripcion": "Área académica oficial de Turismo: Dirección Estratégica.",
      "color": "#121316",
      "casosDisponibles": 1
    },
    {
      "id": "51",
      "codigo": "AREA-051",
      "nombre": "Gestión y Desarrollo de la Actividad Turística",
      "descripcion": "Área académica oficial de Turismo: Gestión y Desarrollo de la Actividad Turística.",
      "color": "#1E293B",
      "casosDisponibles": 1
    },
    {
      "id": "52",
      "codigo": "AREA-052",
      "nombre": "Desarrollo de Negocios",
      "descripcion": "Área académica oficial de Turismo: Desarrollo de Negocios.",
      "color": "#821528",
      "casosDisponibles": 1
    },
    {
      "id": "53",
      "codigo": "AREA-053",
      "nombre": "Empresas Prestadoras de Servicios Turísticos",
      "descripcion": "Área académica oficial de Turismo: Empresas Prestadoras de Servicios Turísticos.",
      "color": "#047857",
      "casosDisponibles": 1
    }
  ]
};

export const CASOS_CATALOGO_COMPLETO: CasoEstudioSorteo[] = [
  {
    "id": "22",
    "codigo": "CASO-022",
    "titulo": "Evaluación de Proyecto de Expansión de Capacidad Instalada con Flujos Descontados",
    "areaId": "18",
    "areaNombre": "Decisiones Financiera de Inversiones",
    "contenido": "Cálculo de VAN, TIR, Payback descontado y análisis de sensibilidad de tasa de descuento ante volatilidad macroeconómica.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "21",
    "codigo": "CASO-021",
    "titulo": "Plan de Negocios para Apertura de Nueva Línea de Servicios Logísticos B2B",
    "areaId": "17",
    "areaNombre": "Desarrollo de Negocios",
    "contenido": "Validación del lienzo Lean Canvas, análisis de factibilidad de mercado, proyección de ventas y punto de equilibrio operativo.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "23",
    "codigo": "CASO-023",
    "titulo": "Formulación e Implantación de Cuadro de Mando Integral (Balanced Scorecard)",
    "areaId": "19",
    "areaNombre": "Dirección Estratégica",
    "contenido": "Mapa estratégico con cuatro perspectivas (financiera, clientes, procesos, aprendizaje) e indicadores KPI con metas operativas.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "19",
    "codigo": "CASO-019",
    "titulo": "Transformación del Modelo de Liderazgo y Cultura Organizacional en Fusión Corporativa",
    "areaId": "15",
    "areaNombre": "Gerencia Contemporánea",
    "contenido": "Plan de gestión del cambio para homologar culturas organizacionales divergentes y retener talento clave post-adquisición.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "20",
    "codigo": "CASO-020",
    "titulo": "Diseño de Sistema de Gestión por Competencias y Evaluación del Desempeño 360°",
    "areaId": "16",
    "areaNombre": "Gestión de Talento Humano",
    "contenido": "Definición del diccionario de competencias organizacionales, matrices de evaluación y planes de carrera con compensación variable.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "48",
    "codigo": "CASO-048",
    "titulo": "Selección de Incoterms 2020 y Cobertura Cambiaria en Contratos de Exportación a la Unión Europea",
    "areaId": "44",
    "areaNombre": "Comercio y Negocios Internacionales",
    "contenido": "Análisis de costos y riesgos de entrega entre FOB, CIF y DDP, evaluando instrumentos de pago seguro como Carta de Crédito irrevocable.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "49",
    "codigo": "CASO-049",
    "titulo": "Procedimiento de Despacho Aduanero de Importación a Consumo y Clasificación Arancelaria",
    "areaId": "45",
    "areaNombre": "Gestión Aduanera",
    "contenido": "Asignación de partida arancelaria en nomenclatura NANDINA, valoración aduanera según acuerdo OMC y liquidación de tributos (GA, IVA, ICE).",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "50",
    "codigo": "CASO-050",
    "titulo": "Estrategia de Entrada al Mercado Asiático Mediante Alianza Estratégica (Joint Venture)",
    "areaId": "46",
    "areaNombre": "Internacionalización de la Empresa",
    "contenido": "Evaluación de barreras no arancelarias, adaptación de empaque y etiquetado y selección de socios comerciales locales.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "51",
    "codigo": "CASO-051",
    "titulo": "Ruteo Multimodal y Consolidación de Carga Refrigerada en Contenedores Reefer",
    "areaId": "47",
    "areaNombre": "Logística y Distribución Física Internacional",
    "contenido": "Diseño de la cadena de frío, contratación de fletes marítimos/terrestres y cálculo de costos de bodegaje en puertos de tránsito.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "52",
    "codigo": "CASO-052",
    "titulo": "Simulación de Negociación Comercial Internacional para Resolución de Disputas de Embarque",
    "areaId": "48",
    "areaNombre": "Workshop Avanzado en Comercio y Negocios Internacionales",
    "contenido": "Manejo de reclamos por demoras de transporte internacional, pólizas de seguro de carga y arbitraje comercial de la CCI.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "28",
    "codigo": "CASO-028",
    "titulo": "Plan de Manejo de Crisis de Reputación Online en Medios Sociales",
    "areaId": "24",
    "areaNombre": "Comunicación Estratégica y Digital",
    "contenido": "Matriz de riesgos comunicacionales, protocolo de contención, manual de voceros y monitoreo de sentimiento en tiempo real.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "24",
    "codigo": "CASO-024",
    "titulo": "Auditoría de Comunicación Interna y Plan de Relacionamiento Institucional",
    "areaId": "20",
    "areaNombre": "Fundamentos de Comunicación",
    "contenido": "Diagnóstico de barreras comunicativas en mandos medios y propuesta de canales institucionales bidireccionales.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "25",
    "codigo": "CASO-025",
    "titulo": "Estrategia de Storytelling Transmedia para Posicionamiento de Responsabilidad Social",
    "areaId": "21",
    "areaNombre": "Periodismo Corporativo y Digital",
    "contenido": "Producción de contenidos periodísticos de impacto para boletines, salas de prensa virtuales y cobertura en medios digitales.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "27",
    "codigo": "CASO-027",
    "titulo": "Guion, Realización y Plan de Rodaje de Spot Institucional en Plataformas de Streaming",
    "areaId": "23",
    "areaNombre": "Producción Audiovisual",
    "contenido": "Storyboard, diseño técnico de producción, escaleta y optimización de formatos de video vertical para redes sociales.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "26",
    "codigo": "CASO-026",
    "titulo": "Campaña Publicitaria 360° para Lanzamiento de Marca Juvenil en Puntos de Venta",
    "areaId": "22",
    "areaNombre": "Publicidad y Merchandising",
    "contenido": "Concepto creativo, selección del mix de medios (ATL, BTL) y diseño de exhibidores y material POP interactivo.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "46",
    "codigo": "CASO-046",
    "titulo": "Presupuesto Maestro y Control Presupuestario de Desviaciones en Costos Estándar",
    "areaId": "42",
    "areaNombre": "Administración Financiera",
    "contenido": "Presupuesto operativo y financiero, análisis de variaciones de precio y eficiencia en mano de obra y materia prima.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "47",
    "codigo": "CASO-047",
    "titulo": "Planificación de Auditoría Financiera Externa y Evaluación de Control Interno (COSO)",
    "areaId": "43",
    "areaNombre": "Auditoría Financiera",
    "contenido": "Determinación de la materialidad de planeación, pruebas sustantivas de detalle y emisión del informe de auditoría independiente.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "44",
    "codigo": "CASO-044",
    "titulo": "Elaboración y Revelación de Estados Financieros bajo Normas de Contabilidad Bolivianas y NIIF",
    "areaId": "40",
    "areaNombre": "Contabilidad General",
    "contenido": "Ajustes contables por inflación y tenencia de bienes (AITB), depreciación por unidades producidas y presentación de notas a los EEFF.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "45",
    "codigo": "CASO-045",
    "titulo": "Implementación del Sistema de Costeo Basado en Actividades (ABC) en Planta de Manufactura",
    "areaId": "41",
    "areaNombre": "Contabilidad de Costos",
    "contenido": "Identificación de generadores de costos (cost drivers), distribución de costos indirectos de fabricación y costeo por órdenes específicas.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "1",
    "codigo": "CASO-001",
    "titulo": "Acción Reivindicatoria y Tercería de Dominio Excluyente sobre Inmueble Urbano",
    "areaId": "1",
    "areaNombre": "Derecho Civil",
    "contenido": "Analizar la controversia de doble matriculación de derechos reales respecto a un inmueble en Santa Cruz de la Sierra. El postulante debe sustentar la excepción perentoria de prescripción adquisitiva y la preferencia registral conforme al Código Civil boliviano.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "2",
    "codigo": "CASO-002",
    "titulo": "Resolución de Contrato de Compraventa por Incumplimiento Voluntario y Resarcimiento de Daños",
    "areaId": "1",
    "areaNombre": "Derecho Civil",
    "contenido": "Contrato preliminar de compraventa de bien inmueble con arras confirmatorias. El comprador incumple el saldo final alegando vicios ocultos de gravamen hipotecario no saneado. Fundamente la demanda de cumplimiento o resolución contractual.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "113",
    "codigo": "CASO-113",
    "titulo": "Acción Reivindicatoria y Tercería de Dominio Excluyente en Predios Urbanos con Superposición Registral",
    "areaId": "1",
    "areaNombre": "Derecho Civil",
    "contenido": "Conflicto de derecho propietario entre dos adquirientes de buena fe sobre un mismo inmueble urbano con folios reales duplicados por error de Derechos Reales. El estudiante debe plantear la demanda ordinaria civil de mejor derecho de propiedad, prescripción adquisitiva decenal y nulidad de asiento registral.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "114",
    "codigo": "CASO-114",
    "titulo": "Resolución Contractual por Incumplimiento con Cláusula Penal y Resarcimiento de Daños en Contrato Inmobiliario",
    "areaId": "1",
    "areaNombre": "Derecho Civil",
    "contenido": "Una constructora incumple la entrega de un edificio de departamentos en la fecha pactada alegando fuerza mayor (crisis de materiales). Analice la mora automática, la validez de la cláusula penal, el principio pacta sunt servanda y la liquidación pericial de lucro cesante y daño emergente.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "115",
    "codigo": "CASO-115",
    "titulo": "Proceso Extraordinario de Desalojo por Falta de Pago y Régimen de Retención por Mejoras Útiles y Necesarias",
    "areaId": "1",
    "areaNombre": "Derecho Civil",
    "contenido": "Contrato de arrendamiento comercial de larga data donde el arrendatario adeuda 8 cánones de alquiler pero reclama compensación por inversiones estructurales de alto costo realizadas sin autorización expresa por escrito. Formule la contestación y reconvención civil correspondiente.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "5",
    "codigo": "CASO-005",
    "titulo": "Disolución y Liquidación Judicial de Sociedad de Responsabilidad Limitada por Imposibilidad Sobreviviente",
    "areaId": "3",
    "areaNombre": "Derecho Comercial",
    "contenido": "Conflicto societario de una S.R.L. con parálisis orgánica en asambleas de socios por empate en cuotas de capital. Estructure el procedimiento legal de disolución, balance final de liquidación y prelación de acreedores comerciales.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "6",
    "codigo": "CASO-006",
    "titulo": "Ejecución Coactiva de Título Valor (Pagaré Notarial) y Excepciones Cambiarias",
    "areaId": "3",
    "areaNombre": "Derecho Comercial",
    "contenido": "Cobro de título valor con cláusula de vencimiento anticipado y cesión de crédito bancario. Diseñe el memorial de excepciones de falsedad material y prescripción de la acción ejecutiva.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "116",
    "codigo": "CASO-116",
    "titulo": "Disolución y Liquidación de Sociedad de Responsabilidad Limitada por Imposibilidad Manifiesta del Objeto Social",
    "areaId": "3",
    "areaNombre": "Derecho Comercial",
    "contenido": "Una SRL con dos socios al 50% cae en parálisis orgánica irreconciliable que impide la aprobación de balances anuales y la renovación de licencias operativas. Estructure el procedimiento de disolución judicial, designación de liquidador y plan de pago con prelación legal de créditos.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "117",
    "codigo": "CASO-117",
    "titulo": "Acción Ejecutiva Cambiaria por Pagaré con Cláusula de Interés Penal y Excepción de Falsedad Material",
    "areaId": "3",
    "areaNombre": "Derecho Comercial",
    "contenido": "Demanda ejecutiva mercantil para el cobro de un pagaré con aval solidario por $us 150.000. El demandado interpone excepciones de inhabilidad de título y alteración del monto original. El postulante debe sustentar la contestación a las excepciones y el régimen probatorio mercantil aplicable.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "118",
    "codigo": "CASO-118",
    "titulo": "Responsabilidad Societaria de los Administradores por Quiebra Culposa y Fraude a los Acreedores",
    "areaId": "3",
    "areaNombre": "Derecho Comercial",
    "contenido": "El directorio de una sociedad anónima desvía fondos corporativos a subsidiarias vinculadas previo a solicitar la cesación de pagos. Diseñe la acción de responsabilidad de los administradores (actio mandati) y las medidas precautorias para cautelar el patrimonio social en resguardo de la masa acreedora.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "7",
    "codigo": "CASO-007",
    "titulo": "Acción de Amparo Constitucional por Vulneración del Debido Proceso en Proceso Disciplinario",
    "areaId": "4",
    "areaNombre": "Derecho Constitucional",
    "contenido": "Funcionario público destituido en sede administrativa sin notificación formal del pliego de cargos. Formule la acción tutelar invocando la jurisprudencia vinculante del Tribunal Constitucional Plurinacional.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "8",
    "codigo": "CASO-008",
    "titulo": "Acción de Libertad por Detención Preventiva Irrazonable e Inobservancia del Plazo Legal",
    "areaId": "4",
    "areaNombre": "Derecho Constitucional",
    "contenido": "Privación de libertad prolongada por dilación injustificada atribuible al órgano judicial y fiscalía. Fundamente la tutela inmediata de la libertad física y el cese de medidas cautelares gravosas.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "119",
    "codigo": "CASO-119",
    "titulo": "Acción de Amparo Constitucional por Vulneración del Derecho al Debido Proceso y Defensa Técnica en Sumario Administrativo",
    "areaId": "4",
    "areaNombre": "Derecho Constitucional",
    "contenido": "Un servidor público de carrera es destituido mediante resolución sancionatoria sin que se le permitiera acceder al cuaderno de investigación ni interrogar a testigos de cargo. Elabore el memorial de Acción de Amparo Constitucional invocando la doctrina vinculante del TCP sobre motivación de resoluciones.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "120",
    "codigo": "CASO-120",
    "titulo": "Acción Popular por Afectación al Medio Ambiente y Recursos Hídricos por Explotación Minera Ilegal",
    "areaId": "4",
    "areaNombre": "Derecho Constitucional",
    "contenido": "Una comunidad campesina denuncia contaminación con mercurio en la cuenca de un río por concesiones mineras que operan sin licencia ambiental ni consulta previa. Formule la Acción Popular solicitando la paralización inmediata de faenas, remediación ambiental y medidas cautelares constitucionales.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "121",
    "codigo": "CASO-121",
    "titulo": "Acción de Libertad por Dilación Indebida en la Resolución de Cesación a la Detención Preventiva",
    "areaId": "4",
    "areaNombre": "Derecho Constitucional",
    "contenido": "El juzgado cautelar suspende por cuarta vez consecutiva la audiencia de cesación de detención preventiva de un imputado por falta de traslado del recinto penitenciario. Redacte la acción tutelar en su modalidad traslativa o de pronto despacho para restituir el ejercicio efectivo de la libertad personal.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "3",
    "codigo": "CASO-003",
    "titulo": "Teoría del Delito y Juicio de Tipicidad en Delitos Contra el Patrimonio y Estafa Agravada",
    "areaId": "2",
    "areaNombre": "Derecho Penal",
    "contenido": "Imputación formal por el tipo penal de Estafa con agravante de víctimas múltiples en una operación de intermediación bursátil informal. Desarrolle la teoría del caso de la defensa técnica abordando el dolo antecedente y la tipicidad conglobante.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "4",
    "codigo": "CASO-004",
    "titulo": "Exclusión Probatoria y Legítima Defensa en Delito de Homicidio en Riña",
    "areaId": "2",
    "areaNombre": "Derecho Penal",
    "contenido": "Planteamiento de excepción incidental de nulidad de elementos probatorios obtenidos sin control jurisdiccional y fundamentación dogmática de causa de justificación por legítima defensa proporcional.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "110",
    "codigo": "CASO-110",
    "titulo": "Teoría del Caso y Valoración de Prueba Pericial Informática en Delitos de Estafa Digital y Phishing Bancario",
    "areaId": "2",
    "areaNombre": "Derecho Penal",
    "contenido": "Se investiga una organización criminal por transferencias no autorizadas mediante accesos clonados a banca en línea de más de 30 víctimas. El postulante debe sustentar la teoría del caso de la parte querellante o defensora, analizando la cadena de custodia digital, trazabilidad de direcciones IP, y excepciones procesales por defecto en la imputación formal.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "111",
    "codigo": "CASO-111",
    "titulo": "Juicio Oral y Debate Dogmático en Delito de Legítima Defensa vs. Exceso en las Causas de Justificación",
    "areaId": "2",
    "areaNombre": "Derecho Penal",
    "contenido": "En un asalto a mano armada a un establecimiento comercial, el propietario repele el ataque disparando al agresor en retirada. Desarrolle los fundamentos dogmáticos de antijuridicidad, elemento subjetivo de justificación y necesidad racional del medio empleado según la jurisprudencia del Tribunal Supremo de Justicia.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "112",
    "codigo": "CASO-112",
    "titulo": "Medidas Cautelares de Carácter Personal y Peligros Procesales de Fuga y Obstaculización",
    "areaId": "2",
    "areaNombre": "Derecho Penal",
    "contenido": "Audiencia de medidas cautelares en proceso por delitos contra la administración pública. Diseñe la estrategia argumentativa de la defensa técnica para desvirtuar el riesgo de fuga mediante acreditación de arraigo natural y económico idóneo, proponiendo medidas sustitutivas a la detención preventiva conforme a la Ley 1173.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "79",
    "codigo": "CASO-079",
    "titulo": "Programación de Controladores Lógicos Programables (PLC) bajo Norma IEC 61131-3",
    "areaId": "70",
    "areaNombre": "Automatismos Electrónicos",
    "contenido": "Desarrollo de lógica de control en diagrama de contactos (Ladder) y texto estructurado para una estación de llenado y envasado automatizado.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "81",
    "codigo": "CASO-081",
    "titulo": "Sintonización de Controlador PID Digital para Sistema de Control de Nivel y Flujo",
    "areaId": "72",
    "areaNombre": "Diseño de Control",
    "contenido": "Modelado matemático de la planta, identificación de función de transferencia y sintonización por métodos de Ziegler-Nichols y lugar geométrico de las raíces.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "82",
    "codigo": "CASO-082",
    "titulo": "Diseño, Fabricación y Pruebas de Compatibilidad Electromagnética (EMC) de PCB Multicapa",
    "areaId": "73",
    "areaNombre": "Evaluación de Prototipado",
    "contenido": "Enrutamiento de señales de alta velocidad, planos de masa continuos, análisis de integridad de señal y normas IPC-2221.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "78",
    "codigo": "CASO-078",
    "titulo": "Acondicionamiento de Señales Analógicas de Sensores Industriales de Presión y Temperatura",
    "areaId": "69",
    "areaNombre": "Instrumentación Electrónica y Procesos",
    "contenido": "Diseño de etapas de amplificación con amplificadores de instrumentación, filtrado activo paso bajo y transmisión de señal en lazo de corriente 4-20 mA.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "80",
    "codigo": "CASO-080",
    "titulo": "Diseño de Inversor de Voltaje DC-AC con Modulación por Ancho de Pulso (SPWM) para Energía Solar",
    "areaId": "71",
    "areaNombre": "Sistemas de Electricidad y Electrónica de Potencia",
    "contenido": "Selección de transistores IGBT/MOSFET, diseño de filtros LC de salida y circuitos de disparo con aislamiento óptico.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "58",
    "codigo": "CASO-058",
    "titulo": "Estudio de Tiempos y Movimientos para Eliminación de Cuellos de Botella en Línea de Envasado",
    "areaId": "54",
    "areaNombre": "Apoyo Técnico 1",
    "contenido": "Diagrama bimanual, cálculo del tiempo estándar y balanceo de línea de producción para aumentar la eficiencia global de equipos (OEE).",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "59",
    "codigo": "CASO-059",
    "titulo": "Diseño de Instalaciones Industriales (Layout) y Seguridad y Salud en el Trabajo (ISO 45001)",
    "areaId": "55",
    "areaNombre": "Apoyo Técnico 2",
    "contenido": "Distribución en planta mediante el método SLP (Systematic Layout Planning) y matriz de identificación de peligros y evaluación de riesgos (IPER).",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "61",
    "codigo": "CASO-061",
    "titulo": "Formulación y Evaluación Técnica de Planta Procesadora de Alimentos",
    "areaId": "57",
    "areaNombre": "Evaluación Financiera de Proyectos 1",
    "contenido": "Estudio de localización por método de factores ponderados, balance de materia y energía y dimensionamiento de maquinaria.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "62",
    "codigo": "CASO-062",
    "titulo": "Evaluación Económico-Financiera de Inversión Industrial con Apalancamiento Bancario",
    "areaId": "58",
    "areaNombre": "Evaluación Financiera de Proyectos 2",
    "contenido": "Flujo de caja del accionista, cálculo del WACC del proyecto, indicadores de rentabilidad (VAN, TIR) y punto de cierre operativo.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "60",
    "codigo": "CASO-060",
    "titulo": "Planificación y Control de la Producción con Sistema MRP II y Filosofía Lean Manufacturing",
    "areaId": "56",
    "areaNombre": "Producción",
    "contenido": "Plan Maestro de Producción (MPS), lista de materiales (BOM) y aplicación de herramientas 5S y Kanban para reducción de desperdicios.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "30",
    "codigo": "CASO-030",
    "titulo": "Estrategia de Crecimiento Intensivo y Penetración de Mercado frente a Nuevos Competidores",
    "areaId": "26",
    "areaNombre": "Dirección Estratégica",
    "contenido": "Matriz Ansoff, análisis de ventajas competitivas según modelo de Porter y plan de contingencia comercial.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "32",
    "codigo": "CASO-032",
    "titulo": "Optimización del Funnel de Ventas B2B y Estructuración de Cuotas de Venta",
    "areaId": "28",
    "areaNombre": "Gestión Comercial",
    "contenido": "Diseño del proceso comercial, automatización de prospección en CRM y esquema de comisiones por metas escalonadas.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "33",
    "codigo": "CASO-033",
    "titulo": "Validación de Modelo de Negocio Startup con Metodología Lean Startup",
    "areaId": "29",
    "areaNombre": "Gestión Emprendedora",
    "contenido": "Definición de Producto Mínimo Viable (MVP), métricas pirata (AARRR) y cálculo de CAC (Costo de Adquisición) vs LTV (Valor de Vida).",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "29",
    "codigo": "CASO-029",
    "titulo": "Estudio Cuantitativo de Elasticidad Precio de la Demanda en Consumo Masivo",
    "areaId": "25",
    "areaNombre": "Investigación y Análisis de Mercado Empresarial",
    "contenido": "Muestreo estratificado, tabulación estadística de disposición a pagar y recomendaciones de fijación de precios competitivos.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "31",
    "codigo": "CASO-031",
    "titulo": "Desarrollo de Oferta de Valor Basada en Servicios y Experiencia del Cliente (CX)",
    "areaId": "27",
    "areaNombre": "Marketing Estratégico e Innovación",
    "contenido": "Customer Journey Map, identificación de puntos de dolor y rediseño de servicios postventa fidelizantes.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "87",
    "codigo": "CASO-087",
    "titulo": "Eficiencia Energética y Auditoría Eléctrica en Planta Industrial de Gran Consumo",
    "areaId": "78",
    "areaNombre": "Aplicaciones para la Industria",
    "contenido": "Medición de distorsión armónica total (THD), mitigación con filtros activos de armónicos y reducción del factor de demanda eléctrica.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "85",
    "codigo": "CASO-085",
    "titulo": "Cálculo Mecánico y Eléctrico de Línea de Transmisión en Alta Tensión a 115 kV",
    "areaId": "76",
    "areaNombre": "Líneas de Transmisión y Redes de Distribución",
    "contenido": "Selección de conductores ACSR, cálculo de flechas y tensiones mecánicas en catenaria y coordinación de protecciones de distancia.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "83",
    "codigo": "CASO-083",
    "titulo": "Diseño de Subestación Transformadora de Media Tensión y Compensación de Energía Reactiva",
    "areaId": "74",
    "areaNombre": "Máquinas e Instalaciones Eléctricas",
    "contenido": "Cálculo de corrientes de cortocircuito, selección de interruptores de potencia, dimensionamiento de banco de condensadores y coordinación de aislamiento.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "86",
    "codigo": "CASO-086",
    "titulo": "Estudio de Flujo de Potencia y Estabilidad Transitoria Mediante Software Especializado (DigSILENT)",
    "areaId": "77",
    "areaNombre": "Simulaciones de Redes Eléctricas",
    "contenido": "Simulación de contingencias N-1, análisis de caídas de tensión en barras críticas y ajuste de esquemas de alivio de carga.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "84",
    "codigo": "CASO-084",
    "titulo": "Dimensionamiento de Parque Solar Fotovoltaico Conectado a la Red de Transmisión Nacional",
    "areaId": "75",
    "areaNombre": "Sistemas de Generación con Energías Alternativas",
    "contenido": "Cálculo de radiación solar incidente, selección de inversores centrales y evaluación del impacto en la estabilidad de frecuencia del SIN.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "41",
    "codigo": "CASO-041",
    "titulo": "Determinación de la Estructura Óptima de Capital y Costo Promedio Ponderado (WACC)",
    "areaId": "37",
    "areaNombre": "Finanzas Largo Plazo",
    "contenido": "Modelación de teorema de Modigliani-Miller con impuestos y estimación del costo del patrimonio mediante CAPM.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "39",
    "codigo": "CASO-039",
    "titulo": "Diagnóstico Económico-Financiero Integral Mediante Análisis DuPont y Razones de Liquidez",
    "areaId": "35",
    "areaNombre": "Fundamentos y Análisis Financiero Operativos",
    "contenido": "Evaluación del margen de utilidad neta, rotación de activos y apalancamiento financiero en empresas del sector retail.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "40",
    "codigo": "CASO-040",
    "titulo": "Optimización del Capital de Trabajo Neto y Ciclo de Conversión de Efectivo",
    "areaId": "36",
    "areaNombre": "Gestión Financiera a Corto Plazo",
    "contenido": "Políticas de cobranza, gestión óptima de inventarios con modelo EOQ y negociación de financiamiento espontáneo de proveedores.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "43",
    "codigo": "CASO-043",
    "titulo": "Simulación Montecarlo para Medición del Valor en Riesgo (VaR) de Portafolios de Inversión",
    "areaId": "39",
    "areaNombre": "Modelación Financiera",
    "contenido": "Programación de escenarios estocásticos para cuantificar pérdidas máximas tolerables con 95% y 99% de confianza.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "42",
    "codigo": "CASO-042",
    "titulo": "Valoración Corporativa por Flujo de Caja Libre Descontado (DCF) y Múltiplos Comparables",
    "areaId": "38",
    "areaNombre": "Valoración de Empresas",
    "contenido": "Proyección de estados financieros a 5 años, valor terminal perpetuo y análisis de sensibilidad de múltiplos EBITDA.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "34",
    "codigo": "CASO-034",
    "titulo": "Estudio de Hábitos de Consumo Digital y Comportamiento del Consumidor Z",
    "areaId": "30",
    "areaNombre": "Investigación y Análisis de Mercados",
    "contenido": "Técnicas de investigación mixta, Focus Groups virtuales y segmentación psicográfica avanzada.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "37",
    "codigo": "CASO-037",
    "titulo": "Estrategia de Inbound Marketing, Lead Nurturing y Campañas Performance (SEM/Social Ads)",
    "areaId": "33",
    "areaNombre": "Marketing Digital",
    "contenido": "Configuración de pauta publicitaria en Google Ads / Meta Ads, cálculo de ROAS y automatización de correos.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "38",
    "codigo": "CASO-038",
    "titulo": "Dashboard de Rendimiento Omnicanal y Atribución Multitáctil de Conversiones",
    "areaId": "34",
    "areaNombre": "Métricas de Marketing e Insights",
    "contenido": "Modelos de atribución lineal vs primer clic, análisis de cohortes de retención y reporte de ROI de marketing.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "35",
    "codigo": "CASO-035",
    "titulo": "Formulación del Plan Anual de Marketing con Presupuesto Base Cero",
    "areaId": "31",
    "areaNombre": "Plan de Marketing",
    "contenido": "Definición de objetivos SMART, estrategias de producto, precio, plaza y promoción con cronograma Gantt.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "36",
    "codigo": "CASO-036",
    "titulo": "Campaña de Branding Emocional y Trade Marketing en Canal Tradicional",
    "areaId": "32",
    "areaNombre": "Publicidad y Merchandising",
    "contenido": "Diseño de promociones comerciales, activación de marca en ferias y arquitectura visual en anaquel.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "63",
    "codigo": "CASO-063",
    "titulo": "Cálculo y Selección de Elementos de Máquinas para Cosechadora Combinada de Granos",
    "areaId": "59",
    "areaNombre": "Mecánica de Equipos Agroindustriales",
    "contenido": "Diseño cinemático de transmisiones por cadenas y engranajes, cálculo de fatiga en ejes de mando y selección de rodamientos de alta carga.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "67",
    "codigo": "CASO-067",
    "titulo": "Plan de Mantenimiento Predictivo Basado en Análisis de Vibraciones y Termografía para Turbomaquinaria",
    "areaId": "63",
    "areaNombre": "Mecánica de Equipos Industriales",
    "contenido": "Espectros de vibración FFT para detección de desalineación o desbalance, lubricación industrial y cálculo de confiabilidad RCM.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "65",
    "codigo": "CASO-065",
    "titulo": "Diagnóstico Termodinámico y Reacondicionamiento de Motor Diesel Turboalimentado de Inyección Common Rail",
    "areaId": "61",
    "areaNombre": "Mecánica de Motores Automotrices",
    "contenido": "Análisis de gases de escape, balance térmico, curvas de torque y potencia y protocolo de pruebas en banco dinamométrico.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "64",
    "codigo": "CASO-064",
    "titulo": "Rediseño de Sistema de Trilla y Separación Centrífuga para Planta de Beneficio",
    "areaId": "60",
    "areaNombre": "Mecánica de Máquinas Agroindustriales",
    "contenido": "Modelado CAD/CAE de componentes de desgaste, análisis estructural por elementos finitos (FEA) y optimización de flujo másico.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "66",
    "codigo": "CASO-066",
    "titulo": "Diseño de Sistema de Suspensión Neumática y Frenos Antibloqueo (EBS) para Transporte Pesado",
    "areaId": "62",
    "areaNombre": "Mecánica de Sistemas Automotrices",
    "contenido": "Cálculo de fuerzas de frenado, distribución de cargas dinámicas y simulación de comportamiento vehicular en curvas.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "15",
    "codigo": "CASO-015",
    "titulo": "Plan Terapéutico Cognitivo-Conductual para Trastorno de Ansiedad Generalizada",
    "areaId": "11",
    "areaNombre": "Psicología Clínica",
    "contenido": "Evaluación psicométrica, formulación clínica de caso y diseño de protocolo de reestructuración cognitiva y desensibilización.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "14",
    "codigo": "CASO-014",
    "titulo": "Diagnóstico Participativo e Intervención Psicosocial en Poblaciones Vulnerables",
    "areaId": "10",
    "areaNombre": "Psicología Comunitaria",
    "contenido": "Desarrollo de un programa de resiliencia comunitaria y prevención de factores de riesgo psicosocial en barrios periurbanos.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "17",
    "codigo": "CASO-017",
    "titulo": "Adaptaciones Curriculares y Apoyo Psicoeducativo en Dificultades Específicas del Aprendizaje (DEA)",
    "areaId": "13",
    "areaNombre": "Psicología Educativa",
    "contenido": "Diseño de un plan de intervención psicopedagógica multidisciplinario para estudiantes con TDAH y dislexia en nivel secundario.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "16",
    "codigo": "CASO-016",
    "titulo": "Peritaje Psicológico Forense en Casos de Violencia Intrafamiliar y Credibilidad de Testimonio",
    "areaId": "12",
    "areaNombre": "Psicología Forense",
    "contenido": "Aplicación de protocolos estandarizados (SVA/CBCA) y dictamen pericial forense para valoración del daño psíquico ante juzgados de familia.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "18",
    "codigo": "CASO-018",
    "titulo": "Evaluación del Clima Laboral y Prevención del Síndrome de Burnout en Personal de Salud",
    "areaId": "14",
    "areaNombre": "Psicología Organizacional",
    "contenido": "Medición con batería de Maslach, análisis de factores de riesgo psicosocial en el trabajo y plan corporativo de bienestar organizacional.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "92",
    "codigo": "CASO-092",
    "titulo": "Implementación de Firewall de Nueva Generación (NGFW) con Prevención de Intrusiones (IPS) y VPN IPSec",
    "areaId": "83",
    "areaNombre": "Ciberseguridad",
    "contenido": "Políticas de inspección profunda de paquetes (DPI), túneles VPN sitio a sitio con cifrado AES-256 y filtrado de contenido web avanzado.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "133",
    "codigo": "CASO-133",
    "titulo": "Implementación de Cortafuegos de Próxima Generación (NGFW) y Prevención de Intrusiones (IPS/IDS) en Red Corporativa",
    "areaId": "83",
    "areaNombre": "Ciberseguridad",
    "contenido": "Una institución financiera experimenta intentos continuos de escaneo de puertos y explotación de vulnerabilidades en su perímetro. Diseñar e implementar la arquitectura perimetral con cluster activo-pasivo de NGFW (Fortinet/Palo Alto), inspección profunda SSL/TLS, políticas de filtrado DNS y perfiles de protección DoS/DDoS.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "134",
    "codigo": "CASO-134",
    "titulo": "Segmentación de Red y Aislamiento de Tráfico IoT y Cámaras IP con Protocolo 802.1Q e Inspección DHCP Snooping",
    "areaId": "83",
    "areaNombre": "Ciberseguridad",
    "contenido": "Un complejo hospitalario incorpora más de 300 dispositivos médicos conectados y cámaras de videovigilancia vulnerables. El estudiante debe formular la estrategia de segmentación lógica por VLANs, aislamiento de puertos (Private VLANs), mitigación de ataques de envenenamiento ARP (Dynamic ARP Inspection) y protección contra suplantación de DHCP.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "135",
    "codigo": "CASO-135",
    "titulo": "Despliegue de Red Privada Virtual (VPN) SSL con Autenticación Multifactor (MFA) para Teletrabajo Seguro",
    "areaId": "83",
    "areaNombre": "Ciberseguridad",
    "contenido": "Una corporación requiere garantizar acceso remoto cifrado para 400 colaboradores externos. Formular la arquitectura de VPN basada en TLS 1.3 con integración a Directorio Activo mediante SAML 2.0 y MFA, validación del estado de seguridad del endpoint (Host Checker) y registro exhaustivo de accesos para auditoría de cumplimiento.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "88",
    "codigo": "CASO-088",
    "titulo": "Diseño de Red Empresarial Jerárquica con Enrutamiento Dinámico OSPF y Alta Disponibilidad (HSRP)",
    "areaId": "79",
    "areaNombre": "Diseño de Redes Corporativas",
    "contenido": "Configuración de VLANs de datos y voz, enlaces troncales 802.1Q, agregación de enlaces (LACP) y redundancia en capa de distribución.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "130",
    "codigo": "CASO-130",
    "titulo": "Arquitectura SD-WAN (Software-Defined WAN) Multisede con Conectividad Híbrida MPLS e Internet",
    "areaId": "79",
    "areaNombre": "Diseño de Redes Corporativas",
    "contenido": "Una cadena de farmacias con 120 sucursales en Bolivia desea optimizar costos de conectividad reduciendo enlaces MPLS costosos. El postulante debe diseñar una solución SD-WAN con túneles IPsec dinámicos, selección inteligente de ruta en tiempo real basada en métricas de latencia y jitter, y control centralizado desde la nube.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "131",
    "codigo": "CASO-131",
    "titulo": "Diseño de Red de Campus con Núcleo Colapsado, Spanning Tree (MSTP) y Enrutamiento Dinámico OSPFv3 Multiárea",
    "areaId": "79",
    "areaNombre": "Diseño de Redes Corporativas",
    "contenido": "Diseño de red corporativa de alta disponibilidad para un campus corporativo de 3 edificios. Implementar agregación de enlaces LACP (EtherChannel), redundancia de puerta de enlace por VRRP/HSRP, segmentación de subredes por departamento y enrutamiento dinámico jerárquico OSPF con áreas stub para optimización de tablas de enrutamiento.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "132",
    "codigo": "CASO-132",
    "titulo": "Despliegue de Red Inalámbrica Wi-Fi 6 (802.11ax) de Alta Densidad con Roaming Transparente (802.11r/k/v)",
    "areaId": "79",
    "areaNombre": "Diseño de Redes Corporativas",
    "contenido": "Diseño y estudio de cobertura (site survey predictivo) para un centro de convenciones y aulas universitarias con aforo simultáneo de 3.000 personas. Configurar controladoras WLAN en alta disponibilidad (SSO), balanceo de banda (Band Steering), autenticación 802.1X con servidor RADIUS (FreeRADIUS/Cisco ISE) y portal cautivo para invitados.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "91",
    "codigo": "CASO-091",
    "titulo": "Implementación de Plataforma de Monitoreo de Redes y Telemetría Basada en SNMP y NetFlow",
    "areaId": "82",
    "areaNombre": "Gestión de Redes",
    "contenido": "Supervisión de ancho de banda por interfaces, configuración de umbrales de alerta y generación de reportes de calidad de servicio (QoS).",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "125",
    "codigo": "CASO-125",
    "titulo": "Implementación de Plataforma de Monitoreo Centralizado NMS con SNMPv3 y Telemetría por Streaming (gNMI)",
    "areaId": "82",
    "areaNombre": "Gestión de Redes",
    "contenido": "Un proveedor de servicios con más de 800 dispositivos de red (switches, routers, firewalls) necesita reemplazar su monitoreo reactivo por una plataforma predictiva. Diseñar la arquitectura con Prometheus/Grafana, recolectores SNMPv3 cifrados, definición de umbrales SLA (jitter, latencia, pérdida de paquetes) y generación automática de tickets en incidentes críticos.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "126",
    "codigo": "CASO-126",
    "titulo": "Gestión Automatizada de Configuraciones y Cumplimiento de Políticas con Ansible y GitOps",
    "areaId": "82",
    "areaNombre": "Gestión de Redes",
    "contenido": "Automatización del aprovisionamiento y auditoría de configuraciones de 150 switches de acceso en múltiples campus. Desarrollar playbooks de Ansible para la aplicación homogénea de hardening (deshabilitación de telnet, configuración de SSHv2, NTP y Syslog centralizado) con control de versiones en GitLab.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "127",
    "codigo": "CASO-127",
    "titulo": "Optimización de Ancho de Banda y Control de Tráfico Mediante Deep Packet Inspection (DPI) y Políticas QoS",
    "areaId": "82",
    "areaNombre": "Gestión de Redes",
    "contenido": "Una red corporativa sufre saturación en sus enlaces WAN debido al uso no corporativo de aplicaciones peer-to-peer y streaming de video. Se solicita diseñar la política de clasificación y marcado DiffServ (DSCP), colas de prioridad estricta (PQ) y weighted fair queuing (WFQ) para priorizar ERP y videoconferencias.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "90",
    "codigo": "CASO-090",
    "titulo": "Diseño de Centro de Procesamiento de Datos (Data Center) según Estándar TIA-942 Tier III",
    "areaId": "81",
    "areaNombre": "Infraestructura de TI",
    "contenido": "Dimensionamiento de sistemas de climatización de precisión (HVAC), generadores de respaldo UPS redundantes y cableado estructurado categoría 6A.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "128",
    "codigo": "CASO-128",
    "titulo": "Diseño de Cableado Estructurado y Sala de Servidores (Data Center Tier II) bajo Norma TIA-942 y TIA-568",
    "areaId": "81",
    "areaNombre": "Infraestructura de TI",
    "contenido": "Diseño integral de la infraestructura física para la nueva sede corporativa de una empresa de seguros (4 niveles, 600 puntos de red). El proyecto debe incluir cálculo de carga térmica para climatización de precisión (HVAC), sistema de energía ininterrumpida (UPS en paralelo redundante N+1), rutas de fibra monomodo OM4 y sistema de extinción por gas limpio (FM-200 / Novec).",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "129",
    "codigo": "CASO-129",
    "titulo": "Red de Almacenamiento SAN de Alto Rendimiento con Conmutadores Fibre Channel de 32 Gbps",
    "areaId": "81",
    "areaNombre": "Infraestructura de TI",
    "contenido": "Una entidad hospitalaria requiere renovar el almacenamiento de su sistema PACS de imágenes médicas de alta resolución. Diseñar la topología de almacenamiento SAN en doble tela (Dual Fabric), zonificación dura por WWN (Hard Zoning), multipathing en servidores VMware y sincronización con centro de datos alterno.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "89",
    "codigo": "CASO-089",
    "titulo": "Dimensionamiento de Enlace de Fibra Óptica DWDM para Conectividad Metropolitana",
    "areaId": "80",
    "areaNombre": "Servicios de Telecomunicaciones",
    "contenido": "Cálculo del balance de potencia óptica (Power Budget), dispersión cromática, atenuación por empalmes y selección de amplificadores EDFA.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "122",
    "codigo": "CASO-122",
    "titulo": "Despliegue y Dimensionamiento de Red FTTH (Fiber to the Home) con Tecnología GPON/XGS-PON",
    "areaId": "80",
    "areaNombre": "Servicios de Telecomunicaciones",
    "contenido": "Un operador de telecomunicaciones planifica desplegar fibra óptica hasta el hogar en una nueva zona urbanizada de 10.000 viviendas. El estudiante debe calcular el presupuesto óptico (power budget), diseñar la topología de splitters en cascada (1:8 y 1:16), seleccionar los equipos OLT/ONT y definir la calidad de servicio (QoS) para tráfico de IPTV y voz sobre IP.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "123",
    "codigo": "CASO-123",
    "titulo": "Migración de Telefonía Tradicional TDM hacia Infraestructura de Voz sobre IP (VoIP) con SIP Trunking y SBC",
    "areaId": "80",
    "areaNombre": "Servicios de Telecomunicaciones",
    "contenido": "Una entidad pública con 15 agencias descentralizadas reemplaza su central telefónica analógica por una solución de telefonía IP corporativa. Formular el diseño con redundancia geográfica mediante Session Border Controllers (SBC), códecs adaptativos (G.711 / G.729), y mecanismos de seguridad SRTP y TLS para evitar fraudes por llamadas internacionales.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "124",
    "codigo": "CASO-124",
    "titulo": "Planificación de Enlaces de Microondas Punto a Punto de Alta Capacidad para Zonas Rurales",
    "areaId": "80",
    "areaNombre": "Servicios de Telecomunicaciones",
    "contenido": "Diseño de un enlace microondas de 35 km en la banda de 7 GHz para conectar una población rural a la red troncal nacional. Se requiere calcular el despeje de la zona de Fresnel, considerar el factor de atenuación por lluvia (modelo UIT-R P.530), desvanecimiento multicamino y garantizar una disponibilidad anual del 99.995%.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "10",
    "codigo": "CASO-010",
    "titulo": "Mediación Diplomática en Controversias Fronterizas y Flujos Migratorios",
    "areaId": "6",
    "areaNombre": "Análisis y Gestión de la Resolución de Conflictos",
    "contenido": "Diseño de una mesa técnica de diálogo multilateral con participación de organismos regionales para el tratamiento de cuotas de tránsito y cooperación consular.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "9",
    "codigo": "CASO-009",
    "titulo": "Estrategia de Inserción Arancelaria en el Mercado de la Comunidad Andina (CAN)",
    "areaId": "5",
    "areaNombre": "Comercio y Negocios Internacionales",
    "contenido": "Diseño de la estrategia de aprovechamiento arancelario para la exportación de bienes con valor agregado desde Bolivia bajo normas de origen preferenciales.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "12",
    "codigo": "CASO-012",
    "titulo": "Posicionamiento Estratégico en el Corredor Ferroviario Bioceánico de Integración",
    "areaId": "8",
    "areaNombre": "Diplomacia y Política Exterior de Bolivia",
    "contenido": "Análisis geopolítico y propuesta de negociación bilateral en foros del MERCOSUR y UNASUR para potenciar el rol geoestratégico de Bolivia.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "13",
    "codigo": "CASO-013",
    "titulo": "Gobernanza de Ciberseguridad Internacional y Soberanía Digital en la OEA",
    "areaId": "9",
    "areaNombre": "Gestión Interdisciplinario en Relaciones Internacionales",
    "contenido": "Diseño de protocolo de intercambio de inteligencia sobre ciberamenazas transnacionales y diplomacia digital preventiva.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "11",
    "codigo": "CASO-011",
    "titulo": "Canalización de Fondos Verdes del Clima para Proyectos de Mitigación Amazónica",
    "areaId": "7",
    "areaNombre": "Sostenibilidad y Cooperación",
    "contenido": "Estructuración de marco institucional de cooperación técnica bilateral para el financiamiento no reembolsable en gestión ambiental transfronteriza.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "76",
    "codigo": "CASO-076",
    "titulo": "Implementación de Modelo de Seguridad Zero Trust en Red Corporativa Distribuida",
    "areaId": "68",
    "areaNombre": "Ciberseguridad",
    "contenido": "Políticas de microsegmentación de red, autenticación basada en identidad (mTLS), acceso de privilegios mínimos y monitoreo SIEM.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "77",
    "codigo": "CASO-077",
    "titulo": "Plan Integral de Respuesta a Incidentes de Ransomware y Análisis Forense Digital",
    "areaId": "68",
    "areaNombre": "Ciberseguridad",
    "contenido": "Protocolos de contención inmediata, preservación de cadena de custodia digital de evidencias y reconstrucción del vector de ataque inicial.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "97",
    "codigo": "CASO-097",
    "titulo": "Plan de Respuesta a Incidentes y Recuperación ante Ataque de Ransomware en Infraestructura Bancaria",
    "areaId": "68",
    "areaNombre": "Ciberseguridad",
    "contenido": "Una entidad de intermediación financiera sufre un compromiso de credenciales privilegiadas y cifrado parcial de servidores de archivos. El estudiante debe estructurar el procedimiento de aislamiento de red (air-gap), erradicación de amenazas, análisis forense digital de artefactos volátiles (RAM y logs de Active Directory) y restauración segura basada en backups inmutables.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "98",
    "codigo": "CASO-098",
    "titulo": "Implementación de Modelo Zero Trust (ZTA) y Segmentación de Red en Institución Universitaria",
    "areaId": "68",
    "areaNombre": "Ciberseguridad",
    "contenido": "Una universidad con más de 25.000 usuarios entre estudiantes, docentes y administrativos sufre filtraciones periódicas de exámenes. Se solicita diseñar la arquitectura de confianza cero aplicando autenticación basada en contexto, políticas estrictas de Least Privilege, microsegmentación de subredes VLAN y control de acceso a la red (802.1X).",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "99",
    "codigo": "CASO-099",
    "titulo": "Auditoría de Seguridad Ofensiva (Pentesting) y Análisis Estático de Código (SAST/DAST)",
    "areaId": "68",
    "areaNombre": "Ciberseguridad",
    "contenido": "Una plataforma de banca web presenta vulnerabilidades reportadas por auditoría externa (inyecciones SQL, Broken Object Level Authorization y CORS mal configurado). Formular el plan de mitigación en el pipeline CI/CD integrando SonarQube, OWASP ZAP y pruebas de regresión de seguridad automatizadas.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "100",
    "codigo": "CASO-100",
    "titulo": "Diseño de Centro de Operaciones de Seguridad (SOC) y Reglas de Detección SIEM",
    "areaId": "68",
    "areaNombre": "Ciberseguridad",
    "contenido": "Diseño e implementación de un SOC de nivel 1 y 2 para una cooperativa de ahorro y crédito. Definir las fuentes de ingestión de logs (firewalls NGFW, EDR, servidores web), correlación de eventos con MITRE ATT&CK y automatización de respuestas (SOAR) para mitigar ataques de fuerza bruta y phishing dirigido.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "68",
    "codigo": "CASO-068",
    "titulo": "Arquitectura de Microservicios Resiliente para Plataforma de Pagos en Tiempo Real",
    "areaId": "64",
    "areaNombre": "Desarrollo de Software y Base de Datos",
    "contenido": "Diseño de un backend orientado a eventos con Apache Kafka, patrones Circuit Breaker, Outbox Pattern y base de datos particionada multi-región.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "69",
    "codigo": "CASO-069",
    "titulo": "Diseño de Motor de Transacciones Distribuidas con Consistencia Eventual y Sagas",
    "areaId": "64",
    "areaNombre": "Desarrollo de Software y Base de Datos",
    "contenido": "Implementación del patrón Saga Orquestada para el procesamiento de transacciones financieras entre múltiples entidades bancarias.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "93",
    "codigo": "CASO-093",
    "titulo": "Arquitectura de Microservicios y Transaccionalidad Distribuida en Billetera Móvil",
    "areaId": "64",
    "areaNombre": "Desarrollo de Software y Base de Datos",
    "contenido": "Una fintech nacional experimenta cuellos de botella en su backend monolítico durante campañas promocionales de alta concurrencia. El postulante debe diseñar la transición a una arquitectura orientada a microservicios utilizando el patrón Saga para la orquestación de transferencias interbancarias, garantizando consistencia eventual, idempotencia en endpoints de pago y resiliencia ante fallos con circuit breakers.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "94",
    "codigo": "CASO-094",
    "titulo": "Optimización y Modelado de Base de Datos para Motor de Facturación Masiva Electrónica",
    "areaId": "64",
    "areaNombre": "Desarrollo de Software y Base de Datos",
    "contenido": "Una empresa de retail a nivel nacional requiere emitir más de 200.000 facturas electrónicas diarias conectadas al SIN. Se requiere diseñar el modelo relacional normalizado con particionamiento de tablas por rango temporal (sharding/partitioning), índices compuestos B-Tree y GiST, además de una estrategia de sincronización asíncrona mediante colas de mensajería (RabbitMQ/Kafka) para el almacenamiento de XMLs firmados.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "95",
    "codigo": "CASO-095",
    "titulo": "Plataforma Omnicanal de Gestión Hospitalaria y Expediente Clínico Electrónico (EHR)",
    "areaId": "64",
    "areaNombre": "Desarrollo de Software y Base de Datos",
    "contenido": "Una red de clínicas privadas necesita unificar el expediente clínico de pacientes entre distintas sucursales. El estudiante debe formular el diseño de una API RESTful segura con estándares FHIR/HL7, autenticación federada con OAuth2/OpenID Connect, y almacenamiento cifrado en reposo para datos sensibles de salud conforme a normativas de privacidad.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "96",
    "codigo": "CASO-096",
    "titulo": "Sistema de Trazabilidad Logística en Tiempo Real con Arquitectura Event-Driven",
    "areaId": "64",
    "areaNombre": "Desarrollo de Software y Base de Datos",
    "contenido": "Una empresa de transporte de carga pesada requiere monitorear rutas, paradas y telemetría de 500 camiones en tiempo real. Diseñar la arquitectura orientada a eventos utilizando WebSockets, base de datos temporal (TimescaleDB) y geocercas en Redis para emitir alertas automáticas de desvío de ruta y paradas no autorizadas.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "72",
    "codigo": "CASO-072",
    "titulo": "Diseño de Arquitectura Cloud Híbrida de Alta Disponibilidad con Infraestructura como Código (IaC)",
    "areaId": "66",
    "areaNombre": "Infraestructura de TI",
    "contenido": "Aprovisionamiento de infraestructura con Terraform, clústeres EKS/GKE, mallas de servicios (Istio) y observabilidad integral con Prometheus/Grafana.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "104",
    "codigo": "CASO-104",
    "titulo": "Estrategia de Migración y Modernización hacia Nube Híbrida con Infraestructura como Código (IaC)",
    "areaId": "66",
    "areaNombre": "Infraestructura de TI",
    "contenido": "Una corporación con data center on-premise al 90% de capacidad desea migrar sus cargas críticas a AWS/Azure. Formular el plan de migración utilizando Terraform para el aprovisionamiento automatizado, VPN Site-to-Site redundante, balanceadores de carga y almacenamiento escalable S3/Blob con políticas de ciclo de vida.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "105",
    "codigo": "CASO-105",
    "titulo": "Plan de Continuidad del Negocio (BCP) y Recuperación ante Desastres (DRP) con RTO < 1h y RPO < 15min",
    "areaId": "66",
    "areaNombre": "Infraestructura de TI",
    "contenido": "Un proveedor de servicios de internet y telecomunicaciones requiere certificar su DRP ante la ATT. Diseñar la topología de replicación síncrona/asíncrona entre centros de datos principal y alterno, conmutación automática por fallo (failover DNS Anycast) y matrices de escalamiento de incidentes críticos.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "106",
    "codigo": "CASO-106",
    "titulo": "Orquestación y Virtualización de Alta Disponibilidad para Clústeres de Cómputo Empresarial",
    "areaId": "66",
    "areaNombre": "Infraestructura de TI",
    "contenido": "Implementación de un clúster VMware vSphere / Proxmox VE con almacenamiento compartido SAN por iSCSI. Configurar políticas de High Availability (HA), Distributed Resource Scheduler (DRS), tolerancia a fallos de tarjetas de red (NIC Teaming) y backups incrementales sintéticos con deduplicación.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "70",
    "codigo": "CASO-070",
    "titulo": "Pipeline CI/CD DevSecOps con Pruebas Automatizadas y Escaneo de Vulnerabilidades SAST/DAST",
    "areaId": "65",
    "areaNombre": "Ingeniería y Calidad de Software",
    "contenido": "Configuración de pipelines en GitLab CI/GitHub Actions, pruebas unitarias, de integración, cobertura de código y despliegue continuo Blue/Green en Kubernetes.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "71",
    "codigo": "CASO-071",
    "titulo": "Estrategia Integral de Pruebas de Carga y Rendimiento para Arquitecturas Cloud-Native",
    "areaId": "65",
    "areaNombre": "Ingeniería y Calidad de Software",
    "contenido": "Diseño y ejecución de pruebas de estrés con k6/JMeter, análisis de cuellos de botella en memoria/CPU y autoscaling horizontal (HPA).",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "101",
    "codigo": "CASO-101",
    "titulo": "Diseño de Pipeline de Entrega Continua (CI/CD) con Estrategia de Despliegue Blue-Green y Canario",
    "areaId": "65",
    "areaNombre": "Ingeniería y Calidad de Software",
    "contenido": "Una empresa de software SaaS experimenta caídas del servicio durante despliegues en producción. El postulante debe diseñar una infraestructura de entrega continua en Kubernetes, incorporando pruebas automatizadas unitarias, de integración y rendimiento (JMeter), con rollbacks automáticos ante aumento de errores HTTP 5xx.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "102",
    "codigo": "CASO-102",
    "titulo": "Modernización de Deuda Técnica y Refactorización a Patrones de Diseño Limpio (Hexagonal / Clean Architecture)",
    "areaId": "65",
    "areaNombre": "Ingeniería y Calidad de Software",
    "contenido": "Un software ERP legacy de 10 años escrito en PHP carece de pruebas automatizadas y presenta alto acoplamiento en la capa de datos. Estructure la estrategia de estrangulación del monolito (Strangler Fig Pattern) hacia una arquitectura limpia hexagonal con Domain-Driven Design (DDD), pruebas con mocks y linters estrictos.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "103",
    "codigo": "CASO-103",
    "titulo": "Marco de Aseguramiento de Calidad de Software (QA) para Sistema Crítico de Telemedicina",
    "areaId": "65",
    "areaNombre": "Ingeniería y Calidad de Software",
    "contenido": "Diseñar el plan maestro de pruebas (PMP) bajo norma ISO/IEC/IEEE 29119 para una aplicación de asistencia médica remota. Se debe definir la pirámide de pruebas, métricas de cobertura de código (>80%), pruebas de estrés de llamadas WebRTC y pruebas de accesibilidad web WCAG 2.1 AA.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "74",
    "codigo": "CASO-074",
    "titulo": "Sistema de Detección Temprana de Fraude Transaccional con Modelos de Machine Learning",
    "areaId": "67",
    "areaNombre": "Inteligencia Artificial",
    "contenido": "Tratamiento de datasets altamente desbalanceados, entrenamiento de modelos Random Forest / XGBoost y despliegue del endpoint de inferencia con baja latencia.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "75",
    "codigo": "CASO-075",
    "titulo": "Implementación de Agente Inteligente RAG (Retrieval-Augmented Generation) para Asistencia Académica",
    "areaId": "67",
    "areaNombre": "Inteligencia Artificial",
    "contenido": "Pipeline de indexación vectorial, embeddings semánticos, orquestación de prompts con LLMs y mitigación de alucinaciones.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "107",
    "codigo": "CASO-107",
    "titulo": "Sistema Predictivo de Calificación Crediticia (Credit Scoring) con Machine Learning Explicable (XAI)",
    "areaId": "67",
    "areaNombre": "Inteligencia Artificial",
    "contenido": "Una entidad financiera desea reducir el índice de morosidad mediante un modelo de clasificación supervisada (XGBoost / Random Forest). El postulante debe estructurar la preparación del dataset, balanceo de clases (SMOTE), validación cruzada y la interpretación de decisiones crediticias mediante valores SHAP para cumplir con la regulación financiera.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  },
  {
    "id": "108",
    "codigo": "CASO-108",
    "titulo": "Asistente Virtual Institucional con Arquitectura RAG (Retrieval-Augmented Generation) y Embeddings Vectoriales",
    "areaId": "67",
    "areaNombre": "Inteligencia Artificial",
    "contenido": "Diseño de un agente conversacional para soporte a estudiantes sobre trámites de titulación y reglamentos. Implementar un pipeline de ingestión documental, fragmentación de textos (chunking), generación de embeddings con base de datos vectorial (pgvector / Qdrant) y controles de seguridad (prompt injection y alucinaciones).",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#121316"
  },
  {
    "id": "109",
    "codigo": "CASO-109",
    "titulo": "Detección Automatizada de Fraude en Transacciones Financieras con Redes Neuronales y Grafos",
    "areaId": "67",
    "areaNombre": "Inteligencia Artificial",
    "contenido": "Detección de patrones anómalos de lavado de dinero y transferencias fraccionadas (pitufeo). El postulante debe modelar las cuentas y transacciones como un grafo de conocimiento, aplicando Graph Neural Networks (GNN) y algoritmos de clustering para identificar comunidades fraudulentas en tiempo cuasi-real.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#1E293B"
  },
  {
    "id": "56",
    "codigo": "CASO-056",
    "titulo": "Estrategias de Comercialización Digital y Revenue Management para Agencias de Viaje Online",
    "areaId": "52",
    "areaNombre": "Desarrollo de Negocios",
    "contenido": "Fijación dinámica de tarifas según estacionalidad, integración con GDS (Amadeus/Sabre) y optimización de canales directos.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#821528"
  },
  {
    "id": "54",
    "codigo": "CASO-054",
    "titulo": "Plan Maestro de Desarrollo Turístico Sostenible en Destino Patrimonial",
    "areaId": "50",
    "areaNombre": "Dirección Estratégica",
    "contenido": "Evaluación de capacidad de carga turística, preservación de patrimonio tangible e integración de comunidades receptoras.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#047857"
  },
  {
    "id": "57",
    "codigo": "CASO-057",
    "titulo": "Protocolo de Seguridad y Gestión de Riesgos en Turismo de Aventura",
    "areaId": "53",
    "areaNombre": "Empresas Prestadoras de Servicios Turísticos",
    "contenido": "Certificaciones internacionales, planes de contingencia ante desastres naturales y seguros de responsabilidad civil turística.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#B45309"
  },
  {
    "id": "53",
    "codigo": "CASO-053",
    "titulo": "Gestión de Calidad en el Servicio Hotelero y Estandarización de Procesos Operativos",
    "areaId": "49",
    "areaNombre": "Gerencia Contemporánea",
    "contenido": "Auditoría de estándares de atención al huésped, gestión de quejas y diseño del ciclo del servicio en cadenas hoteleras.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#C8102E"
  },
  {
    "id": "55",
    "codigo": "CASO-055",
    "titulo": "Diseño de Rutas de Ecoturismo y Turismo Comunitario en Áreas Protegidas",
    "areaId": "51",
    "areaNombre": "Gestión y Desarrollo de la Actividad Turística",
    "contenido": "Estructuración de paquetes turísticos temáticos, guías de interpretación ambiental y plan de manejo de impactos.",
    "usosActuales": 0,
    "maxUsos": 2,
    "plazoHoras": 48,
    "color": "#9E1B32"
  }
];
