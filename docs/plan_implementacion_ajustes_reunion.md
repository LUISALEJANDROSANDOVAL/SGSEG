# PLAN DE IMPLEMENTACIÓN TÉCNICA: AJUSTES NORMATIVOS POR FACULTAD, CICLO DE VIDA DE CASOS, FORMATOS DE CALIDAD Y CONSENTIMIENTO REMOTO (SGSEG - UTEPSA)

**Documento:** Plan de Implementación de Ajustes de Reunión de Interesados  
**Sistema:** SGSEG — Sistema de Gestión y Seguridad Criptográfica de Exámenes de Grado  
**Institución:** Universidad Tecnológica Privada de Santa Cruz (UTEPSA)  
**Fecha:** Septiembre 2026  
**Audiencia:** Comité de Grado, Jefaturas de Carrera, Dirección de Calidad Institucional, Equipo de Desarrollo  

---

## 📌 1. Resumen Ejecutivo y Alcance

El presente plan operacionaliza técnicamente los acuerdos tomados en la última reunión de retroalimentación con los usuarios finales y autoridades del proceso de Examen de Grado. Su propósito es definir la ruta metodológica, arquitectónica y de aseguramiento de calidad antes de cualquier pase a producción.

### Ejes de Intervención:
1. **Lógica Diferenciada por Carrera y Facultad:**
   * Eliminación de la segunda fase de sorteo para la Facultad de Ciencias Empresariales (FCE). Asignación directa de caso el día de la defensa.
   * Preservación estricta de las dos fases con ruleta de casos exclusivamente para Derecho (FCJS).
   * Reutilización infinita e inagotable de las áreas de conocimiento.
2. **Control de Repetición y Ciclo de Vida de Casos:**
   * Tope rígido de 2 usos por caso de estudio.
   * Inactivación automática al alcanzar el 2do uso (`AGOTADO` / Inactivo).
   * Reactivación manual con edición por parte del Jefe de Carrera bajo justificación formal registrada en auditoría.
3. **Ajuste a Normas de Calidad Institucional (Sin formatos nuevos):**
   * Eliminación de cualquier propuesta de plantilla nueva por demoras burocráticas de homologación.
   * Generación y rellenado de las actas vigentes: **`PO-DFG-100-3`** (Defensas Internas), Acta Oficial de Defensas Externas y **`PO-DFG-100-4`** (Carátula Oficial de Caso para sobre sellado).
   * Flujo de emisión inmediata para firma física tripartita (Postulante, Jefe de Carrera y Testigo Académico de Fe Pública).
4. **Módulo de Sorteo Remoto y Sustento de Asistencia:**
   * Registro formal del motivo de fuerza mayor (baja médica certificada, cirugía, etc.).
   * Enlace temporal / código QR al postulante (`/sorteo/en-vivo/:slug`).
   * Bloqueo imperativo del sorteo hasta que el estudiante acceda y presione el botón **"ACTIVO"**, sirviendo como respaldo de consentimiento y asistencia digital.

---

## 🗺️ 2. Mapa de Fases e Interdependencias

