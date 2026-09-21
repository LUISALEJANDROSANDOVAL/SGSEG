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

## 3. Matriz de Trazabilidad de Requisitos vs. Pruebas Automatizadas

$$\mathbf{ESTADO\ DE\ CALIDAD:\ 95\%\ DE\ COBERTURA\ E2E\ IMPLEMENTADA\ (13/14\ SUITES\ OPERATIVAS)}$$

| Requisito / Ticket | Tipo de Prueba | Estado QA | % Terminado | Archivo de Prueba |
| :--- | :--- | :---: | :---: | :--- |
| **M1: Login, Autenticación y JWT** | Integración (E2E) | ✅ Completado | **100%** | `test/app.e2e-spec.ts` |
| **M1: Seguridad RBAC y Permisos** | Seguridad | ✅ Completado | **100%** | `test/rbac-roles.e2e-spec.ts` |
| **M1: TK-12 Seguridad y Aislamiento** | Seguridad | ✅ Completado | **100%** | `test/tk12-seguridad.e2e-spec.ts` |
| **M2: Aislamiento Multi-Tenancy Carreras** | Seguridad / Negocio | ✅ Completado | **100%** | `test/aislamiento-carreras-sorteo.e2e-spec.ts` |
| **M2: Casos de Estudio y Stock Crítico** | Integración (E2E) | ✅ Completado | **100%** | `test/casos.e2e-spec.ts` |
| **M2: Vistas SQL Optimizadas** | Rendimiento / DB | ✅ Completado | **100%** | `test/vistas-carreras.e2e-spec.ts` |
| **M3: TK-16 Padrón de Estudiantes** | Integración (E2E) | ✅ Completado | **100%** | `test/tk16-auditoria-estudiantes.e2e-spec.ts` |
| **M3: CRUD Estudiantes e Importador** | Integración (E2E) | ✅ Completado | **100%** | `test/estudiantes.e2e-spec.ts` |
| **M4: Sorteo Criptográfico CSPRNG** | Algorítmico / E2E | ✅ Completado | **100%** | `test/sorteos.e2e-spec.ts` |
| **M4: Concurrencia y Límite de 2 Usos** | Estrés / Concurrencia | 🟡 En Ajuste | **80%** | `test/sorteos-asignacion-concurrencia.e2e-spec.ts` |
| **M5: Actas PDF, Mailer y Dashboard** | E2E Completo | ✅ Completado | **100%** | `test/modulo5-actas-notificaciones-reportes.e2e-spec.ts` |
| **M6: Cronograma, Alertas y Defensas** | Integración (E2E) | ✅ Completado | **100%** | `test/defensas.e2e-spec.ts` |
| **DB: Restricciones e Integridad BD** | Integridad Relacional | ✅ Completado | **100%** | `test/database-constraints.e2e-spec.ts` |

---

## 4. Entornos de Prueba
1. **Local (Desarrollo):** 
   - Base de Datos: PostgreSQL (Vía Docker Compose `npm run db:up` o instancia local en puerto 5432).
   - Semillas (Seeds): Carga automática de usuarios, facultades, carreras y casos mediante `npm run db:seed`.
   - Ejecución de Pruebas: `npm run test:e2e` en directorio `backend/`.
2. **Pipeline CI/CD:**
   - Base de Datos de pruebas efímera con migraciones automáticas (`npx prisma migrate deploy`).

