# SGSEG · Manual del Flujo Operativo y Arquitectura del Sistema
**Universidad Tecnológica Privada de Santa Cruz (UTEPSA)**  
*Sistema de Gestión de Sorteos de Grado, Casos de Estudio y Defensas Finales*

---

## 1. Visión General del Sistema

El **SGSEG** es una plataforma integral diseñada para automatizar, blindar y auditar todo el ciclo académico del Examen de Grado en la UTEPSA. El sistema garantiza transparencia e inviolabilidad en la asignación de temas mediante algoritmos criptográficos seguros (**CSPRNG**), previene la reutilización indebida de casos de estudio y proporciona trazabilidad total desde la postulación hasta la calificación final del tribunal.

> **Regla de Identidad:** El estudiante postulante **no interactúa directamente con el sistema ni posee credenciales**. Es gestionado como sujeto de evaluación por los estamentos académicos universitarios.

---

## 1.1 Estado del Proyecto y Porcentaje de Cumplimiento

$$\mathbf{ESTADO\ DEL\ SOFTWARE:\ 90.1\%\ TERMINADO\ (NÚCLEO\ 100\%\ OPERATIVO)}$$

* **Núcleo de Negocio Troncal (100% Funcional):** Los 7 pasos del flujo operativo del Examen de Grado (Padrón, Banco de Casos, Sorteo CSPRNG, Actas PDF, Correos Asíncronos, Defensas y Dashboard de Vicerrectorado) se encuentran completamente codificados, testeados e integrados.
* **Aislamiento Multi-Tenancy (100% Blindado):** Garantizado a nivel de base de datos y endpoints con bloqueo HTTP 403.
* **Pendientes Técnicos (9.9% Restante):** CRUD completo de usuarios en backend/frontend, visor web de auditoría para Super Admin y configuración dinámica en caliente de plazos.