```mermaid
graph TD
    subgraph FASE 1 [FASE 1: Lógica por Carrera y Facultad]
        T1_1[1.1 Backend: Restricción FCE vs FCJS]
        T1_2[1.2 Backend: Regla de Reutilización Infinita de Áreas]
        T1_3[1.3 Frontend: Interfaz Diferenciada Ruleta vs Asignación Directa]
    end

    subgraph FASE 2 [FASE 2: Control de Ciclo de Vida de Casos]
        T2_1[2.1 Backend: Conteo Atómico y Tope de 2 Usos]
        T2_2[2.2 Backend: Inactivación Automática a Estado AGOTADO]
        T2_3[2.3 Backend/Frontend: Reactivación Manual con Justificación por Jefatura]
    end

    subgraph FASE 3 [FASE 3: Formatos Oficiales de Calidad]
        T3_1[3.1 Eliminación de formatos no homologados]
        T3_2[3.2 Generador PDF: Acta PO-DFG-100-3 Internas]
        T3_3[3.3 Generador PDF: Carátula PO-DFG-100-4 Sobre Sellado]
        T3_4[3.4 Bloque de Firma Física Tripartita y Token SHA-256]
    end

    subgraph FASE 4 [FASE 4: Sorteo Remoto y Botón ACTIVO]
        T4_1[4.1 Registro de Justificación de Fuerza Mayor]
        T4_2[4.2 Generación de Slug y Código QR Móvil]
        T4_3[4.3 Botón ACTIVO de Consentimiento Digital en Smartphone]
        T4_4[4.4 Bloqueo de Inicio de Sorteo si Estudiante no está ACTIVO]
    end

    subgraph FASE 5 [FASE 5: Validación, Pruebas y Despliegue]
        T5_1[5.1 Pruebas Unitarias de Reglas de Negocio]
        T5_2[5.2 Pruebas E2E de Sorteo Presencial y Remoto]
        T5_3[5.3 Validación Documental y Capacitación]
    end

    FASE 1 --> FASE 5
    FASE 2 --> FASE 5
    FASE 3 --> FASE 5
    FASE 4 --> FASE 5
```

---

## 🛠️ 3. Desglose Detallado de Tareas

---

### FASE 1: Lógica Diferenciada por Carrera y Facultad

#### Tarea 1.1: Restricción en Backend para Ciencias Empresariales (FCE) vs Derecho (FCJS)
* **Objetivo:** Garantizar que el motor de sorteos reconozca la facultad y carrera del estudiante e impida el segundo sorteo en FCE.
* **Causa / Regla de Negocio:** En Ciencias Empresariales solo se sortea el área de manera anticipada. El día de la defensa, el caso práctico se asigna directamente de las opciones activas sin pasar por una segunda ruleta. En Derecho (FCJS) se exige obligatoriamente la segunda ruleta de caso en sala.
* **Archivos a Intervenir:**
  * `backend/src/sorteos/services/sorteos.service.ts`
  * `backend/src/sorteos/controller/sorteos.controller.ts`
* **Especificación Técnica:**
  1. En `sorteos.service.ts -> sortearCaso()`, consultar la carrera del estudiante asociado a la defensa.
  2. Evaluar si la carrera o facultad pertenece a Ciencias Empresariales (`FCE` o nombres de carreras: *Administración General, Ingeniería Comercial, Comercio Internacional, Auditoría y Finanzas, Marketing y Publicidad*).
  3. Si es de FCE y se invoca el sorteo de caso por ruleta, abortar con excepción `BadRequestException("Las carreras de Ciencias Empresariales no admiten segundo sorteo de caso por ruleta. El caso debe asignarse de manera directa el día de la defensa.")`.
  4. Habilitar la asignación directa de caso mediante `POST /sorteos/asignar-caso-directo` o validando la asignación sin invocar el PRNG de ruleta.

#### Tarea 1.2: Reutilización Infinita de Áreas de Conocimiento
* **Objetivo:** Impedir que un área temática sorteada sea bloqueada, ocultada o marcada como agotada.
* **Regla de Negocio:** Un área académica sorteada puede repetirse indefinidamente entre diferentes postulantes o en caso de reprobaciones e instancias subsecuentes.
* **Especificación Técnica:**
  1. Verificar que en la entidad `Area` o `PensumArea` no exista ninguna bandera de decremento de cupo o estado de agotamiento vinculado a defensas.
  2. En la consulta del bombo de áreas (`obtenerAreasParaSorteo`), filtrar únicamente por `activo: true` y `pensumId: estudiante.pensumId`, garantizando que todas las áreas del plan de estudios sigan siempre disponibles sin importar cuántas veces hayan salido sorteadas.

#### Tarea 1.3: Adaptación de la Interfaz de Sorteo (Frontend)
* **Objetivo:** Proveer una experiencia de usuario que se adapte automáticamente a la carrera del estudiante.
* **Archivos a Intervenir:**
  * `frontend/src/pages/Sorteo.tsx`
  * `frontend/src/lib/sorteos.api.ts`
