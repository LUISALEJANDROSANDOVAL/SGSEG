# 🚀 Guía de Despliegue en Vercel: Base de Datos, Backend y Frontend

Esta guía describe el paso a paso detallado para desplegar la arquitectura completa de **SGSEG** en **Vercel**:
1. **Base de Datos:** Vercel Postgres (Neon Serverless).
2. **Backend:** NestJS como función Serverless en Vercel.
3. **Frontend:** React + Vite (SPA) en Vercel Edge Network.

---

## 🗄️ 1. Base de Datos en Vercel (Vercel Postgres / Neon)

Vercel no aloja contenedores Docker tradicionales de PostgreSQL. En su lugar, ofrece **Vercel Postgres**, un servicio de base de datos relacional serverless gestionado sobre la infraestructura de **Neon**.

### Paso a Paso para Crear la Base de Datos:
1. Inicia sesión en [Vercel Dashboard](https://vercel.com).
2. Ve a la pestaña **Storage** en la parte superior y haz clic en **Create Database**.
3. Selecciona **Postgres** (Neon).
4. Asigna un nombre a la base de datos (ejemplo: `sgseg-db`) y selecciona la región más cercana (ejemplo: `Washington, D.C. (iad1)` o `São Paulo (gru1)`).
5. Acepta los términos y haz clic en **Create**.
6. En la pestaña **.env.local** de la base de datos, copia la cadena de conexión:
   - Variable: `DATABASE_URL` (o `POSTGRES_PRISMA_URL`).
   - Tendrá un formato similar a:
     ```bash
     postgresql://default:xxxxxx@ep-sample-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require
     ```

### Inicializar las Tablas y Vistas en la Nube:
Desde tu terminal local en la carpeta `backend`, ejecuta las migraciones apuntando a esa URL:
```bash
# En Windows PowerShell (dentro de c:\SGSEG\backend):
$env:DATABASE_URL="postgresql://default:xxxxxx@ep-sample-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require"
npx prisma migrate deploy
npx ts-node prisma/apply-views.ts
npm run db:seed
```

---

## 🖥️ 2. Despliegue del Backend (NestJS en Vercel Serverless)

El backend de SGSEG ya cuenta con el adaptador serverless configurado en `backend/api/index.ts` y el archivo de enrutamiento `backend/vercel.json`.

### Configuración del Proyecto en Vercel:
1. En Vercel Dashboard, haz clic en **Add New...** $\to$ **Project**.
2. Selecciona el repositorio `LUISALEJANDROSANDOVAL/SGSEG`.
3. En **Project Name**, coloca: `sgseg-backend`.
4. En **Root Directory**, haz clic en *Edit* y selecciona la carpeta **`backend`**.
5. En **Framework Preset**, selecciona **Other** (o déjalo en automático).
6. **Build Command:** `npm run build`
7. **Output Directory:** `dist`

### Variables de Entorno en Vercel (Project Settings $\to$ Environment Variables):

| Variable | Valor Recomendado | Propósito |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...@...neon.tech/verceldb?sslmode=require` | Conexión con Vercel Postgres |
| `NODE_ENV` | `production` | Modo de producción optimizado |
| `PORT` | `3000` | Puerto interno |
| `JWT_SECRET` | `sgseg_jwt_super_secret_key_prod_2026_xyz` | Clave secreta para tokens JWT |
| `ADMIN_FALLBACK_SECRET` | `SGSEG_FALLBACK_PROD_2026!` | Clave de emergencia para reseteo |
| `CORS_ORIGINS` | `https://tu-frontend.vercel.app` *(o `*` temporalmente)* | Permite peticiones desde el frontend |
| `SMTP_HOST` | `smtp.gmail.com` *(o vacío para simulador)* | Servidor de correo institucional |
| `SMTP_PORT` | `587` | Puerto SMTP |
| `SMTP_SECURE` | `false` | TLS |
| `SMTP_USER` | `tu-correo@utepsa.edu.bo` | Usuario de correo |
| `SMTP_PASS` | `tu-contraseña-de-aplicacion` | Password SMTP |
| `SMTP_FROM` | `UTEPSA Sorteos <sorteos@utepsa.edu.bo>` | Remitente oficial |

8. Haz clic en **Deploy**. Al finalizar, Vercel te dará una URL (ejemplo: `https://sgseg-backend.vercel.app`).

---

## 🌐 3. Despliegue del Frontend (React 19 + Vite en Vercel)

El frontend de SGSEG incluye el archivo `frontend/vercel.json` con la regla de reescritura necesaria para que React Router (SPA) funcione correctamente en rutas directas como `/sorteo`, `/casos`, `/estudiantes`, etc.

### Configuración del Proyecto en Vercel:
1. En Vercel Dashboard, haz clic en **Add New...** $\to$ **Project**.
2. Selecciona el mismo repositorio `LUISALEJANDROSANDOVAL/SGSEG`.
3. En **Project Name**, coloca: `sgseg-frontend`.
4. En **Root Directory**, haz clic en *Edit* y selecciona la carpeta **`frontend`**.
5. En **Framework Preset**, Vercel detectará automáticamente **Vite**.
6. **Build Command:** `npm run build`
7. **Output Directory:** `dist`

### Variables de Entorno en Vercel (Project Settings $\to$ Environment Variables):

| Variable | Valor | Propósito |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://sgseg-backend.vercel.app` | URL de tu backend desplegado en el Paso 2 |
| `VITE_PINATA_JWT` | `eyJhbGciOiJIUzI1Ni...` | Token JWT de autenticación de Pinata IPFS |
| `VITE_PINATA_GATEWAY` | `https://amethyst-adorable-planarian-555.mypinata.cloud/ipfs/` | Gateway de acceso a documentos IPFS |

8. Haz clic en **Deploy**. Al finalizar, Vercel te asignará tu dominio público (ejemplo: `https://sgseg-frontend.vercel.app`).

---

## 🔒 4. Paso Final de Sincronización CORS

Una vez que tengas la URL final de tu frontend (ej. `https://sgseg-frontend.vercel.app`):
1. Ve a los ajustes de tu proyecto de backend en Vercel (**Settings** $\to$ **Environment Variables**).
2. Actualiza la variable `CORS_ORIGINS` con la URL de tu frontend:
   ```bash
   CORS_ORIGINS="https://sgseg-frontend.vercel.app"
   ```
3. Haz un **Redeploy** del backend para que tome el nuevo origen permitido.

---

## 💡 Consideraciones Técnicas de Vercel Serverless

- **Sorteo en Vivo (Celular del Estudiante):**
  Las funciones serverless de Vercel no mantienen conexiones WebSocket abiertas indefinidamente. Para solventar esto, el módulo de sorteo en vivo (`/sorteo/en-vivo`) fue implementado con un mecanismo dual que incluye **Polling HTTP cada 1.5s**, garantizando sincronización en tiempo real incluso en arquitecturas serverless.
- **Tiempos de Ejecución (Timeouts):**
  En el plan gratuito (Hobby) de Vercel, las funciones serverless tienen un límite de ejecución de 10 segundos por petición. La generación de Actas en PDF (`pdfkit`) y los endpoints de sorteo tardan menos de 400ms, operando con holgura dentro de dicho margen.
