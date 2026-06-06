import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, homePathFor } from "@/context/AuthContext";
import { Button, Card, Icon } from "@/components/ui";
import {
  AuthLayout,
  Field,
  IconInput,
  PasswordInput,
} from "./_authShared.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate(homePathFor(user), { replace: true });
  }, [user, navigate]);

  const handleLogin = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await login(form.email.trim(), form.password);
    setBusy(false);
    if (!res.ok) setError(res.error);
    else navigate(homePathFor(res.user), { replace: true });
  };

  return (
    <AuthLayout
      title="La Copa Familiar"
      subtitle="Mundial 2026 · pronósticos en familia"
      footer={
        <div
          style={{
            marginTop: 22,
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span className="auth-footnote-chip">
            <Icon.Group /> Familia
          </span>
          <span className="auth-footnote-chip">
            <Icon.Trophy /> Premios
          </span>
          <span className="auth-footnote-chip">
            <Icon.Cal /> Jun–Jul 2026
          </span>
        </div>
      }
    >
      <Card pad={26}>
        <Field label="Correo">
          <IconInput
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            leading={<Icon.Mail size={18} />}
            autoFocus
          />
        </Field>
        <Field label="Contraseña">
          <PasswordInput
            placeholder="••••••"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            leading={<Icon.Lock size={16} />}
          />
        </Field>

        {error && (
          <div
            role="alert"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--danger-soft)",
              color: "var(--danger)",
              fontSize: 13,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              border:
                "1px solid color-mix(in oklab, var(--danger) 25%, transparent)",
            }}
          >
            <Icon.X />
            <span>{error}</span>
          </div>
        )}

        <Button onClick={handleLogin} disabled={busy} block size="lg">
          {busy ? "Entrando..." : "Entrar"}
          {!busy && <Icon.Arrow />}
        </Button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "18px 0 14px",
            color: "var(--ink-4)",
            fontSize: 11,
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
          <span>o</span>
          <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>

        <p
          style={{
            color: "var(--ink-3)",
            fontSize: 13.5,
            textAlign: "center",
            margin: 0,
          }}
        >
          ¿No tienes cuenta?{" "}
          <Link
            to="/registro"
            style={{
              color: "var(--accent-ink)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Regístrate
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
