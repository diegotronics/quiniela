-- ============================================================
-- 09_partidos_reales_mundial_2026.sql
--
-- Reemplaza los 72 partidos ficticios de la fase de grupos por los
-- 72 partidos REALES del Mundial 2026 (sorteo del 5 de diciembre
-- de 2025, calendario oficial publicado el 6 de diciembre de 2025).
--
-- Todas las fechas/horas están expresadas en hora local de Caracas,
-- Venezuela (UTC-4, sin DST). El offset queda explícito en la cadena
-- ISO, así el cliente puede convertir a cualquier huso si hiciera falta.
--
-- IMPORTANTE: borra los partidos antiguos. Por la cláusula ON DELETE
-- CASCADE, también borra todas las predicciones existentes. Se asume
-- que la base está vacía o que se acepta perder esos datos (los
-- partidos viejos eran emparejamientos imposibles en la realidad).
-- ============================================================

-- Limpieza previa
delete from predicciones;
delete from partidos where fase_id = 'grupos';

-- Columna para guardar el ID del fixture en API-Football y poder
-- sincronizar resultados automáticamente. Nullable: la primera
-- corrida del job de sync la rellena haciendo match por equipos.
alter table partidos
  add column if not exists api_fixture_id integer;

-- ============================================================
-- 72 partidos de la fase de grupos. ID interno = letra de grupo +
-- número de jornada (1..6). Misma convención que el esquema anterior
-- para no romper código existente del frontend.
-- ============================================================

insert into partidos (id, fase_id, grupo, equipo_local, equipo_visitante, fecha) values
-- GRUPO A: México, Sudáfrica, Corea del Sur, Chequia
('A1','grupos','A','México','Sudáfrica',         '2026-06-11T15:00:00-04:00'),
('A2','grupos','A','Corea del Sur','Chequia',    '2026-06-11T22:00:00-04:00'),
('A3','grupos','A','Chequia','Sudáfrica',        '2026-06-18T12:00:00-04:00'),
('A4','grupos','A','México','Corea del Sur',     '2026-06-18T21:00:00-04:00'),
('A5','grupos','A','Chequia','México',           '2026-06-24T21:00:00-04:00'),
('A6','grupos','A','Sudáfrica','Corea del Sur',  '2026-06-24T21:00:00-04:00'),

-- GRUPO B: Canadá, Bosnia y Herzegovina, Qatar, Suiza
('B1','grupos','B','Canadá','Bosnia y Herzegovina', '2026-06-12T15:00:00-04:00'),
('B2','grupos','B','Qatar','Suiza',                  '2026-06-13T15:00:00-04:00'),
('B3','grupos','B','Suiza','Bosnia y Herzegovina',   '2026-06-18T15:00:00-04:00'),
('B4','grupos','B','Canadá','Qatar',                 '2026-06-18T18:00:00-04:00'),
('B5','grupos','B','Suiza','Canadá',                 '2026-06-24T15:00:00-04:00'),
('B6','grupos','B','Bosnia y Herzegovina','Qatar',   '2026-06-24T15:00:00-04:00'),

-- GRUPO C: Brasil, Marruecos, Haití, Escocia
('C1','grupos','C','Brasil','Marruecos',     '2026-06-13T18:00:00-04:00'),
('C2','grupos','C','Haití','Escocia',        '2026-06-13T21:00:00-04:00'),
('C3','grupos','C','Escocia','Marruecos',    '2026-06-19T18:00:00-04:00'),
('C4','grupos','C','Brasil','Haití',         '2026-06-19T20:30:00-04:00'),
('C5','grupos','C','Escocia','Brasil',       '2026-06-24T18:00:00-04:00'),
('C6','grupos','C','Marruecos','Haití',      '2026-06-24T18:00:00-04:00'),

-- GRUPO D: EEUU, Paraguay, Australia, Turquía
('D1','grupos','D','EEUU','Paraguay',        '2026-06-12T21:00:00-04:00'),
('D2','grupos','D','Australia','Turquía',    '2026-06-14T00:00:00-04:00'),
('D3','grupos','D','EEUU','Australia',       '2026-06-19T15:00:00-04:00'),
('D4','grupos','D','Turquía','Paraguay',     '2026-06-19T23:00:00-04:00'),
('D5','grupos','D','Turquía','EEUU',         '2026-06-25T22:00:00-04:00'),
('D6','grupos','D','Paraguay','Australia',   '2026-06-25T22:00:00-04:00'),

-- GRUPO E: Alemania, Curazao, Costa de Marfil, Ecuador
('E1','grupos','E','Alemania','Curazao',                 '2026-06-14T13:00:00-04:00'),
('E2','grupos','E','Costa de Marfil','Ecuador',          '2026-06-14T19:00:00-04:00'),
('E3','grupos','E','Alemania','Costa de Marfil',         '2026-06-20T16:00:00-04:00'),
('E4','grupos','E','Ecuador','Curazao',                  '2026-06-20T20:00:00-04:00'),
('E5','grupos','E','Ecuador','Alemania',                 '2026-06-25T16:00:00-04:00'),
('E6','grupos','E','Curazao','Costa de Marfil',          '2026-06-25T16:00:00-04:00'),

