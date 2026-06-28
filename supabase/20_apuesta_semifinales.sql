-- ============================================================
-- 20_apuesta_semifinales.sql
--
-- La cuarta apuesta especial deja de ser la "Sorpresa del Mundial"
-- (selección revelación + fase) y pasa a ser "Se queda en semifinales":
-- el jugador elige un equipo que llega a semifinales pero no a la final,
-- es decir, que termina 3.º o 4.º.
--
-- Se reutiliza la columna `sorpresa` (en config y en cada apuesta):
--   - apuestas_especiales.sorpresa  -> un único equipo (el pick del jugador)
--   - apuestas_especiales_config.sorpresa -> los DOS semifinalistas
--     eliminados, separados por ' · ' (en paridad con SEMIFINAL_SEP del
--     cliente, src/lib/constants.js).
--
-- El jugador acierta si su equipo coincide con cualquiera de los dos
-- semifinalistas del resultado oficial.
-- ============================================================

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

  -- "Se queda en semifinales": el resultado oficial puede contener los dos
  -- semifinalistas separados por ' · '. El pick acierta si coincide con
  -- cualquiera de ellos.
  if pick_sorpresa is not null and cfg.sorpresa is not null
     and exists (
       select 1
       from unnest(string_to_array(cfg.sorpresa, ' · ')) as t(nombre)
       where lower(btrim(pick_sorpresa)) = lower(btrim(t.nombre))
     ) then
    total := total + coalesce(cfg.pts_sorpresa, 0);
  end if;

  return total;
end;
$$;

-- Recalcula los puntos ya guardados con la nueva regla.
update apuestas_especiales
   set puntos_obtenidos = calcular_puntos_apuesta_especial(
         campeon, subcampeon, goleador, sorpresa
       ),
       updated_at = now()
 where true;
