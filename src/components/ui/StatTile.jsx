/**
 * StatTile — tarjeta compacta para mostrar una métrica.
 *
 * Variants:
 *  - "default": superficie estándar (Aciertos, Exactos, etc.)
 *  - "accent": resaltado en accent-soft (logros positivos)
 *  - "gold": destacado en gold-soft (líder, campeón)
 *  - "coral": estado de urgencia
 */
const TONE_STYLES = {
  default: {
    bg: "var(--surface)",
    border: "0.5px solid var(--line)",
    label: "var(--ink-3)",
    value: "var(--ink)",
    unit: "var(--ink-3)",
    shadow: "var(--shadow-1)",
  },
  accent: {
    bg: "var(--accent-soft)",
    border: "1px solid color-mix(in oklab, var(--accent) 25%, transparent)",
    label: "var(--accent-ink)",
    value: "var(--accent-ink)",
    unit: "color-mix(in oklab, var(--accent-ink) 60%, transparent)",
    shadow: "var(--shadow-1)",
  },
  gold: {
    bg: "var(--gold-soft)",
    border: "1px solid color-mix(in oklab, var(--gold) 35%, transparent)",
    label: "var(--gold-ink)",
    value: "var(--gold-ink)",
    unit: "color-mix(in oklab, var(--gold-ink) 60%, transparent)",
    shadow: "var(--shadow-gold)",
  },
  coral: {
    bg: "var(--coral-soft)",
    border: "1px solid color-mix(in oklab, var(--coral) 30%, transparent)",
    label: "var(--coral-ink)",
    value: "var(--coral-ink)",
    unit: "color-mix(in oklab, var(--coral-ink) 60%, transparent)",
    shadow: "var(--shadow-1)",
  },
};

export function StatTile({
  label,
  value,
  unit,
  tone = "default",
  leading,
  size = "md",
  className,
  style,
}) {
  const t = TONE_STYLES[tone] || TONE_STYLES.default;
  const valueSize = size === "lg" ? 28 : size === "sm" ? 18 : 22;
  const pad = size === "lg" ? "14px 14px" : "12px 12px";

  return (
    <div
      className={className}
      style={{
        background: t.bg,
        border: t.border,
        borderRadius: "var(--r-lg)",
        padding: pad,
        boxShadow: t.shadow,
        display: "flex",
        alignItems: "center",
        gap: 10,
        ...(style || {}),
      }}
    >
      {leading}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            color: t.label,
            fontWeight: 500,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </div>
        <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", gap: 4 }}>
          <span
            className="font-score"
            style={{
              fontSize: valueSize + 6,
              fontWeight: 400,
              color: t.value,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: 11, color: t.unit, textTransform: "uppercase", letterSpacing: 0.6 }}>{unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}
