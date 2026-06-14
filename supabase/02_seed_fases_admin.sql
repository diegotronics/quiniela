-- ============================================================
-- Fases del Mundial + Usuario Admin inicial
-- ============================================================

insert into fases (id, nombre, icono, orden, pts_exacto, pts_ganador) values
  ('grupos',        'Fase de Grupos',   '⚽', 1, 3,  1),
  ('dieciseisavos', '1/16 de Final',    '⚔️', 2, 4,  2),
  ('octavos',       'Octavos de Final', '🔥', 3, 5,  2),
  ('cuartos',       'Cuartos de Final', '💫', 4, 6,  3),
  ('semifinal',     'Semifinal',        '🌟', 5, 8,  4),
  ('tercerpuesto',  'Tercer Puesto',    '🥉', 6, 6,  3),
  ('final',         'Gran Final',       '🏆', 7, 15, 7)
on conflict (id) do nothing;

insert into usuarios (nombre, usuario, password, avatar, color, es_admin) values
  ('Admin', 'admin', 'admin123', 'AD', '#1a1a2e', true)
on conflict (usuario) do nothing;
