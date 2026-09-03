# Documento de Verificación: Restricciones de Unicidad y Claves Foráneas

* **Módulo:** Base de Datos / Prisma ORM / PostgreSQL
* **Responsables:** Jose Carlos Rojas / Jorge Ayala
* **Estado:** Completado (100% - Restricciones DDL validadas y verificadas mediante pruebas automatizadas)
* **Fecha de Verificación:** 2026-09-02

---

## 1. Resumen Ejecutivo

El presente documento certifica la verificación automatizada de las restricciones de integridad relacional en la base de datos PostgreSQL de la plataforma SGSEG. Las pruebas de inserción y eliminación validaron que el motor de base de datos rechaza de manera determinista registros duplicados y bloquea la eliminación de entidades con registros dependientes activos (`onDelete: Restrict`).

---

## 2. Matriz de Restricciones DDL Validadas

| # | Entidad / Tabla | Restricción DDL / Índice PostgreSQL | Tipo | Criterio de Verificación |
|---|---|---|---|---|
| 1 | `carrera` | `carrera_id_facultad_nombre_key` (`id_facultad`, `nombre`) | UNIQUE (Compuesta) | Rechaza dos carreras con el mismo nombre en una misma facultad (`P2002`). Permite el mismo nombre en facultades distintas. |
| 2 | `plan_estudio` | `plan_estudio_id_carrera_nombre_key` (`id_carrera`, `nombre`) | UNIQUE (Compuesta) | Rechaza dos planes de estudio con el mismo nombre en la misma carrera (`P2002`). |
| 3 | `area_academica` | `area_academica_id_carrera_nombre_key` (`id_carrera`, `nombre`) | UNIQUE (Compuesta) | Rechaza dos áreas académicas con el mismo nombre en la misma carrera (`P2002`). |
| 4 | `estudiante` | `estudiante_carnet_estudiantil_key` (`carnet_estudiantil`) | UNIQUE (Simple) | Rechaza la inserción de un estudiante si su `carnet_estudiantil` ya se encuentra registrado (`P2002`). |
| 5 | `facultad` $\leftarrow$ `carrera` | `carrera_id_facultad_fkey` (`ON DELETE RESTRICT`) | FOREIGN KEY | Bloquea la eliminación de una facultad si existen carreras vinculadas a ella (`P2003`). |
| 6 | `carrera` $\leftarrow$ `plan_estudio` | `plan_estudio_id_carrera_fkey` (`ON DELETE RESTRICT`) | FOREIGN KEY | Bloquea la eliminación de una carrera si existen planes de estudio o áreas académicas vinculadas a ella (`P2003`). |

---

## 3. Códigos de Error Capturados

* **`P2002` (Unique constraint failed):** Emitido por Prisma Client cuando el motor PostgreSQL genera el código SQLSTATE `23505` (`unique_violation`).
* **`P2003` (Foreign key constraint failed):** Emitido por Prisma Client cuando el motor PostgreSQL genera el código SQLSTATE `23503` (`foreign_key_violation`), impidiendo la ruptura de integridad referencial.

---

## 4. Pruebas Automatizadas Implementadas

Se desarrollaron dos mecanismos complementarios de verificación:

### A. Script Independiente de Validación
* **Ubicación:** `backend/prisma/validate-constraints.ts`
* **Ejecución:**
  ```bash
  npm run db:test:constraints
  ```
* **Características:**
  - Ejecución directa contra la base de datos PostgreSQL activa.
  - Aislamiento mediante prefijos de tiempo (`TEST_VAL_<timestamp>`).
  - Limpieza automática (`cleanUp`) de datos de prueba en bloque `finally`.
  - Reporte tabular en consola con código de salida `0` si todo es satisfactorio.

### B. Suite de Pruebas E2E en Jest
* **Ubicación:** `backend/test/database-constraints.e2e-spec.ts`
* **Ejecución:**
  ```bash
  npm run test:e2e
  ```
* **Características:**
  - Integrada a la infraestructura de testing continuo del backend.
  - Aserciones con `expect(...).rejects.toThrow(...)` comprobando tipado de `PrismaClientKnownRequestError` y persistencia de registros ante intentos de eliminación bloqueados.

---

## 5. Evidencia de Ejecución

