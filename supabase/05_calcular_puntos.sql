-- ============================================================
-- Cálculo automático de puntos en el servidor.
-- Antes vivía en el cliente (Admin.jsx) y se ejecutaba con RLS
-- abierto: cualquier anon podía sobrescribir puntos_obtenidos.
-- Ahora se calcula vía trigger cuando:
--   1) Se ingresa o cambia el resultado real de un partido.
--   2) Se inserta o actualiza una predicción de un partido ya jugado.
-- ============================================================

-- Quita permisos directos de escritura sobre puntos_obtenidos.
-- (la columna sigue existiendo, solo el trigger la actualiza)

create or replace function calcular_puntos_prediccion(
  fase_id_p text,
  pred_local integer,
  pred_visit integer,
  real_local integer,
  real_visit integer
) returns integer
language plpgsql
immutable
as $$
declare
  pts_exacto_v integer;
  pts_ganador_v integer;
begin
  if pred_local is null or pred_visit is null
     or real_local is null or real_visit is null then
    return 0;
  end if;

  select pts_exacto, pts_ganador
    into pts_exacto_v, pts_ganador_v
  from fases
  where id = fase_id_p;

  if pts_exacto_v is null then
    return 0;
  end if;

  if pred_local = real_local and pred_visit = real_visit then
    return pts_exacto_v;
  end if;

  if sign(pred_local - pred_visit) = sign(real_local - real_visit) then
    return pts_ganador_v;
  end if;

  return 0;
end;
$$;

-- Trigger A: cuando cambia el resultado de un partido, recalcula
-- puntos de todas sus predicciones.
create or replace function recalcular_puntos_por_partido()
returns trigger
language plpgsql
as $$
begin
  if new.goles_local is distinct from old.goles_local
     or new.goles_visitante is distinct from old.goles_visitante
     or new.resultado_ingresado is distinct from old.resultado_ingresado then

    update predicciones p
      set puntos_obtenidos = calcular_puntos_prediccion(
            new.fase_id,
            p.goles_local,
            p.goles_visitante,
            new.goles_local,
            new.goles_visitante
          ),
          updated_at = now()
    where p.partido_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_partido_recalc on partidos;
create trigger trg_partido_recalc
after update on partidos
for each row
execute function recalcular_puntos_por_partido();

-- Trigger B: cuando se inserta/actualiza una predicción, si el
-- partido ya tiene resultado, calcula los puntos ahí mismo.
create or replace function calcular_puntos_en_prediccion()
returns trigger
language plpgsql
as $$
declare
  p_record partidos%rowtype;
begin
  select * into p_record from partidos where id = new.partido_id;
  if p_record.id is null then
    new.puntos_obtenidos := 0;
    return new;
  end if;

  new.puntos_obtenidos := calcular_puntos_prediccion(
    p_record.fase_id,
    new.goles_local,
    new.goles_visitante,
    p_record.goles_local,
    p_record.goles_visitante
  );
  return new;
end;
$$;

drop trigger if exists trg_prediccion_calc on predicciones;
create trigger trg_prediccion_calc
before insert or update of goles_local, goles_visitante on predicciones
for each row
execute function calcular_puntos_en_prediccion();

-- Recalcular todo lo existente una vez (idempotente).
update predicciones p
  set puntos_obtenidos = calcular_puntos_prediccion(
        pa.fase_id, p.goles_local, p.goles_visitante,
        pa.goles_local, pa.goles_visitante
      )
  from partidos pa
  where pa.id = p.partido_id;
