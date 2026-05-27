import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePartidosByFase } from "@/hooks/usePartidos";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import PartidoCard from "./PartidoCard.jsx";
import { color, radius, styles } from "@/styles/theme";

const GRUPOS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

export default function Apuestas({ fases }) {
  const { user } = useAuth();
  const [activePhase, setActivePhase] = useState(null);
  const [activeGrupo, setActiveGrupo] = useState("A");

  useEffect(() => {
    if (!activePhase && fases.length) {
      const act = fases.find(f => f.estado === "activa") || fases[0];
      setActivePhase(act.id);
    }
  }, [fases, activePhase]);

  const { partidos, loading } = usePartidosByFase(activePhase);
  const { predicciones, setPrediccion } = usePrediccionesUsuario(user?.id);

  const fase = useMemo(() => fases.find(f => f.id === activePhase), [fases, activePhase]);
  const locked = !fase || fase.estado !== "activa";

  const partidosVista = useMemo(() => {
    if (activePhase === "grupos") return partidos.filter(p => p.grupo === activeGrupo);
    return partidos;
  }, [partidos, activePhase, activeGrupo]);

  const phaseSaved = partidosVista.filter(p => {
    const pr = predicciones[p.id];
    return pr && pr.goles_local != null && pr.goles_visitante != null;
  }).length;

  if (!fase) return null;

  return (
    <div>
      <div style={{ overflowX: "auto", display: "flex", gap: "0.5rem", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
        {fases.map(p => {
          const isLocked = p.estado === "bloqueada";
          return (
            <button
              key={p.id}
              onClick={() => !isLocked && setActivePhase(p.id)}
              style={styles.pill(activePhase === p.id, isLocked)}
            >
              {p.icono} {p.nombre} {isLocked ? "🔒" : p.estado === "cerrada" ? "🏁" : ""}
            </button>
          );
        })}
      </div>

      <div style={{
        ...styles.panel,
        padding: "0.8rem 1rem",
        marginBottom: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <ScoreLegend label="Resultado exacto" pts={fase.pts_exacto} hue={color.successSoft} />
        <ScoreLegend label="Acertar ganador" pts={fase.pts_ganador} hue={color.infoSoft} align="right" />
        <div style={{ textAlign: "right" }}>
          <p style={{ color: color.mutedSoft, fontSize: "0.75rem", margin: 0 }}>Guardados</p>
          <p style={{ color: color.gold, fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
            {phaseSaved}/{partidosVista.length}
          </p>
        </div>
      </div>

      {activePhase === "grupos" && (
        <div style={{ overflowX: "auto", display: "flex", gap: "0.5rem", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
          {GRUPOS.map(g => (
            <button key={g} onClick={() => setActiveGrupo(g)} style={styles.grupoSquare(activeGrupo === g)}>
              {g}
            </button>
          ))}
        </div>
      )}

      {locked && (
        <div style={{
          background: color.warningBg,
          border: `1px solid ${color.warningSoft}`,
          borderRadius: radius.lg,
          padding: "0.7rem 1rem",
          marginBottom: "1rem",
          textAlign: "center",
          color: color.warning,
          fontSize: "0.85rem",
        }}>
          🔒 Esta fase no acepta apuestas en este momento.
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: "center", color: color.mutedSoft }}>Cargando partidos...</p>
      ) : partidosVista.length === 0 ? (
        <p style={{ textAlign: "center", color: color.mutedSoft }}>No hay partidos cargados todavía.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {partidosVista.map(p => (
            <PartidoCard
              key={p.id}
              partido={p}
              pred={predicciones[p.id]}
              onChange={(field, val) => setPrediccion(p.id, field, val)}
              locked={locked}
            />
          ))}
        </div>
      )}

      {!locked && phaseSaved === partidosVista.length && partidosVista.length > 0 && (
        <div style={{
          background: color.successBg,
          border: `1px solid ${color.successSoft}`,
          borderRadius: radius.lg,
          padding: "1rem",
          marginTop: "1rem",
          textAlign: "center",
        }}>
          <p style={{ margin: 0, color: color.success, fontWeight: 700 }}>✅ ¡Todos los partidos guardados!</p>
          <p style={{ margin: "0.3rem 0 0", color: "#48bb78", fontSize: "0.85rem" }}>
            Tus predicciones están listas para esta fase.
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreLegend({ label, pts, hue, align }) {
  return (
    <div style={{ textAlign: align === "right" ? "right" : "left" }}>
      <p style={{ color: color.mutedSoft, fontSize: "0.75rem", margin: 0 }}>{label}</p>
      <p style={{ color: hue, fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>+{pts} pts</p>
    </div>
  );
}
