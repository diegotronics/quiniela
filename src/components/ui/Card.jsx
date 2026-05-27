// Roles de elevación (punto 18 del análisis UX/UI):
//   0 → superficie plana sobre fondo (chips, list-items)
//   1 → cards estándar en reposo (default)
//   2 → cards interactivas, elevadas o destacadas (hero, live, ganador)
//   3 → modales, sheets, popovers, tooltips

const SHADOW = {
  0: "var(--shadow-0)",
  1: "var(--shadow-1)",
  2: "var(--shadow-2)",
  3: "var(--shadow-3)",
};

export function Card({
  children,
  style,
  pad = 16,
  accent = false,
  onClick,
  elevated = false,
  elevation,
  className = "",
}) {
  const interactive = Boolean(onClick);
  const resolvedElevation =
    elevation != null ? elevation : elevated ? 2 : 1;
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
        boxShadow: SHADOW[resolvedElevation] ?? SHADOW[1],
        cursor: interactive ? "pointer" : "default",
        ...(style || {}),
      }}
    >
      {children}
    </div>
  );
}
