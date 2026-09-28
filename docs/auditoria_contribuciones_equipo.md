# 📊 SGSEG — Auditoría Forense de Contribuciones del Equipo (Git Scan)

**Universidad Tecnológica Privada de Santa Cruz (UTEPSA)**  
*Sistema de Gestión de Sorteos de Grado, Casos de Estudio y Defensas Finales*

---

## 🏆 1. Veredicto Ejecutivo: ¿Quién Hizo Más?

A partir del escaneo exhaustivo del historial de Git (`git log`, `git shortlog`, `git numstat`) y del análisis forense de autoría línea por línea sobre el código fuente vivo en la rama principal (`git blame` en HEAD), se concluye de forma objetiva, cuantitativa y cualitativa lo siguiente:

> ### 🥇 **Jorge Ayala** es la persona que más contribuyó al repositorio en volumen, arquitectura, cobertura de pruebas y complejidad troncal de negocio (**58.55% del código activo del sistema**).

### 🏅 Clasificación General y Roles en el Proyecto

| Posición | Desarrollador | Identificadores en Git | Commits | Líneas Vivas en HEAD | % Autoría Activa | Rol Principal Demostrado |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| 🥇 **1°** | **Jorge Ayala** | `Jorge Ayala` | **39** | **28,908** | **58.55%** | **Líder Arquitectónico Backend & Troncal Full-Stack** |
| 🥈 **2°** | **Luis Alejandro Sandoval** | `LUISALEJANDROSANDOVAL`<br>`Luis Alejandro Sandoval` | **24** | **9,274** | **18.78%** | **Owner del Repositorio, DevOps / Infra & Integración** |
| 🥉 **3°** | **David Arnez** | `arnez69`<br>`arnez60` | **29** | **9,087** | **18.40%** | **Líder Frontend & Experiencia de Usuario (UI)** |
| 🎖️ **4°** | **José Carlos Rojas** | `josecadev` | **8** | **2,061** | **4.17%** | **Ingeniero de QA / Testing E2E & Soporte Backend** |
| — | *Otros / Archivos de Configuración* | `Config` | — | 46 | 0.09% | Archivos base |
| **TOTAL** | **Equipo SGSEG (4 Desarrolladores)** | — | **100** | **49,376** | **100.0%** | **10 Módulos Operativos (90.1% Cumplimiento)** |

---

## 📊 2. Matriz Cuantitativa Desglosada por Capa Arquitectónica

La siguiente tabla refleja exactamente cuántas líneas de código que están **actualmente vivas y operativas en el proyecto** pertenecen a cada desarrollador (escaneado con `git blame` sobre los archivos fuente de cada carpeta, excluyendo `package-lock.json` y `pnpm-lock.yaml`):

```
Distribución del Código Vivo en el Repositorio (HEAD):
Jorge Ayala:             █████████████████████████████▌ 58.55% (28,908 líneas)
Luis Alejandro Sandoval: █████████▍ 18.78% (9,274 líneas)
David Arnez:             █████████▏ 18.40% (9,087 líneas)
José Carlos Rojas:       ██▏ 4.17% (2,061 líneas)
```

### Tabla de Desglose de Líneas Vivas por Carpeta:

| Desarrollador | Backend (`/src`) | Base de Datos / Seeds (`/prisma`) | Pruebas E2E (`/test`) | Frontend UI (`/src`) | Documentación (`/docs`) | DevOps & Config (Raíz) | Total Líneas Vivas |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Jorge Ayala** | **10,574** | **8,343** | **1,872** | 6,021 | **2,004** | 94 | **28,908** |
| **Luis Alejandro Sandoval**| 2,263 | 42 | 29 | 6,132 | 402 | **406** | **9,274** |
| **David Arnez** | 503 | 21 | 0 | **6,648** | 1,861 | 54 | **9,087** |
| **José Carlos Rojas** | 299 | 130 | 933 | 7 | 692 | 0 | **2,061** |
| **TOTAL** | **13,639** | **8,536** | **2,834** | **18,808** | **4,959** | **554** | **49,376** |

---

## 📈 3. Histórico Acumulado de Git (`git log` y `git numstat`)

