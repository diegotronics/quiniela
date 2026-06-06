-- ============================================================
-- 12_ajuste_puntos.sql
--
-- Reajuste de la puntuación del torneo (configuración "ESTANDAR").
-- Baja el peso de la fase de grupos del 51 % al ~38 % del total y
-- escala el valor de las eliminatorias, para que una mala fase de
-- grupos sea remontable sin volver el juego una lotería.
--
-- Los triggers existentes recalculan todo automáticamente:
--   - trg_fase_recalc (08) recalcula predicciones al cambiar `fases`.
--   - trg_apuesta_especial_recalc (10) recalcula las apuestas
--     especiales al cambiar la config.
-- ============================================================

-- Puntos por fase: (exacto, ganador)
update fases set pts_exacto = 2,  pts_ganador = 1 where id = 'grupos';
update fases set pts_exacto = 4,  pts_ganador = 2 where id = 'dieciseisavos';
update fases set pts_exacto = 6,  pts_ganador = 2 where id = 'octavos';
update fases set pts_exacto = 8,  pts_ganador = 3 where id = 'cuartos';
update fases set pts_exacto = 11, pts_ganador = 4 where id = 'semifinal';
update fases set pts_exacto = 6,  pts_ganador = 2 where id = 'tercerpuesto';
update fases set pts_exacto = 16, pts_ganador = 6 where id = 'final';

-- Apuestas especiales
update apuestas_especiales_config
   set pts_campeon    = 16,
       pts_subcampeon = 10,
       pts_goleador   = 10,
       pts_sorpresa   = 6
 where id = 'global';

-- Total máximo del torneo: 374 pts
--   grupos 144 (38.5%) · eliminatorias 188 (50.3%) · especiales 42 (11.2%)