### Resultados del Script de Validación (`npm run db:test:constraints`):
```text
================================================================================
SGSEG - VERIFICACIÓN AUTOMATIZADA DE RESTRICCIONES DDL (SQL / PRISMA)
Responsables: Jose Carlos Rojas / Jorge Ayala
Base de datos: postgresql://sgseg:***@localhost:5437/sgseg?schema=public
================================================================================

[1/6] Probando unicidad compuesta (idFacultad, nombre) en Carrera...
[2/6] Probando unicidad compuesta (idCarrera, nombre) en PlanEstudio...
[3/6] Probando unicidad compuesta (idCarrera, nombre) en AreaAcademica...
[4/6] Probando unicidad simple en carnet_estudiantil en Estudiante...
[5/6] Probando restricción onDelete: Restrict en Facultad con Carreras...
[6/6] Probando restricción onDelete: Restrict en Carrera con PlanEstudio...

Limpiando registros temporales de prueba...

================================================================================
TABLA DE RESULTADOS DE VERIFICACIÓN
================================================================================
┌─────────┬───┬────────────────────────────────────────────────────────────────┬───────────────┬───────────┬───────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ (index) │ # │ Prueba                                                         │ Tipo          │ Resultado │ Código Prisma │ Detalle                                                                                                  │
├─────────┼───┼────────────────────────────────────────────────────────────────┼───────────────┼───────────┼───────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 0       │ 1 │ 'Unicidad (idFacultad, nombre) en Carrera'                     │ 'UNICIDAD'    │ 'PASÓ'    │ 'P2002'       │ 'Rechazó duplicado con código P2002 (id_facultad, nombre). Permitió mismo nombre en otra facultad.'      │
│ 1       │ 2 │ 'Unicidad (idCarrera, nombre) en PlanEstudio'                  │ 'UNICIDAD'    │ 'PASÓ'    │ 'P2002'       │ 'Rechazó duplicado con código P2002 (id_carrera, nombre).'                                               │
│ 2       │ 3 │ 'Unicidad (idCarrera, nombre) en AreaAcademica'                │ 'UNICIDAD'    │ 'PASÓ'    │ 'P2002'       │ 'Rechazó duplicado con código P2002 (id_carrera, nombre).'                                               │
│ 3       │ 4 │ 'Unicidad carnet_estudiantil en Estudiante'                    │ 'UNICIDAD'    │ 'PASÓ'    │ 'P2002'       │ 'Rechazó duplicado con código P2002 (carnet_estudiantil).'                                               │
│ 4       │ 5 │ 'onDelete: Restrict en eliminación de Facultad con Carreras'   │ 'FOREIGN_KEY' │ 'PASÓ'    │ 'P2003'       │ 'Bloqueó eliminación con código P2003 (Foreign key constraint onDelete: Restrict). Registro preservado.' │
│ 5       │ 6 │ 'onDelete: Restrict en eliminación de Carrera con PlanEstudio' │ 'FOREIGN_KEY' │ 'PASÓ'    │ 'P2003'       │ 'Bloqueó eliminación con código P2003 (Foreign key constraint onDelete: Restrict). Registro preservado.' │
└─────────┴───┴────────────────────────────────────────────────────────────────┴───────────────┴───────────┴───────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
✓ TODAS LAS PRUEBAS DE RESTRICCIONES PASARON EXITOSAMENTE (6/6).
```

### Resultados de la Suite Jest E2E (`npm run test:e2e`):
```text
PASS test/database-constraints.e2e-spec.ts
PASS test/app.e2e-spec.ts

Test Suites: 2 passed, 2 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        3.789 s
Ran all test suites.
```

---

## 6. Conclusión y Criterio de Aceptación

* **Cumplimiento del Criterio:** Se ha demostrado mediante pruebas automatizadas reproducibles que el motor de base de datos PostgreSQL rechaza cualquier intento de duplicidad en `(idFacultad, nombre)`, `(idCarrera, nombre)` y `carnet_estudiantil`. De igual forma, se confirmó que las operaciones de eliminación sobre entidades maestras (`Facultad`, `Carrera`) con registros relacionados son bloqueadas (`onDelete: Restrict`), preservando la integridad referencial de los datos académicos.
* **Aprobación Técnica:** El requerimiento pasa de estado Parcial (70%) a **Completado (100%)**.
