import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { celebratePodium, celebrateOncePersisted } from "@/lib/celebrate";
import { useAuth } from "@/context/AuthContext";
import { useUsuariosPublic } from "@/hooks/useUsuarios";
import { useAsync } from "@/hooks/useAsync";
import { useFases } from "@/hooks/useFases";
import { useAllPartidos } from "@/hooks/useAllPartidos";
import { listPuntajesGlobales, listPrediccionesGlobales } from "@/api/predicciones";
import { listPuntajesApuestasEspeciales } from "@/api/apuestasEspeciales";
import {
  Avatar,
  EmptyState,
  Icon,
  MobileHeader,
  MobileShell,
  RankRow,
  SectionTitle,
  SkeletonPodium,
  SkeletonRankRow,
  ringFor,
} from "@/components/ui";
import {
  familyScoreboard,
  prediccionesPendientesByUsuario,
  rankingFromUsers,
  userStreak,
} from "@/lib/stats";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import { GROUP_NAME } from "@/lib/constants";

const FILTROS = [
  { key: "total", label: "Total" },
  { key: "semana", label: "Semana" },
  { key: "eliminatorias", label: "Eliminatorias" },
  { key: "grupos", label: "Grupos" },
];

// Lunes 00:00 de la semana ISO que contiene `d`.
function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function TablaFamiliar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { usuarios } = useUsuariosPublic();
  const { data: puntajes, loading } = useAsync(listPuntajesGlobales, []);
  const { data: puntajesEspeciales } = useAsync(listPuntajesApuestasEspeciales, []);
  const { data: prediccionesGlobales } = useAsync(listPrediccionesGlobales, []);
  const { fases } = useFases();
  const { partidos } = useAllPartidos(fases);
  const [filtro, setFiltro] = useState("total");

  const partidosById = useMemo(() => {
    const map = new Map();
    for (const p of partidos) map.set(p.id, p);
    return map;
  }, [partidos]);

  const puntajesFiltrados = useMemo(() => {
    const todos = puntajes || [];
    // El "Total" incluye las apuestas especiales (Campeón, Goleador, etc.),
    // igual que el ranking de Inicio. Los filtros por fase solo aplican a
    // predicciones de partidos, así que ahí no se suman.
    if (filtro === "total") return [...todos, ...(puntajesEspeciales || [])];
    if (filtro === "grupos") {
      return todos.filter((p) => {
        const m = partidosById.get(p.partido_id);
        return m && m.fase_id === "grupos";
      });
    }
    if (filtro === "eliminatorias") {
      return todos.filter((p) => {
        const m = partidosById.get(p.partido_id);
        return m && m.fase_id !== "grupos";
      });
    }
    if (filtro === "semana") {
      const inicio = startOfWeek(new Date());
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 7);
      return todos.filter((p) => {
        const m = partidosById.get(p.partido_id);
        if (!m || !m.fecha) return false;
        const f = new Date(m.fecha);
        return f >= inicio && f < fin;
      });
    }
    return todos;
  }, [puntajes, puntajesEspeciales, filtro, partidosById]);

  const ranking = useMemo(
    () => rankingFromUsers(usuarios, puntajesFiltrados),
    [usuarios, puntajesFiltrados],
  );
  const top3 = ranking.slice(0, 3);
  const resto = ranking.slice(3);

  // Predicciones pendientes por jugador (partidos abiertos aún sin pronosticar).
  // Es global, independiente del filtro de fase seleccionado arriba.
  const { pendientes, total: totalAbiertos } = useMemo(
    () => prediccionesPendientesByUsuario(usuarios, puntajes, partidos),
    [usuarios, puntajes, partidos],
  );
  // Solo mostramos el indicador cuando hay partidos abiertos que pronosticar.
  const faltanDe = (id) => (totalAbiertos > 0 ? pendientes.get(id) ?? 0 : undefined);

  const rankingTotal = useMemo(
    () =>
      rankingFromUsers(usuarios, [
        ...(puntajes || []),
        ...(puntajesEspeciales || []),
      ]),
    [usuarios, puntajes, puntajesEspeciales],
  );
  const meTotal = useMemo(() => rankingTotal.find((u) => u.id === user?.id), [rankingTotal, user]);
  const { predicciones } = usePrediccionesUsuario(user?.id);
  const prediccionesList = useMemo(() => Object.values(predicciones), [predicciones]);
  const racha = useMemo(() => userStreak(prediccionesList, partidos), [prediccionesList, partidos]);

  // Estadísticas de la familia (independientes del filtro de período): se
  // calculan sobre todo el torneo a partir de las predicciones con goles.
  const scoreboard = useMemo(
    () => familyScoreboard(usuarios, prediccionesGlobales || [], partidos),
    [usuarios, prediccionesGlobales, partidos],
  );
  const hayResultados = useMemo(
    () => (partidos || []).some((p) => p.resultado_ingresado),
    [partidos],
  );

  // El torneo se considera terminado cuando cada fase tiene al menos un partido
  // cargado y todos con resultado. Exigir partidos en todas las fases evita
  // celebrar el podio al cerrar la fase de grupos mientras las eliminatorias
  // aún no se han sembrado. El podio solo se celebra al cerrarse el torneo.
  const torneoFinalizado = useMemo(() => {
    if (!fases?.length || !partidos?.length) return false;
    return fases.every((f) => {
      const ps = partidos.filter((p) => p.fase_id === f.id);
      return ps.length > 0 && ps.every((p) => p.resultado_ingresado);
    });
  }, [fases, partidos]);

  useEffect(() => {
    if (!meTotal || !torneoFinalizado) return;
    if (meTotal.rank < 1 || meTotal.rank > 3) return;
    // Una sola celebración por usuario, persistida entre visitas y recargas
    // para que no se repita al volver a abrir la tabla.
    celebrateOncePersisted(`podium-${user?.id}-final`, () => {
      setTimeout(celebratePodium, 400);
    });
  }, [meTotal, torneoFinalizado, user]);

  return (
    <MobileShell
      activeTab="tabla"
      header={
        <MobileHeader
          title="Tabla familiar"
          subtitle={`${GROUP_NAME} · ${ranking.length} jugador${ranking.length === 1 ? "" : "es"}`}
          leading={<Avatar name={user?.nombre} size={36} ring={ringFor({ rank: meTotal?.rank, streak: racha })} />}
          onLeadingClick={() => navigate("/app/perfil")}
        />
      }
    >
      {/* Filtros por período/fase */}
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTROS.map(({ key, label }) => {
            const active = filtro === key;
            return (
              <button
                key={key}
                onClick={() => setFiltro(key)}
                className="chip-interactive"
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 10,
                  background: active ? "var(--ink)" : "var(--surface)",
                  color: active ? "var(--bg)" : "var(--ink-4)",
                  border: active ? "none" : "0.5px solid var(--line)",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: -0.1,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && top3.length === 0 && (
        <>
          <div style={{ padding: "0 20px 14px" }}>
            <SkeletonPodium />
          </div>
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 6 }}>
            <SectionTitle>Posiciones</SectionTitle>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRankRow key={i} />
            ))}
          </div>
        </>
      )}

      {/* Podio */}
      {top3.length > 0 && (
        <div style={{ padding: "0 20px 14px" }}>
          <div
            className="dotgrid-soft"
            style={{
              padding: "26px 12px 0",
              borderRadius: "var(--r-xl)",
              border: "0.5px solid var(--line)",
              background: "var(--surface)",
              boxShadow: "var(--shadow-1)",
              display: "grid",
              gridTemplateColumns: "1fr 1.15fr 1fr",
              gap: 10,
              alignItems: "end",
            }}
          >
            <PodiumCard place={2} member={top3[1]} me={user?.id} delay={120} faltan={faltanDe(top3[1]?.id)} />
            <PodiumCard place={1} member={top3[0]} me={user?.id} center delay={260} faltan={faltanDe(top3[0]?.id)} />
            <PodiumCard place={3} member={top3[2]} me={user?.id} delay={0} faltan={faltanDe(top3[2]?.id)} />
          </div>
        </div>
      )}

      {/* Resto */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 6 }}>
        <SectionTitle action={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon.Filter /> Filtrar
          </span>
        }>
          Posiciones
        </SectionTitle>
        {resto.map((m, i) => (
          <RankRow
            key={m.id}
            member={m}
            isMe={m.id === user?.id}
            index={i}
            showPagoStatus
            faltan={faltanDe(m.id)}
          />
        ))}
        {resto.length === 0 && top3.length === 0 && !loading && (
          <EmptyState
            illustration="trophy"
            title="Tabla todavía vacía"
            description="Cuando se carguen partidos y predicciones, los puntajes se mostrarán aquí."
          />
        )}
      </div>

      {/* Estadísticas de la familia */}
      {hayResultados && (
        <div style={{ padding: "22px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
          <SectionTitle>Estadísticas</SectionTitle>
          {STAT_CARDS.map((card) => (
            <StatLeaderCard
              key={card.key}
              card={card}
              ranking={scoreboard[card.key]}
              me={user?.id}
            />
          ))}
        </div>
      )}
    </MobileShell>
  );
}

