import { useState } from "react";
import { updateFaseEstado } from "@/api/fases";
import { useFases } from "@/hooks/useFases";
import { styles, color, radius } from "@/styles/theme";

export default function AdminFases() {
  const { fases, refresh } = useFases();
  const [busy, setBusy] = useState(null);

  const setEstado = async (id, estado) => {
    setBusy(id);
    try {
      await updateFaseEstado(id, estado);
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {fases.map(p => (
        <div key={p.id} style={styles.card}>
          <span style={{ fontSize: "1.2rem" }}>{p.icono}</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, color: color.text }}>{p.nombre}</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: color.mutedSoft }}>Estado: {p.estado}</p>
          </div>
          <select
            value={p.estado}
            disabled={busy === p.id}
            onChange={e => setEstado(p.id, e.target.value)}
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: radius.sm,
              border: `1px solid ${color.border}`,
              background: color.surface,
              color: color.text,
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            <option value="activa">🟢 Activa</option>
            <option value="cerrada">🏁 Cerrada</option>
            <option value="bloqueada">🔒 Bloqueada</option>
          </select>
        </div>
      ))}
    </div>
  );
}
