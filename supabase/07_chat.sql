-- ============================================================
-- LA COPA FAMILIAR 2026 — Chat / Picadas familiares
-- Tabla `mensajes` con `partido_id` nullable:
--   NULL  → chat global familiar
--   value → chat del partido (FK → partidos.id)
-- Tabla `reacciones_mensaje` (relación N:M usuario↔mensaje por emoji).
-- ============================================================

create table if not exists mensajes (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  partido_id text references partidos(id) on delete cascade,
  texto text not null check (char_length(btrim(texto)) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  editado boolean not null default false
);

create index if not exists mensajes_partido_created_idx
  on mensajes (partido_id, created_at desc);

create index if not exists mensajes_global_created_idx
  on mensajes (created_at desc)
  where partido_id is null;

create table if not exists reacciones_mensaje (
  id uuid default gen_random_uuid() primary key,
  mensaje_id uuid not null references mensajes(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 8),
  created_at timestamptz not null default now(),
  unique (mensaje_id, usuario_id, emoji)
);

create index if not exists reacciones_mensaje_mensaje_idx
  on reacciones_mensaje (mensaje_id);

-- Trigger: actualiza updated_at y marca editado=true cuando cambia el texto.
create or replace function set_mensaje_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  new.editado = true;
  return new;
end;
$$ language plpgsql;

drop trigger if exists mensajes_set_updated_at on mensajes;
create trigger mensajes_set_updated_at
  before update of texto on mensajes
  for each row execute function set_mensaje_updated_at();

-- RLS abierta (consistente con el resto del schema; la app valida auth en cliente).
alter table mensajes            enable row level security;
alter table reacciones_mensaje  enable row level security;

drop policy if exists "allow all" on mensajes;
drop policy if exists "allow all" on reacciones_mensaje;

create policy "allow all" on mensajes            for all using (true) with check (true);
create policy "allow all" on reacciones_mensaje  for all using (true) with check (true);

-- Habilitar Realtime para ambas tablas (idempotente).
do $$
begin
  begin
    alter publication supabase_realtime add table mensajes;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table reacciones_mensaje;
  exception when duplicate_object then null;
  end;
end $$;
