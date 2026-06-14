import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import { listPartidosGrupos } from "@/api/partidos";
import {
  Button,
  Card,
  Flag,
  Icon,
  Pill,
  ScoreStepper,
} from "@/components/ui";
import { code } from "@/lib/constants";
import { esErrorCierre } from "@/lib/pronosticos";
import {
  FECHA_CIERRE_TEXTO,
  MILESTONES,
  TOTAL_PARTIDOS_GRUPOS,
  countPredicciones,
  countdownLabel,
  formatCountdown,
  getNextUnpredictedIndex,
  marcarPospuestoEnSesion,
} from "@/lib/onboarding";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: partidos, loading: loadingPartidos } = useAsync(listPartidosGrupos, []);
  const { predicciones, setMarcador, loading: loadingPreds } = usePrediccionesUsuario(user?.id);

  const ordered = useMemo(() => partidos || [], [partidos]);
  const total = ordered.length || TOTAL_PARTIDOS_GRUPOS;

  const [index, setIndex] = useState(null);
  const [milestoneShown, setMilestoneShown] = useState(null);
  const [tickNow, setTickNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setTickNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (index != null) return;
    if (loadingPartidos || loadingPreds) return;
    if (ordered.length === 0) return;
    const start = getNextUnpredictedIndex(ordered, predicciones || {});
    setIndex(Math.min(start, ordered.length));
  }, [index, loadingPartidos, loadingPreds, ordered, predicciones]);

  const completados = useMemo(
    () => countPredicciones(predicciones || {}),
    [predicciones],
  );

  if (loadingPartidos || loadingPreds || index == null) {
    return (
      <CenteredLoader>Preparando tus 72 partidos…</CenteredLoader>
    );
  }

  if (ordered.length === 0) {
    return (
      <CenteredLoader>
        No encontramos los partidos. Recarga la página o avísale al admin.
      </CenteredLoader>
    );
  }

  const handlePospuesto = () => {
    marcarPospuestoEnSesion(user?.id);
    navigate("/app/inicio", { replace: true });
  };

  if (index >= ordered.length) {
    return (
      <PantallaFinal
        completados={completados}
        total={total}
        countdown={formatCountdown(tickNow)}
        onIrInicio={() => {
          marcarPospuestoEnSesion(user?.id);
          navigate("/app/inicio", { replace: true });
        }}
        onRevisar={() => setIndex(0)}
      />
    );
  }

  const partido = ordered[index];
  const yaListos = completados;
  const pct = Math.round((yaListos / total) * 100);

  return (
    <WizardPartido
      partido={partido}
      index={index}
      total={total}
      yaListos={yaListos}
      pct={pct}
      countdown={formatCountdown(tickNow)}
      prediccionPrevia={predicciones[partido.id]}
      milestoneShown={milestoneShown}
      onClearMilestone={() => setMilestoneShown(null)}
      onPospuesto={handlePospuesto}
      onAtras={() => setIndex((i) => Math.max(0, i - 1))}
      onConfirmar={async (local, visitante) => {
        const previa = predicciones[partido.id];
        const eraNueva =
          !previa || previa.goles_local == null || previa.goles_visitante == null;
        try {
          await setMarcador(partido.id, local, visitante);
          if (eraNueva) {
            const nuevoTotal = yaListos + 1;
            const hito = MILESTONES[nuevoTotal];
            if (hito) setMilestoneShown(nuevoTotal);
          }
        } catch (e) {
          // Si el partido ya cerró (una hora antes del saque o con resultado),
          // no hay nada que guardar: lo saltamos sin trabar el asistente.
          if (!esErrorCierre(e)) throw e;
        }
        setIndex((i) => i + 1);
      }}
    />
  );
}

