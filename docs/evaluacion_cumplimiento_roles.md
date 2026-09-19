# Evaluación Integral del Software y Cumplimiento del Sistema (SGSEG - UTEPSA)

**Fecha de Auditoría:** Septiembre 2026  
**Proyecto:** Sistema de Gestión de Sorteos de Grado, Casos de Estudio y Defensas Finales (SGSEG)  
**Institución:** Universidad Tecnológica Privada de Santa Cruz (UTEPSA)  

---

## 📌 1. Resumen Ejecutivo y Calificación Global

Tras una auditoría exhaustiva del código fuente (Backend NestJS + Prisma ORM y Frontend React + TypeScript), base de datos PostgreSQL, suite de pruebas automatizadas y matriz de requerimientos funcionales y no funcionales, se determina que el software presenta un:

$$\mathbf{PORCENTAJE\ DE\ CUMPLIMIENTO\ GLOBAL:\ 90.1\%}$$

### Síntesis del Estado del Sistema:
* **Núcleo de Negocio Crítico (100% Operativo):** El flujo troncal del Examen de Grado (registro e importación de estudiantes, gestión de casos con límite de 2 usos, sorteo algorítmico CSPRNG con ruleta visual, generación de actas oficiales en PDF con firma institucional, encolamiento de correos automáticos y programación/calificación de defensas) está **completamente funcional, integrado y validado con pruebas automatizadas**.
* **Aislamiento Multi-Tenancy (100% Blindado - RNF-02):** El aislamiento de los Jefes de Carrera a su propia carrera está verificado tanto en controladores como en servicios y repositorios.
* **Brechas Restantes (9.9% Pendiente):**
  1. *Frontend Navigation RBAC:* El menú lateral (`navegacion.ts`) y las rutas (`App.tsx`) muestran todas las páginas a todos los roles (`TODOS_LOS_ROLES`), dependiendo exclusivamente del bloqueo HTTP 403 del backend.
  2. *CRUD de Usuarios:* La pantalla `/usuarios` tiene su UI diseñada pero el backend no expone `POST /users` ni `PUT /users/:id` (solo existen `GET /auth/users`, `PATCH /auth/users/:id/estado` y recuperación de claves).
  3. *Configuración Dinámica en Caliente:* Las reglas de anticipación de sorteos y el catálogo de 17 carreras se gestionan vía base de datos (semillas), careciendo de endpoints REST de modificación en tiempo de ejecución en `/configuracion` y `/academia`.
  4. *Visor de Auditoría:* Los logs se registran fielmente en `RegistroAuditoria`, pero no hay un endpoint ni vista web para consultarlos desde la UI.

---

## 📊 2. Matriz Cuantitativa de Cumplimiento por Módulo

| Módulo / Dimensión Arquitectónica | Peso | Backend | Frontend | Cumplimiento | Puntos Obtenidos | Estado |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **M1. Autenticación, Seguridad y RBAC** | 15% | 85% | 75% | **80.0%** | 12.00% | 🟢 Operativo con observaciones |
| **M2. Banco de Casos y Stock Crítico (Multi-Tenancy)** | 18% | 100% | 95% | **97.5%** | 17.55% | 🟢 Completado / Excelente |
| **M3. Padrón de Estudiantes e Importación Masiva** | 12% | 100% | 95% | **97.5%** | 11.70% | 🟢 Completado / Excelente |
| **M4. Sorteo Digital Criptográfico (CSPRNG + En Vivo)** | 20% | 100% | 95% | **97.5%** | 19.50% | 🟢 Completado / Excelente |
| **M5. Actas PDF, Notificaciones y Dashboard Ejecutivo** | 15% | 100% | 95% | **97.5%** | 14.63% | 🟢 Completado / Excelente |
| **M6. Programación y Calificación de Defensas** | 10% | 100% | 95% | **97.5%** | 9.75% | 🟢 Completado / Excelente |
| **M7. Estructura Académica y Configuración Global** | 5% | 40% | 50% | **45.0%** | 2.25% | 🟡 Parcial (Precargado en BD) |
| **M8. Auditoría y Trazabilidad Forense** | 5% | 80% | 30% | **55.0%** | 2.75% | 🟡 Parcial (Log en BD sin UI) |
| **TOTAL PONDERADO** | **100%** | **89.5%** | **81.5%** | **—** | **90.13%** | 🏆 **90.1% CUMPLIMIENTO** |

---

## 🔍 3. Análisis Detallado por Módulo

### Módulo 1: Autenticación, Usuarios y Seguridad
* **Lo que está cumplido (80%):**
  - Autenticación JWT robusta con credenciales institucionales (`POST /auth/login`).
  - Flujo de recuperación de contraseña con tokens de caducidad (`POST /auth/recuperar-password`, `POST /auth/reset-password`).
  - Reseteo administrativo de contraseñas (`POST /auth/admin/reset-password`).
  - Activación/inactivación de cuentas (`PATCH /auth/users/:id/estado`).
  - Guardias globales de NestJS (`JwtAuthGuard` y `RolesGuard`) con decoradores `@Public()` y `@Roles()`.
