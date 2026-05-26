import { useState, useEffect } from "react";

const PHASES = [
  { id: "grupos", name: "Fase de Grupos", icon: "⚽", status: "active" },
  { id: "dieciseisavos", name: "1/16 de Final", icon: "⚔️", status: "locked" },
  { id: "octavos", name: "Octavos de Final", icon: "🔥", status: "locked" },
  { id: "cuartos", name: "Cuartos de Final", icon: "💫", status: "locked" },
  { id: "semifinal", name: "Semifinal", icon: "🌟", status: "locked" },
  { id: "tercerpuesto", name: "Tercer Puesto", icon: "🥉", status: "locked" },
  { id: "final", name: "Gran Final", icon: "🏆", status: "locked" },
];

const GRUPOS = [
  { id: "A", equipos: ["México", "EEUU", "Canadá", "Honduras"] },
  { id: "B", equipos: ["España", "Francia", "Portugal", "Marruecos"] },
  { id: "C", equipos: ["Brasil", "Argentina", "Colombia", "Ecuador"] },
  { id: "D", equipos: ["Alemania", "Inglaterra", "Italia", "Bélgica"] },
  { id: "E", equipos: ["Holanda", "Turquía", "Ucrania", "Austria"] },
  { id: "F", equipos: ["Japón", "Corea del Sur", "Australia", "Arabia Saudita"] },
  { id: "G", equipos: ["Senegal", "Nigeria", "Costa de Marfil", "Ghana"] },
  { id: "H", equipos: ["Uruguay", "Chile", "Perú", "Paraguay"] },
  { id: "I", equipos: ["Suiza", "Dinamarca", "Escocia", "Serbia"] },
  { id: "J", equipos: ["Irán", "Qatar", "Irak", "Jordania"] },
  { id: "K", equipos: ["Costa Rica", "Panamá", "Jamaica", "Venezuela"] },
  { id: "L", equipos: ["Suecia", "Noruega", "Finlandia", "Islandia"] },
];

const PARTIDOS_GRUPOS = GRUPOS.flatMap(g => [
  { id: `${g.id}1`, grupo: g.id, local: g.equipos[0], visitante: g.equipos[1], fecha: "11 Jun" },
  { id: `${g.id}2`, grupo: g.id, local: g.equipos[2], visitante: g.equipos[3], fecha: "12 Jun" },
  { id: `${g.id}3`, grupo: g.id, local: g.equipos[0], visitante: g.equipos[2], fecha: "15 Jun" },
  { id: `${g.id}4`, grupo: g.id, local: g.equipos[1], visitante: g.equipos[3], fecha: "15 Jun" },
  { id: `${g.id}5`, grupo: g.id, local: g.equipos[0], visitante: g.equipos[3], fecha: "19 Jun" },
  { id: `${g.id}6`, grupo: g.id, local: g.equipos[1], visitante: g.equipos[2], fecha: "19 Jun" },
]);

const PARTIDOS_ELIM = {
  dieciseisavos: Array.from({ length: 16 }, (_, i) => ({
    id: `d16_${i + 1}`, local: `Clasificado ${i * 2 + 1}`, visitante: `Clasificado ${i * 2 + 2}`, fecha: `${28 + Math.floor(i / 3)} Jun`
  })),
  octavos: Array.from({ length: 8 }, (_, i) => ({
    id: `oct_${i + 1}`, local: `Ganador 1/16 ${i * 2 + 1}`, visitante: `Ganador 1/16 ${i * 2 + 2}`, fecha: `${4 + Math.floor(i / 2)} Jul`
  })),
  cuartos: Array.from({ length: 4 }, (_, i) => ({
    id: `cua_${i + 1}`, local: `Ganador 1/8 ${i * 2 + 1}`, visitante: `Ganador 1/8 ${i * 2 + 2}`, fecha: `${9 + i} Jul`
  })),
  semifinal: [
    { id: "semi_1", local: "Semifinalista 1", visitante: "Semifinalista 2", fecha: "14 Jul" },
    { id: "semi_2", local: "Semifinalista 3", visitante: "Semifinalista 4", fecha: "15 Jul" },
  ],
  tercerpuesto: [{ id: "3er", local: "Perdedor Semi 1", visitante: "Perdedor Semi 2", fecha: "18 Jul" }],
  final: [{ id: "final_1", local: "Finalista 1", visitante: "Finalista 2", fecha: "19 Jul" }],
};

