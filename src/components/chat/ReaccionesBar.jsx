export function ReaccionesBar({ reacciones, onToggle, alineacion = "izquierda" }) {
  if (!reacciones || reacciones.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        marginTop: 4,
        flexWrap: "wrap",
        justifyContent: alineacion === "derecha" ? "flex-end" : "flex-start",
      }}
    >
      {reacciones.map((r) => (
        <button
          key={r.emoji}
          onClick={() => onToggle?.(r.emoji)}
          type="button"
          aria-pressed={r.miReaccion}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 500,
            background: r.miReaccion ? "var(--accent-soft)" : "var(--surface-2)",
            color: r.miReaccion ? "var(--accent-ink)" : "var(--ink-2)",
            border: r.miReaccion ? "1px solid transparent" : "0.5px solid var(--line)",
            cursor: "pointer",
            whiteSpace: "nowrap",
            letterSpacing: -0.05,
          }}
        >
          <span>{r.emoji}</span>
          <span className="mono">{r.count}</span>
        </button>
      ))}
    </div>
  );
}
