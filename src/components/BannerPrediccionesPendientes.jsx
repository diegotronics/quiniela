import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui";

// Banner en /app/inicio que invita a completar de corrido los pronósticos que
// faltan de las rondas en curso (cualquier fase), abriendo el asistente
// /app/predecir. El padre decide cuándo mostrarlo (cuando hay pendientes).
export function BannerPrediccionesPendientes({ pendientes }) {
  const navigate = useNavigate();
  if (!pendientes) return null;

  return (
    <div
      onClick={() => navigate("/app/predecir")}
      role="button"
      style={{
        cursor: "pointer",
        background: "var(--accent-soft)",
        border: "0.5px solid transparent",
        borderRadius: "var(--r-xl)",
        padding: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        boxShadow: "var(--shadow-1)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 0.6,
            fontWeight: 600,
            color: "var(--accent-ink)",
          }}
        >
          Pronósticos pendientes
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 16,
            fontWeight: 600,
            color: "var(--ink)",
            letterSpacing: -0.3,
            lineHeight: 1.2,
          }}
        >
          Te {pendientes === 1 ? "falta" : "faltan"} {pendientes}{" "}
          {pendientes === 1 ? "partido" : "partidos"} por pronosticar
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--ink-3)" }}>
          Complétalos de corrido, uno tras otro. Toca para empezar →
        </div>
      </div>
      <div
        aria-hidden
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "var(--accent-ink)",
          color: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon.Chevron />
      </div>
    </div>
  );
}
