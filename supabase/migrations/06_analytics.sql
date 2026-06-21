-- ============================================================
-- PARFECT · Analítica (eventos de uso)
-- Mide usuarios, rondas, activos y retención del piloto/lanzamiento.
-- Tabla aparte de `events` (esa es para tee-times). Ejecuta en SQL Editor.
-- ============================================================

create table if not exists public.analytics_events (
  id          bigint generated always as identity primary key,
  user_id     text,                                  -- uid de la sesión (null si aún no inicia)
  name        text not null,                         -- app_open | signup | round_saved | party_round | ...
  props       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_analytics_created on public.analytics_events(created_at);
create index if not exists idx_analytics_name    on public.analytics_events(name);

alter table public.analytics_events enable row level security;

-- Cualquiera (anon o con sesión) puede registrar un evento.
drop policy if exists analytics_ins on public.analytics_events;
create policy analytics_ins on public.analytics_events for insert with check (true);

-- Solo el dueño (tú) puede leer los eventos para el dashboard.
-- Cambia el correo si usas otro para iniciar sesión.
drop policy if exists analytics_sel on public.analytics_events;
create policy analytics_sel on public.analytics_events
  for select using (auth.jwt() ->> 'email' = 'andremacouzetruiz@gmail.com');
