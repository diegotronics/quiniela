import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";

export default function Tabla({ fases }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const [{ data: usuarios }, { data: preds }] = await Promise.all([
        supabase.from("usuarios").select("id, nombre, avatar, color, es_admin, pagado"),
        supabase.from("predicciones").select("usuario_id, puntos_obtenidos"),
      ]);
      if (cancel) return;
      const totales = new Map();
      (preds || []).forEach(p => {
        totales.set(p.usuario_id, (totales.get(p.usuario_id) || 0) + (p.puntos_obtenidos || 0));
      });
      const sorted = (usuarios || [])
        .filter(u => !u.es_admin)
        .map(u => ({ ...u, puntos: totales.get(u.id) || 0 }))
        .sort((a, b) => b.puntos - a.puntos);
      setRows(sorted);
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, []);

  const faseActual = useMemo(() => fases.find(f => f.estado === "activa"), [fases]);
  const fasesJugadas = fases.filter(f => f.estado === "cerrada").length;
  const pozo = rows.length * 5;
  const premios = ["🥇 50%", "🥈 30%", "🥉 20%"];

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #2d3748)", borderRadius: 16, padding: "1.2rem", marginBottom: "1rem", textAlign: "center" }}>
        <p style={{ color: "#a0aec0", fontSize: "0.8rem", margin: "0 0 0.3rem" }}>FASE ACTUAL</p>
        <p style={{ color: "#FFD700", fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
          {faseActual ? `${faseActual.icono || "⚽"} ${faseActual.nombre}` : "— sin fase activa —"}
        </p>
        {faseActual && <p style={{ color: "#68d391", fontSize: "0.85rem", margin: "0.3rem 0 0" }}>🟢 Abierta para apuestas</p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
        <Card title="POZO TOTAL" value={`$${pozo}`} hint={`${rows.length} jugadores × $5`} />
        <Card title="RONDAS" value={`${fasesJugadas}/${fases.length || 7}`} hint="fases jugadas" />
      </div>

      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <div style={{ padding: "1rem 1.2rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1a1a2e" }}>🏅 Clasificación</h2>
          <span style={{ fontSize: "0.75rem", color: "#68d391", background: "#f0fff4", padding: "0.2rem 0.6rem", borderRadius: 20, border: "1px solid #9ae6b4" }}>🔴 En vivo</span>
        </div>
        {loading && <p style={{ padding: "1rem", textAlign: "center", color: "#a0aec0" }}>Cargando...</p>}
        {!loading && rows.length === 0 && <p style={{ padding: "1rem", textAlign: "center", color: "#a0aec0" }}>Aún no hay jugadores.</p>}
        {rows.map((u, i) => (
          <div key={u.id} style={{ padding: "0.9rem 1.2rem", borderBottom: i < rows.length - 1 ? "1px solid #f7fafc" : "none", display: "flex", alignItems: "center", gap: "0.9rem", background: i === 0 ? "#fffbeb" : i === 1 ? "#f7faff" : i === 2 ? "#fff8f4" : "#fff" }}>
            <div style={{ width: 28, textAlign: "center", fontSize: i < 3 ? "1.3rem" : "1rem", fontWeight: 700, color: i < 3 ? "#1a1a2e" : "#a0aec0" }}>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
            </div>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: u.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0 }}>
              {u.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: i < 3 ? 700 : 500, color: "#2d3748" }}>
                {u.nombre} {u.pagado === false && <span title="Aún no paga" style={{ color: "#dd6b20", fontSize: "0.7rem" }}>💸</span>}
              </p>
              {i < 3 && <p style={{ margin: 0, fontSize: "0.7rem", color: "#a0aec0" }}>{premios[i]} del pozo</p>}
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: i === 0 ? "#D69E2E" : "#2d3748" }}>{u.puntos}</p>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#a0aec0" }}>puntos</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: "1.2rem", marginTop: "1rem", border: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 0.8rem", fontSize: "0.95rem", color: "#1a1a2e" }}>📊 Sistema de Puntos</h3>
        {fases.map(f => (
          <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #f7fafc", fontSize: "0.85rem" }}>
            <span style={{ color: "#4a5568" }}>{f.icono} {f.nombre}</span>
            <span style={{ color: "#718096" }}>
              <span style={{ color: "#276749", fontWeight: 700 }}>{f.pts_exacto} pts</span> exacto · <span style={{ color: "#2B6CB0" }}>{f.pts_ganador} pts</span> ganador
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, value, hint }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "1rem", textAlign: "center", border: "1px solid #e2e8f0" }}>
      <p style={{ color: "#718096", fontSize: "0.75rem", margin: "0 0 0.3rem" }}>{title}</p>
      <p style={{ color: "#2d3748", fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>{value}</p>
      <p style={{ color: "#a0aec0", fontSize: "0.7rem", margin: 0 }}>{hint}</p>
    </div>
  );
}
