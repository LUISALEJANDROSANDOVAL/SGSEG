# 🔐 SGSEG — Credenciales y Accesos Oficiales del Sistema

Este documento contiene la lista completa de cuentas de usuario sembradas en la base de datos del **Sistema de Gestión y Sorteo de Exámenes de Grado (SGSEG)** para pruebas, auditoría y operación en entornos de desarrollo y producción (Vercel).

---

## 🔑 Clave de Acceso Universal (Por Defecto)

Todas las cuentas iniciales han sido creadas con la misma contraseña institucional unificada:

> **Contraseña:** `Admin123!`

*(Cada usuario puede actualizar su contraseña desde su perfil una vez iniciada la sesión).*

---

## 🏛️ 1. Usuarios Institucionales y Administrativos

Estos usuarios tienen roles transversales para la administración, supervisión, gestión académica y ejecución de sorteos.

| Rol | Nombre Completo | Correo Institucional / Login | Contraseña | Alcance y Responsabilidad |
| :--- | :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | Admin General SGSEG | `admin@uni.edu.bo` | `Admin123!` | Control total del sistema, gestión de usuarios, auditoría y configuraciones globales. |
| **COORDINACION** | Coordinación Académica | `coord@uni.edu.bo` | `Admin123!` | Gestión de convocatorias, seguimiento de procesos y supervisión de exámenes de grado. |
| **COORDINACION** | Coordinador Académico | `coordinador@utepsa.edu.bo` | `Admin123!` | Coordinador alterno institucional UTEPSA. |
| **SECRETARIADO** | Ana Flores Pérez | `secretaria@uni.edu.bo` | `Admin123!` | Operación y ejecución de sorteos de áreas y casos en vivo, generación de actas. |
| **SECRETARIADO** | Ana Secretaría | `secretaria@utepsa.edu.bo` | `Admin123!` | Operadora alterna institucional UTEPSA. |
| **VICERRECTORADO** | Beatriz Gutiérrez Salinas | `vicerrector@uni.edu.bo` | `Admin123!` | Auditoría ejecutiva, consulta de reportes, actas y trazabilidad institucional. |
| **REGISTRO** | Hernán Daza Cuéllar | `registro@uni.edu.bo` | `Admin123!` | Habilitación de estudiantes, revisión de requisitos y validación de expedientes. |
| **DEFENSA** | Marcela Justiniano Dorado | `defensas@uni.edu.bo` | `Admin123!` | Programación de fechas de defensa, tribunales examinadores y registro de notas. |

---

## 🎓 2. Jefes de Carrera (Acceso Exclusivo por Carrera)

Los Jefes de Carrera tienen el rol **`JEFE_CARRERA`** y tienen acceso enfocado a su respectiva carrera (gestión de áreas académicas, banco de casos de estudio y visualización de sus postulantes).

### A. Facultad de Ciencia y Tecnología (FCT)

| Carrera | Jefe de Carrera | Correo Institucional / Login | Contraseña |
| :--- | :--- | :--- | :--- |
| **Sistemas** | Carlos Mendoza Vargas | `jefe.sistemas@uni.edu.bo` | `Admin123!` |
| **Redes y Telecomunicaciones** | Rolando Dany Vaca Díez Mercado | `jefe.redes@uni.edu.bo` | `Admin123!` |
| **Industrial y Comercial** | Juan Pablo Aguilera Justiniano | `jefe.industrial@uni.edu.bo` | `Admin123!` |
| **Mecánica** | Oscar Justiniano Ribera | `jefe.mecanica@uni.edu.bo` | `Admin123!` |
| **Electrónica y Sistemas** | Jorge Eduardo Roca Salvatierra | `jefe.electronica@uni.edu.bo` | `Admin123!` |
| **Ingeniería Eléctrica** | Mario Alberto Chávez Gutiérrez | `jefe.electrica@uni.edu.bo` | `Admin123!` |

### B. Facultad de Ciencias Empresariales (FCE)

| Carrera | Jefe de Carrera | Correo Institucional / Login | Contraseña |
| :--- | :--- | :--- | :--- |
| **Ingeniería Comercial** | Claudia Patricia Arteaga Mendoza | `jefe.comercial@uni.edu.bo` | `Admin123!` |
| **Administración General** | Fernando Suárez Morales | `jefe.administracion@uni.edu.bo` | `Admin123!` |
| **Marketing y Publicidad** | Jimena Andrea Paz Zeballos | `jefe.marketing@uni.edu.bo` | `Admin123!` |
| **Ingeniería Financiera** | Marco Antonio Claros Hurtado | `jefe.financiera@uni.edu.bo` | `Admin123!` |
| **Contaduría Pública** | Rosario Méndez Ortiz | `jefe.contaduria@uni.edu.bo` | `Admin123!` |
| **Comercio Internacional** | Daniel Eduardo Torrico Alarcón | `jefe.comercio@uni.edu.bo` | `Admin123!` |
| **Turismo** | Verónica Cecilia Banegas Dorado | `jefe.turismo@uni.edu.bo` | `Admin123!` |
| **Comunicación Estratégica y Digital** | Sergio Andrés Villarroel Cortez | `jefe.comunicacion@uni.edu.bo` | `Admin123!` |

### C. Facultad de Ciencias Jurídicas y Sociales (FCJS)

| Carrera | Jefe de Carrera | Correo Institucional / Login | Contraseña |
| :--- | :--- | :--- | :--- |
| **Derecho** | Roberto Quinteros Alarcón | `jefe.derecho@uni.edu.bo` | `Admin123!` |
| **Psicología** | Mariana Sofía Gutiérrez Torrico | `jefe.psicologia@uni.edu.bo` | `Admin123!` |
| **Relaciones Internacionales** | Alejandro Bruno Melgar Justiniano | `jefe.rrii@uni.edu.bo` | `Admin123!` |

---

## 📌 Guía Rápida para Pruebas en Vercel

1. **Prueba de Administración Completa:** Inicia sesión con `admin@uni.edu.bo` / `Admin123!`.
2. **Prueba de Ejecución de Sorteos en Vivo:** Inicia sesión con `secretaria@uni.edu.bo` / `Admin123!`.
3. **Prueba de Carga y Aprobación de Casos de Estudio:** Inicia sesión con `jefe.sistemas@uni.edu.bo` / `Admin123!`.
4. **Prueba de Supervisión y Auditoría:** Inicia sesión con `vicerrector@uni.edu.bo` / `Admin123!`.
