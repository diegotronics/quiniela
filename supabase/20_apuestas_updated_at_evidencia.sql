-- ============================================================
-- 20_apuestas_updated_at_evidencia.sql
--
-- `updated_at` de apuestas_especiales pasa a reflejar únicamente la
-- última edición de los picks del jugador. La vista pública "Apuestas
-- del grupo" lo muestra como evidencia de transparencia: si nadie
-- editó después del cierre, ninguna fecha puede ser posterior a él.
--
-- Antes, el recálculo masivo que corre cuando el admin guarda los
-- resultados oficiales (trigger de apuestas_especiales_config) pisaba
-- updated_at de todas las filas. Eso haría parecer que todas las
-- apuestas se editaron al final del torneo: exactamente la sospecha
-- que la vista pública quiere despejar.
--
-- Nota: el UPDATE de abajo solo toca puntos_obtenidos, y el trigger de
-- la propia fila (trg_apuesta_especial_calc) corre únicamente ante
-- `update of campeon, subcampeon, goleador, sorpresa`, así que este
-- recálculo tampoco lo dispara.
-- ============================================================

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
           )
     where true;  -- recalcula todas; `where true` satisface a safeupdate
  end if;
  return new;
end;
$$;
