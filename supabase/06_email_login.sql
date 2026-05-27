-- ============================================================
-- LA COPA FAMILIAR 2026 — Login por email
-- Elimina el campo "usuario": ahora el email es el identificador.
-- Idempotente: usa IF EXISTS / chequeos de columna.
-- ============================================================

-- 1) Asignar un email por defecto a quienes no lo tengan.
--    Se deriva del campo legacy "usuario" para no perder al admin
--    semilla ni a cuentas creadas antes de tener email.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'usuarios' and column_name = 'usuario'
  ) then
    update usuarios
      set email = lower(usuario) || '@quiniela.local'
      where email is null;
  end if;
end $$;

-- 2) Email obligatorio.
alter table usuarios alter column email set not null;

-- 3) Eliminar el campo usuario (y su unique implícita).
alter table usuarios drop column if exists usuario;
