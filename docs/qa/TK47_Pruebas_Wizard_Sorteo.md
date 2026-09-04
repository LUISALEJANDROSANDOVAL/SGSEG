# TK-47: Matriz de Pruebas Funcionales - Wizard de Sorteo (Ruleta)

## Resumen
Este documento detalla la matriz de pruebas funcionales (Manual / UI) para el Wizard interactivo de Sorteos (Ruleta). El objetivo es certificar que la interfaz respeta las reglas de negocio críticas del sistema SGSEG antes de generar el Acta de Sorteo.

**Responsable de QA:** 
**Fecha de Ejecución:** DD/MM/AAAA
**Versión del Sistema:** v1.0.0

---

## 1. Matriz de Pruebas Funcionales

| ID Caso | Escenario de Prueba | Precondiciones | Pasos de Ejecución | Resultado Esperado (Criterio de Aceptación) | Estado |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **ST-01** | **Validación de Áreas según Pensum** | Estudiante de "Ing. de Sistemas" con Defensa Programada. Hay áreas de "Ing. Industrial" creadas. | 1. Ingresar al Wizard de Sorteo.<br>2. Seleccionar al estudiante.<br>3. Observar la ruleta de Áreas Académicas. | La ruleta **solo** debe renderizar áreas temáticas que pertenezcan a "Ing. de Sistemas". Áreas de otras carreras no deben aparecer en la interfaz. | ⏳ Pendiente |
| **ST-02** | **Filtro de Casos Agotados (Límite 2/2)** | Área seleccionada con 3 casos: Caso A (0/2 usos), Caso B (1/2 usos) y Caso C (2/2 usos - Agotado). | 1. Iniciar la etapa de sorteo de Casos de Estudio.<br>2. Observar la lista de casos que ingresan al motor de la ruleta. | El **Caso C** no debe estar presente en el pool de la ruleta. Solo los Casos A y B participan del sorteo. | ⏳ Pendiente |
| **ST-03** | **Bloqueo por Stock Crítico (Cero casos disponibles)** | Se sorteó un Área donde todos los casos tienen 2/2 usos o están "Inactivos". | 1. Intentar iniciar el Sorteo de Caso tras elegir el Área. | El Wizard debe mostrar un Modal/Alerta indicando: *"Stock crítico agotado. Contacte a Jefatura de Carrera"*. El botón de "Girar Ruleta" debe estar deshabilitado. | ⏳ Pendiente |
| **ST-04** | **Flujo Alternativo: Inasistencia del Estudiante** | Estudiante citado no se presenta al sorteo físico/virtual. | 1. En el paso 1 del Wizard, desmarcar el checkbox "Estudiante Presente".<br>2. Ingresar motivo de inasistencia (Obligatorio).<br>3. Ejecutar sorteo. | El sorteo se ejecuta por el tribunal/coordinador en nombre del alumno. El Acta final refleja la inasistencia y el motivo detallado. | ⏳ Pendiente |
| **ST-05** | **Generación de Token Criptográfico (Happy Path)** | Sorteo ejecutado sin inasistencia y con áreas/casos disponibles. | 1. Girar ruleta de Área.<br>2. Girar ruleta de Caso.<br>3. Finalizar Wizard. | El sistema renderiza el "Acta de Sorteo" y en la parte inferior se muestra un **Token SHA-256** (Ej: `A1B2C3...`) que valida la transparencia del proceso. | ⏳ Pendiente |

---

## 2. Checklist de Validaciones de UI/UX (Frontend)

Además de la matriz funcional lógica, el equipo de pruebas debe validar la experiencia visual de la "Ruleta":

- [ ] **Animación fluida:** La ruleta gira al menos 3 segundos antes de detenerse (sin trabarse).
- [ ] **Efecto de Confeti / Highlight:** Al detenerse la ruleta, el Área/Caso ganador se resalta visualmente en la pantalla para fácil lectura del tribunal y estudiante.
- [ ] **Responsividad:** La ruleta se ve proporcional y los textos son legibles si el sorteo se proyecta en una pantalla grande o se realiza desde una Tablet.
- [ ] **Bloqueo de doble-click:** El botón de "Girar" se deshabilita instantáneamente tras presionarse para evitar múltiples llamadas al servidor.

---
*Fin del Documento TK-47.*
