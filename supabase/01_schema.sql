-- ============================================================
-- LA COPA FAMILIAR 2026 — Esquema de base de datos
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Tabla de usuarios
create table if not exists usuarios (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  usuario text unique not null,
  password text not null,
  avatar text,
  color text default '#553C9A',
  es_admin boolean default false,
  pagado boolean default false,
  created_at timestamp default now()
);

-- Tabla de fases
create table if not exists fases (
  id text primary key,
  nombre text not null,
  icono text,
  orden integer,
  pts_exacto integer default 0,
  pts_ganador integer default 0
);

-- Tabla de partidos
create table if not exists partidos (
  id text primary key,
  fase_id text references fases(id),
  grupo text,
  equipo_local text not null,
  equipo_visitante text not null,
  fecha text,
  goles_local integer,
  goles_visitante integer,
  resultado_ingresado boolean default false
);

-- Tabla de predicciones
create table if not exists predicciones (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references usuarios(id) on delete cascade,
  partido_id text references partidos(id) on delete cascade,
  goles_local integer,
  goles_visitante integer,
  puntos_obtenidos integer default 0,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(usuario_id, partido_id)
);

-- RLS (acceso público; la app valida con su propia auth)
alter table usuarios     enable row level security;
alter table fases        enable row level security;
alter table partidos     enable row level security;
alter table predicciones enable row level security;

drop policy if exists "allow all" on usuarios;
drop policy if exists "allow all" on fases;
drop policy if exists "allow all" on partidos;
drop policy if exists "allow all" on predicciones;

create policy "allow all" on usuarios     for all using (true) with check (true);
create policy "allow all" on fases        for all using (true) with check (true);
create policy "allow all" on partidos     for all using (true) with check (true);
create policy "allow all" on predicciones for all using (true) with check (true);