const PUNTOS_POR_FASE = {
  grupos: { exacto: 3, ganador: 1 },
  dieciseisavos: { exacto: 4, ganador: 2 },
  octavos: { exacto: 5, ganador: 2 },
  cuartos: { exacto: 6, ganador: 3 },
  semifinal: { exacto: 8, ganador: 4 },
  tercerpuesto: { exacto: 6, ganador: 3 },
  final: { exacto: 15, ganador: 7 },
};

const USUARIOS = [
  { id: 1, nombre: "Mamá Rosa", puntos: 47, avatar: "MR", color: "#C53030" },
  { id: 2, nombre: "Papá Luis", puntos: 41, avatar: "PL", color: "#2B6CB0" },
  { id: 3, nombre: "Tío Carlos", puntos: 38, avatar: "TC", color: "#276749" },
  { id: 4, nombre: "Ana García", puntos: 35, avatar: "AG", color: "#B7791F" },
  { id: 5, nombre: "Pedro M.", puntos: 30, avatar: "PM", color: "#553C9A" },
  { id: 6, nombre: "Sofía R.", puntos: 28, avatar: "SR", color: "#C05621" },
  { id: 7, nombre: "Juan C.", puntos: 25, avatar: "JC", color: "#2C7A7B" },
  { id: 8, nombre: "María L.", puntos: 22, avatar: "ML", color: "#702459" },
];

const FLAGS = {
  "México": "🇲🇽", "EEUU": "🇺🇸", "Canadá": "🇨🇦", "Honduras": "🇭🇳",
  "España": "🇪🇸", "Francia": "🇫🇷", "Portugal": "🇵🇹", "Marruecos": "🇲🇦",
  "Brasil": "🇧🇷", "Argentina": "🇦🇷", "Colombia": "🇨🇴", "Ecuador": "🇪🇨",
  "Alemania": "🇩🇪", "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Italia": "🇮🇹", "Bélgica": "🇧🇪",
  "Holanda": "🇳🇱", "Turquía": "🇹🇷", "Ucrania": "🇺🇦", "Austria": "🇦🇹",
  "Japón": "🇯🇵", "Corea del Sur": "🇰🇷", "Australia": "🇦🇺", "Arabia Saudita": "🇸🇦",
  "Senegal": "🇸🇳", "Nigeria": "🇳🇬", "Costa de Marfil": "🇨🇮", "Ghana": "🇬🇭",
  "Uruguay": "🇺🇾", "Chile": "🇨🇱", "Perú": "🇵🇪", "Paraguay": "🇵🇾",
  "Suiza": "🇨🇭", "Dinamarca": "🇩🇰", "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Serbia": "🇷🇸",
  "Irán": "🇮🇷", "Qatar": "🇶🇦", "Irak": "🇮🇶", "Jordania": "🇯🇴",
  "Costa Rica": "🇨🇷", "Panamá": "🇵🇦", "Jamaica": "🇯🇲", "Venezuela": "🇻🇪",
  "Suecia": "🇸🇪", "Noruega": "🇳🇴", "Finlandia": "🇫🇮", "Islandia": "🇮🇸",
};

