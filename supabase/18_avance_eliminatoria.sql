-- ============================================================
-- 18_avance_eliminatoria.sql
--
-- Automatiza el cuadro: a medida que se cargan resultados de la
-- eliminatoria, crea solo los partidos de la siguiente fase con los
-- equipos que avanzan, la fecha y la sede oficiales (ya conocidas).
-- Así no hay que cargar a mano cada ronda.
--
-- Cómo funciona:
--   1) Tabla `bracket_avance`: define el cuadro del Mundial 2026.
--      Cada fila es un partido futuro (octavos → final) y de qué dos
--      partidos sale cada equipo (ganador o, para el 3er puesto,
--      perdedor de las semifinales) y su fecha/hora oficial.
--   2) Función `equipo_avanza(partido, tipo)`: devuelve el equipo que
--      avanza de un partido ya jugado. Si terminó en empate (definido
--      por penales), usa la columna `ganador` que carga el admin.
--   3) Función `procesar_avance_eliminatoria(id)`: para el partido que
--      acaba de resolverse, busca los partidos del cuadro que dependen
--      de él y, cuando sus dos clasificados ya están definidos, crea
--      (o rellena) el partido de la siguiente fase.
--   4) Trigger `trg_avance_eliminatoria`: dispara lo anterior cada vez
--      que un partido queda con resultado. El efecto es en cascada:
--      al cargar las semis se crea la final, etc.
--
-- Como crear el partido lo hace un trigger SECURITY DEFINER, las
-- predicciones quedan habilitadas solas (cierran una hora antes del
-- saque, igual que el resto). No hace falta tocar nada más.
--
-- IMPORTANTE sobre el cableado del cuadro:
--   * Ronda de 32 → Octavos (filas oct-*) está verificado contra el
--     cuadro oficial publicado por la FIFA.
--   * Cuarto 97 (ganador de oct-89 vs ganador de oct-90) también.
--   * El resto de cuartos, semis, 3er puesto y final siguen la
--     estructura estándar del cuadro. Si algún cruce no coincidiera con
--     el oficial, se corrige con un UPDATE de una sola fila en
--     `bracket_avance` (no hace falta redeploy). Hay margen de sobra:
--     octavos arrancan el 4 jul y cuartos el 9 jul.
--
-- Fechas en hora de Venezuela (UTC-4). En verano ET = EDT = UTC-4, así
-- que coincide 1:1 con el horario oficial.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Columna para registrar quién avanzó cuando el partido de
--    eliminatoria termina empatado (se definió por penales). En
--    partidos con marcador decisivo no hace falta: se deduce del
--    marcador. En fase de grupos siempre queda NULL.
-- ------------------------------------------------------------
alter table partidos
  add column if not exists ganador text;

-- ------------------------------------------------------------
-- 2) Definición del cuadro: cada partido futuro y sus dos orígenes.
-- ------------------------------------------------------------
create table if not exists bracket_avance (
  target_id        text primary key,   -- id del partido a crear
  target_fase      text not null references fases(id),
  target_fecha     text not null,      -- ISO con offset -04:00
  local_src        text not null,      -- id del partido de origen (local)
  local_tipo       text not null default 'ganador'
                   check (local_tipo in ('ganador','perdedor')),
  visitante_src    text not null,      -- id del partido de origen (visitante)
  visitante_tipo   text not null default 'ganador'
                   check (visitante_tipo in ('ganador','perdedor'))
);

alter table bracket_avance enable row level security;
drop policy if exists "allow read" on bracket_avance;
create policy "allow read" on bracket_avance for select using (true);

-- Octavos de final (se nutren de los ganadores de la Ronda de 32).
-- Mapeo de números FIFA a nuestros ids de dieciseisavos:
--   73=d16-01 74=d16-03 75=d16-04 76=d16-02 77=d16-06 78=d16-05
--   79=d16-07 80=d16-08 81=d16-10 82=d16-09 83=d16-12 84=d16-11
--   85=d16-13 86=d16-15 87=d16-16 88=d16-14
insert into bracket_avance
  (target_id, target_fase, target_fecha, local_src, visitante_src) values
-- Sáb 4 jul
('oct-90','octavos','2026-07-04T13:00:00-04:00','d16-01','d16-04'), -- W73 v W75 · Houston
('oct-89','octavos','2026-07-04T17:00:00-04:00','d16-03','d16-06'), -- W74 v W77 · Filadelfia
-- Dom 5 jul
('oct-91','octavos','2026-07-05T16:00:00-04:00','d16-02','d16-05'), -- W76 v W78 · MetLife
('oct-92','octavos','2026-07-05T20:00:00-04:00','d16-07','d16-08'), -- W79 v W80 · Azteca
-- Lun 6 jul
('oct-93','octavos','2026-07-06T15:00:00-04:00','d16-12','d16-11'), -- W83 v W84 · Dallas
('oct-94','octavos','2026-07-06T17:00:00-04:00','d16-10','d16-09'), -- W81 v W82 · Seattle
-- Mar 7 jul
('oct-95','octavos','2026-07-07T12:00:00-04:00','d16-15','d16-14'), -- W86 v W88 · Atlanta
('oct-96','octavos','2026-07-07T16:00:00-04:00','d16-13','d16-16'), -- W85 v W87 · Vancouver
-- Cuartos de final (ganadores de octavos)
('cf-97','cuartos','2026-07-09T16:00:00-04:00','oct-89','oct-90'),  -- Boston
('cf-98','cuartos','2026-07-10T15:00:00-04:00','oct-91','oct-92'),  -- Los Ángeles
('cf-99','cuartos','2026-07-11T17:00:00-04:00','oct-93','oct-94'),  -- Miami
('cf-100','cuartos','2026-07-11T21:00:00-04:00','oct-95','oct-96'), -- Kansas City
-- Semifinales (ganadores de cuartos)
('sf-101','semifinal','2026-07-14T15:00:00-04:00','cf-97','cf-98'),  -- Dallas
('sf-102','semifinal','2026-07-15T15:00:00-04:00','cf-99','cf-100'), -- Atlanta
-- Gran final (ganadores de semis)
('final-104','final','2026-07-19T15:00:00-04:00','sf-101','sf-102')  -- MetLife
on conflict (target_id) do update
  set target_fase    = excluded.target_fase,
      target_fecha   = excluded.target_fecha,
      local_src      = excluded.local_src,
      local_tipo     = excluded.local_tipo,
      visitante_src  = excluded.visitante_src,
      visitante_tipo = excluded.visitante_tipo;