Analizando todo el histórico de commits (incluyendo código refactorizado o reemplazado durante el ciclo de vida del proyecto):

| Desarrollador | Commits | Líneas Añadidas | Líneas Borradas | Diferencial Neto | Archivos Únicos Tocados | Primer Commit | Último Commit |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Jorge Ayala** | **39** | 45,771 | 17,288 | **+28,483** | **176 archivos** | 2026-08-27 | 2026-09-26 |
| **David Arnez** | **29** | 21,638 | 19,854 | +1,784 | 138 archivos | 2026-08-25 | 2026-09-26 |
| **Luis Alejandro Sandoval**| **24** | 51,997* | 3,566 | +48,431* | 139 archivos | 2026-08-25 | 2026-09-26 |
| **José Carlos Rojas** | **8** | 2,227 | 265 | +1,962 | 41 archivos | 2026-09-02 | 2026-09-25 |

*\*Nota técnica:* Las adiciones brutas de Luis Alejandro Sandoval incluyen la inicialización del frontend y del árbol de dependencias `pnpm-lock.yaml`/`package.json`. Al filtrar archivos lock, su volumen neto de código puro añadido es de **13,253 líneas**.

---

## 🔍 4. Análisis Cualitativo Detallado por Desarrollador

### 🥇 1. Jorge Ayala — Líder Arquitectónico y Troncal Full-Stack (1° Lugar)
* **Porcentaje del Sistema:** **58.55%**
* **Commits:** 39
* **Aportes Clave:**
  1. **Arquitectura Base del Backend:** Creación de la migración inicial de Prisma (`e9ea9b5`), estructura de módulos de NestJS (`6a3f560`), configuración de Prisma 7 con `@prisma/adapter-pg` y serialización de BigInt (`a1c6ce2`).
  2. **Seguridad y RBAC:** Autenticación JWT real, persistencia de sesión, módulo global de JWT y guards de roles (`6379769`, `22f4a0b`).
  3. **Módulos Troncales de Negocio:**
     - **Módulo de Casos:** Lógica de stock crítico, límite estricto de 2 usos y reactivación especial por Jefe de Carrera (`99e5481`, `f7145ed`).
     - **Módulo de Sorteos:** Algoritmo CSPRNG criptográficamente seguro en dos fases (Área ➔ Caso), emisión de actas con hash inmutable SHA-256 (`641254e`, `f66f1e5`).
     - **Módulo de Defensas:** Programación y embudo de estados para coordinación (`235cdaf`).
     - **Módulo de Reportes:** Generación de actas PDF, notificaciones y métricas consolidadas (`6439753`, `2d3f096`).
  4. **Base de Datos y Poblamiento Oficial:** Diseñó e implementó los seeders masivos de datos para 17 carreras (`b528c90`, `30055d5`, `acde172`, `seed-defensas-todas-carreras.ts`).
  5. **Pruebas y Documentación:** Es el autor de 1,872 líneas de pruebas automatizadas y del manual oficial de usuario del sistema (`ec78d72`, `bd7cbed`).

---

### 🥈 2. Luis Alejandro Sandoval — Owner del Repositorio, DevOps & Despacho (2° Lugar)
* **Porcentaje del Sistema:** **18.78%**
* **Commits:** 24
* **Aportes Clave:**
  1. **Fundador del Repositorio:** Creador del repositorio oficial en GitHub (`LUISALEJANDROSANDOVAL/SGSEG`) e iniciador del proyecto (`0805f99`, `1d1c45a`).
  2. **Infraestructura y DevOps (Railway / Docker / Nginx):**
     - Orquestación con `docker-compose.yml` (`POSTGRES_DB`, red interna).
     - Configuración de `Dockerfile` para frontend con Nginx multi-stage build.
     - Resolución de upstream dinámico con resolvers locales (`127.0.0.11`) y sustitución con `envsubst` para despliegues estables en Railway (`fc52f2a`, `3018b9f`, `32a24eb`).
  3. **Despacho Oficial de Notificaciones (SMTP):** Implementó en `MailerService` el despacho de correos reales vía SMTP con soporte dual de correo institucional y personal, adjunto en memoria de Actas PDF y simulador automático (`19006f2`).
  4. **Frontend Integrador:** Construyó la interfaz del entorno de Jefe de Carrera, correcciones de navegación, alineación visual institucional del login y panel de sorteo (`216fd35`, `1ed8f26`, `ea958ac`, `59f6cf2`).

