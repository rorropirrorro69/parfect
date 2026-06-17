-- ============================================================
-- PARFECT · Esquema de base de datos (Supabase / Postgres)
-- Córrelo UNA vez en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- ---------- PERFILES (1:1 con las cuentas de auth) ----------
-- name/hcp/goal son columnas (las usa el leaderboard y las parties).
-- 'extra' (jsonb) guarda todo lo demás del jugador: onboarded, clubs,
-- avatar, academia, likes, posts compartidos, etc. Así la app puede crecer
-- sin migraciones de columnas.
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  name        text not null default 'Jugador',
  email       text,
  hcp         int  not null default 18,
  goal        int  not null default 13,
  extra       jsonb not null default '{}',
  created_at  timestamptz default now()
);

-- ---------- RONDAS ----------
-- id es TEXT: usamos el id que ya genera la app (Store.uid) para que el
-- espejo local→nube sea un upsert directo, sin traducir ids.
create table if not exists public.rounds (
  id          text primary key,
  user_id     uuid not null references auth.users on delete cascade,
  party_id    text,
  course_id   text,
  course      text,
  date        date,
  caption     text,
  holes       jsonb not null default '[]',
  created_at  timestamptz default now()
);
create index if not exists rounds_user_idx on public.rounds(user_id);

-- ---------- PRÁCTICAS (Tracker) ----------
create table if not exists public.practices (
  id          text primary key,
  user_id     uuid not null references auth.users on delete cascade,
  date        date,
  area        text,
  drill       text,
  attempts    int,
  hits        int,
  notes       text,
  created_at  timestamptz default now()
);
create index if not exists practices_user_idx on public.practices(user_id);

-- ---------- PARTIES (en tiempo real) · Fase 2, ya queda lista ----------
create table if not exists public.parties (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,
  host_user_id  uuid references auth.users on delete set null,
  course        text,
  holes_count   int default 18,
  games         jsonb default '{}',
  use_net       boolean default false,
  players       jsonb default '[]',
  holes         jsonb default '[]',
  idx           int default 0,
  status        text default 'setup',
  rev           int default 0,
  updated_at    timestamptz default now()
);
create index if not exists parties_code_idx on public.parties(code);

-- ============================================================
-- Crear perfil automáticamente al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Jugador'), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security (cada quien ve/edita lo suyo)
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.rounds    enable row level security;
alter table public.practices enable row level security;
alter table public.parties   enable row level security;

-- Perfiles: lectura pública (para nombres en parties / leaderboard), escritura solo propia
drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles insert" on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select using (true);
create policy "profiles insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update" on public.profiles for update using (auth.uid() = id);

-- Rondas y prácticas: solo el dueño
drop policy if exists "own rounds"    on public.rounds;
drop policy if exists "own practices" on public.practices;
create policy "own rounds"    on public.rounds    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own practices" on public.practices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Parties: cualquier usuario autenticado puede leer/crear/editar (modelo "por código", como hoy).
-- Se puede endurecer luego a "solo miembros de la party".
drop policy if exists "parties read"   on public.parties;
drop policy if exists "parties insert" on public.parties;
drop policy if exists "parties update" on public.parties;
create policy "parties read"   on public.parties for select using (true);
create policy "parties insert" on public.parties for insert with check (auth.role() = 'authenticated');
create policy "parties update" on public.parties for update using (auth.role() = 'authenticated');

-- ============================================================
-- Tiempo real para las parties (Fase 2)
-- ============================================================
alter publication supabase_realtime add table public.parties;
