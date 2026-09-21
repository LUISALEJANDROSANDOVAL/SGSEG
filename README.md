# 🎓 SGSEG — Sistema de Gestión de Sorteos de Grado, Casos de Estudio y Defensas Finales

**Universidad Tecnológica Privada de Santa Cruz (UTEPSA)**  
*Plataforma institucional para la administración, blindaje criptográfico, asignación aleatoria y auditoría del Examen de Grado.*

---

## 📌 Estado del Proyecto y Porcentaje de Terminación

$$\mathbf{PORCENTAJE\ GLOBAL\ DE\ TERMINACIÓN:\ 90.1\%\ (NÚCLEO\ 100\%\ OPERATIVO)}$$

```
[██████████████████████████████████████░░░░] 90.1% Cumplimiento Global
[██████████████████████████████████████████] 100% Flujo Troncal de Negocio
```

* **Flujo Troncal de Negocio (100% Operativo):** El ciclo de vida completo del Examen de Grado (padrón de postulantes, importación masiva Excel/CSV, banco de casos con límite inviolable de 2 usos, sorteo algorítmico CSPRNG con ruleta interactiva y modo en vivo para móviles, emisión de actas PDF con firmas físicas, encolamiento asíncrono de notificaciones por correo y calificación final con cierre de expediente) se encuentra **100% implementado, funcional y validado con pruebas automatizadas**.
* **Aislamiento Multi-Tenancy (100% Blindado - RNF-02):** Confinamiento estricto de los Jefes de Carrera a su propia carrera académica en base de datos, consultas Prisma y filtros de servicio con respuesta `403 Forbidden` ante accesos cruzados.
* **Pendientes Menores de Soporte (9.9% Restante):** CRUD REST completo de usuarios (`POST /users`, `PUT /users/:id`), visor web de auditoría en frontend y configuración dinámica en caliente de plazos de sorteo desde la UI.

---

## 📊 Matriz de Cumplimiento por Módulo

| Módulo / Dimensión Arquitectónica | Peso | Backend | Frontend | Cumplimiento | Puntos | Estado Actual |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **M1. Autenticación, Seguridad y RBAC** | 15% | 85.0% | 75.0% | **80.0%** | 12.00% | 🟢 Operativo con observaciones |
| **M2. Banco de Casos y Stock Crítico (Multi-Tenancy)** | 18% | 100.0% | 95.0% | **97.5%** | 17.55% | 🟢 Completado / Excelente |
| **M3. Padrón de Estudiantes e Importador Masivo** | 12% | 100.0% | 95.0% | **97.5%** | 11.70% | 🟢 Completado / Excelente |
| **M4. Sorteo Digital Criptográfico (CSPRNG + En Vivo)** | 20% | 100.0% | 95.0% | **97.5%** | 19.50% | 🟢 Completado / Excelente |
| **M5. Actas PDF, Notificaciones y Dashboard Ejecutivo** | 15% | 100.0% | 95.0% | **97.5%** | 14.63% | 🟢 Completado / Excelente |
| **M6. Programación y Calificación de Defensas** | 10% | 100.0% | 95.0% | **97.5%** | 9.75% | 🟢 Completado / Excelente |
| **M7. Estructura Académica y Configuración Global** | 5% | 40.0% | 50.0% | **45.0%** | 2.25% | 🟡 Parcial (Precargado en BD) |
| **M8. Auditoría y Trazabilidad Forense** | 5% | 80.0% | 30.0% | **55.0%** | 2.75% | 🟡 Parcial (Log en BD sin UI) |
| **TOTAL PONDERADO** | **100%** | **89.5%** | **81.5%** | **—** | **90.13%** | 🏆 **90.1% CUMPLIMIENTO** |

---

## 👥 Cumplimiento y Operatividad por Rol Institucional

| Rol Institucional | Actor / Representante | % Cumplimiento | Resumen Operativo |
| :--- | :--- | :---: | :--- |
| **Jefe de Carrera** | Ing. Carlos Mendoza (Sistemas)<br>Dr. Roberto Quinteros (Derecho) | **100%** | Operativo total. Banco de casos, áreas, stock crítico, reactivación especial justificada y aislamiento RNF-02. |
| **Coordinación General** | Coordinación Académica | **100%** | Operativo total. Padrón de postulantes, importador masivo Excel/CSV, agenda de defensas y monitoreo de embudo. |
| **Secretaría de Facultad** | Lic. Ana Flores Pérez | **100%** | Operativo total. Operación del sorteo en ruleta CSPRNG, generación de actas PDF y registro de notas finales. |
| **Vicerrectorado** | Dra. Beatriz Gutiérrez | **85%** | • **Auditar y Observar:** Dashboard con 5 KPIs, métricas globales, verificación de actas y visor de auditoría.<br>• **Restricción:** **NO puede iniciar un nuevo proceso de sorteo** (imparcialidad reglamentaria).<br>• **Función Activa Única:** **Añadir roles y usuarios al sistema**, principalmente dar de alta al **Jefe de Carrera** y asignarle su carrera académica. |
| **Super Administrador** | Administrador del Sistema | **60%** | Soporte técnico, claves y estados; pendientes endpoints de creación de cuentas y visor de auditoría web. |

