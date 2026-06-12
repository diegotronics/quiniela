import { supabase } from "@/lib/supabase";

const COLS =
  "id, fase_id, grupo, equipo_local, equipo_visitante, fecha, goles_local, goles_visitante, resultado_ingresado";

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

export async function setResultadoPartido(id, goles_local, goles_visitante) {
  // El trigger en BD recalcula puntos_obtenidos de todas las predicciones.
  const { error } = await supabase
    .from("partidos")
    .update({ goles_local, goles_visitante, resultado_ingresado: true })
    .eq("id", id);
  if (error) throw error;
}

export async function clearResultadoPartido(id) {
  // El trigger en BD recalcula puntos_obtenidos de todas las predicciones.
  const { error } = await supabase
    .from("partidos")
    .update({ goles_local: null, goles_visitante: null, resultado_ingresado: false })
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
