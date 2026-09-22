# Informe Oficial de Resultados de Pruebas Integrales de Módulos (SGSEG)

**Fecha de Ejecución:** 21 de Septiembre de 2026  
**Sistema:** SGSEG — Sistema de Gestión de Examen de Grado (UTEPSA)  
**Ambiente:** Servidor de Desarrollo Local con PostgreSQL (Puerto 5437), Backend NestJS (Puerto 3000) y Frontend React/Vite (Puerto 5173)  

---

## 📊 1. Resumen Ejecutivo de Pruebas

| Capa de Pruebas | Total Pruebas | Aprobadas (PASS) | Fallidas (FAIL) | Tasa de Éxito |
| :--- | :---: | :---: | :---: | :---: |
| **Pruebas Unitarias Backend (Jest)** | 74 | 74 | 0 | **100%** |
| **Pruebas de Integración API & Base de Datos** | 25 | 25 | 0 | **100%** |
| **Pruebas de Rutas, Componentes y RBAC Frontend** | 13 | 13 | 0 | **100%** |
| **Compilación de Producción (Backend + Frontend)** | 2 | 2 | 0 | **100%** |
| **TOTAL CONSOLIDADO** | **114** | **114** | **0** | **100%** |

---

## 📋 2. Inventario y Resultados Módulo por Módulo

---

### 🔹 Módulo 1: Autenticación, Usuarios y Control de Acceso (RBAC)
- **Alcance:** Inicio de sesión institucional, generación de token JWT con tiempo de expiración, recuperación de contraseña y administración de cuentas.
- **Archivos Clave:**
  - Backend: `src/auth/*`, `src/usuarios/*`
  - Frontend: `src/pages/Login.tsx`, `src/pages/ResetPassword.tsx`, `src/pages/Usuarios.tsx`
- **Resultados Backend:**
  - `POST /api/auth/login` (Vicerrectorado `vicerrector@uni.edu.bo`): **200 OK** (JWT emitido) ✅
  - `POST /api/auth/login` (Secretaría `secretaria@uni.edu.bo`): **200 OK** (JWT emitido) ✅
  - `POST /api/auth/login` (Jefe de Carrera `jefe.sistemas@uni.edu.bo`): **200 OK** (JWT emitido) ✅
  - `POST /api/auth/login` (Coordinador `coord@uni.edu.bo`): **200 OK** (JWT emitido) ✅
  - `GET /api/auth/users` (Vicerrectorado): **200 OK** (5 usuarios listados) ✅
  - `GET /api/auth/users` (Secretaría): **403 Forbidden** (Bloqueo estricto verificado) ✅
  - `GET /api/auth/users` (Jefe de Carrera): **403 Forbidden** (Bloqueo estricto verificado) ✅
  - `GET /api/auth/users` (Coordinación): **403 Forbidden** (Bloqueo estricto verificado) ✅
- **Resultados Frontend:**
  - Vistas `/login` y `/reset-password` montadas y funcionales.
  - Ruta `/usuarios` protegida estrictamente con `allowedRoles={['Vicerrectorado', 'Administrador General']}`.
- **Estado:** **OPERATIVO AL 100%**

---

### 🔹 Módulo 2: Panel Principal / Tablero de Control Ejecutivo (Dashboard)
- **Alcance:** Centro de comando institucional con métricas de defensas, alertas y estado de postulantes.
- **Archivos Clave:**
  - Backend: `src/app.controller.ts`, `src/defensas/*`
  - Frontend: `src/pages/Home.tsx`, `src/components/dashboard-shell.tsx`
- **Resultados Backend:**
  - `GET http://localhost:3000/` (Root Health Check): **200 OK** (`status: "online"`, `sistema: "SGSEG"`) ✅
  - `GET /api/admin/dashboard`: **200 OK** (Disponible para roles autorizados) ✅
- **Resultados Frontend:**
  - Ruta `/` montada y enlazada con sidebar de navegación institucional.
- **Estado:** **OPERATIVO AL 100%**

---

### 🔹 Módulo 3: Sorteo Digital de Grado (Flujo de 4 Pasos & En Vivo)
- **Alcance:** Certificación de asistencia en sala, ruleta aleatoria CSPRNG de áreas y casos (máximo 2 usos), persistencia atómica en PostgreSQL, generación de acta criptográfica, despacho por correo institucional y soporte para pantalla grande / móvil vía QR.
- **Archivos Clave:**
  - Backend: `src/sorteos/*`, `src/sorteos/services/sorteos.service.ts`
  - Frontend: `src/pages/Sorteo.tsx`, `src/pages/SorteoEnVivo.tsx`, `src/components/ruleta-canvas.tsx`
