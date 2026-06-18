-- ============================================================
-- PARFECT · Migración 03 · Storage · bucket `round-media`
-- ------------------------------------------------------------
-- Guarda las fotos/videos que hoy viven como data-URL en localStorage.
-- Lo usan: compartir ronda (rounds.media) y el feed (posts.media).
-- Cómo: Supabase → SQL Editor → New query → pega TODO → Run. Idempotente.
--
-- CONVENCIÓN DE RUTA (la respeta el código en migración 04/05):
--   round-media/{user_id}/{archivo}
--   La PRIMERA carpeta = tu user_id. Las políticas de abajo verifican eso para
--   que NADIE pueda subir/editar/borrar archivos en la carpeta de otro.
--
-- BUCKET PÚBLICO (decisión recomendada para el lanzamiento):
--   Cualquiera con el LINK exacto puede ver el archivo (como el CDN de cualquier
--   feed social). La metadata del post sigue protegida (solo autenticados, mig 02);
--   solo el archivo en sí es de link público. Para hacerlo privado luego: cambia
--   `public` a false aquí y el código tendría que pedir URLs firmadas al render.
-- ============================================================

-- ---------- Crear / configurar el bucket ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'round-media',
  'round-media',
  true,                       -- público (ver nota arriba)
  52428800,                   -- 50 MB por archivo (cubre clips cortos de teléfono)
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================
-- Políticas de acceso (sobre storage.objects; RLS ya viene activo en Supabase)
-- ============================================================

-- SUBIR: solo usuarios con sesión, y SOLO dentro de su propia carpeta {user_id}/...
drop policy if exists "round-media upload own" on storage.objects;
create policy "round-media upload own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'round-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- REEMPLAZAR (update): solo el dueño de la carpeta.
drop policy if exists "round-media update own" on storage.objects;
create policy "round-media update own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'round-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'round-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- BORRAR: solo el dueño de la carpeta.
drop policy if exists "round-media delete own" on storage.objects;
create policy "round-media delete own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'round-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- LEER (vía endpoint de Storage): cualquiera puede leer este bucket.
-- (El bucket es público, así que la URL pública funciona aunque no haya sesión;
--  esta política deja además funcionar el endpoint autenticado de descarga.)
drop policy if exists "round-media read" on storage.objects;
create policy "round-media read"
  on storage.objects for select
  using (bucket_id = 'round-media');
