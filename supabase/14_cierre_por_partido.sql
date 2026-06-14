-- ============================================================
-- LA COPA FAMILIAR 2026 — Cierre de pronósticos por partido
-- Ejecutar en Supabase → SQL Editor DESPUÉS de 01–13. Idempotente.
--
-- Qué cambia:
--   1) El pronóstico de cada partido se cierra UNA HORA antes del saque,
--      no cuando arranca. El trigger rechaza crear/editar una predicción
--      si falta menos de una hora para el partido (o si ya tiene resultado).
--   2) Se elimina la maquinaria de "estado de fase" (activa/cerrada/
--      bloqueada): el cierre ya no se controla por fase sino por partido,
--      derivado de la hora de cada uno. Se descarta la columna `estado`.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Cierre del pronóstico una hora antes del saque.
--    Solo se evalúa al tocar el marcador pronosticado, de modo que el
--    recálculo de puntos (que no cambia goles) nunca queda bloqueado.
-- ------------------------------------------------------------
create or replace function bloquear_prediccion_tardia()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p      partidos%rowtype;
  inicio timestamptz;
begin
  select * into p from partidos where id = new.partido_id;
  if p.id is null then
    return new;
  end if;

  if p.resultado_ingresado then
    raise exception 'PARTIDO_CERRADO: el partido ya tiene resultado';
  end if;

  begin
    inicio := p.fecha::timestamptz;
  exception when others then
    inicio := null;
  end;

  -- El pronóstico cierra una hora antes del saque.
  if inicio is not null and inicio - interval '1 hour' <= now() then
    raise exception 'PRONOSTICO_CERRADO: el pronóstico cerró una hora antes del partido';
  end if;

  return new;
end;
$$;

-- El trigger ya existe desde 11_seguridad.sql; recrearlo es inofensivo.
drop trigger if exists trg_prediccion_lock on predicciones;
create trigger trg_prediccion_lock
before insert or update of goles_local, goles_visitante on predicciones
for each row
execute function bloquear_prediccion_tardia();

-- ------------------------------------------------------------
-- 2) Eliminar el estado de fase: el cierre es por partido, no por fase.
-- ------------------------------------------------------------
alter table fases drop column if exists estado;
