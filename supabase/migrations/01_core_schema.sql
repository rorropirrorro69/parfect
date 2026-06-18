-- ============================================================
-- PARFECT · Migración 01 · Esquema núcleo
-- ------------------------------------------------------------
-- Crea: profiles, rounds, practices + RLS + alta automática de perfil
--       + vista pública de perfiles (para el feed).
-- NO crea la tabla `parties` (las parties siguen en MQTT por ahora, decisión #2).
-- Supersede a profiles/rounds/practices del viejo supabase/schema.sql:
--   NO corras ese archivo. Corre SOLO este.
-- Cómo: Supabase → SQL Editor → New query → pega TODO → Run.
-- Es idempotente: se puede correr de nuevo sin romper nada.
-- ============================================================

-- ---------- PERFILES (1:1 con auth.users) ----------
-- Decisión #3: SIN columna email. El email vive solo en auth.users (privado).
-- Decisión #11: `avatar` es columna (no va en extra) porque el FEED muestra el
--   avatar de OTROS usuarios; el resto de la personalización (sexo/tono/emoji)
--   solo se usa para tu propio avatar y se queda en `extra`.
-- `extra` (jsonb) guarda lo demás del jugador (onboarded, clubs, academia,
--   drillsDone, cardSkin, etc.) para crecer sin migraciones de columnas.
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  name        text  not null default 'Jugador',
  hcp         int   not null default 18,
  goal        int   not null default 13,
  avatar      int   not null default 0,
  extra       jsonb not null default '{}',
  created_at  timestamptz default now()
);

-- ---------- RONDAS ----------
-- id es TEXT: usamos el id que ya genera la app (Store.uid) para que el espejo
-- local→nube sea un upsert directo, sin traducir ids.
-- Decisión #7: columnas nuevas `time`, `hole_offset`, `media` (el código las
--   guarda y hoy el mapper las pierde). `media` = {type, src}; `src` será una
--   URL de Supabase Storage (se conecta en la migración 03), NO un data-URL.
create table if not exists public.rounds (
  id          text primary key,
  user_id     uuid not null references auth.users on delete cascade,
  party_id    text,
  course_id   text,
  course      text,
  date        date,
  "time"      text,
  hole_offset int  not null default 0,
  caption     text,
  media       jsonb,
  holes       jsonb not null default '[]',
  created_at  timestamptz default now()
);
create index if not exists rounds_user_idx       on public.rounds(user_id);
create index if not exists rounds_user_date_idx  on public.rounds(user_id, date desc);
create index if not exists rounds_party_idx      on public.rounds(party_id);

-- ---------- PRÁCTICAS (Tracker) ----------
-- Decisión #7: columna nueva `minutes` (las sesiones guiadas/libres la guardan).
create table if not exists public.practices (
  id          text primary key,
  user_id     uuid not null references auth.users on delete cascade,
  date        date,
  area        text,
  drill       text,
  attempts    int,
  hits        int,
  minutes     int,
  notes       text,
  created_at  timestamptz default now()
);
create index if not exists practices_user_idx on public.practices(user_id);

-- ============================================================
-- Alta automática de perfil al registrarse (decisión #3: sin email)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Jugador'))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security (cada quien ve/edita SOLO lo suyo)
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.rounds    enable row level security;
alter table public.practices enable row level security;

-- PERFILES: lectura/escritura SOLO de tu propia fila (incluye `extra`, que
-- puede tener datos personales). Para mostrar nombre/avatar/hcp de OTROS
-- usuarios (feed/leaderboard) se usa la vista `public_profiles` de abajo.
drop policy if exists "profiles read own"   on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles read own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- RONDAS y PRÁCTICAS: solo el dueño, en TODAS las operaciones (select/insert/update/delete).
drop policy if exists "own rounds"    on public.rounds;
drop policy if exists "own practices" on public.practices;
create policy "own rounds"    on public.rounds    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own practices" on public.practices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Directorio público de perfiles (SOLO columnas no sensibles)
-- ------------------------------------------------------------
-- El feed/leaderboard necesitan mostrar nombre, hcp y avatar de OTROS usuarios.
-- profiles está cerrado a "tu propia fila", así que exponemos un subconjunto
-- seguro vía esta vista. La vista corre con privilegios de su dueño (postgres)
-- y por eso ve todas las filas saltándose el RLS de profiles — pero SOLO
-- entrega estas 4 columnas inofensivas. NUNCA agregues email/extra/goal aquí.
-- ============================================================
create or replace view public.public_profiles as
  select id, name, hcp, avatar from public.profiles;

revoke all on public.public_profiles from anon, authenticated;
grant select on public.public_profiles to anon, authenticated;
