export function AuthLayout({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "var(--ink)",
              color: "var(--bg)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 22,
              fontFamily: "var(--font-sans)",
              letterSpacing: -0.5,
              marginBottom: 16,
            }}
          >
            LC
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: -0.6,
              color: "var(--ink)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                margin: "6px 0 0",
                color: "var(--ink-3)",
                fontSize: 14,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--ink-2)",
          marginBottom: 6,
          letterSpacing: -0.05,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "var(--r-md)",
  border: "0.5px solid var(--line)",
  background: "var(--surface-2)",
  color: "var(--ink)",
  fontSize: 14,
  fontFamily: "var(--font-sans)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 120ms, background 120ms",
};
