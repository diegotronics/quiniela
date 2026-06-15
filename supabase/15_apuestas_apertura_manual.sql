-- ============================================================
-- 15_apuestas_apertura_manual.sql
--
-- Control manual de la edición de apuestas especiales.
--
-- Hasta ahora la edición se cerraba únicamente por la fecha
-- `cierra_en`. Esto agrega un override manual para que el admin
-- pueda reabrir las apuestas (p. ej. para un grupo que no las hizo)
-- y volver a cerrarlas sin depender de la fecha.
--
--   abierta_manual = null   -> automático: respeta `cierra_en`
--   abierta_manual = true    -> forzado abierto (ignora `cierra_en`)
--   abierta_manual = false   -> forzado cerrado (ignora `cierra_en`)
-- ============================================================

alter table apuestas_especiales_config
  add column if not exists abierta_manual boolean;

-- ------------------------------------------------------------
-- El cierre del servidor respeta el override manual.
--
-- Esta regla debe mantenerse en paridad con el helper del cliente
-- `apuestasEspecialesCerradas()` (src/lib/apuestasEspeciales.js). Aquí
-- vive el bloqueo real; el helper solo refleja el estado en la UI.
-- ------------------------------------------------------------
create or replace function bloquear_apuesta_tardia()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cierra timestamptz;
  override boolean;
begin
  select cierra_en, abierta_manual into cierra, override
    from apuestas_especiales_config
   where id = 'global';

  -- Override manual: tiene prioridad sobre la fecha.
  if override is true then
    return new;
  end if;
  if override is false then
    raise exception 'APUESTAS_CERRADAS: la edición está cerrada por el administrador';
  end if;

  -- Automático: se respeta la fecha límite.
  if cierra is not null and now() >= cierra then
    raise exception 'APUESTAS_CERRADAS: la fecha límite ya pasó';
  end if;
  return new;
end;
$$;
