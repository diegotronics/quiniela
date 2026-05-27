import { useEffect, useMemo, useState } from "react";
import { setResultadoPartido } from "@/api/partidos";
import { useFases } from "@/hooks/useFases";
import { usePartidosByFase } from "@/hooks/usePartidos";
import { flag } from "@/lib/constants";
import { styles, color, radius } from "@/styles/theme";

const GRUPOS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

export default function AdminResultados() {
  const { fases } = useFases();
  const [selectedFase, setSelectedFase] = useState("grupos");
  const [grupo, setGrupo] = useState("A");
  const { partidos, refresh } = usePartidosByFase(selectedFase);
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    const next = {};
    for (const p of partidos) {
      if (p.goles_local != null && p.goles_visitante != null) {
        next[p.id] = { goles_local: p.goles_local, goles_visitante: p.goles_visitante };
      }
    }
    setDraft(next);
  }, [partidos]);

  const partidosVista = useMemo(() => {
    if (selectedFase === "grupos") return partidos.filter(p => p.grupo === grupo);
    return partidos;
  }, [partidos, selectedFase, grupo]);

  const setVal = (id, field, v) => {
    setDraft(d => ({
      ...d,
      [id]: { ...d[id], [field]: Math.max(0, Number(v) || 0) },
    }));
  };

  const guardar = async (partido) => {
    const d = draft[partido.id];
    if (!d || d.goles_local == null || d.goles_visitante == null) {
      alert("Ingresa ambos goles antes de guardar");
      return;
    }
    setBusy(partido.id);
    try {
      // El trigger en BD recalcula los puntos de todas las predicciones del partido.
      await setResultadoPartido(partido.id, d.goles_local, d.goles_visitante);
      await refresh();
      alert("✅ Resultado guardado y puntos recalculados.");
    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div style={{ overflowX: "auto", display: "flex", gap: "0.5rem", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
        {fases.map(f => (
          <button key={f.id} onClick={() => setSelectedFase(f.id)} style={styles.pill(selectedFase === f.id, false)}>
            {f.icono} {f.nombre}
          </button>
        ))}
      </div>

      {selectedFase === "grupos" && (
        <div style={{ overflowX: "auto", display: "flex", gap: "0.5rem", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
          {GRUPOS.map(g => (
            <button key={g} onClick={() => setGrupo(g)} style={styles.grupoSquare(grupo === g)}>{g}</button>
          ))}
        </div>
      )}

      {partidosVista.length === 0 && (
        <p style={{ textAlign: "center", color: color.mutedSoft }}>
          No hay partidos para esta fase. Inserta los partidos en Supabase cuando se conozcan los clasificados.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {partidosVista.map(p => {
          const d = draft[p.id] || {};
          const cambiado =
            d.goles_local !== p.goles_local || d.goles_visitante !== p.goles_visitante;
          return (
            <div
              key={p.id}
              style={{
                background: color.surface,
                borderRadius: radius.lg,
                padding: "0.8rem 1rem",
                border: `2px solid ${p.resultado_ingresado ? color.successSoft : color.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.7rem", color: color.mutedSoft }}>
                <span>{p.grupo ? `Grupo ${p.grupo} · ` : ""}{p.id}</span>
                <span>📅 {p.fecha}</span>
                {p.resultado_ingresado && <span style={{ color: color.success }}>✅ Guardado</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ flex: 1, textAlign: "right", fontSize: "0.85rem", color: color.text, fontWeight: 600 }}>
                  {flag(p.equipo_local)} {p.equipo_local}
                </div>
                <input type="number" min="0" value={d.goles_local ?? ""} onChange={e => setVal(p.id, "goles_local", e.target.value)} style={inputScore} />
                <span style={{ color: color.mutedSoft }}>—</span>
                <input type="number" min="0" value={d.goles_visitante ?? ""} onChange={e => setVal(p.id, "goles_visitante", e.target.value)} style={inputScore} />
                <div style={{ flex: 1, textAlign: "left", fontSize: "0.85rem", color: color.text, fontWeight: 600 }}>
                  {p.equipo_visitante} {flag(p.equipo_visitante)}
                </div>
              </div>
              <button
                onClick={() => guardar(p)}
                disabled={busy === p.id || !cambiado}
                style={{
                  marginTop: "0.6rem",
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: radius.sm,
                  border: "none",
                  background: cambiado ? color.navy : color.border,
                  color: cambiado ? color.gold : color.mutedSoft,
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: cambiado ? "pointer" : "not-allowed",
                }}
              >
                {busy === p.id ? "Guardando..." : p.resultado_ingresado ? "Actualizar resultado" : "💾 Guardar y calcular puntos"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inputScore = {
  width: 48,
  padding: "0.4rem",
  borderRadius: radius.sm,
  border: `2px solid ${color.border}`,
  textAlign: "center",
  fontSize: "1rem",
  fontWeight: 700,
};
