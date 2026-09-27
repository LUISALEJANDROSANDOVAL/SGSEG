# EVALUACIÓN TÉCNICA Y PLAN OPERATIVO DE ARCHIVOS (SGSEG - UTEPSA)

**Documento:** Evaluación del Plan de Implementación y Mapeo Operativo de Archivos  
**Sistema:** SGSEG — Sistema de Gestión y Seguridad Criptográfica de Exámenes de Grado  
**Institución:** Universidad Tecnológica Privada de Santa Cruz (UTEPSA)  
**Fecha:** Septiembre 2026  

---

## 🎯 PARTE 1: ¿QUÉ ESTÁ BIEN DE TU PLAN? (FORTALEZAS TÉCNICAS Y NORMATIVAS)

Tu plan de implementación es **altamente sólido y maduro**, porque no solo aborda la programación, sino que resuelve los cuellos de botella normativos, organizacionales y legales de la UTEPSA:

1. **Alineación con la Restricción de Calidad Institucional (Gran Acierto):**
   * Descartar proponer plantillas nuevas es una decisión estratégica excelente. Cualquier formato nuevo en UTEPSA requiere un proceso burocrático de homologación ante el área de Calidad que demora semanas o meses.
   * Utilizar estrictamente los formatos vigentes (**`PO-DFG-100-3`** para internas, el acta de externas y **`PO-DFG-100-4`** para la carátula de sobre sellado) garantiza que el software sea aprobado y utilizado de inmediato sin objeciones administrativas.

2. **Diferenciación Real por Facultades (FCE vs FCJS):**
   * En la versión previa del código, Ciencias Empresariales tenía una regla que solo validaba si la fecha era la del día de la defensa, pero seguía girando ruleta.
   * Tu plan corrige esto de raíz: **FCE elimina la segunda fase de ruleta** (solo sortea área y asigna el caso directamente de las opciones activas), mientras que **Derecho conserva estrictamente las dos fases** con ruleta de casos en sala. Esto se apega fielmente al reglamento de cada disciplina.

3. **Reutilización Infinita de Áreas de Conocimiento:**
   * Garantiza la continuidad operativa. Las áreas académicas (Derecho Penal, Finanzas, Redes, etc.) son patrimonios temáticos fijos del pensum; no deben agotarse como si fueran casos de estudio.

4. **Blindaje Legal ante Impugnaciones (Consentimiento Digital "ACTIVO"):**
   * El mayor riesgo de un sorteo remoto es que un estudiante reprobado impugne argumentando: *"Yo nunca me conecté, sortearon a mis espaldas"*.
   * Exigir el motivo formal de inasistencia (baja médica certificada, cirugía) y **bloquear el inicio del sorteo en la pantalla de la sala hasta que el estudiante presiona el botón "ACTIVO" en su teléfono móvil** crea una prueba pericial y forense irrefutable de su consentimiento informado.

5. **Ciclo de Vida de Casos (Tope de 2 Usos y Auditoría):**
   * El tope de 2 usos con inactivación automática a `AGOTADO` erradica la filtración de casos entre semestres.
   * La reactivación manual condicionada al rol de Jefe de Carrera y supeditada a una justificación formal en texto plano guardada en `registro_auditoria` provee flexibilidad ante contingencias sin romper la fe pública.

---

## 📂 PARTE 2: MAPEO EXACTO DE ARCHIVOS (CREAR, MODIFICAR Y PRESERVAR)

Para implementar este plan de manera limpia, sin romper los 78 tests existentes ni desestabilizar la aplicación, este es el inventario técnico exacto:

```text
SGSEG/
├── backend/
│   ├── src/
│   │   ├── sorteos/
│   │   │   ├── dto/sorteos.dto.ts                           [MODIFICAR]
│   │   │   ├── services/sorteos.service.ts                  [MODIFICAR]
│   │   │   ├── services/actas-pdf.service.ts                [MODIFICAR]
│   │   │   ├── controller/sorteos.controller.ts             [MODIFICAR]
│   │   │   └── services/sorteos.service.spec.ts             [MODIFICAR]
│   │   └── casos/
│   │       ├── controller/casos.controller.ts               [PRESERVAR - YA EXISTE]
│   │       └── services/casos.service.ts                    [PRESERVAR - YA EXISTE]
├── frontend/
│   ├── src/
│   │   ├── lib/sorteos.api.ts                               [MODIFICAR]
│   │   └── pages/
│   │       ├── Sorteo.tsx                                   [MODIFICAR]
│   │       ├── SorteoEnVivo.tsx                             [MODIFICAR]
│   │       └── Casos.tsx                                    [PRESERVAR - YA CONECTADO]
└── docs/
    ├── plan_implementacion_ajustes_reunion.md               [CREADO]
    ├── plan_operativo_y_mapeo_archivos.md                   [CREADO]
    └── PROYECTO_INTEGRADOR_SGSEG.md                         [MODIFICAR]
```

