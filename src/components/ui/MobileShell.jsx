import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon.jsx";
import { Avatar } from "./Avatar.jsx";

const iconBtn = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: "transparent",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  color: "var(--ink)",
};

export function MobileHeader({ title, subtitle, leading, trailing = true, big = true, sticky = true }) {
  return (
    <div
      style={{
        position: sticky ? "sticky" : "static",
        top: 0,
        zIndex: 5,
        background: "var(--bg)",
        paddingTop: 24,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: big ? 14 : 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{leading}</div>
        {trailing && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button style={iconBtn} aria-label="Notificaciones">
              <Icon.Bell />
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  right: 9,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--coral)",
                }}
              />
            </button>
          </div>
        )}
      </div>
      {big && (
        <div style={{ marginTop: 14 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: 32,
              lineHeight: 1.05,
              letterSpacing: -0.6,
              color: "var(--ink)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <div style={{ marginTop: 4, color: "var(--ink-3)", fontSize: 14, letterSpacing: -0.1 }}>
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const DEFAULT_TABS = [
  { id: "inicio",   label: "Inicio",    icon: Icon.Home,    path: "/app/inicio" },
  { id: "bracket",  label: "Bracket",   icon: Icon.Bracket, path: "/app/bracket" },
  { id: "partidos", label: "Partidos",  icon: Icon.Cal,     path: "/app/partidos" },
  { id: "tabla",    label: "Tabla",     icon: Icon.Trophy,  path: "/app/tabla" },
  { id: "perfil",   label: "Perfil",    icon: Icon.User,    path: "/app/perfil" },
];

export function TabBar({ active }) {
  const navigate = useNavigate();
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        paddingBottom: 18,
        paddingTop: 8,
        paddingLeft: 8,
        paddingRight: 8,
        background: "color-mix(in oklab, var(--bg) 88%, transparent)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "0.5px solid var(--line)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-around", maxWidth: 520, margin: "0 auto", gap: 4 }}>
        {DEFAULT_TABS.map((t) => {
          const on = t.id === active;
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => navigate(t.path)}
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "8px 4px 6px",
                background: "none",
                border: "none",
                color: on ? "var(--ink)" : "var(--ink-3)",
                fontFamily: "var(--font-sans)",
                fontSize: 10.5,
                fontWeight: on ? 700 : 500,
                letterSpacing: -0.1,
                transition: "color 160ms ease",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: on ? 28 : 0,
                  height: 3,
                  borderRadius: 0,
                  background: "var(--ink)",
                  transition: "width 200ms ease",
                }}
              />
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38,
                  height: 28,
                  borderRadius: 999,
                  background: on ? "var(--ink)" : "transparent",
                  color: on ? "var(--bg)" : "var(--ink-3)",
                  transition: "background 180ms ease, color 180ms ease",
                }}
              >
                <TabIcon />
              </span>
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileShell({ children, activeTab, header, hideTabBar = false }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative", background: "var(--bg)" }}>
      {header}
      <div style={{ paddingBottom: hideTabBar ? 24 : 100 }}>{children}</div>
      {!hideTabBar && <TabBar active={activeTab} />}
    </div>
  );
}

export { iconBtn };
