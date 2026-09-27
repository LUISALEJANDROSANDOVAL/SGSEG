# Plan de Pruebas Manuales (QA Frontend) - SGSEG

Este documento es tu guÃ­a oficial como Ingeniero de QA para certificar la calidad visual y funcional del **Frontend** del Sistema de GestiÃ³n y Seguimiento de ExÃ¡menes de Grado (SGSEG).

Debes ejecutar estos casos de prueba abriendo la aplicaciÃ³n web en tu navegador (`http://localhost:5173`) y marcando con un `[x]` las pruebas que pasen exitosamente. Si alguna falla, anota el error detallado (texto, color de pantalla o error en la Consola `F12`) y repÃ³rtalo al equipo de desarrollo.

---

## ðŸ‘¥ 1. Matriz de Usuarios para Pruebas (Data de Semilla)

Utiliza estas credenciales reales de la base de datos para simular los distintos roles dentro del sistema. La contraseÃ±a para todos es: `Admin123!`

| Nombre de Prueba | Rol Asignado | Correo Institucional | PropÃ³sito de Prueba |
| :--- | :--- | :--- | :--- |
| **CoordinaciÃ³n AcadÃ©mica** | `COORDINACION` | `coord@uni.edu.bo` | VerificaciÃ³n de acceso global y administraciÃ³n. |
| **Ana Flores (SecretarÃ­a)** | `SECRETARIADO` | `secretaria@uni.edu.bo` | Pruebas de acceso operativo bÃ¡sico. |
| **Carlos Mendoza** | `JEFE_CARRERA` | `jefe.sistemas@uni.edu.bo` | Verificar que SOLO vea informaciÃ³n de la carrera de Sistemas. |
| **Roberto Quinteros** | `JEFE_CARRERA` | `jefe.derecho@uni.edu.bo` | Verificar que SOLO vea informaciÃ³n de la carrera de Derecho. |
| **Beatriz GutiÃ©rrez** | `VICERRECTORADO` | `vicerrector@uni.edu.bo` | Pruebas de solo lectura / reportes gerenciales. |

---

## ðŸ§ª 2. Casos de Prueba Funcionales (EjecuciÃ³n Manual)

### MÃ³dulo de AutenticaciÃ³n (Login)
- [X] **TC-AUTH-01 (Happy Path):** Ingresar con `coord@uni.edu.bo` y `Admin123!`. El sistema debe redirigir al Dashboard principal.
- [X] **TC-AUTH-02 (Sad Path):** Ingresar con `jefe.sistemas@uni.edu.bo` y una contraseÃ±a incorrecta (ej. `Hola123`). El sistema debe mostrar un mensaje rojo claro "Credenciales incorrectas" y NO dejarte pasar.
- [X] **TC-AUTH-03 (Edge Case):** Dejar los campos de correo y contraseÃ±a vacÃ­os y hacer clic en "Ingresar". Los campos deben pintarse de rojo pidiendo que los llenes.

### MÃ³dulo de Roles y Permisos (Seguridad Frontend)
- [X] **TC-RBAC-01 (Aislamiento de Jefes):** Iniciar sesiÃ³n como `jefe.sistemas@uni.edu.bo`. Entrar a ver estudiantes o casos de estudio. **Asegurarse** visualmente de que NO aparece ningÃºn dato de la carrera de "Derecho".
- [X] **TC-RBAC-02 (Aislamiento de Jefes 2):** Cerrar sesiÃ³n e ingresar como `jefe.derecho@uni.edu.bo`. Verificar que NO aparezca ningÃºn dato de "IngenierÃ­a de Sistemas".
- [ ] **TC-RBAC-03 (VisiÃ³n Global):** Iniciar sesiÃ³n como `coord@uni.edu.bo`. Verificar que se puedan ver y gestionar datos de TODAS las carreras.

