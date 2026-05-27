# 🏆 La Copa Familiar 2026

Quiniela del Mundial 2026 — React + Vite + Supabase, lista para desplegar en Vercel.

---

## 🚀 Pasos para desplegar

### 1) Instalar dependencias

```bash
npm install
```

### 2) Crear proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New Project**
2. Nombre: `copa-familiar-2026` · Region: `us-east-1` · contraseña de BD segura
3. Espera ~2 min a que se cree

### 3) Crear tablas y cargar datos

**Automático en cada deploy.** Los archivos `.sql` de `/supabase/` se aplican solos al inicio del build (`node scripts/migrate.mjs && vite build`). Cada archivo corre una sola vez; el registro vive en la tabla `schema_migrations`.

Para activarlo necesitas la variable `SUPABASE_DB_URL` (la cadena de conexión Postgres directa, no la URL del API):

> Supabase → **Project Settings → Database → Connection string → URI** → cópiala y reemplaza `[YOUR-PASSWORD]` por la contraseña de la BD.

> ⚠️ **Para Vercel usa el POOLER (puerto 6543), no la conexión directa.** La conexión directa (`db.PROYECTO.supabase.co:5432`) es IPv6-only en proyectos nuevos y los build hosts de Vercel son IPv4-only, así que falla silenciosamente. En Supabase → Database → Connection string elige **"Transaction"** o **"Session"** (pooler) y copia esa URL. Debe verse como `postgresql://postgres.PROYECTO:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres`.

Si prefieres correrlo a mano una vez en local:

```bash
SUPABASE_DB_URL="postgresql://postgres:..." npm run migrate
```

> Los partidos de eliminatorias (1/16, octavos, etc.) se insertan después, cuando se conozcan los clasificados — basta con agregar un nuevo `05_*.sql` y desplegar.

### 4) Configurar variables de entorno

En Supabase → **Settings → API**, copia:

- **Project URL** (`https://xxxxx.supabase.co`)
- **anon public key** (`eyJ...`)

Crea un archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 5) Probar localmente

```bash
npm run dev
```

Abre http://localhost:5173 y entra con:

- Usuario: `admin` / Contraseña: `admin123` (acceso total + admin)

### 6) Subir a GitHub

