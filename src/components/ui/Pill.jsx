const TONES = {
  default: { bg: "var(--surface-2)", fg: "var(--ink-2)", bd: "var(--line)" },
  accent:  { bg: "var(--accent-soft)", fg: "var(--accent-ink)", bd: "transparent" },
  coral:   { bg: "var(--coral-soft)", fg: "var(--coral)", bd: "transparent" },
  gold:    { bg: "var(--gold-soft)", fg: "oklch(0.45 0.10 85)", bd: "transparent" },
  danger:  { bg: "var(--danger-soft)", fg: "var(--danger)", bd: "transparent" },
  ink:     { bg: "var(--ink)", fg: "var(--bg)", bd: "transparent" },
  outline: { bg: "transparent", fg: "var(--ink-2)", bd: "var(--line)" },
};

export function Pill({ children, tone = "default", size = "sm", style }) {
  const t = TONES[tone] || TONES.default;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: size === "sm" ? "3px 8px" : "5px 10px",
        borderRadius: 999,
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 500,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        letterSpacing: -0.05,
        whiteSpace: "nowrap",
        ...(style || {}),
      }}
    >
      {children}
    </span>
  );
}
