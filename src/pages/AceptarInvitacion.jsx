import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getInvitacionByToken,
  isInvitacionVigente,
  markInvitacionAceptada,
} from "@/api/invitaciones";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, Icon } from "@/components/ui";
import { AuthLayout, Field, inputStyle } from "./_authShared.jsx";

export default function AceptarInvitacion() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [invitacion, setInvitacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const inv = await getInvitacionByToken(token);
        if (cancel) return;
        if (!inv) {
          setLoadError("Esta invitación no existe.");
        } else if (inv.estado === "aceptada") {
          setLoadError("Esta invitación ya fue usada. Iniciá sesión con tu cuenta.");
        } else if (inv.estado === "revocada") {
          setLoadError("Esta invitación fue revocada por el administrador.");
        } else if (!isInvitacionVigente(inv)) {
          setLoadError("Esta invitación venció. Pedile una nueva al administrador.");
        } else {
          setInvitacion(inv);
          setForm((f) => ({
            ...f,
            nombre: inv.nombre || "",
            email: inv.email || "",
          }));
        }
      } catch (e) {
        if (!cancel) setLoadError(e.message);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [token]);

  useEffect(() => {
    if (!loading && user && invitacion) {
      navigate("/app/onboarding", { replace: true });
    }
  }, [loading, user, invitacion, navigate]);

  const handleAceptar = async () => {
    if (busy || !invitacion) return;
    setBusy(true);
    setError("");
    const res = await register(form);
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      return;
    }
    try {
      await markInvitacionAceptada(token, res.user?.id || null);
    } catch {
      /* la cuenta quedó creada; no bloqueamos la entrada */
    }
    setBusy(false);
    navigate("/app/onboarding", { replace: true });
  };

  if (loading) {
    return (
      <AuthLayout title="Invitación familiar" subtitle="Verificando link…">
        <Card pad={24}>
          <div style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center" }}>
            Un momento…
          </div>
        </Card>
      </AuthLayout>
    );
  }

  if (loadError) {
    return (
      <AuthLayout title="Invitación familiar" subtitle="No pudimos abrir el link">
        <Card pad={24}>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--danger-soft)",
              color: "var(--danger)",
              fontSize: 13,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon.X /> {loadError}
          </div>
          <Link
            to="/"
            style={{
              color: "var(--accent-ink)",
              fontWeight: 600,
              fontSize: 13,
              display: "block",
              textAlign: "center",
            }}
          >
            Ir al inicio de sesión
          </Link>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Sumate a la quiniela" subtitle="Completá tus datos para entrar">
      <Card pad={24}>
        <Field label="Nombre">
          <input
            type="text"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleAceptar()}
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
            onKeyDown={(e) => e.key === "Enter" && handleAceptar()}
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
            onKeyDown={(e) => e.key === "Enter" && handleAceptar()}
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

        <Button onClick={handleAceptar} disabled={busy} block size="lg">
          {busy ? "Creando cuenta..." : "Aceptar invitación"}
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
          ¿Ya tenés cuenta?{" "}
          <Link to="/" style={{ color: "var(--accent-ink)", fontWeight: 600 }}>
            Iniciar sesión
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
