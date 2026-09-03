# Sistema de Gestión de Sorteos - Examen de Grado (UPTECSA)

## 1. Mapeo de Sorteos y Plazos por Carrera

El sistema debe gestionar los sorteos de **Área del Conocimiento** y **Caso de Estudio** basándose en la **Facultad** a la que pertenece la carrera del postulante.

> **Importante:** El estudiante no tiene interacción ni credenciales de acceso; existe únicamente como un dato o registro en el sistema.

---

### A. Facultad de Ciencias y Tecnología (FCT) y Carrera de Psicología

* **Sorteo de Área y Caso:** Se realiza de manera anticipada (entre 5 y 14 días hábiles antes de la fecha de defensa).
* **Plazos de Preparación Posterior al Sorteo:**
  * **Sistemas, Electrónica y Sistemas, Ingeniería Eléctrica, Redes y Telecomunicaciones:** 7 días calendario.
  * **Industrial y Comercial:** 5 días calendario.
  * **Mecánica:** 14 días calendario.
  * **Psicología (FCJS):** 10 días calendario.
* **Defensa:** El estudiante prepara la propuesta correspondiente en el plazo asignado y expone ante el tribunal (interno o externo) el día programado.

---

### B. Facultad de Ciencias Empresariales (FCE) y Ciencias Jurídicas y Sociales (FCJS)

* **Sorteo de Área:** Se realiza **5 días antes** de la fecha de defensa.
* **Sorteo/Asignación del Caso de Estudio:** Se realiza el **mismo día de la defensa** en secretaría de la facultad.
* **Plazos de Resolución el día de la Defensa:**
  * **Defensas Internas:** **1 hora** para desarrollar y preparar el caso.
  * **Defensas Externas:** **1 hora y media (1.5 h)** para desarrollar y preparar el caso.
* **Carreras comprendidas:**
  * Derecho
  * Relaciones Internacionales
  * Administración General
  * Comunicación Estratégica
  * Ingeniería Comercial
  * Marketing y Publicidad
  * Ingeniería Financiera
  * Contaduría Pública
  * Comercio Internacional
  * Turismo

---

## 2. Flujo de Trabajo por Actor

```
[1. COORDINACIÓN] ──> Registra Postulante y programa fecha de defensa
        │
[2. JEFE DE CARRERA / SECRETARIADO] ──> Suben Casos de Estudio por Área (Visibilidad filtrada)
        │
[3. JEFE DE CARRERA / SECRETARIADO] ──> Ejecuta el Sorteo en el Sistema (Algorítmico)
        │
[4. SECRETARIADO] ──> Imprime Acta de Sorteo y entrega el Caso
        │
[5. SECRETARIADO] ──> Registra la Nota Final emitida por el Tribunal
        │
[6. VICERRECTORADO / SUPER ADMIN] ──> Supervisan métricas y reportes globales
```

---

## 3. Funcionalidades y Dashboards por Actor

### 👑 1. Super Admin
* **Alcance:** Control total y técnico de la plataforma.
* **Funciones:**
  * Gestión de usuarios y asignación de roles.
  * Configuración de la estructura académica (Facultades, Carreras, Áreas del Conocimiento).
  * Parametrización de reglas de negocio (tiempos reglamentarios de resolución de casos por carrera).
  * Logs de auditoría (registro de cada evento de sorteo, modificación o asignación con sello de tiempo).
* **Dashboard:** Estado del servidor, usuarios activos, métricas de actividad global y registro de eventos de seguridad/auditoría.

---

### 👁️ 2. Vicerrectorado
* **Alcance:** Vista global e institucional con acceso en modo solo lectura y generación de reportes.
* **Funciones:**
  * Monitoreo general de todos los procesos de examen de grado en la universidad.
  * Verificación del cumplimiento de los tiempos reglamentarios entre sorteos y defensas.
  * Descarga de reportes consolidados por gestión académica, facultad o carrera.
* **Dashboard:**
  * **KPIs Institucionales:** Total de defensas programadas, realizadas, aprobadas y reprobadas.
  * **Distribución por Facultad:** Gráficos comparativos del volumen de exámenes de grado en FCT, FCE y FCJS.
  * **Control de Calificaciones:** Promedios generales de notas por carrera.

---

### 📅 3. Coordinación
* **Alcance:** Gestión operativa global de estudiantes y programación del calendario.
* **Funciones:**
  * Registrar o importar masivamente la lista de postulantes (Nombre, Registro, Carrera, Semestre, Tipo de defensa: Interna/Externa).
  * Asignar y programar las fechas de sorteo y fechas finales de defensa para cada estudiante.
  * Monitorear el estado del flujo de cada postulante en tiempo real.
* **Dashboard:**
  * **Calendario General de Defensas:** Vista de cronograma con filtros por facultad y carrera.
  * **Embudo de Estado de Postulantes:** Programado ➔ Área Sorteada ➔ Caso Asignado ➔ Defendido ➔ Calificado.
  * **Alertas Operativas:** Lista de postulantes con defensas próximas que aún no han realizado su sorteo reglamentario.

---

### 🎓 4. Jefe de Carrera
* **Alcance:** Gestión académica exclusiva de su carrera.
  > **Restricción estricta:** No puede visualizar casos, áreas ni postulantes de carreras ajenas.
* **Funciones:**
  * Registrar y administrar el banco de Casos de Estudio organizados por las Áreas del Conocimiento de su plan de estudios.
  * Ejecutar el Sorteo de Áreas y/o Casos en presencia del estudiante y el testigo académico.
  * Generar e imprimir el Acta de Sorteo para Defensa de Grado para las firmas físicas correspondientes.
* **Dashboard:**
  * **Mis Postulantes:** Lista de estudiantes de su carrera con fechas asignadas de sorteo/defensa.
  * **Módulo de Casos de Estudio:** Repositorio de casos por área (permite subir enunciados, editar o inactivar casos).
  * **Módulo de Sorteo Interactivo:** Botón de sorteo aleatorio en pantalla que ejecuta la asignación algorítmica y genera de inmediato el PDF del Acta de Sorteo.

---

### 📝 5. Secretariado
* **Alcance:** Apoyo operativo, documentación formal, entregas físicas y registro de notas.
* **Funciones:**
  * Apoyar en el registro/carga de Casos de Estudio asignados por la Jefatura de Carrera.
  * Ejecutar el sorteo o asignación inmediata del Caso el día de la defensa (para carreras de FCE/FCJS).
  * Imprimir el Caso de Estudio sorteado y el Acta de Sorteo para su entrega al postulante.
  * Asignar y registrar la Nota Final del Examen de Grado asignada por el tribunal examinador tras concluir la defensa.
* **Dashboard:**
  * **Sorteos del Día:** Lista de estudiantes programados para sorteo o recepción de caso en la jornada actual.
  * **Temporizador de Caso (FCE/FCJS):** Control de la hora exacta de entrega del caso y cálculo del tiempo límite (1 h o 1.5 h) antes de la exposición.
  * **Módulo de Calificaciones:** Formulario rápido para seleccionar al postulante, ingresar la nota numérica y adjuntar el acta final.

---

## 4. Documentos Impresos Generados por el Sistema

1. **Acta de Sorteo de Defensas (Interna / Externa):**
   * Contiene: número de acta, fecha/hora, facultad, carrera, datos del postulante, área sorteada, fecha de defensa y campos para firmas (Jefe de Carrera, Secretario/Testigo, Estudiante).
2. **Documento del Caso de Estudio:**
   * Contiene: código de área, título del caso, planteamiento/desarrollo y preguntas del caso para ser entregado al postulante.
