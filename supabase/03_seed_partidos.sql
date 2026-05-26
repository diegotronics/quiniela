-- ============================================================
-- 72 partidos de la fase de grupos (12 grupos x 6 partidos)
-- Los partidos de eliminatorias se insertan despues, cuando se
-- conozcan los clasificados.
-- ============================================================

insert into partidos (id,fase_id,grupo,equipo_local,equipo_visitante,fecha) values
-- GRUPO A
('A1','grupos','A','México','EEUU','11 Jun'),
('A2','grupos','A','Canadá','Honduras','12 Jun'),
('A3','grupos','A','México','Canadá','15 Jun'),
('A4','grupos','A','EEUU','Honduras','15 Jun'),
('A5','grupos','A','México','Honduras','19 Jun'),
('A6','grupos','A','EEUU','Canadá','19 Jun'),
-- GRUPO B
('B1','grupos','B','España','Francia','11 Jun'),
('B2','grupos','B','Portugal','Marruecos','12 Jun'),
('B3','grupos','B','España','Portugal','15 Jun'),
('B4','grupos','B','Francia','Marruecos','15 Jun'),
('B5','grupos','B','España','Marruecos','19 Jun'),
('B6','grupos','B','Francia','Portugal','19 Jun'),
-- GRUPO C
('C1','grupos','C','Brasil','Argentina','11 Jun'),
('C2','grupos','C','Colombia','Ecuador','12 Jun'),
('C3','grupos','C','Brasil','Colombia','15 Jun'),
('C4','grupos','C','Argentina','Ecuador','15 Jun'),
('C5','grupos','C','Brasil','Ecuador','19 Jun'),
('C6','grupos','C','Argentina','Colombia','19 Jun'),
-- GRUPO D
('D1','grupos','D','Alemania','Inglaterra','12 Jun'),
('D2','grupos','D','Italia','Bélgica','12 Jun'),
('D3','grupos','D','Alemania','Italia','16 Jun'),
('D4','grupos','D','Inglaterra','Bélgica','16 Jun'),
('D5','grupos','D','Alemania','Bélgica','20 Jun'),
('D6','grupos','D','Inglaterra','Italia','20 Jun'),
-- GRUPO E
('E1','grupos','E','Holanda','Turquía','12 Jun'),
('E2','grupos','E','Ucrania','Austria','13 Jun'),
('E3','grupos','E','Holanda','Ucrania','16 Jun'),
('E4','grupos','E','Turquía','Austria','16 Jun'),
('E5','grupos','E','Holanda','Austria','20 Jun'),
('E6','grupos','E','Turquía','Ucrania','20 Jun'),
-- GRUPO F
('F1','grupos','F','Japón','Corea del Sur','13 Jun'),
('F2','grupos','F','Australia','Arabia Saudita','13 Jun'),
('F3','grupos','F','Japón','Australia','17 Jun'),
('F4','grupos','F','Corea del Sur','Arabia Saudita','17 Jun'),
('F5','grupos','F','Japón','Arabia Saudita','21 Jun'),
('F6','grupos','F','Corea del Sur','Australia','21 Jun'),
-- GRUPO G
('G1','grupos','G','Senegal','Nigeria','13 Jun'),
('G2','grupos','G','Costa de Marfil','Ghana','14 Jun'),
('G3','grupos','G','Senegal','Costa de Marfil','17 Jun'),
('G4','grupos','G','Nigeria','Ghana','17 Jun'),
('G5','grupos','G','Senegal','Ghana','21 Jun'),
('G6','grupos','G','Nigeria','Costa de Marfil','21 Jun'),
-- GRUPO H
('H1','grupos','H','Uruguay','Chile','14 Jun'),
('H2','grupos','H','Perú','Paraguay','14 Jun'),
('H3','grupos','H','Uruguay','Perú','18 Jun'),
('H4','grupos','H','Chile','Paraguay','18 Jun'),
('H5','grupos','H','Uruguay','Paraguay','22 Jun'),
('H6','grupos','H','Chile','Perú','22 Jun'),
-- GRUPO I
('I1','grupos','I','Suiza','Dinamarca','14 Jun'),
('I2','grupos','I','Escocia','Serbia','15 Jun'),
('I3','grupos','I','Suiza','Escocia','18 Jun'),
('I4','grupos','I','Dinamarca','Serbia','18 Jun'),
('I5','grupos','I','Suiza','Serbia','22 Jun'),
('I6','grupos','I','Dinamarca','Escocia','22 Jun'),
-- GRUPO J
('J1','grupos','J','Irán','Qatar','15 Jun'),
('J2','grupos','J','Irak','Jordania','15 Jun'),
('J3','grupos','J','Irán','Irak','19 Jun'),
('J4','grupos','J','Qatar','Jordania','19 Jun'),
('J5','grupos','J','Irán','Jordania','23 Jun'),
('J6','grupos','J','Qatar','Irak','23 Jun'),
-- GRUPO K
('K1','grupos','K','Costa Rica','Panamá','15 Jun'),
('K2','grupos','K','Jamaica','Venezuela','16 Jun'),
('K3','grupos','K','Costa Rica','Jamaica','19 Jun'),
('K4','grupos','K','Panamá','Venezuela','19 Jun'),
('K5','grupos','K','Costa Rica','Venezuela','23 Jun'),
('K6','grupos','K','Panamá','Jamaica','23 Jun'),
-- GRUPO L
('L1','grupos','L','Suecia','Noruega','16 Jun'),
('L2','grupos','L','Finlandia','Islandia','16 Jun'),
('L3','grupos','L','Suecia','Finlandia','20 Jun'),
('L4','grupos','L','Noruega','Islandia','20 Jun'),
('L5','grupos','L','Suecia','Islandia','24 Jun'),
('L6','grupos','L','Noruega','Finlandia','24 Jun')
on conflict (id) do nothing;
