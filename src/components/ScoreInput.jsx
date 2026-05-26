export default function ScoreInput({ value, onChange, disabled }) {
  const v = value;
  const change = (delta) => onChange(Math.max(0, (v ?? 0) + delta));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <button
        disabled={disabled}
        onClick={() => change(1)}
        style={{ width: 32, height: 28, background: disabled ? "#a0aec0" : "#1a1a2e", border: "none", borderRadius: 8, color: "#FFD700", fontSize: "1rem", cursor: disabled ? "not-allowed" : "pointer" }}
      >+</button>
      <div style={{ width: 40, height: 40, background: "#f7fafc", border: "2px solid #e2e8f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: 700, color: "#1a1a2e" }}>
        {v !== undefined && v !== null ? v : "?"}
      </div>
      <button
        disabled={disabled}
        onClick={() => change(-1)}
        style={{ width: 32, height: 28, background: "#e2e8f0", border: "none", borderRadius: 8, color: "#4a5568", fontSize: "1rem", cursor: disabled ? "not-allowed" : "pointer" }}
      >−</button>
    </div>
  );
}
