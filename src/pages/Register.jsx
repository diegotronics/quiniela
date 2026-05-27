import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/app", { replace: true });
  }, [user, navigate]);

  const handleRegister = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await register(form);
    setBusy(false);
    if (!res.ok) setError(res.error);
    else navigate("/app", { replace: true });
  };

  return (
    <div style={S.bg}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>🏆</div>
        <h1 style={S.title}>Crea tu cuenta</h1>
        <p style={S.subtitle}>Únete a la Copa Familiar ⚽</p>
      </div>

      <div style={S.card}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={S.label}>🙂 Nombre</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleRegister()}
            style={S.input}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={S.label}>📧 Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleRegister()}
            style={S.input}
          />
        </div>
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={S.label}>🔒 Contraseña</label>
          <input
            type="password"
            placeholder="Mínimo 4 caracteres"
            autoComplete="new-password"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleRegister()}
            style={S.input}
          />
        </div>

        {error && <p style={S.error}>⚠️ {error}</p>}

        <button
          onClick={handleRegister}
          disabled={busy}
          style={{ ...S.button, opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "Creando cuenta..." : "Crear cuenta →"}
        </button>

        <p style={S.hint}>
          ¿Ya tienes cuenta? <Link to="/" style={S.link}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

const S = {
  bg: { minHeight: "100vh", background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d2137 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem", fontFamily: "'Georgia', serif" },
  title: { color: "#FFD700", fontSize: "1.8rem", fontWeight: 700, margin: 0, letterSpacing: "-0.5px", textShadow: "0 0 30px rgba(255,215,0,0.4)" },
  subtitle: { color: "#a0aec0", margin: "0.4rem 0 0", fontSize: "1rem", fontStyle: "italic" },
  card: { background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "340px" },
  label: { color: "#e2e8f0", fontSize: "0.9rem", display: "block", marginBottom: "0.5rem", fontFamily: "sans-serif" },
  input: { width: "100%", padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid rgba(255,215,0,0.3)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "1rem", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif" },
  error: { color: "#fc8181", fontSize: "0.9rem", textAlign: "center", marginBottom: "1rem", fontFamily: "sans-serif" },
  button: { width: "100%", padding: "1rem", background: "linear-gradient(135deg, #FFD700, #FFA500)", border: "none", borderRadius: "12px", color: "#1a1a1a", fontSize: "1.1rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" },
  hint: { color: "#a0aec0", fontSize: "0.85rem", textAlign: "center", marginTop: "1rem", fontFamily: "sans-serif" },
  link: { color: "#FFD700", textDecoration: "none", fontWeight: 600 },
};
