import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  createUsuario,
  findUsuarioByCredenciales,
  findUsuarioByEmail,
  findUsuarioByUsername,
} from "@/api/usuarios";

const AuthContext = createContext(null);
const STORAGE_KEY = "copa_familiar_user";

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

  const login = useCallback(async (usuario, password) => {
    try {
      const data = await findUsuarioByCredenciales(usuario, password);
      if (!data) return { ok: false, error: "Usuario o contraseña incorrectos" };
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio))
      return { ok: false, error: "Email inválido" };
    if (!password || password.length < 4)
      return { ok: false, error: "La contraseña debe tener al menos 4 caracteres" };

    try {
      if (await findUsuarioByEmail(emailLimpio)) {
        return { ok: false, error: "Ese email ya está registrado" };
      }

      const base = emailLimpio.split("@")[0].replace(/[^a-z0-9_.-]/gi, "").toLowerCase() || "user";
      let usuario = base;
      for (let i = 1; i < 50; i++) {
        if (!(await findUsuarioByUsername(usuario))) break;
        usuario = `${base}${i}`;
      }

      const nuevo = await createUsuario({
        nombre: nombreLimpio,
        usuario,
        email: emailLimpio,
        password,
        avatar: nombreLimpio.charAt(0).toUpperCase(),
        color: "#553C9A",
        es_admin: false,
        pagado: false,
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevo));
      setUser(nuevo);
      return { ok: true };
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
