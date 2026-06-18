-- ============================================================
-- PARFECT · Migración 04 · Portal de Coach (alumno ↔ entrenador)
-- ------------------------------------------------------------
-- Crea: coach_students (relación con consentimiento) + coach_notes (privadas).
-- Promueve is_coach a columna (para listar coaches) y deja que un coach con
-- relación ACTIVA pueda leer las rondas de su alumno (acceso consentido).
-- Requiere migraciones 01 y 02. Idempotente.
--
-- CONSENTIMIENTO (lo importante): NADIE puede crear una relación ACTIVA solo.
--   1) Una parte INSERTA una solicitud (status='pending', requested_by = quien pide).
--   2) La OTRA parte la acepta (UPDATE status='active'). El que pidió NO puede
--      auto-aceptar (lo bloquea la política + el trigger de inmutabilidad).
-- ============================================================

-- ---------- is_coach como columna (antes vivía en extra) ----------
alter table public.profiles add column if not exists is_coach boolean not null default false;
create index if not exists profiles_is_coach_idx on public.profiles(is_coach) where is_coach;

-- Refresca el directorio público para exponer is_coach (sin email, sin extra).
create or replace view public.public_profiles as
  select id, name, hcp, avatar, is_coach from public.profiles;
revoke all on public.public_profiles from anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

-- ============================================================
-- coach_students · relación con estado de consentimiento
-- ============================================================
create table if not exists public.coach_students (
  coach_id     uuid not null references auth.users on delete cascade,
  student_id   uuid not null references auth.users on delete cascade,
  status       text not null default 'pending' check (status in ('pending','active')),
  requested_by uuid not null references auth.users on delete cascade,
  created_at   timestamptz default now(),
  primary key (coach_id, student_id),
  check (coach_id <> student_id),               -- no puedes ser tu propio coach
  check (requested_by in (coach_id, student_id)) -- quien pide es una de las dos partes
);
create index if not exists coach_students_student_idx on public.coach_students(student_id);

-- Inmutabilidad: coach_id / student_id / requested_by NUNCA cambian en un UPDATE.
-- (cierra el hueco de "reescribo requested_by para auto-aceptar").
create or replace function public.coach_link_guard()
returns trigger language plpgsql as $$
begin
  if (new.coach_id <> old.coach_id
      or new.student_id <> old.student_id
      or new.requested_by <> old.requested_by) then
    raise exception 'coach_id, student_id y requested_by son inmutables';
  end if;
  return new;
end; $$;
drop trigger if exists coach_link_guard_t on public.coach_students;
create trigger coach_link_guard_t before update on public.coach_students
  for each row execute function public.coach_link_guard();

alter table public.coach_students enable row level security;

-- VER: solo las dos partes de la relación (nadie más la ve).
drop policy if exists "cs read"   on public.coach_students;
drop policy if exists "cs insert" on public.coach_students;
drop policy if exists "cs update" on public.coach_students;
drop policy if exists "cs delete" on public.coach_students;
create policy "cs read" on public.coach_students for select
  using (auth.uid() in (coach_id, student_id));
-- CREAR: solo como SOLICITUD (pending), siendo una de las partes y el solicitante.
create policy "cs insert" on public.coach_students for insert
  with check (auth.uid() = requested_by and auth.uid() in (coach_id, student_id) and status = 'pending');
-- ACEPTAR/actualizar: una de las partes, PERO el solicitante NO puede poner 'active'.
create policy "cs update" on public.coach_students for update
  using (auth.uid() in (coach_id, student_id))
  with check (auth.uid() in (coach_id, student_id) and (status <> 'active' or auth.uid() <> requested_by));
-- SALIR/cancelar/rechazar: cualquiera de las dos partes borra la relación.
create policy "cs delete" on public.coach_students for delete
  using (auth.uid() in (coach_id, student_id));

-- ============================================================
-- coach_notes · comentarios privados del coach sobre su alumno
-- ============================================================
create table if not exists public.coach_notes (
  id          text primary key,
  coach_id    uuid not null references auth.users on delete cascade,
  student_id  uuid not null references auth.users on delete cascade,
  text        text not null,
  created_at  timestamptz default now()
);
create index if not exists coach_notes_pair_idx on public.coach_notes(coach_id, student_id);

alter table public.coach_notes enable row level security;

-- VER: ESTRICTAMENTE las dos personas de la nota (coach y alumno). Nadie más.
drop policy if exists "cn read"   on public.coach_notes;
drop policy if exists "cn insert" on public.coach_notes;
drop policy if exists "cn update" on public.coach_notes;
drop policy if exists "cn delete" on public.coach_notes;
create policy "cn read" on public.coach_notes for select
  using (auth.uid() in (coach_id, student_id));
-- CREAR: solo el coach, y solo si existe relación ACTIVA con ese alumno.
create policy "cn insert" on public.coach_notes for insert
  with check (
    auth.uid() = coach_id
    and exists (select 1 from public.coach_students cs
                where cs.coach_id = coach_notes.coach_id
                  and cs.student_id = coach_notes.student_id
                  and cs.status = 'active'));
-- EDITAR/BORRAR: solo el coach autor.
create policy "cn update" on public.coach_notes for update using (auth.uid() = coach_id) with check (auth.uid() = coach_id);
create policy "cn delete" on public.coach_notes for delete using (auth.uid() = coach_id);

-- ============================================================
-- Acceso consentido del coach a las rondas del alumno
-- ------------------------------------------------------------
-- Suma a la política "own rounds" (las políticas se combinan con OR): un coach
-- con relación ACTIVA puede LEER (solo select) las rondas de su alumno, para ver
-- sus stats. Una relación 'pending' NO da acceso. Las prácticas siguen privadas.
-- ============================================================
drop policy if exists "coach reads student rounds" on public.rounds;
create policy "coach reads student rounds" on public.rounds for select
  using (exists (
    select 1 from public.coach_students cs
    where cs.student_id = rounds.user_id
      and cs.coach_id = auth.uid()
      and cs.status = 'active'));
