import ScoreInput from "./ScoreInput.jsx";
import { flag } from "@/lib/constants";
import { color, radius } from "@/styles/theme";

export default function PartidoCard({ partido, pred, onChange, locked }) {
  const saved = pred?.goles_local != null && pred?.goles_visitante != null;
  const realIngresado = partido.resultado_ingresado;

  return (
    <div style={{
      background: color.surface,
      borderRadius: radius.xl,
      padding: "1rem",
      border: `2px solid ${saved ? color.successSoft : color.border}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
        {partido.grupo && (
          <span style={{
            fontSize: "0.7rem",
            color: color.mutedSoft,
            background: color.surfaceAlt,
            padding: "0.2rem 0.6rem",
            borderRadius: 10,
          }}>
            Grupo {partido.grupo}
          </span>
        )}
        <span style={{ fontSize: "0.7rem", color: color.mutedSoft, marginLeft: "auto" }}>📅 {partido.fecha}</span>
        {saved && <span style={{ fontSize: "0.75rem", color: color.success, marginLeft: "0.5rem" }}>✅</span>}
        {locked && <span style={{ fontSize: "0.7rem", color: color.mutedSoft, marginLeft: "0.4rem" }}>🔒</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <TeamCol equipo={partido.equipo_local} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <ScoreInput value={pred?.goles_local} onChange={v => onChange("goles_local", v)} disabled={locked} />
          <span style={{ color: color.mutedSoft, fontSize: "1.2rem", fontWeight: 300 }}>—</span>
          <ScoreInput value={pred?.goles_visitante} onChange={v => onChange("goles_visitante", v)} disabled={locked} />
        </div>
        <TeamCol equipo={partido.equipo_visitante} />
      </div>

      {realIngresado && (
        <div style={{
          marginTop: "0.7rem",
          padding: "0.5rem",
          background: color.surfaceAlt,
          borderRadius: radius.sm,
          textAlign: "center",
          fontSize: "0.8rem",
          color: color.text,
        }}>
          Resultado real: <strong>{partido.goles_local} — {partido.goles_visitante}</strong>
          {saved && (
            <span style={{ marginLeft: "0.5rem", color: color.success }}>
              · +{pred?.puntos_obtenidos ?? 0} pts
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function TeamCol({ equipo }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontSize: "1.8rem" }}>{flag(equipo)}</div>
      <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: color.slateLight, fontWeight: 600, lineHeight: 1.2 }}>
        {equipo}
      </p>
    </div>
  );
}
