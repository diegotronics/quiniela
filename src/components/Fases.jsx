import { FASES_INFO } from "@/lib/constants";
import { color, radius, styles } from "@/styles/theme";

export default function Fases({ fases }) {
  return (
    <div>
      <div style={{ ...styles.panel, padding: "1.5rem", marginBottom: "1rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem" }}>🏆</div>
        <h2 style={{ color: color.gold, margin: "0.5rem 0 0.3rem", fontSize: "1.3rem" }}>Camino a la Final</h2>
        <p style={{ color: color.mutedSoft, margin: 0, fontSize: "0.85rem" }}>Mundial 2026 — 48 equipos, 104 partidos</p>
      </div>

      {fases.map(phase => (
        <FaseRow key={phase.id} phase={phase} />
      ))}
    </div>
  );
}

function FaseRow({ phase }) {
  const isActive = phase.estado === "activa";
  const isLocked = phase.estado === "bloqueada";
  const isClosed = phase.estado === "cerrada";

  return (
    <div style={{
      background: color.surface,
      borderRadius: radius.xl,
      padding: "1rem 1.2rem",
      marginBottom: "0.6rem",
      border: `2px solid ${isActive ? color.successSoft : color.border}`,
      display: "flex",
      gap: "1rem",
      alignItems: "flex-start",
    }}>
      <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>{phase.icono}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <h3 style={{ margin: 0, fontSize: "0.95rem", color: color.navy, fontWeight: 700 }}>{phase.nombre}</h3>
          {isActive && <Badge bg={color.successBg} fg={color.success} border={color.successSoft}>ACTIVA</Badge>}
          {isLocked && <Badge bg={color.surfaceAlt} fg={color.mutedSoft}>🔒 Bloqueada</Badge>}
          {isClosed && <Badge bg={color.warningBg} fg={color.warning}>🏁 Cerrada</Badge>}
        </div>
        <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", color: color.muted }}>
          {FASES_INFO[phase.id]}
        </p>
        <p style={{ margin: "0.3rem 0 0", fontSize: "0.75rem" }}>
          <span style={{ color: color.success, fontWeight: 700 }}>+{phase.pts_exacto} pts</span>
          <span style={{ color: color.mutedSoft }}> resultado exacto · </span>
          <span style={{ color: color.info, fontWeight: 700 }}>+{phase.pts_ganador} pts</span>
          <span style={{ color: color.mutedSoft }}> acertar ganador</span>
        </p>
      </div>
    </div>
  );
}

function Badge({ children, bg, fg, border }) {
  return (
    <span style={{
      fontSize: "0.65rem",
      color: fg,
      background: bg,
      padding: "0.15rem 0.5rem",
      borderRadius: 10,
      border: border ? `1px solid ${border}` : undefined,
    }}>
      {children}
    </span>
  );
}
