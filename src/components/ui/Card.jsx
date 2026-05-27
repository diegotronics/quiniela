export function Card({ children, style, pad = 16, accent = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: accent ? "var(--accent-soft)" : "var(--surface)",
        borderRadius: "var(--r-xl)",
        border: "0.5px solid var(--line)",
        padding: pad,
        boxShadow: "var(--shadow-1)",
        cursor: onClick ? "pointer" : "default",
        ...(style || {}),
      }}
    >
      {children}
    </div>
  );
}
