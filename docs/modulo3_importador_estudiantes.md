# Módulo 3: Gestión de Estudiantes y Padrón (Importador Masivo)

Este documento detalla la implementación, arquitectura y toma de decisiones técnicas del requerimiento **Módulo 3**, enfocado en la importación masiva de estudiantes y la optimización de la gestión de sus datos de contacto.

---

## 1. ¿Qué se solicitó?
De acuerdo a las especificaciones del sistema, el **Módulo 3** requería dos tareas principales:
1. **[Prioridad Baja] Gestión de datos de contacto:** Diferenciar en la base de datos el correo institucional del correo personal del estudiante.
2. **[Prioridad Media] Importación masiva vía Excel / CSV:** Crear un sistema para leer un archivo de planillas (formato Génesis/Excel), validar su estructura y guardar los registros por lotes (batch) controlando duplicados.

---

## 2. ¿Por qué lo hicimos? (Justificación de Negocio)
- **Optimización de Secretaría:** El proceso manual de registrar cientos de alumnos uno por uno al inicio de cada semestre genera un cuello de botella administrativo. El importador masivo reduce una tarea de horas a un proceso de 2 segundos.
- **Correos Diferenciados:** La universidad necesita usar el `correoInstitucional` de forma obligatoria para emitir notificaciones oficiales (como sorteos de casos), pero requiere el `correoPersonal` como canal de respaldo en caso de pérdida de accesos.
- **Control de Duplicados (Upsert):** Si la secretaria vuelve a subir un Excel corregido, el sistema no debe fallar ni duplicar estudiantes; debe identificar a los estudiantes existentes y actualizar su información sin alterar su integridad histórica.

---

## 3. ¿Cómo lo hicimos? (Implementación Técnica)

### 3.1. Cambios en la Base de Datos (Prisma)
Se modificó el archivo `schema.prisma` en el modelo `Estudiante`:
- La columna genérica `correo` fue renombrada a `correoInstitucional` y se mantuvo como obligatoria (`@db.VarChar(200)`).
- Se añadió la columna `correoPersonal` como opcional (`String?`).
- **Consecuencia:** Se re-sincronizó la base de datos y se actualizaron todos los *scripts de seed* y DTOs para que apunten al nuevo formato, garantizando un entorno de pruebas consistente.

### 3.2. Endpoint de Importación
Se expuso la ruta `POST /api/estudiantes/importar` en el controlador `EstudiantesController`.
- **Integración con RBAC (Módulo 2):** Para garantizar la seguridad del sistema y alinear los módulos, la ruta fue protegida usando el decorador `@Roles('COORDINACION', 'SECRETARIADO', 'SUPER_ADMIN')`. Ningún otro rol (ej. Vicerrectorado) puede inyectar estudiantes.
- **Recepción de Archivos:** Se utilizó `@UseInterceptors(FileInterceptor('file'))` de NestJS (Multer) para recibir de manera segura el archivo en formato `multipart/form-data`.

### 3.3. Motor de Procesamiento y Validación (ExcelJS)
En la capa de servicio (`EstudiantesService`), se implementó la función `importarEstudiantesDesdeArchivo`.
- **Lectura Optimizada:** Se utilizó la librería `exceljs` para leer el archivo directamente desde el `buffer` de memoria. Esto previene que archivos muy pesados colapsen la RAM del servidor.
- **Mapeo Flexible de Columnas:** El algoritmo escanea la primera fila del Excel buscando palabras clave (ej. "CI", "Carnet", "Nombre Completo", "Correo Institucional", "ID Plan"). Esto permite tolerar ligeras variaciones en la plantilla que use la secretaria, volviendo al sistema muy robusto.
- **Normalización Automática:** Los datos extraídos del Excel se empaquetan en el formato `RawEstudianteInputDto`, el cual pasa automáticamente por la capa de normalización (limpieza de espacios, mayúsculas, generación de correos por defecto).

### 3.4. Inserción Transaccional por Lotes (Batch Upsert)
Una vez extraídos y mapeados los datos del Excel:
1. Los registros se envían al motor centralizado `bulkUpsertEstudiantes`.
2. El sistema divide los registros en **Lotes de 50 (Chunks)**.
3. Se abre una **Transacción Segura de Prisma** por cada lote.
4. Se ejecuta una instrucción `upsert` basada en el `carnetEstudiantil` (Llave Única). 
   - **Insert:** Si el alumno no existe, se crea.
   - **Update:** Si el alumno existe, se actualizan sus datos personales (ej. correos).
5. **Generación de Reporte:** Al finalizar, el sistema devuelve un objeto JSON estructurado que indica: `total`, `creados`, `actualizados`, `errores (con el número de fila)` y el tiempo de procesamiento, brindándole a la secretaria retroalimentación clara en caso de haber filas corruptas en su Excel.
