import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabase.js";
import Tabla from "../components/Tabla.jsx";
import Apuestas from "../components/Apuestas.jsx";
import Fases from "../components/Fases.jsx";

export default function MainApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tabla");
  const [fases, setFases] = useState([]);

  useEffect(() => {
    supabase
      .from("fases")
      .select("*")
      .order("orden")
      .then(({ data }) => setFases(data || []));
  }, []);

  const tabs = [
    { id: "tabla", label: "Tabla", icon: "🏅" },
    { id: "apuestas", label: "Mis Apuestas", icon: "📝" },
    { id: "fases", label: "Fases", icon: "📅" },
    ...(user?.es_admin ? [{ id: "admin", label: "Admin", icon: "⚙️" }] : []),
  ];

  const handleTab = (id) => {
    if (id === "admin") navigate("/admin");
    else setActiveTab(id);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Helvetica Neue', sans-serif", paddingBottom: "80px" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "1rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ color: "#FFD700", fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>🏆 La Copa Familiar</h1>
          <p style={{ color: "#a0aec0", fontSize: "0.75rem", margin: 0 }}>Mundial 2026</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: user?.color || "#553C9A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.8rem", fontWeight: 700 }}>
            {user?.avatar}
          </div>
          <button onClick={logout} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#a0aec0", padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.75rem", cursor: "pointer" }}>Salir</button>
        </div>
      </div>

      <div style={{ padding: "1rem" }}>
        {activeTab === "tabla" && <Tabla fases={fases} />}
        {activeTab === "apuestas" && <Apuestas fases={fases} />}
        {activeTab === "fases" && <Fases fases={fases} />}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e2e8f0", display: "flex", zIndex: 50 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => handleTab(tab.id)} style={{ flex: 1, padding: "0.7rem 0.2rem", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <span style={{ fontSize: "1.3rem" }}>{tab.icon}</span>
            <span style={{ fontSize: "0.65rem", color: activeTab === tab.id ? "#1a1a2e" : "#a0aec0", fontWeight: activeTab === tab.id ? 700 : 400 }}>{tab.label}</span>
            {activeTab === tab.id && <div style={{ width: 20, height: 3, background: "#FFD700", borderRadius: 2 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
