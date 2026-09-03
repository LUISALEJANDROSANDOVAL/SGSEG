# Documentación de Usuarios y Roles (Sprint 1)

Este documento describe los roles, permisos y flujos de acceso implementados en el Sistema de Gestión de Sorteos (SGSEG) para el Sprint 1.

## 1. Roles del Sistema

El sistema maneja un control de acceso basado en roles (RBAC). Los roles actuales son:

- **Coordinador General**: Tiene acceso global a todas las facultades, carreras, áreas y configuraciones del sistema.
- **Vicerrectorado**: Tiene un nivel de acceso de solo lectura o aprobación a nivel global, similar al Coordinador pero enfocado en seguimiento.
- **Secretario de Facultad**: Tiene permisos administrativos limitados a su facultad específica.
- **Jefe de Carrera**: Tiene acceso administrativo y de configuración **únicamente** a los datos de la Carrera que tiene asignada (Áreas, Pensums, Estudiantes). El aislamiento de privilegios impide que interactúe con datos de otras carreras.

## 2. Flujo de Acceso (Autenticación JWT)

La API está protegida por JSON Web Tokens (JWT). El flujo de autenticación es el siguiente:

1. **Obtener el Token**: El cliente (frontend, Postman o script) realiza una petición `POST` al endpoint `/auth/login` enviando las credenciales (`email` y `password` en formato JSON).
2. **Respuesta Exitoso**: El servidor valida las credenciales y devuelve un objeto JSON que contiene la propiedad `access_token`.
3. **Peticiones Autenticadas**: Para cualquier otra petición al backend (ej. `/academia/carreras`), el cliente debe incluir el token en las cabeceras HTTP:
   ```http
   Authorization: Bearer <tu_access_token>
   ```

## 3. Credenciales de Prueba (Semilla / Seed)

Para facilitar las pruebas de QA y el desarrollo local, la base de datos se inicializa con usuarios de prueba. Todas las cuentas de prueba comparten la misma contraseña.

**Contraseña Universal de Pruebas:** `password123`

| Rol | Email de Prueba | Nombre | Notas |
|---|---|---|---|
| Coordinador General | `coordinadora@sgseg.com` | Dra. Lucrecia Sandoval | Acceso total al sistema. |
| Jefe de Carrera | `jefe.sistemas@sgseg.com` | Ing. Carlos Mendoza | Asignado a "Ingeniería de Sistemas". |
| Secretario de Facultad | `secretario@sgseg.com` | Lic. Roberto Gómez | Acceso a nivel de facultad. |
| Vicerrectorado | `vicerrector@sgseg.com` | Dr. Fernando Prado | Acceso global/seguimiento. |

> **Importante para QA (Aislamiento):** Al iniciar sesión con el `Jefe de Carrera`, el token devuelto contiene su `carreraId`. Cualquier intento de modificar o crear datos enviando un `carreraId` distinto será bloqueado automáticamente por el servidor con un error `403 Forbidden`.
