import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AdminFases from "./admin/AdminFases.jsx";
import AdminResultados from "./admin/AdminResultados.jsx";
import AdminUsuarios from "./admin/AdminUsuarios.jsx";
import { color, radius, styles } from "@/styles/theme";

const TABS = [
  { id: "fases", label: "Fases", Component: AdminFases },
  { id: "resultados", label: "Resultados", Component: AdminResultados },
  { id: "usuarios", label: "Usuarios", Component: AdminUsuarios },
];

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("fases");

  const Current = TABS.find(t => t.id === tab)?.Component;

  return (
    <div style={{ ...styles.page, paddingBottom: "2rem" }}>
      <header style={styles.appHeader}>
        <div>
          <h1 style={styles.brandTitle}>⚙️ Panel Admin</h1>
          <p style={styles.brandSubtitle}>La Copa Familiar</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => navigate("/app")} style={styles.btnGhost}>← Volver</button>
          <button onClick={logout} style={styles.btnGhost}>Salir</button>
        </div>
      </header>

      <div style={{ padding: "1rem" }}>
        <div style={{ ...styles.panel, marginBottom: "1rem" }}>
          <h2 style={{ color: color.gold, margin: 0, fontSize: "1.1rem" }}>Hola, {user?.nombre}</h2>
          <p style={{ color: color.mutedSoft, margin: "0.3rem 0 0", fontSize: "0.8rem" }}>
            Solo el admin puede ver esto
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: "0.6rem 0.3rem",
                borderRadius: radius.md,
                border: "none",
                cursor: "pointer",
                background: tab === t.id ? color.navy : color.border,
                color: tab === t.id ? color.gold : color.slateLight,
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {Current && <Current />}

        <p style={{ textAlign: "center", color: color.mutedSoft, fontSize: "0.75rem", marginTop: "2rem" }}>
          <Link to="/app" style={{ color: color.info }}>← Volver a la app normal</Link>
        </p>
      </div>
    </div>
  );
}
