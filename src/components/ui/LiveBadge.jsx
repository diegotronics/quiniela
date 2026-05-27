/**
 * LiveBadge — indicador "en vivo" con dot pulsante.
 *
 * Variants:
 *  - "solid" (default): fondo danger sólido, pensado para encima de surfaces oscuras o claras.
 *  - "soft": versión sutil con fondo translúcido danger-soft.
 */
export function LiveBadge({
  variant = "solid",
  label = "En vivo",
  minute,
  size = "sm",
  style,
}) {
  const soft = variant === "soft";
  const isLg = size === "lg";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: isLg ? "5px 11px" : "3px 9px",
        borderRadius: 999,
        background: soft ? "var(--danger-soft)" : "var(--danger)",
        color: soft ? "var(--danger)" : "#fff",
        border: soft
          ? "1px solid color-mix(in oklab, var(--danger) 30%, transparent)"
          : "1px solid transparent",
        fontSize: isLg ? 12 : 11,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        boxShadow: soft ? "none" : "0 1px 2px rgba(20,17,13,0.10)",
        ...(style || {}),
      }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: soft ? "var(--danger)" : "#fff",
          boxShadow: soft
            ? "0 0 0 0 color-mix(in oklab, var(--danger) 70%, transparent)"
            : "0 0 0 0 rgba(255,255,255,0.7)",
          animation: "lcfPulse 1.4s ease-out infinite",
        }}
      />
      {label}
      {minute != null && (
        <span
          className="mono"
          style={{
            marginLeft: 4,
            fontWeight: 600,
            letterSpacing: 0,
            textTransform: "none",
          }}
        >
          {minute}'
        </span>
      )}
    </span>
  );
}
