import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui";
import {
  TOTAL_PARTIDOS_GRUPOS,
  FECHA_CIERRE_TEXTO,
  formatCountdown,
  countdownLabel,
} from "@/lib/onboarding";

// Banner persistente en /app/inicio que invita a completar las predicciones
// pendientes. Sólo se muestra cuando picks < 72 (la lógica vive en el padre).
export function BannerPredicciones({ picks }) {
  const navigate = useNavigate();
  const restantes = Math.max(0, TOTAL_PARTIDOS_GRUPOS - picks);
  const pct = Math.round((picks / TOTAL_PARTIDOS_GRUPOS) * 100);
  const cd = formatCountdown();
  const urgente = cd.urgente;

  return (
    <div
      onClick={() => navigate("/app/onboarding")}
      role="button"
      style={{
        cursor: "pointer",
        background: urgente ? "var(--coral-soft)" : "var(--accent-soft)",
        border: `0.5px solid ${urgente ? "var(--coral)" : "transparent"}`,
        borderRadius: "var(--r-xl)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "var(--shadow-1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              fontWeight: 600,
              color: urgente ? "var(--coral)" : "var(--accent-ink)",
            }}
          >
            {urgente ? "¡Apurate!" : "Tu quiniela"}
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
            Te faltan {restantes} predicciones
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: "var(--ink-3)" }}>
            Cierre: {FECHA_CIERRE_TEXTO} · {countdownLabel(cd)}
          </div>
        </div>
        <div
          aria-hidden
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: urgente ? "var(--coral)" : "var(--accent-ink)",
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

      <div
        style={{
          position: "relative",
          height: 6,
          background: "rgba(20,17,13,0.08)",
          borderRadius: 999,
          overflow: "hidden",
        }}
        aria-label={`${picks} de ${TOTAL_PARTIDOS_GRUPOS} predicciones`}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${Math.max(2, pct)}%`,
            background: urgente ? "var(--coral)" : "var(--accent)",
            borderRadius: 999,
            transition: "width 320ms ease",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)" }}>
        <span className="mono" style={{ color: "var(--ink-2)", fontWeight: 600 }}>
          {picks} / {TOTAL_PARTIDOS_GRUPOS}
        </span>
        <span>Toca para continuar →</span>
      </div>
    </div>
  );
}
