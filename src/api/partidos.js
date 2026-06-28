import { supabase } from "@/lib/supabase";

const COLS =
  "id, fase_id, grupo, equipo_local, equipo_visitante, fecha, goles_local, goles_visitante, resultado_ingresado, ganador";

export async function listPartidosByFase(faseId) {
  const { data, error } = await supabase
    .from("partidos")
    .select(COLS)
    .eq("fase_id", faseId);
  if (error) throw error;
  return data || [];
}

// Los 72 partidos de grupos en orden A1..L6 (orden del seed).
export async function listPartidosGrupos() {
  const { data, error } = await supabase
    .from("partidos")
    .select(COLS)
    .eq("fase_id", "grupos")
    .order("id", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function setResultadoPartido(id, goles_local, goles_visitante, ganador = null) {
  // El trigger en BD recalcula puntos_obtenidos de todas las predicciones.
  // `ganador` solo aplica a eliminatorias empatadas (definidas por penales):
  // sirve para que el trigger de avance sepa qué equipo pasa a la siguiente
  // fase. En partidos con marcador decisivo o de grupos va NULL.
  const { error } = await supabase
    .from("partidos")
    .update({ goles_local, goles_visitante, resultado_ingresado: true, ganador })
    .eq("id", id);
  if (error) throw error;
}

// Actualiza solo la fecha/hora de un partido. El texto debe venir en formato
// ISO con offset (p. ej. "2026-06-20T20:00:00-04:00"). No toca el resultado,
// por lo que el trigger de recálculo de puntos no se dispara.
export async function setFechaPartido(id, fecha) {
  const { error } = await supabase
    .from("partidos")
    .update({ fecha })
    .eq("id", id);
  if (error) throw error;
}

export async function clearResultadoPartido(id) {
  // El trigger en BD recalcula puntos_obtenidos de todas las predicciones.
  const { error } = await supabase
    .from("partidos")
    .update({ goles_local: null, goles_visitante: null, resultado_ingresado: false, ganador: null })
    .eq("id", id);
  if (error) throw error;
}

// Solo id y fecha de los partidos sin resultado: es el chequeo barato que
// hace la rutina de sincronización al abrir la app.
export async function listPartidosSinResultado() {
  const { data, error } = await supabase
    .from("partidos")
    .select("id, fecha, resultado_ingresado")
    .eq("resultado_ingresado", false);
  if (error) throw error;
  return data || [];
}

export async function countPartidos() {
  const { count, error } = await supabase
    .from("partidos")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
}
