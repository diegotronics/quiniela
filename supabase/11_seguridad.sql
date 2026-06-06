-- ============================================================
-- LA COPA FAMILIAR 2026 — Endurecimiento de seguridad
-- Ejecutar en Supabase → SQL Editor DESPUÉS de 01–10. Idempotente.
--
-- Qué arregla:
--   1) Contraseñas: deja de guardarlas en texto plano. Las hashea con
--      bcrypt (pgcrypto) y bloquea su lectura desde el cliente anónimo.
--   2) Login por RPC: la comparación de contraseña ocurre en el servidor
--      (función security definer); el cliente nunca ve el hash.
--   3) Antimanipulación de puntos: revoca el UPDATE directo de
--      `puntos_obtenidos`; solo los triggers de cálculo lo escriben.
--   4) Cierre real del pronóstico: un trigger rechaza crear/editar
--      predicciones de partidos ya iniciados o con resultado cargado.
--   5) Cierre real de apuestas especiales: trigger que respeta `cierra_en`.
--
-- Limitación conocida: la app usa auth propia en el cliente (no Supabase
-- Auth), por lo que la BD no conoce la identidad del usuario y no se puede
-- restringir por dueño con RLS. Para cerrar ese hueco por completo hay que
-- migrar a Supabase Auth. Esta migración mitiga los vectores más graves.
-- ============================================================

-- En Supabase, pgcrypto vive en el esquema `extensions` (no en `public`).
-- Por eso TODA función que use crypt()/gen_salt() debe incluir `extensions`
-- en su search_path; de lo contrario falla con "function crypt does not exist".
create extension if not exists pgcrypto;

-- Search_path de la sesión del editor: cubre el UPDATE de hasheo inicial.
set search_path = public, extensions;

-- ------------------------------------------------------------
-- 1) Hashear contraseñas existentes que aún estén en texto plano.
--    Los hashes bcrypt empiezan con '$2'.
-- ------------------------------------------------------------
update usuarios
   set password = crypt(password, gen_salt('bf'))
 where password is not null
   and password not like '$2%';

-- Hash automático en cada insert/update de contraseña. Así TODOS los
-- caminos de registro (auto-registro, invitación, alta por admin)
-- guardan la contraseña hasheada sin tocar el código cliente.
create or replace function hash_password_usuario()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  if new.password is not null and new.password not like '$2%' then
    new.password := crypt(new.password, gen_salt('bf'));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_hash_password on usuarios;
create trigger trg_hash_password
before insert or update of password on usuarios
for each row
execute function hash_password_usuario();

-- ------------------------------------------------------------
-- 2) Login en el servidor. Devuelve los datos públicos del usuario
--    (sin la columna password) o NULL si las credenciales fallan.
-- ------------------------------------------------------------
create or replace function login_usuario(p_email text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u usuarios;
begin
  select * into u
    from usuarios
   where lower(email) = lower(btrim(p_email))
   limit 1;

  if u.id is null then
    return null;
  end if;

  if u.password = crypt(p_password, u.password) then
    return to_jsonb(u) - 'password';
  end if;

  return null;
end;
$$;

-- ------------------------------------------------------------
-- 3) Bloquear lectura de contraseñas y escritura directa de puntos
--    desde los roles del cliente (anon / authenticated).
-- ------------------------------------------------------------
revoke select (password) on usuarios from anon, authenticated;

revoke update (puntos_obtenidos) on predicciones        from anon, authenticated;
revoke update (puntos_obtenidos) on apuestas_especiales  from anon, authenticated;

-- El cliente solo necesita ejecutar el login.
grant execute on function login_usuario(text, text) to anon, authenticated;

-- Los triggers de recálculo escriben `puntos_obtenidos` aunque el rol que
-- dispara la operación ya no tenga ese privilegio: por eso son SECURITY
-- DEFINER (corren con los privilegios del dueño de la función).
create or replace function recalcular_puntos_por_partido()
returns trigger
language plpgsql
security definer
set search_path = public
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

create or replace function recalcular_apuestas_especiales()
returns trigger
language plpgsql
security definer
set search_path = public
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
           updated_at = now();
  end if;
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 4) Cierre real del pronóstico: no se puede crear ni editar una
--    predicción si el partido ya empezó o ya tiene resultado.
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

  if inicio is not null and inicio <= now() then
    raise exception 'PARTIDO_INICIADO: el partido ya comenzó';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prediccion_lock on predicciones;
create trigger trg_prediccion_lock
before insert or update of goles_local, goles_visitante on predicciones
for each row
execute function bloquear_prediccion_tardia();

-- ------------------------------------------------------------
-- 5) Cierre real de apuestas especiales según `cierra_en`.
-- ------------------------------------------------------------
create or replace function bloquear_apuesta_tardia()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cierra timestamptz;
begin
  select cierra_en into cierra
    from apuestas_especiales_config
   where id = 'global';

  if cierra is not null and now() >= cierra then
    raise exception 'APUESTAS_CERRADAS: la fecha límite ya pasó';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_apuesta_especial_lock on apuestas_especiales;
create trigger trg_apuesta_especial_lock
before insert or update of campeon, subcampeon, goleador, sorpresa
on apuestas_especiales
for each row
execute function bloquear_apuesta_tardia();
