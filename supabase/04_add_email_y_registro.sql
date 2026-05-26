-- ============================================================
-- LA COPA FAMILIAR 2026 — Auto-registro por email
-- Ejecutar en Supabase → SQL Editor (idempotente)
-- ============================================================

-- 1) Agregar columna email a usuarios
alter table usuarios
  add column if not exists email text;

-- 2) Email único (case-insensitive). Permite NULL en filas existentes.
create unique index if not exists usuarios_email_unique
  on usuarios (lower(email))
  where email is not null;
