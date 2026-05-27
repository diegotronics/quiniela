export function ScoreStepper({ label, value, onChange, size = "md" }) {
  const v = value == null ? 0 : value;
  const dims =
    size === "lg"
      ? { w: 48, h: 56, num: 32, btn: 22 }
      : { w: 32, h: 38, num: 22, btn: 18 };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {label && (
        <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500, textAlign: "center" }}>
          {label.length > 10 ? label.slice(0, 10) + "…" : label}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--surface)",
          border: "0.5px solid var(--line)",
          borderRadius: 10,
        }}
      >
        <button
          onClick={() => onChange(Math.max(0, v - 1))}
          aria-label="Bajar gol"
          style={{
            width: dims.w,
            height: dims.h,
            background: "none",
            border: "none",
            color: "var(--ink-2)",
            fontSize: dims.btn,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          –
        </button>
        <span
          className="mono"
          style={{
            width: 44,
            textAlign: "center",
            fontSize: dims.num,
            fontWeight: 600,
            color: value == null ? "var(--ink-4)" : "var(--ink)",
            letterSpacing: -0.5,
          }}
        >
          {value == null ? 0 : value}
        </span>
        <button
          onClick={() => onChange(v + 1)}
          aria-label="Subir gol"
          style={{
            width: dims.w,
            height: dims.h,
            background: "none",
            border: "none",
            color: "var(--ink-2)",
            fontSize: dims.btn,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