---

### 📝 1. Archivos a MODIFICAR en BACKEND

#### 📄 `backend/src/sorteos/dto/sorteos.dto.ts`
* **¿Qué se modifica?:**
  * En `SortearAreaDto` y `SortearCasoDto`, añadir el campo opcional:
    ```typescript
    @IsOptional()
    @IsString()
    tokenSesionLive?: string;
    ```
* **¿Por qué?:** Permite que la consola de sorteo envíe el token de la sesión remota para que el backend valide si el estudiante ya presionó el botón "ACTIVO" antes de permitir el sorteo.

#### 📄 `backend/src/sorteos/services/sorteos.service.ts`
* **¿Qué se modifica?:**
  1. **Inyección de Dependencia:** Inyectar como `@Optional()` el servicio `SorteosLiveService`.
  2. **Validación de Consentimiento Remoto:**
     ```typescript
     private verificarConsentimientoRemoto(tokenSesionLive?: string) {
       if (tokenSesionLive && this.sorteosLiveService) {
         const listo = this.sorteosLiveService.verificarConsentimientoEstudiante(tokenSesionLive);
         if (!listo) {
           throw new BadRequestException('El estudiante remoto aún no ha confirmado su asistencia presionando el botón "ACTIVO".');
         }
       }
     }
     ```
  3. **Restricción Normativa para FCE:**
     * En `sortearCaso()`, si `esEmpresariales === true`, arrojar excepción HTTP 400:
       `"Las carreras de Ciencias Empresariales no admiten segundo sorteo de caso por ruleta. El caso debe asignarse de manera directa el día de la defensa."`
  4. **Emisión de Carátula:**
     * Implementar método `generarCaratulaPdf(idDefensa, user)` que consulte la defensa y delegue la generación del buffer al `ActasPdfService`.

#### 📄 `backend/src/sorteos/services/actas-pdf.service.ts`
* **¿Qué se modifica?:**
  1. **Membrete de Calidad Institucional `PO-DFG-100-3`:**
     * En `renderizarContenidoActa()`, incluir el cintillo superior:
       `CÓDIGO DE CALIDAD: PO-DFG-100-3 | ACTA OFICIAL DE SORTEO — EXAMEN DE GRADO (DEFENSA INTERNA)` (o Acta de Externa según corresponda).
  2. **Bloque de Firma Física Tripartita:**
     * Tres casilleros con línea punteada de firma:
       * *Postulante* (Conformidad de sorteo y recepción).
       * *Jefe de Carrera* (Fe de rigurosidad académica y vigencia del caso).
       * *Testigo Académico / Secretaría de Facultad* (Fe pública del acto).
  3. **Nuevo Método: `generarCaratulaCasoPdfBuffer()` con código `PO-DFG-100-4`:**
     * Generación de la carátula oficial que se adhiere al sobre manila sellado.
     * Incluye datos del postulante, carrera, código del caso, título, fecha de defensa, verificación de sobre sellado intacto y advertencia reglamentaria de apertura exclusiva por el tribunal evaluador.

#### 📄 `backend/src/sorteos/controller/sorteos.controller.ts`
* **¿Qué se modifica?:**
  * Agregar el endpoint REST protegido por RBAC:
    ```typescript
    @Get('caratula/:idDefensa/pdf')
    @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
    async descargarCaratulaPdf(@Param('idDefensa') idDefensa: string, @Res() res: Response, @CurrentUser() user: AuthenticatedUser)
    ```

#### 📄 `backend/src/sorteos/services/sorteos.service.spec.ts`
* **¿Qué se modifica?:**
  * Incorporar 3 pruebas unitarias específicas:
    1. *Debe rechazar el sorteo por ruleta de caso para carreras de Ciencias Empresariales (HTTP 400).*
    2. *Debe bloquear el sorteo si el estudiante remoto no ha dado su consentimiento ("ACTIVO").*
    3. *Debe generar exitosamente el buffer PDF para la carátula PO-DFG-100-4.*

---

### 📝 2. Archivos a MODIFICAR en FRONTEND

#### 📄 `frontend/src/lib/sorteos.api.ts`
* **¿Qué se modifica?:**
  * Extender las firmas de `sortearArea` y `sortearCaso` para recibir `tokenSesionLive?: string`.
  * Añadir función helper: `descargarCaratulaPdf(idDefensa: string)`.

