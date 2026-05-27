const TONES = {
  default: { bg: "var(--surface-2)", fg: "var(--ink-2)", bd: "var(--line)" },
  accent:  { bg: "var(--accent-soft)", fg: "var(--accent-ink)", bd: "color-mix(in oklab, var(--accent) 25%, transparent)" },
  coral:   { bg: "var(--coral-soft)", fg: "var(--coral-ink)", bd: "color-mix(in oklab, var(--coral) 35%, transparent)" },
  gold:    { bg: "var(--gold-soft)", fg: "var(--gold-ink)", bd: "color-mix(in oklab, var(--gold) 40%, transparent)" },
  danger:  { bg: "var(--danger-soft)", fg: "var(--danger)", bd: "color-mix(in oklab, var(--danger) 30%, transparent)" },
  ink:     { bg: "var(--ink)", fg: "var(--bg)", bd: "transparent" },
  outline: { bg: "transparent", fg: "var(--ink-2)", bd: "var(--line-strong, var(--line))" },
  live:    { bg: "var(--danger)", fg: "#fff", bd: "transparent" },
};

const STRONG_TONES = new Set(["live", "ink", "gold", "coral"]);

export function Pill({ children, tone = "default", size = "sm", style, dot = false }) {
  const t = TONES[tone] || TONES.default;
  const isStrong = STRONG_TONES.has(tone);
  const isLive = tone === "live";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: size === "sm" ? "3px 9px" : "5px 11px",
        borderRadius: 999,
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: isStrong ? 700 : 500,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        letterSpacing: isStrong ? 0.4 : -0.05,
        textTransform: isStrong ? "uppercase" : "none",
        whiteSpace: "nowrap",
        boxShadow: isStrong ? "0 1px 2px rgba(20,17,13,0.10)" : "none",
        ...(style || {}),
      }}
    >
      {isLive && (
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 0 0 rgba(255,255,255,0.7)",
            animation: "lcfPulse 1.4s ease-out infinite",
          }}
        />
      )}
      {dot && !isLive && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "currentColor",
            opacity: 0.7,
          }}
        />
      )}
      {children}
    </span>
  );
}
