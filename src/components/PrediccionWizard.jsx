import { useEffect, useState } from "react";
import { Button, Card, Flag, Icon, Pill, ScoreStepper } from "@/components/ui";
import { code } from "@/lib/constants";

// Paso del asistente de predicciones: una pantalla por partido, con atajos
// rápidos, marcador exacto y guardado al confirmar. Es presentacional y
// reutilizable; el contenido que cambia entre flujos (la línea de cierre, el
// contexto del partido, el mensaje de hito) se inyecta por props como nodos.
//
// Lo usan tanto el onboarding de la fase de grupos como el asistente para
// completar las predicciones que faltan de las rondas en curso.
export function PrediccionWizardStep({
  partido,
  index,
  total,
  pct,
  prediccionPrevia,
  onAtras,
  onConfirmar,
  onExit,
  exitLabel = "Omitir por ahora",
  cierreNode = null,
  contextoNode = null,
  instruccion = "",
  milestoneNode = null,
}) {
  const [draft, setDraft] = useState({
    local: prediccionPrevia?.goles_local ?? null,
    visitante: prediccionPrevia?.goles_visitante ?? null,
  });
  const [quick, setQuick] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft({
      local: prediccionPrevia?.goles_local ?? null,
      visitante: prediccionPrevia?.goles_visitante ?? null,
    });
    setQuick(null);
  }, [partido.id, prediccionPrevia?.goles_local, prediccionPrevia?.goles_visitante]);

  const aplicarQuick = (q) => {
    setQuick(q);
    if (q === "local") setDraft({ local: 1, visitante: 0 });
    if (q === "empate") setDraft({ local: 1, visitante: 1 });
    if (q === "visitante") setDraft({ local: 0, visitante: 1 });
  };

  const tocarStepper = (campo, valor) => {
    setQuick(null);
    setDraft((d) => ({ ...d, [campo]: valor }));
  };

  // El marcador arranca en 0–0, que ya es un pronóstico válido. El lado que no
  // toques cuenta como 0, así que siempre puedes confirmar, incluso un 0–0.
  const handleConfirmar = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onConfirmar(draft.local ?? 0, draft.visitante ?? 0);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Header oscuro */}
      <div style={{ background: "var(--header-bg)", color: "var(--header-ink)", paddingTop: 16, paddingBottom: 14 }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            minHeight: 36,
          }}
        >
          <button
            onClick={onAtras}
            disabled={index === 0}
            aria-label="Partido anterior"
            style={{
              width: 36,
              height: 36,
              background: "transparent",
              border: "none",
              color: "var(--header-ink)",
              opacity: index === 0 ? 0.3 : 1,
              cursor: index === 0 ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon.ChevronL />
          </button>
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div className="mono" style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.5 }}>
              {Math.min(index + 1, total)} <span style={{ color: "oklch(0.65 0.02 60)" }}>/ {total}</span>
            </div>
            <div style={{ fontSize: 10, color: "oklch(0.7 0.02 60)", marginTop: 1, letterSpacing: 0.3 }}>
              predicciones
            </div>
          </div>
          <button
            onClick={onExit}
            aria-label={exitLabel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 999,
              color: "var(--header-ink)",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              padding: "7px 12px",
              whiteSpace: "nowrap",
            }}
          >
            {exitLabel}
            <Icon.Arrow size={14} />
          </button>
        </div>

        {/* Barra de progreso */}
        <div
          style={{
            height: 4,
            background: "rgba(255,255,255,0.12)",
            margin: "10px 14px 0",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.max(2, pct)}%`,
              background: "var(--accent-soft)",
              borderRadius: 999,
              transition: "width 350ms ease",
            }}
          />
        </div>

        {/* Línea de cierre (inyectada según el flujo) */}
        {cierreNode && (
          <div
            style={{
              margin: "10px 14px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              color: "oklch(0.75 0.02 60)",
            }}
          >
            {cierreNode}
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div
        style={{
          flex: 1,
          padding: "14px 16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Contexto del partido */}
        {contextoNode && <div style={{ textAlign: "center" }}>{contextoNode}</div>}

        {/* Card principal con los equipos */}
        <Card pad={18} style={{ background: "var(--surface)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Flag code={code(partido.equipo_local)} w={64} h={46} rounded={6} />
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", lineHeight: 1.15 }}>
                {partido.equipo_local}
              </div>
            </div>
            <div
              className="mono"
              style={{
                fontSize: 13,
                color: "var(--ink-3)",
                letterSpacing: 0.6,
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              vs
            </div>
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Flag code={code(partido.equipo_visitante)} w={64} h={46} rounded={6} />
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", lineHeight: 1.15 }}>
                {partido.equipo_visitante}
              </div>
            </div>
          </div>
        </Card>

        {/* Instrucción */}
        {instruccion && (
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              textAlign: "center",
              padding: "0 6px",
            }}
          >
            {instruccion}
          </div>
        )}

        {/* Quick picks */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <QuickButton
            selected={quick === "local"}
            onClick={() => aplicarQuick("local")}
            label={`Gana ${shortTeam(partido.equipo_local)}`}
            score="1–0"
          />
          <QuickButton
            selected={quick === "empate"}
            onClick={() => aplicarQuick("empate")}
            label="Empate"
            score="1–1"
          />
          <QuickButton
            selected={quick === "visitante"}
            onClick={() => aplicarQuick("visitante")}
            label={`Gana ${shortTeam(partido.equipo_visitante)}`}
            score="0–1"
          />
        </div>

        {/* Marcador exacto */}
        <div
          style={{
            padding: 14,
            background: "var(--surface-2)",
            borderRadius: "var(--r-md)",
            border: "0.5px solid var(--line)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              fontWeight: 600,
              color: "var(--ink-3)",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            Marcador exacto
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: 12,
            }}
          >
            <ScoreStepper
              label={partido.equipo_local}
              value={draft.local}
              onChange={(v) => tocarStepper("local", v)}
              size="lg"
            />
            <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--ink-3)" }}>–</span>
            <ScoreStepper
              label={partido.equipo_visitante}
              value={draft.visitante}
              onChange={(v) => tocarStepper("visitante", v)}
              size="lg"
            />
          </div>
        </div>

        {/* Mensaje motivacional / hito (inyectado) */}
        {milestoneNode}
      </div>

      {/* Footer fijo */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "color-mix(in oklab, var(--bg) 95%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "0.5px solid var(--line)",
          padding: "12px 14px calc(12px + env(safe-area-inset-bottom))",
          display: "flex",
          gap: 8,
        }}
      >
        <Button
          variant="ghost"
          size="lg"
          onClick={onAtras}
          disabled={index === 0}
          style={{ flex: "0 0 auto", minWidth: 96 }}
        >
          <Icon.ChevronL /> Anterior
        </Button>
        <Button
          variant="primary"
          size="lg"
          block
          onClick={handleConfirmar}
          disabled={saving}
        >
          {saving ? "Guardando…" : prediccionPrevia ? "Actualizar y seguir" : "Confirmar y seguir"}
          {!saving && <Icon.Chevron />}
        </Button>
      </div>
    </div>
  );
}

export function QuickButton({ selected, onClick, label, score }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "12px 6px",
        background: selected ? "var(--ink)" : "var(--surface)",
        color: selected ? "var(--bg)" : "var(--ink)",
        border: `1px solid ${selected ? "var(--ink)" : "var(--line)"}`,
        borderRadius: "var(--r-md)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        transition: "background 140ms ease, color 140ms ease",
        minHeight: 60,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.15,
          textAlign: "center",
        }}
      >
        {label}
      </span>
      <span
        className="mono"
        style={{
          fontSize: 13,
          color: selected ? "oklch(0.85 0.04 60)" : "var(--ink-3)",
          fontWeight: 500,
        }}
      >
        {score}
      </span>
    </button>
  );
}

export function shortTeam(equipo) {
  if (!equipo) return "";
  const limpio = equipo.trim();
  if (limpio.length <= 8) return limpio;
  // intenta primera palabra si es lo bastante corta
  const primera = limpio.split(/\s+/)[0];
  if (primera.length <= 10) return primera;
  return limpio.slice(0, 8) + "…";
}
