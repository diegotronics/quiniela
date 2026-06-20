-- Corrige el horario del partido Ecuador vs Curazao (grupo E).
-- Estaba cargado a las 11:00 pm y debe jugarse a las 8:00 pm (horario de
-- Venezuela, UTC-04:00). No toca el resultado, así que no recalcula puntos.
update partidos
   set fecha = '2026-06-20T20:00:00-04:00'
 where id = 'E4';