// Cada tarjeta de estadística: clave del scoreboard, título, ícono, tono de
// color y la etiqueta de la unidad (singular/plural).
const STAT_CARDS = [
  {
    key: "exactos",
    title: "Marcadores exactos",
    Icon: Icon.Stadium,
    tone: "azure",
    unit: (n) => (n === 1 ? "exacto" : "exactos"),
  },
  {
    key: "acertados",
    title: "Resultados acertados",
    Icon: Icon.Check,
    tone: "accent",
    unit: (n) => (n === 1 ? "acierto" : "aciertos"),
  },
  {
    key: "primero",
    title: "Jornadas en primer lugar",
    Icon: Icon.Crown,
    tone: "gold",
    unit: (n) => (n === 1 ? "jornada" : "jornadas"),
  },
  {
    key: "ultimo",
    title: "Jornadas en último lugar",
    Icon: Icon.ChevronD,
    tone: "coral",
    unit: (n) => (n === 1 ? "jornada" : "jornadas"),
  },
];

const STAT_TONES = {
  azure: { soft: "var(--azure-soft)", solid: "var(--azure)", ink: "var(--azure-ink)" },
  accent: { soft: "var(--accent-soft)", solid: "var(--accent)", ink: "var(--accent-ink)" },
  gold: { soft: "var(--gold-soft)", solid: "var(--gold)", ink: "var(--gold-ink)" },
  coral: { soft: "var(--coral-soft)", solid: "var(--coral)", ink: "var(--coral-ink)" },
};

