-- ============================================================
-- Recalcular puntos cuando el admin cambia pts_exacto/pts_ganador
-- de una fase. Los triggers de 05_calcular_puntos.sql sólo cubren
-- cambios en partidos y predicciones, no en la tabla `fases`.
-- ============================================================

create or replace function recalcular_puntos_por_fase()
returns trigger
language plpgsql
as $$
begin
  if new.pts_exacto is distinct from old.pts_exacto
     or new.pts_ganador is distinct from old.pts_ganador then

    update predicciones p
      set puntos_obtenidos = calcular_puntos_prediccion(
            new.id,
            p.goles_local,
            p.goles_visitante,
            pa.goles_local,
            pa.goles_visitante
          ),
          updated_at = now()
      from partidos pa
      where pa.id = p.partido_id
        and pa.fase_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_fase_recalc on fases;
create trigger trg_fase_recalc
after update on fases
for each row
execute function recalcular_puntos_por_fase();
