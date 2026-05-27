import { supabase } from "@/lib/supabase";

const COLS =
  "id, usuario_id, partido_id, texto, created_at, updated_at, editado, usuario:usuarios(id, nombre, avatar, color)";

export const TEXTO_MAX = 500;

function validarTexto(texto) {
  const limpio = (texto || "").trim();
  if (!limpio) throw new Error("El mensaje está vacío");
  if (limpio.length > TEXTO_MAX) throw new Error(`Máximo ${TEXTO_MAX} caracteres`);
  return limpio;
}

// Agrupa reacciones por emoji y marca si el usuario actual reaccionó.
export function agruparReacciones(rows, userId) {
  const grupos = new Map();
  for (const r of rows || []) {
    const g = grupos.get(r.emoji) || { emoji: r.emoji, count: 0, miReaccion: false };
    g.count += 1;
    if (r.usuario_id === userId) g.miReaccion = true;
    grupos.set(r.emoji, g);
  }
  return Array.from(grupos.values());
}

export async function listarMensajes(partidoId, { limite = 200, userId = null } = {}) {
  let q = supabase
    .from("mensajes")
    .select(COLS)
    .order("created_at", { ascending: true })
    .limit(limite);
  q = partidoId == null ? q.is("partido_id", null) : q.eq("partido_id", partidoId);

  const { data: mensajes, error } = await q;
  if (error) throw error;

  const ids = (mensajes || []).map((m) => m.id);
  if (ids.length === 0) return [];

  const { data: reacs, error: errR } = await supabase
    .from("reacciones_mensaje")
    .select("mensaje_id, usuario_id, emoji")
    .in("mensaje_id", ids);
  if (errR) throw errR;

  const porMensaje = new Map();
  for (const r of reacs || []) {
    const arr = porMensaje.get(r.mensaje_id) || [];
    arr.push(r);
    porMensaje.set(r.mensaje_id, arr);
  }

  return mensajes.map((m) => ({
    ...m,
    reacciones: agruparReacciones(porMensaje.get(m.id) || [], userId),
  }));
}

export async function obtenerMensaje(id) {
  const { data, error } = await supabase
    .from("mensajes")
    .select(COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listarReaccionesPorMensaje(mensajeId) {
  const { data, error } = await supabase
    .from("reacciones_mensaje")
    .select("mensaje_id, usuario_id, emoji")
    .eq("mensaje_id", mensajeId);
  if (error) throw error;
  return data || [];
}

export async function enviarMensaje({ usuarioId, partidoId, texto }) {
  const limpio = validarTexto(texto);
  const { data, error } = await supabase
    .from("mensajes")
    .insert({ usuario_id: usuarioId, partido_id: partidoId ?? null, texto: limpio })
    .select(COLS)
    .single();
  if (error) throw error;
  return { ...data, reacciones: [] };
}

export async function editarMensaje(id, texto) {
  const limpio = validarTexto(texto);
  const { data, error } = await supabase
    .from("mensajes")
    .update({ texto: limpio })
    .eq("id", id)
    .select(COLS)
    .single();
  if (error) throw error;
  return data;
}

export async function borrarMensaje(id) {
  const { error } = await supabase.from("mensajes").delete().eq("id", id);
  if (error) throw error;
}

// Toggle: si la reacción existe, la borra; si no, la inserta.
export async function alternarReaccion({ mensajeId, usuarioId, emoji }) {
  const { data: existente, error: errSel } = await supabase
    .from("reacciones_mensaje")
    .select("id")
    .eq("mensaje_id", mensajeId)
    .eq("usuario_id", usuarioId)
    .eq("emoji", emoji)
    .maybeSingle();
  if (errSel) throw errSel;

  if (existente) {
    const { error } = await supabase
      .from("reacciones_mensaje")
      .delete()
      .eq("id", existente.id);
    if (error) throw error;
    return { action: "removed" };
  }

  const { error } = await supabase
    .from("reacciones_mensaje")
    .insert({ mensaje_id: mensajeId, usuario_id: usuarioId, emoji });
  if (error) throw error;
  return { action: "added" };
}
