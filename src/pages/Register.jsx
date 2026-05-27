import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, Icon } from "@/components/ui";
import { AuthLayout, Field, inputStyle } from "./_authShared.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/app/onboarding", { replace: true });
  }, [user, navigate]);

  const handleRegister = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await register(form);
    setBusy(false);
    if (!res.ok) setError(res.error);
    else navigate("/app/onboarding", { replace: true });
  };

  return (
    <AuthLayout title="Crear cuenta" subtitle="Únete a la quiniela familiar">
      <Card pad={24}>
        <Field label="Nombre">
          <input
            type="text"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            style={inputStyle}
            autoFocus
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            style={inputStyle}
          />
        </Field>
        <Field label="Contraseña">
          <input
            type="password"
            placeholder="Mínimo 4 caracteres"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
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

        <Button onClick={handleRegister} disabled={busy} block size="lg">
          {busy ? "Creando cuenta..." : "Crear cuenta"}
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
          ¿Ya tienes cuenta?{" "}
          <Link to="/" style={{ color: "var(--accent-ink)", fontWeight: 600 }}>
            Iniciar sesión
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
