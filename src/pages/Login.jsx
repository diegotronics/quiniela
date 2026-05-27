import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, Icon } from "@/components/ui";
import { AuthLayout, Field, inputStyle } from "./_authShared.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/app/inicio", { replace: true });
  }, [user, navigate]);

  const handleLogin = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await login(form.email.trim(), form.password);
    setBusy(false);
    if (!res.ok) setError(res.error);
    else navigate("/app/inicio", { replace: true });
  };

  return (
    <AuthLayout title="La Copa Familiar" subtitle="Mundial 2026 · pronósticos en familia">
      <Card pad={24}>
        <Field label="Email">
          <input
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={inputStyle}
            autoFocus
          />
        </Field>
        <Field label="Contraseña">
          <input
            type="password"
            placeholder="••••••"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={inputStyle}
          />
        </Field>

        {error && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "var(--danger-soft)",
              color: "var(--danger)",
              fontSize: 13,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon.X /> {error}
          </div>
        )}

        <Button onClick={handleLogin} disabled={busy} block size="lg">
          {busy ? "Entrando..." : "Entrar"}
          {!busy && <Icon.Arrow />}
        </Button>

        <p
          style={{
            color: "var(--ink-3)",
            fontSize: 13,
            textAlign: "center",
            marginTop: 16,
            marginBottom: 0,
          }}
        >
          ¿No tenés cuenta?{" "}
          <Link to="/registro" style={{ color: "var(--accent-ink)", fontWeight: 600 }}>
            Registrate
          </Link>
        </p>
      </Card>

      <div
        style={{
          marginTop: 22,
          display: "flex",
          justifyContent: "center",
          gap: 22,
          color: "var(--ink-3)",
          fontSize: 12,
        }}
      >
        <Footnote icon={<Icon.Group />} label="Familia" />
        <Footnote icon={<Icon.Trophy />} label="Premios" />
        <Footnote icon={<Icon.Cal />} label="Jun–Jul 2026" />
      </div>
    </AuthLayout>
  );
}

function Footnote({ icon, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {icon} {label}
    </span>
  );
}
