const HUES = [148, 32, 85, 220, 280, 0, 200, 60, 320];

export function Avatar({ name = "?", size = 32, ring = false, override }) {
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
  return (
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
        boxShadow: ring ? "0 0 0 2px var(--bg), 0 0 0 4px var(--accent)" : "none",
      }}
    >
      {initials}
    </div>
  );
}