---

### 🥉 3. David Arnez — Especialista en Frontend y Experiencia de Usuario (3° Lugar)
* **Porcentaje del Sistema:** **18.40%**
* **Commits:** 29
* **Aportes Clave:**
  1. **N° 1 en Líneas Vivas de Frontend:** Posee **6,648 líneas activas en `/frontend`**, superando a todos los demás desarrolladores en código UI.
  2. **Componente de la Ruleta Dinámica (`Sorteo.tsx`):**
     - Desarrolló el flujo de sorteo interactivo en 4 pasos con `RuletaCanvas` para proyección en sala y switch de asistencia (`92a2eb0`, `894c9e5`).
  3. **Identidad Visual UTEPSA:**
     - Lideró la estandarización del diseño institucional corporativo (bordes rectangulares, modales, formularios, perfil de usuario y login institucional) (`540cc76`, `e01f7a0`, `modal-editar-perfil.tsx`).
  4. **Módulo de Estudiantes (UI):** Formularios de alta manual de estudiantes y tablas interactivas (`5897c83`, `a31cc75`).
  5. **Arquitectura Interactiva:** Autor del visor documental [`docs/arquitectura-interactiva.html`](file:///c:/SGSEG/docs/arquitectura-interactiva.html) (1,861 líneas HTML/CSS/JS).

---

### 🎖️ 4. José Carlos Rojas (josecadev) — Aseguramiento de Calidad (QA) y Testing (4° Lugar)
* **Porcentaje del Sistema:** **4.17%**
* **Commits:** 8
* **Aportes Clave:**
  1. **Enfoque Especializado en QA (Quality Assurance):** Casi el **50% de sus contribuciones** fueron suites de pruebas E2E y documentación de calidad.
  2. **Tickets de Seguridad y Auditoría:**
     - Ticket **TK-12**: Blindaje de seguridad (`a92e445`).
     - Ticket **TK-16**: Auditoría forense de estudiantes y trazabilidad (`72aa21b`, `tk16-auditoria-estudiantes.e2e-spec.ts`).
     - Ticket **TK-20**: Especificación técnica de usuarios y permisos.
  3. **Módulo 3 (Importador Masivo):** Lógica del procesamiento por lotes para estudiantes y separación de correos institucional/personal (`4a167cf`).
  4. **Documentación de Pruebas:** Redacción de los reportes formales de QA en [`docs/qa`](file:///c:/SGSEG/docs/qa) (`b23dcd1`).

---

## ⚖️ 5. Conclusión y Síntesis Final

Si se evalúa:
1. **Volumen de código activo:** **Jorge Ayala** lidera con **28,908 líneas (58.55%)**, seguido de cerca por **Luis Sandoval (18.78%)** y **David Arnez (18.40%)**.
2. **Número de commits:** **Jorge Ayala** lidera con **39 commits**, seguido de **David Arnez (29 commits)** y **Luis Sandoval (24 commits)**.
3. **Complejidad del Backend y Base de Datos:** **Jorge Ayala** desarrolló casi el 80% de la lógica de negocio, Prisma y PostgreSQL.
4. **Infraestructura, DevOps y Despliegue Cloud:** **Luis Alejandro Sandoval** fue el responsable principal del despliegue Docker y Railway.
5. **Componentes visuales y Frontend interactivo:** **David Arnez** es el desarrollador con mayor cantidad de código frontend vivo (6,648 líneas).
6. **Aseguramiento de Calidad (QA):** **José Carlos Rojas** concentró su esfuerzo en pruebas E2E y validación de seguridad.

> **Dictamen Definitivo:**  
> **Jorge Ayala** fue el desarrollador que **más trabajo y código aportó al repositorio**, concentrando más de la mitad de toda la solución tecnológica del SGSEG.
