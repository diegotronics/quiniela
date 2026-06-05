import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  createUsuario,
  findUsuarioByCredenciales,
  findUsuarioByEmail,
} from "@/api/usuarios";

const AuthContext = createContext(null);
const STORAGE_KEY = "copa_familiar_user";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  const login = useCallback(async (email, password) => {
    const emailLimpio = (email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(emailLimpio)) return { ok: false, error: "Email inválido" };
    if (!password) return { ok: false, error: "Escribe tu contraseña" };

    try {
      const data = await findUsuarioByCredenciales(emailLimpio, password);
      if (!data) return { ok: false, error: "Email o contraseña incorrectos" };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setUser(data);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, []);

  const register = useCallback(async ({ nombre, email, password }) => {
    const nombreLimpio = (nombre || "").trim();
    const emailLimpio = (email || "").trim().toLowerCase();

    if (!nombreLimpio) return { ok: false, error: "Escribe tu nombre" };
    if (!EMAIL_RE.test(emailLimpio)) return { ok: false, error: "Email inválido" };
    if (!password || password.length < 6)
      return { ok: false, error: "La contraseña debe tener al menos 6 caracteres" };

    try {
      if (await findUsuarioByEmail(emailLimpio)) {
        return { ok: false, error: "Ese email ya está registrado" };
      }

      const nuevo = await createUsuario({
        nombre: nombreLimpio,
        email: emailLimpio,
        password,
        avatar: nombreLimpio.charAt(0).toUpperCase(),
        color: "#553C9A",
        es_admin: false,
        pagado: false,
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevo));
      setUser(nuevo);
      return { ok: true, user: nuevo };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

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
