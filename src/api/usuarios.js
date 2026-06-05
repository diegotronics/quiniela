import { supabase } from "@/lib/supabase";

const PUBLIC_COLS = "id, nombre, email, avatar, color, es_admin, pagado";
const ADMIN_COLS = "id, nombre, email, avatar, color, es_admin, pagado, created_at";

export async function listUsuariosPublic() {
  const { data, error } = await supabase.from("usuarios").select(PUBLIC_COLS);
  if (error) throw error;
  return data || [];
}

export async function listUsuariosAdmin() {
  const { data, error } = await supabase
    .from("usuarios")
    .select(ADMIN_COLS)
    .order("created_at");
  if (error) throw error;
  return data || [];
}

export async function findUsuarioByCredenciales(email, password) {
  // La verificación de la contraseña ocurre en el servidor (RPC con bcrypt);
  // el cliente nunca recibe el hash. Devuelve los datos públicos o null.
  const { data, error } = await supabase.rpc("login_usuario", {
    p_email: email,
    p_password: password,
  });
  if (error) throw error;
  return data || null;
}

export async function findUsuarioByEmail(email) {
  // `eq` con email normalizado: evita que `%`/`_` actúen como comodines.
  const { data, error } = await supabase
    .from("usuarios")
    .select("id")
    .eq("email", (email || "").trim().toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createUsuario(payload) {
  const { data, error } = await supabase
    .from("usuarios")
    .insert(payload)
    .select(PUBLIC_COLS)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUsuario(id, patch) {
  const { error } = await supabase.from("usuarios").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteUsuario(id) {
  const { error } = await supabase.from("usuarios").delete().eq("id", id);
  if (error) throw error;
}
