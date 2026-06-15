# Conectar PARFECT a la nube (Supabase)

Esto da: cuentas reales, datos que no se pierden (entras desde cualquier teléfono) y parties en tiempo real confiables. Toma ~5 minutos. **Gratis** para empezar.

## Pasos

1. **Crea la cuenta** en https://supabase.com → "Start your project" (puedes entrar con Google/GitHub).

2. **Nuevo proyecto**:
   - Nombre: `parfect`
   - Database Password: inventa una y **guárdala** (no la necesitas para la app, pero no la pierdas).
   - Region: la más cercana a México (ej. *East US (North Virginia)*).
   - Crea el proyecto y espera ~2 min a que termine.

3. **Crea las tablas**:
   - Menú izquierdo → **SQL Editor** → **New query**.
   - Copia TODO el contenido de [`supabase/schema.sql`](supabase/schema.sql) y pégalo.
   - Botón **Run** (abajo a la derecha). Debe decir "Success".

4. **Copia tus llaves**:
   - Menú izquierdo → **Project Settings** (engrane) → **API**.
   - Copia **Project URL** (ej. `https://abcdxyz.supabase.co`).
   - Copia la llave **`anon` `public`** (empieza con `eyJ...`).

5. **Pásame esos dos datos** (Project URL + anon public key) por el chat.
   - La `anon public` es **segura** de compartir y de poner en la app: la protege la seguridad por filas (RLS) que ya quedó configurada en el SQL.
   - ⚠️ La llave **`service_role`** NO me la mandes ni la pongas en la app — esa es secreta.

## Qué hago yo después

Con esos dos datos:
- Conecto login real (email + contraseña, y opción de Google).
- Migro tus rondas, prácticas, perfil y trofeos a la nube.
- Cambio la sync de parties del servidor público a Supabase (privada y confiable).
- Lo dejo **con respaldo**: si algún día no hay internet, la app sigue guardando local y se sincroniza al volver.

> Mientras tanto, la app actual (https://rorropirrorro69.github.io/parfect/) **sigue funcionando igual**. La nube se activa solo cuando peguemos tus llaves, así no rompemos nada antes del torneo.
