import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, Icon } from "@/components/ui";
import {
  AuthLayout,
  Field,
  IconInput,
  PasswordInput,
} from "./_authShared.jsx";

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

  const meetsMin = form.password.length >= 6;

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Únete a la quiniela familiar"
      footer={
        <p
          style={{
            margin: "20px 0 0",
            textAlign: "center",
            color: "var(--ink-4)",
            fontSize: 11.5,
            lineHeight: 1.5,
          }}
        >
          Al registrarte aceptas participar en la quiniela familiar
          <br />
          del Mundial 2026.
        </p>
      }
    >
      <Card pad={26}>
        <Field label="Nombre">
          <IconInput
            type="text"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={(e) =>
              setForm((p) => ({ ...p, nombre: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            leading={<Icon.User size={18} />}
            autoComplete="name"
            autoFocus
          />
        </Field>
        <Field label="Correo">
          <IconInput
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            leading={<Icon.Mail size={18} />}
          />
        </Field>
        <Field
          label="Contraseña"
          hint={
            form.password.length > 0 && (
              <span
                style={{
                  color: meetsMin ? "var(--accent-ink)" : "var(--ink-3)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {meetsMin ? <Icon.Check /> : null}
                {meetsMin ? "Mínimo cumplido" : "Mínimo 6 caracteres"}
              </span>
            )
          }
        >
          <PasswordInput
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
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

        <Button onClick={handleRegister} disabled={busy} block size="lg">
          {busy ? "Creando cuenta..." : "Crear cuenta"}
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
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/"
            style={{
              color: "var(--accent-ink)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Iniciar sesión
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
