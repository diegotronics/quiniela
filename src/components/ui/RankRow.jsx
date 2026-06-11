import { Avatar } from "./Avatar.jsx";
import { Icon } from "./Icon.jsx";

/**
 * RankRow — fila reutilizable para tablas de posiciones.
 *
 * Variants:
 *  - "default": fila estándar (rank · avatar · nombre · puntos)
 *  - "compact": versión densa para previews/sidebars
 *
 * `faltan` (opcional): predicciones pendientes del jugador. Si es un número,
 * se muestra un indicador discreto bajo el nombre ("N por pronosticar" o
 * "Al día" cuando es 0). Pásalo como `undefined` para no mostrar nada.
 */
export function RankRow({
  member,
  isMe = false,
  index = 0,
  variant = "default",
  showPagoStatus = false,
  faltan,
  onClick,
  trailing,
  className,
  style,
}) {
  const compact = variant === "compact";
  const pointsSize = compact ? 18 : 22;
  const avatarSize = compact ? 28 : 32;
  const pad = compact ? "8px 10px" : "10px 12px";
  const rank = Number(member.rank);
  const isPodium = rank >= 1 && rank <= 3;
  const podiumColor =
    rank === 1
      ? "var(--gold-ink)"
      : rank === 2
        ? "var(--azure-ink)"
        : rank === 3
          ? "var(--coral-ink)"
          : "var(--ink-3)";

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
        className="font-score"
        style={{
          width: 26,
          textAlign: "center",
          fontSize: isPodium ? 22 : 18,
          fontWeight: 400,
          color: podiumColor,
          lineHeight: 1,
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
        {faltan != null &&
          (faltan > 0 ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "var(--ink-3)",
                marginTop: 1,
              }}
            >
              <Icon.Edit size={12} />
              {faltan} por pronosticar
            </div>
          ) : (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "var(--accent-ink)",
                marginTop: 1,
              }}
            >
              <Icon.Check size={12} />
              Al día
            </div>
          ))}
      </div>
      {trailing ?? (
        <div style={{ textAlign: "right" }}>
          <span
            className="font-score"
            style={{
              fontSize: pointsSize,
              fontWeight: 400,
              color: "var(--ink)",
              lineHeight: 1,
            }}
          >
            {member.puntos}
          </span>
          <div style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 2 }}>pts</div>
        </div>
      )}
    </div>
  );
}