export default function App() {
  const [screen, setScreen] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setScreen2] = useState("tabla");
  const [activePhase, setActivePhase] = useState("grupos");
  const [activeGrupo, setActiveGrupo] = useState("A");
  const [predictions, setPredictions] = useState({});
  const [loginForm, setLoginForm] = useState({ usuario: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const usuarios_mock = [
    { id: 1, nombre: "Admin", usuario: "admin", password: "admin123", isAdmin: true, avatar: "AD", color: "#1a1a2e" },
    { id: 2, nombre: "Mamá Rosa", usuario: "mama", password: "1234", avatar: "MR", color: "#C53030" },
    { id: 3, nombre: "Papá Luis", usuario: "papa", password: "1234", avatar: "PL", color: "#2B6CB0" },
  ];

  const handleLogin = () => {
    const user = usuarios_mock.find(u => u.usuario === loginForm.usuario && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setScreen("app");
      setLoginError("");
    } else {
      setLoginError("Usuario o contraseña incorrectos");
    }
  };

  const setPred = (partidoId, tipo, valor) => {
    setPredictions(prev => ({
      ...prev,
      [partidoId]: { ...prev[partidoId], [tipo]: valor }
    }));
  };

  if (screen === "login") return <LoginScreen form={loginForm} setForm={setLoginForm} onLogin={handleLogin} error={loginError} />;
  return <MainApp currentUser={currentUser} activeTab={activeTab} setTab={setScreen2} activePhase={activePhase} setPhase={setActivePhase} activeGrupo={activeGrupo} setGrupo={setActiveGrupo} predictions={predictions} setPred={setPred} onLogout={() => setScreen("login")} />;
}

function LoginScreen({ form, setForm, onLogin, error }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d2137 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem", fontFamily: "'Georgia', serif" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>🏆</div>
        <h1 style={{ color: "#FFD700", fontSize: "2rem", fontWeight: "700", margin: 0, letterSpacing: "-0.5px", textShadow: "0 0 30px rgba(255,215,0,0.4)" }}>La Copa Familiar</h1>
        <p style={{ color: "#a0aec0", margin: "0.4rem 0 0", fontSize: "1.1rem", fontStyle: "italic" }}>Mundial 2026 ⚽</p>
      </div>

      <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "340px" }}>
        <div style={{ marginBottom: "1.2rem" }}>
          <label style={{ color: "#e2e8f0", fontSize: "0.9rem", display: "block", marginBottom: "0.5rem", fontFamily: "sans-serif" }}>👤 Usuario</label>
          <input
            type="text"
            placeholder="Escribe tu usuario"
            value={form.usuario}
            onChange={e => setForm(p => ({ ...p, usuario: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && onLogin()}
            style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid rgba(255,215,0,0.3)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "1rem", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif" }}
          />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ color: "#e2e8f0", fontSize: "0.9rem", display: "block", marginBottom: "0.5rem", fontFamily: "sans-serif" }}>🔒 Contraseña</label>
          <input
            type="password"
            placeholder="••••••"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && onLogin()}
            style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid rgba(255,215,0,0.3)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "1rem", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif" }}
          />
        </div>
        {error && <p style={{ color: "#fc8181", fontSize: "0.9rem", textAlign: "center", marginBottom: "1rem", fontFamily: "sans-serif" }}>⚠️ {error}</p>}
        <button onClick={onLogin} style={{ width: "100%", padding: "1rem", background: "linear-gradient(135deg, #FFD700, #FFA500)", border: "none", borderRadius: "12px", color: "#1a1a1a", fontSize: "1.1rem", fontWeight: "700", cursor: "pointer", fontFamily: "sans-serif" }}>
          Entrar a la Quiniela →
        </button>
        <p style={{ color: "#718096", fontSize: "0.8rem", textAlign: "center", marginTop: "1rem", fontFamily: "sans-serif" }}>
          ¿No tienes acceso? Escríbele al admin 😄
        </p>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1.5rem", color: "#718096", fontSize: "0.85rem", fontFamily: "sans-serif" }}>
        <span>💰 Entrada: $5</span>
        <span>👥 ~20 jugadores</span>
        <span>🎁 3 premios</span>
      </div>
    </div>
  );
}

