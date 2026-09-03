/**
 * Matriz Oficial de Áreas para Sorteo y Plazos de Resolución - UTEPSA
 * Modalidad: Examen de Grado
 *
 * Principios aplicados:
 * - Single Responsibility Principle (SRP): Fuente única de verdad del catálogo académico UTEPSA.
 * - Inmutabilidad (Readonly / as const): Previene mutaciones no intencionadas durante el seed.
 */

export interface AreaOficialDef {
  readonly nombre: string;
  readonly umbralDisponibilidad?: number;
  readonly casosEjemplo: readonly {
    readonly titulo: string;
    readonly contenido: string;
  }[];
}

export type UnidadPlazo = 'HORAS' | 'DIAS_CALENDARIO';
export type ModalidadSorteo = 'SEPARADO_DIA_DEFENSA' | 'ANTICIPADO_CONJUNTO';

export interface PlazoReglamentarioDef {
  readonly modalidad: ModalidadSorteo;
  readonly anticipacionSorteoAreaDias: number;
  readonly plazoResolucionValor: number;
  readonly plazoResolucionUnidad: UnidadPlazo;
  readonly descripcionRegla: string;
}

export interface CarreraOficialDef {
  readonly nombre: string;
  readonly codigo?: string;
  readonly plazoReglamentario: PlazoReglamentarioDef;
  readonly areas: readonly AreaOficialDef[];
}

export interface FacultadOficialDef {
  readonly nombre: string;
  readonly sigla: string;
  readonly carreras: readonly CarreraOficialDef[];
}

