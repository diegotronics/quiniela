-- ============================================================
-- LA COPA FAMILIAR 2026 — RLS sobre el registro de migraciones
-- Ejecutar en Supabase → SQL Editor (idempotente).
--
-- Qué arregla:
--   El runner de migraciones (scripts/migrate.mjs) crea la tabla
--   `schema_migrations` para llevar el control de qué archivos ya se
--   aplicaron. Esa tabla se creaba SIN row level security, así que
--   PostgREST la exponía a través de la llave anónima: cualquiera con
--   la URL del proyecto podía leerla, modificarla o borrarla. Es la
--   tabla que marca el aviso de seguridad `rls_disabled_in_public`.
--
--   Aquí activamos RLS y NO creamos ninguna policy: ni anon ni
--   authenticated pueden tocarla. El registro de migraciones solo lo
--   escribe el runner, que conecta con conexión directa de Postgres
--   (dueño de la tabla) e ignora RLS. Mismo criterio que ya se usa con
--   `sync_partidos_estado`.
-- ============================================================

-- Por si la base existente la creó migrate.mjs antes de este arreglo.
create table if not exists schema_migrations (
  filename   text primary key,
  applied_at timestamptz default now()
);

alter table schema_migrations enable row level security;

-- ------------------------------------------------------------
-- Red de seguridad: activar RLS en cualquier otra tabla del esquema
-- public que se haya quedado sin él (presente o futura). Activar RLS
-- en una tabla que ya lo tiene es inofensivo (no hace nada), así que
-- el barrido es idempotente.
-- ------------------------------------------------------------
do $$
declare
  t record;
begin
  for t in
    select c.relname
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relkind = 'r'        -- solo tablas base
       and c.relrowsecurity = false
  loop
    execute format(
      'alter table public.%I enable row level security;', t.relname
    );
    raise notice 'RLS activado en tabla public.%', t.relname;
  end loop;
end $$;
