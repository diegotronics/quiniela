-- ============================================================
-- Fases del Mundial + Usuario Admin inicial
-- ============================================================

insert into fases (id, nombre, icono, estado, orden, pts_exacto, pts_ganador) values
  ('grupos',        'Fase de Grupos',   '⚽', 'activa',    1, 3,  1),
  ('dieciseisavos', '1/16 de Final',    '⚔️', 'bloqueada', 2, 4,  2),
  ('octavos',       'Octavos de Final', '🔥', 'bloqueada', 3, 5,  2),
  ('cuartos',       'Cuartos de Final', '💫', 'bloqueada', 4, 6,  3),
  ('semifinal',     'Semifinal',        '🌟', 'bloqueada', 5, 8,  4),
  ('tercerpuesto',  'Tercer Puesto',    '🥉', 'bloqueada', 6, 6,  3),
  ('final',         'Gran Final',       '🏆', 'bloqueada', 7, 15, 7)
on conflict (id) do nothing;

insert into usuarios (nombre, usuario, password, avatar, color, es_admin) values
  ('Admin', 'admin', 'admin123', 'AD', '#1a1a2e', true)
on conflict (usuario) do nothing;