### MÃ³dulo de GestiÃ³n AcadÃ©mica (Casos de Estudio)
- [ ] **TC-CASOS-01 (CreaciÃ³n y Upload a Pinata):** Entrar al mÃ³dulo de Casos de Estudio, crear uno nuevo y probar el botÃ³n de "Subir Documento". Seleccionar un PDF. Al guardar, hacer clic en el enlace adjunto y verificar que se abre en el navegador usando Pinata (IPFS).
- [ ] **TC-CASOS-02 (Borrado LÃ³gico - Soft Delete):** Hacer clic en el botÃ³n de eliminar (basurero) de un Caso de Estudio que no tenga historial. El caso debe desaparecer de la tabla inmediatamente y mostrar un mensaje verde de Ã©xito.
- [ ] **TC-CASOS-03 (ValidaciÃ³n de EliminaciÃ³n):** Intentar eliminar un caso de estudio que YA tenga la etiqueta de "AGOTADO" o que se sepa que fue usado en un sorteo. El sistema debe lanzar un error 400 (Bad Request) y mostrar un mensaje indicando que "No se puede eliminar un caso en uso".

---

## ðŸ“± 3. Pruebas de Usabilidad y UI/UX (Frontend Puro)

### Responsividad (Mobile y Tablets)
- [ ] **TC-UX-01:** Con el sistema abierto, presionar `F12` en Chrome y activar el modo dispositivo (Ã­cono de tablet/celular). Seleccionar "iPhone 12 Pro". El menÃº lateral debe colapsarse en un menÃº hamburguesa (â‰¡).
- [ ] **TC-UX-02:** En vista de celular, revisar las tablas de datos. No deben desbordarse ni romper la pantalla (deben poder desplazarse horizontalmente o convertirse en tarjetas).

### Empty States (Estados VacÃ­os)
- [ ] **TC-UX-03:** Navegar a una pantalla donde sepas que no hay registros (ej. Casos de Estudio de una carrera nueva). En lugar de mostrar una tabla deforme y vacÃ­a, debe aparecer una ilustraciÃ³n o mensaje amigable diciendo "AÃºn no hay registros aquÃ­".

### Interacciones
- [ ] **TC-UX-04:** Validar que todos los botones principales tengan un efecto `hover` (que cambien ligeramente de color al pasar el mouse por encima) para indicar que son interactivos.
- [ ] **TC-UX-05:** Validar que al realizar acciones que tarden (como subir un PDF o hacer login), los botones muestren un "spinner" o digan "Cargando..." para que el usuario no haga doble clic por desesperaciÃ³n.
 1. El Defecto Principal (Filtrado de Datos / RBAC Roto)
FÃ­jate bien en quiÃ©n estÃ¡ operando el sistema:

En ParÃ¡metros del Acto (Derecha) dice claramente que el Operador es: Roberto Quinteros AlarcÃ³n.
Si recordamos la matriz de roles que vimos antes, Roberto Quinteros es el Jefe de Carrera de Derecho.
Sin embargo, en el Historial de la SesiÃ³n (Derecha) se estÃ¡n mostrando actos oficializados de estudiantes de AdministraciÃ³n de Empresas (Luis Fernando CÃ©spedes) y de IngenierÃ­a Comercial (Camila Antelo).
ðŸ”¥ ConclusiÃ³n del Bug: El aislamiento de datos estÃ¡ fallando. Un Jefe de Carrera de Derecho no deberÃ­a poder ver el historial de sorteos y despachos de otras carreras. Esto viola el TC-RBAC-02 de tu plan de pruebas manual. El backend (o el frontend) estÃ¡ trayendo todo el historial sin filtrar por el id_carrera del operador.
### Pantalla de Proyección (Kiosko)
- [X] (FALLÓ) **TC-UX-06 (Pantalla Completa sin Scroll):** Al ingresar a la vista del Acto Solemne de Sorteo Público (Proyector), verificar que toda la interfaz encaje perfectamente en la pantalla sin generar scroll vertical.
