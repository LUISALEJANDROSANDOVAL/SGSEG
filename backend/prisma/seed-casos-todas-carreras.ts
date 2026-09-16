import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://sgseg:sgseg@localhost:5437/sgseg?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CasoDef {
  titulo: string;
  contenido: string;
}

interface AreaDef {
  nombre: string;
  casos: CasoDef[];
}

const CASOS_14_CARRERAS: Record<string, AreaDef[]> = {
  // =========================================================================
  // 1. RELACIONES INTERNACIONALES (FCJS)
  // =========================================================================
  'Relaciones Internacionales': [
    {
      nombre: 'Comercio y Negocios Internacionales',
      casos: [
        {
          titulo: 'Aprovechamiento de Preferencias Arancelarias en el Acuerdo Comercial Mercosur-Bolivia',
          contenido:
            'Estrategia de exportación agroindustrial bajo el régimen de desgravación arancelaria del ACE 36. El postulante debe analizar normas de origen, barreras no arancelarias fitosanitarias y logística de transporte fluvial por la Hidrovía Paraguay-Paraná.',
        },
        {
          titulo: 'Estrategia de Inserción en Cadenas Globales de Valor del Mercado Asiático para Minerales Críticos',
          contenido:
            'Diseño de negociación bilateral para el suministro de carbonato de litio y derivados a industrias tecnológicas de Corea del Sur y Japón, considerando cláusulas de transferencia tecnológica y estándares ESG.',
        },
      ],
    },
    {
      nombre: 'Análisis y Gestión de la Resolución de Conflictos',
      casos: [
        {
          titulo: 'Mediación Diplomática en Controversias Fronterizas por Uso de Recursos Hídricos Compartidos',
          contenido:
            'Formular un mecanismo de solución pacífica de controversias bajo el derecho internacional público y convenios de cuencas transfronterizas, estructurando una comisión técnica binacional y protocolo de arbitraje.',
        },
        {
          titulo: 'Gestión de Crisis Diplomática y Protección Consular ante Emergencias Migratorias Regionales',
          contenido:
            'Diseño del plan de contingencia consular y asistencia humanitaria para ciudadanos bolivianos varados en pasos fronterizos en contexto de inestabilidad política regional conforme a la Convención de Viena sobre Relaciones Consulares.',
        },
      ],
    },
    {
      nombre: 'Sostenibilidad y Cooperación',
      casos: [
        {
          titulo: 'Formulación de Proyecto de Cooperación No Reembolsable con la Unión Europea para Energías Limpias',
          contenido:
            'Estructuración de propuesta técnica y marco lógico bajo el programa Global Gateway para financiar parques solares comunitarios en el Chaco boliviano, alineado a los ODS 7 y 13.',
        },
        {
          titulo: 'Negociación de Bonos Verdes y Financiamiento Climático con el Fondo Verde para el Clima (GCF)',
          contenido:
            'Estrategia diplomática y técnica para la emisión soberana de bonos vinculados a la conservación de áreas protegidas y reducción de emisiones por deforestación evitada (REDD+).',
        },
      ],
    },
    {
      nombre: 'Diplomacia y Política Exterior de Bolivia',
      casos: [
        {
          titulo: 'Posicionamiento Estratégico de Bolivia en Organismos Multilaterales (CELAC, OEA, ONU)',
          contenido:
            'Diseño de agenda diplomática para la presidencia pro témpore de un organismo regional, impulsando temas de transición energética, comercio justo y soberanía alimentaria.',
        },
        {
          titulo: 'Modernización del Servicio Exterior y Diplomacia Digital en Misiones Diplomáticas',
          contenido:
            'Implementación de plataformas digitales para trámites consulares, promoción turística y captación de inversión extranjera directa en embajadas estratégicas.',
        },
      ],
    },
    {
      nombre: 'Gestión Interdisciplinario en Relaciones Internacionales',
      casos: [
        {
          titulo: 'Análisis Geopolítico del Corredor Bioceánico de Integración Ferroviaria',
          contenido:
            'Evaluación de viabilidad geopolítica, económica e institucional del trazado Puerto Santos - Ilo atravesando territorio boliviano, identificando actores clave y riesgos de gobernanza.',
        },
        {
          titulo: 'Estrategia de Marca País para la Promoción de Productos con Denominación de Origen',
          contenido:
            'Diseño de campaña internacional de posicionamiento para café de altura y vinos de altura bolivianos en ferias comerciales de Europa y Norteamérica.',
        },
      ],
    },
  ],

  // =========================================================================
  // 2. PSICOLOGÍA (FCJS)
  // =========================================================================
  Psicología: [
    {
      nombre: 'Psicología Clínica',
      casos: [
        {
          titulo: 'Evaluación y Tratamiento Cognitivo-Conductual en Trastorno de Ansiedad Generalizada y Crisis de Pánico',
          contenido:
            'Diseño de plan de intervención psicoterapéutica individual basado en evidencia para un adulto joven con sintomatología somática severa y conductas de evitación fóbica.',
        },
        {
          titulo: 'Abordaje Terapéutico Familiar Sistémico en Depresión Mayor con Riesgo Autolesivo en Adolescentes',
          contenido:
            'Formulación del plan de evaluación diagnóstica multidimensional, contención familiar y activación de protocolos de seguridad ante ideación suicida recurrente.',
        },
      ],
    },
    {
      nombre: 'Psicología Educativa',
      casos: [
        {
          titulo: 'Programa de Adaptación Curricular e Inclusión para Estudiantes con Trastorno del Espectro Autista (TEA)',
          contenido:
            'Diseño de estrategias psicoeducativas, sensibilización docente y adecuación de entornos escolares para nivel primario en una unidad educativa urbana.',
        },
        {
          titulo: 'Intervención Psicológica ante Casos de Acoso Escolar (Bullying y Ciberbullying) en Educación Secundaria',
          contenido:
            'Estructuración de protocolo de detección temprana, mediación de pares, restitución de derechos y talleres de inteligencia emocional en comunidad educativa.',
        },
      ],
    },
    {
      nombre: 'Psicología Organizacional',
      casos: [
        {
          titulo: 'Diagnóstico e Intervención en Síndrome de Burnout y Factores de Riesgo Psicosocial en Personal de Salud',
          contenido:
            'Aplicación de batería de evaluación (MBI, SUSESO-ISTAS), análisis de clima laboral y diseño de plan de bienestar emocional y balance trabajo-vida en hospital privado.',
        },
        {
          titulo: 'Diseño de Modelo de Gestión por Competencias y Evaluación del Desempeño 360 Grados',
          contenido:
            'Estructuración del diccionario de competencias organizacionales, rúbricas de evaluación conductual y plan de capacitación para mandos medios en empresa de servicios.',
        },
      ],
    },
    {
      nombre: 'Psicología Comunitaria',
      casos: [
        {
          titulo: 'Programa Comunitario de Prevención del Consumo Problemático de Sustancias en Población Juvenil',
          contenido:
            'Metodología de Investigación-Acción Participativa (IAP) con juntas vecinales para la creación de espacios artísticos y deportivos protectores.',
        },
        {
          titulo: 'Intervención Psicosocial en Familias Damnificadas por Desastres Naturales e Inundaciones',
          contenido:
            'Primeros auxilios psicológicos (PAP), conformación de redes de apoyo mutuo y resiliencia comunitaria en albergues temporales en el oriente boliviano.',
        },
      ],
    },
    {
      nombre: 'Psicología Forense',
      casos: [
        {
          titulo: 'Evaluación Pericial Psicológica de Daño Emocional y Secuelas en Víctimas de Violencia Intrafamiliar',
          contenido:
            'Elaboración de informe pericial con valor probatorio en sede judicial (Ley 348), aplicando instrumentos estandarizados (SCL-90-R, PAI) y entrevista forense especializada.',
        },
        {
          titulo: 'Peritaje Psicológico de Credibilidad del Testimonio Infantil mediante Técnica SVA/CBCA',
          contenido:
            'Aplicación del análisis de contenido basado en criterios en cámara Gesell para caso de presunto abuso sexual infantil, garantizando no revictimización.',
        },
      ],
    },
  ],

  // =========================================================================
  // 3. ADMINISTRACIÓN GENERAL (FCE)
  // =========================================================================
  'Administración General': [
    {
      nombre: 'Gerencia Contemporánea',
      casos: [
        {
          titulo: 'Transformación Digital y Gestión del Cambio Cultural en Empresa Comercial Tradicional',
          contenido:
            'Plan estratégico para migrar canales físicos a e-commerce omnicanal, adaptando estructuras jerárquicas hacia células ágiles (Scrum/Kanban) y liderazgo transformacional.',
        },
        {
          titulo: 'Implementación de Prácticas de Buen Gobierno Corporativo y Sucesión Familiar',
          contenido:
            'Elaboración de protocolo familiar, conformación de directorio independiente y código de ética para empresa agroindustrial de segunda generación.',
        },
      ],
    },
    {
      nombre: 'Gestión de Talento Humano',
      casos: [
        {
          titulo: 'Estrategia de Fidelización y Reducción de Rotación Temprana de Personal en Sector Call Center',
          contenido:
            'Diseño de propuesta de valor al empleado (EVP), planes de carrera acelerados, compensación variable e incentivos de bienestar laboral.',
        },
        {
          titulo: 'Auditoría de Procesos de Recursos Humanos y Clima Laboral bajo Norma ISO 30414',
          contenido:
            'Diagnóstico integral de reclutamiento, onboarding, brechas salariales y satisfacción laboral en corporación con 800 colaboradores.',
        },
      ],
    },
    {
      nombre: 'Desarrollo de Negocios',
      casos: [
        {
          titulo: 'Plan de Expansión Territorial mediante Modelo de Franquicias Comerciales en Bolivia',
          contenido:
            'Definición del canon de entrada, regalías, manuales operativos (SOP), selección de franquiciados y contratos de master franquicia para cadena gastronómica.',
        },
        {
          titulo: 'Estrategia de Diversificación Concéntrica hacia Nuevos Nichos de Mercado en Sector Retail',
          contenido:
            'Estudio de viabilidad técnica y comercial para el lanzamiento de una línea de productos eco-amigables con empaques biodegradables.',
        },
      ],
    },
    {
      nombre: 'Decisiones Financiera de Inversiones',
      casos: [
        {
          titulo: 'Evaluación Económica y Financiera para la Adquisición de Nueva Línea de Producción Industrial',
          contenido:
            'Cálculo de flujos de caja descontados (VAN, TIR, Payback) y análisis de sensibilidad por variación en tipos de cambio y tasas de interés bancarias.',
        },
        {
          titulo: 'Optimización de Estructura de Capital y Refinanciamiento de Deuda de Corto Plazo',
          contenido:
            'Reestructuración de pasivos bancarios mediante emisión de pagarés bursátiles en la Bolsa Boliviana de Valores (BBV).',
        },
      ],
    },
    {
      nombre: 'Dirección Estratégica',
      casos: [
        {
          titulo: 'Diseño del Cuadro de Mando Integral (Balanced Scorecard) Alineado al Plan Estratégico Quinquenal',
          contenido:
            'Definición de mapas estratégicos en las cuatro perspectivas, KPIs críticos, metas semestrales e iniciativas de mejora en empresa de logística.',
        },
        {
          titulo: 'Análisis Competitivo y Reorientación Estratégica ante el Ingreso de Competidores Internacionales',
          contenido:
            'Aplicación de las 5 Fuerzas de Porter, matriz FODA cruzada y estrategia de diferenciación de servicios para mantener cuota de mercado.',
        },
      ],
    },
  ],

  // =========================================================================
  // 4. COMUNICACIÓN ESTRATÉGICA Y DIGITAL (FCE)
  // =========================================================================
  'Comunicación Estratégica y Digital': [
    {
      nombre: 'Comunicación Estratégica y Digital',
      casos: [
        {
          titulo: 'Plan Integral de Comunicación y Gestión de Crisis de Reputación en Redes Sociales',
          contenido:
            'Estrategia de vocería institucional, monitoreo de social listening y manual de crisis ante denuncia viral por falla de producto en empresa farmacéutica.',
        },
        {
          titulo: 'Campaña Transmedia de Responsabilidad Social Corporativa (RSC) y Sostenibilidad',
          contenido:
            'Desarrollo de narrativa multiplataforma (podcast, microdocumentales, web interactiva) para concientizar sobre reciclaje de residuos tecnológicos.',
        },
      ],
    },
    {
      nombre: 'Periodismo Corporativo y Digital',
      casos: [
        {
          titulo: 'Estrategia de Branded Content y Storytelling para Plataforma Financiera FinTech',
          contenido:
            'Creación de un portal de educación financiera con artículos periodísticos de investigación, infografías animadas y newsletters para captación de leads.',
        },
        {
          titulo: 'Diseño de Newsletter Corporativo y Canales Internos de Comunicación en Modalidad Híbrida',
          contenido:
            'Implementación de intranet corporativa, podcasts para colaboradores y boletín semanal interactivo para fortalecer el sentido de pertenencia.',
        },
      ],
    },
    {
      nombre: 'Publicidad y Merchandising',
      casos: [
        {
          titulo: 'Campaña de Lanzamiento Omnicanal para Producto Masivo de Consumo',
          contenido:
            'Definición de concepto creativo, plan de medios digital (Google Ads, Meta, TikTok) y activación de trade marketing en puntos de venta estratégicos.',
        },
        {
          titulo: 'Plan de Trade Marketing y Material POP para Puntos de Venta de Canal Tradicional',
          contenido:
            'Diseño de exhibidores modulares, señalética y concursos para minoristas que incrementen la visibilidad de marca y rotación de stock.',
        },
      ],
    },
    {
      nombre: 'Producción Audiovisual',
      casos: [
        {
          titulo: 'Producción de Serie de Microvideos Educativos con Técnicas de Motion Graphics y Sonido Inmersivo',
          contenido:
            'Guionización técnica, storyboard, rodaje y postproducción para campaña de sensibilización en seguridad vial dirigida a público universitario.',
        },
        {
          titulo: 'Estrategia de Streaming en Vivo y Cobertura Audiovisual de Evento Corporativo Internacional',
          contenido:
            'Diseño de set virtual, escaleta de transmisión en multicámara, switchers y distribución multiplataforma con interacción en vivo.',
        },
      ],
    },
    {
      nombre: 'Fundamentos de Comunicación',
      casos: [
        {
          titulo: 'Auditoría de Identidad e Imagen Corporativa en Fusión de Empresas de Telecomunicaciones',
          contenido:
            'Estudio de percepción de stakeholders, manual de identidad visual y plan de homologación comunicacional entre ambas culturas corporativas.',
        },
        {
          titulo: 'Mapeo de Stakeholders y Plan de Relacionamiento con Líderes de Opinión y Medios Masivos',
          contenido:
            'Estructuración de matriz de influencia/interés y plan de press trips y ruedas de prensa para proyecto de inversión minera responsable.',
        },
      ],
    },
  ],

  // =========================================================================
  // 5. INGENIERÍA COMERCIAL (FCE)
  // =========================================================================
  'Ingeniería Comercial': [
    {
      nombre: 'Dirección Estratégica',
      casos: [
        {
          titulo: 'Plan Estratégico de Penetración de Mercado para Cadena de Farmacias Populares',
          contenido:
            'Análisis de macroentorno (PESTEL), geomarketing de ubicación de sucursales y estrategia de precios psicológicos para capturar cuota de mercado en zonas periurbanas.',
        },
        {
          titulo: 'Estrategia de Océano Azul para Servicios de Logística de Última Milla',
          contenido:
            'Diseño de propuesta de valor disruptiva para envíos express ecológicos en motocicletas eléctricas con tracking en tiempo real para pymes.',
        },
      ],
    },
    {
      nombre: 'Gestión Comercial',
      casos: [
        {
          titulo: 'Reestructuración del Embudo de Ventas B2B y Políticas de Comisiones de Fuerza de Ventas',
          contenido:
            'Implementación de CRM (HubSpot/Salesforce), estandarización de etapas de prospección, cotización y cierre, e incentivos por rentabilidad de clientes.',
        },
        {
          titulo: 'Gestión de Cuentas Clave (Key Account Management) para Proveedor Industrial de Insumos',
          contenido:
            'Desarrollo de planes de negocio conjuntos (JBP) con los 10 principales clientes corporativos, acuerdos de nivel de servicio (SLA) y programas de fidelización.',
        },
      ],
    },
    {
      nombre: 'Marketing Estratégico e Innovación',
      casos: [
        {
          titulo: 'Estrategia de Pricing Dinámico y Yield Management en Sector Hotelero Urbano',
          contenido:
            'Modelado de tarifas hoteleras en función de estacionalidad, ocupación proyectada y precios de competencia en OTAs (Booking, Expedia).',
        },
        {
          titulo: 'Lanzamiento de Marca Propia para Cadena de Supermercados con Enfoque Saludable',
          contenido:
            'Segmentación conductual de consumidores, desarrollo de packaging, fijación de precios competitivos y estrategia de exhibición en góndolas.',
        },
      ],
    },
    {
      nombre: 'Gestión Emprendedora',
      casos: [
        {
          titulo: 'Plan de Negocios y Modelo Lean Startup para Plataforma de Alquiler de Maquinaria Agrícola',
          contenido:
            'Validación de Producto Mínimo Viable (MVP), cálculo de métricas de adquisición (CAC, LTV, Churn Rate) y preparación de pitch deck para inversionistas ángel.',
        },
        {
          titulo: 'Incubación y Escalamiento de Empresa de Alimentos Funcionales a Base de Granos Andinos',
          contenido:
            'Estrategia de financiamiento semilla, homologación sanitaria ante SENASAG y alianzas con cadenas de distribución a nivel nacional.',
        },
      ],
    },
    {
      nombre: 'Investigación y Análisis de Mercado Empresarial',
      casos: [
        {
          titulo: 'Estudio Cuantitativo y Cualitativo de Hábitos de Consumo Financiero en la Generación Z',
          contenido:
            'Diseño muestral probabilístico, focus groups y análisis de regresión logística para identificar drivers de adopción de billeteras móviles.',
        },
        {
          titulo: 'Investigación de Satisfacción de Clientes Mediante Metodología NPS y Análisis de Sentimiento',
          contenido:
            'Medición del Net Promoter Score en sucursales bancarias y análisis de quejas recurrentes para diseñar un plan de mejora de experiencia de usuario (CX).',
        },
      ],
    },
  ],

  // =========================================================================
  // 6. MARKETING Y PUBLICIDAD (FCE)
  // =========================================================================
  'Marketing y Publicidad': [
    {
      nombre: 'Marketing Digital',
      casos: [
        {
          titulo: 'Estrategia de Performance Marketing y Optimización del Retorno de Inversión Publicitaria (ROAS)',
          contenido:
            'Planificación de campañas de conversión en Meta Ads y Google Search, configuración de píxeles y API de conversiones, tests A/B de creativos y landing pages.',
        },
        {
          titulo: 'Estrategia de Inbound Marketing y Automatización de Lead Nurturing para Universidad Privada',
          contenido:
            'Diseño de imanes de prospectos (e-books, webinars), flujos automatizados de email marketing y calificación de leads (Lead Scoring) para admisiones.',
        },
      ],
    },
    {
      nombre: 'Plan de Marketing',
      casos: [
        {
          titulo: 'Plan Anual de Marketing para Marca de Bebidas Isotónicas en Bolivia',
          contenido:
            'Definición de objetivos SMART, presupuesto publicitario según método de porcentaje de ventas, calendario de activaciones deportivas y patrocinio de atletas.',
        },
        {
          titulo: 'Reposicionamiento de Marca Centenaria de Calzados ante Público Joven Urbano',
          contenido:
            'Rediseño de propuesta de valor, colaboración con diseñadores urbanos, estrategias de cobranding y nuevo tono de comunicación en canales digitales.',
        },
      ],
    },
    {
      nombre: 'Métricas de Marketing e Insights',
      casos: [
        {
          titulo: 'Construcción de Dashboard de Analítica de Marketing con Looker Studio y GA4',
          contenido:
            'Integración de fuentes de datos publicitarias, análisis de embudos multicanal, modelos de atribución (data-driven vs first-click) y cálculo de ROI.',
        },
        {
          titulo: 'Análisis de Churn Rate y Segmentación RFM (Recencia, Frecuencia, Monto) en E-commerce',
          contenido:
            'Clusterización de clientes según historial de compras para activar campañas hipersegmentadas de reactivación y up-selling.',
        },
      ],
    },
    {
      nombre: 'Publicidad y Merchandising',
      casos: [
        {
          titulo: 'Campaña Creativa de Marketing de Guerrilla y Experiencial para Marca de Snacks',
          contenido:
            'Diseño de intervenciones urbanas no convencionales, generación de contenido viral espontáneo y medición de earned media (cobertura mediática gratuita).',
        },
        {
          titulo: 'Optimización de Planimetría y Gestión de Espacios en Góndola con Software de Planogramas',
          contenido:
            'Distribución estratégica de frentes de producto (facings), zonas calientes y frías en sala de ventas para maximizar el margen de contribución.',
        },
      ],
    },
    {
      nombre: 'Investigación y Análisis de Mercados',
      casos: [
        {
          titulo: 'Test de Concepto y Empaque (Pack Test) con Metodología Eye-Tracking para Nuevo Producto Lácteo',
          contenido:
            'Análisis de zonas de fijación visual en etiquetas, pruebas de sabor a ciegas (blind test) y estimación de intención de compra.',
        },
        {
          titulo: 'Estudio de Elasticidad Precio de la Demanda para Servicio de Televisión por Suscripción',
          contenido:
            'Aplicación del método Van Westendorp (Price Sensitivity Meter) para identificar el rango de precio aceptable y punto de precio óptimo.',
        },
      ],
    },
  ],

  // =========================================================================
  // 7. INGENIERÍA FINANCIERA (FCE)
  // =========================================================================
  'Ingeniería Financiera': [
    {
      nombre: 'Valoración de Empresas',
      casos: [
        {
          titulo: 'Valoración Financiera por Flujo de Caja Descontado (DCF) y Múltiplos Comparables de Cadena de Farmacias',
          contenido:
            'Proyección de estados financieros a 10 años, cálculo del costo promedio ponderado de capital (WACC), valor terminal y sensibilización mediante simulación Monte Carlo.',
        },
        {
          titulo: 'Valoración de Intangibles y Marca Corporativa bajo la Norma Internacional ISO 10668',
          contenido:
            'Aplicación del método de Alivio de Regalías (Royalty Relief) para tasar la marca de una empresa agroindustrial en proceso de venta.',
        },
      ],
    },
    {
      nombre: 'Modelación Financiera',
      casos: [
        {
          titulo: 'Modelado Financiero y Evaluación de Riesgos para Proyecto de Generación Eólica',
          contenido:
            'Estructuración de modelo dinámico en Excel financiero con cálculo de ratios de cobertura de servicio de la deuda (DSCR, LLCR) y escenarios de estrés eólico.',
        },
        {
          titulo: 'Construcción de Matriz de Transición y Estimación de Pérdida Esperada bajo NIIF 9',
          contenido:
            'Modelación de probabilidad de incumplimiento (PD), pérdida dado el incumplimiento (LGD) y exposición al momento del default (EAD) en cartera crediticia.',
        },
      ],
    },
    {
      nombre: 'Gestión Financiera a Corto Plazo',
      casos: [
        {
          titulo: 'Optimización del Ciclo de Conversión del Efectivo (CCE) en Empresa Distribuidora Mayorista',
          contenido:
            'Estrategias para reducir días de cobro (DSO), rotación de inventarios (DII) y negociación de plazos con proveedores (DPO) para liberar capital de trabajo.',
        },
        {
          titulo: 'Estrategia de Cobertura de Riesgo Cambiario mediante Contratos Forward de Divisas',
          contenido:
            'Evaluación de exposición cambiaria neta en importaciones y estructuración de instrumentos derivados para fijar tipo de cambio futuro.',
        },
      ],
    },
    {
      nombre: 'Finanzas Largo Plazo',
      casos: [
        {
          titulo: 'Estructuración Financiera de Titularización de Flujos Futuros en el Mercado de Valores',
          contenido:
            'Diseño del patrimonio autónomo, cesión de cobranzas de contratos de leasing, calificación de riesgo crediticio y emisión de pagarés bursátiles.',
        },
        {
          titulo: 'Evaluación Financiera de Proyecto Inmobiliario Mixto (Comercial y Residencial) con Project Finance',
          contenido:
            'Determinación de equity, deuda subordinada y senior, cronograma de desembolsos, preventas y análisis de viabilidad financiera global.',
        },
      ],
    },
    {
      nombre: 'Fundamentos y Análisis Financiero Operativos',
      casos: [
        {
          titulo: 'Análisis Integral Dupont y Diagnóstico de Rentabilidad Operativa de Empresa Avícola',
          contenido:
            'Descomposición del ROE en margen neto, rotación de activos y apalancamiento financiero, identificando ineficiencias de costos de materias primas.',
        },
        {
          titulo: 'Determinación del Punto de Equilibrio Operativo y Apalancamiento Combinado (GAO / GAF)',
          contenido:
            'Análisis de sensibilidad del beneficio por acción (BPA) ante variaciones en el volumen de ventas y estructura de costos fijos.',
        },
      ],
    },
  ],

  // =========================================================================
  // 8. CONTADURÍA PÚBLICA (FCE)
  // =========================================================================
  'Contaduría Pública': [
    {
      nombre: 'Auditoría Financiera',
      casos: [
        {
          titulo: 'Planificación y Ejecución de Auditoría Financiera Externa bajo Normas Internacionales de Auditoría (NIA)',
          contenido:
            'Determinación de materialidad de planeación y de ejecución, evaluación de controles internos (COSO III) y pruebas sustantivas en el rubro de existencias e ingresos.',
        },
        {
          titulo: 'Dictamen de Auditoría con Salvedades por Falta de Conciliación de Cuentas por Cobrar Antiguas',
          contenido:
            'Redacción del informe de auditor independiente fundamentando la limitación en el alcance y la cuantificación del impacto en los estados financieros.',
        },
      ],
    },
    {
      nombre: 'Contabilidad de Costos',
      casos: [
        {
          titulo: 'Implementación de Sistema de Costeo por Actividades (ABC) en Planta Fabricante de Envases Plásticos',
          contenido:
            'Identificación de generadores de costos (cost drivers), centros de actividad y redistribución de costos indirectos de fabricación para fijación de precios reales.',
        },
        {
          titulo: 'Determinación de Costos Conjuntos y Subproductos en Industria de Beneficiado de Carnes',
          contenido:
            'Aplicación del método de valor neto realizable (VNR) para asignar costos a cortes especiales, subproductos y mermas del proceso productivo.',
        },
      ],
    },
    {
      nombre: 'Contabilidad General',
      casos: [
        {
          titulo: 'Adopción por Primera Vez de las Normas Internacionales de Información Financiera (NIIF para Pymes)',
          contenido:
            'Reconocimiento inicial, conciliación patrimonial, bajas de activos obsoletos y ajuste por inflación según normativa técnica contable nacional.',
        },
        {
          titulo: 'Tratamiento Contable y Tributario de Arrendamientos Financieros según NIIF 16',
          contenido:
            'Registro de activos por derecho de uso, pasivo por arrendamiento financiero, amortizaciones y deducciones fiscales del IUE.',
        },
      ],
    },
    {
      nombre: 'Administración Financiera',
      casos: [
        {
          titulo: 'Diseño e Implementación de Sistema de Control Presupuestario y Análisis de Variaciones',
          contenido:
            'Elaboración del presupuesto maestro (operativo, de capital y caja) y análisis mensual de variaciones en precios, volumen y eficiencia operativa.',
        },
        {
          titulo: 'Auditoría Tributaria Preventiva y Planificación Fiscal conforme al Código Tributario Boliviano',
          contenido:
            'Revisión de bancarización obligatoria, crédito fiscal IVA, gastos deducibles y no deducibles para el cálculo del Formulario 500 del IUE.',
        },
      ],
    },
  ],

  // =========================================================================
  // 9. COMERCIO INTERNACIONAL (FCE)
  // =========================================================================
  'Comercio Internacional': [
    {
      nombre: 'Gestión Aduanera',
      casos: [
        {
          titulo: 'Aplicación del Régimen de Admisión Temporal para Perfeccionamiento Activo (RITEX)',
          contenido:
            'Estructuración del procedimiento de internación temporal de materias primas sin pago de gravamen arancelario para posterior reexportación de manufacturas.',
        },
        {
          titulo: 'Defensa Jurídico-Aduanera ante Acta de Intervención por Presunta Contravención de Contrabando',
          contenido:
            'Formulación de descargos probatorios, valor en aduana conforme al Acuerdo de Valoración de la OMC y memorial de impugnación ante la ANB.',
        },
      ],
    },
    {
      nombre: 'Logística y Distribución Física Internacional',
      casos: [
        {
          titulo: 'Diseño de Cadena Logística Multimodal para Exportación de Aceite de Soya a Granel a la India',
          contenido:
            'Selección de ruta (ferrocarril, barcazas, buques tanque Panamax), selección de Incoterm 2020 (FOB Puerto Aguirre vs CIF Mumbai) y gestión de fletes marítimos.',
        },
        {
          titulo: 'Optimización de Tiempos de Desaduanamiento y Gestión de Almacenes en Recintos Aduaneros',
          contenido:
            'Implementación de despacho anticipado, canal verde y reducción de costos de estadía y demoras de contenedores (demurrage).',
        },
      ],
    },
    {
      nombre: 'Comercio y Negocios Internacionales',
      casos: [
        {
          titulo: 'Estrategia de Entrada al Mercado Europeo con Certificación de Comercio Justo (Fair Trade)',
          contenido:
            'Plan comercial para exportación de cacao silvestre amazónico, cumplimiento del reglamento europeo contra la deforestación (EUDR) y canales de venta especializados.',
        },
        {
          titulo: 'Negociación de Contrato de Compraventa Internacional con Cláusula de Fuerza Mayor y Medios de Pago Seguro',
          contenido:
            'Estructuración de Carta de Crédito Confirmada e Irrevocable (UCP 600), seguro de transporte internacional de carga y arbitraje comercial ante la CCI.',
        },
      ],
    },
    {
      nombre: 'Internacionalización de la Empresa',
      casos: [
        {
          titulo: 'Plan de Internacionalización hacia el Mercado Paraguayo para Empresa de Software y Consultoría',
          contenido:
            'Análisis de convenios de doble tributación, constitución de sucursal extranjera, homologación de servicios y plan de prospección comercial.',
        },
        {
          titulo: 'Consorcio de Exportación para Pequeños Productores Agropecuarios de Valles Cruceños',
          contenido:
            'Estatuto de gobernanza del consorcio, consolidación de oferta exportable, packaging conjunto y reducción de costos logísticos y de certificación.',
        },
      ],
    },
    {
      nombre: 'Workshop Avanzado en Comercio y Negocios Internacionales',
      casos: [
        {
          titulo: 'Simulación de Negociación Comercial Internacional para Resolución de Conflicto de Calidad de Embarque',
          contenido:
            'Manejo de reclamo por humedad excesiva en cargamento de quinua real, negociación de descuento comercial vs reenvío de producto bajo normas GAFTA.',
        },
        {
          titulo: 'Diseño de Estrategia de Cobertura de Riesgos en Mercados de Futuros y Opciones Agrícolas (CBOT)',
          contenido:
            'Uso de contratos de futuros de Chicago Board of Trade para fijar precio de venta de cosecha de soya y proteger márgenes de productores locales.',
        },
      ],
    },
  ],

  // =========================================================================
  // 10. TURISMO (FCE)
  // =========================================================================
  Turismo: [
    {
      nombre: 'Gestión y Desarrollo de la Actividad Turística',
      casos: [
        {
          titulo: 'Plan de Gestión Turística Sostenible y Capacidad de Carga en las Misiones Jesuíticas de Chiquitos',
          contenido:
            'Determinación de límites de cambio aceptable (LCA), zonificación turística, señalización interpretativa y preservación del patrimonio tangible e intangible UNESCO.',
        },
        {
          titulo: 'Diseño de Ruta Turística de Ecoturismo y Aventura en el Parque Nacional Amboró',
          contenido:
            'Formulación del plan de senderismo seguro, alianzas comunitarias, código de conducta del visitante y comercialización de paquetes vivenciales.',
        },
      ],
    },
    {
      nombre: 'Empresas Prestadoras de Servicios Turísticos',
      casos: [
        {
          titulo: 'Plan de Reestructuración Operativa y Calidad de Servicio en Hotel Boutique de 4 Estrellas',
          contenido:
            'Implementación de manuales de servicio al cliente, software PMS (Property Management System), auditoría de estándares hoteleros y gestión de reseñas en TripAdvisor.',
        },
        {
          titulo: 'Creación de Agencia de Viajes Receptiva Especializada en Turismo Gastronómico y Enológico',
          contenido:
            'Diseño de tours culinarios, alianzas con bodegas vinícolas de Samaipata y chefs locales, canales de distribución B2B con operadores extranjeros.',
        },
      ],
    },
    {
      nombre: 'Gerencia Contemporánea',
      casos: [
        {
          titulo: 'Transformación Digital y Estrategia de Venta Directa en Cadena Hotelera Regional',
          contenido:
            'Implementación de motor de reservas propio con pasarela de pago digital, programa de lealtad y automatización de marketing por WhatsApp.',
        },
        {
          titulo: 'Plan de Contingencia y Gestión de Crisis ante Eventos Climatológicos en Destinos Turísticos',
          contenido:
            'Protocolos de evacuación segura, seguros de cancelación, comunicación transparente a pasajeros y reprogramación de itinerarios sin sobrecosto.',
        },
      ],
    },
    {
      nombre: 'Dirección Estratégica',
      casos: [
        {
          titulo: 'Estrategia de Posicionamiento de Santa Cruz de la Sierra como Destino de Eventos y Convenciones (MICE)',
          contenido:
            'Plan de atracción de congresos latinoamericanos, conformación del Convention & Visitors Bureau y articulación entre hoteles, recintos feriales y aerolíneas.',
        },
        {
          titulo: 'Desarrollo de Alianzas Estratégicas entre Turismo Comunitario y Operadores Mayoristas Internacionales',
          contenido:
            'Modelo de gobernanza comunitaria con distribución equitativa de ingresos, capacitación a guías locales nativos y estándares de calidad para turistas europeos.',
        },
      ],
    },
    {
      nombre: 'Desarrollo de Negocios',
      casos: [
        {
          titulo: 'Modelo de Negocio para Complejo de Glamping Sostenible en los Valles Interandinos',
          contenido:
            'Estudio de factibilidad ambiental y financiera, arquitectura bioclimática con domos geodésicos, energías solares y oferta de bienestar (wellness).',
        },
        {
          titulo: 'Creación de App Móvil de Guía Turística Autoguiada con Realidad Aumentada',
          contenido:
            'Modelo de monetización freemium, geolocalización de hitos históricos coloniales y convenios comerciales con restaurantes y museos de la ciudad.',
        },
      ],
    },
  ],

  // =========================================================================
  // 11. INDUSTRIAL Y COMERCIAL (FCT)
  // =========================================================================
  'Industrial y Comercial': [
    {
      nombre: 'Producción',
      casos: [
        {
          titulo: 'Implementación de Metodología Lean Manufacturing y Mapeo de Flujo de Valor (VSM) en Planta Metalmecánica',
          contenido:
            'Eliminación de despilfarros (muda), balanceo de líneas de ensamblaje, estandarización de operaciones 5S y reducción de tiempos de ciclo (Takt Time).',
        },
        {
          titulo: 'Diseño del Plan Maestro de Producción (MPS) y Planificación de Requerimientos de Materiales (MRP II)',
          contenido:
            'Modelación en ERP de listas de materiales (BOM), pronósticos de demanda con suavizamiento exponencial y cálculo de stock de seguridad para evitar desabastecimientos.',
        },
      ],
    },
    {
      nombre: 'Apoyo Técnico 1',
      casos: [
        {
          titulo: 'Plan de Mantenimiento Productivo Total (TPM) y Cálculo del OEE en Línea de Embotellado de Bebidas',
          contenido:
            'Diseño de planes de mantenimiento autónomo y preventivo, reducción del tiempo de paradas imprevistas y maximización de la eficiencia global de equipos (OEE > 85%).',
        },
        {
          titulo: 'Control Estadístico de Procesos (SPC) y Análisis de Capacidad de Máquina en Inyección de Plásticos',
          contenido:
            'Construcción de gráficos de control X-barra y R, cálculo de índices Cp y Cpk, y análisis de causa raíz (Ishikawa) ante defectos de rebaba y alabeo.',
        },
      ],
    },
    {
      nombre: 'Apoyo Técnico 2',
      casos: [
        {
          titulo: 'Diseño del Sistema de Gestión de Seguridad y Salud en el Trabajo bajo Norma ISO 45001',
          contenido:
            'Matriz de Identificación de Peligros y Evaluación de Riesgos (IPER) en planta química, plan de emergencias y ergonomía en puestos de trabajo operativos.',
        },
        {
          titulo: 'Optimización de Rutas de Distribución y Gestión de Inventarios mediante Algoritmos Heurísticos',
          contenido:
            'Resolución del problema de enrutamiento de vehículos (VRP) con flota propia para distribución urbana de productos de consumo masivo.',
        },
      ],
    },
    {
      nombre: 'Evaluación Financiera de Proyectos 1',
      casos: [
        {
          titulo: 'Estudio de Factibilidad Técnico-Económica para la Instalación de una Planta Extractora de Aceite de Sésamo',
          contenido:
            'Determinación del tamaño óptimo de planta, selección de tecnología de prensado en frío, localización geográfica y presupuesto de inversión en activos fijos.',
        },
        {
          titulo: 'Evaluación Financiera y Análisis de Riesgo Cuantitativo para Fábrica de Bloques de Hormigón Celular',
          contenido:
            'Estimación de flujo de fondos, cálculo de costo de capital, tasa interna de retorno (TIR) y simulación de escenarios pesimista, base y optimista.',
        },
      ],
    },
    {
      nombre: 'Evaluación Financiera de Proyectos 2',
      casos: [
        {
          titulo: 'Análisis de Reemplazo de Equipos Industriales Obsoletos por Maquinaria Automatizada CNC',
          contenido:
            'Cálculo del Costo Anual Uniforme Equivalente (CAUE), depreciación acelerada, ahorro en mano de obra directa y valor de salvamento de activos antiguos.',
        },
        {
          titulo: 'Estructuración de Financiamiento Bancario y Fondos de Garantía (FOGICP) para Proyecto Industrial',
          contenido:
            'Diseño de plan de amortización con periodo de gracia, garantías reales hipotecarias e industriales y cumplimiento de covenants financieros.',
        },
      ],
    },
  ],

  // =========================================================================
  // 12. MECÁNICA (FCT)
  // =========================================================================
  Mecánica: [
    {
      nombre: 'Mecánica de Equipos Agroindustriales',
      casos: [
        {
          titulo: 'Diseño y Cálculo Estructural de Sinfín Transportador y Elevador de Cangilones para Granos Limpios',
          contenido:
            'Cálculo de potencia requerida, esfuerzos torso-flectores en ejes de transmisión, selección de rodamientos de apoyo y cálculo de fatiga bajo norma ANSI/ASME.',
        },
        {
          titulo: 'Mantenimiento y Diagnóstico Vibracional en Turbomaquinaria de Ingenio Azucarero',
          contenido:
            'Análisis espectral de vibraciones mecánicas en turbinas de vapor y desmenuzadoras para detección de desalineación, desbalanceo dinámico y holguras mecánicas.',
        },
      ],
    },
    {
      nombre: 'Mecánica de Máquinas Agroindustriales',
      casos: [
        {
          titulo: 'Optimización del Sistema Hidráulico de Transmisión Hidrostática en Cosechadora de Granos',
          contenido:
            'Dimensionamiento de bombas de pistones axiales de caudal variable, cálculo de caídas de presión en mangueras hidráulicas y selección de filtros de alta presión.',
        },
        {
          titulo: 'Diseño de Sistema de Limpieza y Cribado Vibratorio con Dinámica Multicuerpo',
          contenido:
            'Modelación cinemática de mecanismos de cuatro barras, cálculo de frecuencias naturales para evitar resonancia destructiva y selección de silentblocks amortiguadores.',
        },
      ],
    },
    {
      nombre: 'Mecánica de Sistemas Automotrices',
      casos: [
        {
          titulo: 'Diagnóstico Electrónico Avanzado de Redes de Comunicación Multiplexadas CAN Bus en Vehículos Pesados',
          contenido:
            'Uso de osciloscopio automotriz para análisis de forma de onda digital, identificación de fallos de bus off, terminaciones resistivas y sensores inteligentes.',
        },
        {
          titulo: 'Evaluación y Rediseño de Sistema de Suspensión Neumática y Frenos Antibloqueo (EBS) en Semirremolques',
          contenido:
            'Cálculo de transferencia de carga en frenado de pánico, curvas de desaceleración y calibración de válvulas moduladoras de presión electrónica.',
        },
      ],
    },
    {
      nombre: 'Mecánica de Equipos Industriales',
      casos: [
        {
          titulo: 'Inspección No Destructiva (NDT) por Ultrasonido y Líquidos Penetrantes en Recipientes a Presión',
          contenido:
            'Elaboración del plan de inspección técnica según Código ASME Sección VIII División 1, evaluación de discontinuidades de soldadura y recálculo de vida útil remanente.',
        },
        {
          titulo: 'Diseño de Puente Grúa Birraíl de 20 Toneladas con Polipasto Eléctrico de Cable',
          contenido:
            'Cálculo de vigas cajón principales bajo norma CMAA 70, cálculo de flecha estática máxima y dimensionamiento de motores de traslación con variador de frecuencia.',
        },
      ],
    },
    {
      nombre: 'Mecánica de Motores Automotrices',
      casos: [
        {
          titulo: 'Reparación Mayor (Overhaul) y Calibración de Sistema de Inyección Diésel Common Rail de Alta Presión',
          contenido:
            'Medición metrológica de tolerancias de desgaste en cilindros y cigüeñal, prueba en banco de inyectores piezoeléctricos y ajuste de mapa de inyección en ECU.',
        },
        {
          titulo: 'Conversión y Homologación de Motor de Ciclo Otto a Gas Natural Vehicular (GNV) de 5ta Generación',
          contenido:
            'Cálculo de relación estequiométrica, mapeo de tiempos de inyección de gas, instalación de emuladores y pruebas de emisiones contaminantes bajo norma Euro.',
        },
      ],
    },
  ],

  // =========================================================================
  // 13. ELECTRÓNICA Y SISTEMAS (FCT)
  // =========================================================================
  'Electrónica y Sistemas': [
    {
      nombre: 'Automatismos Electrónicos',
      casos: [
        {
          titulo: 'Automatización de Celda Robotizada de Paletizado con PLC Industrial y Lenguaje Ladder/Grafcet',
          contenido:
            'Programación de PLC Siemens S7-1500, comunicación Profinet con variadores de frecuencia, barreras de seguridad óptica SIL 3 y diseño de pantalla HMI en TIA Portal.',
        },
        {
          titulo: 'Diseño de Sistema SCADA para el Monitoreo Remoto de Pozos de Extracción de Agua Potable',
          contenido:
            'Integración de telemetría por radioenlace celular/IoT, base de datos histórica, alarmas automáticas por SMS/Telegram y reporte de tendencias de caudal y presión.',
        },
      ],
    },
    {
      nombre: 'Instrumentación Electrónica y Procesos',
      casos: [
        {
          titulo: 'Selección y Calibración de Lazos de Control de Presión y Temperatura con Transmisores HART',
          contenido:
            'Configuración de transmisores inteligentes de 4-20 mA con protocolo HART, diseño de barreras intrínsecamente seguras para atmósferas explosivas (ATEX) y pruebas de bucle.',
        },
        {
          titulo: 'Diseño de Sistema de Pesaje Dinámico Continuo en Fajas Transportadoras de Minerales',
          contenido:
            'Implementación de celdas de carga extensométricas de alta precisión, acondicionamiento de señal con amplificadores de instrumentación y filtrado digital de ruido mecánico.',
        },
      ],
    },
    {
      nombre: 'Sistemas de Electricidad y Electrónica de Potencia',
      casos: [
        {
          titulo: 'Diseño de Convertidor DC-DC Reductor (Buck) de Alta Eficiencia con Control por Ancho de Pulso (PWM)',
          contenido:
            'Cálculo de inductores de potencia, selección de MOSFETs de carburo de silicio (SiC), diseño de circuitos de disparo (gate drivers) y disipación térmica activa.',
        },
        {
          titulo: 'Instalación y Parametrización de Inversores Solares Trifásicos Conectados a Red (Grid-Tied)',
          contenido:
            'Sincronización automática de fase mediante bucle de enganche de fase (PLL), protección anti-isla conforme a norma IEEE 1547 y mitigación de armónicos THD < 3%.',
        },
      ],
    },
    {
      nombre: 'Diseño de Control',
      casos: [
        {
          titulo: 'Sintonización de Controladores PID con Algoritmos de Lógica Difusa (Fuzzy Logic) para Hornos Industriales',
          contenido:
            'Modelado matemático de la planta térmica con tiempo muerto, sintonización por Ziegler-Nichols y optimización difusa para eliminar sobrepasos porcentuales.',
        },
        {
          titulo: 'Diseño de Control por Espacio de Estados y Observador de Luenberger para Servomotor de Precisión',
          contenido:
            'Cálculo de matrices de controlabilidad y observabilidad, ubicación óptima de polos mediante asignación cuadrática (LQR) y simulación en MATLAB/Simulink.',
        },
      ],
    },
    {
      nombre: 'Evaluación de Prototipado',
      casos: [
        {
          titulo: 'Diseño y Fabricación de Placa de Circuito Impreso (PCB) Multicapa para Sistema IoT con Módulo ESP32',
          contenido:
            'Trazado en Altium/KiCad aplicando normas de Compatibilidad Electromagnética (EMC), enrutamiento de señales diferenciales de alta velocidad y prototipado SMD.',
        },
        {
          titulo: 'Validación de Hardware en el Bucle (Hardware-in-the-Loop - HIL) para Sistema de Control de Tráfico Inteligente',
          contenido:
            'Emulación en tiempo real de sensores inductivos y controladores semafóricos para validar algoritmos adaptativos de tráfico urbano.',
        },
      ],
    },
  ],

  // =========================================================================
  // 14. INGENIERÍA ELÉCTRICA (FCT)
  // =========================================================================
  'Ingeniería Eléctrica': [
    {
      nombre: 'Sistemas de Generación con Energías Alternativas',
      casos: [
        {
          titulo: 'Diseño y Dimensionamiento de Sistema Híbrido Solar-Diésel con Banco de Baterías de Litio para Comunidad Aislada',
          contenido:
            'Estudio de recurso solar (PVSyst), dimensionamiento de generadores fotovoltaicos, cálculo de autonomía de almacenamiento y sistema de gestión de energía (EMS).',
        },
        {
          titulo: 'Estudio de Impacto de la Integración de Parque Solar de 50 MW al Sistema Interconectado Nacional (SIN)',
          contenido:
            'Análisis de flujo de potencia, estabilidad transitoria de tensión y frecuencia, y cumplimiento de código de red boliviano ante eventos de huecos de tensión (LVRT).',
        },
      ],
    },
    {
      nombre: 'Máquinas e Instalaciones Eléctricas',
      casos: [
        {
          titulo: 'Diseño de Subestación Eléctrica Transformadora de 115/24.9 kV de 25 MVA para Complejo Industrial',
          contenido:
            'Cálculo de corrientes de cortocircuito trifásico y monofásico, selección de transformadores de potencia, interruptores en SF6 y coordinación de aislamiento.',
        },
        {
          titulo: 'Diseño de Malla de Puesta a Tierra y Protección Atmosférica bajo Normas IEEE 80 e IEC 62305',
          contenido:
            'Medición de resistividad del terreno con telurómetro (método Wenner), modelación de estratos del suelo, cálculo de tensiones de paso y de contacto admisibles.',
        },
      ],
    },
    {
      nombre: 'Líneas de Transmisión y Redes de Distribución',
      casos: [
        {
          titulo: 'Cálculo Mecánico y Eléctrico de Línea de Transmisión Aérea en 230 kV de 120 km de Longitud',
          contenido:
            'Selección de conductores ACSR, cálculo de vanos máximos, tablas de tendido y tensado (flecha-temperatura) bajo diferentes hipótesis climáticas y diseño de torres reticuladas.',
        },
        {
          titulo: 'Planificación de Redes de Distribución Primaria en Media Tensión con Reclosers y Seccionadores Telegestionados',
          contenido:
            'Sectorización de alimentadores para mejorar índices de continuidad SAIDI y SAIFI, minimización de pérdidas técnicas y coordinación de fusibles e interruptores.',
        },
      ],
    },
    {
      nombre: 'Simulaciones de Redes Eléctricas',
      casos: [
        {
          titulo: 'Simulación de Flujo Óptimo de Cargas y Análisis de Contingencias N-1 con Software Especializado (DigSILENT / ETAP)',
          contenido:
            'Identificación de sobrecargas térmicas en transformadores y líneas, perfiles de tensión fuera de banda y propuesta de bancos de capacitores automáticos.',
        },
        {
          titulo: 'Estudio de Transitorios Electromagnéticos por Maniobra de Interruptores en Líneas de Extra Alta Tensión (EMTP/ATP)',
          contenido:
            'Modelación de sobretensiones transitorias de maniobra, dimensionamiento de descargadores de sobretensión (pararrayos de óxido de zinc) y resistencia de preinserción.',
        },
      ],
    },
    {
      nombre: 'Aplicaciones para la Industria',
      casos: [
        {
          titulo: 'Auditoría de Calidad de Energía Eléctrica y Compensación de Armónicos en Planta Siderúrgica',
          contenido:
            'Medición con analizador de redes según norma IEEE 519, análisis de distorsión armónica total (THD), flicker y diseño de filtros pasivos/activos de armónicos.',
        },
        {
          titulo: 'Estrategia de Eficiencia Energética Eléctrica y Gestión de la Demanda bajo Norma ISO 50001',
          contenido:
            'Línea base energética, sustitución de motores por alta eficiencia IE3/IE4, corrección de factor de potencia para evitar penalizaciones tarifarias por energía reactiva.',
        },
      ],
    },
  ],
};

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================
async function main() {
  console.log('========================================================================');
  console.log('🚀 POBLACIÓN DE BANCO DE CASOS: 14 CARRERAS RESTANTES (UTEPSA)');
  console.log('========================================================================\n');

  const inicio = Date.now();
  let totalCasosAgregados = 0;
  let totalAreasProcesadas = 0;

  for (const [carreraNombre, areas] of Object.entries(CASOS_14_CARRERAS)) {
    const carrera = await prisma.carrera.findFirst({
      where: { nombre: carreraNombre },
      include: { planesEstudio: true },
    });

    if (!carrera) {
      console.warn(`⚠️ Carrera "${carreraNombre}" no encontrada en la BD. Omitiendo.`);
      continue;
    }

    // Asegurar plan vigente
    let plan = carrera.planesEstudio.find((p) => p.estadoVigencia === 'VIGENTE');
    if (!plan) {
      plan = await prisma.planEstudio.create({
        data: {
          idCarrera: carrera.idCarrera,
          nombre: 'Plan 2026',
          estadoVigencia: 'VIGENTE',
        },
      });
    }

    let casosCarreraAgregados = 0;

    for (const areaDef of areas) {
      totalAreasProcesadas++;

      // Buscar o crear área
      let area = await prisma.areaAcademica.findFirst({
        where: {
          idCarrera: carrera.idCarrera,
          nombre: areaDef.nombre,
        },
      });

      if (!area) {
        area = await prisma.areaAcademica.create({
          data: {
            idCarrera: carrera.idCarrera,
            nombre: areaDef.nombre,
            umbralDisponibilidad: 2,
            estado: 'ACTIVO',
          },
        });
      }

      // Asegurar relación PlanArea
      const planAreaExistente = await prisma.planArea.findUnique({
        where: {
          idPlanEstudio_idArea: {
            idPlanEstudio: plan.idPlanEstudio,
            idArea: area.idArea,
          },
        },
      });

      if (!planAreaExistente) {
        await prisma.planArea.create({
          data: {
            idPlanEstudio: plan.idPlanEstudio,
            idArea: area.idArea,
          },
        });
      }

      // Crear los casos si no existen por título
      for (const caso of areaDef.casos) {
        const casoExistente = await prisma.casoEstudio.findFirst({
          where: {
            idArea: area.idArea,
            titulo: caso.titulo,
          },
        });

        if (!casoExistente) {
          await prisma.casoEstudio.create({
            data: {
              idArea: area.idArea,
              titulo: caso.titulo,
              contenido: caso.contenido,
              estado: 'DISPONIBLE',
            },
          });
          casosCarreraAgregados++;
          totalCasosAgregados++;
        }
      }
    }

    console.log(
      `   ✅ [${carreraNombre}]: ${areas.length} áreas verificadas, +${casosCarreraAgregados} casos nuevos agregados.`,
    );
  }

  const duracion = ((Date.now() - inicio) / 1000).toFixed(2);
  console.log('\n========================================================================');
  console.log(`🎉 POBLACIÓN DE 14 CARRERAS FINALIZADA EN ${duracion}s`);
  console.log(`   Total Áreas Verificadas: ${totalAreasProcesadas}`);
  console.log(`   Total Casos Nuevos Insertados: ${totalCasosAgregados}`);
  console.log('========================================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la población de casos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
