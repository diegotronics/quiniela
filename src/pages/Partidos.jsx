import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFases } from "@/hooks/useFases";
import { usePartidosByFase } from "@/hooks/usePartidos";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import {
  Avatar,
  Card,
  Flag,
  Icon,
  MobileHeader,
  MobileShell,
  Pill,
  ringFor,
} from "@/components/ui";
import { useUsuariosPublic } from "@/hooks/useUsuarios";
import { useAsync } from "@/hooks/useAsync";
import { listPuntajesGlobales } from "@/api/predicciones";
import { useAllPartidos } from "@/hooks/useAllPartidos";
import { rankingFromUsers, userStreak } from "@/lib/stats";
import { code } from "@/lib/constants";

const GRUPOS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function Partidos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fases } = useFases();
  const [activePhase, setActivePhase] = useState(null);
  const [activeGrupo, setActiveGrupo] = useState("A");

  useEffect(() => {
    if (!activePhase && fases.length) {
      const act = fases.find((f) => f.estado === "activa") || fases[0];
      setActivePhase(act.id);
    }
  }, [fases, activePhase]);

  const { partidos, loading } = usePartidosByFase(activePhase);
  const { predicciones } = usePrediccionesUsuario(user?.id);
  const { usuarios } = useUsuariosPublic();
  const { data: puntajes } = useAsync(listPuntajesGlobales, []);
  const { partidos: todosPartidos } = useAllPartidos(fases);

  const ranking = useMemo(() => rankingFromUsers(usuarios, puntajes || []), [usuarios, puntajes]);
  const me = useMemo(() => ranking.find((u) => u.id === user?.id), [ranking, user]);
  const prediccionesList = useMemo(() => Object.values(predicciones), [predicciones]);
  const racha = useMemo(() => userStreak(prediccionesList, todosPartidos), [prediccionesList, todosPartidos]);

  const fase = useMemo(() => fases.find((f) => f.id === activePhase), [fases, activePhase]);
  const isGrupos = activePhase === "grupos";

  const partidosVista = useMemo(() => {
    if (isGrupos) return partidos.filter((p) => p.grupo === activeGrupo);
    return partidos;
  }, [partidos, isGrupos, activeGrupo]);

  const guardados = partidosVista.filter((p) => {
    const pr = predicciones[p.id];
    return pr && pr.goles_local != null && pr.goles_visitante != null;
  }).length;

  const byDay = useMemo(() => {
    const map = new Map();
    [...partidosVista]
      .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""))
      .forEach((p) => {
        const key = dayKey(p.fecha);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(p);
      });
    return Array.from(map.entries());
  }, [partidosVista]);

  return (
    <MobileShell
      activeTab="partidos"
      header={
        <MobileHeader
          title="Partidos"
          subtitle={fase ? `${fase.nombre} · ${guardados}/${partidosVista.length} pronosticados` : ""}
          leading={<Avatar name={user?.nombre} size={36} ring={ringFor({ rank: me?.rank, streak: racha })} />}
        />
      }
    >
      {/* Selector de fases */}
      <div style={{ padding: "0 20px 12px" }}>
        <div
          className="scroll-hide"
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {fases.map((f) => {
            const isLocked = f.estado === "bloqueada";
            const on = activePhase === f.id;
            return (
              <button
                key={f.id}
                disabled={isLocked}
                onClick={() => setActivePhase(f.id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: on ? "var(--ink)" : "var(--surface)",
                  color: on ? "var(--bg)" : isLocked ? "var(--ink-4)" : "var(--ink-2)",
                  border: on ? "none" : "0.5px solid var(--line)",
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  letterSpacing: -0.1,
                  cursor: isLocked ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {f.nombre}
                {isLocked && <Icon.Lock />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector de grupo (solo en fase grupos) */}
      {isGrupos && (
        <div style={{ padding: "0 20px 12px" }}>
          <div
            className="scroll-hide"
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 2,
            }}
          >
            {GRUPOS.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGrupo(g)}
                style={{
                  flexShrink: 0,
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: activeGrupo === g ? "var(--ink)" : "var(--surface)",
                  color: activeGrupo === g ? "var(--bg)" : "var(--ink-2)",
                  border: activeGrupo === g ? "none" : "0.5px solid var(--line)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista por día */}
      <div style={{ padding: "0 20px 12px", display: "flex", flexDirection: "column", gap: 18 }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--ink-3)" }}>Cargando partidos…</p>
        ) : byDay.length === 0 ? (
          <Card>
            <p style={{ margin: 0, textAlign: "center", color: "var(--ink-3)" }}>
              No hay partidos cargados todavía.
            </p>
          </Card>
        ) : (
          byDay.map(([day, list]) => (
            <div key={day}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 4px 10px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{day}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  {list.length} partido{list.length > 1 ? "s" : ""}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {list.map((m) => (
                  <MatchListItem
                    key={m.id}
                    m={m}
                    pred={predicciones[m.id]}
                    onClick={() => navigate(`/app/partido/${m.id}`)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </MobileShell>
  );
}

function MatchListItem({ m, pred, onClick }) {
  const isFinal = !!m.resultado_ingresado;
  const tienePick = pred && pred.goles_local != null && pred.goles_visitante != null;
  return (
    <Card pad={14} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {m.grupo && <Pill tone="outline">Grupo {m.grupo}</Pill>}
          <span style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">
            {hour(m.fecha)}
          </span>
        </div>
        {isFinal ? (
          <Pill tone="default">
            <Icon.Check style={{ width: 11, height: 11 }} /> Finalizado
          </Pill>
        ) : tienePick ? (
          <Pill tone="accent">
            <Icon.Check style={{ width: 11, height: 11 }} /> Pronosticado
          </Pill>
        ) : (
          <Pill tone="coral" dot>Pendiente</Pill>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Flag code={code(m.equipo_local)} w={32} h={22} rounded={4} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", letterSpacing: -0.2 }}>{m.equipo_local}</span>
        </div>
        <div style={{ textAlign: "center" }}>
          {isFinal ? (
            <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.5 }}>
              {m.goles_local} – {m.goles_visitante}
            </span>
          ) : tienePick ? (
            <div>
              <span className="mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.3 }}>
                {pred.goles_local} – {pred.goles_visitante}
              </span>
              <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>tu pick</div>
            </div>
          ) : (
            <span style={{ fontSize: 12, color: "var(--ink-3)" }} className="mono">
              vs
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: "row-reverse" }}>
          <Flag code={code(m.equipo_visitante)} w={32} h={22} rounded={4} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", letterSpacing: -0.2 }}>{m.equipo_visitante}</span>
        </div>
      </div>

      {isFinal && tienePick && (pred.puntos_obtenidos != null) && (() => {
        const exacto =
          Number(pred.goles_local) === Number(m.goles_local) &&
          Number(pred.goles_visitante) === Number(m.goles_visitante);
        const ganado = pred.puntos_obtenidos > 0;
        const palette = exacto
          ? { bg: "var(--gold-soft)", fg: "var(--gold-ink)", bd: "var(--gold)" }
          : ganado
            ? { bg: "var(--accent-soft)", fg: "var(--accent-ink)", bd: "color-mix(in oklab, var(--accent) 30%, transparent)" }
            : { bg: "var(--surface-2)", fg: "var(--ink-3)", bd: "var(--line)" };
        return (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: "var(--r-md)",
              background: palette.bg,
              color: palette.fg,
              border: `1px solid ${palette.bd}`,
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              {exacto ? "Resultado exacto · " : ""}
              {ganado ? `+${pred.puntos_obtenidos} pts` : "0 pts"}
            </span>
            <Icon.Chevron />
          </div>
        );
      })()}
    </Card>
  );
}

function dayKey(iso) {
  if (!iso) return "Sin fecha";
  try {
    const d = new Date(iso);
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return iso.slice(0, 10);
  }
}

function hour(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}