function WizardPartido({
  partido,
  index,
  total,
  yaListos,
  pct,
  countdown,
  prediccionPrevia,
  milestoneShown,
  onClearMilestone,
  onPospuesto,
  onAtras,
  onConfirmar,
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

  // El marcador arranca en 0–0, que ya es un pronóstico válido. Ajusta los
  // lados que quieras; el que no toques cuenta como 0. Siempre puedes confirmar,
  // incluso un 0–0.
  const handleConfirmar = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onConfirmar(draft.local ?? 0, draft.visitante ?? 0);
    } finally {
      setSaving(false);
    }
  };

  const grupoLabel = partido.grupo ? `Grupo ${partido.grupo}` : "Grupos";
  const partidoEnGrupo = partido.id?.match(/\d+$/);
  const partidoNum = partidoEnGrupo ? Number(partidoEnGrupo[0]) : null;

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
            onClick={onPospuesto}
            aria-label="Omitir las predicciones por ahora"
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
            Omitir por ahora
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

        {/* Cierre */}
        <div
          style={{
            margin: "10px 14px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            color: countdown.urgente ? "var(--coral-soft)" : "oklch(0.75 0.02 60)",
          }}
        >
          <span>Cierre: {FECHA_CIERRE_TEXTO}</span>
          <span style={{ fontWeight: 600 }}>{countdownLabel(countdown)}</span>
        </div>
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
        <div style={{ textAlign: "center" }}>
          <Pill tone="default" size="sm">
            {grupoLabel}{partidoNum ? ` · partido ${partidoNum} de 6` : ""} · {partido.fecha}
          </Pill>
        </div>

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
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            textAlign: "center",
            padding: "0 6px",
          }}
        >
          {index === 0
            ? "Elige un atajo rápido o ajusta el marcador exacto. Se guarda solo."
            : "¿Quién gana? Ajusta el marcador si quieres afinar tu predicción."}
        </div>

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

        {/* Mensaje motivacional */}
        {milestoneShown != null && MILESTONES[milestoneShown] && (
          <div
            onClick={onClearMilestone}
            style={{
              background: "var(--accent-soft)",
              border: "0.5px solid var(--accent)",
              padding: "10px 14px",
              borderRadius: "var(--r-md)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 22 }} aria-hidden>
              {MILESTONES[milestoneShown].emoji}
            </span>
            <div style={{ flex: 1, fontSize: 13, color: "var(--accent-ink)", fontWeight: 500, lineHeight: 1.3 }}>
              {MILESTONES[milestoneShown].texto}
            </div>
          </div>
        )}
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

function QuickButton({ selected, onClick, label, score }) {
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

function PantallaFinal({ completados, total, countdown, onIrInicio, onRevisar }) {
  const completo = completados >= total;
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ background: "var(--header-bg)", color: "var(--header-ink)", padding: "32px 20px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 8 }} aria-hidden>
          {completo ? "🏆" : "✨"}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: -0.5,
            lineHeight: 1.2,
          }}
        >
          {completo ? "¡Tu quiniela está lista!" : "Ya casi…"}
        </h1>
        <p style={{ marginTop: 8, color: "oklch(0.78 0.02 60)", fontSize: 14, lineHeight: 1.4 }}>
          {completo
            ? "Las 72 predicciones quedaron guardadas."
            : `Llevas ${completados} de ${total} predicciones. Puedes volver cuando quieras antes del cierre.`}
        </p>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <Card pad={16} accent={completo}>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              fontWeight: 600,
              color: countdown.urgente ? "var(--coral)" : "var(--accent-ink)",
            }}
          >
            {countdown.vencido ? "Cerrado" : countdown.urgente ? "Cuenta regresiva" : "Cierre"}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 18,
              fontWeight: 600,
              color: "var(--ink)",
              letterSpacing: -0.3,
            }}
          >
            {FECHA_CIERRE_TEXTO}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-3)" }}>
            {countdownLabel(countdown)}
          </div>
        </Card>

        <Card pad={16}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  fontWeight: 600,
                  color: "var(--ink-3)",
                }}
              >
                Progreso
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 32,
                  fontWeight: 600,
                  color: "var(--ink)",
                  letterSpacing: -1,
                  marginTop: 4,
                }}
              >
                {completados} / {total}
              </div>
            </div>
            <Pill tone={completo ? "accent" : "coral"} size="md">
              {completo ? "100%" : `${Math.round((completados / total) * 100)}%`}
            </Pill>
          </div>
        </Card>

        <Button variant="primary" size="lg" block onClick={onIrInicio}>
          Ir al inicio <Icon.Chevron />
        </Button>
        <Button variant="ghost" size="lg" block onClick={onRevisar}>
          Revisar mis predicciones
        </Button>
      </div>
    </div>
  );
}

function CenteredLoader({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 24,
        textAlign: "center",
      }}
    >
      <p style={{ color: "var(--ink-3)", fontSize: 14 }}>{children}</p>
    </div>
  );
}

function shortTeam(equipo) {
  if (!equipo) return "";
  const limpio = equipo.trim();
  if (limpio.length <= 8) return limpio;
  // intenta primera palabra si es lo bastante corta
  const primera = limpio.split(/\s+/)[0];
  if (primera.length <= 10) return primera;
  return limpio.slice(0, 8) + "…";
}
