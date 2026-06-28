import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import { listPartidosGrupos } from "@/api/partidos";
import { Button, Card, Icon, Pill } from "@/components/ui";
import { PrediccionWizardStep } from "@/components/PrediccionWizard";
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
  const countdown = formatCountdown(tickNow);

  const grupoLabel = partido.grupo ? `Grupo ${partido.grupo}` : "Grupos";
  const partidoEnGrupo = partido.id?.match(/\d+$/);
  const partidoNum = partidoEnGrupo ? Number(partidoEnGrupo[0]) : null;

  return (
    <PrediccionWizardStep
      partido={partido}
      index={index}
      total={total}
      pct={pct}
      prediccionPrevia={predicciones[partido.id]}
      exitLabel="Omitir por ahora"
      onExit={handlePospuesto}
      onAtras={() => setIndex((i) => Math.max(0, i - 1))}
      instruccion={
        index === 0
          ? "Elige un atajo rápido o ajusta el marcador exacto. Se guarda solo."
          : "¿Quién gana? Ajusta el marcador si quieres afinar tu predicción."
      }
      cierreNode={
        <>
          <span style={{ color: countdown.urgente ? "var(--coral-soft)" : undefined }}>
            Cierre: {FECHA_CIERRE_TEXTO}
          </span>
          <span
            style={{
              fontWeight: 600,
              color: countdown.urgente ? "var(--coral-soft)" : undefined,
            }}
          >
            {countdownLabel(countdown)}
          </span>
        </>
      }
      contextoNode={
        <Pill tone="default" size="sm">
          {grupoLabel}
          {partidoNum ? ` · partido ${partidoNum} de 6` : ""} · {partido.fecha}
        </Pill>
      }
      milestoneNode={
        milestoneShown != null && MILESTONES[milestoneShown] ? (
          <div
            onClick={() => setMilestoneShown(null)}
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
        ) : null
      }
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
