import ScoreInput from "./ScoreInput.jsx";
import { flag } from "../lib/constants.js";

export default function PartidoCard({ partido, pred, onChange, locked }) {
  const saved = pred?.goles_local != null && pred?.goles_visitante != null;
  const realIngresado = partido.resultado_ingresado;

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "1rem", border: `2px solid ${saved ? "#9ae6b4" : "#e2e8f0"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
        {partido.grupo && <span style={{ fontSize: "0.7rem", color: "#a0aec0", background: "#f7fafc", padding: "0.2rem 0.6rem", borderRadius: 10 }}>Grupo {partido.grupo}</span>}
        <span style={{ fontSize: "0.7rem", color: "#a0aec0", marginLeft: "auto" }}>📅 {partido.fecha}</span>
        {saved && <span style={{ fontSize: "0.75rem", color: "#276749", marginLeft: "0.5rem" }}>✅</span>}
        {locked && <span style={{ fontSize: "0.7rem", color: "#a0aec0", marginLeft: "0.4rem" }}>🔒</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem" }}>{flag(partido.equipo_local)}</div>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#4a5568", fontWeight: 600, lineHeight: 1.2 }}>{partido.equipo_local}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <ScoreInput
            value={pred?.goles_local}
            onChange={v => onChange("goles_local", v)}
            disabled={locked}
          />
          <span style={{ color: "#a0aec0", fontSize: "1.2rem", fontWeight: 300 }}>—</span>
          <ScoreInput
            value={pred?.goles_visitante}
            onChange={v => onChange("goles_visitante", v)}
            disabled={locked}
          />
        </div>

        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem" }}>{flag(partido.equipo_visitante)}</div>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#4a5568", fontWeight: 600, lineHeight: 1.2 }}>{partido.equipo_visitante}</p>
        </div>
      </div>

      {realIngresado && (
        <div style={{ marginTop: "0.7rem", padding: "0.5rem", background: "#f7fafc", borderRadius: 8, textAlign: "center", fontSize: "0.8rem", color: "#2d3748" }}>
          Resultado real: <strong>{partido.goles_local} — {partido.goles_visitante}</strong>
          {saved && (
            <span style={{ marginLeft: "0.5rem", color: "#276749" }}>
              · +{pred?.puntos_obtenidos ?? 0} pts
            </span>
          )}
        </div>
      )}
    </div>
  );
}