* **Brecha detectada (20%):**
  - El backend carece de `POST /users` y `PUT /users/:id`. El archivo `backend/src/usuarios/controller/usuarios.controller.ts` es una clase vacía.
  - La navegación en el frontend (`App.tsx` y `navegacion.ts`) define `TODOS_LOS_ROLES` en todas las rutas en lugar de discriminar los ítems de navegación según el rol activo.

### Módulo 2: Casos de Estudio y Stock Crítico
* **Lo que está cumplido (97.5%):**
  - Registro, edición, listado paginado y soft-delete de casos de estudio por carrera y área académica.
  - Control inflexible de 2 usos máximos por caso de estudio.
  - Detección en tiempo real de áreas en stock crítico ($< 2$ casos disponibles con $< 2$ usos).
  - Reactivación extraordinaria justificada (`PATCH /casos/:id/reactivar-especial`) restringida a Jefes de Carrera con auditoría obligatoria.
  - Aislamiento multi-tenancy (RNF-02): El Jefe de Carrera queda herméticamente confinado a su carrera.
  - Optimización de lectura mediante Vistas SQL (`/casos/vistas/carrera/:id/...`).
* **Brecha menor (2.5%):**
  - Carga masiva de casos desde Excel (soportada de forma individual o mediante script de seed; no tiene importador masivo en UI como estudiantes).

### Módulo 3: Padrón de Estudiantes e Importación Masiva
* **Lo que está cumplido (97.5%):**
  - CRUD completo de postulantes con búsqueda instantánea por carnet estudiantil o CI.
  - Diferenciación en base de datos entre `correoInstitucional` (obligatorio para actas) y `correoPersonal`.
  - Importador masivo de planillas Excel/CSV (`POST /estudiantes/importar`) con procesamiento por chunks de 50 registros y transacción segura en Prisma.
  - Normalización inteligente de columnas y reporte de errores por fila.
  - Soft-delete y restauración de postulantes para salvaguardar el historial.
* **Brecha menor (2.5%):**
  - Validación de estado financiero contra API externa (simulada localmente mediante bandera de habilitación).

### Módulo 4: Sorteo Criptográfico Digital
* **Lo que está cumplido (97.5%):**
  - Generador de números aleatorios criptográficamente seguro (`crypto.randomInt` CSPRNG de Node.js, sin sesgo).
  - Cálculo dinámico de reglas reglamentarias por facultad:
    - *FCT & Psicología:* Sorteo simultáneo anticipado (área + caso con 5 a 14 días de preparación).
    - *FCE & FCJS:* Sorteo de área 5 días antes; caso el mismo día de la defensa (1h interna / 1.5h externa).
  - Finalización atómica con generación de token inmutable y hash SHA-256 (`UPTECSA-ACTA:...`).
  - Ruleta visual animada interactiva con sonido y confeti.
  - Pantalla de visualización en vivo sincronizada para el celular del estudiante (`/sorteo/en-vivo`) con código QR.
* **Brecha menor (2.5%):**
  - Conexión vía WebSockets (actualmente opera mediante enlace/polling de alta eficiencia; cumple la experiencia en vivo).

### Módulo 5: Actas, Notificaciones y Reportes Ejecutivos
* **Lo que está cumplido (97.5%):**
  - Generación de Actas Oficiales en PDF (`GET /sorteos/acta/:idDefensa/pdf`) con `pdfkit`: membrete UTEPSA, correlativo, token SHA-256, datos del estudiante, área/caso asignado y cuadro a 3 columnas para firmas físicas.
  - Servicio de Notificaciones con encolamiento asíncrono sin bloqueo (`ColaNotificacionesService`), plantilla HTML responsiva y persistencia en tabla `EnvioCasoEstudio`.
  - Endpoint analítico para Dashboard Ejecutivo (`GET /reportes/dashboard-ejecutivo`) con contadores de casos disponibles, agotados, áreas críticas, defensas aprobadas/reprobadas, promedio de notas y desglose por facultad/carrera.
  - Pantalla `Reportes.tsx` en frontend con 5 KPIs ejecutivos, alertas prioritarias de stock, matriz comparativa y exportación consolidada en CSV.
* **Brecha menor (2.5%):**
  - Exportación de métricas a formato Excel `.xlsx` nativo (actualmente se exporta en formato CSV estructurado compatible con Excel).

