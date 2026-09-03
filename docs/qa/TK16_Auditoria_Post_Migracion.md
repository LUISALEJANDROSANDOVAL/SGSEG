# Reporte de Validación QA: TK-16 (Auditoría Post-Migración)

## 1. Resumen Ejecutivo
**Responsable:** Jose Carlos Rojas (QA & Documentación)
**Fecha de Ejecución:** 02/09/2026
**Módulo:** Estudiantes (`/estudiantes/bulk-upsert`)
**Objetivo:** Auditar la funcionalidad de carga masiva de datos desde archivos Excel hacia la base de datos (tabla `estudiante`), contemplando casos borde y asegurando la integridad referencial y de formatos.

---

## 2. Metodología de Pruebas
Dado que la arquitectura de la aplicación espera que la transformación de archivo Excel (`.xlsx`) a formato JSON sea procesada por el frontend, las pruebas E2E (End-to-End) en el backend han sido diseñadas simulando este comportamiento:
1. Se generaron de manera dinámica en memoria archivos Excel (usando la librería `exceljs`).
2. Se introdujeron deliberadamente errores, datos vacíos y duplicados.
3. Se parsearon simulando la labor del frontend.
4. Se envió la información al endpoint transaccional `/estudiantes/bulk-upsert`.
5. Se consultó directamente la base de datos `Prisma` para comprobar la integridad de las inserciones.

---

## 3. Escenarios Ejecutados y Resultados

### 3.1. Caso Borde: Archivo Totalmente Vacío
- **Descripción:** Se simuló el envío de un archivo `.xlsx` que únicamente contiene la cabecera, sin ninguna fila de datos.
- **Comportamiento Esperado:** El sistema no debe arrojar error 500, debe procesar la solicitud e indicar 0 registros creados.
- **Resultado de la BD:** Registros nuevos en la base de datos = 0.
- **Estado:** ✅ **PASS**

### 3.2. Caso de Éxito: Archivo con Datos Válidos y Completos
- **Descripción:** Archivo Excel con 2 estudiantes perfectamente formateados.
- **Comportamiento Esperado:** Inserción exitosa de ambos registros. El conteo de la BD debe incrementar exactamente en 2.
- **Resultado de la BD:** Los registros insertados son verificables mediante el recuento directo a la tabla `Estudiante`.
- **Estado:** ✅ **PASS**

### 3.3. Caso Borde: Carnets Duplicados en el Mismo Archivo
- **Descripción:** El Excel contiene dos filas para el mismo estudiante (mismo Carnet Estudiantil e Identidad).
- **Comportamiento Esperado:** El endpoint de `bulk-upsert` debe manejar la colisión elegantemente, insertando 1 registro y actualizando el otro, previniendo el fallo total de la transacción.
- **Resultado de la BD:** Evita el error de constraint `Unique` en la base de datos.
- **Estado:** ✅ **PASS**

### 3.4. Caso Borde: Formatos Incorrectos y Datos Faltantes
- **Descripción:** Fila sin Nombre Completo y con un correo inválido (`bad-email`).
- **Comportamiento Esperado:** El sistema debe identificar el error de validación e incluirlo en la lista de `errores` del resultado de la petición sin romper toda la migración.
- **Resultado de la BD:** Este registro particular no se guarda.
- **Estado:** ✅ **PASS**

---

## 4. Verificación de Integridad en Base de Datos
Las aserciones del script automatizado (`backend/test/tk16-auditoria-estudiantes.e2e-spec.ts`) certifican matemáticamente que la cantidad de registros validados por el DTO y devueltos como `creados` coinciden exactamente con la operación matemática:
```javascript
Conteo_Final = Conteo_Inicial + Registros_Validos_Insertados
```
Esto certifica que no hay fuga de datos ni inserciones fantasma.

---

## 5. Conclusión y Criterio de Aceptación
Los scripts de prueba y validación certifican que el 100% de los datos migrados de prueba conservan integridad y formato bajo los escenarios estipulados. Las fallas introducidas son detectadas y manejadas por el sistema sin afectar la estabilidad general.

**Estado Final del Ticket TK-16:** ✅ Aprobado / QA Completado.
