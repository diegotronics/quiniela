import { useEffect, useMemo, useState } from "react";
import { useCountUp, usePrevious } from "@/hooks/useCountUp";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFases } from "@/hooks/useFases";
import { useAllPartidos } from "@/hooks/useAllPartidos";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import { useUsuariosPublic } from "@/hooks/useUsuarios";
import { useAsync } from "@/hooks/useAsync";
import { listPuntajesGlobales } from "@/api/predicciones";
import { listPuntajesApuestasEspeciales } from "@/api/apuestasEspeciales";
import {
  useApuestasEspecialesConfig,
  useApuestaEspecialUsuario,
} from "@/hooks/useApuestasEspeciales";
import {
  Avatar,
  Card,
  Countdown,
  Flag,
  HeaderIconButton,
  Icon,
  MatchCard,
  MobileHeader,
  MobileShell,
  Pill,
  SectionTitle,
  StatTile,
  StreakFlame,
  Button,
  ringFor,
} from "@/components/ui";
import {
  rankingFromUsers,
  userScoringStats,
  userStreak,
  proximoPartido,
  partidoEnVivo,
} from "@/lib/stats";
import { code, GROUP_NAME, GROUP_MOTTO } from "@/lib/constants";
import { ChatPreview } from "@/components/chat/ChatPreview";
import { BannerPredicciones } from "@/components/BannerPredicciones";
import { TOTAL_PARTIDOS_GRUPOS, countPredicciones } from "@/lib/onboarding";

