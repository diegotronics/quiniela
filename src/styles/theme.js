// Design tokens centralizados.

export const color = {
  // Marca
  gold:        "#FFD700",
  goldDeep:    "#D69E2E",
  amberSoft:   "#FFA500",
  navy:        "#1a1a2e",
  navyDeep:    "#0a0a1a",
  navyMid:     "#16213e",
  slate:       "#2d3748",
  slateLight:  "#4a5568",

  // Grises
  text:        "#2d3748",
  muted:       "#718096",
  mutedSoft:   "#a0aec0",
  border:      "#e2e8f0",
  surface:     "#fff",
  surfaceAlt:  "#f7fafc",
  bg:          "#f0f4f8",

  // Semánticos
  success:     "#276749",
  successSoft: "#9ae6b4",
  successBg:   "#f0fff4",
  info:        "#2B6CB0",
  infoSoft:    "#63b3ed",
  warning:     "#744210",
  warningBg:   "#fffbeb",
  warningSoft: "#f6e05e",
  danger:      "#fc8181",
  dangerStrong:"#C53030",
  accent:      "#553C9A",
  paymentDue:  "#dd6b20",
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  pill: 20,
};

export const space = {
  xs: "0.3rem",
  sm: "0.5rem",
  md: "0.8rem",
  lg: "1rem",
  xl: "1.2rem",
  xxl: "1.5rem",
};

export const font = {
  sans:  "'Helvetica Neue', sans-serif",
  serif: "'Georgia', serif",
};

export const gradient = {
  appHeader:  `linear-gradient(135deg, ${color.navy}, ${color.navyMid})`,
  loginBg:    `linear-gradient(135deg, ${color.navyDeep} 0%, #1a1a3e 50%, #0d2137 100%)`,
  panel:      `linear-gradient(135deg, ${color.navy}, ${color.slate})`,
  goldButton: `linear-gradient(135deg, ${color.gold}, ${color.amberSoft})`,
};

// Estilos compuestos reutilizables.
export const styles = {
  page: {
    minHeight: "100vh",
    background: color.bg,
    fontFamily: font.sans,
  },
  appHeader: {
    background: gradient.appHeader,
    padding: "1rem 1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  brandTitle: { color: color.gold, fontSize: "1.2rem", fontWeight: 700, margin: 0 },
  brandSubtitle: { color: color.mutedSoft, fontSize: "0.75rem", margin: 0 },
  card: {
    background: color.surface,
    borderRadius: radius.lg,
    padding: "0.8rem 1rem",
    border: `1px solid ${color.border}`,
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
  },
  panel: {
    background: gradient.panel,
    borderRadius: radius.xxl,
    padding: "1.2rem",
  },
  btnGhost: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: color.mutedSoft,
    padding: "0.4rem 0.8rem",
    borderRadius: radius.sm,
    fontSize: "0.75rem",
    cursor: "pointer",
  },
  btnIcon: {
    padding: "0.3rem 0.5rem",
    borderRadius: radius.sm,
    border: `1px solid ${color.border}`,
    background: color.surface,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  btnPrimary: {
    padding: "0.6rem",
    borderRadius: radius.sm,
    border: "none",
    background: color.navy,
    color: color.gold,
    fontWeight: 700,
    cursor: "pointer",
  },
  inputForm: {
    padding: "0.5rem 0.7rem",
    borderRadius: radius.sm,
    border: `1px solid ${color.border}`,
    fontSize: "0.85rem",
    outline: "none",
  },
  avatar: (bg) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: bg || color.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "0.8rem",
    fontWeight: 700,
    flexShrink: 0,
  }),
  pill: (active, locked) => ({
    flexShrink: 0,
    padding: "0.5rem 1rem",
    borderRadius: radius.pill,
    border: "none",
    cursor: locked ? "not-allowed" : "pointer",
    background: active ? color.navy : locked ? color.surfaceAlt : color.border,
    color: active ? color.gold : locked ? "#cbd5e0" : color.slateLight,
    fontSize: "0.8rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  }),
  grupoSquare: (active) => ({
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: radius.md,
    border: "none",
    cursor: "pointer",
    background: active ? color.gold : color.border,
    color: active ? color.navy : color.slateLight,
    fontSize: "0.9rem",
    fontWeight: 700,
  }),
};
