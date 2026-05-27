const HUES = [148, 32, 85, 220, 280, 0, 200, 60, 320];

const RING_TONES = {
  gold:   { color: "var(--gold)",                  width: 2.5, glow: "0 0 0 5px color-mix(in oklab, var(--gold) 18%, transparent)" },
  silver: { color: "oklch(0.78 0.02 80)",          width: 2.5, glow: null },
  bronze: { color: "oklch(0.62 0.10 35)",          width: 2.5, glow: null },
  accent: { color: "var(--accent)",                width: 2,   glow: null },
  coral:  { color: "var(--coral)",                 width: 2,   glow: null },
  fire:   { color: "var(--coral)",                 width: 2.5, glow: "0 0 0 5px color-mix(in oklab, var(--coral) 18%, transparent)" },
  ink:    { color: "var(--ink)",                   width: 2,   glow: null },
  section:{ color: "var(--section-accent)",        width: 2,   glow: null },
};

function resolveRing(ring) {
  if (!ring) return null;
  if (ring === true) return RING_TONES.accent;
  if (typeof ring === "string" && RING_TONES[ring]) return RING_TONES[ring];
  return null;
}

export function ringFor({ rank, streak } = {}) {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  if ((streak || 0) >= 3) return "fire";
  return null;
}

export function Avatar({ name = "?", size = 32, ring = false, badge = null, override }) {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0] || "")
    .join("")
    .toUpperCase();
  const hash = [...(name || "?")].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = HUES[hash % HUES.length];
  const bg = override?.bg || `oklch(0.92 0.04 ${hue})`;
  const fg = override?.fg || `oklch(0.32 0.10 ${hue})`;

  const ringSpec = resolveRing(ring);
  const boxShadow = ringSpec
    ? [
        `0 0 0 2px var(--bg)`,
        `0 0 0 ${2 + ringSpec.width}px ${ringSpec.color}`,
        ringSpec.glow,
      ]
        .filter(Boolean)
        .join(", ")
    : "none";

  const badgeSize = Math.max(14, Math.round(size * 0.42));

  return (
    <div style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: bg,
          color: fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.4,
          fontWeight: 600,
          letterSpacing: -0.5,
          flexShrink: 0,
          boxShadow,
        }}
      >
        {initials}
      </div>
      {badge && (
        <div
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            minWidth: badgeSize,
            height: badgeSize,
            padding: "0 4px",
            borderRadius: 999,
            background: badge.bg || "var(--ink)",
            color: badge.fg || "var(--bg)",
            fontSize: Math.max(9, Math.round(badgeSize * 0.55)),
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--surface)",
            letterSpacing: -0.2,
            lineHeight: 1,
          }}
        >
          {badge.label}
        </div>
      )}
    </div>
  );
}
