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

// ============================================================================
// DATOS DEL BANCO DE CASOS DE ESTUDIO POR CARRERA Y ÁREA
// ============================================================================

interface CasoDef {
  titulo: string;
  contenido: string;
}

interface AreaCasosDef {
  areaNombre: string;
  umbralDisponibilidad?: number;
  casos: CasoDef[];
}

const BANCO_CASOS: Record<string, AreaCasosDef[]> = {
  Sistemas: [
    {
      areaNombre: 'Desarrollo de Software y Base de Datos',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Arquitectura de Microservicios y Transaccionalidad Distribuida en Billetera Móvil',
          contenido:
            'Una fintech nacional experimenta cuellos de botella en su backend monolítico durante campañas promocionales de alta concurrencia. El postulante debe diseñar la transición a una arquitectura orientada a microservicios utilizando el patrón Saga para la orquestación de transferencias interbancarias, garantizando consistencia eventual, idempotencia en endpoints de pago y resiliencia ante fallos con circuit breakers.',
        },
        {
          titulo: 'Optimización y Modelado de Base de Datos para Motor de Facturación Masiva Electrónica',
          contenido:
            'Una empresa de retail a nivel nacional requiere emitir más de 200.000 facturas electrónicas diarias conectadas al SIN. Se requiere diseñar el modelo relacional normalizado con particionamiento de tablas por rango temporal (sharding/partitioning), índices compuestos B-Tree y GiST, además de una estrategia de sincronización asíncrona mediante colas de mensajería (RabbitMQ/Kafka) para el almacenamiento de XMLs firmados.',
        },
        {
          titulo: 'Plataforma Omnicanal de Gestión Hospitalaria y Expediente Clínico Electrónico (EHR)',
          contenido:
            'Una red de clínicas privadas necesita unificar el expediente clínico de pacientes entre distintas sucursales. El estudiante debe formular el diseño de una API RESTful segura con estándares FHIR/HL7, autenticación federada con OAuth2/OpenID Connect, y almacenamiento cifrado en reposo para datos sensibles de salud conforme a normativas de privacidad.',
        },
        {
          titulo: 'Sistema de Trazabilidad Logística en Tiempo Real con Arquitectura Event-Driven',
          contenido:
            'Una empresa de transporte de carga pesada requiere monitorear rutas, paradas y telemetría de 500 camiones en tiempo real. Diseñar la arquitectura orientada a eventos utilizando WebSockets, base de datos temporal (TimescaleDB) y geocercas en Redis para emitir alertas automáticas de desvío de ruta y paradas no autorizadas.',
        },
      ],
    },
    {
      areaNombre: 'Ciberseguridad',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Plan de Respuesta a Incidentes y Recuperación ante Ataque de Ransomware en Infraestructura Bancaria',
          contenido:
            'Una entidad de intermediación financiera sufre un compromiso de credenciales privilegiadas y cifrado parcial de servidores de archivos. El estudiante debe estructurar el procedimiento de aislamiento de red (air-gap), erradicación de amenazas, análisis forense digital de artefactos volátiles (RAM y logs de Active Directory) y restauración segura basada en backups inmutables.',
        },
        {
          titulo: 'Implementación de Modelo Zero Trust (ZTA) y Segmentación de Red en Institución Universitaria',
          contenido:
            'Una universidad con más de 25.000 usuarios entre estudiantes, docentes y administrativos sufre filtraciones periódicas de exámenes. Se solicita diseñar la arquitectura de confianza cero aplicando autenticación basada en contexto, políticas estrictas de Least Privilege, microsegmentación de subredes VLAN y control de acceso a la red (802.1X).',
        },
        {
          titulo: 'Auditoría de Seguridad Ofensiva (Pentesting) y Análisis Estático de Código (SAST/DAST)',
          contenido:
            'Una plataforma de banca web presenta vulnerabilidades reportadas por auditoría externa (inyecciones SQL, Broken Object Level Authorization y CORS mal configurado). Formular el plan de mitigación en el pipeline CI/CD integrando SonarQube, OWASP ZAP y pruebas de regresión de seguridad automatizadas.',
        },
        {
          titulo: 'Diseño de Centro de Operaciones de Seguridad (SOC) y Reglas de Detección SIEM',
          contenido:
            'Diseño e implementación de un SOC de nivel 1 y 2 para una cooperativa de ahorro y crédito. Definir las fuentes de ingestión de logs (firewalls NGFW, EDR, servidores web), correlación de eventos con MITRE ATT&CK y automatización de respuestas (SOAR) para mitigar ataques de fuerza bruta y phishing dirigido.',
        },
      ],
    },
    {
      areaNombre: 'Ingeniería y Calidad de Software',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Diseño de Pipeline de Entrega Continua (CI/CD) con Estrategia de Despliegue Blue-Green y Canario',
          contenido:
            'Una empresa de software SaaS experimenta caídas del servicio durante despliegues en producción. El postulante debe diseñar una infraestructura de entrega continua en Kubernetes, incorporando pruebas automatizadas unitarias, de integración y rendimiento (JMeter), con rollbacks automáticos ante aumento de errores HTTP 5xx.',
        },
        {
          titulo: 'Modernización de Deuda Técnica y Refactorización a Patrones de Diseño Limpio (Hexagonal / Clean Architecture)',
          contenido:
            'Un software ERP legacy de 10 años escrito en PHP carece de pruebas automatizadas y presenta alto acoplamiento en la capa de datos. Estructure la estrategia de estrangulación del monolito (Strangler Fig Pattern) hacia una arquitectura limpia hexagonal con Domain-Driven Design (DDD), pruebas con mocks y linters estrictos.',
        },
        {
          titulo: 'Marco de Aseguramiento de Calidad de Software (QA) para Sistema Crítico de Telemedicina',
          contenido:
            'Diseñar el plan maestro de pruebas (PMP) bajo norma ISO/IEC/IEEE 29119 para una aplicación de asistencia médica remota. Se debe definir la pirámide de pruebas, métricas de cobertura de código (>80%), pruebas de estrés de llamadas WebRTC y pruebas de accesibilidad web WCAG 2.1 AA.',
        },
      ],
    },
    {
      areaNombre: 'Infraestructura de TI',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Estrategia de Migración y Modernización hacia Nube Híbrida con Infraestructura como Código (IaC)',
          contenido:
            'Una corporación con data center on-premise al 90% de capacidad desea migrar sus cargas críticas a AWS/Azure. Formular el plan de migración utilizando Terraform para el aprovisionamiento automatizado, VPN Site-to-Site redundante, balanceadores de carga y almacenamiento escalable S3/Blob con políticas de ciclo de vida.',
        },
        {
          titulo: 'Plan de Continuidad del Negocio (BCP) y Recuperación ante Desastres (DRP) con RTO < 1h y RPO < 15min',
          contenido:
            'Un proveedor de servicios de internet y telecomunicaciones requiere certificar su DRP ante la ATT. Diseñar la topología de replicación síncrona/asíncrona entre centros de datos principal y alterno, conmutación automática por fallo (failover DNS Anycast) y matrices de escalamiento de incidentes críticos.',
        },
        {
          titulo: 'Orquestación y Virtualización de Alta Disponibilidad para Clústeres de Cómputo Empresarial',
          contenido:
            'Implementación de un clúster VMware vSphere / Proxmox VE con almacenamiento compartido SAN por iSCSI. Configurar políticas de High Availability (HA), Distributed Resource Scheduler (DRS), tolerancia a fallos de tarjetas de red (NIC Teaming) y backups incrementales sintéticos con deduplicación.',
        },
      ],
    },
    {
      areaNombre: 'Inteligencia Artificial',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Sistema Predictivo de Calificación Crediticia (Credit Scoring) con Machine Learning Explicable (XAI)',
          contenido:
            'Una entidad financiera desea reducir el índice de morosidad mediante un modelo de clasificación supervisada (XGBoost / Random Forest). El postulante debe estructurar la preparación del dataset, balanceo de clases (SMOTE), validación cruzada y la interpretación de decisiones crediticias mediante valores SHAP para cumplir con la regulación financiera.',
        },
        {
          titulo: 'Asistente Virtual Institucional con Arquitectura RAG (Retrieval-Augmented Generation) y Embeddings Vectoriales',
          contenido:
            'Diseño de un agente conversacional para soporte a estudiantes sobre trámites de titulación y reglamentos. Implementar un pipeline de ingestión documental, fragmentación de textos (chunking), generación de embeddings con base de datos vectorial (pgvector / Qdrant) y controles de seguridad (prompt injection y alucinaciones).',
        },
        {
          titulo: 'Detección Automatizada de Fraude en Transacciones Financieras con Redes Neuronales y Grafos',
          contenido:
            'Detección de patrones anómalos de lavado de dinero y transferencias fraccionadas (pitufeo). El postulante debe modelar las cuentas y transacciones como un grafo de conocimiento, aplicando Graph Neural Networks (GNN) y algoritmos de clustering para identificar comunidades fraudulentas en tiempo cuasi-real.',
        },
      ],
    },
  ],

  Derecho: [
    {
      areaNombre: 'Derecho Penal',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Teoría del Caso y Valoración de Prueba Pericial Informática en Delitos de Estafa Digital y Phishing Bancario',
          contenido:
            'Se investiga una organización criminal por transferencias no autorizadas mediante accesos clonados a banca en línea de más de 30 víctimas. El postulante debe sustentar la teoría del caso de la parte querellante o defensora, analizando la cadena de custodia digital, trazabilidad de direcciones IP, y excepciones procesales por defecto en la imputación formal.',
        },
        {
          titulo: 'Juicio Oral y Debate Dogmático en Delito de Legítima Defensa vs. Exceso en las Causas de Justificación',
          contenido:
            'En un asalto a mano armada a un establecimiento comercial, el propietario repele el ataque disparando al agresor en retirada. Desarrolle los fundamentos dogmáticos de antijuridicidad, elemento subjetivo de justificación y necesidad racional del medio empleado según la jurisprudencia del Tribunal Supremo de Justicia.',
        },
        {
          titulo: 'Medidas Cautelares de Carácter Personal y Peligros Procesales de Fuga y Obstaculización',
          contenido:
            'Audiencia de medidas cautelares en proceso por delitos contra la administración pública. Diseñe la estrategia argumentativa de la defensa técnica para desvirtuar el riesgo de fuga mediante acreditación de arraigo natural y económico idóneo, proponiendo medidas sustitutivas a la detención preventiva conforme a la Ley 1173.',
        },
      ],
    },
    {
      areaNombre: 'Derecho Civil',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Acción Reivindicatoria y Tercería de Dominio Excluyente en Predios Urbanos con Superposición Registral',
          contenido:
            'Conflicto de derecho propietario entre dos adquirientes de buena fe sobre un mismo inmueble urbano con folios reales duplicados por error de Derechos Reales. El estudiante debe plantear la demanda ordinaria civil de mejor derecho de propiedad, prescripción adquisitiva decenal y nulidad de asiento registral.',
        },
        {
          titulo: 'Resolución Contractual por Incumplimiento con Cláusula Penal y Resarcimiento de Daños en Contrato Inmobiliario',
          contenido:
            'Una constructora incumple la entrega de un edificio de departamentos en la fecha pactada alegando fuerza mayor (crisis de materiales). Analice la mora automática, la validez de la cláusula penal, el principio pacta sunt servanda y la liquidación pericial de lucro cesante y daño emergente.',
        },
        {
          titulo: 'Proceso Extraordinario de Desalojo por Falta de Pago y Régimen de Retención por Mejoras Útiles y Necesarias',
          contenido:
            'Contrato de arrendamiento comercial de larga data donde el arrendatario adeuda 8 cánones de alquiler pero reclama compensación por inversiones estructurales de alto costo realizadas sin autorización expresa por escrito. Formule la contestación y reconvención civil correspondiente.',
        },
      ],
    },
    {
      areaNombre: 'Derecho Comercial',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Disolución y Liquidación de Sociedad de Responsabilidad Limitada por Imposibilidad Manifiesta del Objeto Social',
          contenido:
            'Una SRL con dos socios al 50% cae en parálisis orgánica irreconciliable que impide la aprobación de balances anuales y la renovación de licencias operativas. Estructure el procedimiento de disolución judicial, designación de liquidador y plan de pago con prelación legal de créditos.',
        },
        {
          titulo: 'Acción Ejecutiva Cambiaria por Pagaré con Cláusula de Interés Penal y Excepción de Falsedad Material',
          contenido:
            'Demanda ejecutiva mercantil para el cobro de un pagaré con aval solidario por $us 150.000. El demandado interpone excepciones de inhabilidad de título y alteración del monto original. El postulante debe sustentar la contestación a las excepciones y el régimen probatorio mercantil aplicable.',
        },
        {
          titulo: 'Responsabilidad Societaria de los Administradores por Quiebra Culposa y Fraude a los Acreedores',
          contenido:
            'El directorio de una sociedad anónima desvía fondos corporativos a subsidiarias vinculadas previo a solicitar la cesación de pagos. Diseñe la acción de responsabilidad de los administradores (actio mandati) y las medidas precautorias para cautelar el patrimonio social en resguardo de la masa acreedora.',
        },
      ],
    },
    {
      areaNombre: 'Derecho Constitucional',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Acción de Amparo Constitucional por Vulneración del Derecho al Debido Proceso y Defensa Técnica en Sumario Administrativo',
          contenido:
            'Un servidor público de carrera es destituido mediante resolución sancionatoria sin que se le permitiera acceder al cuaderno de investigación ni interrogar a testigos de cargo. Elabore el memorial de Acción de Amparo Constitucional invocando la doctrina vinculante del TCP sobre motivación de resoluciones.',
        },
        {
          titulo: 'Acción Popular por Afectación al Medio Ambiente y Recursos Hídricos por Explotación Minera Ilegal',
          contenido:
            'Una comunidad campesina denuncia contaminación con mercurio en la cuenca de un río por concesiones mineras que operan sin licencia ambiental ni consulta previa. Formule la Acción Popular solicitando la paralización inmediata de faenas, remediación ambiental y medidas cautelares constitucionales.',
        },
        {
          titulo: 'Acción de Libertad por Dilación Indebida en la Resolución de Cesación a la Detención Preventiva',
          contenido:
            'El juzgado cautelar suspende por cuarta vez consecutiva la audiencia de cesación de detención preventiva de un imputado por falta de traslado del recinto penitenciario. Redacte la acción tutelar en su modalidad traslativa o de pronto despacho para restituir el ejercicio efectivo de la libertad personal.',
        },
      ],
    },
  ],

  'Redes y Telecomunicaciones': [
    {
      areaNombre: 'Servicios de Telecomunicaciones',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Despliegue y Dimensionamiento de Red FTTH (Fiber to the Home) con Tecnología GPON/XGS-PON',
          contenido:
            'Un operador de telecomunicaciones planifica desplegar fibra óptica hasta el hogar en una nueva zona urbanizada de 10.000 viviendas. El estudiante debe calcular el presupuesto óptico (power budget), diseñar la topología de splitters en cascada (1:8 y 1:16), seleccionar los equipos OLT/ONT y definir la calidad de servicio (QoS) para tráfico de IPTV y voz sobre IP.',
        },
        {
          titulo: 'Migración de Telefonía Tradicional TDM hacia Infraestructura de Voz sobre IP (VoIP) con SIP Trunking y SBC',
          contenido:
            'Una entidad pública con 15 agencias descentralizadas reemplaza su central telefónica analógica por una solución de telefonía IP corporativa. Formular el diseño con redundancia geográfica mediante Session Border Controllers (SBC), códecs adaptativos (G.711 / G.729), y mecanismos de seguridad SRTP y TLS para evitar fraudes por llamadas internacionales.',
        },
        {
          titulo: 'Planificación de Enlaces de Microondas Punto a Punto de Alta Capacidad para Zonas Rurales',
          contenido:
            'Diseño de un enlace microondas de 35 km en la banda de 7 GHz para conectar una población rural a la red troncal nacional. Se requiere calcular el despeje de la zona de Fresnel, considerar el factor de atenuación por lluvia (modelo UIT-R P.530), desvanecimiento multicamino y garantizar una disponibilidad anual del 99.995%.',
        },
      ],
    },
    {
      areaNombre: 'Gestión de Redes',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Implementación de Plataforma de Monitoreo Centralizado NMS con SNMPv3 y Telemetría por Streaming (gNMI)',
          contenido:
            'Un proveedor de servicios con más de 800 dispositivos de red (switches, routers, firewalls) necesita reemplazar su monitoreo reactivo por una plataforma predictiva. Diseñar la arquitectura con Prometheus/Grafana, recolectores SNMPv3 cifrados, definición de umbrales SLA (jitter, latencia, pérdida de paquetes) y generación automática de tickets en incidentes críticos.',
        },
        {
          titulo: 'Gestión Automatizada de Configuraciones y Cumplimiento de Políticas con Ansible y GitOps',
          contenido:
            'Automatización del aprovisionamiento y auditoría de configuraciones de 150 switches de acceso en múltiples campus. Desarrollar playbooks de Ansible para la aplicación homogénea de hardening (deshabilitación de telnet, configuración de SSHv2, NTP y Syslog centralizado) con control de versiones en GitLab.',
        },
        {
          titulo: 'Optimización de Ancho de Banda y Control de Tráfico Mediante Deep Packet Inspection (DPI) y Políticas QoS',
          contenido:
            'Una red corporativa sufre saturación en sus enlaces WAN debido al uso no corporativo de aplicaciones peer-to-peer y streaming de video. Se solicita diseñar la política de clasificación y marcado DiffServ (DSCP), colas de prioridad estricta (PQ) y weighted fair queuing (WFQ) para priorizar ERP y videoconferencias.',
        },
      ],
    },
    {
      areaNombre: 'Infraestructura de TI',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Diseño de Cableado Estructurado y Sala de Servidores (Data Center Tier II) bajo Norma TIA-942 y TIA-568',
          contenido:
            'Diseño integral de la infraestructura física para la nueva sede corporativa de una empresa de seguros (4 niveles, 600 puntos de red). El proyecto debe incluir cálculo de carga térmica para climatización de precisión (HVAC), sistema de energía ininterrumpida (UPS en paralelo redundante N+1), rutas de fibra monomodo OM4 y sistema de extinción por gas limpio (FM-200 / Novec).',
        },
        {
          titulo: 'Red de Almacenamiento SAN de Alto Rendimiento con Conmutadores Fibre Channel de 32 Gbps',
          contenido:
            'Una entidad hospitalaria requiere renovar el almacenamiento de su sistema PACS de imágenes médicas de alta resolución. Diseñar la topología de almacenamiento SAN en doble tela (Dual Fabric), zonificación dura por WWN (Hard Zoning), multipathing en servidores VMware y sincronización con centro de datos alterno.',
        },
      ],
    },
    {
      areaNombre: 'Diseño de Redes Corporativas',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Arquitectura SD-WAN (Software-Defined WAN) Multisede con Conectividad Híbrida MPLS e Internet',
          contenido:
            'Una cadena de farmacias con 120 sucursales en Bolivia desea optimizar costos de conectividad reduciendo enlaces MPLS costosos. El postulante debe diseñar una solución SD-WAN con túneles IPsec dinámicos, selección inteligente de ruta en tiempo real basada en métricas de latencia y jitter, y control centralizado desde la nube.',
        },
        {
          titulo: 'Diseño de Red de Campus con Núcleo Colapsado, Spanning Tree (MSTP) y Enrutamiento Dinámico OSPFv3 Multiárea',
          contenido:
            'Diseño de red corporativa de alta disponibilidad para un campus corporativo de 3 edificios. Implementar agregación de enlaces LACP (EtherChannel), redundancia de puerta de enlace por VRRP/HSRP, segmentación de subredes por departamento y enrutamiento dinámico jerárquico OSPF con áreas stub para optimización de tablas de enrutamiento.',
        },
        {
          titulo: 'Despliegue de Red Inalámbrica Wi-Fi 6 (802.11ax) de Alta Densidad con Roaming Transparente (802.11r/k/v)',
          contenido:
            'Diseño y estudio de cobertura (site survey predictivo) para un centro de convenciones y aulas universitarias con aforo simultáneo de 3.000 personas. Configurar controladoras WLAN en alta disponibilidad (SSO), balanceo de banda (Band Steering), autenticación 802.1X con servidor RADIUS (FreeRADIUS/Cisco ISE) y portal cautivo para invitados.',
        },
      ],
    },
    {
      areaNombre: 'Ciberseguridad',
      umbralDisponibilidad: 2,
      casos: [
        {
          titulo: 'Implementación de Cortafuegos de Próxima Generación (NGFW) y Prevención de Intrusiones (IPS/IDS) en Red Corporativa',
          contenido:
            'Una institución financiera experimenta intentos continuos de escaneo de puertos y explotación de vulnerabilidades en su perímetro. Diseñar e implementar la arquitectura perimetral con cluster activo-pasivo de NGFW (Fortinet/Palo Alto), inspección profunda SSL/TLS, políticas de filtrado DNS y perfiles de protección DoS/DDoS.',
        },
        {
          titulo: 'Segmentación de Red y Aislamiento de Tráfico IoT y Cámaras IP con Protocolo 802.1Q e Inspección DHCP Snooping',
          contenido:
            'Un complejo hospitalario incorpora más de 300 dispositivos médicos conectados y cámaras de videovigilancia vulnerables. El estudiante debe formular la estrategia de segmentación lógica por VLANs, aislamiento de puertos (Private VLANs), mitigación de ataques de envenenamiento ARP (Dynamic ARP Inspection) y protección contra suplantación de DHCP.',
        },
        {
          titulo: 'Despliegue de Red Privada Virtual (VPN) SSL con Autenticación Multifactor (MFA) para Teletrabajo Seguro',
          contenido:
            'Una corporación requiere garantizar acceso remoto cifrado para 400 colaboradores externos. Formular la arquitectura de VPN basada en TLS 1.3 con integración a Directorio Activo mediante SAML 2.0 y MFA, validación del estado de seguridad del endpoint (Host Checker) y registro exhaustivo de accesos para auditoría de cumplimiento.',
        },
      ],
    },
  ],
};

