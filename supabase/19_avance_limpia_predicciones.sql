-- ============================================================
-- 19_avance_eliminatoria_limpia_predicciones.sql
--
-- Ajuste de `procesar_avance_eliminatoria` (migración 18).
--
-- Problema: si se corrige el resultado de una ronda previa y cambia
-- quién avanza, el partido de la siguiente fase ya creado se quedaba
-- con las predicciones que la familia hizo para el cruce viejo. Al
-- jugarse, esas predicciones se puntuaban contra equipos distintos a
-- los pronosticados.
--
-- Arreglo: cuando los clasificados de un partido ya creado (y aún sin
-- resultado) cambian, se actualizan los equipos y se borran sus
-- predicciones, que dejaron de corresponder al cruce. Si no cambian,
-- no se toca nada. Un partido que ya tiene resultado nunca se altera.
--
-- `create or replace`: reaplica limpio aunque la 18 ya esté aplicada.
-- ============================================================

create or replace function procesar_avance_eliminatoria(match_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r         bracket_avance%rowtype;
  loc       text;
  vis       text;
  existente partidos%rowtype;
begin
  for r in
    select * from bracket_avance
     where local_src = match_id or visitante_src = match_id
  loop
    loc := equipo_avanza(r.local_src, r.local_tipo);
    vis := equipo_avanza(r.visitante_src, r.visitante_tipo);
    if loc is null or vis is null then
      continue;  -- aún no están definidos los dos clasificados
    end if;

    select * into existente from partidos where id = r.target_id;

    if not found then
      -- Crear el partido de la siguiente fase.
      insert into partidos (id, fase_id, equipo_local, equipo_visitante, fecha)
      values (r.target_id, r.target_fase, loc, vis, r.target_fecha)
      on conflict (id) do nothing;

    elsif not existente.resultado_ingresado
          and (existente.equipo_local     is distinct from loc
               or existente.equipo_visitante is distinct from vis) then
      -- Cambiaron los clasificados (se corrigió una ronda anterior):
      -- actualiza los equipos y descarta las predicciones del cruce viejo.
      update partidos
         set equipo_local = loc, equipo_visitante = vis
       where id = r.target_id;
      delete from predicciones where partido_id = r.target_id;
    end if;
  end loop;
end;
$$;