* **Especificación Técnica:**
  1. Crear discriminadores reactivos: `esCienciasEmpresariales` y `esDerecho`.
  2. En el flujo del paso 2:
     * Si es FCE: El botón de avance debe titularse *"Continuar a Asignación Directa de Caso"*.
     * Si es Derecho: El botón debe titularse *"Continuar al Sorteo de Caso - Fase 2 (Ruleta)"*.
  3. En el paso 3:
     * Si es FCE: Renderizar una cuadrícula de tarjetas con los casos disponibles (`usos < 2`), permitiendo a la autoridad seleccionar el caso acordado y presionar *"Confirmar Asignación Directa de Caso"* (sin componente de ruleta SVG).
     * Si es Derecho: Renderizar la ruleta giratoria SVG con las opciones disponibles y botón *"Girar Ruleta de Caso"*.

---

### FASE 2: Control de Repetición y Ciclo de Vida de los Casos

#### Tarea 2.1: Límite Normativo Rígido de 2 Usos
* **Objetivo:** Evitar que un caso se filtre o desgaste académicamente por exceso de uso.
* **Regla de Negocio:** Ningún caso puede asignarse más de 2 veces en defensas institucionales.
* **Especificación Técnica:**
  1. Al asignar un caso (sea por sorteo o asignación directa), incrementar el contador de `usos` en la base de datos bajo transacción segura.
  2. En el repositorio de casos (`casos.repository.ts`), asegurar que el query para sorteo o selección incluya siempre el filtro: `usos: { lt: 2 }, estado: 'DISPONIBLE'`.

#### Tarea 2.2: Inactivación Automática
* **Objetivo:** Excluir de forma inmediata y automática los casos que alcancen el tope.
* **Especificación Técnica:**
  1. Inmediatamente después de persistir el segundo uso (`usos === 2`), mutar el estado del registro a `AGOTADO` (o inactivo).
  2. Disparar evento de auditoría registrando el retiro del caso del inventario activo.

#### Tarea 2.3: Reactivación Manual por Jefatura con Justificación Obligatoria
* **Objetivo:** Permitir a la autoridad académica reactivar un caso agotado en situaciones excepcionales de desabastecimiento.
* **Archivos a Intervenir:**
  * `backend/src/casos/controller/casos.controller.ts`
  * `backend/src/casos/services/casos.service.ts`
  * `frontend/src/pages/Casos.tsx`
* **Especificación Técnica:**
  1. Backend: Endpoint protegido por rol `Roles(RolUsuario.JEFE_CARRERA, RolUsuario.COORDINADOR_GENERAL)`:
     `PATCH /casos/:id/reactivar-especial`
     * Payload: `{ motivo: string (min 10 caracteres), nuevoTitulo?: string, nuevoProblema?: string }`.
     * Validar que el usuario pertenezca a la misma carrera del caso (Multi-Tenancy).
     * Resetear o ajustar contador de usos y cambiar estado a `DISPONIBLE`.
     * Guardar registro en `registro_auditoria` con IP, fecha, ID de usuario y justificación en texto plano.
  2. Frontend: Modal en el panel del Jefe de Carrera con botón *"Editar y Reactivar Caso"*, con advertencia de auditoría y campo de texto obligatorio para el motivo formal.

---

### FASE 3: Formatos Oficiales de Calidad (Restricción Institucional)

#### Tarea 3.1: Descarte de Formatos No Homologados
* **Objetivo:** Prevenir observaciones y rechazos del departamento de Calidad Institucional de la UTEPSA.
* **Decisión de Calidad:** Queda terminantemente prohibido proponer o diseñar nuevas plantillas de actas. Cualquier nuevo diseño requiere trámite de homologación institucional que toma semanas o meses. El sistema debe ajustarse a los formatos vigentes.

#### Tarea 3.2: Generador del Acta de Defensas Internas `PO-DFG-100-3`
* **Archivos a Intervenir:**
  * `backend/src/sorteos/services/actas-pdf.service.ts`
