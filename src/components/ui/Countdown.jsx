import { useCountdown } from "@/hooks/useCountdown";
import { Icon } from "./Icon.jsx";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function pad(n) {
  return String(n).padStart(2, "0");
}

export function Countdown({ targetIso, compact = false, fallbackLabel = "Sin fecha" }) {
  const { total, days, hours, minutes, seconds, expired } = useCountdown(targetIso);

  if (!targetIso) {
    return (
      <span style={{ color: "var(--ink-3)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Icon.Clock /> {fallbackLabel}
      </span>
    );
  }

  if (expired) {
    return (
      <span
        className="countdown-tick"
        style={{
          color: "var(--danger)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.3,
          textTransform: "uppercase",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span className="live-dot" /> Comenzó
      </span>
    );
  }

  // Color escalonado: <1h → danger pulse, <24h → coral, resto → ink-3
  let tone = "var(--ink-3)";
  let pulse = false;
  if (total < HOUR_MS) {
    tone = "var(--danger)";
    pulse = true;
  } else if (total < DAY_MS) {
    tone = "var(--coral-ink)";
  }

  const units = [];
  if (days > 0) units.push({ value: days, label: "d" });
  if (days > 0 || hours > 0) units.push({ value: hours, label: "h" });
  units.push({ value: minutes, label: "m" });
  // Segundos solo si quedan <1 día (evita re-render constante en cards lejanos)
  if (days === 0) units.push({ value: pad(seconds), label: "s" });

  if (compact) {
    return (
      <span
        className={pulse ? "countdown-tick" : undefined}
        style={{
          color: tone,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.3,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <Icon.Clock />
        <span className="mono">
          {units.map((u, i) => (
            <span key={u.label}>
              {u.value}
              <span style={{ opacity: 0.6, marginRight: i === units.length - 1 ? 0 : 4, marginLeft: 1 }}>{u.label}</span>
            </span>
          ))}
        </span>
      </span>
    );
  }

  return (
    <div
      className={pulse ? "countdown-tick" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: tone,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {units.map((u, i) => (
        <div key={u.label} style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <span
            className="mono"
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: -1,
              lineHeight: 1,
              color: tone,
            }}
          >
            {u.value}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.4,
              textTransform: "uppercase",
              color: "color-mix(in oklab, currentColor 70%, transparent)",
            }}
          >
            {u.label}
          </span>
          {i < units.length - 1 && (
            <span style={{ fontSize: 16, color: "var(--ink-4)", margin: "0 2px" }}>·</span>
          )}
        </div>
      ))}
    </div>
  );
}