function MainApp({ currentUser, activeTab, setTab, activePhase, setPhase, activeGrupo, setGrupo, predictions, setPred, onLogout }) {
  const tabs = [
    { id: "tabla", label: "Tabla", icon: "🏅" },
    { id: "apuestas", label: "Mis Apuestas", icon: "📝" },
    { id: "fases", label: "Fases", icon: "📅" },
    ...(currentUser?.isAdmin ? [{ id: "admin", label: "Admin", icon: "⚙️" }] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Helvetica Neue', sans-serif", paddingBottom: "80px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "1rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ color: "#FFD700", fontSize: "1.2rem", fontWeight: "700", margin: 0 }}>🏆 La Copa Familiar</h1>
          <p style={{ color: "#a0aec0", fontSize: "0.75rem", margin: 0 }}>Mundial 2026</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: currentUser?.color || "#553C9A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.8rem", fontWeight: "700" }}>
            {currentUser?.avatar}
          </div>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#a0aec0", padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.75rem", cursor: "pointer" }}>Salir</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1rem" }}>
        {activeTab === "tabla" && <TablaClasificacion />}
        {activeTab === "apuestas" && <MisApuestas activePhase={activePhase} setPhase={setPhase} activeGrupo={activeGrupo} setGrupo={setGrupo} predictions={predictions} setPred={setPred} />}
        {activeTab === "fases" && <InfoFases />}
        {activeTab === "admin" && <AdminPanel />}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e2e8f0", display: "flex", zIndex: 50 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setTab(tab.id)} style={{ flex: 1, padding: "0.7rem 0.2rem", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <span style={{ fontSize: "1.3rem" }}>{tab.icon}</span>
            <span style={{ fontSize: "0.65rem", color: activeTab === tab.id ? "#1a1a2e" : "#a0aec0", fontWeight: activeTab === tab.id ? "700" : "400" }}>{tab.label}</span>
            {activeTab === tab.id && <div style={{ width: "20px", height: "3px", background: "#FFD700", borderRadius: "2px" }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function TablaClasificacion() {
  const sorted = [...USUARIOS].sort((a, b) => b.puntos - a.puntos);
  const premios = ["🥇 50%", "🥈 30%", "🥉 20%"];
  const faseActual = "Fase de Grupos";

  return (
    <div>
      {/* Banner fase actual */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #2d3748)", borderRadius: "16px", padding: "1.2rem", marginBottom: "1rem", textAlign: "center" }}>
        <p style={{ color: "#a0aec0", fontSize: "0.8rem", margin: "0 0 0.3rem" }}>FASE ACTUAL</p>
        <p style={{ color: "#FFD700", fontSize: "1.3rem", fontWeight: "700", margin: 0 }}>⚽ {faseActual}</p>
        <p style={{ color: "#68d391", fontSize: "0.85rem", margin: "0.3rem 0 0" }}>🟢 Abierta para apuestas</p>
      </div>

      {/* Pozo total */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
        <div style={{ background: "#fff", borderRadius: "12px", padding: "1rem", textAlign: "center", border: "1px solid #e2e8f0" }}>
          <p style={{ color: "#718096", fontSize: "0.75rem", margin: "0 0 0.3rem" }}>POZO TOTAL</p>
          <p style={{ color: "#2d3748", fontSize: "1.6rem", fontWeight: "700", margin: 0 }}>$100</p>
          <p style={{ color: "#a0aec0", fontSize: "0.7rem", margin: 0 }}>20 jugadores × $5</p>
        </div>
        <div style={{ background: "#fff", borderRadius: "12px", padding: "1rem", textAlign: "center", border: "1px solid #e2e8f0" }}>
          <p style={{ color: "#718096", fontSize: "0.75rem", margin: "0 0 0.3rem" }}>RONDAS</p>
          <p style={{ color: "#2d3748", fontSize: "1.6rem", fontWeight: "700", margin: 0 }}>1/7</p>
          <p style={{ color: "#a0aec0", fontSize: "0.7rem", margin: 0 }}>fases jugadas</p>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <div style={{ padding: "1rem 1.2rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "#1a1a2e" }}>🏅 Clasificación en Vivo</h2>
          <span style={{ fontSize: "0.75rem", color: "#68d391", background: "#f0fff4", padding: "0.2rem 0.6rem", borderRadius: "20px", border: "1px solid #9ae6b4" }}>🔴 En vivo</span>
        </div>
        {sorted.map((user, i) => (
          <div key={user.id} style={{ padding: "0.9rem 1.2rem", borderBottom: i < sorted.length - 1 ? "1px solid #f7fafc" : "none", display: "flex", alignItems: "center", gap: "0.9rem", background: i === 0 ? "#fffbeb" : i === 1 ? "#f7faff" : i === 2 ? "#fff8f4" : "#fff" }}>
            <div style={{ width: "28px", textAlign: "center", fontSize: i < 3 ? "1.3rem" : "1rem", fontWeight: "700", color: i < 3 ? "#1a1a2e" : "#a0aec0" }}>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
            </div>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: user.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.8rem", fontWeight: "700", flexShrink: 0 }}>
              {user.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: i < 3 ? "700" : "500", color: "#2d3748" }}>{user.nombre}</p>
              {i < 3 && <p style={{ margin: 0, fontSize: "0.7rem", color: "#a0aec0" }}>{premios[i]} del pozo</p>}
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: "700", color: i === 0 ? "#D69E2E" : "#2d3748" }}>{user.puntos}</p>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#a0aec0" }}>puntos</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sistema de puntos */}
      <div style={{ background: "#fff", borderRadius: "16px", padding: "1.2rem", marginTop: "1rem", border: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 0.8rem", fontSize: "0.95rem", color: "#1a1a2e" }}>📊 Sistema de Puntos</h3>
        {Object.entries(PUNTOS_POR_FASE).map(([fase, pts]) => {
          const phaseInfo = PHASES.find(p => p.id === fase);
          return (
            <div key={fase} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #f7fafc", fontSize: "0.85rem" }}>
              <span style={{ color: "#4a5568" }}>{phaseInfo?.icon} {phaseInfo?.name}</span>
              <span style={{ color: "#718096" }}>
                <span style={{ color: "#276749", fontWeight: "700" }}>{pts.exacto} pts</span> exacto · <span style={{ color: "#2B6CB0" }}>{pts.ganador} pts</span> ganador
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MisApuestas({ activePhase, setPhase, activeGrupo, setGrupo, predictions, setPred }) {
  const phaseInfo = PHASES.find(p => p.id === activePhase);
  const partidos = activePhase === "grupos" ? PARTIDOS_GRUPOS.filter(p => p.grupo === activeGrupo) : PARTIDOS_ELIM[activePhase] || [];
  const pts = PUNTOS_POR_FASE[activePhase];
  const phaseSaved = partidos.filter(p => predictions[p.id]?.local !== undefined && predictions[p.id]?.visitante !== undefined).length;

  return (
    <div>
      {/* Selector de fase */}
      <div style={{ overflowX: "auto", display: "flex", gap: "0.5rem", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
        {PHASES.map(phase => (
          <button key={phase.id} onClick={() => phase.status !== "locked" && setPhase(phase.id)} style={{ flexShrink: 0, padding: "0.5rem 1rem", borderRadius: "20px", border: "none", cursor: phase.status === "locked" ? "not-allowed" : "pointer", background: activePhase === phase.id ? "#1a1a2e" : phase.status === "locked" ? "#f7fafc" : "#e2e8f0", color: activePhase === phase.id ? "#FFD700" : phase.status === "locked" ? "#cbd5e0" : "#4a5568", fontSize: "0.8rem", fontWeight: "600", whiteSpace: "nowrap" }}>
            {phase.icon} {phase.name} {phase.status === "locked" ? "🔒" : ""}
          </button>
        ))}
      </div>

      {/* Info puntos */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #2d3748)", borderRadius: "12px", padding: "0.8rem 1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ color: "#a0aec0", fontSize: "0.75rem", margin: 0 }}>Resultado exacto</p>
          <p style={{ color: "#68d391", fontSize: "1.1rem", fontWeight: "700", margin: 0 }}>+{pts.exacto} puntos</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "#a0aec0", fontSize: "0.75rem", margin: 0 }}>Acertar ganador</p>
          <p style={{ color: "#63b3ed", fontSize: "1.1rem", fontWeight: "700", margin: 0 }}>+{pts.ganador} puntos</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "#a0aec0", fontSize: "0.75rem", margin: 0 }}>Guardados</p>
          <p style={{ color: "#FFD700", fontSize: "1.1rem", fontWeight: "700", margin: 0 }}>{phaseSaved}/{partidos.length}</p>
        </div>
      </div>

      {/* Selector de grupo (solo fase grupos) */}
      {activePhase === "grupos" && (
        <div style={{ overflowX: "auto", display: "flex", gap: "0.5rem", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
          {GRUPOS.map(g => (
            <button key={g.id} onClick={() => setGrupo(g.id)} style={{ flexShrink: 0, width: "40px", height: "40px", borderRadius: "10px", border: "none", cursor: "pointer", background: activeGrupo === g.id ? "#FFD700" : "#e2e8f0", color: activeGrupo === g.id ? "#1a1a2e" : "#4a5568", fontSize: "0.9rem", fontWeight: "700" }}>
              {g.id}
            </button>
          ))}
        </div>
      )}

      {/* Lista de partidos */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        {partidos.map(partido => (
          <PartidoCard key={partido.id} partido={partido} pred={predictions[partido.id] || {}} setPred={(tipo, val) => setPred(partido.id, tipo, val)} />
        ))}
      </div>

      {phaseSaved === partidos.length && partidos.length > 0 && (
        <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "12px", padding: "1rem", marginTop: "1rem", textAlign: "center" }}>
          <p style={{ margin: 0, color: "#276749", fontWeight: "700" }}>✅ ¡Todos los partidos guardados!</p>
          <p style={{ margin: "0.3rem 0 0", color: "#48bb78", fontSize: "0.85rem" }}>Tus predicciones están listas para esta fase.</p>
        </div>
      )}
    </div>
  );
}

function PartidoCard({ partido, pred, setPred }) {
  const saved = pred.local !== undefined && pred.visitante !== undefined;
  const localFlag = FLAGS[partido.local] || "🏳";
  const visFlag = FLAGS[partido.visitante] || "🏳";

  return (
    <div style={{ background: "#fff", borderRadius: "14px", padding: "1rem", border: `2px solid ${saved ? "#9ae6b4" : "#e2e8f0"}`, transition: "border-color 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
        {partido.grupo && <span style={{ fontSize: "0.7rem", color: "#a0aec0", background: "#f7fafc", padding: "0.2rem 0.6rem", borderRadius: "10px" }}>Grupo {partido.grupo}</span>}
        <span style={{ fontSize: "0.7rem", color: "#a0aec0", marginLeft: "auto" }}>📅 {partido.fecha}</span>
        {saved && <span style={{ fontSize: "0.75rem", color: "#276749", marginLeft: "0.5rem" }}>✅</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        {/* Local */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem" }}>{localFlag}</div>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#4a5568", fontWeight: "600", lineHeight: 1.2 }}>{partido.local}</p>
        </div>

        {/* Marcador */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <ScoreInput value={pred.local} onChange={v => setPred("local", v)} />
          <span style={{ color: "#a0aec0", fontSize: "1.2rem", fontWeight: "300" }}>—</span>
          <ScoreInput value={pred.visitante} onChange={v => setPred("visitante", v)} />
        </div>

        {/* Visitante */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem" }}>{visFlag}</div>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#4a5568", fontWeight: "600", lineHeight: 1.2 }}>{partido.visitante}</p>
        </div>
      </div>
    </div>
  );
}

function ScoreInput({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <button onClick={() => onChange((value || 0) + 1)} style={{ width: "32px", height: "28px", background: "#1a1a2e", border: "none", borderRadius: "8px", color: "#FFD700", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      <div style={{ width: "40px", height: "40px", background: "#f7fafc", border: "2px solid #e2e8f0", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: "700", color: "#1a1a2e" }}>
        {value !== undefined ? value : "?"}
      </div>
      <button onClick={() => onChange(Math.max(0, (value || 0) - 1))} style={{ width: "32px", height: "28px", background: "#e2e8f0", border: "none", borderRadius: "8px", color: "#4a5568", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
    </div>
  );
}

function InfoFases() {
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #2d3748)", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem" }}>🏆</div>
        <h2 style={{ color: "#FFD700", margin: "0.5rem 0 0.3rem", fontSize: "1.3rem" }}>Camino a la Final</h2>
        <p style={{ color: "#a0aec0", margin: 0, fontSize: "0.85rem" }}>Mundial 2026 — 48 equipos, 104 partidos</p>
      </div>

      {PHASES.map((phase, i) => (
        <div key={phase.id} style={{ background: "#fff", borderRadius: "14px", padding: "1rem 1.2rem", marginBottom: "0.6rem", border: `2px solid ${phase.status === "active" ? "#9ae6b4" : "#e2e8f0"}`, display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>{phase.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "0.95rem", color: "#1a1a2e", fontWeight: "700" }}>{phase.name}</h3>
              {phase.status === "active" && <span style={{ fontSize: "0.65rem", color: "#276749", background: "#f0fff4", padding: "0.15rem 0.5rem", borderRadius: "10px", border: "1px solid #9ae6b4" }}>ACTIVA</span>}
              {phase.status === "locked" && <span style={{ fontSize: "0.65rem", color: "#a0aec0", background: "#f7fafc", padding: "0.15rem 0.5rem", borderRadius: "10px" }}>🔒 Bloqueada</span>}
            </div>
            <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", color: "#718096" }}>
              {phase.id === "grupos" && "48 equipos · 12 grupos · 96 partidos · Jun 11–25"}
              {phase.id === "dieciseisavos" && "32 equipos · 16 partidos · Jun 28 – Jul 3"}
              {phase.id === "octavos" && "16 equipos · 8 partidos · Jul 4–7"}
              {phase.id === "cuartos" && "8 equipos · 4 partidos · Jul 9–11"}
              {phase.id === "semifinal" && "4 equipos · 2 partidos · Jul 14–15"}
              {phase.id === "tercerpuesto" && "Bronce · 1 partido · Jul 18 · Miami"}
              {phase.id === "final" && "🌎 1 partido · Jul 19 · MetLife Stadium, Nueva York"}
            </p>
            <p style={{ margin: "0.3rem 0 0", fontSize: "0.75rem" }}>
              <span style={{ color: "#276749", fontWeight: "700" }}>+{PUNTOS_POR_FASE[phase.id].exacto} pts</span>
              <span style={{ color: "#a0aec0" }}> resultado exacto · </span>
              <span style={{ color: "#2B6CB0", fontWeight: "700" }}>+{PUNTOS_POR_FASE[phase.id].ganador} pts</span>
              <span style={{ color: "#a0aec0" }}> acertar ganador</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminPanel() {
  const [selectedPhase, setSelectedPhase] = useState("grupos");
  const [tab, setTab] = useState("fases");

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #2d3748)", borderRadius: "16px", padding: "1.2rem", marginBottom: "1rem" }}>
        <h2 style={{ color: "#FFD700", margin: 0, fontSize: "1.1rem" }}>⚙️ Panel de Admin</h2>
        <p style={{ color: "#a0aec0", margin: "0.3rem 0 0", fontSize: "0.8rem" }}>Solo tú puedes ver esto</p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {[{ id: "fases", label: "Gestionar Fases" }, { id: "resultados", label: "Meter Resultados" }, { id: "usuarios", label: "Usuarios" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "0.6rem 0.3rem", borderRadius: "10px", border: "none", cursor: "pointer", background: tab === t.id ? "#1a1a2e" : "#e2e8f0", color: tab === t.id ? "#FFD700" : "#4a5568", fontSize: "0.7rem", fontWeight: "700" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "fases" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {PHASES.map(phase => (
            <div key={phase.id} style={{ background: "#fff", borderRadius: "12px", padding: "0.9rem 1rem", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "1rem" }}>{phase.icon}</span>
              <span style={{ flex: 1, marginLeft: "0.8rem", fontSize: "0.9rem", color: "#2d3748", fontWeight: "600" }}>{phase.name}</span>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button style={{ padding: "0.3rem 0.6rem", borderRadius: "8px", border: "none", cursor: "pointer", background: phase.status === "active" ? "#276749" : "#e2e8f0", color: phase.status === "active" ? "#fff" : "#4a5568", fontSize: "0.7rem", fontWeight: "700" }}>
                  {phase.status === "active" ? "✅ Activa" : phase.status === "locked" ? "🔒 Abrir" : "Cerrar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "resultados" && (
        <div>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "1rem", border: "1px solid #e2e8f0", marginBottom: "0.8rem", textAlign: "center" }}>
            <p style={{ color: "#4a5568", fontSize: "0.9rem", margin: 0 }}>Aquí podrás ingresar los resultados reales de cada partido.</p>
            <p style={{ color: "#a0aec0", fontSize: "0.8rem", margin: "0.5rem 0 0" }}>Los puntos se calcularán y actualizarán automáticamente para todos.</p>
          </div>
          <div style={{ background: "#fffbeb", border: "1px solid #f6e05e", borderRadius: "12px", padding: "0.8rem 1rem" }}>
            <p style={{ margin: 0, color: "#744210", fontSize: "0.85rem" }}>
              💡 Esta función estará completamente operativa cuando conectemos la base de datos (Paso 2).
            </p>
          </div>
        </div>
      )}

      {tab === "usuarios" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {USUARIOS.map(u => (
            <div key={u.id} style={{ background: "#fff", borderRadius: "12px", padding: "0.8rem 1rem", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: u.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: "700", flexShrink: 0 }}>{u.avatar}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "600", color: "#2d3748" }}>{u.nombre}</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#a0aec0" }}>{u.puntos} puntos acumulados</p>
              </div>
              <button style={{ padding: "0.3rem 0.7rem", borderRadius: "8px", border: "1px solid #e2e8f0", background: "none", color: "#718096", fontSize: "0.75rem", cursor: "pointer" }}>Editar</button>
            </div>
          ))}
          <button style={{ padding: "0.8rem", borderRadius: "12px", border: "2px dashed #e2e8f0", background: "none", color: "#a0aec0", fontSize: "0.9rem", cursor: "pointer", marginTop: "0.4rem" }}>
            + Agregar nuevo jugador
          </button>
        </div>
      )}
    </div>
  );
}