// ============================================================================
// DEFINICIÓN DE TRIBUNALES POR CARRERA
// ============================================================================

interface TribunalDef {
  presidente: string;
  secretario: string;
  vocal: string;
}

const TRIBUNALES_POR_CARRERA: Record<string, TribunalDef[]> = {
  Sistemas: [
    {
      presidente: 'Ing. Dennis Gomez Quiroga',
      secretario: 'Ing. Eivy Cuellar Menacho',
      vocal: 'Ing. Walter Carballo Ramos',
    },
    {
      presidente: 'Ing. Carlos Mendoza Vargas',
      secretario: 'Ing. Pamela Suárez Terrazas',
      vocal: 'Ing. Dennis Gomez Quiroga',
    },
    {
      presidente: 'Ing. Walter Carballo Ramos',
      secretario: 'Ing. Fernando Vaca Justiniano',
      vocal: 'Ing. Eivy Cuellar Menacho',
    },
  ],
  Derecho: [
    {
      presidente: 'Dr. Fernando Morales Roca',
      secretario: 'Dra. Patricia Méndez Suárez',
      vocal: 'Dr. Roberto Quinteros Alarcón',
    },
    {
      presidente: 'Dr. Roberto Quinteros Alarcón',
      secretario: 'Dra. Claudia Vaca Díez',
      vocal: 'Dr. Marco Antonio Salinas',
    },
    {
      presidente: 'Dra. Patricia Méndez Suárez',
      secretario: 'Dr. Fernando Morales Roca',
      vocal: 'Dra. Rosario Claros Paz',
    },
  ],
  'Redes y Telecomunicaciones': [
    {
      presidente: 'Ing. Rolando Vaca Díez Mercado',
      secretario: 'Ing. Dennis Gomez Quiroga',
      vocal: 'Ing. Marcelo Justiniano Banegas',
    },
    {
      presidente: 'Ing. Marcelo Justiniano Banegas',
      secretario: 'Ing. Walter Carballo Ramos',
      vocal: 'Ing. Rolando Vaca Díez Mercado',
    },
  ],
};

