# Plan de Implementación de Pendientes y Cierre al 100% (SGSEG - UTEPSA)

**Sistema de Gestión de Sorteos de Grado, Casos de Estudio y Defensas Finales**  
**Fecha de Elaboración:** Septiembre 2026  
**Objetivo:** Guiar la resolución exhaustiva de todas las brechas técnicas detectadas en la auditoría para elevar el software de su **90.1% actual al 100% de cumplimiento funcional y operativo**.

---

## 📋 Índice de Tareas de Implementación

```mermaid
graph TD
    subgraph FASE 1 [Fase 1: Errores Funcionales Críticos 🔴]
        T1[1.1 Backend CRUD Usuarios] --> T2[1.2 Frontend Conexión Usuarios]
        T3[1.3 RBAC Visual en Menú y Rutas]
        T4[1.4 API y Frontend Configuración Dinámica]
    end

    subgraph FASE 2 [Fase 2: Presentación y Auditoría 🟡]
        T5[2.1 Backend Endpoint Auditoría] --> T6[2.2 Frontend Visor de Auditoría]
        T7[2.3 Modo Espectador en Sorteo para Jefes]
        T8[2.4 Corrección de Suite E2E Concurrencia]
    end

    FASE 1 --> FASE 2
    FASE 2 --> META((100% Cumplimiento Total))
```

---

# 🔴 FASE 1: Errores Funcionales Directos (Prioridad Alta)

---

## Tarea 1.1: Backend — Implementación del Módulo y CRUD de Usuarios

