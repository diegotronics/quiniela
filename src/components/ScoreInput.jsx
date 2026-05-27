import { color, radius } from "@/styles/theme";

export default function ScoreInput({ value, onChange, disabled }) {
  const v = value;
  const change = (delta) => onChange(Math.max(0, (v ?? 0) + delta));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <button
        disabled={disabled}
        onClick={() => change(1)}
        style={{
          width: 32, height: 28,
          background: disabled ? color.mutedSoft : color.navy,
          border: "none",
          borderRadius: radius.sm,
          color: color.gold,
          fontSize: "1rem",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >+</button>
      <div style={{
        width: 40, height: 40,
        background: color.surfaceAlt,
        border: `2px solid ${color.border}`,
        borderRadius: radius.md,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.3rem", fontWeight: 700, color: color.navy,
      }}>
        {v !== undefined && v !== null ? v : "?"}
      </div>
      <button
        disabled={disabled}
        onClick={() => change(-1)}
        style={{
          width: 32, height: 28,
          background: color.border,
          border: "none",
          borderRadius: radius.sm,
          color: color.slateLight,
          fontSize: "1rem",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >−</button>
    </div>
  );
}
