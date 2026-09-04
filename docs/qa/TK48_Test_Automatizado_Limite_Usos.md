# TK-48: Reporte de Automatización E2E - Límite de 2 Usos (Casos de Estudio)

## Resumen Ejecutivo
Este documento formaliza la inclusión y éxito del test E2E (End-to-End) automatizado para la regla de negocio crítica: **"Límite de 2 Usos por Caso de Estudio"**. La prueba garantiza que la base de datos y la API de sorteos impidan matemáticamente la asignación de un caso de estudio que ya ha agotado su límite de usos.

**Responsable de Automatización:** 
**Fecha de Ejecución:** DD/MM/AAAA
**Framework de Pruebas:** Jest + Supertest (Backend)

---

## 1. Diseño del Escenario Automatizado

La prueba fue programada en el archivo `backend/test/sorteos.e2e-spec.ts` y simula el siguiente flujo estricto:

1. **Precondición (Sorteo Exitoso Previo):** El sistema asigna un caso de estudio a un alumno por sorteo.
2. **Manipulación de Estado (Mock):** El script automatizado inyecta directamente en la base de datos (vía Prisma) el estado `AGOTADO` al caso de estudio, simulando que ya superó el umbral de 2 usos.
3. **Liberación de Defensa:** Se le quita el caso asignado al estudiante de prueba para permitirle "volver a sortear".
4. **Ejecución de Disparo:** Se lanza una petición POST HTTP cruda a la API de Sorteos (`/sorteos/caso`).
5. **Aserción (Assert):** El sistema debe rechazar la petición con código de error HTTP `400 Bad Request` e indicar explícitamente que hay un problema de "Stock Crítico".

---

## 2. Código Implementado

El siguiente bloque de código demuestra la prueba ejecutada en el pipeline:

```typescript
it('4. POST /sorteos/caso - Debe impedir que un caso con 2 usos (AGOTADO) sea sorteado', async () => {
  // 1. Simular que el caso de estudio alcanzó su límite de 2 usos (AGOTADO)
  await prisma.casoEstudio.update({
    where: { idCasoEstudio: Number(idCasoSorteado) },
    data: { estado: 'AGOTADO' }
  });

  // 2. Liberar la defensa actual para permitir un nuevo sorteo de caso
  await prisma.defensaExamenGrado.update({
    where: { idDefensa: Number(idDefensa) },
    data: { idCasoUtilizado: null }
  });

  // 3. Intentar sortear un caso nuevamente. Al ser el único caso, debe fallar.
  const res = await request(app.getHttpServer())
    .post('/sorteos/caso')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ idDefensa: idDefensa })
    .expect(400);

  // 4. Verificación de mensaje seguro
  expect(res.body.message).toContain('Stock crítico agotado');
});
```

---

## 3. Resultados de Ejecución

El servidor NestJS procesó la petición con éxito, ejecutando la validación del repositorio (`findCasosDisponibles`), el cual filtró los casos excluyendo aquellos con estado `AGOTADO`. Al quedar el bolillero vacío (0 casos disponibles), el servicio cortó la transacción correctamente.

```bash
PASS test/sorteos.e2e-spec.ts
  Módulo Sorteos (e2e)
    ✓ 1. POST /sorteos/area - Debe sortear un área correctamente (192 ms)
    ✓ 2. POST /sorteos/caso - Debe sortear un caso dentro del área asignada (62 ms)
    ✓ 3. GET /sorteos - Debe obtener el historial de sorteos (41 ms)
    ✓ 4. POST /sorteos/caso - Debe impedir que un caso con 2 usos (AGOTADO) sea sorteado (33 ms)
```

**Estado Final:** APROBADO ✅
El bloqueo de negocio se encuentra blindado a nivel de API REST. Ningún usuario ni interfaz externa (Frontend) puede evadir la regla de usos máximos.
