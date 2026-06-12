-- ============================================================
-- Estado de /api/sync-partidos para permitir disparos desde la app.
--
-- La app puede pedir una sincronización cuando detecta (vía el marcador
-- en vivo de ESPN) que un partido terminó, sin esperar al cron nocturno.
-- Esta tabla guarda la última corrida y funciona como candado/cooldown:
-- el endpoint solo procede si la fila se puede "reclamar" atómicamente.
--
-- RLS sin policies: ni anon ni authenticated pueden leerla o escribirla;
-- solo el service role del endpoint (que ignora RLS) la toca. Así un
-- cliente malicioso no puede bloquear la sincronización adelantando el
-- timestamp.
-- ============================================================

create table if not exists sync_partidos_estado (
  id text primary key,
  ultima_corrida timestamptz not null default to_timestamp(0)
);

insert into sync_partidos_estado (id)
values ('global')
on conflict (id) do nothing;

alter table sync_partidos_estado enable row level security;
