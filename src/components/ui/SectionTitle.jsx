export function SectionTitle({ children, action, onActionClick }) {
  const actionClickable = Boolean(onActionClick);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 4px 10px",
        marginTop: 6,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.1 }}>
        {children}
      </h2>
      {action && (
        <span
          onClick={onActionClick}
          className={actionClickable ? "section-action" : undefined}
          style={{ fontSize: 13, color: "var(--ink-3)" }}
        >
          {action}
        </span>
      )}
    </div>
  );
}