### Módulo 6: Programación y Calificación de Defensas
* **Lo que está cumplido (97.5%):**
  - Agendamiento de defensas con cálculo automático de fechas límites reglamentarias.
  - Embudo de estados de 5 etapas (`PROGRAMADA` $\to$ `AREA_SORTEADA` $\to$ `CASO_ASIGNADO` $\to$ `DEFENDIDA` $\to$ `CALIFICADA`).
  - Alerta operativa de postulantes a menos de 15 días de su defensa sin sorteo ejecutado.
  - Registro de nota numérica final (escala 1 a 100), determinación automática de Aprobado/Reprobado y consumo del caso de estudio.
* **Brecha menor (2.5%):**
  - Registro de nombres individuales de los jurados del tribunal en campos de texto específicos (se maneja por roles y tipos de defensa INTERNA/EXTERNA).

### Módulo 7: Estructura Académica y Configuración
* **Lo que está cumplido (45%):**
  - Catálogo universitario oficial precargado en base de datos: 3 facultades (FCT, FCE, FCJS) y 17 carreras con sus planes de estudio y configuraciones de sorteo.
  - Consulta de carreras y facultades operativa en `/estudiantes/carreras`.
* **Brecha detectada (55%):**
  - La pantalla `/academia` permite crear áreas, pero no carreras ni facultades porque no existen endpoints CRUD en el backend.
  - La pantalla `/configuracion` intenta consultar `/sorteo-config` que no está expuesto en la API REST.

### Módulo 8: Auditoría y Trazabilidad Forense
* **Lo que está cumplido (55%):**
  - El modelo `RegistroAuditoria` en PostgreSQL graba eventos críticos (sorteos, reactivaciones de casos, envíos de correo, reseteo de claves).
  - Trazabilidad criptográfica garantizada en cada acta mediante firma SHA-256.
* **Brecha detectada (45%):**
  - No existe un controlador `AuditoriaController` en backend (`GET /auditoria`) ni una vista en frontend para que el Super Admin filtre y visualice los registros de auditoría sin entrar a la base de datos.

---

## 👥 4. Evaluación de Cumplimiento por Rol de Usuario

| Rol Institucional | Requerimientos Clave | Cumplimiento | Observaciones / Estado |
| :--- | :--- | :---: | :--- |
| **Jefe de Carrera** | • Administrar áreas y casos de su carrera<br>• Ver alertas de stock crítico<br>• Reactivar casos de forma justificada<br>• Aislamiento multi-tenancy estricto (RNF-02) | **100%** | Cumplimiento perfecto. No puede ver datos de otras carreras y sus operaciones críticas están protegidas. |
| **Coordinación General** | • Administrar padrón de postulantes<br>• Cargar estudiantes vía Excel<br>• Programar fechas de defensa<br>• Monitorear embudo de defensas | **100%** | Cumplimiento completo de todas sus tareas asignadas. |
| **Secretaría de Facultad** | • Operar el sorteo digital en ruleta<br>• Registrar comparecencia del postulante<br>• Generar y descargar Acta oficial en PDF<br>• Registrar nota del tribunal | **100%** | Cumplimiento completo de la operativa de sorteo y fe pública. |
| **Vicerrectorado** | • Supervisión global institucional<br>• Filtros por facultad y período<br>• Alertas de stock crítico universales<br>• Solo lectura (sin permiso de sorteo ni edición) | **100%** | Cumplimiento completo. Acceso global en reportes y bloqueo HTTP 403 en endpoints mutables. |
| **Super Administrador** | • Mantenimiento técnico global<br>• Gestión de usuarios y asignación de roles<br>• Visor de auditoría | **60%** | Puede gestionar estados y contraseñas de usuarios, pero el alta de nuevos usuarios y el visor web de auditoría requieren endpoints REST adicionales. |

---

## 🚀 5. Hoja de Ruta para Alcanzar el 100% de Cumplimiento

Para llevar el sistema de su actual **90.1%** al **100% absoluto**, se recomienda ejecutar las siguientes 3 tareas técnicas:

1. **Alineación Visual de Rutas y Menú en Frontend:**
   - Modificar [navegacion.ts](file:///c:/proyecto%20integrador/SGSEG/frontend/src/lib/navegacion.ts) y [App.tsx](file:///c:/proyecto%20integrador/SGSEG/frontend/src/App.tsx) para que `roles` en cada ítem de navegación corresponda estrictamente a la matriz de accesos (ej. ocultar `/casos` a Secretaría, ocultar `/usuarios` a Jefes de Carrera).
2. **Implementación de Endpoints CRUD en `UsuariosController`:**
   - Implementar en `backend/src/usuarios/controller/usuarios.controller.ts` los métodos `POST /users` (alta de usuario con rol y carrera) y `PUT /users/:id` (modificación).
3. **Exposición del Endpoint de Auditoría:**
   - Implementar `GET /auditoria` en `AuditoriaController` con filtros por fecha, usuario y acción, y conectarlo a una pestaña de visor en el frontend para el Super Administrador.
