-- ============================================================
-- PARFECT · Clubes (B2B) multi-tenant
-- Tablas: clubs, club_members, tournaments, tournament_players, academy_plans
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase (después de 01–04).
-- IDs de club/torneo son strings (Store.uid). user_id es texto (acepta el
-- uuid de auth como texto) para funcionar con cuentas de nube y locales.
-- ============================================================

create table if not exists public.clubs (
  id          text primary key,
  name        text not null,
  code        text unique not null,
  owner_id    text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.club_members (
  club_id    text not null references public.clubs(id) on delete cascade,
  user_id    text not null,
  name       text,
  role       text not null default 'member',   -- admin | coach | member | junior | parent
  hcp        numeric,
  category   text,
  consent    jsonb,
  joined_at  timestamptz not null default now(),
  primary key (club_id, user_id)
);

create table if not exists public.tournaments (
  id          text primary key,
  club_id     text not null references public.clubs(id) on delete cascade,
  name        text not null,
  date        text,
  holes       int  not null default 18,
  par         int  not null default 72,
  format      text not null default 'stroke',
  status      text not null default 'live',     -- open | live | done
  sponsors    jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists public.tournament_players (
  tournament_id text not null references public.tournaments(id) on delete cascade,
  club_id       text not null references public.clubs(id) on delete cascade,
  user_id       text not null,
  name          text,
  hcp           numeric,
  role          text,
  category      text,
  gross         int,
  primary key (tournament_id, user_id)
);

create table if not exists public.academy_plans (
  club_id    text not null references public.clubs(id) on delete cascade,
  junior_id  text not null,
  plan       jsonb not null default '[]'::jsonb,
  done       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (club_id, junior_id)
);

create index if not exists idx_club_members_user on public.club_members(user_id);
create index if not exists idx_tournaments_club  on public.tournaments(club_id);
create index if not exists idx_tplayers_club     on public.tournament_players(club_id);
create index if not exists idx_academy_club      on public.academy_plans(club_id);

-- ============================================================
-- RLS · cada quien ve solo los clubes a los que pertenece
-- ============================================================
alter table public.clubs               enable row level security;
alter table public.club_members        enable row level security;
alter table public.tournaments         enable row level security;
alter table public.tournament_players  enable row level security;
alter table public.academy_plans       enable row level security;

-- helper: ¿auth.uid() es miembro de este club?
create or replace function public.is_club_member(cid text)
returns boolean language sql security definer stable as $$
  select exists(select 1 from public.club_members m where m.club_id = cid and m.user_id = auth.uid()::text);
$$;
-- helper: ¿auth.uid() es dueño del club?
create or replace function public.is_club_owner(cid text)
returns boolean language sql security definer stable as $$
  select exists(select 1 from public.clubs c where c.id = cid and c.owner_id = auth.uid()::text);
$$;

-- clubs
drop policy if exists clubs_sel on public.clubs;
create policy clubs_sel on public.clubs for select using (public.is_club_member(id) or owner_id = auth.uid()::text);
drop policy if exists clubs_ins on public.clubs;
create policy clubs_ins on public.clubs for insert with check (owner_id = auth.uid()::text);
drop policy if exists clubs_upd on public.clubs;
create policy clubs_upd on public.clubs for update using (owner_id = auth.uid()::text);

-- club_members: ves a los miembros de tus clubes; te insertas a ti mismo o el dueño gestiona
drop policy if exists cm_sel on public.club_members;
create policy cm_sel on public.club_members for select using (public.is_club_member(club_id) or public.is_club_owner(club_id));
drop policy if exists cm_ins on public.club_members;
create policy cm_ins on public.club_members for insert with check (user_id = auth.uid()::text or public.is_club_owner(club_id));
drop policy if exists cm_upd on public.club_members;
create policy cm_upd on public.club_members for update using (user_id = auth.uid()::text or public.is_club_owner(club_id));
drop policy if exists cm_del on public.club_members;
create policy cm_del on public.club_members for delete using (user_id = auth.uid()::text or public.is_club_owner(club_id));

-- tournaments / players / academy: leer si eres miembro; escribir si eres dueño (staff)
drop policy if exists tn_sel on public.tournaments;
create policy tn_sel on public.tournaments for select using (public.is_club_member(club_id));
drop policy if exists tn_wr on public.tournaments;
create policy tn_wr on public.tournaments for all using (public.is_club_owner(club_id)) with check (public.is_club_owner(club_id));

drop policy if exists tp_sel on public.tournament_players;
create policy tp_sel on public.tournament_players for select using (public.is_club_member(club_id));
drop policy if exists tp_wr on public.tournament_players;
create policy tp_wr on public.tournament_players for all using (public.is_club_owner(club_id)) with check (public.is_club_owner(club_id));

drop policy if exists ap_sel on public.academy_plans;
create policy ap_sel on public.academy_plans for select using (public.is_club_member(club_id));
drop policy if exists ap_wr on public.academy_plans;
create policy ap_wr on public.academy_plans for all using (public.is_club_owner(club_id)) with check (public.is_club_owner(club_id));
