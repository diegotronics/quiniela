import { supabase } from "@/lib/supabase";

const COLS = "id, nombre, icono, estado, orden, pts_exacto, pts_ganador";

export async function listFases() {
  const { data, error } = await supabase.from("fases").select(COLS).order("orden");
  if (error) throw error;
  return data || [];
}

export async function updateFaseEstado(id, estado) {
  const { error } = await supabase.from("fases").update({ estado }).eq("id", id);
  if (error) throw error;
}
