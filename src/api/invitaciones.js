import { supabase } from "@/lib/supabase";

const COLS =
  "token, email, nombre, creada_por, aceptada_por, estado, created_at, expires_at, accepted_at";

const DEFAULT_TTL_DAYS = 30;

function genToken() {
  const bytes = new Uint8Array(16);
  (globalThis.crypto || window.crypto).getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function listInvitaciones() {
  const { data, error } = await supabase
    .from("invitaciones")
    .select(COLS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createInvitacion({ email, nombre, creada_por, ttlDays = DEFAULT_TTL_DAYS } = {}) {
  const token = genToken();
  const expires_at = new Date(Date.now() + ttlDays * 86400000).toISOString();
  const payload = {
    token,
    email: email ? email.trim().toLowerCase() : null,
    nombre: nombre ? nombre.trim() : null,
    creada_por: creada_por || null,
    estado: "pendiente",
    expires_at,
  };
  const { data, error } = await supabase
    .from("invitaciones")
    .insert(payload)
    .select(COLS)
    .single();
  if (error) throw error;
  return data;
}

export async function getInvitacionByToken(token) {
  const { data, error } = await supabase
    .from("invitaciones")
    .select(COLS)
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function revokeInvitacion(token) {
  const { error } = await supabase
    .from("invitaciones")
    .update({ estado: "revocada" })
    .eq("token", token);
  if (error) throw error;
}

export async function markInvitacionAceptada(token, usuario_id) {
  const { error } = await supabase
    .from("invitaciones")
    .update({
      estado: "aceptada",
      aceptada_por: usuario_id,
      accepted_at: new Date().toISOString(),
    })
    .eq("token", token);
  if (error) throw error;
}

export function buildInviteUrl(token) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/invitacion/${token}`;
}

export function isInvitacionVigente(inv) {
  if (!inv) return false;
  if (inv.estado !== "pendiente") return false;
  if (inv.expires_at && new Date(inv.expires_at).getTime() < Date.now()) return false;
  return true;
}
