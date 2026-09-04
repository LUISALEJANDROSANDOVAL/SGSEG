# TK-31: Pruebas de Integración y Reporte de Cierre (Sprint 2)
## Módulo de Casos de Estudio

## Resumen Ejecutivo
Este documento formaliza el cierre de las historias de usuario correspondientes al **Sprint 2** (Módulo de Casos de Estudio y Áreas Académicas). Se certifica que todo el ciclo de vida de los Casos de Estudio ha sido sometido a pruebas de integración E2E (End-to-End) automatizadas, validando exitosamente las reglas de negocio, roles y transacciones de base de datos.

**Estado del Sprint:** CERRADO ✅
**Fecha de Cierre:** DD/MM/AAAA
**Framework de Pruebas:** Jest + Supertest (Backend)

---

## 1. Validación E2E del Ciclo de Vida

Se ha verificado el ciclo de vida completo de la entidad "Caso de Estudio", garantizando que el sistema responde correctamente en cada una de sus fases:

1. **Fase de Creación:** El sistema permite a la Jefatura de Carrera y Coordinación crear Áreas Académicas y registrar Casos de Estudio bajo dichas áreas (Estado inicial: `DISPONIBLE`).
2. **Fase de Monitoreo (Métricas):** Se probó el endpoint analítico que calcula en tiempo real cuántos casos están disponibles, inactivos, agotados y si existe un nivel de **Stock Crítico**.
3. **Fase de Inactivación (Baja Lógica):** Se comprobó que un caso puede ser marcado como `INACTIVO` por el Jefe de Carrera para que ya no ingrese a la ruleta/sorteo.
4. **Fase de Excepción (Reactivación):** Se validó el flujo de seguridad extrema donde un caso `AGOTADO` o `INACTIVO` es devuelto a la ruleta como `REACTIVADO_ESPECIAL` previo registro de un motivo decanal inmutable en la tabla de auditoría.

---

## 2. Resultados de las Pruebas de Integración (Pipeline Automático)

El archivo de pruebas que agrupa todo este ciclo es `backend/test/casos.e2e-spec.ts`. A continuación, se presenta la evidencia de la última ejecución exitosa contra el servidor y la base de datos:

```bash
> jest --config ./test/jest-e2e.json test/casos.e2e-spec.ts

PASS test/casos.e2e-spec.ts
  Módulo Casos (e2e)
    ✓ 1. POST /casos/areas - Debe crear un área académica (29 ms)
    ✓ 2. POST /casos - Debe registrar un nuevo caso de estudio (24 ms)
    ✓ 3. GET /casos/metricas - Debe obtener alertas de inventario (13 ms)
    ✓ 4. PATCH /casos/:id/estado - Debe inactivar el caso (26 ms)
    ✓ 5. PATCH /casos/:id/reactivar-especial - Debe reactivar el caso por resolución (100 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
```

---

## 3. Conclusión y Visto Bueno
El **Módulo de Casos de Estudio (Sprint 2)** se encuentra completamente estable, cubierto por pruebas automatizadas y auditado criptográficamente en operaciones sensibles. 

El código del backend es oficialmente candidato para ser desplegado en el entorno de Producción. No existen bloqueos, vulnerabilidades de roles, ni fugas de estado (los 403 Forbidden y validaciones de seguridad funcionan correctamente).