// ============================================================================
// DATOS DE ESTUDIANTES Y DEFENSAS A POBLAR
// ============================================================================

interface EstudianteDefensaSeed {
  carnetEstudiantil: string;
  carnetIdentidad: string;
  nombreCompleto: string;
  correo: string;
  estadoDefensa: 'PROGRAMADA' | 'AREA_SORTEADA' | 'CASO_ASIGNADO' | 'CALIFICADO';
  tipoDefensa: 'INTERNA' | 'EXTERNA';
  diasOffsetDefensa: number; // Negativo para pasadas, positivo para futuras
  nota?: number;
  resultado?: 'APROBADO' | 'REPROBADO';
  observaciones?: string;
  areaElegidaIndex?: number;
}

const ESTUDIANTES_DEFENSAS: Record<string, EstudianteDefensaSeed[]> = {
  Sistemas: [
    {
      carnetEstudiantil: 'SIS-20230101',
      carnetIdentidad: '9482103 SC',
      nombreCompleto: 'Mateo Alejandro Villarroel Cortez',
      correo: 'mateo.villarroel@estudiante.edu.bo',
      estadoDefensa: 'PROGRAMADA',
      tipoDefensa: 'INTERNA',
      diasOffsetDefensa: 7, // En 7 días (plazo FCT para sorteo conjunto)
      areaElegidaIndex: 0,
    },
    {
      carnetEstudiantil: 'SIS-20230102',
      carnetIdentidad: '8392014 CB',
      nombreCompleto: 'Luciana Belén Sandoval Paz',
      correo: 'luciana.sandoval@estudiante.edu.bo',
      estadoDefensa: 'AREA_SORTEADA',
      tipoDefensa: 'INTERNA',
      diasOffsetDefensa: 5,
      areaElegidaIndex: 1, // Ciberseguridad
    },
    {
      carnetEstudiantil: 'SIS-20230103',
      carnetIdentidad: '7281925 LP',
      nombreCompleto: 'Rodrigo Andrés Céspedes Suarez',
      correo: 'rodrigo.cespedes@estudiante.edu.bo',
      estadoDefensa: 'CASO_ASIGNADO',
      tipoDefensa: 'EXTERNA',
      diasOffsetDefensa: 3,
      areaElegidaIndex: 2, // Calidad de Software
    },
    {
      carnetEstudiantil: 'SIS-20230104',
      carnetIdentidad: '6391026 SC',
      nombreCompleto: 'Camila Nicole Justiniano Arteaga',
      correo: 'camila.justiniano@estudiante.edu.bo',
      estadoDefensa: 'CALIFICADO',
      tipoDefensa: 'INTERNA',
      diasOffsetDefensa: -2,
      nota: 96.5,
      resultado: 'APROBADO',
      observaciones:
        'Excelente sustentación técnica de microservicios con patrón Saga. Demostró dominio absoluto del framework y arquitecturas distribuidas.',
      areaElegidaIndex: 0,
    },
    {
      carnetEstudiantil: 'SIS-20230105',
      carnetIdentidad: '5829107 TJ',
      nombreCompleto: 'Sebastián Ignacio Torrez Mercado',
      correo: 'sebastian.torrez@estudiante.edu.bo',
      estadoDefensa: 'CALIFICADO',
      tipoDefensa: 'INTERNA',
      diasOffsetDefensa: -4,
      nota: 72.0,
      resultado: 'APROBADO',
      observaciones:
        'Aprobado satisfactoriamente. Se recomendó profundizar en métricas de disponibilidad y resiliencia ante caídas de nodos.',
      areaElegidaIndex: 4, // Inteligencia Artificial
    },
  ],

  Derecho: [
    {
      carnetEstudiantil: 'DER-20230201',
      carnetIdentidad: '8172635 SC',
      nombreCompleto: 'Valeria Jimena Barba Aguilera',
      correo: 'valeria.barba@estudiante.edu.bo',
      estadoDefensa: 'PROGRAMADA',
      tipoDefensa: 'INTERNA',
      diasOffsetDefensa: 6,
      areaElegidaIndex: 0,
    },
    {
      carnetEstudiantil: 'DER-20230202',
      carnetIdentidad: '9012386 LP',
      nombreCompleto: 'Gabriel Estefano Montero Justiniano',
      correo: 'gabriel.montero@estudiante.edu.bo',
      estadoDefensa: 'AREA_SORTEADA',
      tipoDefensa: 'INTERNA',
      diasOffsetDefensa: 4,
      areaElegidaIndex: 0, // Penal
    },
    {
      carnetEstudiantil: 'DER-20230203',
      carnetIdentidad: '6819207 CB',
      nombreCompleto: 'Natalia Jimena Claros Roca',
      correo: 'natalia.claros@estudiante.edu.bo',
      estadoDefensa: 'CASO_ASIGNADO',
      tipoDefensa: 'EXTERNA',
      diasOffsetDefensa: 2,
      areaElegidaIndex: 1, // Civil
    },
    {
      carnetEstudiantil: 'DER-20230204',
      carnetIdentidad: '7482918 SC',
      nombreCompleto: 'Mauricio Javier Antelo Melgar',
      correo: 'mauricio.antelo@estudiante.edu.bo',
      estadoDefensa: 'CALIFICADO',
      tipoDefensa: 'INTERNA',
      diasOffsetDefensa: -1,
      nota: 89.0,
      resultado: 'APROBADO',
      observaciones:
        'Sólida argumentación dogmática en derecho comercial y excepciones cambiarias. Respuestas precisas a las interrogantes del tribunal.',
      areaElegidaIndex: 2, // Comercial
    },
    {
      carnetEstudiantil: 'DER-20230205',
      carnetIdentidad: '6281929 PT',
      nombreCompleto: 'Fabiola Andrea Zeballos Hurtado',
      correo: 'fabiola.zeballos@estudiante.edu.bo',
      estadoDefensa: 'CALIFICADO',
      tipoDefensa: 'INTERNA',
      diasOffsetDefensa: -5,
      nota: 45.0,
      resultado: 'REPROBADO',
      observaciones:
        'Reprobada por insuficiencia probatoria y falta de fundamentación dogmática en la acción constitucional planteada. Deberá presentarse a segunda instancia.',
      areaElegidaIndex: 3, // Constitucional
    },
  ],

  'Redes y Telecomunicaciones': [
    {
      carnetEstudiantil: 'RED-20230301',
      carnetIdentidad: '8392101 SC',
      nombreCompleto: 'Alejandro Bruno Banegas Ortiz',
      correo: 'alejandro.banegas@estudiante.edu.bo',
      estadoDefensa: 'PROGRAMADA',
      tipoDefensa: 'INTERNA',
      diasOffsetDefensa: 8,
      areaElegidaIndex: 0,
    },
    {
      carnetEstudiantil: 'RED-20230302',
      carnetIdentidad: '7281932 CB',
      nombreCompleto: 'Mariana Cecilia Chávez Rivero',
      correo: 'mariana.chavez@estudiante.edu.bo',
      estadoDefensa: 'AREA_SORTEADA',
      tipoDefensa: 'INTERNA',
      diasOffsetDefensa: 5,
      areaElegidaIndex: 1, // Gestión de Redes
    },
    {
      carnetEstudiantil: 'RED-20230303',
      carnetIdentidad: '6391033 LP',
      nombreCompleto: 'Esteban Daniel Pedraza Siles',
      correo: 'esteban.pedraza@estudiante.edu.bo',
      estadoDefensa: 'CASO_ASIGNADO',
      tipoDefensa: 'EXTERNA',
      diasOffsetDefensa: 2,
      areaElegidaIndex: 3, // Diseño de Redes Corporativas
    },
    {
      carnetEstudiantil: 'RED-20230304',
      carnetIdentidad: '5829134 SC',
      nombreCompleto: 'Laura Sofia Cuellar Dorado',
      correo: 'laura.cuellar@estudiante.edu.bo',
      estadoDefensa: 'CALIFICADO',
      tipoDefensa: 'INTERNA',
      diasOffsetDefensa: -3,
      nota: 88.0,
      resultado: 'APROBADO',
      observaciones:
        'Excelente propuesta de despliegue GPON / FTTH con cálculos rigurosos de potencia óptica y presupuesto de enlaces. Dictamen favorable unánime.',
      areaElegidaIndex: 0, // Servicios Telecom
    },
  ],
};

