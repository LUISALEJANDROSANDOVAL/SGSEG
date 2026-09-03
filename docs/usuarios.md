# Documentación de Usuarios y Roles - SGSEG

## 1. Roles del Sistema
El sistema cuenta con un control de acceso basado en roles (RBAC) para proteger las diferentes áreas de la aplicación. 

Los roles oficiales y su descripción son:
- **COORDINACION:** Coordinación académica (Acceso total a gestión general y de estudiantes).
- **SECRETARIADO:** Secretariado académico (Soporte en inscripciones y validaciones).
- **JEFE_CARRERA:** Jefe de carrera (Acceso limitado estrictamente a la gestión de su propia carrera/plan de estudios).
- **VICERRECTORADO:** Vicerrectorado (Acceso gerencial y de lectura/reportes).
- **REGISTRO:** Registro académico (Gestión de documentos oficiales y kardex).
- **DEFENSA:** Defensa de grado (Gestión exclusiva de tribunales y actas de defensa).

## 2. Flujo de Acceso (Login)
El sistema utiliza **JSON Web Tokens (JWT)** para el manejo de sesiones.

- **Endpoint de Login:** `POST /auth/login`
- **Body Esperado:**
  ```json
  {
    "correoInstitucional": "usuario@uni.edu.bo",
    "password": "Password123!"
  }
  ```
- **Respuesta de Éxito (HTTP 200 OK):**
  Devuelve el `accessToken` y los datos del usuario autenticado. El cliente (frontend) debe enviar este token en la cabecera `Authorization: Bearer <token>` en todas las peticiones posteriores.

## 3. Credenciales de Prueba (Entorno de Desarrollo)
Al ejecutar el comando `npm run db:seed`, se genera automáticamente un usuario administrador para pruebas E2E y QA.

| Rol Asignado | Correo Institucional | Contraseña | Propósito |
| :--- | :--- | :--- | :--- |
| **COORDINACION** | `coord@uni.edu.bo` | `Admin123!` | Pruebas de integración globales y carga de estudiantes (TK-16). |