* **Especificación Técnica:**
  1. En el encabezado del documento PDF generado por PDFKit, incluir el código normativo:
     `CÓDIGO DE CALIDAD: PO-DFG-100-3` | `ACTA OFICIAL DE SORTEO — EXAMEN DE GRADO (DEFENSA INTERNA)`.
  2. Estructurar la tabla con los datos del postulante, carrera, facultad, plan de estudios, fecha/hora y área/caso asignados.
  3. Para Derecho o FCE, indicar los plazos oficiales de preparación (1 hora para defensa interna, 1.5 horas para externa).

#### Tarea 3.3: Generador de la Carátula Oficial de Caso `PO-DFG-100-4` (Sobre Sellado)
* **Objetivo:** Generar la carátula estandarizada que se adhiere en el sobre manila sellado donde se resguarda el caso práctico.
* **Especificación Técnica:**
  1. Implementar método `generarCaratulaCasoPdfBuffer(defensa, datosSorteo)` en `actas-pdf.service.ts`.
  2. Incluir código oficial: `CÓDIGO DE CALIDAD: PO-DFG-100-4` | `CARÁTULA OFICIAL DE CASO DE ESTUDIO — EXAMEN DE GRADO`.
  3. Contenido: Código del caso, título del caso, área de conocimiento, nombre y matrícula del postulante, fecha programada de defensa, casillero de verificación de sello intacto, y texto de advertencia: *"Este sobre sellado contiene el caso de examen de grado y solo debe ser abierto en presencia del tribunal evaluador y el estudiante al momento de la defensa"*.
  4. Endpoint: `GET /sorteos/caratula/:idDefensa/pdf`.

#### Tarea 3.4: Firma Física Tripartita y Token SHA-256
* **Especificación Técnica:**
  1. En el pie de página de ambas actas, incluir 3 casilleros de firma física con línea de rúbrica, nombre y cargo:
     * **Firma 1:** Estudiante Postulante (Conformidad de sorteo y notificación).
     * **Firma 2:** Jefe de Carrera (Fe de rigurosidad académica y vigencia de caso).
     * **Firma 3:** Testigo Académico / Secretaría de Facultad (Fe pública del acto oficial).
  2. Estampar en el pie de página el sello digital criptográfico de inmutabilidad:
     `Sello Digital SHA-256: <64 caracteres hex>` calculado sobre la tupla inmutable de sorteo.

---

### FASE 4: Módulo de Sorteo Remoto y Consentimiento Digital (Botón "ACTIVO")

#### Tarea 4.1: Registro de Inasistencia Presencial por Fuerza Mayor
* **Objetivo:** Sustentar documentalmente por qué el estudiante no asiste físicamente a la sala de sorteos.
* **Especificación Técnica:**
  1. En el formulario de preparación de sorteo (Paso 1), agregar selector de Modalidad: `PRESENCIAL` o `REMOTA`.
  2. Si es `REMOTA`, habilitar selector de Causa Justificada:
     * *Baja Médica Certificada*
     * *Intervención Quirúrgica / Hospitalización*
     * *Aislamiento Sanitario*
     * *Caso Fortuito / Fuerza Mayor Acreditada*
  3. Campo de texto obligatorio: *"Número de Certificado / Detalle de Justificación"*.
  4. La justificación se guarda en el registro de la defensa y se imprime en el cuerpo del acta `PO-DFG-100-3`.

#### Tarea 4.2: Enlace Temporal y Código QR Móvil
* **Especificación Técnica:**
  1. Al inicializar la sesión en sala, el backend genera un slug temporal seguro: `/sorteo/en-vivo/:slug`.
  2. Se proyecta en sala un código QR interactivo de alta resolución (`qrcode.react`) y se habilita la opción de enviar el enlace al correo institucional del postulante.

#### Tarea 4.3: Botón "ACTIVO" en Dispositivo del Postulante
* **Archivos a Intervenir:**
  * `frontend/src/pages/SorteoEnVivo.tsx`
  * `backend/src/sorteos/services/sorteos-live.service.ts`
  * `backend/src/sorteos/gateways/sorteos-live.gateway.ts`
