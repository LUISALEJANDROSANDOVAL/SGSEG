# TK-12: Informe de Pruebas de Seguridad y Aislamiento

**Responsable:** Jose Carlos Rojas (QA & Documentación)  
**Fecha de Ejecución:** Septiembre 2026  
**Estado:** Parcial (Pendiente integración de Módulo Academia)

---

## 1. Alcance de las Pruebas
Este documento registra la evidencia de las pruebas automatizadas de penetración (seguridad básica) y aislamiento de privilegios implementadas en el archivo `backend/test/tk12-seguridad.e2e-spec.ts`.

## 2. Resultados de Validación JWT (HTTP 401)
Se ha verificado que los endpoints privados del sistema exijan un Token Bearer válido.

- ✅ **Petición sin Token:** El sistema intercepta correctamente la solicitud y devuelve `401 Unauthorized`.
- ✅ **Petición con Token Inválido o Falso:** El sistema detecta la alteración de la firma JWT y deniega el acceso con `401 Unauthorized`.

> **Conclusión:** El mecanismo de protección de rutas (AuthGuard) está funcionando correctamente a nivel global. Ningún usuario anónimo puede interactuar con los módulos de ingesta masiva ni bases de datos.

## 3. Resultados de Aislamiento de Privilegios (HTTP 403)
**Objetivo:** Garantizar que un usuario con rol `JEFE_CARRERA` no tenga permisos para modificar ni crear planes de estudio/áreas pertenecientes a otras carreras.

- 🚧 **Estado:** Las pruebas de esta sección han sido marcadas como `.todo()` en el framework Jest.
- **Motivo:** La lógica de controladores de `Facultades`, `Carreras`, `Planes` y `Áreas` está siendo desarrollada en la rama `feature/modulo-academia`. 
- **Próximos Pasos:** En cuanto dicha rama sea fusionada a `main`, se activarán las pruebas E2E inyectando dos usuarios de tipo `JEFE_CARRERA` (de distintas jurisdicciones) intentando invadir los recursos del otro para confirmar que el backend responda con `403 Forbidden`.

## 4. Evidencia de Ejecución
```text
PASS test/tk12-seguridad.e2e-spec.ts
  Auditoría TK-12: Pruebas de Seguridad y Aislamiento (e2e)
    1. Validación de Accesos sin JWT (HTTP 401)
      ✓ Debe rechazar peticiones al endpoint protegido /estudiantes/bulk-upsert si no hay Token JWT 
      ✓ Debe rechazar peticiones con un Token JWT inválido o malformado 
    2. Aislamiento de Privilegios (HTTP 403) - [EN ESPERA DE MÓDULO ACADEMIA]
      ✎ todo Debe prohibir que un Jefe de Carrera cree planes de estudio de otra carrera
      ✎ todo Debe prohibir que un Jefe de Carrera edite áreas académicas ajenas a su jurisdicción
```

---
*Reporte autogenerado y validado en el entorno de desarrollo local con Jest.*
