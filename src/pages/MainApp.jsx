import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFases } from "@/hooks/useFases";
import Tabla from "@/components/Tabla.jsx";
import Apuestas from "@/components/Apuestas.jsx";
import Fases from "@/components/Fases.jsx";
import { color, styles } from "@/styles/theme";

const TABS = [
  { id: "tabla", label: "Tabla", icon: "🏅" },
  { id: "apuestas", label: "Mis Apuestas", icon: "📝" },
  { id: "fases", label: "Fases", icon: "📅" },
];

export default function MainApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tabla");
  const { fases } = useFases();

  const tabs = [
    ...TABS,
    ...(user?.es_admin ? [{ id: "admin", label: "Admin", icon: "⚙️" }] : []),
  ];

  const handleTab = (id) => {
    if (id === "admin") navigate("/admin");
    else setActiveTab(id);
  };

  return (
    <div style={{ ...styles.page, paddingBottom: "80px" }}>
      <header style={styles.appHeader}>
        <div>
          <h1 style={styles.brandTitle}>🏆 La Copa Familiar</h1>
          <p style={styles.brandSubtitle}>Mundial 2026</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <div style={styles.avatar(user?.color)}>{user?.avatar}</div>
          <button onClick={logout} style={styles.btnGhost}>Salir</button>
        </div>
      </header>

      <div style={{ padding: "1rem" }}>
        {activeTab === "tabla" && <Tabla fases={fases} />}
        {activeTab === "apuestas" && <Apuestas fases={fases} />}
        {activeTab === "fases" && <Fases fases={fases} />}
      </div>

      <nav
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: color.surface,
          borderTop: `1px solid ${color.border}`,
          display: "flex",
          zIndex: 50,
        }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTab(tab.id)}
            style={{
              flex: 1,
              padding: "0.7rem 0.2rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>{tab.icon}</span>
            <span style={{
              fontSize: "0.65rem",
              color: activeTab === tab.id ? color.navy : color.mutedSoft,
              fontWeight: activeTab === tab.id ? 700 : 400,
            }}>
              {tab.label}
            </span>
            {activeTab === tab.id && <div style={{ width: 20, height: 3, background: color.gold, borderRadius: 2 }} />}
          </button>
        ))}
      </nav>
    </div>
  );
}