Crea el repo vacío en [github.com/new](https://github.com/new) (nombre: `copa-familiar-2026`, **NO** marques "Initialize with README"), luego:

```bash
git init
git add .
git commit -m "La Copa Familiar 2026 - inicial"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/copa-familiar-2026.git
git push -u origin main
```

### 7) Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New Project**
2. Selecciona el repo `copa-familiar-2026`
3. Framework preset: **Vite** (se detecta solo)
4. En **Environment Variables** agrega:
   - `VITE_SUPABASE_URL` = `https://TU-PROYECTO.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJ...`
   - `SUPABASE_DB_URL` = `postgresql://postgres.TU-PROYECTO:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres` (usa el **pooler** — la conexión directa falla en Vercel por IPv6)
5. **Deploy** → en ~2 min tendrás `copa-familiar-2026.vercel.app`

> Cada `git push` redespliega automáticamente.

#### ¿Las tablas no aparecen después del deploy?

Revisa los logs del build en Vercel y busca las líneas con prefijo `[migrate]`:

- `[migrate] ERROR: SUPABASE_DB_URL no está configurada en Vercel.` → falta la variable, agrégala en Project Settings.
- `[migrate] ERROR: ... ENETUNREACH` o timeout → estás usando la conexión directa (`db.xxx.supabase.co:5432`). Cambia a la URL del **pooler** (puerto 6543).
- `[migrate] ERROR: password authentication failed` → la contraseña del URL está mal. Resetéala en Supabase → Database → Reset database password.
- Sin líneas `[migrate]` en el log → Vercel no está corriendo el script. Verifica que `vercel.json` tenga `"buildCommand": "npm run build"`.

### 8) Agregar jugadores

Desde la app, entra como `admin` → tab **Admin → Usuarios → Agregar jugador**.

O directamente en Supabase con SQL:

```sql
insert into usuarios (nombre, usuario, password, avatar, color) values
  ('Mamá Rosa',  'mama',   '1234', 'MR', '#C53030'),
  ('Papá Luis',  'papa',   '1234', 'PL', '#2B6CB0'),
  ('Tío Carlos', 'carlos', '1234', 'TC', '#276749');
```

---

## 🎮 Cómo funciona

### Para jugadores
- **Tabla** — clasificación en vivo por puntos, pozo total, top 3 con premios (50/30/20%)
- **Mis Apuestas** — selector de fase + grupo, marcador con botones +/−. Las predicciones se guardan automáticamente en Supabase al ingresar ambos goles.
- **Fases** — info de cada fase con sus puntos

### Para el admin (`/admin`)
- **Fases** — abrir/cerrar/bloquear cada fase. Solo la fase **activa** acepta nuevas apuestas.
- **Resultados** — ingresar resultado real de un partido. Al guardar, se recalculan los puntos de **todas** las predicciones de ese partido automáticamente.
- **Usuarios** — agregar, editar, eliminar jugadores y marcar quién pagó.

## 🏅 Sistema de puntos

| Fase | Exacto | Ganador |
|---|---|---|
| Fase de Grupos | 3 | 1 |
| 1/16 de Final | 4 | 2 |
| Octavos | 5 | 2 |
| Cuartos | 6 | 3 |
| Semifinal | 8 | 4 |
| Tercer Puesto | 6 | 3 |
| **Gran Final** | **15** | **7** |

## 📁 Estructura

```
src/
├── lib/
│   ├── supabase.js      # cliente Supabase
│   └── constants.js     # banderas, info de fases, cálculo de puntos
├── context/
│   └── AuthContext.jsx  # login/logout con localStorage
├── pages/
│   ├── Login.jsx
│   ├── MainApp.jsx      # layout con bottom nav
│   └── Admin.jsx        # /admin (protegido por es_admin)
└── components/
    ├── Tabla.jsx
    ├── Apuestas.jsx
    ├── Fases.jsx
    ├── PartidoCard.jsx
    └── ScoreInput.jsx
supabase/
├── 01_schema.sql
├── 02_seed_fases_admin.sql
├── 03_seed_partidos.sql
└── 04_add_email_y_registro.sql
scripts/
└── migrate.mjs            # corre las migraciones en cada deploy
```

## 🤖 Sincronización automática de resultados (ESPN)

Los partidos del Mundial 2026 reales se cargan vía la migración [`supabase/09_partidos_reales_mundial_2026.sql`](supabase/09_partidos_reales_mundial_2026.sql) (todas las horas en UTC-4 Caracas).

La función serverless [`api/sync-partidos.js`](api/sync-partidos.js) consulta el endpoint público de **ESPN** (`site.api.espn.com/.../soccer/fifa.world/scoreboard`), identifica los partidos terminados (`STATUS_FINAL`/`STATUS_FINAL_AET`/`STATUS_FINAL_PEN`) y los guarda en Supabase. El trigger `trg_partido_recalc` recalcula los puntos automáticamente.

> Probado el 27 may 2026 — ESPN devuelve los 100 partidos del Mundial (72 grupos + 28 eliminatorias) en una sola llamada, sin auth y sin cuota documentada.

> **Por qué ESPN y no API-Football:** el plan Free de API-Football solo cubre temporadas 2022–2024 (la 2026 requiere plan pago). ESPN es gratis y cubre 2026 ya. Contrapartida: es un endpoint no oficial, podría romper sin aviso — si pasa, hay que cambiar a TheSportsDB o pagar API-Football.

### 1) Variables de entorno (Vercel → Project Settings → Environment Variables)

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | `https://TU-PROYECTO.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (Supabase → Settings → API). **NO** la anon. |
| `CRON_SECRET` | Cualquier string aleatorio largo (32+ caracteres). Ejemplo: `openssl rand -hex 32`. |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` permite bypass de RLS. **Nunca** la pongas en código del frontend, solo como env var del backend.

### 2) Probar manualmente

```bash
curl -H "Authorization: Bearer TU_CRON_SECRET" \
  https://lacopafamiliar.vercel.app/api/sync-partidos
```

Respuesta esperada antes del torneo (todos `STATUS_SCHEDULED`):

```json
{
  "ok": true,
  "totalFixtures": 100,
  "actualizados": 0,
  "ignorados": 100,
  "noEncontrados": 0
}
```

Cuando empiecen a terminar partidos, `actualizados` reflejará los nuevos resultados ingresados y `detalleActualizados` listará marcadores tipo `"México 2-1 Sudáfrica"`.

### 3) Disparo automático

Como el proyecto está en plan **Hobby** de Vercel (los crons solo corren 1 vez/día), usamos **cron-job.org** (gratis, ilimitado) para la frecuencia real y dejamos el cron de Vercel como respaldo diario.

**Setup principal — cron-job.org (cada 15 min):**

1. Crear cuenta gratis en [cron-job.org](https://cron-job.org).
2. **Cronjobs → Create cronjob**:
   - **Title:** `Sync Mundial 2026`
   - **URL:** `https://lacopafamiliar.vercel.app/api/sync-partidos`
   - **Schedule:** `Every 15 minutes`
3. Pestaña **Advanced**:
   - **Request method:** `GET`
   - **Headers** → add:
     - Header name: `Authorization`
     - Header value: `Bearer TU_CRON_SECRET` (el mismo valor que pusiste en Vercel env var)
4. Pestaña **Notifications** (opcional): activar email si falla 3 veces seguidas para enterarte si ESPN cambia el endpoint.
5. **Save** → el job queda activo.

**Respaldo — Vercel Cron** (ya configurado, 04:00 UTC diario):

Configurado en [`vercel.json`](vercel.json) como `0 4 * * *`. Sirve por si cron-job.org se cae.

### 4) Si ESPN devuelve un nombre nuevo

El job loggea en `detalleNoEncontrados` los equipos que no pudo emparejar. Si aparece algo así, agregar el alias al mapping `TEAM_MAP` en [`api/sync-partidos.js`](api/sync-partidos.js) y re-desplegar.

---

## 🔐 Notas de seguridad

Esta app está pensada para uso familiar/cerrado: las contraseñas se guardan en texto plano en `usuarios.password` y RLS está abierto para `anon`. Para uso público real habría que migrar a Supabase Auth.

---

Mensaje para WhatsApp cuando esté lista:

> 🏆 ¡Abrió la quiniela del Mundial 2026!
>
> Entra desde tu celular: copa-familiar-2026.vercel.app
>
> Tu usuario: *[nombre]*
> Contraseña: *[contraseña]*
>
> Tienes hasta el 11 de junio para poner tus predicciones de la fase de grupos. ¡Suerte! ⚽
