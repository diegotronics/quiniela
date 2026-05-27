import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFases } from "@/hooks/useFases";
import { useAllPartidos } from "@/hooks/useAllPartidos";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import { useUsuariosPublic } from "@/hooks/useUsuarios";
import { useAsync } from "@/hooks/useAsync";
import { listPuntajesGlobales } from "@/api/predicciones";
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

export default function Inicio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fases } = useFases();
  const { partidos } = useAllPartidos(fases);
  const { usuarios } = useUsuariosPublic();
  const { data: puntajesRaw } = useAsync(listPuntajesGlobales, []);
  const { predicciones } = usePrediccionesUsuario(user?.id);

  const ranking = useMemo(
    () => rankingFromUsers(usuarios, puntajesRaw || []),
    [usuarios, puntajesRaw],
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

  const pendientes = partidos.filter((p) => !p.resultado_ingresado).length;
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
        {/* Puntaje + posición */}
        <Card pad={0} style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 18px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={kicker}>Tus puntos</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                <span className="mono" style={bigNum}>{myPts}</span>
                <span style={{ fontSize: 14, color: "var(--ink-3)" }}>pts</span>
              </div>
              {stats.jugados > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Pill tone="accent">
                    {stats.exactos} exactos · {stats.ganador} ganadores
                  </Pill>
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={kicker}>Posición</div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 4, marginTop: 6 }}>
                <span className="mono" style={bigNum}>{me?.rank || "—"}</span>
                <span style={{ fontSize: 14, color: "var(--ink-3)" }}>/ {totalJugadores || 0}</span>
              </div>
              {lider && me && me.id !== lider.id && (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-3)" }}>
                  {diff} pts del 1°
                </div>
              )}
              {lider && me?.id === lider.id && (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--accent-ink)", fontWeight: 600 }}>
                  ¡Vas primero!
                </div>
              )}
            </div>
          </div>

          <div style={{ height: 4, background: "var(--line-2)", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${ratio}%`, background: "var(--accent)" }} />
          </div>
          <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-3)" }}>
              {lider && (
                <>
                  <Avatar name={lider.nombre} size={18} />
                  Lidera{" "}
                  <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                    {(lider.nombre || "").split(" ")[0]}
                  </span>
                </>
              )}
            </span>
            <span style={{ color: "var(--ink-3)" }}>
              {pendientes > 0 ? `Quedan ${pendientes} partidos` : "Torneo cerrado"}
            </span>
          </div>
        </Card>

        {/* Partido en vivo */}
        {live && (
          <Card pad={14} style={{ background: "var(--ink)", borderColor: "var(--ink)", color: "var(--bg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="live-dot" />
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, color: "oklch(0.85 0.04 32)" }}>
                Partido en vivo
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <Flag code={code(next.equipo_local)} w={44} h={32} rounded={6} />
                  <div style={{ fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>{next.equipo_local}</div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: 0.6 }}>VS</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <Flag code={code(next.equipo_visitante)} w={44} h={32} rounded={6} />
                  <div style={{ fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>{next.equipo_visitante}</div>
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
  fontSize: 44,
  fontWeight: 600,
  color: "var(--ink)",
  letterSpacing: -1.5,
  lineHeight: 1,
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
        gap: 8,
        flexDirection: right ? "row-reverse" : "row",
      }}
    >
      <Flag code={c} w={28} h={20} rounded={3} />
      <span style={{ fontSize: 13, fontWeight: 600, color: dark ? "var(--bg)" : "var(--ink)" }}>
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
