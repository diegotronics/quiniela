// Design tokens — referencia las CSS variables declaradas en globals.css.
// Se mantiene como capa de compatibilidad para estilos inline existentes.

export const color = {
  bg:           "var(--bg)",
  surface:      "var(--surface)",
  surfaceAlt:   "var(--surface-2)",
  ink:          "var(--ink)",
  ink2:         "var(--ink-2)",
  ink3:         "var(--ink-3)",
  ink4:         "var(--ink-4)",
  line:         "var(--line)",
  line2:        "var(--line-2)",
  accent:       "var(--accent)",
  accentSoft:   "var(--accent-soft)",
  accentInk:    "var(--accent-ink)",
  coral:        "var(--coral)",
  coralSoft:    "var(--coral-soft)",
  gold:         "var(--gold)",
  goldSoft:     "var(--gold-soft)",
  danger:       "var(--danger)",
  dangerSoft:   "var(--danger-soft)",

  // Legacy aliases (para que código no migrado siga compilando)
  text:         "var(--ink)",
  muted:        "var(--ink-2)",
  mutedSoft:    "var(--ink-3)",
  border:       "var(--line)",
  navy:         "var(--ink)",
  success:      "var(--accent-ink)",
  successSoft:  "var(--accent-soft)",
  successBg:    "var(--accent-soft)",
  info:         "var(--ink-2)",
  infoSoft:     "var(--ink-3)",
  warning:      "var(--coral)",
  warningBg:    "var(--coral-soft)",
  warningSoft:  "var(--coral)",
  dangerStrong: "var(--danger)",
  slateLight:   "var(--ink-2)",
  paymentDue:   "var(--coral)",
};

export const radius = {
  xs:  6,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  22,
  xxl: 28,
  pill: 999,
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
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
  display: "var(--font-display)",
};

export const shadow = {
  s1: "var(--shadow-1)",
  s2: "var(--shadow-2)",
  s3: "var(--shadow-3)",
};
