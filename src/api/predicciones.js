import { supabase } from "@/lib/supabase";

const COLS =
  "id, usuario_id, partido_id, goles_local, goles_visitante, puntos_obtenidos, updated_at";

export async function listPrediccionesByUsuario(usuario_id) {
  const { data, error } = await supabase
    .from("predicciones")
    .select(COLS)
    .eq("usuario_id", usuario_id);
  if (error) throw error;
  return data || [];
}

export async function listPuntajesGlobales() {
  const { data, error } = await supabase
    .from("predicciones")
    .select("usuario_id, partido_id, puntos_obtenidos");
  if (error) throw error;
  return data || [];
}

export async function upsertPrediccion({ usuario_id, partido_id, goles_local, goles_visitante }) {
  const { data, error } = await supabase
    .from("predicciones")
    .upsert(
      {
        usuario_id,
        partido_id,
        goles_local,
        goles_visitante,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "usuario_id,partido_id" }
    )
    .select(COLS)
    .maybeSingle();
  if (error) throw error;
  return data;
}
