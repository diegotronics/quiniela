import { useId, useState } from "react";
import { Icon, Logo } from "@/components/ui";

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div
      className="auth-bg"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1.25rem",
      }}
    >
      <div className="auth-bg-orb" aria-hidden="true" />

      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div
            style={{
              display: "inline-flex",
              padding: 4,
              borderRadius: 22,
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--accent) 30%, transparent), color-mix(in oklab, var(--coral) 28%, transparent))",
              boxShadow: "var(--shadow-accent)",
              marginBottom: 14,
            }}
          >
            <Logo size={68} rounded />
          </div>

          <div className="auth-tricolor" aria-hidden="true" />

          <h1
            className="font-display"
            style={{
              margin: 0,
              fontSize: 30,
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: -0.8,
              color: "var(--ink)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                margin: "8px 0 0",
                color: "var(--ink-3)",
                fontSize: 14,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {children}

        {footer}
      </div>
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--ink-2)",
          marginBottom: 6,
          letterSpacing: 0.1,
          textTransform: "uppercase",
        }}
      >
        <span>{label}</span>
        {hint && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--ink-3)",
              textTransform: "none",
              letterSpacing: 0,
            }}
          >
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

/**
 * Input con ícono prefijo opcional. Pasa cualquier prop a <input>.
 */
export function IconInput({ leading, className = "", ...props }) {
  return (
    <span className="auth-input-wrap">
      {leading && (
        <span className="auth-input-leading" aria-hidden="true">
          {leading}
        </span>
      )}
      <input
        {...props}
        className={[
          "auth-input",
          leading ? "has-leading" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </span>
  );
}

/**
 * Input de contraseña con botón para alternar visibilidad.
 */
export function PasswordInput({ leading, ...props }) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return (
    <span className="auth-input-wrap">
      {leading && (
        <span className="auth-input-leading" aria-hidden="true">
          {leading}
        </span>
      )}
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={["auth-input", "has-trailing", leading ? "has-leading" : ""]
          .filter(Boolean)
          .join(" ")}
        aria-describedby={id}
      />
      <button
        type="button"
        id={id}
        className="auth-input-trailing"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? <Icon.EyeOff /> : <Icon.Eye />}
      </button>
    </span>
  );
}

// Mantengo `inputStyle` como export por compatibilidad con cualquier consumidor
// externo, pero los formularios usan ahora la clase `.auth-input`.
export const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "var(--r-md)",
  border: "1px solid var(--line)",
  background: "var(--surface-2)",
  color: "var(--ink)",
  fontSize: 14.5,
  fontFamily: "var(--font-sans)",
  outline: "none",
  boxSizing: "border-box",
};
