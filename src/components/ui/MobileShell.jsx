import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon.jsx";

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
  padding: 0,
  cursor: "pointer",
};

const leadingBtnReset = {
  background: "transparent",
  border: "none",
  padding: 0,
  margin: 0,
  cursor: "pointer",
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "inherit",
};

export function HeaderIconButton({ label, onClick, badge = 0, children }) {
  const showBadge = Number(badge) > 0;
  const badgeLabel = badge > 9 ? "9+" : String(badge);
  return (
    <button
      type="button"
      style={iconBtn}
      className="icon-tap header-icon-btn"
      aria-label={label}
      onClick={onClick}
    >
      {children}
      {showBadge && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            minWidth: 16,
            height: 16,
            padding: "0 4px",
            borderRadius: 999,
            background: "var(--coral)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--bg)",
            lineHeight: 1,
          }}
        >
          {badgeLabel}
        </span>
      )}
    </button>
  );
}

export function MobileHeader({
  title,
  subtitle,
  leading,
  onLeadingClick,
  leadingLabel = "Abrir perfil",
  onBack,
  backLabel = "Volver",
  trailing,
  big = true,
  sticky = true,
}) {
  const leadingNode = leading
    ? onLeadingClick
      ? (
        <button
          type="button"
          onClick={onLeadingClick}
          aria-label={leadingLabel}
          className="header-leading-btn"
          style={leadingBtnReset}
        >
          {leading}
        </button>
      )
      : leading
    : null;

  return (
    <div
      style={{
        position: sticky ? "sticky" : "static",
        top: 0,
        zIndex: 20,
        background: "var(--bg)",
        paddingTop: "calc(24px + env(safe-area-inset-top, 0px))",
        paddingLeft: "calc(20px + env(safe-area-inset-left, 0px))",
        paddingRight: "calc(20px + env(safe-area-inset-right, 0px))",
        paddingBottom: big ? 14 : 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 36, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          {onBack && (
            <HeaderIconButton label={backLabel} onClick={onBack}>
              <Icon.ChevronL />
            </HeaderIconButton>
          )}
          {leadingNode}
        </div>
        {trailing && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {trailing}
          </div>
        )}
      </div>
      {big && (
        <div style={{ marginTop: 14 }}>
          <h1
            className="font-display"
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 34,
              lineHeight: 1.0,
              letterSpacing: -1.1,
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
              className="icon-tap"
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
                cursor: "pointer",
              }}
            >
              <span
                aria-hidden
                data-section={t.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: on ? 28 : 0,
                  height: 3,
                  borderRadius: 0,
                  background: "var(--section-accent)",
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
    <div
      data-section={activeTab}
      style={{ minHeight: "100vh", position: "relative", background: "var(--bg)" }}
    >
      {header}
      <div style={{ paddingBottom: hideTabBar ? 24 : 100 }}>{children}</div>
      {!hideTabBar && <TabBar active={activeTab} />}
    </div>
  );
}

export { iconBtn };