| Etapa del Flujo Operativo | Estado Funcional | % Terminado | Documento de Auditoría |
| :--- | :---: | :---: | :--- |
| **1. Padrón e Importación de Estudiantes** | 🟢 Operativo | **97.5%** | [Módulo 3](file:///c:/SGSEG/docs/modulo3_importador_estudiantes.md) |
| **2. Banco de Casos y Control de 2 Usos** | 🟢 Operativo | **97.5%** | [Análisis Cumplimiento](file:///c:/SGSEG/docs/analisis_cumplimiento_sistema.md#módulo-2-casos-de-estudio-y-stock-crítico) |
| **3. Sorteo Criptográfico CSPRNG + En Vivo** | 🟢 Operativo | **97.5%** | [Sorteo Digital](file:///c:/SGSEG/docs/analisis_cumplimiento_sistema.md#módulo-4-sorteo-digital-criptográfico-csprng--en-vivo) |
| **4. Generación de Actas PDF y Notificaciones** | 🟢 Operativo | **97.5%** | [Actas y Reportes](file:///c:/SGSEG/docs/analisis_cumplimiento_sistema.md#módulo-5-actas-notificaciones-y-dashboard-ejecutivo) |
| **5. Programación y Calificación de Defensas** | 🟢 Operativo | **97.5%** | [Defensas](file:///c:/SGSEG/docs/analisis_cumplimiento_sistema.md#módulo-6-programación-y-calificación-de-defensas) |
| **6. Dashboard Ejecutivo Vicerrectorado** | 🟢 Operativo | **100%** | [Dashboard](file:///c:/SGSEG/docs/evaluacion_cumplimiento_roles.md#4-evaluación-de-cumplimiento-por-rol-de-usuario) |
| **7. Soporte Técnico, CRUD Usuarios y Auditoría** | 🟡 Parcial | **55.0%** | [Plan de Cierre al 100%](file:///c:/SGSEG/docs/plan_implementacion_pendientes.md) |

> 📊 Para consultar el desglose matemático detallado, consulte la [Evaluación de Cumplimiento por Rol y Pendientes](file:///c:/SGSEG/docs/evaluacion_cumplimiento_roles.md).


---

## 2. Matriz de Actores y Control de Acceso (RBAC)

El acceso a las vistas y endpoints está regulado por tokens JWT y roles estrictos:

| Rol | Alcance / Visibilidad | Principales Responsabilidades |
| :--- | :--- | :--- |
| **👑 Super Admin** | Global Universitario | Mantenimiento técnico, gestión de usuarios, parametrización de facultades/carreras y auditoría profunda. |
| **👁️ Vicerrectorado** | Global Universitario (**Auditoría, Observación y Gestión de Usuarios**) | • **Auditar y Observar:** Supervisión institucional de calidad, cumplimiento de plazos reglamentarios, métricas y reportes ejecutivos.<br>• **Restricción:** **NO puede iniciar un nuevo proceso de sorteo** (garantía de fe pública y neutralidad).<br>• **Única Función Activa:** **Añadir roles y usuarios al sistema**, principalmente dar de alta al **Jefe de Carrera** y asignarle su carrera académica correspondiente. |
| **📅 Coordinación General** | Global Operativo | Administración del padrón de postulantes, habilitaciones académicas, programación de defensas y asignación de tribunales. |
| **🎓 Jefe de Carrera** | **Exclusivo de su Carrera** (Aislamiento Total) | Administración del banco de casos de estudio por área, control de stock, reactivación especial de casos y ejecución del sorteo digital. |
| **📝 Secretariado Académico** | Soporte por Facultad / Carrera | Habilitación documental, impresión y entrega de actas oficiales, control de temporizadores de resolución y registro de notas del jurado. |

---

## 3. Diagrama del Flujo Operativo de Extremo a Extremo

```mermaid
flowchart TD
    A[1. Coordinación / Secretaría] -->|Registra e Habilita Postulante| B(Padrón de Estudiantes)
    C[2. Jefe de Carrera] -->|Carga Banco de Casos por Área| D[(Repositorio de Casos)]
    B --> E{3. Tipo de Carrera}
    D --> E
    
    E -->|FCT & Psicología| F[Sorteo Simultáneo Anticipado: Área + Caso]
    E -->|FCE & FCJS| G[Sorteo de Área 5 Días Antes]
    
    F --> H[Generación de Acta Digital & Hash CSPRNG]
    G --> I[Día de la Defensa: Sorteo/Asignación de Caso]
    I --> H
    
    H --> J[4. Entrega de Caso & Temporizador de Preparación]
    J --> K[5. Presentación ante Tribunal Examinador]
    K --> L[6. Calificación y Asignación de Nota Final]
    L --> M[7. Cierre de Defensa, Auditoría y Reporte a Vicerrectorado]
```

---

## 4. Descripción Detallada de las Etapas del Flujo

### Etapa 1: Padrón y Habilitación de Postulantes (`/estudiantes`)
1. **Registro:** Coordinación o Secretaría da de alta a los postulantes con sus datos oficiales (Nombre, Carnet de Identidad, Registro Universitario, Carrera, Plan de Estudios y Tipo de Examen: Interno o Externo).
2. **Validación:** Se verifica que el estudiante haya cumplido con el 100% de la malla curricular y no tenga observaciones financieras o documentales.
3. **Estado Inicial:** El postulante adquiere el estado `HABILITADO` para sorteo y se enlaza al calendario de exámenes.

---

### Etapa 2: Gestión y Stock de Casos de Estudio (`/casos`)
1. **Organización por Áreas:** Cada carrera cuenta con sus áreas de conocimiento aprobadas (ej. Derecho: *Penal, Civil, Laboral, Comercial, Constitucional*; Sistemas: *Ingeniería de Software, Redes, Base de Datos, Inteligencia Artificial*).
2. **Banco de Casos:** El Jefe de Carrera sube los casos con su título, descripción del problema, planteamiento detallado y preguntas de defensa.
3. **Regla de Oro de Usos (Máximo 2 defensas):**
   * Cada caso lleva un contador exacto de cuántas veces ha sido asignado y defendido.
   * **Caso Activo (< 2 usos):** Disponible para entrar a la ruleta/sorteo algorítmico.
   * **Caso Agotado (>= 2 usos):** El sistema lo bloquea automáticamente del bombo de sorteo para evitar que un caso sea recurrente entre estudiantes.
4. **Reactivación Especial y Justificada:**
   * Si una carrera agota los casos de un área crítica, **únicamente el Jefe de Carrera** puede solicitar una reactivación especial.
   * Requiere registrar una **justificación formal obligatoria**, la cual queda grabada con sello de tiempo e IP en la tabla de `RegistroAuditoria`.

---

### Etapa 3: Sorteo Digital Algorítmico y Ruleta (`/sorteos`)
El sorteo se ejecuta en presencia del postulante y las autoridades correspondientes. Utiliza un generador pseudoaleatorio de enteros criptográficamente seguro (`crypto.randomInt` de Node.js):

#### Reglas Diferenciadas por Unidad Académica:

| Facultad / Carrera | Momento Sorteo de Área | Momento Sorteo de Caso | Tiempo de Preparación del Postulante |
| :--- | :--- | :--- | :--- |
| **FCT** (Sistemas, Redes, Electrónica) | 5 a 14 días hábiles antes | Simultáneo con el Área | **7 días calendario** |
| **FCT** (Industrial y Comercial) | 5 a 14 días hábiles antes | Simultáneo con el Área | **5 días calendario** |
| **FCT** (Mecánica) | 14 días hábiles antes | Simultáneo con el Área | **14 días calendario** |
| **FCJS** (Psicología) | 10 días hábiles antes | Simultáneo con el Área | **10 días calendario** |
| **FCJS** (Derecho, Relaciones Int., Com.) | **5 días hábiles antes** | **El mismo día de la defensa** (en Secretaría) | • **1 hora** (Defensa Interna)<br>• **1.5 horas** (Defensa Externa) |
| **FCE** (Empresariales, Comercial, Financiera) | **5 días hábiles antes** | **El mismo día de la defensa** (en Secretaría) | • **1 hora** (Defensa Interna)<br>• **1.5 horas** (Defensa Externa) |

#### Dinámica Visual de la Ruleta SVG en 2 Fases:
1. **Fase 1 (Sorteo de Área):** La ruleta gira entre las áreas de la carrera hasta detenerse en el área asignada por el backend.
2. **Transición Fluida:** La interfaz transiciona dinámicamente y carga los casos activos de dicha área.
3. **Fase 2 (Asignación de Caso):** Se sortea o asigna el caso definitivo según los plazos reglamentarios de la carrera.
4. **Firma Criptográfica:** El sistema genera un código de verificación inmutable (`ACTA-YYYY-XXXXX`) y un hash SHA-256 de seguridad.

---

### Etapa 4: Emisión de Documentación Oficial y Notificaciones (Módulo 5)
Una vez confirmado el sorteo, el sistema formaliza legalmente la asignación y dispara los canales de comunicación oficial:
1. **Generación de Actas en PDF (`GET /sorteos/acta/:idDefensa/pdf`):**
   * Renderizado en memoria mediante `pdfkit` con membrete institucional UTEPSA.
   * Incluye: código oficial de acta correlativo (`ACTA-DEF-X-YYYY`), token criptográfico SHA-256 (`tokenActa`), datos del postulante, área temática y caso asignado, plazo reglamentario de preparación (1h, 1.5h, 5d, 7d, 10d, 14d) y cuadro de firmas formales a 3 columnas (Postulante, Jefe de Carrera y Secretaría como Testigo de Fe Pública).
2. **Servicio de Notificaciones Asíncronas por Correo:**
   * Encolamiento automático en background (`ColaNotificacionesService`) sin demorar la respuesta del sorteo.
   * Persistencia del estado de despacho en la tabla `EnvioCasoEstudio` (`PENDIENTE` ➔ `ENVIADO` / `FALLIDO`) y trazabilidad en `RegistroAuditoria`.
   * Correo HTML responsivo institucional con resumen del sorteo, fecha de defensa, caso adjudicado y certificación criptográfica.

---

### Etapa 5: Programación, Tribunal y Calificación de Defensas (`/defensas`)
1. **Agendamiento:** Se asigna fecha, hora, aula física o sala virtual, y tribunal examinador:
   * **Defensa Interna:** Dos docentes evaluadores internos de la universidad.
   * **Defensa Externa:** Dos evaluadores (un docente interno y un representante acreditado del Colegio de Profesionales correspondiente).
2. **Embudo de Estados de la Defensa:**
   $$\text{PROGRAMADA} \longrightarrow \text{EN\_CURSO} \longrightarrow \text{DEFENDIDA} \longrightarrow \text{CALIFICADA}$$
3. **Asignación de Nota:**
   * Secretaría o el Presidente del Tribunal introduce la nota numérica final (escala de 1 a 100).
   * **Aprobado:** Nota $\ge 51$.
   * **Reprobado:** Nota $< 51$.
   * Al registrar la calificación, el caso de estudio incrementa su contador de usos consolidados.

---

### Etapa 6: Monitoreo Institucional y Dashboard Ejecutivo (`/reportes`)
1. **Dashboard Ejecutivo (`GET /reportes/dashboard-ejecutivo`):**
   * Endpoint de analítica agregada para Vicerrectorado, Coordinación y Jefaturas.
   * **Contadores en Tiempo Real:**
     * Casos disponibles (< 2 usos) y agotados (≥ 2 usos).
     * Áreas en stock crítico (por debajo del umbral mínimo de disponibilidad).
     * Defensas concluidas con desglose de aprobadas, reprobadas y nota promedio institucional.
     * Postulantes en pipeline (programados y en curso de sorteo/defensa).
     * Actas de sorteo oficiales emitidas con hash SHA-256.
   * **Filtros Flexibles:** Filtrable por facultad (FCT, FCE, FCJS), carrera o período académico.
   * **Aislamiento Estricto (RNF-02):** Vicerrectorado y Super Admin supervisan globalmente; los Jefes de Carrera quedan restringidos exclusivamente a su carrera.
2. **Alertas Operativas de Stock Crítico:**
   * Listado prioritario de áreas temáticas en riesgo de desabastecimiento para reposición inmediata.
3. **Matriz Comparativa Universitaria:**
   * Desglose institucional por facultad para la toma de decisiones ejecutivas en Vicerrectorado.

---

## 5. Cuentas Preconfiguradas para Pruebas y Auditoría

Para verificar cada perspectiva del flujo operativo, el sistema cuenta con accesos directos en el Login conectados con usuarios sembrados en la base de datos:

| Perfil Institucional | Correo Electrónico | Contraseña | Permisos Clave |
| :--- | :--- | :--- | :--- |
| **Coordinación General** | `coord@uni.edu.bo` | `Admin123!` | Padrón de estudiantes, calendario general y defensas. |
| **Jefe de Carrera (Derecho)** | `jefe.derecho@uni.edu.bo` | `Admin123!` | Casos y sorteos exclusivos de Derecho (FCJS). |
| **Jefe de Carrera (Sistemas)** | `jefe.sistemas@uni.edu.bo` | `Admin123!` | Casos y sorteos exclusivos de Sistemas (FCT). |
| **Secretaría Académica** | `secretaria@uni.edu.bo` | `Admin123!` | Impresión de actas, entregas y registro de notas. |
| **Vicerrectorado** | `vicerrector@uni.edu.bo` | `Admin123!` | Auditoría y supervisión institucional (sin inicio de sorteo); alta de roles y usuarios (Jefes de Carrera). |

---

## 6. Estado Técnico del Repositorio

* **Rama Principal:** `main` (sincronizada y actualizada con GitHub `origin/main`).
* **Backend:** Compilación limpia (`npm run build`), NestJS + Prisma 7 con adaptador de conexión PostgreSQL (`@prisma/adapter-pg`).
* **Frontend:** Compilación limpia (`npm run build`), React 18 + Vite + TailwindCSS con módulos integrados de recuperación de clave, acceso rápido y ruleta interactiva.
