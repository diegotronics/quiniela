import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, Icon, Logo } from "@/components/ui";
import { GROUP_NAME } from "@/lib/constants";

const NAV = [
  { id: "miembros",  path: "/admin/miembros",  label: "Miembros", icon: Icon.Group },
  { id: "reglas",    path: "/admin/reglas",    label: "Reglas y puntos", icon: Icon.Gear },
  { id: "partidos",  path: "/admin/partidos",  label: "Partidos", icon: Icon.Cal },
];

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const current = NAV.find((n) => location.pathname.startsWith(n.path));

  if (isDesktop) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 240,
            flexShrink: 0,
            borderRight: "0.5px solid var(--line)",
            padding: "20px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            background: "var(--surface-2)",
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 16px" }}>
            <Logo size={32} rounded />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.1 }}>
                La Copa Familiar
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Admin · {(user?.nombre || "").split(" ")[0]}</div>
            </div>
          </div>

          <div
            style={{
              fontSize: 10,
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              padding: "12px 8px 6px",
              fontWeight: 600,
            }}
          >
            Grupo
          </div>
          <div
            style={{
              padding: "10px 10px",
              borderRadius: 10,
              background: "var(--surface)",
              border: "0.5px solid var(--line)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--accent-soft)",
                color: "var(--accent-ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {GROUP_NAME.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{GROUP_NAME}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Mundial 2026</div>
            </div>
          </div>

          <div
            style={{
              fontSize: 10,
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              padding: "16px 8px 6px",
              fontWeight: 600,
            }}
          >
            Panel
          </div>
          {NAV.map((n) => (
            <NavLink
              key={n.id}
              to={n.path}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 10,
                background: isActive ? "var(--surface)" : "transparent",
                color: isActive ? "var(--ink)" : "var(--ink-2)",
                border: isActive ? "0.5px solid var(--line)" : "0.5px solid transparent",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                textDecoration: "none",
                boxShadow: isActive ? "var(--shadow-1)" : "none",
              })}
            >
              <n.icon />
              <span style={{ flex: 1 }}>{n.label}</span>
            </NavLink>
          ))}

          <div style={{ marginTop: "auto", padding: "12px 8px", borderTop: "0.5px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={user?.nombre} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                  {(user?.nombre || "").split(" ")[0]}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Admin</div>
              </div>
              <button
                onClick={logout}
                title="Cerrar sesión"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ink-3)",
                  padding: 6,
                  cursor: "pointer",
                }}
              >
                <Icon.Logout />
              </button>
            </div>
            <button
              onClick={() => navigate("/app/inicio")}
              style={{
                marginTop: 8,
                background: "transparent",
                border: "none",
                color: "var(--ink-3)",
                fontSize: 12,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 8px",
              }}
            >
              <Icon.ChevronL /> Volver a la app
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div
            style={{
              borderBottom: "0.5px solid var(--line)",
              padding: "18px 28px",
              background: "var(--bg)",
              position: "sticky",
              top: 0,
              zIndex: 5,
            }}
          >
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" }}>
              Admin
            </div>
            <h1 style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 600, letterSpacing: -0.4, color: "var(--ink)" }}>
              {current?.label || "Panel"}
            </h1>
          </div>
          <div style={{ flex: 1, padding: "24px 28px", overflowX: "auto" }}>
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  // Mobile fallback: top bar con nav horizontal
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header
        style={{
          background: "var(--surface)",
          borderBottom: "0.5px solid var(--line)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/app/inicio")}
            style={{
              background: "none",
              border: "none",
              color: "var(--ink)",
              padding: 6,
              cursor: "pointer",
            }}
            aria-label="Volver"
          >
            <Icon.ChevronL />
          </button>
          <Logo size={28} rounded />
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Admin
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{current?.label || "Panel"}</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{ background: "none", border: "none", color: "var(--ink-3)", padding: 6, cursor: "pointer" }}
        >
          <Icon.Logout />
        </button>
      </header>

      <div className="scroll-hide" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 16px", background: "var(--surface)", borderBottom: "0.5px solid var(--line)" }}>
        {NAV.map((n) => (
          <NavLink
            key={n.id}
            to={n.path}
            style={({ isActive }) => ({
              padding: "7px 14px",
              borderRadius: 999,
              background: isActive ? "var(--ink)" : "transparent",
              color: isActive ? "var(--bg)" : "var(--ink-2)",
              border: isActive ? "none" : "0.5px solid var(--line)",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              whiteSpace: "nowrap",
            })}
          >
            {n.label}
          </NavLink>
        ))}
      </div>

      <div style={{ padding: "16px" }}>
        <Outlet />
      </div>
    </div>
  );
}
