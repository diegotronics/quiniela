import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const STORAGE_KEY = "copa_familiar_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const login = async (usuario, password) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre, usuario, avatar, color, es_admin, pagado")
      .eq("usuario", usuario)
      .eq("password", password)
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: "Usuario o contraseña incorrectos" };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUser(data);
    return { ok: true };
  };

  const register = async ({ nombre, email, password }) => {
    const nombreLimpio = (nombre || "").trim();
    const emailLimpio = (email || "").trim().toLowerCase();

    if (!nombreLimpio) return { ok: false, error: "Escribe tu nombre" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio))
      return { ok: false, error: "Email inválido" };
    if (!password || password.length < 4)
      return { ok: false, error: "La contraseña debe tener al menos 4 caracteres" };

    // Verificar que el email no esté tomado
    const { data: existente, error: errBusca } = await supabase
      .from("usuarios")
      .select("id")
      .ilike("email", emailLimpio)
      .maybeSingle();

    if (errBusca) return { ok: false, error: errBusca.message };
    if (existente) return { ok: false, error: "Ese email ya está registrado" };

    // Generar un "usuario" a partir del email (lo usa el login actual)
    const base = emailLimpio.split("@")[0].replace(/[^a-z0-9_.-]/gi, "").toLowerCase() || "user";
    let usuario = base;
    for (let i = 1; i < 50; i++) {
      const { data: tomado } = await supabase
        .from("usuarios")
        .select("id")
        .eq("usuario", usuario)
        .maybeSingle();
      if (!tomado) break;
      usuario = `${base}${i}`;
    }

    const nuevo = {
      nombre: nombreLimpio,
      usuario,
      email: emailLimpio,
      password,
      avatar: nombreLimpio.charAt(0).toUpperCase(),
      color: "#553C9A",
      es_admin: false,
      pagado: false,
    };

    const { data, error } = await supabase
      .from("usuarios")
      .insert(nuevo)
      .select("id, nombre, usuario, avatar, color, es_admin, pagado")
      .single();

    if (error) return { ok: false, error: error.message };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUser(data);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fuera de AuthProvider");
  return ctx;
}
