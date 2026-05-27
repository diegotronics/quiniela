import { useMemo } from "react";
import { listPuntajesGlobales } from "@/api/predicciones";
import { listUsuariosPublic } from "@/api/usuarios";
import { useAsync } from "@/hooks/useAsync";
import { color, radius, styles } from "@/styles/theme";

const PREMIOS = ["🥇 50%", "🥈 30%", "🥉 20%"];

async function loadClasificacion() {
  const [usuarios, preds] = await Promise.all([listUsuariosPublic(), listPuntajesGlobales()]);
  const totales = new Map();
  for (const p of preds) {
    totales.set(p.usuario_id, (totales.get(p.usuario_id) || 0) + (p.puntos_obtenidos || 0));
  }
  return usuarios
    .filter(u => !u.es_admin)
    .map(u => ({ ...u, puntos: totales.get(u.id) || 0 }))
    .sort((a, b) => b.puntos - a.puntos);
}

export default function Tabla({ fases }) {
  const { data: rows, loading } = useAsync(loadClasificacion, []);
  const lista = rows || [];

  const faseActual = useMemo(() => fases.find(f => f.estado === "activa"), [fases]);
  const fasesJugadas = fases.filter(f => f.estado === "cerrada").length;
  const pozo = lista.length * 5;

  return (
    <div>
      <div style={{ ...styles.panel, marginBottom: "1rem", textAlign: "center" }}>
        <p style={{ color: color.mutedSoft, fontSize: "0.8rem", margin: "0 0 0.3rem" }}>FASE ACTUAL</p>
        <p style={{ color: color.gold, fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
          {faseActual ? `${faseActual.icono || "⚽"} ${faseActual.nombre}` : "— sin fase activa —"}
        </p>
        {faseActual && <p style={{ color: "#68d391", fontSize: "0.85rem", margin: "0.3rem 0 0" }}>🟢 Abierta para apuestas</p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
        <Card title="POZO TOTAL" value={`$${pozo}`} hint={`${lista.length} jugadores × $5`} />
        <Card title="RONDAS" value={`${fasesJugadas}/${fases.length || 7}`} hint="fases jugadas" />
      </div>

      <div style={{ background: color.surface, borderRadius: radius.xxl, overflow: "hidden", border: `1px solid ${color.border}` }}>
        <div style={{ padding: "1rem 1.2rem", borderBottom: `1px solid ${color.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: color.navy }}>🏅 Clasificación</h2>
          <span style={{
            fontSize: "0.75rem",
            color: "#68d391",
            background: color.successBg,
            padding: "0.2rem 0.6rem",
            borderRadius: 20,
            border: `1px solid ${color.successSoft}`,
          }}>
            🔴 En vivo
          </span>
        </div>

        {loading && <p style={{ padding: "1rem", textAlign: "center", color: color.mutedSoft }}>Cargando...</p>}
        {!loading && lista.length === 0 && (
          <p style={{ padding: "1rem", textAlign: "center", color: color.mutedSoft }}>Aún no hay jugadores.</p>
        )}

        {lista.map((u, i) => (
          <RankingRow key={u.id} usuario={u} index={i} isLast={i === lista.length - 1} />
        ))}
      </div>

      <div style={{ background: color.surface, borderRadius: radius.xxl, padding: "1.2rem", marginTop: "1rem", border: `1px solid ${color.border}` }}>
        <h3 style={{ margin: "0 0 0.8rem", fontSize: "0.95rem", color: color.navy }}>📊 Sistema de Puntos</h3>
        {fases.map(f => (
          <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: `1px solid ${color.surfaceAlt}`, fontSize: "0.85rem" }}>
            <span style={{ color: color.slateLight }}>{f.icono} {f.nombre}</span>
            <span style={{ color: color.muted }}>
              <span style={{ color: color.success, fontWeight: 700 }}>{f.pts_exacto} pts</span> exacto ·{" "}
              <span style={{ color: color.info }}>{f.pts_ganador} pts</span> ganador
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankingRow({ usuario: u, index: i, isLast }) {
  const bg = i === 0 ? "#fffbeb" : i === 1 ? "#f7faff" : i === 2 ? "#fff8f4" : color.surface;
  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
  return (
    <div style={{
      padding: "0.9rem 1.2rem",
      borderBottom: isLast ? "none" : `1px solid ${color.surfaceAlt}`,
      display: "flex", alignItems: "center", gap: "0.9rem", background: bg,
    }}>
      <div style={{ width: 28, textAlign: "center", fontSize: i < 3 ? "1.3rem" : "1rem", fontWeight: 700, color: i < 3 ? color.navy : color.mutedSoft }}>
        {medal}
      </div>
      <div style={{ ...styles.avatar(u.color), width: 38, height: 38 }}>{u.avatar}</div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: i < 3 ? 700 : 500, color: color.text }}>
          {u.nombre}{" "}
          {u.pagado === false && (
            <span title="Aún no paga" style={{ color: color.paymentDue, fontSize: "0.7rem" }}>💸</span>
          )}
        </p>
        {i < 3 && <p style={{ margin: 0, fontSize: "0.7rem", color: color.mutedSoft }}>{PREMIOS[i]} del pozo</p>}
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: i === 0 ? color.goldDeep : color.text }}>
          {u.puntos}
        </p>
        <p style={{ margin: 0, fontSize: "0.7rem", color: color.mutedSoft }}>puntos</p>
      </div>
    </div>
  );
}

function Card({ title, value, hint }) {
  return (
    <div style={{ background: color.surface, borderRadius: radius.lg, padding: "1rem", textAlign: "center", border: `1px solid ${color.border}` }}>
      <p style={{ color: color.muted, fontSize: "0.75rem", margin: "0 0 0.3rem" }}>{title}</p>
      <p style={{ color: color.text, fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>{value}</p>
      <p style={{ color: color.mutedSoft, fontSize: "0.7rem", margin: 0 }}>{hint}</p>
    </div>
  );
}
