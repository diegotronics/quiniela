import { Flag } from "./Flag.jsx";
import { Icon } from "./Icon.jsx";
import { code } from "@/lib/constants";

const SIZE_PRESETS = {
  xs: { flag: { w: 20, h: 14, r: 2 }, font: 12, gap: 8, weight: 600, checkSize: 12 },
  sm: { flag: { w: 32, h: 22, r: 4 }, font: 14, gap: 10, weight: 700, checkSize: 12 },
  md: { flag: { w: 38, h: 26, r: 5 }, font: 14, gap: 10, weight: 700, checkSize: 12 },
  lg: { flag: { w: 56, h: 40, r: 7 }, font: 16, gap: 12, weight: 700, checkSize: 14 },
};

export function TeamRow({
  team,
  size = "sm",
  direction = "row",
  theme = "light",
  isWinner = false,
  isLoser = false,
  isFinal = false,
  showName = true,
  truncate = false,
  className,
  style,
}) {
  const preset = SIZE_PRESETS[size] || SIZE_PRESETS.sm;
  const right = direction === "row-reverse";
  const dark = theme === "dark";

  const opacity = isFinal && isLoser ? 0.55 : 1;
  const weight = isWinner ? 800 : preset.weight;
  const color = isLoser
    ? dark
      ? "oklch(0.65 0.02 60)"
      : "var(--ink-3)"
    : dark
      ? "var(--bg)"
      : "var(--ink)";

  const teamCode = code(team);
  const label = truncate && team && team.length > 12 ? teamCode : team;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: preset.gap,
        flexDirection: right ? "row-reverse" : "row",
        opacity,
        transition: "opacity 280ms ease",
        ...(style || {}),
      }}
    >
      <Flag code={teamCode} w={preset.flag.w} h={preset.flag.h} rounded={preset.flag.r} />
      {showName && (
        <span
          style={{
            fontWeight: weight,
            fontSize: preset.font,
            color,
            letterSpacing: -0.2,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {label}
          {isWinner && (
            <span
              className="win-mark"
              style={{
                color: dark ? "var(--bg)" : "var(--accent-ink)",
                display: "inline-flex",
              }}
            >
              <Icon.Check style={{ width: preset.checkSize, height: preset.checkSize }} />
            </span>
          )}
        </span>
      )}
    </div>
  );
}
