# Guía de Acceso, Actores y Credenciales — SGSEG UPTECSA

Esta guía detalla las credenciales oficiales de prueba, los permisos asignados por Rol (RBAC), y el paso a paso para acceder y operar el sistema como cada uno de los actores institucionales.

---

## 🔑 1. Tabla de Credenciales Oficiales de Acceso

Todos los usuarios preconfigurados se inicializan con la contraseña estándar de desarrollo: **`Admin123!`**.

| Actor / Rol Institucional | Nombre del Usuario | Correo Institucional (Login) | Contraseña | Alcance / Carrera Asignada |
| :--- | :--- | :--- | :--- | :--- |
| **Jefe de Carrera (Sistemas)** | Ing. Carlos Mendoza | `jefe.sistemas@uni.edu.bo` | `Admin123!` | Exclusivo **Ingeniería de Sistemas** (FCT) |
| **Jefe de Carrera (Derecho)** | Dr. Roberto Quinteros | `jefe.derecho@uni.edu.bo` | `Admin123!` | Exclusivo **Derecho** (FCJS) |
| **Coordinación General** | Coordinación Académica | `coord@uni.edu.bo` | `Admin123!` | Global (Todas las Facultades y Carreras) |
| **Secretaría de Facultad** | Lic. Ana Flores Pérez | `secretaria@uni.edu.bo` | `Admin123!` | Operador de Sorteo y Emisión de Actas |
| **Vicerrectorado** | Dra. Beatriz Gutiérrez | `vicerrector@uni.edu.bo` | `Admin123!` | Supervisión Global y Reportes Estratégicos |

> [!NOTE]
> Para restaurar o volver a sembrar todos estos usuarios y casos de prueba en cualquier momento, ejecute en la carpeta `backend/`:
> ```bash
> npm run db:seed
> ```

---

## 📊 1.1 Porcentaje de Cumplimiento y Operatividad por Rol

$$\mathbf{ESTADO\ GENERAL:\ 90.1\%\ DE\ CUMPLIMIENTO\ GLOBAL}$$

| Rol Institucional | % Cumplimiento | Funcionalidades Habilitadas y Validadas | Pendientes Técnicos |
| :--- | :---: | :--- | :--- |
| **Jefe de Carrera** | **100%** | • CRUD de casos y áreas de su carrera<br>• Monitoreo de stock crítico ($<2$ casos)<br>• Reactivación especial justificada<br>• Aislamiento multi-tenancy estricto (RNF-02) | Ninguno en su operativa crítica. |
| **Coordinación General** | **100%** | • Padrón de postulantes e importador masivo Excel/CSV<br>• Programación de fechas de defensa<br>• Embudo y alertas a 15 días | Ninguno en su operativa crítica. |
| **Secretaría de Facultad** | **100%** | • Operación de ruleta criptográfica CSPRNG<br>• Generación y descarga de Acta oficial en PDF<br>• Registro de nota y dictamen final | Ninguno en su operativa crítica. |
| **Vicerrectorado** | **85%** | • **Auditar y Observar:** Dashboard ejecutivo con 5 KPIs, alertas de stock, supervisión de actas y trazabilidad forense.<br>• **Restricción:** **NO puede iniciar sorteos** (solo observación de actas).<br>• **Función Activa Única:** **Añadir roles y usuarios al sistema**, principalmente dar de alta al **Jefe de Carrera** y asignarle su carrera correspondiente. | Implementar endpoints `POST /users` y `PUT /users/:id` para permitir el alta desde la UI de `/usuarios`. |
| **Super Administrador** | **60%** | • Activación/desactivación de usuarios<br>• Reseteo administrativo de contraseñas<br>• Sembrado de catálogo universitario | Endpoints `POST /users`, `PUT /users/:id` y visor web de auditoría en frontend. |

