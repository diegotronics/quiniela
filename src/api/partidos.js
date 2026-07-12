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

// Crea un partido desde el panel de administración. `grupo` solo aplica a la
// fase de grupos; en eliminatorias va null.
export async function createPartido({ id, fase_id, grupo = null, equipo_local, equipo_visitante, fecha }) {
  const { error } = await supabase.from("partidos").insert({
    id,
    fase_id,
    grupo,
    equipo_local,
    equipo_visitante,
    fecha,
    resultado_ingresado: false,
  });
  if (error) throw error;
}

// Corrige los equipos de un partido ya cargado (p. ej. un cruce de
// eliminatoria que el cuadro armó con un equipo equivocado). Si el ganador
// registrado deja de coincidir con los nuevos equipos, se limpia para
// mantener la consistencia del avance.
export async function setEquiposPartido(id, equipo_local, equipo_visitante, ganadorActual = null) {
  const campos = { equipo_local, equipo_visitante };
  if (ganadorActual && ganadorActual !== equipo_local && ganadorActual !== equipo_visitante) {
    campos.ganador = null;
  }
  const { error } = await supabase
    .from("partidos")
    .update(campos)
    .eq("id", id);
  if (error) throw error;
}

// Elimina un partido; sus predicciones se borran en cascada (FK on delete cascade).
export async function deletePartido(id) {
  const { error } = await supabase.from("partidos").delete().eq("id", id);
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