// ============================================================================
// FUNCIONES DE SIEMBRA
// ============================================================================

async function seedCasosYAreasParaCarreras(): Promise<void> {
  console.log('\n📚 1. SEMBRANDO CASOS DE ESTUDIO Y ÁREAS ACADÉMICAS...');

  for (const [carreraNombre, areasData] of Object.entries(BANCO_CASOS)) {
    const carrera = await prisma.carrera.findFirst({
      where: { nombre: carreraNombre },
      include: { planesEstudio: true },
    });

    if (!carrera) {
      console.warn(`⚠️ Carrera "${carreraNombre}" no encontrada en la base de datos. Se omite.`);
      continue;
    }

    // Asegurar plan de estudio vigente
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

    let totalCasosAgregados = 0;

    for (const areaData of areasData) {
      // 1. Crear o buscar área académica
      let area = await prisma.areaAcademica.findFirst({
        where: {
          idCarrera: carrera.idCarrera,
          nombre: areaData.areaNombre,
        },
      });

      if (!area) {
        area = await prisma.areaAcademica.create({
          data: {
            idCarrera: carrera.idCarrera,
            nombre: areaData.areaNombre,
            umbralDisponibilidad: areaData.umbralDisponibilidad ?? 2,
            estado: 'ACTIVO',
          },
        });
      }

      // 2. Vincular a PlanArea si no está vinculado
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

      // 3. Crear casos si no existen por título
      for (const casoData of areaData.casos) {
        const casoExistente = await prisma.casoEstudio.findFirst({
          where: {
            idArea: area.idArea,
            titulo: casoData.titulo,
          },
        });

        if (!casoExistente) {
          await prisma.casoEstudio.create({
            data: {
              idArea: area.idArea,
              titulo: casoData.titulo,
              contenido: casoData.contenido,
              estado: 'DISPONIBLE',
            },
          });
          totalCasosAgregados++;
        }
      }
    }

    console.log(
      `   ✅ [${carreraNombre}]: Áreas verificadas y ${totalCasosAgregados} nuevos casos incorporados al banco.`,
    );
  }
}

