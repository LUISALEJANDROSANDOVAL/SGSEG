# Plan Maestro de Pruebas (PMP) - SGSEG

## 1. Alcance
Este Plan Maestro de Pruebas define la estrategia, tipos de prueba, herramientas y entornos necesarios para asegurar la calidad de las nuevas entidades y módulos del Sistema de Gestión y Seguimiento de Estudiantes y Graduados (SGSEG).

## 2. Tipos de Pruebas

### 2.1 Pruebas Unitarias
- **Objetivo:** Validar que los componentes individuales (servicios, controladores, utilidades) funcionen correctamente de manera aislada.
- **Herramientas:** Jest.
- **Alcance:** Lógica de negocio (ej. normalización de correos, generación de contraseñas, validación de carnets).

### 2.2 Pruebas de Integración (E2E)
- **Objetivo:** Validar el correcto funcionamiento de los flujos completos desde la API (endpoints) hasta la base de datos PostgreSQL.
- **Herramientas:** Jest, Supertest.
- **Alcance:**
  - Flujos de Autenticación (Login, generación de JWT).
  - CRUD de Usuarios y Estudiantes.
  - Carga masiva de datos (bulk-upsert).

### 2.3 Pruebas de Seguridad y Penetración
- **Objetivo:** Garantizar el aislamiento de datos y prevenir escalado de privilegios.
- **Herramientas:** Supertest (en endpoints E2E).
- **Alcance:**
  - Validación de existencia de JWT (HTTP 401).
  - Validación de roles mediante Guardias (HTTP 403).
  - Aislamiento de datos según `carreraId` o `facultadId` para roles jerárquicos (ej. Jefe de Carrera).

## 3. Matriz de Trazabilidad de Requisitos vs. Pruebas

| Requisito / Ticket | Tipo de Prueba | Estado QA | Ubicación de Prueba |
| :--- | :--- | :--- | :--- |
| **TK-16 (Migración de Estudiantes)** | Integración (E2E) | ✅ Completado | `test/tk16-auditoria-estudiantes.e2e-spec.ts` |
| **TK-20 (Login y Autenticación)** | Integración (E2E) | 🚧 En Progreso | `test/app.e2e-spec.ts` |
| **TK-12 (Seguridad y Aislamiento)** | Seguridad | Pendiente | `test/tk12-seguridad.e2e-spec.ts` (Por crear) |

## 4. Entornos de Prueba
1. **Local (Desarrollo):** 
   - Base de Datos: PostgreSQL (Vía Docker Compose `npm run db:up`).
   - Semillas (Seeds): Carga automática de usuarios y roles mediante `npm run db:seed`.
2. **Pipeline CI/CD (Futuro):**
   - Base de Datos efímera para pruebas E2E automáticas en cada Pull Request.
