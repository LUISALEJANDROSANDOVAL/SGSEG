# Informe de QA - TK-12: Pruebas de penetración, aislamiento y apoyo en Login

**Responsable:** Jose Carlos Rojas (QA & Documentación)  
**Fecha:** 31 de Agosto de 2026 (Ejecución: 1 de Septiembre 2026)
**Estado de la Prueba:** ✅ Aprobado

---

## 1. Validación de Endpoints Protegidos (Sin Token JWT)

**Objetivo:** Comprobar que los endpoints protegidos rechacen peticiones cuando no se envía un token de autenticación.
**Resultado Esperado:** HTTP 401 Unauthorized.

### Evidencia:
*(Captura de pantalla de la terminal mostrando la PRUEBA 1)*

```text
--- PRUEBA 1: Acceso a /academia/carreras SIN TOKEN ---
Estado HTTP: 401 Unauthorized
Respuesta del servidor: { message: 'Unauthorized', statusCode: 401 }
✅ PRUEBA 1 PASADA EXITOSAMENTE (Se bloqueó el acceso).
```

**Comentarios:**
- El sistema de seguridad global está bloqueando correctamente las peticiones que no incluyen un JWT válido. El servidor responde con el código 401 Unauthorized, tal y como se esperaba.

---

## 2. Aislamiento de Privilegios (Rol: Jefe de Carrera)

**Objetivo:** Validar que un Jefe de Carrera no pueda crear ni modificar áreas o planes (pensums) asignándolos a una carrera (carreraId) que no es la suya.
**Resultado Esperado:** HTTP 403 Forbidden ("No tiene permisos...").

### Evidencia:
*(Captura de pantalla de la terminal mostrando la PRUEBA 2)*

```text
--- PRUEBA 2: Crear área en otra carrera (Aislamiento) ---
Iniciando sesión como Jefe de Carrera...
✅ Token obtenido correctamente.
Intentando crear un área para una carrera ajena...
Estado HTTP: 403 Forbidden
Respuesta del servidor: {
  message: 'No tiene permisos para agregar áreas a otra carrera',
  error: 'Forbidden',
  statusCode: 403
}
✅ PRUEBA 2 PASADA EXITOSAMENTE (Se denegó el permiso).
```

**Comentarios:**
- El `JwtAuthGuard` y las validaciones a nivel del controlador `academia.controller.ts` funcionan correctamente. Un Jefe de Carrera no puede alterar ni inyectar datos en una carrera ajena. El servidor responde con un 403 Forbidden para denegar el acceso.

---

## 3. Conclusión Final

El código ha sido evaluado mediante pruebas automatizadas locales, comprobando los mecanismos de seguridad y autorización sobre los módulos del sistema. No se encontraron fallas ni brechas de seguridad en el aislamiento de privilegios para el rol de Jefe de Carrera. Ambos escenarios arrojaron los códigos de estado HTTP de rechazo correctos (401 y 403).

**Resultado Final:** ✅ Aprobado
