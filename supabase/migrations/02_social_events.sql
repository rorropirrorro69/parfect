-- ============================================================
-- PARFECT · Migración 02 · Social (feed) + Eventos
-- ------------------------------------------------------------
-- Crea: posts, likes, comments, follows, events, event_rsvp + RLS.
-- Coach↔alumno NO se incluye (sigue demo, decisión #6).
-- Requiere la migración 01 (usa auth.users y public.rounds).
-- Cómo: Supabase → SQL Editor → New query → pega TODO → Run. Idempotente.
--
-- MODELO DE LECTURA (importante para no filtrar datos):
--   * El feed es GLOBAL entre usuarios CON SESIÓN: cualquier usuario logueado
--     ve todos los posts/comentarios/likes/eventos. (Decisión recomendada para
--     ~50 usuarios de una comunidad; ver nota al final.)
--   * `rounds` y `practices` siguen 100% privados (migración 01). El feed NUNCA
--     lee la ronda de otro usuario: cada `post` lleva su PROPIO resumen
--     (course/score/stats/holes) para pintarse solo, sin tocar `rounds` ajenas.
-- ============================================================

-- ---------- POSTS (una ronda compartida al feed) ----------
-- Lleva un SNAPSHOT de display: así el feed se pinta leyendo SOLO posts,
-- nunca las rondas privadas de otros. `round_id` es un puntero suave (si borras
-- la ronda, el post queda con su snapshot).
create table if not exists public.posts (
  id           text primary key,                 -- Store.uid() de la app
  user_id      uuid not null references auth.users on delete cascade,
  round_id     text references public.rounds(id) on delete set null,
  caption      text,
  media        jsonb,                             -- {type, src}; src = URL de Storage (migración 03)
  -- snapshot para pintar la tarjeta sin leer la ronda ajena:
  course       text,
  holes_count  int,
  score        int,
  to_par       int,
  fw           int,                               -- % fairways
  gir          int,                               -- % greens en regulación
  putts        int,
  holes        jsonb not null default '[]',       -- [{par, score}] para la tarjeta
  created_at   timestamptz default now()
);
create index if not exists posts_created_idx on public.posts(created_at desc);
create index if not exists posts_user_idx    on public.posts(user_id);

-- ---------- LIKES ----------
create table if not exists public.likes (
  post_id    text not null references public.posts(id) on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)                  -- 1 like por persona por post
);
create index if not exists likes_post_idx on public.likes(post_id);

-- ---------- COMMENTS ----------
create table if not exists public.comments (
  id         text primary key,
  post_id    text not null references public.posts(id) on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  text       text not null,
  created_at timestamptz default now()
);
create index if not exists comments_post_idx on public.comments(post_id, created_at);

-- ---------- FOLLOWS (liga de amigos / seguir) ----------
create table if not exists public.follows (
  follower_id uuid not null references auth.users on delete cascade,
  followee_id uuid not null references auth.users on delete cascade,
  created_at  timestamptz default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)              -- no seguirte a ti mismo
);
create index if not exists follows_followee_idx on public.follows(followee_id);

-- ---------- EVENTS (torneos / clases) ----------
create table if not exists public.events (
  id           text primary key,
  host_user_id uuid not null references auth.users on delete cascade,
  name         text,
  course_id    text,
  date         date,
  "time"       text,
  mode         text,
  created_at   timestamptz default now()
);
create index if not exists events_date_idx on public.events(date);
create index if not exists events_host_idx on public.events(host_user_id);

