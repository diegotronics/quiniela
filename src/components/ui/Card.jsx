export function Card({ children, style, pad = 16, accent = false, onClick, elevated = false }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: accent ? "var(--accent-soft)" : "var(--surface)",
        borderRadius: "var(--r-xl)",
        border: "1px solid var(--line)",
        padding: pad,
        boxShadow: elevated ? "var(--shadow-2)" : "var(--shadow-1)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 180ms ease, box-shadow 180ms ease",
        ...(style || {}),
      }}
    >
      {children}
    </div>
  );
}