#### 📄 `frontend/src/pages/Sorteo.tsx`
* **¿Qué se modifica?:**
  1. **Captura de Modalidad y Justificación (Paso 1):**
     * Selector de modalidad: `PRESENCIAL` o `REMOTA`.
     * Si es remota: campo para ingresar motivo de fuerza mayor (baja médica certificada, cirugía, etc.).
  2. **Bloqueo Inteligente de la Consola de Sorteo:**
     * Si la modalidad es remota, deshabilitar el botón *"Iniciar Sorteo Oficial"* hasta que la sesión live reporte `estudianteListo === true`.
  3. **Lógica Diferenciada FCE vs Derecho:**
     * Si es Ciencias Empresariales: en el Paso 2 el botón dice *"Continuar a Asignación Directa de Caso"*; en el Paso 3 se muestra un selector de tarjetas de casos en stock para asignación directa (sin ruleta).
     * Si es Derecho: en el Paso 2 el botón dice *"Continuar al Sorteo de Caso - Fase 2"*; en el Paso 3 se muestra la ruleta de casos activa.
  4. **Descargas Oficiales (Paso 4):**
     * Botón para descargar el Acta Oficial `PO-DFG-100-3`.
     * Botón para descargar la Carátula Oficial `PO-DFG-100-4`.

#### 📄 `frontend/src/pages/SorteoEnVivo.tsx`
* **¿Qué se modifica?:**
  * En la vista móvil del estudiante (`/sorteo/en-vivo/:slug`):
    * Mostrar botón prominente: **`"BOTÓN 'ACTIVO' — CONFIRMAR ASISTENCIA Y CONSENTIMIENTO"`**.
    * Al presionar, enviar confirmación al backend y actualizar el estado visual a: `Estado: ACTIVO · Consentimiento digital registrado (SUSTENTO FORMAL OK)`.

---

### 🛡️ 3. Archivos que NO se tocan (Preservados Intactos)

* `backend/src/casos/controller/casos.controller.ts` y `casos.service.ts`: Ya cuentan con el método `@Patch(':id/reactivar-especial')`, verificación de límite de usos y aislamiento por carrera.
* `backend/src/auth/*`: Módulos de autenticación, JWT, BCrypt y guardias de rol.
* `backend/src/prisma/*`: Esquema relacional de base de datos (PostgreSQL).

---

### 📄 4. Documentación del Proyecto

#### 📄 `PROYECTO_INTEGRADOR_SGSEG.md` y `docs/PROYECTO_INTEGRADOR_SGSEG.md`
* Actualizar:
  * **RF-10 / HU-02:** Tope de 2 usos e inactivación automática.
  * **RF-11 / HU-03:** Reactivación manual por Jefe de Carrera con justificación forense.
  * **RF-13:** Reutilización infinita de áreas de conocimiento.
  * **RF-14 / HU-04:** Lógica por facultad (FCE asignación directa sin 2da fase; Derecho 2 fases con ruleta).
  * **RF-24 / HU-11:** Actas oficiales `PO-DFG-100-3`, externa y carátula `PO-DFG-100-4` a 3 firmas.
  * **RF-25 / HU-12:** Módulo remoto con justificación médica y botón "ACTIVO".

---

## 🚦 PARTE 3: SECUENCIA DE EJECUCIÓN RECOMENDADA

```text
┌──────────────────────────────────────────────────────────────┐
│ PASO 1: Backend DTOs & Servicios (sorteos.service.ts)        │
│ └─ Incorporar token live y restricción de carrera FCE       │
├──────────────────────────────────────────────────────────────┤
│ PASO 2: Generación PDF de Calidad (actas-pdf.service.ts)     │
│ └─ Membrete PO-DFG-100-3, 3 firmas y carátula PO-DFG-100-4  │
├──────────────────────────────────────────────────────────────┤
│ PASO 3: Validación con Pruebas Unitarias Backend             │
│ └─ Ejecutar npm test (verificar que pasen las 10 suites)     │
├──────────────────────────────────────────────────────────────┤
│ PASO 4: Frontend API & Vistas (Sorteo.tsx y SorteoEnVivo.tsx)│
│ └─ Selector FCE vs Derecho, botón ACTIVO y justificación     │
├──────────────────────────────────────────────────────────────┤
│ PASO 5: Verificación de Build & TypeScript                   │
│ └─ Ejecutar npm run build en frontend (0 errores)            │
├──────────────────────────────────────────────────────────────┤
│ PASO 6: Documentación Formal del Proyecto                    │
│ └─ Sincronizar PROYECTO_INTEGRADOR_SGSEG.md                  │
└──────────────────────────────────────────────────────────────┘
```
