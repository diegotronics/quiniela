import { useMemo, useState } from "react";
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
              padding: "16px 8px 6px",
              borderRadius: "var(--r-xl)",
              display: "grid",
              gridTemplateColumns: "1fr 1.1fr 1fr",
              gap: 8,
              alignItems: "end",
            }}
          >
            <PodiumCard place={2} member={top3[1]} me={user?.id} />
            <PodiumCard place={1} member={top3[0]} me={user?.id} center />
            <PodiumCard place={3} member={top3[2]} me={user?.id} />
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
        {resto.map((m) => (
          <LeaderRow key={m.id} member={m} me={m.id === user?.id} />
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

function PodiumCard({ place, member, center, me }) {
  if (!member) {
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "0.5px solid var(--line)",
          borderRadius: "var(--r-lg)",
          padding: center ? "18px 10px 16px" : "14px 8px 12px",
          textAlign: "center",
          opacity: 0.4,
        }}
      >
        <div
          style={{
            width: center ? 52 : 44,
            height: center ? 52 : 44,
            borderRadius: "50%",
            background: "var(--line)",
            margin: "0 auto",
          }}
        />
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>—</div>
      </div>
    );
  }
  const isMe = me === member.id;
  const ringTone = place === 1 ? "gold" : place === 2 ? "silver" : "bronze";
  const badgeBg = place === 1 ? "var(--gold)" : place === 2 ? "oklch(0.78 0.02 80)" : "oklch(0.62 0.10 35)";
  return (
    <div
      style={{
        background: "var(--surface)",
        border: isMe ? "1.5px solid var(--accent)" : "0.5px solid var(--line)",
        borderRadius: "var(--r-lg)",
        padding: center ? "18px 10px 16px" : "14px 8px 12px",
        textAlign: "center",
        position: "relative",
        boxShadow: center ? "var(--shadow-2)" : "var(--shadow-1)",
      }}
    >
      {place === 1 && (
        <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", color: "var(--gold)" }}>
          <Icon.Crown />
        </div>
      )}
      <Avatar
        name={member.nombre}
        size={center ? 52 : 44}
        ring={ringTone}
        badge={{ label: String(place), bg: badgeBg, fg: "#fff" }}
      />
      <div style={{ marginTop: 8, fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
        {(member.nombre || "").split(" ")[0]}
      </div>
      <div style={{ fontSize: 10, color: "var(--ink-3)" }}>{isMe ? "vos" : ""}</div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
        <span className="mono" style={{ fontSize: center ? 22 : 18, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.5 }}>
          {member.puntos}
        </span>
        <span style={{ fontSize: 10, color: "var(--ink-3)" }}>pts</span>
      </div>
    </div>
  );
}

function LeaderRow({ member, me }) {
  return (
    <div
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
