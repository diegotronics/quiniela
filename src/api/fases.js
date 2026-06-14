import { supabase } from "@/lib/supabase";

const COLS = "id, nombre, icono, orden, pts_exacto, pts_ganador";

export async function listFases() {
  const { data, error } = await supabase.from("fases").select(COLS).order("orden");
  if (error) throw error;
  return data || [];
}

export async function updateFasePuntos(id, pts_exacto, pts_ganador) {
  const { error } = await supabase
    .from("fases")
    .update({ pts_exacto, pts_ganador })
    .eq("id", id);
  if (error) throw error;
}