* **Especificación Técnica:**
  1. Cuando el postulante abre el enlace en su smartphone, el sistema verifica que la sesión esté abierta.
  2. Si el estudiante aún no ha dado su consentimiento, la pantalla móvil muestra una tarjeta destacada con el botón:
     **`"BOTÓN 'ACTIVO' — CONFIRMAR ASISTENCIA Y CONSENTIMIENTO"`**.
  3. Al presionar el botón:
     * El frontend móvil emite un evento WebSocket o petición REST: `estudiante_listo(tokenSesionLive)`.
     * El backend registra `sesion.estudianteListo = true` con estampa de tiempo e IP.
     * La pantalla del estudiante actualiza su estado a: `Estado: ACTIVO · Consentimiento digital registrado (SUSTENTO FORMAL OK)`.

#### Tarea 4.4: Bloqueo Imperativo del Sorteo en la Consola del Administrador
* **Especificación Técnica:**
  1. En la consola principal (`Sorteo.tsx`), si `modalidadAsistencia === 'REMOTA'`:
     * El botón *"Iniciar Sorteo Oficial"* permanece deshabilitado (`disabled={true}`).
     * Se muestra una alerta ámbar pulsante: *"Esperando confirmación remota: El estudiante debe ingresar al enlace/QR y presionar el botón 'ACTIVO' para validar formalmente el sorteo"*.
  2. Cuando el estudiante presiona el botón, la sala recibe la actualización en tiempo real, el banner cambia a verde y se desbloquea el botón de inicio.
  3. En el backend, `sortearArea` y `sortearCaso` verifican el token de sesión live. Si la sesión existe y `estudianteListo === false`, el backend rechaza la operación con `400 Bad Request`.

---

### FASE 5: Validación, Pruebas y Aprobación Final

#### Tarea 5.1: Matriz de Pruebas Unitarias
* **Suites de Prueba en Backend:**
  * `sorteos.service.spec.ts`:
    * Rechazo de segundo sorteo por ruleta para carreras de FCE.
    * Aceptación de segundo sorteo por ruleta para carreras de FCJS (Derecho).
    * Bloqueo si la sesión remota no tiene consentimiento del estudiante (`estudianteListo === false`).
    * Generación correcta de buffer PDF para carátula `PO-DFG-100-4`.
  * `casos.service.spec.ts`:
    * Inactivación automática al alcanzar 2 usos (`usos = 2 -> estado = AGOTADO`).
    * Reactivación manual autorizada para Jefe de Carrera con registro en auditoría.
* **Criterio de Éxito:** 100% de suites ejecutadas y aprobadas.

#### Tarea 5.2: Pruebas de Integración y Construcción de Frontend
* **Validación TypeScript:** `npx tsc -b` sin errores de tipos.
* **Empaquetado:** `npm run build` en frontend con bundle limpio en Vite.

---

## ⚠️ 4. Matriz de Riesgos y Mitigaciones

| Riesgo Identificado | Probabilidad | Impacto | Estrategia de Mitigación |
| :--- | :---: | :---: | :--- |
| **Rechazo por Calidad Institucional de formatos no vigentes** | Alta | Crítico | **Apego estricto:** Prohibir cualquier plantilla nueva; emitir únicamente `PO-DFG-100-3` y `PO-DFG-100-4` con sus códigos y banners oficiales. |
| **Intento de sortear casos por ruleta en FCE** | Media | Alto | **Doble barrera:** Frontend oculta la ruleta para FCE; backend valida carrera y rechaza con HTTP 400. |
| **Postulante remoto alega no haber presenciado el sorteo** | Media | Crítico | **Evidencia digital:** Bloqueo hasta presionar botón "ACTIVO"; registro de IP, estampa de tiempo y latidos WebSocket en base de datos. |
| **Desabastecimiento de casos en áreas críticas** | Media | Medio | **Alertas preventivas y reactivación:** Notificación al bajar de 2 casos; habilitar reactivación manual por Jefe de Carrera con justificación forense. |
| **Filtración o desgaste de casos de estudio** | Alta | Alto | **Tope de 2 usos inviolable:** Inactivación automática a estado `AGOTADO` al segundo uso registrado. |