---

## 🛠️ Pila Tecnológica (Tech Stack)

* **Backend:** [NestJS](https://nestjs.com/) v11, [TypeScript](https://www.typescriptlang.org/), [Prisma ORM](https://www.prisma.io/) v7 con adaptador nativo `@prisma/adapter-pg`.
* **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) v16 con restricciones relacionales, índices B-Tree y vistas SQL optimizadas.
* **Seguridad:** JWT (JSON Web Tokens), BCrypt, CSPRNG (`crypto.randomInt`), Hash SHA-256 para actas inmutables.
* **Frontend:** [React](https://react.dev/) v19, [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [TailwindCSS](https://tailwindcss.com/), Lucide Icons, Canvas-Confetti.
* **Generación Documental & Correo:** [PDFKit](https://pdfkit.org/) para actas oficiales con membrete institucional, [Nodemailer](https://nodemailer.com/) con cola asíncrona no bloqueante.
* **Testing & QA:** [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) (14 suites de pruebas E2E con 95% de cobertura sobre flujos críticos).

---

## 🚀 Inicio Rápido (Guía de Ejecución Local)

### 1. Requisitos Previos
* Node.js v20+ y npm / pnpm.
* Docker y Docker Compose (o PostgreSQL 16 local).

### 2. Base de Datos
```bash
# Levantar PostgreSQL en Docker (puerto 5432)
docker compose up -d

# O en la raíz del proyecto
npm run db:up
```

### 3. Backend (NestJS)
```bash
cd backend
npm install

# Generar cliente de Prisma y ejecutar migraciones
npx prisma generate
npx prisma migrate deploy

# Sembrar datos iniciales (usuarios oficiales, 17 carreras, áreas y casos de prueba)
npm run db:seed

# Iniciar servidor en modo desarrollo (http://localhost:3000)
npm run dev
```

### 4. Frontend (React + Vite)
```bash
cd frontend
npm install

# Iniciar servidor de desarrollo (http://localhost:5173)
npm run dev
```

### 5. Suite de Pruebas Automatizadas
```bash
cd backend
npm run test:e2e
```

---

## 🔑 Credenciales Oficiales de Prueba

Contraseña universal de desarrollo: **`Admin123!`**

* **Jefe de Carrera (Sistemas):** `jefe.sistemas@uni.edu.bo`
* **Jefe de Carrera (Derecho):** `jefe.derecho@uni.edu.bo`
* **Coordinación General:** `coord@uni.edu.bo`
* **Secretaría de Facultad:** `secretaria@uni.edu.bo`
* **Vicerrectorado:** `vicerrector@uni.edu.bo`

---

## 📚 Mapa de Documentación del Sistema

Toda la documentación técnica, manuales y reportes se encuentran en la carpeta [`/docs`](file:///c:/SGSEG/docs):

1. 📊 [Evaluación de Cumplimiento por Rol y Pendientes](file:///c:/SGSEG/docs/evaluacion_cumplimiento_roles.md) — Auditoría matemática detallada, matriz de responsabilidades por rol y calificación del 90.1%.
2. 🔍 [Análisis Integral y Porcentaje Global de Cumplimiento](file:///c:/SGSEG/docs/analisis_cumplimiento_sistema.md) — Diagnóstico arquitectónico módulo por módulo (M1 a M8) y validación de requerimientos.
3. 📖 [Manual del Flujo Operativo y Arquitectura del Sistema](file:///c:/SGSEG/docs/flujo_operativo_actual.md) — Guía completa paso a paso del ciclo del Examen de Grado en UTEPSA.
4. 🚀 [Plan de Implementación de Pendientes y Cierre al 100%](file:///c:/SGSEG/docs/plan_implementacion_pendientes.md) — Hoja de ruta técnica con tareas para resolver el 9.9% restante.
5. 🔑 [Guía de Acceso, Actores y Credenciales](file:///c:/SGSEG/docs/guia_accesos_y_actores.md) — Credenciales oficiales, permisos RBAC y tutorial de inicio de sesión por rol.
6. 🧪 [Plan Maestro de Pruebas (PMP)](file:///c:/SGSEG/docs/plan_maestro_pruebas.md) — Estrategia de testing y matriz de trazabilidad de las 14 suites E2E.
7. 👥 [Documentación de Usuarios y Roles](file:///c:/SGSEG/docs/usuarios.md) — Especificación de roles institucionales y endpoints de autenticación.
8. 📥 [Módulo 3: Importador Masivo de Estudiantes](file:///c:/SGSEG/docs/modulo3_importador_estudiantes.md) — Especificación del procesamiento por lotes, normalización de datos y reportes de errores.
9. 📑 [Informes de QA y Auditorías Anteriores](file:///c:/SGSEG/docs/qa) — Informes de pruebas de integración, seguridad TK-12, auditoría TK-16 y límites de concurrencia.