async function seedDefensasYTribunales(): Promise<void> {
  console.log('\n🎓 2. SEMBRANDO DEFENSAS, TRIBUNALES / JURADOS Y AUDITORÍA...');

  const ahora = new Date();

  // Usuario ejecutor institucional para sorteos y registros
  let usuarioEjecutor = await prisma.usuario.findFirst({
    where: { correoInstitucional: 'coord@uni.edu.bo' },
  });
  if (!usuarioEjecutor) {
    usuarioEjecutor = await prisma.usuario.findFirst();
    if (!usuarioEjecutor) {
      throw new Error('No existe ningún usuario institucional registrado para asociar los sorteos.');
    }
  }

  // Tipos de defensa
  const tipoInterna = await prisma.tipoDefensa.findFirstOrThrow({ where: { nombre: 'INTERNA' } });
  const tipoExterna = await prisma.tipoDefensa.findFirstOrThrow({ where: { nombre: 'EXTERNA' } });

  for (const [carreraNombre, estudiantesData] of Object.entries(ESTUDIANTES_DEFENSAS)) {
    const carrera = await prisma.carrera.findFirst({
      where: { nombre: carreraNombre },
      include: {
        planesEstudio: true,
        areasAcademicas: { include: { casos: true } },
        configuracionesArea: true,
        configuracionesCaso: true,
      },
    });

    if (!carrera) {
      console.warn(`⚠️ Carrera "${carreraNombre}" no encontrada. Saltando.`);
      continue;
    }

    const plan =
      carrera.planesEstudio.find((p) => p.estadoVigencia === 'VIGENTE') ||
      carrera.planesEstudio[0];
    if (!plan) {
      console.warn(`⚠️ Carrera "${carreraNombre}" no tiene planes de estudio. Saltando.`);
      continue;
    }

    const configArea = carrera.configuracionesArea.find(
      (c) => c.idTipoDefensa === tipoInterna.idTipoDefensa,
    );
    const configCaso = carrera.configuracionesCaso.find(
      (c) => c.idTipoDefensa === tipoInterna.idTipoDefensa,
    );

    const tribunalesDisponibles =
      TRIBUNALES_POR_CARRERA[carreraNombre] || TRIBUNALES_POR_CARRERA['Sistemas'];

    let defensasProcesadas = 0;

    for (let i = 0; i < estudiantesData.length; i++) {
      const defData = estudiantesData[i];
      const tribunal = tribunalesDisponibles[i % tribunalesDisponibles.length];

      // 1. Crear o buscar Estudiante por carnetEstudiantil
      let estudiante = await prisma.estudiante.findUnique({
        where: { carnetEstudiantil: defData.carnetEstudiantil },
      });

      if (!estudiante) {
        estudiante = await prisma.estudiante.create({
          data: {
            idPlanEstudio: plan.idPlanEstudio,
            carnetEstudiantil: defData.carnetEstudiantil,
            carnetIdentidad: defData.carnetIdentidad,
            nombreCompleto: defData.nombreCompleto,
            correo: defData.correo,
            estado: 'ACTIVO',
          },
        });
      }

      // 2. Crear o buscar Proceso de Examen de Grado
      let proceso = await prisma.procesoExamenGrado.findFirst({
        where: { idEstudiante: estudiante.idEstudiante },
      });

      if (!proceso) {
        proceso = await prisma.procesoExamenGrado.create({
          data: {
            idEstudiante: estudiante.idEstudiante,
            estadoProceso: defData.estadoDefensa === 'CALIFICADO' ? 'CONCLUIDO' : 'EN_CURSO',
          },
        });
      }

      // 3. Crear o buscar Instancia de Examen de Grado
      let instancia = await prisma.instanciaExamenGrado.findFirst({
        where: { idProceso: proceso.idProceso, numeroInstancia: 1 },
      });

      if (!instancia) {
        instancia = await prisma.instanciaExamenGrado.create({
          data: {
            idProceso: proceso.idProceso,
            numeroInstancia: 1,
            estadoInstancia: defData.estadoDefensa === 'CALIFICADO' ? 'CONCLUIDO' : 'PENDIENTE',
            resultado: defData.resultado ?? null,
          },
        });
      }

      // 4. Seleccionar Tipo de Defensa
      const tipoDefensaObj =
        defData.tipoDefensa === 'EXTERNA' ? tipoExterna : tipoInterna;

      // 5. Fecha calculada de defensa
      const fechaDefensa = new Date(
        ahora.getTime() + defData.diasOffsetDefensa * 24 * 3600 * 1000,
      );

      // 6. Determinar área y caso de prueba
      const areaIndex = defData.areaElegidaIndex ?? 0;
      const areaSeleccionada =
        carrera.areasAcademicas[areaIndex % carrera.areasAcademicas.length] ||
        carrera.areasAcademicas[0];
      const casoSeleccionado =
        areaSeleccionada?.casos[0] || carrera.areasAcademicas[0]?.casos[0];

      // 7. Crear o actualizar DefensaExamenGrado
      let defensa = await prisma.defensaExamenGrado.findUnique({
        where: {
          idInstancia_idTipoDefensa: {
            idInstancia: instancia.idInstancia,
            idTipoDefensa: tipoDefensaObj.idTipoDefensa,
          },
        },
      });

      if (!defensa) {
        defensa = await prisma.defensaExamenGrado.create({
          data: {
            idInstancia: instancia.idInstancia,
            idTipoDefensa: tipoDefensaObj.idTipoDefensa,
            idCasoUtilizado:
              defData.estadoDefensa === 'CASO_ASIGNADO' || defData.estadoDefensa === 'CALIFICADO'
                ? casoSeleccionado?.idCasoEstudio ?? null
                : null,
            fechaDefensa,
            periodoAcademico: 'II-2026',
            estadoDefensa: defData.estadoDefensa,
            nota: defData.nota ?? null,
            resultado: defData.resultado ?? null,
          },
        });
      } else {
        defensa = await prisma.defensaExamenGrado.update({
          where: { idDefensa: defensa.idDefensa },
          data: {
            estadoDefensa: defData.estadoDefensa,
            nota: defData.nota ?? null,
            resultado: defData.resultado ?? null,
            idCasoUtilizado:
              defData.estadoDefensa === 'CASO_ASIGNADO' || defData.estadoDefensa === 'CALIFICADO'
                ? casoSeleccionado?.idCasoEstudio ?? null
                : defensa.idCasoUtilizado,
          },
        });
      }

      // 8. Crear Sorteos según el estado para reflejar el flujo en la BD
      if (
        defData.estadoDefensa === 'AREA_SORTEADA' ||
        defData.estadoDefensa === 'CASO_ASIGNADO' ||
        defData.estadoDefensa === 'CALIFICADO'
      ) {
        const sorteoExistente = await prisma.sorteo.findFirst({
          where: { idDefensa: defensa.idDefensa },
        });

        if (!sorteoExistente && areaSeleccionada && configArea) {
          const sorteo = await prisma.sorteo.create({
            data: {
              idDefensa: defensa.idDefensa,
              idUsuarioEjecutor: usuarioEjecutor.idUsuario,
              idPlanEstudioContexto: plan.idPlanEstudio,
              fechaDefensaContexto: fechaDefensa,
              estadoSorteo: 'ACTIVO',
              estudiantePresente: true,
            },
          });

          await prisma.sorteoArea.create({
            data: {
              idSorteo: sorteo.idSorteo,
              idConfigSorteoArea: configArea.idConfigSorteoArea,
              idAreaResultado: areaSeleccionada.idArea,
            },
          });

          // Si ya tiene caso asignado o calificado, registrar SorteoCaso
          if (
            (defData.estadoDefensa === 'CASO_ASIGNADO' || defData.estadoDefensa === 'CALIFICADO') &&
            casoSeleccionado &&
            configCaso
          ) {
            await prisma.sorteoCaso.create({
              data: {
                idSorteo: sorteo.idSorteo,
                idConfigSorteoCaso: configCaso.idConfigSorteoCaso,
                idCasoSeleccionado: casoSeleccionado.idCasoEstudio,
              },
            });
          }
        }
      }

      // 9. Registrar Auditoría y Datos del Tribunal (Presidente, Secretario, Vocal)
      if (defData.estadoDefensa === 'CALIFICADO') {
        const auditExistente = await prisma.registroAuditoria.findFirst({
          where: {
            idDefensa: defensa.idDefensa,
            tipoOperacion: 'REGISTRO_CALIFICACION',
          },
        });

        if (!auditExistente) {
          await prisma.registroAuditoria.create({
            data: {
              idUsuario: usuarioEjecutor.idUsuario,
              idDefensa: defensa.idDefensa,
              idInstancia: instancia.idInstancia,
              idProceso: proceso.idProceso,
              tipoOperacion: 'REGISTRO_CALIFICACION',
              descripcion: `Calificación oficial registrada: ${defData.nota}/100 pts (${defData.resultado})`,
              valorNuevo: {
                nota: defData.nota,
                resultado: defData.resultado,
                estadoDefensa: 'CALIFICADO',
                tribunal: {
                  presidente: tribunal.presidente,
                  secretario: tribunal.secretario,
                  vocal: tribunal.vocal,
                },
                observaciones: defData.observaciones ?? 'Defensa evaluada conforme a reglamento.',
              },
            },
          });
        }
      } else {
        // Para PROGRAMADA, AREA_SORTEADA o CASO_ASIGNADO:
        // Registrar la asignación de jurados / tribunal para que la UI los tenga disponibles
        const auditTribunal = await prisma.registroAuditoria.findFirst({
          where: {
            idDefensa: defensa.idDefensa,
            tipoOperacion: 'ACTUALIZACION_DEFENSA',
          },
        });

        if (!auditTribunal) {
          await prisma.registroAuditoria.create({
            data: {
              idUsuario: usuarioEjecutor.idUsuario,
              idDefensa: defensa.idDefensa,
              idInstancia: instancia.idInstancia,
              idProceso: proceso.idProceso,
              tipoOperacion: 'ACTUALIZACION_DEFENSA',
              descripcion: `Designación de Tribunal Examinador para defensa ID ${defensa.idDefensa}`,
              valorNuevo: {
                estadoDefensa: defData.estadoDefensa,
                fechaDefensa: fechaDefensa.toISOString().split('T')[0],
                tribunal: {
                  presidente: tribunal.presidente,
                  secretario: tribunal.secretario,
                  vocal: tribunal.vocal,
                },
                observaciones: 'Tribunal evaluador designado oficialmente por Jefatura de Carrera.',
              },
            },
          });
        }
      }

      defensasProcesadas++;
    }

    console.log(
      `   ✅ [${carreraNombre}]: ${defensasProcesadas} defensas y tribunales procesados exitosamente.`,
    );
  }
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================
async function main() {
  console.log('================================================================');
  console.log('🚀 INICIANDO POBLACIÓN DE DEFENSAS, TRIBUNALES Y BANCO DE CASOS');
  console.log('================================================================');

  const inicio = Date.now();

  await seedCasosYAreasParaCarreras();
  await seedDefensasYTribunales();

  const duracion = ((Date.now() - inicio) / 1000).toFixed(2);
  console.log('\n================================================================');
  console.log(`🎉 POBLACIÓN COMPLETADA SATISFACTORIAMENTE EN ${duracion}s`);
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la población:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
