import { useMemo } from "react";
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
  Flag,
  Icon,
  MobileHeader,
  MobileShell,
  Pill,
  SectionTitle,
  Button,
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

  return (
    <MobileShell
      activeTab="inicio"
      header={
        <MobileHeader
          title={`Hola, ${(user?.nombre || "").split(" ")[0] || "jugador"}`}
          subtitle={`${GROUP_NAME} · ${GROUP_MOTTO}`}
          leading={<Avatar name={user?.nombre} size={36} />}
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
              background: "var(--accent-soft)",
              borderColor: "transparent",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--accent-ink)",
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Icon.Crown /> Apuestas especiales
                </div>
                <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                  {apuestaUsuario ? "Completá tus picks pre-mundial" : "Pronosticá Campeón, Goleador y más"}
                </div>
                <div style={{ marginTop: 2, fontSize: 12, color: "var(--ink-3)" }}>
                  Hasta{" "}
                  {(apuestasCfg?.pts_campeon ?? 0) +
                    (apuestasCfg?.pts_subcampeon ?? 0) +
                    (apuestasCfg?.pts_goleador ?? 0) +
                    (apuestasCfg?.pts_sorpresa ?? 0)}{" "}
                  pts en juego
                </div>
              </div>
              <Icon.Chevron />
            </div>
          </Card>
        )}

        {/* Puntaje + posición */}
        <Card pad={0} elevated style={{ overflow: "hidden" }}>
          <div style={{ padding: "22px 20px 18px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={kicker}>Tus puntos</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                <span className="mono" style={me?.id === lider?.id ? bigNumGold : bigNum}>{myPts}</span>
                <span style={{ fontSize: 14, color: "var(--ink-3)", fontWeight: 500 }}>pts</span>
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
                <span className="mono" style={me?.id === lider?.id ? bigNumGold : bigNum}>{me?.rank || "—"}</span>
                <span style={{ fontSize: 14, color: "var(--ink-3)", fontWeight: 500 }}>/ {totalJugadores || 0}</span>
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

          <div style={{ height: 6, background: "var(--line-2)", position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${ratio}%`,
                background: "linear-gradient(90deg, var(--accent) 0%, var(--gold) 130%)",
                transition: "width 360ms ease",
              }}
            />
          </div>
          <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
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
                    <Avatar name={lider.nombre} size={18} />
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
          <Card pad={14} elevated style={{ background: "var(--ink)", borderColor: "var(--ink)", color: "var(--bg)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <Pill tone="live">En vivo</Pill>
              <span style={{ fontSize: 11, color: "oklch(0.75 0.02 60)", fontWeight: 500 }}>
                {live.grupo ? `Grupo ${live.grupo}` : faseLabel(fases, live.fase_id)}
              </span>
            </div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <TeamMini code={code(live.equipo_local)} label={live.equipo_local} dark />
              <span className="mono" style={{ fontSize: 26, fontWeight: 600, color: "var(--bg)", letterSpacing: -1 }}>
                vs
              </span>
              <TeamMini code={code(live.equipo_visitante)} label={live.equipo_visitante} dark right />
            </div>
            {predicciones[live.id]?.goles_local != null && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "oklch(0.75 0.02 60)" }}>
                <span>
                  Tu pronóstico:{" "}
                  <span className="mono" style={{ color: "var(--bg)" }}>
                    {predicciones[live.id].goles_local}–{predicciones[live.id].goles_visitante}
                  </span>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  En juego <Icon.Arrow />
                </span>
              </div>
            )}
          </Card>
        )}

        {/* Próximo pronóstico */}
        {next && (
          <>
            <SectionTitle action={<span onClick={() => navigate("/app/partidos")} style={{ cursor: "pointer" }}>Ver todos →</span>}>
              Tu próximo pronóstico
            </SectionTitle>
            <Card onClick={() => navigate(`/app/partido/${next.id}`)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <Pill tone="outline">
                  {next.grupo ? `Grupo ${next.grupo}` : faseLabel(fases, next.fase_id)}
                </Pill>
                <span style={{ fontSize: 12, color: "var(--ink-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon.Clock /> {formatDate(next.fecha)}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                  <Flag code={code(next.equipo_local)} w={56} h={40} rounded={7} />
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)", letterSpacing: -0.2 }}>{next.equipo_local}</div>
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--ink-3)",
                    letterSpacing: 1,
                    fontWeight: 600,
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: "var(--surface-2)",
                    border: "1px solid var(--line)",
                  }}
                >
                  VS
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                  <Flag code={code(next.equipo_visitante)} w={56} h={40} rounded={7} />
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)", letterSpacing: -0.2 }}>{next.equipo_visitante}</div>
                </div>
              </div>
              <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Tu pronóstico</span>
                <span className="mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.5 }}>
                  — · —
                </span>
              </div>
              <Button block size="lg" style={{ marginTop: 12 }}>
                Hacer mi pronóstico <Icon.Chevron />
              </Button>
            </Card>
          </>
        )}

        {/* Stats row */}
        {stats.jugados > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <MiniStat label="Aciertos" value={String(stats.ganador)} unit={`/ ${stats.jugados}`} />
            <MiniStat label="Racha" value={String(racha)} unit="🔥" />
            <MiniStat label="Exactos" value={String(stats.exactos)} unit={`/ ${stats.jugados}`} />
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
  fontSize: 64,
  fontWeight: 700,
  color: "var(--ink)",
  letterSpacing: -2.5,
  lineHeight: 0.95,
  fontVariantNumeric: "tabular-nums",
};

const bigNumGold = {
  ...{
    fontSize: 64,
    fontWeight: 700,
    letterSpacing: -2.5,
    lineHeight: 0.95,
    fontVariantNumeric: "tabular-nums",
  },
  background: "linear-gradient(135deg, var(--gold-ink) 0%, var(--gold) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

function MiniStat({ label, value, unit }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--line)",
        borderRadius: "var(--r-lg)",
        padding: "12px 12px",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500, letterSpacing: 0.2 }}>{label}</div>
      <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.5 }}>
          {value}
        </span>
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{unit}</span>
      </div>
    </div>
  );
}

function TeamMini({ code: c, label, dark, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexDirection: right ? "row-reverse" : "row",
      }}
    >
      <Flag code={c} w={38} h={26} rounded={5} />
      <span style={{ fontSize: 14, fontWeight: 700, color: dark ? "var(--bg)" : "var(--ink)", letterSpacing: -0.2 }}>
        {(label || "").length > 12 ? c : label}
      </span>
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
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}