-- ---------- EVENT RSVP (quién va) ----------
-- Cada quien confirma POR SÍ MISMO (consentimiento; nadie te apunta sin permiso).
create table if not exists public.event_rsvp (
  event_id   text not null references public.events(id) on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  status     text not null default 'going' check (status in ('going','pending','declined')),
  created_at timestamptz default now(),
  primary key (event_id, user_id)
);
create index if not exists event_rsvp_user_idx on public.event_rsvp(user_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.posts      enable row level security;
alter table public.likes      enable row level security;
alter table public.comments   enable row level security;
alter table public.follows    enable row level security;
alter table public.events     enable row level security;
alter table public.event_rsvp enable row level security;

-- ---------- POSTS ----------
-- LEER: cualquier usuario con sesión (feed global). ESCRIBIR/EDITAR/BORRAR: solo el autor.
drop policy if exists "posts read"   on public.posts;
drop policy if exists "posts insert" on public.posts;
drop policy if exists "posts update" on public.posts;
drop policy if exists "posts delete" on public.posts;
create policy "posts read"   on public.posts for select using (auth.role() = 'authenticated');
create policy "posts insert" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts update" on public.posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "posts delete" on public.posts for delete using (auth.uid() = user_id);

-- ---------- LIKES ----------
-- LEER: autenticados (para contar y saber si ya diste like). PONER/QUITAR: solo el tuyo.
drop policy if exists "likes read"   on public.likes;
drop policy if exists "likes insert" on public.likes;
drop policy if exists "likes delete" on public.likes;
create policy "likes read"   on public.likes for select using (auth.role() = 'authenticated');
create policy "likes insert" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes delete" on public.likes for delete using (auth.uid() = user_id);

-- ---------- COMMENTS ----------
-- LEER: autenticados. CREAR/EDITAR: solo el autor.
-- BORRAR: el autor O el dueño del post (moderación de tu propio post).
drop policy if exists "comments read"   on public.comments;
drop policy if exists "comments insert" on public.comments;
drop policy if exists "comments update" on public.comments;
drop policy if exists "comments delete" on public.comments;
create policy "comments read"   on public.comments for select using (auth.role() = 'authenticated');
create policy "comments insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments update" on public.comments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "comments delete" on public.comments for delete
  using (auth.uid() = user_id
         or auth.uid() = (select p.user_id from public.posts p where p.id = post_id));

-- ---------- FOLLOWS ----------
-- LEER: autenticados (para rankings/listas). SEGUIR/DEJAR DE SEGUIR: solo decides por TI.
drop policy if exists "follows read"   on public.follows;
drop policy if exists "follows insert" on public.follows;
drop policy if exists "follows delete" on public.follows;
create policy "follows read"   on public.follows for select using (auth.role() = 'authenticated');
create policy "follows insert" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows delete" on public.follows for delete using (auth.uid() = follower_id);

-- ---------- EVENTS ----------
-- LEER: autenticados (tablón comunitario). CREAR/EDITAR/BORRAR: solo el anfitrión.
drop policy if exists "events read"   on public.events;
drop policy if exists "events insert" on public.events;
drop policy if exists "events update" on public.events;
drop policy if exists "events delete" on public.events;
create policy "events read"   on public.events for select using (auth.role() = 'authenticated');
create policy "events insert" on public.events for insert with check (auth.uid() = host_user_id);
create policy "events update" on public.events for update using (auth.uid() = host_user_id) with check (auth.uid() = host_user_id);
create policy "events delete" on public.events for delete using (auth.uid() = host_user_id);

-- ---------- EVENT RSVP ----------
-- LEER: autenticados (ver quién va). CONFIRMAR/CAMBIAR/QUITAR: solo TU propio RSVP.
drop policy if exists "rsvp read"   on public.event_rsvp;
drop policy if exists "rsvp insert" on public.event_rsvp;
drop policy if exists "rsvp update" on public.event_rsvp;
drop policy if exists "rsvp delete" on public.event_rsvp;
create policy "rsvp read"   on public.event_rsvp for select using (auth.role() = 'authenticated');
create policy "rsvp insert" on public.event_rsvp for insert with check (auth.uid() = user_id);
create policy "rsvp update" on public.event_rsvp for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "rsvp delete" on public.event_rsvp for delete using (auth.uid() = user_id);