export default function Inicio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fases } = useFases();
  const { partidos } = useAllPartidos(fases);
  const { usuarios } = useUsuariosPublic();
  const { data: puntajesRaw } = useAsync(listPuntajesGlobales, []);
  const { data: puntajesEspeciales } = useAsync(listPuntajesApuestasEspeciales, []);
  const { predicciones } = usePrediccionesUsuario(user?.id);
  const { config: apuestasCfg } = useApuestasEspecialesConfig();
  const { apuesta: apuestaUsuario } = useApuestaEspecialUsuario(user?.id);

  const ranking = useMemo(
    () => rankingFromUsers(usuarios, [
      ...(puntajesRaw || []),
      ...(puntajesEspeciales || []),
    ]),
    [usuarios, puntajesRaw, puntajesEspeciales],
  );
  const me = useMemo(() => ranking.find((u) => u.id === user?.id), [ranking, user]);
  const lider = ranking[0];
  const totalJugadores = ranking.length;

  const prediccionesList = useMemo(() => Object.values(predicciones), [predicciones]);
  const stats = useMemo(
    () => userScoringStats(prediccionesList, partidos),
    [prediccionesList, partidos],
  );
  const racha = useMemo(
    () => userStreak(prediccionesList, partidos),
    [prediccionesList, partidos],
  );

  const live = useMemo(() => partidoEnVivo(partidos), [partidos]);
  const next = useMemo(
    () => proximoPartido(partidos, predicciones, fases),
    [partidos, predicciones, fases],
  );

  const picksCompletas = useMemo(() => countPredicciones(predicciones), [predicciones]);
  const onboardingPendiente = picksCompletas < TOTAL_PARTIDOS_GRUPOS;
  const pendientes = partidos.filter((p) => !p.resultado_ingresado).length;

  const apuestasCierre = apuestasCfg?.cierra_en ? new Date(apuestasCfg.cierra_en).getTime() : null;
  const apuestasAbiertas = apuestasCierre ? apuestasCierre > Date.now() : true;
  const apuestasCompletadas = Boolean(
    apuestaUsuario?.campeon &&
      apuestaUsuario?.subcampeon &&
      apuestaUsuario?.goleador &&
      apuestaUsuario?.sorpresa
  );
  const mostrarBannerApuestas = apuestasAbiertas && !apuestasCompletadas;

  const myPts = me?.puntos || 0;
  const liderPts = lider?.puntos || 0;
  const ratio = liderPts > 0 ? Math.min(100, Math.round((myPts / liderPts) * 100)) : 0;
  const diff = (lider?.puntos || 0) - myPts;

  const myPtsDisplay = useCountUp(myPts, { duration: 800 });
  const myRankDisplay = useCountUp(me?.rank || 0, { duration: 600 });

  // Detección de cambio de gol en partido live
  const liveLocal = live?.goles_local;
  const liveVisitante = live?.goles_visitante;
  const prevLiveLocal = usePrevious(liveLocal);
  const prevLiveVisitante = usePrevious(liveVisitante);
  const [pulseLocal, setPulseLocal] = useState(0);
  const [pulseVisitante, setPulseVisitante] = useState(0);
  useEffect(() => {
    if (prevLiveLocal != null && liveLocal != null && liveLocal !== prevLiveLocal) {
      setPulseLocal((k) => k + 1);
    }
  }, [liveLocal, prevLiveLocal]);
  useEffect(() => {
    if (prevLiveVisitante != null && liveVisitante != null && liveVisitante !== prevLiveVisitante) {
      setPulseVisitante((k) => k + 1);
    }
  }, [liveVisitante, prevLiveVisitante]);

  return (
    <MobileShell
      activeTab="inicio"
      header={
        <MobileHeader
          title={`Hola, ${(user?.nombre || "").split(" ")[0] || "jugador"}`}
          subtitle={`${GROUP_NAME} · ${GROUP_MOTTO}`}
          leading={<Avatar name={user?.nombre} size={36} ring={ringFor({ rank: me?.rank, streak: racha })} />}
          onLeadingClick={() => navigate("/app/perfil")}
          trailing={
            <HeaderIconButton label="Abrir chat" onClick={() => navigate("/app/chat")}>
              <Icon.Chat />
            </HeaderIconButton>
          }
        />
      }
    >
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {onboardingPendiente && <BannerPredicciones picks={picksCompletas} />}

        {mostrarBannerApuestas && (
          <Card
            pad={16}
            onClick={() => navigate("/app/apuestas")}
            style={{
              background: "var(--gradient-trofeo)",
              borderColor: "transparent",
              cursor: "pointer",
              color: "#1A1300",
              boxShadow: "var(--shadow-gold)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "#1A1300",
                    fontWeight: 800,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    opacity: 0.85,
                  }}
                >
                  <Icon.Crown /> Apuestas especiales
                </div>
                <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: "#1A1300" }}>
                  {apuestaUsuario ? "Completa tus pronósticos premundiales" : "Pronostica Campeón, Goleador y más"}
                </div>
                <div style={{ marginTop: 2, fontSize: 12, color: "rgba(26,19,0,0.72)", fontWeight: 600 }}>
                  Hasta{" "}
                  <span className="font-score" style={{ fontSize: 14, letterSpacing: 0.6 }}>
                    {(apuestasCfg?.pts_campeon ?? 0) +
                      (apuestasCfg?.pts_subcampeon ?? 0) +
                      (apuestasCfg?.pts_goleador ?? 0) +
                      (apuestasCfg?.pts_sorpresa ?? 0)}
                  </span>{" "}
                  pts en juego
                </div>
              </div>
              <Icon.Chevron />
            </div>
          </Card>
        )}

        {/* Puntaje + posición */}
        <Card
          pad={0}
          elevated
          style={{
            overflow: "hidden",
            position: "relative",
            boxShadow: me?.id === lider?.id ? "var(--shadow-gold)" : "var(--shadow-accent)",
          }}
        >
          <div className="tricolor-bar" style={{ borderRadius: 0, height: 4 }} />
          <div
            className="field-lines"
            style={{
              padding: "22px 20px 18px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              color: "var(--ink)",
            }}
          >
            <div>
              <div style={kicker}>Tus puntos</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                <span style={me?.id === lider?.id ? bigNumGold : bigNum}>{myPtsDisplay}</span>
                <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>pts</span>
              </div>
              {stats.jugados > 0 && (
                <div style={{ marginTop: 10 }}>
                  <Pill tone="accent">
                    {stats.exactos} exactos · {stats.ganador} ganadores
                  </Pill>
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={kicker}>Posición</div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 4, marginTop: 8 }}>
                <span style={me?.id === lider?.id ? bigNumGold : bigNum}>{me?.rank ? myRankDisplay : "—"}</span>
                <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, letterSpacing: 0.4 }}>/ {totalJugadores || 0}</span>
              </div>
              {lider && me && me.id !== lider.id && (
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--coral-ink)", fontWeight: 600 }}>
                  −{diff} pts del 1°
                </div>
              )}
              {lider && me?.id === lider.id && (
                <div
                  style={{
                    marginTop: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: "var(--gold-soft)",
                    border: "1px solid var(--gold)",
                    color: "var(--gold-ink)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                  }}
                >
                  <Icon.Crown /> Vas primero
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: "0 16px 12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
            >
              <span
                className="mono"
                style={{
                  color: me?.id === lider?.id ? "var(--gold-ink)" : "var(--accent-ink)",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: -0.2,
                }}
              >
                {me?.id === lider?.id ? "100%" : `${ratio}%`}
              </span>
              <span style={{ color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {me?.id === lider?.id ? "Eres el líder" : "del líder"}
              </span>
            </div>
            <div
              style={{
                height: 10,
                background: "var(--line-2)",
                borderRadius: 999,
                position: "relative",
                overflow: "hidden",
                boxShadow: "inset 0 1px 2px rgba(20,17,13,0.06)",
              }}
            >
              <div
                className="progress-bar-fill shine"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${ratio}%`,
                  background:
                    me?.id === lider?.id
                      ? "linear-gradient(90deg, var(--gold) 0%, var(--gold-ink) 100%)"
                      : "linear-gradient(90deg, var(--accent) 0%, var(--gold) 130%)",
                  borderRadius: 999,
                  transition: "width 520ms cubic-bezier(.2,.7,.2,1)",
                  boxShadow:
                    me?.id === lider?.id
                      ? "0 1px 4px color-mix(in oklab, var(--gold) 35%, transparent)"
                      : "0 1px 4px color-mix(in oklab, var(--accent) 30%, transparent)",
                }}
              />
            </div>
          </div>
          <div style={{ padding: "0 16px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-3)" }}>
              {lider && (
                <>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px 2px 2px",
                      borderRadius: 999,
                      background: "var(--gold-soft)",
                      border: "1px solid var(--gold)",
                      color: "var(--gold-ink)",
                      fontWeight: 700,
                    }}
                  >
                    <Avatar name={lider.nombre} size={18} ring="gold" />
                    {(lider.nombre || "").split(" ")[0]}
                  </span>
                  <span>lidera</span>
                </>
              )}
            </span>
            <span
              style={{
                color: pendientes > 0 ? "var(--coral-ink)" : "var(--ink-3)",
                fontWeight: pendientes > 0 ? 600 : 400,
              }}
            >
              {pendientes > 0 ? `Quedan ${pendientes} partidos` : "Torneo cerrado"}
            </span>
          </div>
        </Card>

        {/* Partido en vivo */}
        {live && (
          <MatchCard
            variant="live"
            match={live}
            pred={predicciones[live.id]}
            rightLabel={live.grupo ? `Grupo ${live.grupo}` : faseLabel(fases, live.fase_id)}
            liveLocal={liveLocal}
            liveVisitante={liveVisitante}
            pulseLocal={pulseLocal}
            pulseVisitante={pulseVisitante}
          />
        )}

        {/* Próximo pronóstico */}
        {next && (
          <>
            <SectionTitle action={<span onClick={() => navigate("/app/partidos")} style={{ cursor: "pointer" }}>Ver todos →</span>}>
              Tu próximo pronóstico
            </SectionTitle>
            <Card
              onClick={() => navigate(`/app/partido/${next.id}`)}
              className="field-lines-light"
              style={{
                background: "var(--gradient-nocturno)",
                borderColor: "transparent",
                color: "#fff",
                boxShadow: "var(--shadow-azure)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, position: "relative" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 9px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    color: "#fff",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 999,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {next.grupo ? `Grupo ${next.grupo}` : faseLabel(fases, next.fase_id)}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: 0.3 }}>
                  {formatDate(next.fecha)}
                </span>
              </div>
              <div
                style={{
                  marginBottom: 12,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "var(--r-md)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  backdropFilter: "blur(8px)",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 700,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                  }}
                >
                  Empieza en
                </span>
                <span style={{ color: "#fff" }}>
                  <Countdown targetIso={next.fecha} />
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                  <Flag code={code(next.equipo_local)} w={56} h={40} rounded={7} />
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: -0.2 }}>{next.equipo_local}</div>
                </div>
                <div
                  className="font-score"
                  style={{
                    fontSize: 18,
                    color: "#fff",
                    letterSpacing: 2,
                    fontWeight: 400,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                >
                  VS
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                  <Flag code={code(next.equipo_visitante)} w={56} h={40} rounded={7} />
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: -0.2 }}>{next.equipo_visitante}</div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: "var(--r-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>Tu pronóstico</span>
                <span className="font-score" style={{ fontSize: 22, fontWeight: 400, color: "#fff", letterSpacing: 1 }}>
                  — · —
                </span>
              </div>
              <Button
                block
                size="lg"
                className="pulse-tricolor"
                style={{
                  marginTop: 14,
                  background: "var(--gradient-anfitriones)",
                  border: "none",
                  color: "#0E1730",
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}
              >
                Hacer mi pronóstico <Icon.Chevron />
              </Button>
            </Card>
          </>
        )}

        {/* Stats row */}
        {stats.jugados > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <StreakCard streak={racha} />
            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 10 }}>
              <StatTile label="Aciertos" value={String(stats.ganador)} unit={`/ ${stats.jugados}`} />
              <StatTile label="Exactos" value={String(stats.exactos)} unit={`/ ${stats.jugados}`} />
            </div>
          </div>
        )}

        {/* Picadas preview (chat global en tiempo real) */}
        <SectionTitle
          action={
            <Link to="/app/chat" style={{ color: "var(--accent-ink)", textDecoration: "none" }}>
              Ver todo →
            </Link>
          }
        >
          Picadas de la familia
        </SectionTitle>
        <ChatPreview limit={3} />
      </div>
    </MobileShell>
  );
}

const kicker = {
  fontSize: 11,
  color: "var(--ink-3)",
  textTransform: "uppercase",
  letterSpacing: 0.6,
  fontWeight: 600,
};

const bigNum = {
  fontFamily: "var(--font-score)",
  fontSize: 72,
  fontWeight: 400,
  color: "var(--ink)",
  letterSpacing: 0,
  lineHeight: 0.9,
  fontVariantNumeric: "tabular-nums",
};

const bigNumGold = {
  fontFamily: "var(--font-score)",
  fontSize: 72,
  fontWeight: 400,
  letterSpacing: 0,
  lineHeight: 0.9,
  fontVariantNumeric: "tabular-nums",
  background: "linear-gradient(135deg, var(--gold) 0%, var(--coral) 60%, var(--magenta) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

function StreakCard({ streak }) {
  const isCold = streak <= 0;
  const isHot = streak >= 3;
  const isBlaze = streak >= 6;
  const label = isCold ? "Sin racha" : isBlaze ? "¡En llamas!" : isHot ? "Racha caliente" : "Racha";
  const subtitle = isCold
    ? "Acertá el próximo"
    : `${streak} acierto${streak === 1 ? "" : "s"} seguido${streak === 1 ? "" : "s"}`;
  const borderColor = isBlaze
    ? "color-mix(in oklab, var(--danger) 35%, transparent)"
    : isHot
      ? "color-mix(in oklab, var(--coral) 30%, transparent)"
      : "var(--line)";
  return (
    <div
      style={{
        background: isHot ? "var(--coral-soft)" : "var(--surface)",
        border: `1px solid ${borderColor}`,
        borderRadius: "var(--r-lg)",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: isBlaze ? "var(--shadow-coral)" : "var(--shadow-1)",
        overflow: "hidden",
      }}
    >
      <StreakFlame streak={streak} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            color: isHot ? "var(--coral-ink)" : "var(--ink-3)",
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
          <span
            className="mono"
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: isHot ? "var(--coral-ink)" : "var(--ink)",
              letterSpacing: -1.5,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {streak}
          </span>
        </div>
        <div style={{ marginTop: 4, fontSize: 10, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function faseLabel(fases, faseId) {
  const f = fases.find((x) => x.id === faseId);
  return f ? f.nombre : "Partido";
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const h = d.getHours();
    const ampm = h >= 12 ? "p. m." : "a. m.";
    const h12 = h % 12 || 12;
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${h12}:${String(d.getMinutes()).padStart(2, "0")} ${ampm}`;
  } catch {
    return iso;
  }
}