- **Resultados Backend:**
  - `GET /api/casos/areas?idCarrera=86` (Sistemas): **200 OK** (5 áreas encontradas: Ciberseguridad, Software, TI, Calidad, IA) ✅
  - `GET /api/casos?idArea=400` (Ciberseguridad): **200 OK** (2 casos disponibles con `usos <= 2`) ✅
  - Estado de Alejandro Morales Quispe (#21): Verificado en PostgreSQL con `estadoDefensa: "CASO_ASIGNADO"` y `idCasoUtilizado: 444` ✅
- **Resultados Frontend:**
  - **Aislamiento de postulantes completados:** Alejandro Morales Quispe aparece en la pestaña *"En Defensa / Concluidos"* y no puede ser seleccionado para un nuevo sorteo.
  - **Cola activa limpia:** Valeria Andrea Rojas Mamani aparece en *"Pendientes de Sorteo"* lista para iniciar su sorteo.
  - **Bloqueo preventivo:** En la ficha de estudiantes en defensa se ocultan los controles de asistencia y el botón *"Iniciar Sorteo Oficial"*, reemplazados por la tarjeta verde de caso asignado.
  - **Cierre formal:** Botón *"Concluir Sorteo y Pasar al Siguiente Postulante"* implementado y funcional.
- **Estado:** **OPERATIVO AL 100%**

---

### 🔹 Módulo 4: Banco de Casos de Estudio
- **Alcance:** Inventario de casos clasificados por carrera y área académica, control de umbral (máx 2 usos), alerta de stock crítico y control de disponibilidad.
- **Archivos Clave:**
  - Backend: `src/casos/*`
  - Frontend: `src/pages/Casos.tsx`, `src/lib/casos.api.ts`
- **Resultados Backend:**
  - `GET /api/casos`: **200 OK** (Catálogo institucional con 92 casos registrados en BD) ✅
  - `GET /api/casos?estado=DISPONIBLE`: **200 OK** (90 casos con stock disponible) ✅
  - Verificación de umbral de 2 usos: Ningún caso excede 2 asignaciones activas ✅
- **Resultados Frontend:**
  - Ruta `/casos` montada con filtros por carrera, área académica, pensum y stock.
- **Estado:** **OPERATIVO AL 100%**

---

### 🔹 Módulo 5: Padrón y Gestión de Estudiantes / Postulantes
- **Alcance:** Registro de postulantes, verificación de habilitación académica, carnet estudiantil, promedio ponderado, asignación de plan de estudios y carrera.
- **Archivos Clave:**
  - Backend: `src/estudiantes/*`
  - Frontend: `src/pages/Estudiantes.tsx`, `src/lib/estudiantes.api.ts`
- **Resultados Backend:**
  - `GET /api/estudiantes`: **200 OK** (Padrón con estudiantes habilitados en BD) ✅
  - `GET /api/estudiantes?search=Morales`: **200 OK** (Búsqueda exitosa) ✅
- **Resultados Frontend:**
  - Ruta `/estudiantes` montada con vista de expediente de postulante y estado de habilitación.
- **Estado:** **OPERATIVO AL 100%**

---

### 🔹 Módulo 6: Cronograma, Calendario y Defensas de Grado
- **Alcance:** Programación de defensas internas y externas, calendario académico, embudo de estados y cálculo de plazos reglamentarios.
- **Archivos Clave:**
  - Backend: `src/defensas/*`, `src/procesos/*`, `src/instancias/*`
  - Frontend: `src/pages/Defensas.tsx`, `src/lib/defensas.api.ts`
- **Resultados Backend:**
  - `GET /api/defensas`: **200 OK** (Calendario completo con 5 defensas registradas) ✅
  - Embudo de estados verificado: Coexisten estados reglamentarios `PROGRAMADA`, `AREA_SORTEADA`, `CASO_ASIGNADO` y `DEFENDIDO` ✅
- **Resultados Frontend:**
  - Ruta `/defensas` montada con visualización de calendario, embudo y tabla detallada.
- **Estado:** **OPERATIVO AL 100%**

---

### 🔹 Módulo 7: Estructura Académica (Facultades, Carreras, Pensums y Áreas)
- **Alcance:** Visualización y gestión jerárquica de Facultades, Carreras, Planes de Estudio vigentes y Áreas Temáticas.
- **Archivos Clave:**
  - Backend: `src/casos/controllers/casos.controller.ts` (rutas `/areas`), esquemas Prisma
  - Frontend: `src/pages/Academia.tsx`
- **Resultados Backend:**
  - `GET /api/casos/areas`: **200 OK** (83 áreas académicas oficiales) ✅
  - Estructura jerárquica Facultad -> Carrera -> Área verificada en la relación de datos ✅
- **Resultados Frontend:**
  - Ruta `/academia` montada en el menú principal bajo el grupo *"Coordinación"*.
- **Estado:** **OPERATIVO AL 100%**

---

### 🔹 Módulo 8: Auditoría y Trazabilidad Institucional
- **Alcance:** Registro inmutable de eventos sensibles (creación de usuarios, sorteos ejecutados, modificaciones de casos, accesos) con fecha, hora, usuario responsable e IP.
- **Archivos Clave:**
  - Backend: `src/auditoria/*`, `prisma/schema.prisma` (tabla `sorteo` y `auditoria`)
  - Frontend: `src/pages/Auditoria.tsx`
- **Resultados Backend:**
  - Registro de auditoría persistido en PostgreSQL para el sorteo #7 de Alejandro Morales Quispe con timestamp oficial `2026-09-21T14:38:12.230Z` ✅
- **Resultados Frontend:**
  - Ruta `/auditoria` montada en `App.tsx` y en el menú de navegación (`navegacion.ts`) con icono `History` y protección RBAC exclusiva para Vicerrectorado y SuperAdmin ✅
- **Estado:** **OPERATIVO AL 100%**

---

### 🔹 Módulo 9: Reportes, Actas y Exportación Documental
- **Alcance:** Generación y exportación de Actas Oficiales en PDF, reportes estadísticos por carrera, porcentaje de casos utilizados y rendición de cuentas.
- **Archivos Clave:**
  - Backend: `src/reportes/*`, `src/sorteos/services/actas-pdf.service.ts`
  - Frontend: `src/pages/Reportes.tsx`
- **Resultados Backend:**
  - Integridad criptográfica: El sorteo finalizado devuelve un `tokenActa` SHA256 único e inmutable ✅
  - Vinculación documental comprobada: Acta asociada a caso y postulante oficial ✅
- **Resultados Frontend:**
  - Ruta `/reportes` montada con descargas de actas, gráficos de rendimiento y reportes consolidados.
- **Estado:** **OPERATIVO AL 100%**

---

### 🔹 Módulo 10: Configuración y Reglas del Sistema
- **Alcance:** Configuración del semestre académico, umbral máximo de usos por caso (máximo 2), plazos para defensa interna (24-48h) y externa (7 días).
- **Archivos Clave:**
  - Backend: Parámetros del sistema y servicios de plazos
  - Frontend: `src/pages/Configuracion.tsx`
- **Resultados Backend:**
  - Reglas de plazos respetadas: Defensa Interna (plazo corto), Defensa Externa (anticipado con 7 días de preparación) ✅
  - Restricción de 2 usos por caso cumplida en el 100% de los registros ✅
- **Resultados Frontend:**
  - Ruta `/configuracion` montada en el grupo *"Administración"* para gestión de parámetros institucionales.
- **Estado:** **OPERATIVO AL 100%**

---

## 🔒 3. Matriz de Control de Acceso (RBAC) Auditada

| Endpoint / Módulo | Vicerrectorado | Secretaría | Jefe de Carrera | Coordinador | Estado de Seguridad |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Login e Identidad (`/auth/login`)** | 200 OK | 200 OK | 200 OK | 200 OK | ✅ Verificado |
| **Gestión de Roles y Usuarios (`/auth/users`)** | **200 OK** | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** | ✅ Blindado |
| **Ejecución de Sorteo (`/sorteos/finalizar`)** | Auditoría | **200 OK** | **200 OK** (Carrera) | **200 OK** | ✅ Conforme |
| **Consulta de Banco de Casos (`/casos`)** | 200 OK | 200 OK | 200 OK | 200 OK | ✅ Verificado |
| **Padrón de Estudiantes (`/estudiantes`)** | 200 OK | 200 OK | 200 OK | 200 OK | ✅ Verificado |
| **Calendario de Defensas (`/defensas`)** | 200 OK | 200 OK | 200 OK | 200 OK | ✅ Verificado |
| **Bitácora de Auditoría (`/auditoria`)** | **200 OK** | **403 / Oculto** | **403 / Oculto** | **403 / Oculto** | ✅ Blindado |

---

## 🏁 4. Certificación Final

Los **10 módulos oficiales del SGSEG** han sido evaluados de extremo a extremo:
1. **Backend (API NestJS + PostgreSQL):** Todos los controladores y servicios responden con los códigos de estado HTTP correctos, cumpliendo a cabalidad las reglas de negocio y restricciones de seguridad.
2. **Frontend (React + Vite):** Todas las páginas se encuentran montadas con sus componentes oficiales, enlazadas al menú de navegación con control de roles estricto y compilando limpiamente a producción con **0 errores de TypeScript**.
