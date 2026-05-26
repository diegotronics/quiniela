import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import PartidoCard from "./PartidoCard.jsx";

const GRUPOS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

export default function Apuestas({ fases }) {
  const { user } = useAuth();
  const [activePhase, setActivePhase] = useState(null);
  const [activeGrupo, setActiveGrupo] = useState("A");
  const [partidos, setPartidos] = useState([]);
  const [predictions, setPredictions] = useState({}); // partido_id -> { goles_local, goles_visitante, puntos_obtenidos, _saving }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activePhase && fases.length) {
      const act = fases.find(f => f.estado === "activa") || fases[0];
      setActivePhase(act.id);
    }
  }, [fases, activePhase]);

  useEffect(() => {
    if (!activePhase || !user) return;
    let cancel = false;
    (async () => {
      setLoading(true);
      const [{ data: parts }, { data: preds }] = await Promise.all([
        supabase.from("partidos").select("*").eq("fase_id", activePhase),
        supabase.from("predicciones").select("*").eq("usuario_id", user.id),
      ]);
      if (cancel) return;
      setPartidos(parts || []);
      const map = {};
      (preds || []).forEach(p => { map[p.partido_id] = p; });
      setPredictions(map);
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [activePhase, user]);

  const fase = useMemo(() => fases.find(f => f.id === activePhase), [fases, activePhase]);
  const locked = !fase || fase.estado !== "activa";

  const partidosVista = useMemo(() => {
    if (activePhase === "grupos") return partidos.filter(p => p.grupo === activeGrupo);
    return partidos;
  }, [partidos, activePhase, activeGrupo]);

  const phaseSaved = partidosVista.filter(p => {
    const pr = predictions[p.id];
    return pr && pr.goles_local != null && pr.goles_visitante != null;
  }).length;

  const setPred = async (partido_id, field, value) => {
    if (locked) return;
    const prev = predictions[partido_id] || {};
    const next = { ...prev, [field]: value };
    setPredictions(p => ({ ...p, [partido_id]: { ...next, _saving: true } }));

    if (next.goles_local != null && next.goles_visitante != null) {
      const { data, error } = await supabase
        .from("predicciones")
        .upsert(
          {
            usuario_id: user.id,
            partido_id,
            goles_local: next.goles_local,
            goles_visitante: next.goles_visitante,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "usuario_id,partido_id" }
        )
        .select()
        .maybeSingle();
      if (error) {
        console.error(error);
        setPredictions(p => ({ ...p, [partido_id]: prev }));
        return;
      }
      setPredictions(p => ({ ...p, [partido_id]: data }));
    } else {
      setPredictions(p => ({ ...p, [partido_id]: next }));
    }
  };

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
              style={{ flexShrink: 0, padding: "0.5rem 1rem", borderRadius: 20, border: "none", cursor: isLocked ? "not-allowed" : "pointer", background: activePhase === p.id ? "#1a1a2e" : isLocked ? "#f7fafc" : "#e2e8f0", color: activePhase === p.id ? "#FFD700" : isLocked ? "#cbd5e0" : "#4a5568", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}
            >
              {p.icono} {p.nombre} {isLocked ? "🔒" : p.estado === "cerrada" ? "🏁" : ""}
            </button>
          );
        })}
      </div>

      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #2d3748)", borderRadius: 12, padding: "0.8rem 1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ color: "#a0aec0", fontSize: "0.75rem", margin: 0 }}>Resultado exacto</p>
          <p style={{ color: "#68d391", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>+{fase.pts_exacto} pts</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "#a0aec0", fontSize: "0.75rem", margin: 0 }}>Acertar ganador</p>
          <p style={{ color: "#63b3ed", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>+{fase.pts_ganador} pts</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "#a0aec0", fontSize: "0.75rem", margin: 0 }}>Guardados</p>
          <p style={{ color: "#FFD700", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{phaseSaved}/{partidosVista.length}</p>
        </div>
      </div>

      {activePhase === "grupos" && (
        <div style={{ overflowX: "auto", display: "flex", gap: "0.5rem", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
          {GRUPOS.map(g => (
            <button key={g} onClick={() => setActiveGrupo(g)} style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, border: "none", cursor: "pointer", background: activeGrupo === g ? "#FFD700" : "#e2e8f0", color: activeGrupo === g ? "#1a1a2e" : "#4a5568", fontSize: "0.9rem", fontWeight: 700 }}>
              {g}
            </button>
          ))}
        </div>
      )}

      {locked && (
        <div style={{ background: "#fffbeb", border: "1px solid #f6e05e", borderRadius: 12, padding: "0.7rem 1rem", marginBottom: "1rem", textAlign: "center", color: "#744210", fontSize: "0.85rem" }}>
          🔒 Esta fase no acepta apuestas en este momento.
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: "center", color: "#a0aec0" }}>Cargando partidos...</p>
      ) : partidosVista.length === 0 ? (
        <p style={{ textAlign: "center", color: "#a0aec0" }}>No hay partidos cargados todavía.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {partidosVista.map(p => (
            <PartidoCard
              key={p.id}
              partido={p}
              pred={predictions[p.id]}
              onChange={(field, val) => setPred(p.id, field, val)}
              locked={locked}
            />
          ))}
        </div>
      )}

      {!locked && phaseSaved === partidosVista.length && partidosVista.length > 0 && (
        <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 12, padding: "1rem", marginTop: "1rem", textAlign: "center" }}>
          <p style={{ margin: 0, color: "#276749", fontWeight: 700 }}>✅ ¡Todos los partidos guardados!</p>
          <p style={{ margin: "0.3rem 0 0", color: "#48bb78", fontSize: "0.85rem" }}>Tus predicciones están listas para esta fase.</p>
        </div>
      )}
    </div>
  );
}