### ⚠️ ¿Qué falla actualmente?
* Al intentar crear, editar o desactivar usuarios desde la interfaz web `/usuarios`, las peticiones HTTP fallan con error `404 Not Found`.
* **Causa Raíz:** En el backend, el archivo [usuarios.controller.ts](file:///c:/proyecto%20integrador/SGSEG/backend/src/usuarios/controller/usuarios.controller.ts) es una clase vacía:
  ```typescript
  export class UsuariosController {}
  ```
  Tanto `usuarios.service.ts` como `usuarios.repository.ts` están vacíos y `UsuariosModule` no está registrado en `app.module.ts`.

### 📂 Archivos a Crear / Modificar
* `[NUEVO]` [usuarios.module.ts](file:///c:/proyecto%20integrador/SGSEG/backend/src/usuarios/usuarios.module.ts)
* `[MODIFICAR]` [usuarios.controller.ts](file:///c:/proyecto%20integrador/SGSEG/backend/src/usuarios/controller/usuarios.controller.ts)
* `[MODIFICAR]` [usuarios.service.ts](file:///c:/proyecto%20integrador/SGSEG/backend/src/usuarios/services/usuarios.service.ts)
* `[MODIFICAR]` [usuarios.repository.ts](file:///c:/proyecto%20integrador/SGSEG/backend/src/usuarios/repositories/usuarios.repository.ts)
* `[MODIFICAR]` [create-usuario.dto.ts](file:///c:/proyecto%20integrador/SGSEG/backend/src/usuarios/dto/create-usuario.dto.ts)
* `[MODIFICAR]` [app.module.ts](file:///c:/proyecto%20integrador/SGSEG/backend/src/app.module.ts)

### 🛠️ ¿Qué se debe hacer para solucionarlo?

1. **Definir DTOs de Entrada:**
   ```typescript
   // create-usuario.dto.ts
   export class CreateUsuarioInputDto {
     @IsString() @IsNotEmpty()
     nombre: string;

     @IsEmail()
     email: string;

     @IsString() @MinLength(6)
     password: string;

     @IsString() @IsNotEmpty()
     rol: string; // 'Coordinador General' | 'Secretario de Facultad' | 'Jefe de Carrera' | 'Vicerrectorado' | etc.

     @IsOptional() @IsString()
     carreraId?: string;

     @IsOptional() @IsBoolean()
     activo?: boolean;
   }

   export class UpdateUsuarioInputDto {
     @IsOptional() @IsString()
     nombre?: string;

     @IsOptional() @IsEmail()
     email?: string;

     @IsOptional() @IsString()
     password?: string;

     @IsOptional() @IsString()
     rol?: string;

     @IsOptional() @IsString()
     carreraId?: string;

     @IsOptional() @IsBoolean()
     activo?: boolean;
   }
   ```

2. **Implementar Mapeo de Roles Institucionales:**
   El frontend envía nombres de visualización (ej: `'Coordinador General'`, `'Jefe de Carrera'`, `'Secretario de Facultad'`). El servicio debe normalizarlos al enum de base de datos (`COORDINACION`, `JEFE_CARRERA`, `SECRETARIADO`, `VICERRECTORADO`, `SUPER_ADMIN`).

3. **Lógica de Creación en `UsuariosService`:**
   - Validar que el correo institucional no exista (`409 Conflict`).
   - Hashear la contraseña con `bcrypt.hash(dto.password, 10)`.
   - En una transacción Prisma:
     * Crear el registro en `usuario`.
     * Si el rol es `JEFE_CARRERA` y se especificó `carreraId`, crear la relación en `usuario_carrera`.
   - Registrar la acción en `RegistroAuditoria` (`ACCION: "USUARIO_CREADO"`).

4. **Exponer Endpoints en `UsuariosController`:**
   ```typescript
   @Controller('users')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('COORDINACION', 'SUPER_ADMIN')
   export class UsuariosController {
     @Get()
     async findAll() { ... }

     @Post()
     @HttpCode(HttpStatus.CREATED)
     async create(@Body() dto: CreateUsuarioInputDto) { ... }

     @Put(':id')
     async update(@Param('id') id: string, @Body() dto: UpdateUsuarioInputDto) { ... }

     @Patch(':id/deactivate')
     async deactivate(@Param('id') id: string) { ... }
   }
   ```

5. **Importar `UsuariosModule` en `AppModule`:**
   Añadir `UsuariosModule` al arreglo de `imports` en [app.module.ts](file:///c:/proyecto%20integrador/SGSEG/backend/src/app.module.ts).

---

## Tarea 1.2: Frontend — Conexión y Normalización de `Usuarios.tsx`

### ⚠️ ¿Qué falla actualmente?
* En [Usuarios.tsx](file:///c:/proyecto%20integrador/SGSEG/frontend/src/pages/Usuarios.tsx), el método `fetchDatos` intenta hacer fallback entre `/auth/users` y `/users`:
  ```typescript
  const [resUsers, resCarreras] = await Promise.all([
    api.get('/auth/users').catch(() => api.get('/users')),
    api.get('/estudiantes/carreras').catch(() => api.get('/academia/carreras')),
  ]);
  ```
  La estructura retornada por el backend no se ajusta exactamente a los nombres de atributos esperados en la tabla (`nombreCompleto` vs `nombre`, `rol.nombre` vs `rol`).

### 📂 Archivos a Modificar
* `[MODIFICAR]` [Usuarios.tsx](file:///c:/proyecto%20integrador/SGSEG/frontend/src/pages/Usuarios.tsx)
* `[NUEVO]` [usuarios.api.ts](file:///c:/proyecto%20integrador/SGSEG/frontend/src/lib/usuarios.api.ts)

### 🛠️ ¿Qué se debe hacer para solucionarlo?
1. Crear un cliente tipado `usuarios.api.ts`:
   - `getUsuarios()`: Llama a `GET /users`.
   - `crearUsuario(payload)`: Llama a `POST /users`.
   - `actualizarUsuario(id, payload)`: Llama a `PUT /users/:id`.
   - `toggleEstadoUsuario(id)`: Llama a `PATCH /users/:id/deactivate`.
2. Adaptar la tabla de `Usuarios.tsx` para renderizar consistentemente:
   - Nombre: `usuario.nombreCompleto || usuario.primerNombre + ' ' + usuario.primerApellido`.
   - Rol: `usuario.rol?.nombre || usuario.rol`.
   - Carrera vinculada: `usuario.carreras?.[0]?.carrera?.nombre || '—'`.
3. Manejar retroalimentación visual (toasts de éxito / error) en creación y edición.

---

## Tarea 1.3: Frontend — Control de Acceso Visual Estricto en Menú y Rutas (RBAC Visual)

### ⚠️ ¿Qué falla actualmente?
* En [navegacion.ts](file:///c:/proyecto%20integrador/SGSEG/frontend/src/lib/navegacion.ts) y [App.tsx](file:///c:/proyecto%20integrador/SGSEG/frontend/src/App.tsx), la variable `TODOS_LOS_ROLES` se asigna a **todas** las páginas.
* Consecuencia:
  - Una secretaria ve en el menú "Gestión de Casos" y "Usuarios y Roles" (que le rebotan con 403 al hacer clic).
  - Un Jefe de Carrera ve "Usuarios y Roles" y "Configuración".
  - Se viola el principio de diseño de menor sorpresa y estética institucional.

### 📂 Archivos a Modificar
* `[MODIFICAR]` [navegacion.ts](file:///c:/proyecto%20integrador/SGSEG/frontend/src/lib/navegacion.ts)
* `[MODIFICAR]` [App.tsx](file:///c:/proyecto%20integrador/SGSEG/frontend/src/App.tsx)

### 🛠️ ¿Qué se debe hacer para solucionarlo?

1. **Ajustar la Matriz de Navegación en `navegacion.ts`:**
   ```typescript
   export const navegacion: { grupo: string; items: ItemNavegacion[] }[] = [
     {
       grupo: 'General',
       items: [
         {
           nombre: 'Panel Principal',
           ruta: '/',
           roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera', 'Vicerrectorado', 'Administrador General'],
         },
         {
           nombre: 'Sorteo Digital',
           ruta: '/sorteo',
           roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera', 'Vicerrectorado', 'Administrador General'],
         },
       ],
     },
     {
       grupo: 'Coordinación y Casos',
       items: [
         {
           nombre: 'Gestión de Casos',
           ruta: '/casos',
           roles: ['Coordinador General', 'Jefe de Carrera', 'Vicerrectorado', 'Administrador General'], // Oculto para Secretaría
         },
         {
           nombre: 'Estudiantes',
           ruta: '/estudiantes',
           roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera', 'Vicerrectorado', 'Administrador General'],
         },
         {
           nombre: 'Cronograma y Defensas',
           ruta: '/defensas',
           roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera', 'Vicerrectorado', 'Administrador General'],
         },
         {
           nombre: 'Estructura Académica',
           ruta: '/academia',
           roles: ['Coordinador General', 'Jefe de Carrera', 'Vicerrectorado', 'Administrador General'], // Oculto para Secretaría
         },
         {
           nombre: 'Usuarios y Roles',
           ruta: '/usuarios',
           roles: ['Coordinador General', 'Administrador General'], // Oculto para Secretaría y Jefe de Carrera
         },
       ],
     },
     {
       grupo: 'Administración y Supervisión',
       items: [
         {
           nombre: 'Reportes',
           ruta: '/reportes',
           roles: ['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera', 'Vicerrectorado', 'Administrador General'],
         },
         {
           nombre: 'Configuración',
           ruta: '/configuracion',
           roles: ['Coordinador General', 'Administrador General'], // Oculto para Secretaría y Jefe de Carrera
         },
       ],
     },
   ];
   ```

2. **Alinear Rutas en `App.tsx`:**
   En cada `<Route>`, pasar la lista específica de roles autorizados:
   ```tsx
   <Route path="/usuarios" element={
     <ProtectedRoute allowedRoles={['Coordinador General', 'Administrador General']}>
       <Usuarios />
     </ProtectedRoute>
   } />

   <Route path="/configuracion" element={
     <ProtectedRoute allowedRoles={['Coordinador General', 'Administrador General']}>
       <Configuracion />
     </ProtectedRoute>
   } />
   ```

---

## Tarea 1.4: Backend y Frontend — Configuración Dinámica de Sorteos (`/sorteo-config`)

### ⚠️ ¿Qué falla actualmente?
* En [Configuracion.tsx](file:///c:/proyecto%20integrador/SGSEG/frontend/src/pages/Configuracion.tsx):
  - Línea 23: Llama a `GET /academia/carreras` (que no existe; la ruta real es `/estudiantes/carreras`).
  - Línea 37: Llama a `GET /sorteo-config/carrera/${cId}` y al guardar no persiste porque no existe `PUT /sorteo-config`.
* **Causa Raíz:** En el backend, las tablas `configuracion_sorteo_area` y `configuracion_sorteo_caso` existen en Prisma, pero no hay un controlador expuesto para consultarlas o actualizarlas en caliente.

### 📂 Archivos a Crear / Modificar
* `[NUEVO]` `backend/src/configuracion/configuracion.controller.ts`
* `[NUEVO]` `backend/src/configuracion/configuracion.service.ts`
* `[NUEVO]` `backend/src/configuracion/configuracion.module.ts`
* `[MODIFICAR]` [Configuracion.tsx](file:///c:/proyecto%20integrador/SGSEG/frontend/src/pages/Configuracion.tsx)

### 🛠️ ¿Qué se debe hacer para solucionarlo?
1. **Crear Endpoints Backend:**
   - `GET /sorteo-config/carrera/:idCarrera`: Retorna las configuraciones de área y caso para la carrera seleccionada (días de anticipación, unidad de tiempo, mismo momento).
   - `PUT /sorteo-config/carrera/:idCarrera`: Actualiza los valores en las tablas `ConfiguracionSorteoArea` y `ConfiguracionSorteoCaso`.
2. **Actualizar `Configuracion.tsx`:**
   - Cambiar la llamada inicial de carreras a `estudiantesApi.getCarreras()`.
   - Conectar el botón de guardar para enviar los parámetros modificados mediante `PUT /sorteo-config/carrera/:id`.

---

# 🟡 FASE 2: Presentación, Auditoría y Modo Espectador (Prioridad Media)

---

## Tarea 2.1: Backend — Endpoint de Consulta de Auditoría (`GET /auditoria`)

### ⚠️ ¿Qué falta actualmente?
* Cada vez que se ejecuta un sorteo, se reactiva un caso o se cambia una contraseña, el sistema escribe en `prisma.registroAuditoria`.
* Sin embargo, no existe un endpoint REST para que el Administrador o Vicerrectorado consulte estos logs desde la aplicación web.

### 📂 Archivos a Crear / Modificar
* `[MODIFICAR]` [auditoria.controller.ts](file:///c:/proyecto%20integrador/SGSEG/backend/src/auditoria/controller/auditoria.controller.ts)
* `[MODIFICAR]` [auditoria.service.ts](file:///c:/proyecto%20integrador/SGSEG/backend/src/auditoria/services/auditoria.service.ts)
* `[NUEVO]` [auditoria.module.ts](file:///c:/proyecto%20integrador/SGSEG/backend/src/auditoria/auditoria.module.ts)
* `[MODIFICAR]` [app.module.ts](file:///c:/proyecto%20integrador/SGSEG/backend/src/app.module.ts)

### 🛠️ ¿Qué se debe hacer para solucionarlo?
1. **Crear DTO de Filtros:**
   - `modulo`: opcional (ej. `'SORTEO'`, `'CASOS'`, `'AUTH'`).
   - `fechaDesde`, `fechaHasta`: opcionales.
   - `page`, `limit`: paginación estándar (default: 20 registros por página).
2. **Exponer Endpoint en `AuditoriaController`:**
   ```typescript
   @Controller('auditoria')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('SUPER_ADMIN', 'VICERRECTORADO', 'COORDINACION')
   export class AuditoriaController {
     @Get()
     async findAll(@Query() query: FilterAuditoriaDto) {
       return this.auditoriaService.findAll(query);
     }
   }
   ```
3. **Respuesta Estructurada:**
   Retornar fecha/hora, acción realizada, usuario responsable, detalles JSON y dirección IP.

---

## Tarea 2.2: Frontend — Pestaña / Visor de Auditoría Forense

### ⚠️ ¿Qué falta actualmente?
* El frontend no tiene una pantalla ni pestaña para visualizar los eventos registrados en `RegistroAuditoria`.

### 📂 Archivos a Crear / Modificar
* `[NUEVO]` `frontend/src/pages/Auditoria.tsx` (o integrarlo como pestaña dentro de `/reportes` o `/usuarios`).
* `[MODIFICAR]` [navegacion.ts](file:///c:/proyecto%20integrador/SGSEG/frontend/src/lib/navegacion.ts) y [App.tsx](file:///c:/proyecto%20integrador/SGSEG/frontend/src/App.tsx).

### 🛠️ ¿Qué se debe hacer para solucionarlo?
1. Crear una vista tabular con:
   - Buscador por usuario o acción.
   - Filtro de módulo (Sorteo, Casos, Seguridad, Notificaciones).
   - Badge de acción (`SORTEO_FINALIZADO`, `CASO_REACTIVADO`, `NOTIFICACION_DESPACHADA`).
   - Modal desplegable para inspeccionar el `payload` JSON o hash criptográfico.

---

## Tarea 2.3: Frontend — Modo Observador en Sorteo para Jefes de Carrera

### ⚠️ ¿Qué falta actualmente?
* En [Sorteo.tsx](file:///c:/proyecto%20integrador/SGSEG/frontend/src/pages/Sorteo.tsx), si un usuario con rol `JEFE_CARRERA` ingresa, ve habilitados los botones de giro de la ruleta.
* **Criterio Reglamentario UTEPSA:** El Jefe de Carrera asiste al sorteo en calidad de veedor o tribunal, pero la ejecución técnica formal del bolillero corresponde a la Secretaría de Facultad o a Coordinación.

### 📂 Archivos a Modificar
* `[MODIFICAR]` [Sorteo.tsx](file:///c:/proyecto%20integrador/SGSEG/frontend/src/pages/Sorteo.tsx)

### 🛠️ ¿Qué se debe hacer para solucionarlo?
1. Detectar si el usuario es `JEFE_CARRERA` mediante el hook `useAuth()`.
2. En la sección de la ruleta:
   - Deshabilitar el botón de acción principal (`Sortear Área`, `Sortear Caso`).
   - Mostrar un banner informativo:
     > 🛡️ **Modo Veedor / Observador:** Como Jefe de Carrera, usted participa como testigo del acto. La ejecución del sorteo corresponde a Secretaría de Facultad.
3. Mantener habilitada la opción de visualización del resultado, consulta de asignación y descarga del Acta Oficial en PDF.

---

## Tarea 2.4: Tests E2E — Saneamiento de Llaves Foráneas en Pruebas de Concurrencia

### ⚠️ ¿Qué falla actualmente?
* Al ejecutar toda la batería de pruebas (`npx jest --config ./test/jest-e2e.json`), la suite [sorteos-asignacion-concurrencia.e2e-spec.ts](file:///c:/proyecto%20integrador/SGSEG/backend/test/sorteos-asignacion-concurrencia.e2e-spec.ts) falla con el siguiente error de Prisma:
  ```
  Foreign key constraint violated on the constraint: `envio_caso_estudio_id_estudiante_fkey`
  at prisma.estudiante.deleteMany()
  ```
* **Causa Raíz:** Con la incorporación del Módulo 5, la tabla `envio_caso_estudio` tiene una llave foránea hacia `estudiante`. El bloque `cleanDatabase` de ese archivo antiguo borra estudiantes antes de borrar los registros de `envioCasoEstudio`.

### 📂 Archivos a Modificar
* `[MODIFICAR]` [sorteos-asignacion-concurrencia.e2e-spec.ts](file:///c:/proyecto%20integrador/SGSEG/backend/test/sorteos-asignacion-concurrencia.e2e-spec.ts)
* `[MODIFICAR]` [tk16-auditoria-estudiantes.e2e-spec.ts](file:///c:/proyecto%20integrador/SGSEG/backend/test/tk16-auditoria-estudiantes.e2e-spec.ts)

### 🛠️ ¿Qué se debe hacer para solucionarlo?
1. En la función de limpieza de cada suite E2E, asegurar el orden estricto de eliminación:
   ```typescript
   await prisma.envioCasoEstudio.deleteMany();
   await prisma.sesionEspectadorSorteo.deleteMany();
   await prisma.asignacionCaso.deleteMany();
   await prisma.sorteoAreaPool.deleteMany();
   await prisma.sorteoArea.deleteMany();
   await prisma.sorteoCaso.deleteMany();
   await prisma.sorteo.deleteMany();
   await prisma.defensaExamenGrado.deleteMany();
   await prisma.instanciaExamenGrado.deleteMany();
   await prisma.procesoExamenGrado.deleteMany();
   await prisma.estudiante.deleteMany(); // Ahora se borra de forma segura
   ```
2. Ejecutar nuevamente la suite para garantizar **13/13 suites E2E en verde**.

---

# 📈 Matriz de Impacto en el Cumplimiento

| Módulo | Cumplimiento Actual | Con Fase 1 | Con Fase 2 (Meta Final) |
| :--- | :---: | :---: | :---: |
| **M1. Autenticación y Usuarios** | 80.0% | 100% | **100%** |
| **M2. Casos y Stock Crítico** | 97.5% | 97.5% | **100%** |
| **M3. Padrón e Importador** | 97.5% | 97.5% | **100%** |
| **M4. Sorteo Criptográfico** | 97.5% | 97.5% | **100%** |
| **M5. Actas, Notificaciones y Reportes** | 97.5% | 97.5% | **100%** |
| **M6. Defensas y Calificación** | 97.5% | 97.5% | **100%** |
| **M7. Estructura y Configuración** | 45.0% | 90.0% | **100%** |
| **M8. Auditoría Forense** | 55.0% | 55.0% | **100%** |
| **PONDERADO TOTAL** | **90.1%** | **96.8%** | 🏆 **100.0%** |

---

# 🧪 Comandos de Validación y Pruebas

Una vez ejecutadas las tareas, el sistema debe verificarse con los siguientes comandos:

```bash
# 1. Compilación del Backend (NestJS + TypeScript)
cd backend
npx nest build

# 2. Batería Completa de Pruebas E2E (13 suites)
npx jest --config ./test/jest-e2e.json

# 3. Pruebas Unitarias Generales del Backend
npx jest

# 4. Chequeo Estricto de Tipos en Frontend
cd ../frontend
npx tsc --noEmit

# 5. Linter Rápido de Frontend
npx oxlint
```
