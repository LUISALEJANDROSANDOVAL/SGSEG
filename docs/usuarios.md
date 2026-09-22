# Documentación de Usuarios y Roles - SGSEG

$$\mathbf{ESTADO\ GENERAL\ DEL\ SISTEMA:\ 96.8\%\ TERMINADO\ (OPERATIVO)}$$

> 📌 **Estado de Cumplimiento por Roles:** Jefes de Carrera (100%), Coordinación (100%), Secretaría (100%), Vicerrectorado (100% - Operativo en auditoría/reportes y gestión exclusiva de roles y usuarios), Super Administrador (85%). Para detalles de auditoría consulte [Evaluación de Cumplimiento por Rol](file:///c:/SGSEG/docs/evaluacion_cumplimiento_roles.md).

---

## 1. Roles del Sistema
El sistema cuenta con un control de acceso basado en roles (RBAC) para proteger las diferentes áreas de la aplicación. 

Los roles oficiales y su descripción son:
- **COORDINACION:** Coordinación académica (Gestión general, padrón, programación de defensas y realización de sorteos).
- **SECRETARIADO:** Secretariado académico (Operación del sorteo digital en ruleta, generación de actas y registro de notas).
- **JEFE_CARRERA:** Jefe de carrera (Gestión de casos y áreas de su carrera, y realización de sorteos).
- **VICERRECTORADO:** Vicerrectorado (Auditoría, supervisión y métricas institucionales. **NO puede iniciar sorteos**. Su función activa exclusiva es **añadir roles y usuarios**, principalmente dar de alta a los **Jefes de Carrera**).
- **SUPER_ADMIN:** Administrador técnico (Infraestructura, configuración y contingencia).
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
| **VICERRECTORADO** | Dra. Beatriz Gutiérrez | `vicerrector@uni.edu.bo` | `Admin123!` | Auditoría, supervisión general, reportes CSV (sin inicio de sorteo) y alta de roles/usuarios (Jefes de Carrera). |

Para consultar la guía detallada de flujo de trabajo y pruebas paso a paso por actor, consulte:
📖 [Guía de Acceso, Actores y Credenciales](file:///c:/SGSEG/docs/guia_accesos_y_actores.md)

Para consultar la auditoría de cumplimiento funcional y la lista de tareas pendientes por rol:
📊 [Evaluación de Cumplimiento por Rol y Pendientes](file:///c:/SGSEG/docs/evaluacion_cumplimiento_roles.md)
