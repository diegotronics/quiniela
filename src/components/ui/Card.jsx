export function Card({
  children,
  style,
  pad = 16,
  accent = false,
  onClick,
  elevated = false,
  className = "",
}) {
  const interactive = Boolean(onClick);
  const classes = [interactive ? "card-interactive" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      onClick={onClick}
      className={classes || undefined}
      style={{
        background: accent ? "var(--accent-soft)" : "var(--surface)",
        borderRadius: "var(--r-xl)",
        border: "1px solid var(--line)",
        padding: pad,
        boxShadow: elevated ? "var(--shadow-2)" : "var(--shadow-1)",
        cursor: interactive ? "pointer" : "default",
        ...(style || {}),
      }}
    >
      {children}
    </div>
  );
}
