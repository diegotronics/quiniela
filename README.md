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

En **SQL Editor** de Supabase, ejecuta en orden:

1. `supabase/01_schema.sql` — crea tablas + RLS abierto
2. `supabase/02_seed_fases_admin.sql` — inserta las 7 fases y al usuario `admin / admin123`
3. `supabase/03_seed_partidos.sql` — inserta los 72 partidos de la fase de grupos

> Los partidos de eliminatorias (1/16, octavos, etc.) se insertan después, cuando se conozcan los clasificados.

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
5. **Deploy** → en ~2 min tendrás `copa-familiar-2026.vercel.app`

> Cada `git push` redespliega automáticamente.

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
└── 03_seed_partidos.sql
```

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
