import { supabase } from "@/lib/supabase";

const CFG_COLS =
  "id, pts_campeon, pts_subcampeon, pts_goleador, pts_sorpresa, " +
  "campeon, subcampeon, goleador, sorpresa, cierra_en, abierta_manual, updated_at";

const COLS =
  "id, usuario_id, campeon, subcampeon, goleador, sorpresa, " +
  "puntos_obtenidos, updated_at";

export async function getApuestasEspecialesConfig() {
  const { data, error } = await supabase
    .from("apuestas_especiales_config")
    .select(CFG_COLS)
    .eq("id", "global")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateApuestasEspecialesConfig(patch) {
  const { data, error } = await supabase
    .from("apuestas_especiales_config")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", "global")
    .select(CFG_COLS)
    .single();
  if (error) throw error;
  return data;
}

export async function getApuestaEspecialUsuario(usuario_id) {
  if (!usuario_id) return null;
  const { data, error } = await supabase
    .from("apuestas_especiales")
    .select(COLS)
    .eq("usuario_id", usuario_id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertApuestaEspecial({
  usuario_id,
  campeon,
  subcampeon,
  goleador,
  sorpresa,
}) {
  const { data, error } = await supabase
    .from("apuestas_especiales")
    .upsert(
      {
        usuario_id,
        campeon: campeon || null,
        subcampeon: subcampeon || null,
        goleador: goleador || null,
        sorpresa: sorpresa || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "usuario_id" }
    )
    .select(COLS)
    .single();
  if (error) throw error;
  return data;
}

export async function listPuntajesApuestasEspeciales() {
  const { data, error } = await supabase
    .from("apuestas_especiales")
    .select("usuario_id, puntos_obtenidos");
  if (error) throw error;
  return data || [];
}
