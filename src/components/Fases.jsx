import { FASES_INFO } from "../lib/constants.js";

export default function Fases({ fases }) {
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #2d3748)", borderRadius: 16, padding: "1.5rem", marginBottom: "1rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem" }}>🏆</div>
        <h2 style={{ color: "#FFD700", margin: "0.5rem 0 0.3rem", fontSize: "1.3rem" }}>Camino a la Final</h2>
        <p style={{ color: "#a0aec0", margin: 0, fontSize: "0.85rem" }}>Mundial 2026 — 48 equipos, 104 partidos</p>
      </div>

      {fases.map(phase => {
        const isActive = phase.estado === "activa";
        const isLocked = phase.estado === "bloqueada";
        const isClosed = phase.estado === "cerrada";
        return (
          <div key={phase.id} style={{ background: "#fff", borderRadius: 14, padding: "1rem 1.2rem", marginBottom: "0.6rem", border: `2px solid ${isActive ? "#9ae6b4" : "#e2e8f0"}`, display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>{phase.icono}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.95rem", color: "#1a1a2e", fontWeight: 700 }}>{phase.nombre}</h3>
                {isActive && <span style={{ fontSize: "0.65rem", color: "#276749", background: "#f0fff4", padding: "0.15rem 0.5rem", borderRadius: 10, border: "1px solid #9ae6b4" }}>ACTIVA</span>}
                {isLocked && <span style={{ fontSize: "0.65rem", color: "#a0aec0", background: "#f7fafc", padding: "0.15rem 0.5rem", borderRadius: 10 }}>🔒 Bloqueada</span>}
                {isClosed && <span style={{ fontSize: "0.65rem", color: "#744210", background: "#fffbeb", padding: "0.15rem 0.5rem", borderRadius: 10 }}>🏁 Cerrada</span>}
              </div>
              <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", color: "#718096" }}>
                {FASES_INFO[phase.id]}
              </p>
              <p style={{ margin: "0.3rem 0 0", fontSize: "0.75rem" }}>
                <span style={{ color: "#276749", fontWeight: 700 }}>+{phase.pts_exacto} pts</span>
                <span style={{ color: "#a0aec0" }}> resultado exacto · </span>
                <span style={{ color: "#2B6CB0", fontWeight: 700 }}>+{phase.pts_ganador} pts</span>
                <span style={{ color: "#a0aec0" }}> acertar ganador</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
