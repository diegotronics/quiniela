-- ============================================================
-- 17_partidos_dieciseisavos.sql
--
-- Carga los 16 partidos de la Ronda de 32 (fase 'dieciseisavos',
-- "1/16 de Final") del Mundial 2026, con los equipos ya definidos
-- tras la fase de grupos y el calendario oficial.
--
-- Por qué hace falta esta migración:
--   * En la tabla `partidos` solo estaban los 72 de la fase de
--     grupos (migración 09). Los de eliminatoria se cargan cuando
--     se conocen los clasificados, igual que anticipa el seed 03.
--   * El panel de Admin permite editar resultado y horario, pero NO
--     crear partidos ni cambiar los equipos; por eso se hace por SQL.
--   * No hay interruptor de "abrir fase": desde la migración 14 el
--     pronóstico de cada partido se cierra solo, una hora antes del
--     saque (trigger `bloquear_prediccion_tardia`). Con insertar
--     estos partidos con su fecha futura, los pronósticos quedan
--     habilitados automáticamente.
--
-- Horarios: hora local de Venezuela (UTC-4, Caracas), con el offset
-- explícito en la cadena ISO. El horario oficial está publicado en
-- hora del Este de EE. UU. (ET); en verano ET = EDT = UTC-4, así que
-- coincide 1:1 con la hora de Venezuela y no hay conversión.
--
-- IDs: 'd16-01'..'d16-16' en orden cronológico. No colisionan con los
-- de grupos (A1..L6). `grupo` queda NULL (no aplica en eliminatoria).
--
-- NOTA: esta migración NO borra predicciones ni toca los partidos de
-- grupos. Es aditiva. El `on conflict do update` la hace reaplicable
-- sin duplicar si se corrige algún dato más adelante.
-- ============================================================

insert into partidos (id, fase_id, equipo_local, equipo_visitante, fecha) values
-- Domingo 28 de junio
('d16-01','dieciseisavos','Sudáfrica','Canadá',                 '2026-06-28T15:00:00-04:00'),
-- Lunes 29 de junio
('d16-02','dieciseisavos','Brasil','Japón',                     '2026-06-29T13:00:00-04:00'),
('d16-03','dieciseisavos','Alemania','Paraguay',                '2026-06-29T16:30:00-04:00'),
('d16-04','dieciseisavos','Holanda','Marruecos',                '2026-06-29T21:00:00-04:00'),
-- Martes 30 de junio
('d16-05','dieciseisavos','Costa de Marfil','Noruega',          '2026-06-30T13:00:00-04:00'),
('d16-06','dieciseisavos','Francia','Suecia',                   '2026-06-30T17:00:00-04:00'),
('d16-07','dieciseisavos','México','Ecuador',                   '2026-06-30T21:00:00-04:00'),
-- Miércoles 1 de julio
('d16-08','dieciseisavos','Inglaterra','RD Congo',              '2026-07-01T12:00:00-04:00'),
('d16-09','dieciseisavos','Bélgica','Senegal',                  '2026-07-01T16:00:00-04:00'),
('d16-10','dieciseisavos','EEUU','Bosnia y Herzegovina',        '2026-07-01T20:00:00-04:00'),
-- Jueves 2 de julio
('d16-11','dieciseisavos','España','Austria',                   '2026-07-02T15:00:00-04:00'),
('d16-12','dieciseisavos','Portugal','Croacia',                 '2026-07-02T19:00:00-04:00'),
('d16-13','dieciseisavos','Suiza','Argelia',                    '2026-07-02T23:00:00-04:00'),
-- Viernes 3 de julio
('d16-14','dieciseisavos','Australia','Egipto',                 '2026-07-03T14:00:00-04:00'),
('d16-15','dieciseisavos','Argentina','Cabo Verde',             '2026-07-03T18:00:00-04:00'),
('d16-16','dieciseisavos','Colombia','Ghana',                   '2026-07-03T21:30:00-04:00')
on conflict (id) do update
  set fase_id          = excluded.fase_id,
      equipo_local     = excluded.equipo_local,
      equipo_visitante = excluded.equipo_visitante,
      fecha            = excluded.fecha;