const MEDALLAS = ["1", "2", "3"];

function StatLeaderCard({ card, ranking, me }) {
  const tone = STAT_TONES[card.tone] || STAT_TONES.azure;
  const { Icon: CardIcon, unit } = card;

  // Solo jugadores con al menos un acierto en esta métrica, hasta tres.
  const top = (ranking || []).filter((r) => r.valor > 0).slice(0, 3);
  const lider = top[0];

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--line)",
        borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-1)",
        overflow: "hidden",
      }}
    >
      {/* Encabezado de la tarjeta */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          borderBottom: top.length ? "0.5px solid var(--line)" : "none",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: tone.soft,
            color: tone.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CardIcon size={17} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.1 }}>
            {card.title}
          </div>
        </div>
        {lider && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 3, flexShrink: 0 }}>
            <span
              className="font-score"
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: tone.ink,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {lider.valor}
            </span>
            <span style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600, letterSpacing: 0.3 }}>
              {unit(lider.valor)}
            </span>
          </div>
        )}
      </div>

      {/* Cuerpo: top 3 de la métrica */}
      {top.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {top.map((r, i) => {
            const isMe = r.id === me;
            return (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 14px",
                  background: isMe ? "var(--accent-soft)" : "transparent",
                  borderTop: i === 0 ? "none" : "0.5px solid var(--line-2)",
                }}
              >
                <span
                  style={{
                    width: 18,
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: i === 0 ? tone.ink : "var(--ink-3)",
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                  }}
                >
                  {MEDALLAS[i]}
                </span>
                <Avatar name={r.nombre} size={28} ring={i === 0 ? card.tone : null} />
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 13,
                    fontWeight: isMe ? 700 : 500,
                    color: "var(--ink)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(r.nombre || "").split(" ")[0]}
                  {isMe && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 9,
                        color: "var(--accent-ink)",
                        fontWeight: 700,
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                      }}
                    >
                      Tú
                    </span>
                  )}
                </div>
                <span
                  className="font-score"
                  style={{
                    fontSize: 15,
                    fontWeight: 400,
                    color: i === 0 ? tone.ink : "var(--ink-2)",
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                  }}
                >
                  {r.valor}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: "12px 14px", fontSize: 12, color: "var(--ink-3)" }}>
          Aún sin datos.
        </div>
      )}
    </div>
  );
}

