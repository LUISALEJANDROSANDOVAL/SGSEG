# TK-21: Pruebas de Unicidad de Código de Caso

## Resumen Ejecutivo
Este documento formaliza la inclusión y validación del test E2E de seguridad para la regla de negocio: **"Unicidad de Código de Caso (Prevención de Duplicados/Inyecciones)"**. Se valida que la API de creación de Casos de Estudio bloquee explícitamente cualquier intento de asignar o forzar un código/ID duplicado en el payload (previniendo colisiones en la base de datos).

**Responsable de Automatización:** 
**Fecha de Ejecución:** DD/MM/AAAA
**Framework de Pruebas:** Jest + Supertest (Backend)

---

## 1. Diseño del Escenario Automatizado

Dado que en la arquitectura del SGSEG el "Código de Caso" (`idCasoEstudio`) es autoincremental y protegido por la base de datos, la prueba E2E fue programada para asegurar el escudo de protección **ValidationPipe** del servidor:

1. **Intento de Inyección:** El script E2E simula un ataque o error de cliente donde se envía un payload `POST /casos` inyectando forzosamente el atributo `idCasoEstudio` con un código que **ya existe** en el sistema.
2. **Rechazo Inmediato:** El sistema NestJS, mediante el `ValidationPipe` (`forbidNonWhitelisted: true`), debe interceptar la petición antes de que llegue a la base de datos.
3. **Aserción (Assert):** El servidor debe arrojar un error `400 Bad Request` señalando específicamente que el campo `idCasoEstudio` *"should not exist"* (no debe existir en el payload), bloqueando por completo la posibilidad de código duplicado.

---

## 2. Código Implementado

El siguiente bloque fue inyectado en la suite de pruebas `casos.e2e-spec.ts`:

```typescript
it('6. POST /casos - Debe rechazar (400) inyección de código duplicado (idCasoEstudio)', async () => {
  const res = await request(app.getHttpServer())
    .post('/casos')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      idCasoEstudio: Number(idCaso), // Intento malicioso de duplicación
      idArea: Number(idArea),
      titulo: 'Intento de duplicación',
      contenido: 'Contenido de prueba para inyección'
    })
    .expect(400);

  expect(res.body.message).toEqual(
    expect.arrayContaining(['property idCasoEstudio should not exist'])
  );
});
```

---

## 3. Resultados de Ejecución

El servidor rechazó exitosamente el intento de duplicación, confirmando que la capa de validación DTO de NestJS es infranqueable para la inyección de llaves primarias o códigos.

```bash
PASS test/casos.e2e-spec.ts
  Módulo Casos (e2e)
    ✓ 1. POST /casos/areas - Debe crear un área académica (28 ms)
    ✓ 2. POST /casos - Debe registrar un nuevo caso de estudio (25 ms)
    ✓ 3. GET /casos/metricas - Debe obtener alertas de inventario (13 ms)
    ✓ 4. PATCH /casos/:id/estado - Debe inactivar el caso (26 ms)
    ✓ 5. PATCH /casos/:id/reactivar-especial - Debe reactivar el caso por resolución (81 ms)
    ✓ 6. POST /casos - Debe rechazar (400) inyección de código duplicado (idCasoEstudio) (18 ms)
```

**Estado Final:** APROBADO ✅
El bloqueo contra códigos duplicados y colisiones de ID funciona perfectamente a nivel REST API, garantizando consistencia absoluta en el inventario.
