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
Al ejecutar el comando `npm run db:seed`, se generan automáticamente los usuarios oficiales de prueba para todos los roles institucionales:

| Rol Asignado | Nombre del Usuario | Correo Institucional | Contraseña | Alcance / Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **COORDINACION** | Coordinación Académica | `coord@uni.edu.bo` | `Admin123!` | Acceso global, programación de defensas y embudo. |
| **JEFE_CARRERA** | Ing. Carlos Mendoza | `jefe.sistemas@uni.edu.bo` | `Admin123!` | Exclusivo Ingeniería de Sistemas (Casos y Áreas). |
| **JEFE_CARRERA** | Dr. Roberto Quinteros | `jefe.derecho@uni.edu.bo` | `Admin123!` | Exclusivo Derecho (Casos y Áreas). |
| **SECRETARIADO** | Lic. Ana Flores Pérez | `secretaria@uni.edu.bo` | `Admin123!` | Operación del sorteo digital y emisión de actas. |
| **VICERRECTORADO** | Dra. Beatriz Gutiérrez | `vicerrector@uni.edu.bo` | `Admin123!` | Supervisión general, reportes y exportación CSV. |

Para consultar la guía detallada de flujo de trabajo y pruebas paso a paso por actor, consulte:
📖 [Guía de Acceso, Actores y Credenciales](file:///c:/proyecto%20integrador/SGSEG/docs/guia_accesos_y_actores.md)