> 📌 Para la auditoría exhaustiva con ponderaciones matemáticas, consulte el informe: [Evaluación de Cumplimiento por Rol y Pendientes](file:///c:/SGSEG/docs/evaluacion_cumplimiento_roles.md).

---

## 🚪 2. Cómo Iniciar Sesión en el Sistema

### A. Desde la Interfaz Web (Frontend)
1. Inicie la aplicación (generalmente en `http://localhost:5173` o el puerto configurado por Vite).
2. Si no tiene una sesión activa, el sistema le redirigirá automáticamente a `/login`.
3. Ingrese el **Correo Institucional** y la **Contraseña** del actor deseado.
4. Presione **Iniciar Sesión**. El sistema validará sus credenciales con el backend, emitirá un JWT Bearer Token y cargará el menú adaptado a sus permisos de rol.

### B. Vía API REST (cURL / Postman / ThunderClient)
- **Endpoint:** `POST /api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Payload:**
  ```json
  {
    "correoInstitucional": "jefe.sistemas@uni.edu.bo",
    "password": "Admin123!"
  }
  ```
- **Respuesta:**
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "user": {
      "idUsuario": "10",
      "correoInstitucional": "jefe.sistemas@uni.edu.bo",
      "nombreCompleto": "Carlos Mendoza Vargas",
      "rol": "JEFE_CARRERA"
    }
  }
  ```

---

## 👤 3. Guía Operativa por Actor Institucional

---

### 🎓 Actor 1: Jefe de Carrera

#### 🎯 Objetivo:
Gestionar el banco de casos de estudio y las áreas académicas de **su carrera**, garantizando que nunca se agote el stock disponible para sorteo.

#### 🔐 Credenciales para ingresar:
- **Ingeniería de Sistemas:** `jefe.sistemas@uni.edu.bo` / `Admin123!`
- **Derecho:** `jefe.derecho@uni.edu.bo` / `Admin123!`

#### 🛡️ Aislamiento Estricto (Multi-Tenancy):
- Un Jefe de Carrera **solo puede ver y gestionar las áreas y casos de estudio de su carrera asignada**.
- Si el Jefe de Sistemas intenta consultar o modificar un caso de Derecho, el backend bloquea automáticamente la petición con un error `403 Forbidden`.

#### 📋 Flujo de Trabajo en la Pantalla `/casos`:
1. **Verificar Stock Crítico:** Al entrar, observe el banner superior carmesí. Si un área tiene menos de 2 casos disponibles con `< 2` usos, se marcará en **ALERTA DE STOCK CRÍTICO**.
2. **Crear Nueva Área Académica:** 
   - Clic en `+ Nueva Área`.
   - Ingrese el nombre del área (ej. *Ciberseguridad Forense*) y defina el umbral mínimo (default: 2).
3. **Registrar un Caso de Estudio:**
   - Clic en `+ Registrar Caso de Estudio`.
   - Seleccione el área académica correspondiente.
   - Ingrese el título técnico y el planteamiento/enunciado del problema.
   - Guarde el caso. Nacerá con `0/2 Usos` y estado `DISPONIBLE`.
4. **Inspección de Casos:**
   - Cada caso muestra su contador de usos: `Disponible 0/2`, `En Uso 1/2` o `Agotado 2/2`.
   - El Jefe de Carrera puede hacer clic en el icono del **Ojo** para leer el planteamiento completo del problema, o en **Editar** para ajustar el enunciado.

---

### 📅 Actor 2: Coordinación General

#### 🎯 Objetivo:
Monitorear el padrón oficial de estudiantes, programar las fechas oficiales de defensa de examen de grado y vigilar el avance en el embudo (pipeline).

#### 🔐 Credenciales para ingresar:
- **Correo:** `coord@uni.edu.bo`
- **Contraseña:** `Admin123!`

#### 📋 Flujo de Trabajo:
1. **Gestión del Padrón (`/estudiantes`):**
   - Explore los postulantes matriculados, filtrando por carrera o buscando por carnet/CI.
   - En cada fila de estudiante activo, observe el botón **"Programar"**.
2. **Programación de Fechas de Defensa:**
   - Puede programar desde el botón directo en `/estudiantes` o desde `/defensas` (+ Programar Fecha de Defensa).
   - Seleccione el postulante, el tipo de defensa (`INTERNA` o `EXTERNA`) y la fecha planificada.
   - El sistema calculará **en tiempo real** la regla reglamentaria correspondiente a la facultad y carrera:
     * **Sistemas / Telecom / Redes:** 7 días de preparación previa.
     * **Industrial:** 5 días de preparación previa.
     * **Mecánica:** 14 días de preparación previa.
     * **Psicología:** 10 días de preparación previa.
     * **Empresariales / Jurídicas (FCE/FCJS):** Sorteo de área 5 días antes; caso el mismo día de la defensa (1h interna / 1.5h externa).
3. **Monitoreo del Embudo (`/defensas`):**
   - **Pipeline de 5 Etapas:** `Programados ➔ Área Sorteada ➔ Caso Asignado ➔ Defendido ➔ Calificado`.
   - **Alertas Operativas:** Tarjeta destacada que alerta sobre postulantes con fecha de defensa en los próximos 15 días que **aún no han realizado su sorteo reglamentario**.

---

### ⚖️ Actor 3: Secretaría de Facultad

#### 🎯 Objetivo:
Operar el acto formal de sorteo digital en sesión presencial o virtual, verificar la comparecencia del estudiante y emitir el Acta Oficial con certificación criptográfica.

#### 🔐 Credenciales para ingresar:
- **Correo:** `secretaria@uni.edu.bo`
- **Contraseña:** `Admin123!`

#### 📋 Flujo de Trabajo en la Pantalla `/sorteo`:
1. **Selección del Postulante:**
   - En el panel **"Bolillero Digital Criptográfico"**, seleccione al estudiante de la lista de defensas pendientes.
   - Verifique los datos de su carrera, tipo de defensa y modalidad asignada.
2. **Registro de Comparecencia:**
   - Marque el checkbox: `Estudiante presente en el acto de sorteo (conforme a reglamento)`.
   - Si el estudiante no compareció por causa mayor, desmarque la casilla e ingrese el motivo o justificativo oficial.
3. **Ejecución del Sorteo Digital:**
   - **Para Carreras de Tecnología (FCT) o Psicología:** Presione `Ejecutar Sorteo Conjunto Anticipado (Área + Caso)`.
   - **Para Carreras de FCE / FCJS (Derecho, Administración):**
     * **Fase 1 (5 días antes):** Presione `Sortear Área Temática`.
     * **Fase 2 (Día de la defensa):** Presione `Sortear Caso de Estudio`.
   - La ruleta animada girará y seleccionará mediante **CSPRNG (sin sesgo)** el área y/o caso ganador.
4. **Generación y Certificación del Acta:**
   - Al concluir el sorteo, se generará inmediatamente el **Sello SHA-256 de Integridad Criptográfica** (ej: `UPTECSA-ACTA:41:6:3:...`).
   - En la sección **Historial de Sorteos**, haga clic en **"Ver Acta"**.
   - Se abrirá la **Acta Oficial de Sorteo Digital** con todos los datos institucionales, estudiante, resultado, testigo y sello.
   - Presione **"Imprimir Acta"** para archivar o entregar copia firmada al postulante.

---

### 📊 Actor 4: Vicerrectorado / Dirección Académica

#### 🎯 Objetivo:
1. **Auditar y Observar:** Supervisión institucional de calidad, monitoreo de cumplimiento de plazos reglamentarios, verificación de actas emitidas y exportación del padrón consolidado para acreditación.
2. **Restricción Estricta:** **NO puede iniciar un nuevo proceso de sorteo** (imparcialidad reglamentaria; no puede accionar la ruleta).
3. **Única Función Activa Permitida:** **Añadir roles y usuarios al sistema**, principalmente dar de alta al **Jefe de Carrera** y asignarle su carrera académica correspondiente.

#### 🔐 Credenciales para ingresar:
- **Correo:** `vicerrector@uni.edu.bo`
- **Contraseña:** `Admin123!`

#### 📋 Flujo de Trabajo:

##### A. En `/reportes` y `/sorteo` (Auditar y Observar):
1. **Métricas Consolidadas:** Revisión del total de defensas en pipeline, tasa de aprobación/reprobación global y actas con firma SHA-256.
2. **Auditoría de Áreas y Casos:** Alertas prioritarias de stock crítico ($<2$ casos disponibles).
3. **Exportación de Padrones e Informes:** Descarga del padrón completo en CSV compatible con Excel.
4. **Inspección de Actas:** Consulta y descarga de las Actas Oficiales en PDF (`/sorteos/acta/:id/pdf`). **No tiene habilitado el botón de iniciar sorteo ni de giro de ruleta.**

##### B. En `/usuarios` (Añadir Roles y Usuarios):
1. **Dar de Alta Nuevas Autoridades:** Crear la cuenta institucional de nuevos Jefes de Carrera, Coordinadores o Secretarios.
2. **Asignación Obligatoria de Carrera:** Al registrar a un **Jefe de Carrera**, vincularlo estrictamente a su respectiva carrera académica (`carreraId`) para garantizar el aislamiento multi-tenancy (RNF-02).
3. **Control de Accesos:** Desactivar o reactivar cuentas ante rotación de autoridades.

---

## 🗺️ 4. Matriz Resumen de Accesos a Páginas por Rol

| Ruta en el Frontend | Nombre de la Página | Coordinación | Secretaría | Jefe de Carrera | Vicerrectorado |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `/` | Panel Principal | ✅ | ✅ | ✅ | ✅ *(Observación)* |
| `/sorteo` | Sorteo Digital y Actas | ✅ | ✅ *(Operador)* | 👁️ *(Espectador)* | 👁️ *(Solo Observación / Prohibido Iniciar)* |
| `/casos` | Banco de Casos y Áreas | ✅ | ❌ | ✅ *(Aislado a su Carrera)* | 👁️ *(Solo Lectura / Auditoría)* |
| `/estudiantes` | Padrón de Postulantes | ✅ | ✅ | ✅ *(Aislado a su Carrera)* | 👁️ *(Solo Lectura / Auditoría)* |
| `/defensas` | Cronograma y Embudo | ✅ | ✅ | ✅ *(Aislado a su Carrera)* | 👁️ *(Solo Lectura / Auditoría)* |
| `/reportes` | Reportes y Exportación CSV | ✅ | ✅ | ✅ | ✅ *(Supervisión y Auditoría)* |
| `/academia` | Estructura Académica | ✅ | ✅ | ✅ | 👁️ *(Solo Lectura)* |
| `/usuarios` | Gestión de Usuarios y Roles | ✅ | ❌ | ❌ | ✅ **(Añadir Roles y Usuarios: Jefes de Carrera)** |

---

## 🔄 5. Verificación Rápida de Prueba sugerida

Para comprobar todo el circuito en menos de 5 minutos:

1. **Entrar como Jefe de Carrera de Sistemas** (`jefe.sistemas@uni.edu.bo`):
   - Vaya a `/casos`. Verifique que solo ve áreas de Sistemas (Software, Redes, etc.) y no de Derecho.
2. **Entrar como Coordinador** (`coord@uni.edu.bo`):
   - Vaya a `/defensas`. Observe el embudo y las defensas programadas.
   - Vaya a `/estudiantes` y use el botón **"Programar"** en cualquier postulante para asignarle fecha.
3. **Entrar como Secretaría** (`secretaria@uni.edu.bo`):
   - Vaya a `/sorteo`. Seleccione el postulante programado, marque asistencia y presione **Sortear**.
   - Vea girar la ruleta, obtenga el token criptográfico y haga clic en **"Ver Acta"** ➔ **"Imprimir"**.
4. **Entrar como Vicerrectorado** (`vicerrector@uni.edu.bo`):
   - Vaya a `/reportes` y presione **"Exportar Padrón (CSV)"** para validar los datos descargados.
