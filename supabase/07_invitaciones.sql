-- ============================================================
-- LA COPA FAMILIAR 2026 — Invitaciones familiares
-- Tokens de un solo uso que un admin reparte por WhatsApp.
-- ============================================================

create table if not exists invitaciones (
  token text primary key,
  email text,
  nombre text,
  creada_por uuid references usuarios(id) on delete set null,
  aceptada_por uuid references usuarios(id) on delete set null,
  estado text not null default 'pendiente',  -- 'pendiente' | 'aceptada' | 'revocada'
  created_at timestamptz default now(),
  expires_at timestamptz,
  accepted_at timestamptz
);

create index if not exists invitaciones_estado_idx on invitaciones (estado);

alter table invitaciones enable row level security;

drop policy if exists "allow all" on invitaciones;
create policy "allow all" on invitaciones for all using (true) with check (true);
