# Plan de Pruebas: Importador Masivo de Estudiantes (Módulo 3)

Este documento contiene los casos de prueba (QA) diseñados para validar el correcto funcionamiento del importador masivo de estudiantes a través de Excel (`POST /api/estudiantes/importar`).

## Entorno de Pruebas
- **Ruta a probar:** `POST http://localhost:3000/api/estudiantes/importar`
- **Roles autorizados:** `SECRETARIADO`, `COORDINACION`, `SUPER_ADMIN`.
- **Formato esperado:** Archivo `.xlsx` (Excel).

---

## 🟢 1. Caso de Prueba de Flujo Feliz (Happy Path)

**Objetivo:** Verificar que el sistema importa correctamente un Excel bien estructurado.
- **Precondiciones:** Crear un Excel con al menos 3 alumnos nuevos que no existan en la BD. Columnas: `Carnet`, `CI`, `Nombre`, `Correo Institucional`, `Correo Personal`, `ID Plan`.
- **Acción:**
  1. Iniciar sesión con una cuenta de `SECRETARIADO`.
  2. Subir el Excel.
- **Resultado Esperado:** 
  - El servidor responde con `HTTP 200`.
  - El JSON devuelve: `{ "total": 3, "creados": 3, "actualizados": 0, "errores": [] }`.
  - Revisar la BD o el listado de alumnos para confirmar que aparecen.

---

## 🟡 2. Caso de Prueba: Control de Duplicados (Upsert)

**Objetivo:** Verificar que subir el mismo alumno dos veces no quiebre la base de datos y que actualice su información en su lugar.
- **Precondiciones:** Usar el mismo Excel del Caso 1, pero cambiar el correo institucional de uno de los alumnos.
- **Acción:**
  1. Subir el Excel modificado al sistema.
- **Resultado Esperado:**
  - El sistema **no debe devolver ningún error de base de datos o colisión.**
  - El JSON devuelve: `{ "total": 3, "creados": 0, "actualizados": 3, "errores": [] }`.
  - Al revisar el estudiante modificado, su correo debe estar actualizado en la BD.

---

## 🔴 3. Caso de Prueba: Errores de Validación Parcial

**Objetivo:** Verificar que el sistema no aborta todo el proceso por culpa de una sola fila mala, sino que ignora la fila corrupta y continúa con las demás.
- **Precondiciones:** Crear un Excel con 5 filas.
  - 3 filas perfectamente válidas.
  - Fila 4: Sin carnet estudiantil (vacío).
  - Fila 5: Correo institucional en formato inválido (ej: `esto_no_es_un_correo`).
- **Acción:**
  1. Subir el archivo.
- **Resultado Esperado:**
  - El JSON devuelve: `{ "total": 5, "creados/actualizados": 3, "errores": [2] }`.
  - En el arreglo de `errores` debe especificar claramente: *"Fila 4: Carnet inválido"* y *"Fila 5: Formato de correo incorrecto"*.
  - Los 3 alumnos buenos sí deben guardarse en la BD.

---

## 🛡️ 4. Caso de Prueba: Seguridad y Permisos (RBAC)

**Objetivo:** Garantizar que roles no autorizados no puedan inyectar estudiantes.
- **Precondiciones:** Obtener un token de sesión de una cuenta de `VICERRECTORADO` o `JEFE_CARRERA` (dependiendo de la configuración estricta).
- **Acción:**
  1. Intentar hacer la misma petición POST para subir un Excel usando el token del Vicerrectorado.
- **Resultado Esperado:**
  - El servidor responde con un error `HTTP 403 Forbidden`.
  - Ningún alumno se inserta en la base de datos.

---

## ⚡ 5. Caso de Prueba: Resiliencia del Servidor (Archivos Grandes / Basura)

**Objetivo:** Asegurar que el sistema no colapse bajo situaciones de estrés o archivos inválidos.
- **Escenario A (Archivo incorrecto):** Subir un archivo `.pdf`, `.jpg` o un `.xlsx` completamente vacío y sin columnas.
  - **Esperado:** El servidor lo rechaza inmediatamente con `HTTP 400 Bad Request` indicando "Formato inválido o archivo vacío".
- **Escenario B (Archivo gigante):** Subir un `.xlsx` con 2,000 registros (si es posible probarlo).
  - **Esperado:** El servidor no se debe colgar ni agotar su memoria. La barra de carga terminará después de un par de segundos gracias a la técnica de *batching*.
