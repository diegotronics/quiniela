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

export async function setResultadoPartido(id, goles_local, goles_visitante) {
  // El trigger en BD recalcula puntos_obtenidos de todas las predicciones.
  const { error } = await supabase
    .from("partidos")
    .update({ goles_local, goles_visitante, resultado_ingresado: true })
    .eq("id", id);
  if (error) throw error;
}
