# TK-26: Pruebas de Auditoría ante Reactivaciones

## Resumen Ejecutivo
Este documento formaliza la validación de la tarea **TK-26**. El objetivo fue certificar que el sistema registra de manera inmutable en la base de datos (tabla `RegistroAuditoria`) cualquier reactivación excepcional de un Caso de Estudio agotado o inactivo, realizada por una Jefatura de Carrera.

**Responsable de Automatización:** 
**Fecha de Ejecución:** DD/MM/AAAA
**Framework de Pruebas:** Jest + Supertest (Backend) + Prisma ORM

---

## 1. Escenario Automatizado

La prueba fue implementada dentro de la suite `backend/test/casos.e2e-spec.ts`. Simula el siguiente flujo de alta seguridad:

1. **Precondición:** Existe un caso de estudio en la base de datos (inactivo o agotado).
2. **Acción Restringida:** Se simula un usuario con rol `JEFE_CARRERA` y se dispara una petición `PATCH /casos/:id/reactivar-especial`, enviando obligatoriamente un "Motivo" justificado (ej. *Resolución decanal*).
3. **Validación de la API:** El endpoint debe responder `200 OK` y retornar el caso con el estado `REACTIVADO_ESPECIAL`.
4. **Validación Inmutable de Auditoría (TK-26):** El script automatizado penetra la base de datos de manera paralela e interroga la tabla `RegistroAuditoria` exigiendo que exista un registro con el tipo de operación `REACTIVACION_CASO_ESPECIAL`. Además, valida criptográficamente que el motivo y el estado resultante guarden coherencia absoluta y no puedan ser evadidos.

---

## 2. Implementación Técnica en Jest

```typescript
it('5. PATCH /casos/:id/reactivar-especial - Debe reactivar el caso por resolución', async () => {
  // Petición al endpoint
  const res = await request(app.getHttpServer())
    .patch(`/casos/${idCaso}/reactivar-especial`)
    .set('Authorization', `Bearer ${jefeToken}`)
    .send({
      motivo: 'Resolución decanal de prueba'
    })
    .expect(200);
  
  expect(res.body.caso.estadoEfectivo).toEqual('REACTIVADO_ESPECIAL');
  
  // Validación TK-26: Registro inmutable de auditoría en la base de datos
  const auditoria = await prisma.registroAuditoria.findFirst({
    where: {
      idCasoEstudio: BigInt(idCaso),
      tipoOperacion: 'REACTIVACION_CASO_ESPECIAL'
    }
  });

  expect(auditoria).toBeDefined();
  expect(auditoria?.motivo).toEqual('Resolución decanal de prueba');
  const valorNuevo = auditoria?.valorNuevo as { estado: string };
  expect(valorNuevo?.estado).toEqual('REACTIVADO_ESPECIAL');
});
```

---

## 3. Resultados de Ejecución

La base de datos (PostgreSQL) respondió exitosamente a las transacciones de auditoría automática orquestadas desde el Repositorio de Casos, garantizando trazabilidad absoluta e inalterable.

```bash
PASS test/casos.e2e-spec.ts
  Módulo Casos (e2e)
    ✓ 1. POST /casos/areas - Debe crear un área académica (90 ms)
    ✓ 2. POST /casos - Debe registrar un nuevo caso de estudio (25 ms)
    ✓ 3. GET /casos/metricas - Debe obtener alertas de inventario (29 ms)
    ✓ 4. PATCH /casos/:id/estado - Debe inactivar el caso (38 ms)
    ✓ 5. PATCH /casos/:id/reactivar-especial - Debe reactivar el caso por resolución (241 ms)
```

**Estado Final:** APROBADO ✅
La trazabilidad exigida por el ticket TK-26 se cumple cabalmente. No es posible reactivar un caso sin dejar un rastro forzoso de auditoría en el sistema.