const PODIUM_VISUAL = {
  1: {
    pedestalHeight: 76,
    avatarSize: 72,
    pedestalBg: "var(--gradient-trofeo)",
    pedestalShadow: "var(--shadow-gold)",
    numberColor: "#1A1300",
    labelColor: "var(--gold-ink)",
    ringTone: "gold",
    badgeBg: "var(--gold)",
  },
  2: {
    pedestalHeight: 52,
    avatarSize: 56,
    pedestalBg: "linear-gradient(180deg, oklch(0.78 0.06 250) 0%, oklch(0.50 0.10 250) 100%)",
    pedestalShadow: "var(--shadow-azure)",
    numberColor: "#fff",
    labelColor: "var(--azure-ink)",
    ringTone: "silver",
    badgeBg: "oklch(0.65 0.12 250)",
  },
  3: {
    pedestalHeight: 34,
    avatarSize: 56,
    pedestalBg: "linear-gradient(180deg, oklch(0.72 0.20 28) 0%, oklch(0.50 0.20 28) 100%)",
    pedestalShadow: "var(--shadow-coral)",
    numberColor: "#fff",
    labelColor: "var(--coral-ink)",
    ringTone: "bronze",
    badgeBg: "var(--coral)",
  },
};

const ROMAN = { 1: "I", 2: "II", 3: "III" };

function PodiumCard({ place, member, center, me, delay = 0, faltan }) {
  const visual = PODIUM_VISUAL[place];

  if (!member) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.4 }}>
        <div
          style={{
            width: visual.avatarSize,
            height: visual.avatarSize,
            borderRadius: "50%",
            background: "var(--line-2)",
            border: "1px dashed var(--line)",
          }}
        />
        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>—</div>
        <div
          style={{
            width: "100%",
            height: visual.pedestalHeight,
            background: "var(--line-2)",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            border: "1px dashed var(--line)",
            borderBottom: "none",
          }}
        />
      </div>
    );
  }

  const isMe = me === member.id;

  return (
    <div
      className="podium-rise"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Bloque jugador */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          padding: "4px 4px 10px",
          position: "relative",
          width: "100%",
        }}
      >
        {place === 1 && (
          <div
            className="trophy-rise"
            style={{
              position: "absolute",
              top: -14,
              left: "50%",
              transform: "translateX(-50%)",
              color: "var(--gold)",
              filter: "drop-shadow(0 2px 4px color-mix(in oklab, var(--gold) 50%, transparent))",
            }}
          >
            <Icon.Crown />
          </div>
        )}
        <Avatar
          name={member.nombre}
          size={visual.avatarSize}
          ring={visual.ringTone}
        />
        <div
          style={{
            marginTop: 2,
            fontWeight: 700,
            fontSize: center ? 14 : 13,
            color: "var(--ink)",
            letterSpacing: -0.2,
            textAlign: "center",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {(member.nombre || "").split(" ")[0]}
        </div>
        {isMe && (
          <div
            style={{
              fontSize: 9,
              color: "var(--accent-ink)",
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              padding: "1px 6px",
              borderRadius: 999,
              background: "var(--accent-soft)",
              border: "1px solid color-mix(in oklab, var(--accent) 25%, transparent)",
            }}
          >
            Tú
          </div>
        )}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
          <span
            className="font-score"
            style={{
              fontSize: center ? 30 : 24,
              fontWeight: 400,
              color: "var(--ink)",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {member.puntos}
          </span>
          <span style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>pts</span>
        </div>
        {faltan != null &&
          (faltan > 0 ? (
            <div
              style={{
                marginTop: 3,
                fontSize: 9.5,
                fontWeight: 500,
                color: "var(--ink-3)",
                letterSpacing: -0.1,
              }}
            >
              {faltan} por pronosticar
            </div>
          ) : (
            <div
              style={{
                marginTop: 3,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontSize: 9.5,
                fontWeight: 600,
                color: "var(--accent-ink)",
                letterSpacing: -0.1,
              }}
            >
              <Icon.Check size={11} /> Al día
            </div>
          ))}
      </div>

      {/* Pedestal */}
      <div
        className="podium-pedestal"
        style={{
          width: "100%",
          height: visual.pedestalHeight,
          background: visual.pedestalBg,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          boxShadow: visual.pedestalShadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          animationDelay: `${delay + 80}ms`,
          border: isMe ? "1.5px solid var(--accent)" : "1px solid color-mix(in oklab, var(--ink) 8%, transparent)",
          borderBottom: "none",
        }}
      >
        {/* Brillo superior del pedestal */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
        <span
          className="font-score"
          style={{
            fontSize: place === 1 ? 44 : place === 2 ? 32 : 26,
            fontWeight: 400,
            color: visual.numberColor,
            letterSpacing: 1,
            lineHeight: 1,
            textShadow: "0 1px 2px rgba(0,0,0,0.18)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {ROMAN[place]}
        </span>
      </div>
    </div>
  );
}