-- GRUPO F: Holanda, Japón, Suecia, Túnez
('F1','grupos','F','Holanda','Japón',     '2026-06-14T16:00:00-04:00'),
('F2','grupos','F','Suecia','Túnez',      '2026-06-14T22:00:00-04:00'),
('F3','grupos','F','Holanda','Suecia',    '2026-06-20T13:00:00-04:00'),
('F4','grupos','F','Túnez','Japón',       '2026-06-21T00:00:00-04:00'),
('F5','grupos','F','Japón','Suecia',      '2026-06-25T19:00:00-04:00'),
('F6','grupos','F','Túnez','Holanda',     '2026-06-25T19:00:00-04:00'),

-- GRUPO G: Bélgica, Egipto, Irán, Nueva Zelanda
('G1','grupos','G','Bélgica','Egipto',         '2026-06-15T15:00:00-04:00'),
('G2','grupos','G','Irán','Nueva Zelanda',     '2026-06-15T21:00:00-04:00'),
('G3','grupos','G','Bélgica','Irán',           '2026-06-21T15:00:00-04:00'),
('G4','grupos','G','Nueva Zelanda','Egipto',   '2026-06-21T21:00:00-04:00'),
('G5','grupos','G','Egipto','Irán',            '2026-06-26T23:00:00-04:00'),
('G6','grupos','G','Nueva Zelanda','Bélgica',  '2026-06-26T23:00:00-04:00'),

-- GRUPO H: España, Cabo Verde, Arabia Saudita, Uruguay
('H1','grupos','H','España','Cabo Verde',             '2026-06-15T12:00:00-04:00'),
('H2','grupos','H','Arabia Saudita','Uruguay',        '2026-06-15T18:00:00-04:00'),
('H3','grupos','H','España','Arabia Saudita',         '2026-06-21T12:00:00-04:00'),
('H4','grupos','H','Uruguay','Cabo Verde',            '2026-06-21T18:00:00-04:00'),
('H5','grupos','H','Cabo Verde','Arabia Saudita',     '2026-06-26T20:00:00-04:00'),
('H6','grupos','H','Uruguay','España',                '2026-06-26T20:00:00-04:00'),

-- GRUPO I: Francia, Senegal, Irak, Noruega
('I1','grupos','I','Francia','Senegal',   '2026-06-16T15:00:00-04:00'),
('I2','grupos','I','Irak','Noruega',      '2026-06-16T18:00:00-04:00'),
('I3','grupos','I','Francia','Irak',      '2026-06-22T17:00:00-04:00'),
('I4','grupos','I','Noruega','Senegal',   '2026-06-22T20:00:00-04:00'),
('I5','grupos','I','Noruega','Francia',   '2026-06-26T15:00:00-04:00'),
('I6','grupos','I','Senegal','Irak',      '2026-06-26T15:00:00-04:00'),

-- GRUPO J: Argentina, Argelia, Austria, Jordania
('J1','grupos','J','Argentina','Argelia',   '2026-06-16T21:00:00-04:00'),
('J2','grupos','J','Austria','Jordania',    '2026-06-17T00:00:00-04:00'),
('J3','grupos','J','Argentina','Austria',   '2026-06-22T13:00:00-04:00'),
('J4','grupos','J','Jordania','Argelia',    '2026-06-22T23:00:00-04:00'),
('J5','grupos','J','Argelia','Austria',     '2026-06-27T22:00:00-04:00'),
('J6','grupos','J','Jordania','Argentina',  '2026-06-27T22:00:00-04:00'),

-- GRUPO K: Portugal, RD Congo, Uzbekistán, Colombia
('K1','grupos','K','Portugal','RD Congo',         '2026-06-17T13:00:00-04:00'),
('K2','grupos','K','Uzbekistán','Colombia',       '2026-06-17T22:00:00-04:00'),
('K3','grupos','K','Portugal','Uzbekistán',       '2026-06-23T13:00:00-04:00'),
('K4','grupos','K','Colombia','RD Congo',         '2026-06-23T22:00:00-04:00'),
('K5','grupos','K','Colombia','Portugal',         '2026-06-27T19:30:00-04:00'),
('K6','grupos','K','RD Congo','Uzbekistán',       '2026-06-27T19:30:00-04:00'),

-- GRUPO L: Inglaterra, Croacia, Ghana, Panamá
('L1','grupos','L','Inglaterra','Croacia',  '2026-06-17T16:00:00-04:00'),
('L2','grupos','L','Ghana','Panamá',        '2026-06-17T19:00:00-04:00'),
('L3','grupos','L','Inglaterra','Ghana',    '2026-06-23T16:00:00-04:00'),
('L4','grupos','L','Panamá','Croacia',      '2026-06-23T19:00:00-04:00'),
('L5','grupos','L','Panamá','Inglaterra',   '2026-06-27T17:00:00-04:00'),
('L6','grupos','L','Croacia','Ghana',       '2026-06-27T17:00:00-04:00')
on conflict (id) do update
  set fase_id          = excluded.fase_id,
      grupo            = excluded.grupo,
      equipo_local     = excluded.equipo_local,
      equipo_visitante = excluded.equipo_visitante,
      fecha            = excluded.fecha;

-- Índice para acelerar las búsquedas del job de sync por api_fixture_id.
create index if not exists partidos_api_fixture_id_idx
  on partidos (api_fixture_id);
