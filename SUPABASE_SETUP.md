# Conectar PARFECT a la nube (Supabase)

Esto da: cuentas reales, datos que no se pierden (entras desde cualquier teléfono) y parties en tiempo real confiables. Toma ~5 minutos. **Gratis** para empezar.

## Pasos

1. **Crea la cuenta** en https://supabase.com → "Start your project" (puedes entrar con Google/GitHub).

2. **Nuevo proyecto**:
   - Nombre: `parfect`
   - Database Password: inventa una y **guárdala** (no la necesitas para la app, pero no la pierdas).
   - Region: la más cercana a México (ej. *East US (North Virginia)*).
   - Crea el proyecto y espera ~2 min a que termine.

3. **Crea las tablas, la seguridad y el almacenamiento** (corre las migraciones EN ORDEN):
   - Menú izquierdo → **SQL Editor** → **New query**.
   - Corre estos tres archivos, **uno por uno y en este orden** (pega TODO el contenido, **Run**, debe decir "Success", y repite con el siguiente):
     1. [`supabase/migrations/01_core_schema.sql`](supabase/migrations/01_core_schema.sql) — perfiles, rondas, prácticas + seguridad por filas (RLS).
     2. [`supabase/migrations/02_social_events.sql`](supabase/migrations/02_social_events.sql) — feed social (posts, likes, comentarios, follows) y eventos + su RLS.
     3. [`supabase/migrations/03_storage_round_media.sql`](supabase/migrations/03_storage_round_media.sql) — el bucket de Storage para fotos/videos del feed.
   - ⚠️ Ya **no** existe un `schema.sql` único: fue reemplazado por estas migraciones (la versión vieja exponía el email de todos; estas ya no).

4. **Apaga la confirmación de correo** (para que el alta entre directo, sin pedir un email de confirmación):
   - Menú izquierdo → **Authentication** → **Sign In / Providers** → **Email** → apaga **"Confirm email"** → **Save**.

6. **Copia tus llaves** y pégalas en [`js/config.js`](js/config.js):
   - Menú izquierdo → **Project Settings** (engrane) → **API**.
   - Copia **Project URL** (ej. `https://abcdxyz.supabase.co`) → `SUPABASE_URL`.
   - Copia la llave **`anon` `public`** (empieza con `eyJ...`) → `SUPABASE_ANON_KEY`.
   - La `anon public` es **segura** en la app: la protege la seguridad por filas (RLS) de las migraciones.
   - ⚠️ La llave **`service_role`** NO la pongas en la app — esa es secreta.

## Qué hace la app una vez conectada

- Login y alta reales (email + contraseña).
- Espejo a la nube de perfil, rondas y prácticas (entras desde cualquier teléfono).
- Al entrar por primera vez en un dispositivo, **importa** tus datos locales previos a tu cuenta.
- Feed social real (compartir ronda con foto/video, likes, comentarios) y eventos con confirmación.
- **Con respaldo**: si no hay internet, la app sigue guardando local y se sincroniza al volver.

> Las **parties** siguen sincronizándose por su canal en tiempo real (no por Supabase) — eso no cambió.
> Si las dos llaves quedan vacías en `js/config.js`, la app corre 100% local, como antes.
