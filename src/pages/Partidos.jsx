import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFases } from "@/hooks/useFases";
import { usePartidosByFase } from "@/hooks/usePartidos";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import {
  Avatar,
  EmptyState,
  Icon,
  MatchCard,
  MobileHeader,
  MobileShell,
  SkeletonMatchList,
  ringFor,
} from "@/components/ui";
import { useUsuariosPublic } from "@/hooks/useUsuarios";
import { useAsync } from "@/hooks/useAsync";
import { listPuntajesGlobales } from "@/api/predicciones";
import { useAllPartidos } from "@/hooks/useAllPartidos";
import { rankingFromUsers, userStreak } from "@/lib/stats";

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
          onLeadingClick={() => navigate("/app/perfil")}
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
                className="chip-interactive"
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
                className="chip-interactive"
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
                  cursor: "pointer",
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
          <SkeletonMatchList count={4} />
        ) : byDay.length === 0 ? (
          <EmptyState
            illustration="whistle"
            title="Sin partidos en esta fase"
            description={
              isGrupos
                ? `Aún no se cargaron partidos del grupo ${activeGrupo}.`
                : "Cuando se publique el fixture aparecerá aquí."
            }
          />
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
                  <MatchCard
                    key={m.id}
                    variant="list"
                    match={m}
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
