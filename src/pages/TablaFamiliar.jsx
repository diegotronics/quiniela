import { useEffect, useMemo, useState } from "react";
import { celebratePodium, celebrateOnce } from "@/lib/celebrate";
import { useAuth } from "@/context/AuthContext";
import { useUsuariosPublic } from "@/hooks/useUsuarios";
import { useAsync } from "@/hooks/useAsync";
import { useFases } from "@/hooks/useFases";
import { useAllPartidos } from "@/hooks/useAllPartidos";
import { listPuntajesGlobales } from "@/api/predicciones";
import {
  Avatar,
  Card,
  Icon,
  MobileHeader,
  MobileShell,
  Pill,
  SectionTitle,
  ringFor,
} from "@/components/ui";
import { rankingFromUsers, userScoringStats, userStreak } from "@/lib/stats";
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
  const { usuarios } = useUsuariosPublic();
  const { data: puntajes, loading } = useAsync(listPuntajesGlobales, []);
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
    if (filtro === "total") return todos;
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
  }, [puntajes, filtro, partidosById]);

  const ranking = useMemo(
    () => rankingFromUsers(usuarios, puntajesFiltrados),
    [usuarios, puntajesFiltrados],
  );
  const top3 = ranking.slice(0, 3);
  const resto = ranking.slice(3);

  const rankingTotal = useMemo(
    () => rankingFromUsers(usuarios, puntajes || []),
    [usuarios, puntajes],
  );
  const meTotal = useMemo(() => rankingTotal.find((u) => u.id === user?.id), [rankingTotal, user]);
  const { predicciones } = usePrediccionesUsuario(user?.id);
  const prediccionesList = useMemo(() => Object.values(predicciones), [predicciones]);
  const racha = useMemo(() => userStreak(prediccionesList, partidos), [prediccionesList, partidos]);

  useEffect(() => {
    if (!meTotal || filtro !== "total") return;
    if (meTotal.rank >= 1 && meTotal.rank <= 3) {
      celebrateOnce(`podium-${user?.id}`, () => {
        setTimeout(celebratePodium, 400);
      });
    }
  }, [meTotal, filtro, user]);

  return (
    <MobileShell
      activeTab="tabla"
      header={
        <MobileHeader
          title="Tabla familiar"
          subtitle={`${GROUP_NAME} · ${ranking.length} jugador${ranking.length === 1 ? "" : "es"}`}
          leading={<Avatar name={user?.nombre} size={36} ring={ringFor({ rank: meTotal?.rank, streak: racha })} />}
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

      {loading && (
        <p style={{ padding: "0 20px", textAlign: "center", color: "var(--ink-3)" }}>Cargando…</p>
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
            <PodiumCard place={2} member={top3[1]} me={user?.id} delay={120} />
            <PodiumCard place={1} member={top3[0]} me={user?.id} center delay={260} />
            <PodiumCard place={3} member={top3[2]} me={user?.id} delay={0} />
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
          <LeaderRow key={m.id} member={m} me={m.id === user?.id} index={i} />
        ))}
        {resto.length === 0 && top3.length === 0 && !loading && (
          <Card>
            <p style={{ margin: 0, textAlign: "center", color: "var(--ink-3)" }}>
              Aún no hay jugadores en la tabla.
            </p>
          </Card>
        )}
      </div>
    </MobileShell>
  );
}

const PODIUM_VISUAL = {
  1: {
    pedestalHeight: 76,
    avatarSize: 72,
    pedestalBg: "linear-gradient(180deg, var(--gold) 0%, var(--gold-ink) 100%)",
    pedestalShadow: "var(--shadow-gold)",
    numberColor: "#fff",
    labelColor: "var(--gold-ink)",
    ringTone: "gold",
    badgeBg: "var(--gold)",
  },
  2: {
    pedestalHeight: 52,
    avatarSize: 56,
    pedestalBg: "linear-gradient(180deg, oklch(0.85 0.02 80) 0%, oklch(0.66 0.02 80) 100%)",
    pedestalShadow: "var(--shadow-1)",
    numberColor: "#fff",
    labelColor: "oklch(0.42 0.02 80)",
    ringTone: "silver",
    badgeBg: "oklch(0.78 0.02 80)",
  },
  3: {
    pedestalHeight: 34,
    avatarSize: 56,
    pedestalBg: "linear-gradient(180deg, oklch(0.70 0.10 35) 0%, oklch(0.48 0.10 35) 100%)",
    pedestalShadow: "var(--shadow-1)",
    numberColor: "#fff",
    labelColor: "oklch(0.40 0.10 35)",
    ringTone: "bronze",
    badgeBg: "oklch(0.62 0.10 35)",
  },
};

const ROMAN = { 1: "I", 2: "II", 3: "III" };

function PodiumCard({ place, member, center, me, delay = 0 }) {
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
            Vos
          </div>
        )}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
          <span
            className="mono"
            style={{
              fontSize: center ? 24 : 20,
              fontWeight: 700,
              color: "var(--ink)",
              letterSpacing: -0.8,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {member.puntos}
          </span>
          <span style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 500 }}>pts</span>
        </div>
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
          className="mono"
          style={{
            fontSize: place === 1 ? 36 : place === 2 ? 26 : 20,
            fontWeight: 700,
            color: visual.numberColor,
            letterSpacing: -1,
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

function LeaderRow({ member, me, index = 0 }) {
  return (
    <div
      className="stagger-item"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: me ? "var(--accent-soft)" : "var(--surface)",
        border: me
          ? "1px solid color-mix(in oklab, var(--accent) 30%, transparent)"
          : "0.5px solid var(--line)",
        borderRadius: "var(--r-md)",
        padding: "10px 12px",
        animationDelay: `${Math.min(index, 8) * 45}ms`,
      }}
    >
      <span className="mono" style={{ width: 22, textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--ink-3)" }}>
        {member.rank}
      </span>
      <Avatar name={member.nombre} size={32} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
          {member.nombre}
          {me && <span style={{ fontWeight: 400, color: "var(--ink-3)" }}> · vos</span>}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", display: "flex", gap: 8 }}>
          {member.pagado === false && (
            <span style={{ color: "var(--coral)" }}>Pago pendiente</span>
          )}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.3 }}>
          {member.puntos}
        </span>
        <div style={{ fontSize: 10, color: "var(--ink-3)" }}>pts</div>
      </div>
    </div>
  );
}