-- Tercer puesto: lo juegan los PERDEDORES de las dos semifinales.
insert into bracket_avance
  (target_id, target_fase, target_fecha, local_src, local_tipo, visitante_src, visitante_tipo)
values
('tp-103','tercerpuesto','2026-07-18T17:00:00-04:00','sf-101','perdedor','sf-102','perdedor') -- Miami
on conflict (target_id) do update
  set target_fase    = excluded.target_fase,
      target_fecha   = excluded.target_fecha,
      local_src      = excluded.local_src,
      local_tipo     = excluded.local_tipo,
      visitante_src  = excluded.visitante_src,
      visitante_tipo = excluded.visitante_tipo;

-- ------------------------------------------------------------
-- 3) Equipo que avanza de un partido jugado (ganador o perdedor).
--    Devuelve NULL si el partido aún no tiene resultado, o si quedó
--    empatado y todavía no se cargó el ganador por penales.
-- ------------------------------------------------------------
create or replace function equipo_avanza(p_id text, tipo text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  p         partidos%rowtype;
  ganadorx  text;
  perdedorx text;
begin
  select * into p from partidos where id = p_id;
  if not found or not p.resultado_ingresado then
    return null;
  end if;

  if p.goles_local > p.goles_visitante then
    ganadorx := p.equipo_local;  perdedorx := p.equipo_visitante;
  elsif p.goles_visitante > p.goles_local then
    ganadorx := p.equipo_visitante;  perdedorx := p.equipo_local;
  else
    -- Empate (penales): se necesita el ganador cargado por el admin.
    if p.ganador is null then
      return null;
    end if;
    ganadorx := p.ganador;
    if p.ganador = p.equipo_local then
      perdedorx := p.equipo_visitante;
    elsif p.ganador = p.equipo_visitante then
      perdedorx := p.equipo_local;
    else
      return null;  -- ganador inconsistente con los equipos
    end if;
  end if;

  if tipo = 'perdedor' then
    return perdedorx;
  end if;
  return ganadorx;
end;
$$;

-- ------------------------------------------------------------
-- 4) Procesa el avance que dependa del partido recién resuelto.
--    Crea o rellena el partido de la siguiente fase cuando sus dos
--    clasificados ya están definidos. No pisa un partido que ya tenga
--    resultado, ni la fecha si el admin la ajustó (solo la fija al
--    crearlo).
-- ------------------------------------------------------------
create or replace function procesar_avance_eliminatoria(match_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r   bracket_avance%rowtype;
  loc text;
  vis text;
begin
  for r in
    select * from bracket_avance
     where local_src = match_id or visitante_src = match_id
  loop
    loc := equipo_avanza(r.local_src, r.local_tipo);
    vis := equipo_avanza(r.visitante_src, r.visitante_tipo);

    if loc is not null and vis is not null then
      insert into partidos (id, fase_id, equipo_local, equipo_visitante, fecha)
      values (r.target_id, r.target_fase, loc, vis, r.target_fecha)
      on conflict (id) do update
        set equipo_local     = excluded.equipo_local,
            equipo_visitante = excluded.equipo_visitante
        where partidos.resultado_ingresado = false;
    end if;
  end loop;
end;
$$;

-- ------------------------------------------------------------
-- 5) Trigger: al quedar un partido con resultado, dispara el avance.
--    Se ejecuta también al insertar/actualizar marcador o ganador.
--    Cuando crea el partido siguiente (resultado_ingresado = false),
--    el trigger vuelve a dispararse pero no hace nada: no hay recursión.
-- ------------------------------------------------------------
create or replace function trg_avance_eliminatoria_fn()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.resultado_ingresado then
    perform procesar_avance_eliminatoria(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_avance_eliminatoria on partidos;
create trigger trg_avance_eliminatoria
after insert or update of goles_local, goles_visitante, resultado_ingresado, ganador
on partidos
for each row
execute function trg_avance_eliminatoria_fn();

-- ------------------------------------------------------------
-- 6) Backfill: procesa los partidos ya resueltos por si alguna ronda
--    de eliminatoria ya tenía resultados al aplicar esta migración.
-- ------------------------------------------------------------
do $$
declare m record;
begin
  for m in select id from partidos where resultado_ingresado loop
    perform procesar_avance_eliminatoria(m.id);
  end loop;
end;
$$;
