-- ============================================================
-- 13_sorpresa_automatica.sql
--
-- Rediseño de la apuesta especial "Sorpresa del Mundial".
--
-- Antes: el admin cargaba UNA respuesta oficial ("Selección — Fase")
-- y solo ganaba quien la calcara exactamente. Pero la sorpresa describe
-- una situación ("tal selección llega hasta tal fase") que puede
-- cumplirse para varias selecciones a la vez, así que no existe una
-- única respuesta correcta.
--
-- Ahora: cada jugador acierta si la selección que eligió llega AL MENOS
-- hasta la fase que predijo. La fase alcanzada por cada equipo se deriva
-- AUTOMÁTICAMENTE de los partidos de eliminatorias (un equipo "llegó" a
-- una fase si aparece en algún partido de esa fase). Así el reparto es
-- automático, no depende de que el admin cargue una respuesta y puede
-- haber varios ganadores.
--
-- Idempotente: se puede correr varias veces. Ejecutar DESPUÉS de 01–12.
-- ============================================================

-- ------------------------------------------------------------
-- Profundidad numérica de cada fase del torneo (mayor = más lejos).
-- Refleja FASE_PROFUNDIDAD de src/lib/constants.js.
-- ------------------------------------------------------------
create or replace function profundidad_fase(p_fase_id text)
returns integer
language sql
immutable
as $$
  select case p_fase_id
    when 'grupos'        then 0
    when 'dieciseisavos' then 1
    when 'octavos'       then 2
    when 'cuartos'       then 3
    when 'semifinal'     then 4
    when 'tercerpuesto'  then 4  -- jugar el 3.º puesto implica llegar a semifinal
    when 'final'         then 5
    else 0
  end;
$$;

-- ------------------------------------------------------------
-- Profundidad que exige la etiqueta de fase de la "Sorpresa".
-- Debe coincidir con SORPRESA_FASES / SORPRESA_FASE_PROFUNDIDAD del
-- frontend (src/lib/constants.js).
-- ------------------------------------------------------------
create or replace function profundidad_sorpresa(p_fase_label text)
returns integer
language sql
immutable
as $$
  select case btrim(p_fase_label)
    when 'Octavos de final' then 2
    when 'Cuartos de final' then 3
    when 'Semifinal'        then 4
    when 'Final'            then 5
    else null
  end;
$$;

-- ------------------------------------------------------------
-- Fase más profunda que alcanzó un equipo, según su aparición en los
-- partidos de eliminatorias. NULL si todavía no aparece en ninguna.
-- ------------------------------------------------------------
create or replace function fase_alcanzada_equipo(p_equipo text)
returns integer
language sql
stable
as $$
  select max(profundidad_fase(p.fase_id))
    from partidos p
   where p.fase_id <> 'grupos'
     and (
       lower(btrim(p.equipo_local))     = lower(btrim(p_equipo))
       or lower(btrim(p.equipo_visitante)) = lower(btrim(p_equipo))
     );
$$;

-- ------------------------------------------------------------
-- Scoring de las apuestas especiales.
--
-- Campeón / Subcampeón / Goleador siguen comparándose contra la respuesta
-- única que carga el admin. La "Sorpresa" ya no usa cfg.sorpresa: se evalúa
-- contra el avance real de la selección elegida.
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
  s_equipo text;
  s_fase   text;
  req_prof integer;
  alc_prof integer;
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

  -- Sorpresa: acierta si la selección elegida llega AL MENOS hasta la fase
  -- predicha. El valor guardado es "Selección — Fase" (separador " — ").
  if pick_sorpresa is not null then
    s_equipo := btrim(split_part(pick_sorpresa, ' — ', 1));
    s_fase   := btrim(split_part(pick_sorpresa, ' — ', 2));
    req_prof := profundidad_sorpresa(s_fase);
    if s_equipo <> '' and req_prof is not null then
      alc_prof := fase_alcanzada_equipo(s_equipo);
      if alc_prof is not null and alc_prof >= req_prof then
        total := total + coalesce(cfg.pts_sorpresa, 0);
      end if;
    end if;
  end if;

  return total;
end;
$$;

-- ------------------------------------------------------------
-- La puntuación de la Sorpresa ahora depende de los partidos de
-- eliminatorias, así que cualquier cambio en ellos (alta del cruce,
-- carga del resultado o corrección) debe recalcular las apuestas.
-- SECURITY DEFINER: 11_seguridad.sql revoca el UPDATE de puntos_obtenidos
-- a los roles del cliente; el trigger debe poder escribir esa columna.
-- ------------------------------------------------------------
create or replace function recalcular_apuestas_por_partido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fase text;
begin
  if tg_op = 'DELETE' then
    v_fase := old.fase_id;
  else
    v_fase := new.fase_id;
  end if;

  -- Solo las eliminatorias afectan la "Sorpresa".
  if v_fase is distinct from 'grupos' then
    update apuestas_especiales
       set puntos_obtenidos = calcular_puntos_apuesta_especial(
             campeon, subcampeon, goleador, sorpresa
           ),
           updated_at = now()
     where true;  -- recalcula todas; `where true` satisface a safeupdate
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_partido_recalc_especiales on partidos;
create trigger trg_partido_recalc_especiales
after insert or update or delete on partidos
for each row
execute function recalcular_apuestas_por_partido();

-- ------------------------------------------------------------
-- Recalcular una vez todo lo existente (idempotente).
-- ------------------------------------------------------------
update apuestas_especiales
   set puntos_obtenidos = calcular_puntos_apuesta_especial(
         campeon, subcampeon, goleador, sorpresa
       ),
       updated_at = now()
 where true;
