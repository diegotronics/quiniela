-- ============================================================
-- 10_apuestas_especiales.sql
--
-- Apuestas pre-mundial: cada jugador elige Campeón, Sub-campeón,
-- Goleador y una "Sorpresa" (texto libre validado por el admin).
--
-- Modelo:
--   - apuestas_especiales_config: singleton id='global' que guarda
--     puntos por categoría, resultados oficiales (que el admin carga
--     al final del torneo) y la fecha límite para que los jugadores
--     puedan editar.
--   - apuestas_especiales: una fila por usuario con sus 4 picks.
--
-- Scoring: triggers actualizan puntos_obtenidos cuando cambia la
-- apuesta o cuando el admin guarda los resultados oficiales.
-- ============================================================

create table if not exists apuestas_especiales_config (
  id              text primary key default 'global',
  pts_campeon     integer default 15,
  pts_subcampeon  integer default 8,
  pts_goleador    integer default 10,
  pts_sorpresa    integer default 6,
  campeon         text,
  subcampeon      text,
  goleador        text,
  sorpresa        text,
  cierra_en       timestamptz default '2026-06-11T19:00:00Z',
  updated_at      timestamptz default now()
);

insert into apuestas_especiales_config (id) values ('global')
on conflict (id) do nothing;

create table if not exists apuestas_especiales (
  id                uuid default gen_random_uuid() primary key,
  usuario_id        uuid references usuarios(id) on delete cascade,
  campeon           text,
  subcampeon        text,
  goleador          text,
  sorpresa          text,
  puntos_obtenidos  integer default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique(usuario_id)
);

alter table apuestas_especiales_config enable row level security;
alter table apuestas_especiales        enable row level security;

drop policy if exists "allow all" on apuestas_especiales_config;
drop policy if exists "allow all" on apuestas_especiales;

create policy "allow all" on apuestas_especiales_config for all using (true) with check (true);
create policy "allow all" on apuestas_especiales        for all using (true) with check (true);

-- ------------------------------------------------------------
-- Función de scoring (case-insensitive, ignora espacios).
-- ------------------------------------------------------------
create or replace function calcular_puntos_apuesta_especial(
  pick_campeon     text,
  pick_subcampeon  text,
  pick_goleador    text,
  pick_sorpresa    text
) returns integer
language plpgsql
stable
as $$
declare
  cfg apuestas_especiales_config%rowtype;
  total integer := 0;
begin
  select * into cfg from apuestas_especiales_config where id = 'global';
  if cfg.id is null then
    return 0;
  end if;

  if pick_campeon is not null and cfg.campeon is not null
     and lower(btrim(pick_campeon)) = lower(btrim(cfg.campeon)) then
    total := total + coalesce(cfg.pts_campeon, 0);
  end if;

  if pick_subcampeon is not null and cfg.subcampeon is not null
     and lower(btrim(pick_subcampeon)) = lower(btrim(cfg.subcampeon)) then
    total := total + coalesce(cfg.pts_subcampeon, 0);
  end if;

  if pick_goleador is not null and cfg.goleador is not null
     and lower(btrim(pick_goleador)) = lower(btrim(cfg.goleador)) then
    total := total + coalesce(cfg.pts_goleador, 0);
  end if;

  if pick_sorpresa is not null and cfg.sorpresa is not null
     and lower(btrim(pick_sorpresa)) = lower(btrim(cfg.sorpresa)) then
    total := total + coalesce(cfg.pts_sorpresa, 0);
  end if;

  return total;
end;
$$;

-- Trigger A: cuando se inserta/actualiza una apuesta, calcula puntos.
create or replace function calcular_puntos_en_apuesta_especial()
returns trigger
language plpgsql
as $$
begin
  new.puntos_obtenidos := calcular_puntos_apuesta_especial(
    new.campeon, new.subcampeon, new.goleador, new.sorpresa
  );
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_apuesta_especial_calc on apuestas_especiales;
create trigger trg_apuesta_especial_calc
before insert or update of campeon, subcampeon, goleador, sorpresa
on apuestas_especiales
for each row
execute function calcular_puntos_en_apuesta_especial();

-- Trigger B: cuando cambia la config (resultados oficiales o pts),
-- recalcula puntos de todas las apuestas.
create or replace function recalcular_apuestas_especiales()
returns trigger
language plpgsql
as $$
begin
  if new.campeon is distinct from old.campeon
     or new.subcampeon is distinct from old.subcampeon
     or new.goleador is distinct from old.goleador
     or new.sorpresa is distinct from old.sorpresa
     or new.pts_campeon is distinct from old.pts_campeon
     or new.pts_subcampeon is distinct from old.pts_subcampeon
     or new.pts_goleador is distinct from old.pts_goleador
     or new.pts_sorpresa is distinct from old.pts_sorpresa then

    update apuestas_especiales
       set puntos_obtenidos = calcular_puntos_apuesta_especial(
             campeon, subcampeon, goleador, sorpresa
           ),
           updated_at = now()
     where true;  -- recalcula todas; `where true` satisface a safeupdate
  end if;
  return new;
end;
$$;

drop trigger if exists trg_apuesta_especial_recalc on apuestas_especiales_config;
create trigger trg_apuesta_especial_recalc
after update on apuestas_especiales_config
for each row
execute function recalcular_apuestas_especiales();
