import { Avatar } from "./Avatar.jsx";

/**
 * RankRow — fila reutilizable para tablas de posiciones.
 *
 * Variants:
 *  - "default": fila estándar (rank · avatar · nombre · puntos)
 *  - "compact": versión densa para previews/sidebars
 */
export function RankRow({
  member,
  isMe = false,
  index = 0,
  variant = "default",
  showPagoStatus = false,
  onClick,
  trailing,
  className,
  style,
}) {
  const compact = variant === "compact";
  const pointsSize = compact ? 14 : 16;
  const avatarSize = compact ? 28 : 32;
  const pad = compact ? "8px 10px" : "10px 12px";

  return (
    <div
      onClick={onClick}
      className={["stagger-item", className].filter(Boolean).join(" ")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: isMe ? "var(--accent-soft)" : "var(--surface)",
        border: isMe
          ? "1px solid color-mix(in oklab, var(--accent) 30%, transparent)"
          : "0.5px solid var(--line)",
        borderRadius: "var(--r-md)",
        padding: pad,
        cursor: onClick ? "pointer" : "default",
        animationDelay: `${Math.min(index, 8) * 45}ms`,
        ...(style || {}),
      }}
    >
      <span
        className="mono"
        style={{
          width: 22,
          textAlign: "center",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--ink-3)",
        }}
      >
        {member.rank}
      </span>
      <Avatar name={member.nombre} size={avatarSize} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--ink)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {member.nombre}
          {isMe && <span style={{ fontWeight: 400, color: "var(--ink-3)" }}> · tú</span>}
        </div>
        {showPagoStatus && member.pagado === false && (
          <div style={{ fontSize: 11, color: "var(--coral)" }}>Pago pendiente</div>
        )}
      </div>
      {trailing ?? (
        <div style={{ textAlign: "right" }}>
          <span
            className="mono"
            style={{
              fontSize: pointsSize,
              fontWeight: 600,
              color: "var(--ink)",
              letterSpacing: -0.3,
            }}
          >
            {member.puntos}
          </span>
          <div style={{ fontSize: 10, color: "var(--ink-3)" }}>pts</div>
        </div>
      )}
    </div>
  );
}
