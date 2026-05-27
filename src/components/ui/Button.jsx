const base = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  fontFamily: "var(--font-sans)",
  letterSpacing: -0.1,
  cursor: "pointer",
  transition: "opacity 120ms ease",
};

const sizes = {
  sm: { padding: "7px 12px", fontSize: 12, borderRadius: 8 },
  md: { padding: "10px 14px", fontSize: 13, borderRadius: 10 },
  lg: { padding: "13px 16px", fontSize: 14, borderRadius: 12 },
};

const variants = {
  primary: {
    background: "var(--ink)",
    color: "var(--bg)",
    border: "none",
    fontWeight: 600,
  },
  ghost: {
    background: "var(--surface-2)",
    color: "var(--ink)",
    border: "1px solid var(--line)",
    fontWeight: 500,
  },
  outline: {
    background: "var(--surface)",
    color: "var(--ink-2)",
    border: "0.5px solid var(--line)",
    fontWeight: 500,
  },
  danger: {
    background: "var(--danger-soft)",
    color: "var(--danger)",
    border: "1px solid transparent",
    fontWeight: 600,
  },
  link: {
    background: "transparent",
    color: "var(--accent-ink)",
    border: "none",
    fontWeight: 500,
    padding: 0,
  },
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  disabled = false,
  type = "button",
  children,
  style,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      style={{
        ...base,
        ...sizes[size],
        ...variants[variant],
        width: block ? "100%" : "auto",
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...(style || {}),
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