export const CATALOGO_OFICIAL_UTEPSA: readonly FacultadOficialDef[] = [
  // =========================================================================
  // 1. FACULTAD DE CIENCIAS JURÍDICAS Y SOCIALES (FCJS)
  // =========================================================================
  {
    nombre: 'Facultad de Ciencias Jurídicas y Sociales (FCJS)',
    sigla: 'FCJS',
    carreras: [
      {
        nombre: 'Derecho',
        codigo: 'DER',
        plazoReglamentario: {
          modalidad: 'SEPARADO_DIA_DEFENSA',
          anticipacionSorteoAreaDias: 5,
          plazoResolucionValor: 1,
          plazoResolucionUnidad: 'HORAS',
          descripcionRegla: 'Sorteo de Área 5 días antes; Asignación de Caso el mismo día (1 h de preparación previa)',
        },
        areas: [
          {
            nombre: 'Derecho Civil',
            umbralDisponibilidad: 2,
            casosEjemplo: [
              {
                titulo: 'Acción Reivindicatoria y Tercería de Dominio Excluyente sobre Inmueble Urbano',
                contenido: 'Analizar la controversia de doble matriculación de derechos reales respecto a un inmueble en Santa Cruz de la Sierra. El postulante debe sustentar la excepción perentoria de prescripción adquisitiva y la preferencia registral conforme al Código Civil boliviano.',
              },
              {
                titulo: 'Resolución de Contrato de Compraventa por Incumplimiento Voluntario y Resarcimiento de Daños',
                contenido: 'Contrato preliminar de compraventa de bien inmueble con arras confirmatorias. El comprador incumple el saldo final alegando vicios ocultos de gravamen hipotecario no saneado. Fundamente la demanda de cumplimiento o resolución contractual.',
              },
            ],
          },
          {
            nombre: 'Derecho Penal',
            umbralDisponibilidad: 2,
            casosEjemplo: [
              {
                titulo: 'Teoría del Delito y Juicio de Tipicidad en Delitos Contra el Patrimonio y Estafa Agravada',
                contenido: 'Imputación formal por el tipo penal de Estafa con agravante de víctimas múltiples en una operación de intermediación bursátil informal. Desarrolle la teoría del caso de la defensa técnica abordando el dolo antecedente y la tipicidad conglobante.',
              },
              {
                titulo: 'Exclusión Probatoria y Legítima Defensa en Delito de Homicidio en Riña',
                contenido: 'Planteamiento de excepción incidental de nulidad de elementos probatorios obtenidos sin control jurisdiccional y fundamentación dogmática de causa de justificación por legítima defensa proporcional.',
              },
            ],
          },
          {
            nombre: 'Derecho Comercial',
            umbralDisponibilidad: 2,
            casosEjemplo: [
              {
                titulo: 'Disolución y Liquidación Judicial de Sociedad de Responsabilidad Limitada por Imposibilidad Sobreviviente',
                contenido: 'Conflicto societario de una S.R.L. con parálisis orgánica en asambleas de socios por empate en cuotas de capital. Estructure el procedimiento legal de disolución, balance final de liquidación y prelación de acreedores comerciales.',
              },
              {
                titulo: 'Ejecución Coactiva de Título Valor (Pagaré Notarial) y Excepciones Cambiarias',
                contenido: 'Cobro de título valor con cláusula de vencimiento anticipado y cesión de crédito bancario. Diseñe el memorial de excepciones de falsedad material y prescripción de la acción ejecutiva.',
              },
            ],
          },
          {
            nombre: 'Derecho Constitucional',
            umbralDisponibilidad: 2,
            casosEjemplo: [
              {
                titulo: 'Acción de Amparo Constitucional por Vulneración del Debido Proceso en Proceso Disciplinario',
                contenido: 'Funcionario público destituido en sede administrativa sin notificación formal del pliego de cargos. Formule la acción tutelar invocando la jurisprudencia vinculante del Tribunal Constitucional Plurinacional.',
              },
              {
                titulo: 'Acción de Libertad por Detención Preventiva Irrazonable e Inobservancia del Plazo Legal',
                contenido: 'Privación de libertad prolongada por dilación injustificada atribuible al órgano judicial y fiscalía. Fundamente la tutela inmediata de la libertad física y el cese de medidas cautelares gravosas.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Relaciones Internacionales',
        codigo: 'RII',
        plazoReglamentario: {
          modalidad: 'SEPARADO_DIA_DEFENSA',
          anticipacionSorteoAreaDias: 5,
          plazoResolucionValor: 1,
          plazoResolucionUnidad: 'HORAS',
          descripcionRegla: 'Sorteo de Área 5 días antes; Asignación de Caso el mismo día (1 h de preparación previa)',
        },
        areas: [
          {
            nombre: 'Comercio y Negocios Internacionales',
            casosEjemplo: [
              {
                titulo: 'Estrategia de Inserción Arancelaria en el Mercado de la Comunidad Andina (CAN)',
                contenido: 'Diseño de la estrategia de aprovechamiento arancelario para la exportación de bienes con valor agregado desde Bolivia bajo normas de origen preferenciales.',
              },
            ],
          },
          {
            nombre: 'Análisis y Gestión de la Resolución de Conflictos',
            casosEjemplo: [
              {
                titulo: 'Mediación Diplomática en Controversias Fronterizas y Flujos Migratorios',
                contenido: 'Diseño de una mesa técnica de diálogo multilateral con participación de organismos regionales para el tratamiento de cuotas de tránsito y cooperación consular.',
              },
            ],
          },
          {
            nombre: 'Sostenibilidad y Cooperación',
            casosEjemplo: [
              {
                titulo: 'Canalización de Fondos Verdes del Clima para Proyectos de Mitigación Amazónica',
                contenido: 'Estructuración de marco institucional de cooperación técnica bilateral para el financiamiento no reembolsable en gestión ambiental transfronteriza.',
              },
            ],
          },
          {
            nombre: 'Diplomacia y Política Exterior de Bolivia',
            casosEjemplo: [
              {
                titulo: 'Posicionamiento Estratégico en el Corredor Ferroviario Bioceánico de Integración',
                contenido: 'Análisis geopolítico y propuesta de negociación bilateral en foros del MERCOSUR y UNASUR para potenciar el rol geoestratégico de Bolivia.',
              },
            ],
          },
          {
            nombre: 'Gestión Interdisciplinario en Relaciones Internacionales',
            casosEjemplo: [
              {
                titulo: 'Gobernanza de Ciberseguridad Internacional y Soberanía Digital en la OEA',
                contenido: 'Diseño de protocolo de intercambio de inteligencia sobre ciberamenazas transnacionales y diplomacia digital preventiva.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Psicología',
        codigo: 'PSI',
        plazoReglamentario: {
          modalidad: 'ANTICIPADO_CONJUNTO',
          anticipacionSorteoAreaDias: 10,
          plazoResolucionValor: 10,
          plazoResolucionUnidad: 'DIAS_CALENDARIO',
          descripcionRegla: 'Sorteo de Área y Caso simultáneo (10 días calendario de preparación previa)',
        },
        areas: [
          {
            nombre: 'Psicología Comunitaria',
            casosEjemplo: [
              {
                titulo: 'Diagnóstico Participativo e Intervención Psicosocial en Poblaciones Vulnerables',
                contenido: 'Desarrollo de un programa de resiliencia comunitaria y prevención de factores de riesgo psicosocial en barrios periurbanos.',
              },
            ],
          },
          {
            nombre: 'Psicología Clínica',
            casosEjemplo: [
              {
                titulo: 'Plan Terapéutico Cognitivo-Conductual para Trastorno de Ansiedad Generalizada',
                contenido: 'Evaluación psicométrica, formulación clínica de caso y diseño de protocolo de reestructuración cognitiva y desensibilización.',
              },
            ],
          },
          {
            nombre: 'Psicología Forense',
            casosEjemplo: [
              {
                titulo: 'Peritaje Psicológico Forense en Casos de Violencia Intrafamiliar y Credibilidad de Testimonio',
                contenido: 'Aplicación de protocolos estandarizados (SVA/CBCA) y dictamen pericial forense para valoración del daño psíquico ante juzgados de familia.',
              },
            ],
          },
          {
            nombre: 'Psicología Educativa',
            casosEjemplo: [
              {
                titulo: 'Adaptaciones Curriculares y Apoyo Psicoeducativo en Dificultades Específicas del Aprendizaje (DEA)',
                contenido: 'Diseño de un plan de intervención psicopedagógica multidisciplinario para estudiantes con TDAH y dislexia en nivel secundario.',
              },
            ],
          },
          {
            nombre: 'Psicología Organizacional',
            casosEjemplo: [
              {
                titulo: 'Evaluación del Clima Laboral y Prevención del Síndrome de Burnout en Personal de Salud',
                contenido: 'Medición con batería de Maslach, análisis de factores de riesgo psicosocial en el trabajo y plan corporativo de bienestar organizacional.',
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 2. FACULTAD DE CIENCIAS EMPRESARIALES (FCE)
  // =========================================================================
  {
    nombre: 'Facultad de Ciencias Empresariales (FCE)',
    sigla: 'FCE',
    carreras: [
      {
        nombre: 'Administración General',
        codigo: 'ADM',
        plazoReglamentario: {
          modalidad: 'SEPARADO_DIA_DEFENSA',
          anticipacionSorteoAreaDias: 5,
          plazoResolucionValor: 1,
          plazoResolucionUnidad: 'HORAS',
          descripcionRegla: 'Sorteo de Área 5 días antes; Asignación de Caso el mismo día (1 h de preparación previa)',
        },
        areas: [
          {
            nombre: 'Gerencia Contemporánea',
            casosEjemplo: [
              {
                titulo: 'Transformación del Modelo de Liderazgo y Cultura Organizacional en Fusión Corporativa',
                contenido: 'Plan de gestión del cambio para homologar culturas organizacionales divergentes y retener talento clave post-adquisición.',
              },
            ],
          },
          {
            nombre: 'Gestión de Talento Humano',
            casosEjemplo: [
              {
                titulo: 'Diseño de Sistema de Gestión por Competencias y Evaluación del Desempeño 360°',
                contenido: 'Definición del diccionario de competencias organizacionales, matrices de evaluación y planes de carrera con compensación variable.',
              },
            ],
          },
          {
            nombre: 'Desarrollo de Negocios',
            casosEjemplo: [
              {
                titulo: 'Plan de Negocios para Apertura de Nueva Línea de Servicios Logísticos B2B',
                contenido: 'Validación del lienzo Lean Canvas, análisis de factibilidad de mercado, proyección de ventas y punto de equilibrio operativo.',
              },
            ],
          },
          {
            nombre: 'Decisiones Financiera de Inversiones',
            casosEjemplo: [
              {
                titulo: 'Evaluación de Proyecto de Expansión de Capacidad Instalada con Flujos Descontados',
                contenido: 'Cálculo de VAN, TIR, Payback descontado y análisis de sensibilidad de tasa de descuento ante volatilidad macroeconómica.',
              },
            ],
          },
          {
            nombre: 'Dirección Estratégica',
            casosEjemplo: [
              {
                titulo: 'Formulación e Implantación de Cuadro de Mando Integral (Balanced Scorecard)',
                contenido: 'Mapa estratégico con cuatro perspectivas (financiera, clientes, procesos, aprendizaje) e indicadores KPI con metas operativas.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Comunicación Estratégica y Digital',
        codigo: 'CED',
        plazoReglamentario: {
          modalidad: 'SEPARADO_DIA_DEFENSA',
          anticipacionSorteoAreaDias: 5,
          plazoResolucionValor: 1,
          plazoResolucionUnidad: 'HORAS',
          descripcionRegla: 'Sorteo de Área 5 días antes; Asignación de Caso el mismo día (1 h de preparación previa)',
        },
        areas: [
          {
            nombre: 'Fundamentos de Comunicación',
            casosEjemplo: [
              {
                titulo: 'Auditoría de Comunicación Interna y Plan de Relacionamiento Institucional',
                contenido: 'Diagnóstico de barreras comunicativas en mandos medios y propuesta de canales institucionales bidireccionales.',
              },
            ],
          },
          {
            nombre: 'Periodismo Corporativo y Digital',
            casosEjemplo: [
              {
                titulo: 'Estrategia de Storytelling Transmedia para Posicionamiento de Responsabilidad Social',
                contenido: 'Producción de contenidos periodísticos de impacto para boletines, salas de prensa virtuales y cobertura en medios digitales.',
              },
            ],
          },
          {
            nombre: 'Publicidad y Merchandising',
            casosEjemplo: [
              {
                titulo: 'Campaña Publicitaria 360° para Lanzamiento de Marca Juvenil en Puntos de Venta',
                contenido: 'Concepto creativo, selección del mix de medios (ATL, BTL) y diseño de exhibidores y material POP interactivo.',
              },
            ],
          },
          {
            nombre: 'Producción Audiovisual',
            casosEjemplo: [
              {
                titulo: 'Guion, Realización y Plan de Rodaje de Spot Institucional en Plataformas de Streaming',
                contenido: 'Storyboard, diseño técnico de producción, escaleta y optimización de formatos de video vertical para redes sociales.',
              },
            ],
          },
          {
            nombre: 'Comunicación Estratégica y Digital',
            casosEjemplo: [
              {
                titulo: 'Plan de Manejo de Crisis de Reputación Online en Medios Sociales',
                contenido: 'Matriz de riesgos comunicacionales, protocolo de contención, manual de voceros y monitoreo de sentimiento en tiempo real.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Ingeniería Comercial',
        codigo: 'ICO',
        plazoReglamentario: {
          modalidad: 'SEPARADO_DIA_DEFENSA',
          anticipacionSorteoAreaDias: 5,
          plazoResolucionValor: 1,
          plazoResolucionUnidad: 'HORAS',
          descripcionRegla: 'Sorteo de Área 5 días antes; Asignación de Caso el mismo día (1 h de preparación previa)',
        },
        areas: [
          {
            nombre: 'Investigación y Análisis de Mercado Empresarial',
            casosEjemplo: [
              {
                titulo: 'Estudio Cuantitativo de Elasticidad Precio de la Demanda en Consumo Masivo',
                contenido: 'Muestreo estratificado, tabulación estadística de disposición a pagar y recomendaciones de fijación de precios competitivos.',
              },
            ],
          },
          {
            nombre: 'Dirección Estratégica',
            casosEjemplo: [
              {
                titulo: 'Estrategia de Crecimiento Intensivo y Penetración de Mercado frente a Nuevos Competidores',
                contenido: 'Matriz Ansoff, análisis de ventajas competitivas según modelo de Porter y plan de contingencia comercial.',
              },
            ],
          },
          {
            nombre: 'Marketing Estratégico e Innovación',
            casosEjemplo: [
              {
                titulo: 'Desarrollo de Oferta de Valor Basada en Servicios y Experiencia del Cliente (CX)',
                contenido: 'Customer Journey Map, identificación de puntos de dolor y rediseño de servicios postventa fidelizantes.',
              },
            ],
          },
          {
            nombre: 'Gestión Comercial',
            casosEjemplo: [
              {
                titulo: 'Optimización del Funnel de Ventas B2B y Estructuración de Cuotas de Venta',
                contenido: 'Diseño del proceso comercial, automatización de prospección en CRM y esquema de comisiones por metas escalonadas.',
              },
            ],
          },
          {
            nombre: 'Gestión Emprendedora',
            casosEjemplo: [
              {
                titulo: 'Validación de Modelo de Negocio Startup con Metodología Lean Startup',
                contenido: 'Definición de Producto Mínimo Viable (MVP), métricas pirata (AARRR) y cálculo de CAC (Costo de Adquisición) vs LTV (Valor de Vida).',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Marketing y Publicidad',
        codigo: 'MKP',
        plazoReglamentario: {
          modalidad: 'SEPARADO_DIA_DEFENSA',
          anticipacionSorteoAreaDias: 5,
          plazoResolucionValor: 1,
          plazoResolucionUnidad: 'HORAS',
          descripcionRegla: 'Sorteo de Área 5 días antes; Asignación de Caso el mismo día (1 h de preparación previa)',
        },
        areas: [
          {
            nombre: 'Investigación y Análisis de Mercados',
            casosEjemplo: [
              {
                titulo: 'Estudio de Hábitos de Consumo Digital y Comportamiento del Consumidor Z',
                contenido: 'Técnicas de investigación mixta, Focus Groups virtuales y segmentación psicográfica avanzada.',
              },
            ],
          },
          {
            nombre: 'Plan de Marketing',
            casosEjemplo: [
              {
                titulo: 'Formulación del Plan Anual de Marketing con Presupuesto Base Cero',
                contenido: 'Definición de objetivos SMART, estrategias de producto, precio, plaza y promoción con cronograma Gantt.',
              },
            ],
          },
          {
            nombre: 'Publicidad y Merchandising',
            casosEjemplo: [
              {
                titulo: 'Campaña de Branding Emocional y Trade Marketing en Canal Tradicional',
                contenido: 'Diseño de promociones comerciales, activación de marca en ferias y arquitectura visual en anaquel.',
              },
            ],
          },
          {
            nombre: 'Marketing Digital',
            casosEjemplo: [
              {
                titulo: 'Estrategia de Inbound Marketing, Lead Nurturing y Campañas Performance (SEM/Social Ads)',
                contenido: 'Configuración de pauta publicitaria en Google Ads / Meta Ads, cálculo de ROAS y automatización de correos.',
              },
            ],
          },
          {
            nombre: 'Métricas de Marketing e Insights',
            casosEjemplo: [
              {
                titulo: 'Dashboard de Rendimiento Omnicanal y Atribución Multitáctil de Conversiones',
                contenido: 'Modelos de atribución lineal vs primer clic, análisis de cohortes de retención y reporte de ROI de marketing.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Ingeniería Financiera',
        codigo: 'IFI',
        plazoReglamentario: {
          modalidad: 'SEPARADO_DIA_DEFENSA',
          anticipacionSorteoAreaDias: 5,
          plazoResolucionValor: 1,
          plazoResolucionUnidad: 'HORAS',
          descripcionRegla: 'Sorteo de Área 5 días antes; Asignación de Caso el mismo día (1 h de preparación previa)',
        },
        areas: [
          {
            nombre: 'Fundamentos y Análisis Financiero Operativos',
            casosEjemplo: [
              {
                titulo: 'Diagnóstico Económico-Financiero Integral Mediante Análisis DuPont y Razones de Liquidez',
                contenido: 'Evaluación del margen de utilidad neta, rotación de activos y apalancamiento financiero en empresas del sector retail.',
              },
            ],
          },
          {
            nombre: 'Gestión Financiera a Corto Plazo',
            casosEjemplo: [
              {
                titulo: 'Optimización del Capital de Trabajo Neto y Ciclo de Conversión de Efectivo',
                contenido: 'Políticas de cobranza, gestión óptima de inventarios con modelo EOQ y negociación de financiamiento espontáneo de proveedores.',
              },
            ],
          },
          {
            nombre: 'Finanzas Largo Plazo',
            casosEjemplo: [
              {
                titulo: 'Determinación de la Estructura Óptima de Capital y Costo Promedio Ponderado (WACC)',
                contenido: 'Modelación de teorema de Modigliani-Miller con impuestos y estimación del costo del patrimonio mediante CAPM.',
              },
            ],
          },
          {
            nombre: 'Valoración de Empresas',
            casosEjemplo: [
              {
                titulo: 'Valoración Corporativa por Flujo de Caja Libre Descontado (DCF) y Múltiplos Comparables',
                contenido: 'Proyección de estados financieros a 5 años, valor terminal perpetuo y análisis de sensibilidad de múltiplos EBITDA.',
              },
            ],
          },
          {
            nombre: 'Modelación Financiera',
            casosEjemplo: [
              {
                titulo: 'Simulación Montecarlo para Medición del Valor en Riesgo (VaR) de Portafolios de Inversión',
                contenido: 'Programación de escenarios estocásticos para cuantificar pérdidas máximas tolerables con 95% y 99% de confianza.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Contaduría Pública',
        codigo: 'CPA',
        plazoReglamentario: {
          modalidad: 'SEPARADO_DIA_DEFENSA',
          anticipacionSorteoAreaDias: 5,
          plazoResolucionValor: 1,
          plazoResolucionUnidad: 'HORAS',
          descripcionRegla: 'Sorteo de Área 5 días antes; Asignación de Caso el mismo día (1 h de preparación previa)',
        },
        areas: [
          {
            nombre: 'Contabilidad General',
            casosEjemplo: [
              {
                titulo: 'Elaboración y Revelación de Estados Financieros bajo Normas de Contabilidad Bolivianas y NIIF',
                contenido: 'Ajustes contables por inflación y tenencia de bienes (AITB), depreciación por unidades producidas y presentación de notas a los EEFF.',
              },
            ],
          },
          {
            nombre: 'Contabilidad de Costos',
            casosEjemplo: [
              {
                titulo: 'Implementación del Sistema de Costeo Basado en Actividades (ABC) en Planta de Manufactura',
                contenido: 'Identificación de generadores de costos (cost drivers), distribución de costos indirectos de fabricación y costeo por órdenes específicas.',
              },
            ],
          },
          {
            nombre: 'Administración Financiera',
            casosEjemplo: [
              {
                titulo: 'Presupuesto Maestro y Control Presupuestario de Desviaciones en Costos Estándar',
                contenido: 'Presupuesto operativo y financiero, análisis de variaciones de precio y eficiencia en mano de obra y materia prima.',
              },
            ],
          },
          {
            nombre: 'Auditoría Financiera',
            casosEjemplo: [
              {
                titulo: 'Planificación de Auditoría Financiera Externa y Evaluación de Control Interno (COSO)',
                contenido: 'Determinación de la materialidad de planeación, pruebas sustantivas de detalle y emisión del informe de auditoría independiente.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Comercio Internacional',
        codigo: 'CIN',
        plazoReglamentario: {
          modalidad: 'SEPARADO_DIA_DEFENSA',
          anticipacionSorteoAreaDias: 5,
          plazoResolucionValor: 1,
          plazoResolucionUnidad: 'HORAS',
          descripcionRegla: 'Sorteo de Área 5 días antes; Asignación de Caso el mismo día (1 h de preparación previa)',
        },
        areas: [
          {
            nombre: 'Comercio y Negocios Internacionales',
            casosEjemplo: [
              {
                titulo: 'Selección de Incoterms 2020 y Cobertura Cambiaria en Contratos de Exportación a la Unión Europea',
                contenido: 'Análisis de costos y riesgos de entrega entre FOB, CIF y DDP, evaluando instrumentos de pago seguro como Carta de Crédito irrevocable.',
              },
            ],
          },
          {
            nombre: 'Gestión Aduanera',
            casosEjemplo: [
              {
                titulo: 'Procedimiento de Despacho Aduanero de Importación a Consumo y Clasificación Arancelaria',
                contenido: 'Asignación de partida arancelaria en nomenclatura NANDINA, valoración aduanera según acuerdo OMC y liquidación de tributos (GA, IVA, ICE).',
              },
            ],
          },
          {
            nombre: 'Internacionalización de la Empresa',
            casosEjemplo: [
              {
                titulo: 'Estrategia de Entrada al Mercado Asiático Mediante Alianza Estratégica (Joint Venture)',
                contenido: 'Evaluación de barreras no arancelarias, adaptación de empaque y etiquetado y selección de socios comerciales locales.',
              },
            ],
          },
          {
            nombre: 'Logística y Distribución Física Internacional',
            casosEjemplo: [
              {
                titulo: 'Ruteo Multimodal y Consolidación de Carga Refrigerada en Contenedores Reefer',
                contenido: 'Diseño de la cadena de frío, contratación de fletes marítimos/terrestres y cálculo de costos de bodegaje en puertos de tránsito.',
              },
            ],
          },
          {
            nombre: 'Workshop Avanzado en Comercio y Negocios Internacionales',
            casosEjemplo: [
              {
                titulo: 'Simulación de Negociación Comercial Internacional para Resolución de Disputas de Embarque',
                contenido: 'Manejo de reclamos por demoras de transporte internacional, pólizas de seguro de carga y arbitraje comercial de la CCI.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Turismo',
        codigo: 'TUR',
        plazoReglamentario: {
          modalidad: 'SEPARADO_DIA_DEFENSA',
          anticipacionSorteoAreaDias: 5,
          plazoResolucionValor: 1,
          plazoResolucionUnidad: 'HORAS',
          descripcionRegla: 'Sorteo de Área 5 días antes; Asignación de Caso el mismo día (1 h de preparación previa)',
        },
        areas: [
          {
            nombre: 'Gerencia Contemporánea',
            casosEjemplo: [
              {
                titulo: 'Gestión de Calidad en el Servicio Hotelero y Estandarización de Procesos Operativos',
                contenido: 'Auditoría de estándares de atención al huésped, gestión de quejas y diseño del ciclo del servicio en cadenas hoteleras.',
              },
            ],
          },
          {
            nombre: 'Dirección Estratégica',
            casosEjemplo: [
              {
                titulo: 'Plan Maestro de Desarrollo Turístico Sostenible en Destino Patrimonial',
                contenido: 'Evaluación de capacidad de carga turística, preservación de patrimonio tangible e integración de comunidades receptoras.',
              },
            ],
          },
          {
            nombre: 'Gestión y Desarrollo de la Actividad Turística',
            casosEjemplo: [
              {
                titulo: 'Diseño de Rutas de Ecoturismo y Turismo Comunitario en Áreas Protegidas',
                contenido: 'Estructuración de paquetes turísticos temáticos, guías de interpretación ambiental y plan de manejo de impactos.',
              },
            ],
          },
          {
            nombre: 'Desarrollo de Negocios',
            casosEjemplo: [
              {
                titulo: 'Estrategias de Comercialización Digital y Revenue Management para Agencias de Viaje Online',
                contenido: 'Fijación dinámica de tarifas según estacionalidad, integración con GDS (Amadeus/Sabre) y optimización de canales directos.',
              },
            ],
          },
          {
            nombre: 'Empresas Prestadoras de Servicios Turísticos',
            casosEjemplo: [
              {
                titulo: 'Protocolo de Seguridad y Gestión de Riesgos en Turismo de Aventura',
                contenido: 'Certificaciones internacionales, planes de contingencia ante desastres naturales y seguros de responsabilidad civil turística.',
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 3. FACULTAD DE CIENCIA Y TECNOLOGÍA (FCT)
  // =========================================================================
  {
    nombre: 'Facultad de Ciencia y Tecnología (FCT)',
    sigla: 'FCT',
    carreras: [
      {
        nombre: 'Industrial y Comercial',
        codigo: 'IND',
        plazoReglamentario: {
          modalidad: 'ANTICIPADO_CONJUNTO',
          anticipacionSorteoAreaDias: 5,
          plazoResolucionValor: 5,
          plazoResolucionUnidad: 'DIAS_CALENDARIO',
          descripcionRegla: 'Sorteo de Área y Caso simultáneo (5 días calendario de preparación previa)',
        },
        areas: [
          {
            nombre: 'Apoyo Técnico 1',
            casosEjemplo: [
              {
                titulo: 'Estudio de Tiempos y Movimientos para Eliminación de Cuellos de Botella en Línea de Envasado',
                contenido: 'Diagrama bimanual, cálculo del tiempo estándar y balanceo de línea de producción para aumentar la eficiencia global de equipos (OEE).',
              },
            ],
          },
          {
            nombre: 'Apoyo Técnico 2',
            casosEjemplo: [
              {
                titulo: 'Diseño de Instalaciones Industriales (Layout) y Seguridad y Salud en el Trabajo (ISO 45001)',
                contenido: 'Distribución en planta mediante el método SLP (Systematic Layout Planning) y matriz de identificación de peligros y evaluación de riesgos (IPER).',
              },
            ],
          },
          {
            nombre: 'Producción',
            casosEjemplo: [
              {
                titulo: 'Planificación y Control de la Producción con Sistema MRP II y Filosofía Lean Manufacturing',
                contenido: 'Plan Maestro de Producción (MPS), lista de materiales (BOM) y aplicación de herramientas 5S y Kanban para reducción de desperdicios.',
              },
            ],
          },
          {
            nombre: 'Evaluación Financiera de Proyectos 1',
            casosEjemplo: [
              {
                titulo: 'Formulación y Evaluación Técnica de Planta Procesadora de Alimentos',
                contenido: 'Estudio de localización por método de factores ponderados, balance de materia y energía y dimensionamiento de maquinaria.',
              },
            ],
          },
          {
            nombre: 'Evaluación Financiera de Proyectos 2',
            casosEjemplo: [
              {
                titulo: 'Evaluación Económico-Financiera de Inversión Industrial con Apalancamiento Bancario',
                contenido: 'Flujo de caja del accionista, cálculo del WACC del proyecto, indicadores de rentabilidad (VAN, TIR) y punto de cierre operativo.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Mecánica',
        codigo: 'MEC',
        plazoReglamentario: {
          modalidad: 'ANTICIPADO_CONJUNTO',
          anticipacionSorteoAreaDias: 14,
          plazoResolucionValor: 14,
          plazoResolucionUnidad: 'DIAS_CALENDARIO',
          descripcionRegla: 'Sorteo de Área y Caso simultáneo (14 días calendario de preparación previa)',
        },
        areas: [
          {
            nombre: 'Mecánica de Equipos Agroindustriales',
            casosEjemplo: [
              {
                titulo: 'Cálculo y Selección de Elementos de Máquinas para Cosechadora Combinada de Granos',
                contenido: 'Diseño cinemático de transmisiones por cadenas y engranajes, cálculo de fatiga en ejes de mando y selección de rodamientos de alta carga.',
              },
            ],
          },
          {
            nombre: 'Mecánica de Máquinas Agroindustriales',
            casosEjemplo: [
              {
                titulo: 'Rediseño de Sistema de Trilla y Separación Centrífuga para Planta de Beneficio',
                contenido: 'Modelado CAD/CAE de componentes de desgaste, análisis estructural por elementos finitos (FEA) y optimización de flujo másico.',
              },
            ],
          },
          {
            nombre: 'Mecánica de Motores Automotrices',
            casosEjemplo: [
              {
                titulo: 'Diagnóstico Termodinámico y Reacondicionamiento de Motor Diesel Turboalimentado de Inyección Common Rail',
                contenido: 'Análisis de gases de escape, balance térmico, curvas de torque y potencia y protocolo de pruebas en banco dinamométrico.',
              },
            ],
          },
          {
            nombre: 'Mecánica de Sistemas Automotrices',
            casosEjemplo: [
              {
                titulo: 'Diseño de Sistema de Suspensión Neumática y Frenos Antibloqueo (EBS) para Transporte Pesado',
                contenido: 'Cálculo de fuerzas de frenado, distribución de cargas dinámicas y simulación de comportamiento vehicular en curvas.',
              },
            ],
          },
          {
            nombre: 'Mecánica de Equipos Industriales',
            casosEjemplo: [
              {
                titulo: 'Plan de Mantenimiento Predictivo Basado en Análisis de Vibraciones y Termografía para Turbomaquinaria',
                contenido: 'Espectros de vibración FFT para detección de desalineación o desbalance, lubricación industrial y cálculo de confiabilidad RCM.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Sistemas',
        codigo: 'SIS',
        plazoReglamentario: {
          modalidad: 'ANTICIPADO_CONJUNTO',
          anticipacionSorteoAreaDias: 7,
          plazoResolucionValor: 7,
          plazoResolucionUnidad: 'DIAS_CALENDARIO',
          descripcionRegla: 'Sorteo de Área y Caso simultáneo (7 días calendario de preparación previa)',
        },
        areas: [
          {
            nombre: 'Desarrollo de Software y Base de Datos',
            umbralDisponibilidad: 2,
            casosEjemplo: [
              {
                titulo: 'Arquitectura de Microservicios Resiliente para Plataforma de Pagos en Tiempo Real',
                contenido: 'Diseño de un backend orientado a eventos con Apache Kafka, patrones Circuit Breaker, Outbox Pattern y base de datos particionada multi-región.',
              },
              {
                titulo: 'Diseño de Motor de Transacciones Distribuidas con Consistencia Eventual y Sagas',
                contenido: 'Implementación del patrón Saga Orquestada para el procesamiento de transacciones financieras entre múltiples entidades bancarias.',
              },
            ],
          },
          {
            nombre: 'Ingeniería y Calidad de Software',
            umbralDisponibilidad: 2,
            casosEjemplo: [
              {
                titulo: 'Pipeline CI/CD DevSecOps con Pruebas Automatizadas y Escaneo de Vulnerabilidades SAST/DAST',
                contenido: 'Configuración de pipelines en GitLab CI/GitHub Actions, pruebas unitarias, de integración, cobertura de código y despliegue continuo Blue/Green en Kubernetes.',
              },
              {
                titulo: 'Estrategia Integral de Pruebas de Carga y Rendimiento para Arquitecturas Cloud-Native',
                contenido: 'Diseño y ejecución de pruebas de estrés con k6/JMeter, análisis de cuellos de botella en memoria/CPU y autoscaling horizontal (HPA).',
              },
            ],
          },
          {
            nombre: 'Infraestructura de TI',
            umbralDisponibilidad: 2,
            casosEjemplo: [
              {
                titulo: 'Diseño de Arquitectura Cloud Híbrida de Alta Disponibilidad con Infraestructura como Código (IaC)',
                contenido: 'Aprovisionamiento de infraestructura con Terraform, clústeres EKS/GKE, mallas de servicios (Istio) y observabilidad integral con Prometheus/Grafana.',
              },
              {
                titulo: 'Plan de Recuperación ante Desastres (DRP) y Continuidad del Negocio con RPO y RTO Mínimos',
                contenido: 'Estrategia de replicación asíncrona de datos entre centros de datos geodistribuidos y conmutación por error automatizada (Failover).',
              },
            ],
          },
          {
            nombre: 'Inteligencia Artificial',
            umbralDisponibilidad: 2,
            casosEjemplo: [
              {
                titulo: 'Sistema de Detección Temprana de Fraude Transaccional con Modelos de Machine Learning',
                contenido: 'Tratamiento de datasets altamente desbalanceados, entrenamiento de modelos Random Forest / XGBoost y despliegue del endpoint de inferencia con baja latencia.',
              },
              {
                titulo: 'Implementación de Agente Inteligente RAG (Retrieval-Augmented Generation) para Asistencia Académica',
                contenido: 'Pipeline de indexación vectorial, embeddings semánticos, orquestación de prompts con LLMs y mitigación de alucinaciones.',
              },
            ],
          },
          {
            nombre: 'Ciberseguridad',
            umbralDisponibilidad: 2,
            casosEjemplo: [
              {
                titulo: 'Implementación de Modelo de Seguridad Zero Trust en Red Corporativa Distribuida',
                contenido: 'Políticas de microsegmentación de red, autenticación basada en identidad (mTLS), acceso de privilegios mínimos y monitoreo SIEM.',
              },
              {
                titulo: 'Plan Integral de Respuesta a Incidentes de Ransomware y Análisis Forense Digital',
                contenido: 'Protocolos de contención inmediata, preservación de cadena de custodia digital de evidencias y reconstrucción del vector de ataque inicial.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Electrónica y Sistemas',
        codigo: 'ELS',
        plazoReglamentario: {
          modalidad: 'ANTICIPADO_CONJUNTO',
          anticipacionSorteoAreaDias: 7,
          plazoResolucionValor: 7,
          plazoResolucionUnidad: 'DIAS_CALENDARIO',
          descripcionRegla: 'Sorteo de Área y Caso simultáneo (7 días calendario de preparación previa)',
        },
        areas: [
          {
            nombre: 'Instrumentación Electrónica y Procesos',
            casosEjemplo: [
              {
                titulo: 'Acondicionamiento de Señales Analógicas de Sensores Industriales de Presión y Temperatura',
                contenido: 'Diseño de etapas de amplificación con amplificadores de instrumentación, filtrado activo paso bajo y transmisión de señal en lazo de corriente 4-20 mA.',
              },
            ],
          },
          {
            nombre: 'Automatismos Electrónicos',
            casosEjemplo: [
              {
                titulo: 'Programación de Controladores Lógicos Programables (PLC) bajo Norma IEC 61131-3',
                contenido: 'Desarrollo de lógica de control en diagrama de contactos (Ladder) y texto estructurado para una estación de llenado y envasado automatizado.',
              },
            ],
          },
          {
            nombre: 'Sistemas de Electricidad y Electrónica de Potencia',
            casosEjemplo: [
              {
                titulo: 'Diseño de Inversor de Voltaje DC-AC con Modulación por Ancho de Pulso (SPWM) para Energía Solar',
                contenido: 'Selección de transistores IGBT/MOSFET, diseño de filtros LC de salida y circuitos de disparo con aislamiento óptico.',
              },
            ],
          },
          {
            nombre: 'Diseño de Control',
            casosEjemplo: [
              {
                titulo: 'Sintonización de Controlador PID Digital para Sistema de Control de Nivel y Flujo',
                contenido: 'Modelado matemático de la planta, identificación de función de transferencia y sintonización por métodos de Ziegler-Nichols y lugar geométrico de las raíces.',
              },
            ],
          },
          {
            nombre: 'Evaluación de Prototipado',
            casosEjemplo: [
              {
                titulo: 'Diseño, Fabricación y Pruebas de Compatibilidad Electromagnética (EMC) de PCB Multicapa',
                contenido: 'Enrutamiento de señales de alta velocidad, planos de masa continuos, análisis de integridad de señal y normas IPC-2221.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Ingeniería Eléctrica',
        codigo: 'IEL',
        plazoReglamentario: {
          modalidad: 'ANTICIPADO_CONJUNTO',
          anticipacionSorteoAreaDias: 7,
          plazoResolucionValor: 7,
          plazoResolucionUnidad: 'DIAS_CALENDARIO',
          descripcionRegla: 'Sorteo de Área y Caso simultáneo (7 días calendario de preparación previa)',
        },
        areas: [
          {
            nombre: 'Máquinas e Instalaciones Eléctricas',
            casosEjemplo: [
              {
                titulo: 'Diseño de Subestación Transformadora de Media Tensión y Compensación de Energía Reactiva',
                contenido: 'Cálculo de corrientes de cortocircuito, selección de interruptores de potencia, dimensionamiento de banco de condensadores y coordinación de aislamiento.',
              },
            ],
          },
          {
            nombre: 'Sistemas de Generación con Energías Alternativas',
            casosEjemplo: [
              {
                titulo: 'Dimensionamiento de Parque Solar Fotovoltaico Conectado a la Red de Transmisión Nacional',
                contenido: 'Cálculo de radiación solar incidente, selección de inversores centrales y evaluación del impacto en la estabilidad de frecuencia del SIN.',
              },
            ],
          },
          {
            nombre: 'Líneas de Transmisión y Redes de Distribución',
            casosEjemplo: [
              {
                titulo: 'Cálculo Mecánico y Eléctrico de Línea de Transmisión en Alta Tensión a 115 kV',
                contenido: 'Selección de conductores ACSR, cálculo de flechas y tensiones mecánicas en catenaria y coordinación de protecciones de distancia.',
              },
            ],
          },
          {
            nombre: 'Simulaciones de Redes Eléctricas',
            casosEjemplo: [
              {
                titulo: 'Estudio de Flujo de Potencia y Estabilidad Transitoria Mediante Software Especializado (DigSILENT)',
                contenido: 'Simulación de contingencias N-1, análisis de caídas de tensión en barras críticas y ajuste de esquemas de alivio de carga.',
              },
            ],
          },
          {
            nombre: 'Aplicaciones para la Industria',
            casosEjemplo: [
              {
                titulo: 'Eficiencia Energética y Auditoría Eléctrica en Planta Industrial de Gran Consumo',
                contenido: 'Medición de distorsión armónica total (THD), mitigación con filtros activos de armónicos y reducción del factor de demanda eléctrica.',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Redes y Telecomunicaciones',
        codigo: 'RYT',
        plazoReglamentario: {
          modalidad: 'ANTICIPADO_CONJUNTO',
          anticipacionSorteoAreaDias: 7,
          plazoResolucionValor: 7,
          plazoResolucionUnidad: 'DIAS_CALENDARIO',
          descripcionRegla: 'Sorteo de Área y Caso simultáneo (7 días calendario de preparación previa)',
        },
        areas: [
          {
            nombre: 'Diseño de Redes Corporativas',
            casosEjemplo: [
              {
                titulo: 'Diseño de Red Empresarial Jerárquica con Enrutamiento Dinámico OSPF y Alta Disponibilidad (HSRP)',
                contenido: 'Configuración de VLANs de datos y voz, enlaces troncales 802.1Q, agregación de enlaces (LACP) y redundancia en capa de distribución.',
              },
            ],
          },
          {
            nombre: 'Servicios de Telecomunicaciones',
            casosEjemplo: [
              {
                titulo: 'Dimensionamiento de Enlace de Fibra Óptica DWDM para Conectividad Metropolitana',
                contenido: 'Cálculo del balance de potencia óptica (Power Budget), dispersión cromática, atenuación por empalmes y selección de amplificadores EDFA.',
              },
            ],
          },
          {
            nombre: 'Infraestructura de TI',
            casosEjemplo: [
              {
                titulo: 'Diseño de Centro de Procesamiento de Datos (Data Center) según Estándar TIA-942 Tier III',
                contenido: 'Dimensionamiento de sistemas de climatización de precisión (HVAC), generadores de respaldo UPS redundantes y cableado estructurado categoría 6A.',
              },
            ],
          },
          {
            nombre: 'Gestión de Redes',
            casosEjemplo: [
              {
                titulo: 'Implementación de Plataforma de Monitoreo de Redes y Telemetría Basada en SNMP y NetFlow',
                contenido: 'Supervisión de ancho de banda por interfaces, configuración de umbrales de alerta y generación de reportes de calidad de servicio (QoS).',
              },
            ],
          },
          {
            nombre: 'Ciberseguridad',
            casosEjemplo: [
              {
                titulo: 'Implementación de Firewall de Nueva Generación (NGFW) con Prevención de Intrusiones (IPS) y VPN IPSec',
                contenido: 'Políticas de inspección profunda de paquetes (DPI), túneles VPN sitio a sitio con cifrado AES-256 y filtrado de contenido web avanzado.',
              },
            ],
          },
        ],
      },
    ],
  },
] as const;
