import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFases } from "@/hooks/useFases";
import { usePartidosByFase } from "@/hooks/usePartidos";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import {
  Avatar,
  BracketView,
  EmptyState,
  Icon,
  MatchCard,
  MobileHeader,
  MobileShell,
  SkeletonMatchList,
  ringFor,
  useKnockoutRounds,
} from "@/components/ui";
import { useUsuariosPublic } from "@/hooks/useUsuarios";
import { useAsync } from "@/hooks/useAsync";
import { listPuntajesGlobales } from "@/api/predicciones";
import { listPuntajesApuestasEspeciales } from "@/api/apuestasEspeciales";
import { useAllPartidos } from "@/hooks/useAllPartidos";
import { rankingFromUsers, userStreak } from "@/lib/stats";
import { formatearDiaLargo } from "@/lib/fechas";

const GRUPOS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const VISTAS = [
  { id: "lista", label: "Lista" },
  { id: "grupos", label: "Por grupos" },
];

// Ventana tras el inicio durante la cual un partido sin resultado sigue
// siendo "el siguiente" (cubre los ~150 min de un partido en juego).
const VENTANA_EN_JUEGO_MS = 150 * 60 * 1000;

export default function Partidos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fases } = useFases();
  const [vista, setVista] = useState("lista");
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
  const { data: puntajesEspeciales } = useAsync(listPuntajesApuestasEspeciales, []);
  const { partidos: todosPartidos, loading: loadingTodos } = useAllPartidos(fases);

  const ranking = useMemo(
    () =>
      rankingFromUsers(usuarios, [
        ...(puntajes || []),
        ...(puntajesEspeciales || []),
      ]),
    [usuarios, puntajes, puntajesEspeciales],
  );
  const me = useMemo(() => ranking.find((u) => u.id === user?.id), [ranking, user]);
  const prediccionesList = useMemo(() => Object.values(predicciones), [predicciones]);
  const racha = useMemo(() => userStreak(prediccionesList, todosPartidos), [prediccionesList, todosPartidos]);

  const fase = useMemo(() => fases.find((f) => f.id === activePhase), [fases, activePhase]);
  const isGrupos = activePhase === "grupos";
  const isLista = vista === "lista";
  const isBracket = vista === "bracket";

  // El cuadro de eliminatorias solo se ofrece cuando hay fases de mata-mata
  // configuradas; durante la fase de grupos esta vista permanece oculta.
  const rounds = useKnockoutRounds(fases, todosPartidos);
  const hayBracket = rounds.length > 0;
  const vistas = useMemo(
    () => (hayBracket ? [...VISTAS, { id: "bracket", label: "Bracket" }] : VISTAS),
    [hayBracket],
  );

  // Si la vista de bracket deja de estar disponible, vuelve a la lista. Se
  // espera a que termine la carga para no expulsar al usuario mientras los
  // partidos aún se están recargando.
  useEffect(() => {
    if (vista === "bracket" && !hayBracket && !loadingTodos) setVista("lista");
  }, [vista, hayBracket, loadingTodos]);

  const partidosVista = useMemo(() => {
    if (isLista) return todosPartidos;
    if (isGrupos) return partidos.filter((p) => p.grupo === activeGrupo);
    return partidos;
  }, [isLista, todosPartidos, partidos, isGrupos, activeGrupo]);

  const guardados = partidosVista.filter((p) => {
    const pr = predicciones[p.id];
    return pr && pr.goles_local != null && pr.goles_visitante != null;
  }).length;

  const byDay = useMemo(() => {
    const map = new Map();
    [...partidosVista]
      .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""))
      .forEach((p) => {
        const key = formatearDiaLargo(p.fecha);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(p);
      });
    return Array.from(map.entries());
  }, [partidosVista]);

  // Siguiente partido de la lista cronológica: el primero sin resultado que
  // está por jugarse o en juego. Si el torneo terminó, no hay ancla.
  const siguienteId = useMemo(() => {
    if (!isLista) return null;
    const ahora = Date.now();
    const ordenados = [...todosPartidos].sort((a, b) =>
      (a.fecha || "").localeCompare(b.fecha || ""),
    );
    const siguiente = ordenados.find((p) => {
      if (p.resultado_ingresado) return false;
      const inicio = new Date(p.fecha).getTime();
      return !Number.isNaN(inicio) && inicio + VENTANA_EN_JUEGO_MS > ahora;
    });
    return siguiente?.id ?? null;
  }, [isLista, todosPartidos]);

  const siguienteRef = useRef(null);

  // Al entrar a la vista de lista, desplaza automáticamente hasta el
  // siguiente partido una vez que la lista está renderizada.
  useEffect(() => {
    if (!isLista || loadingTodos || !siguienteId) return;
    const t = setTimeout(() => {
      siguienteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return () => clearTimeout(t);
  }, [isLista, loadingTodos, siguienteId]);

  const faseNombre = useMemo(() => {
    const map = new Map(fases.map((f) => [f.id, f.nombre]));
    return (id) => map.get(id) || "";
  }, [fases]);

  const cargando = isLista ? loadingTodos : loading;

  return (
    <MobileShell
      activeTab="partidos"
      header={
        // El encabezado y el selector de vista permanecen fijos al hacer
        // scroll: ambos viven dentro de un mismo contenedor sticky.
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "var(--bg)",
          }}
        >
          <MobileHeader
            sticky={false}
            title="Partidos"
            subtitle={
              isBracket
                ? "Cuadro de eliminatorias"
                : isLista
                  ? partidosVista.length
                    ? `Calendario completo · ${guardados}/${partidosVista.length} pronosticados`
                    : "Calendario completo"
                  : fase
                    ? `${fase.nombre} · ${guardados}/${partidosVista.length} pronosticados`
                    : ""
            }
            leading={<Avatar name={user?.nombre} size={36} ring={ringFor({ rank: me?.rank, streak: racha })} />}
            onLeadingClick={() => navigate("/app/perfil")}
          />

          {/* Tabs de vista: lista cronológica / por grupos / bracket */}
          <div style={{ padding: "0 20px 12px" }}>
            <div
              role="tablist"
              aria-label="Vista de partidos"
              style={{
                display: "flex",
                gap: 3,
                padding: 3,
                borderRadius: 12,
                background: "var(--surface)",
                border: "0.5px solid var(--line)",
              }}
            >
              {vistas.map((v) => {
                const on = vista === v.id;
                return (
                  <button
                    key={v.id}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setVista(v.id)}
                    className="chip-interactive"
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: 9,
                      background: on ? "var(--ink)" : "transparent",
                      color: on ? "var(--bg)" : "var(--ink-2)",
                      border: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: -0.1,
                      cursor: "pointer",
                    }}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      }
    >
      {/* Selector de fases (solo vista por grupos) */}
      {!isLista && !isBracket && (
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
      )}

      {/* Selector de grupo (solo en fase grupos) */}
      {!isLista && !isBracket && isGrupos && (
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

      {/* Cuadro de eliminatorias */}
      {isBracket && <BracketView rounds={rounds} predicciones={predicciones} />}

      {/* Lista por día */}
      {!isBracket && (
      <div style={{ padding: "0 20px 12px", display: "flex", flexDirection: "column", gap: 18 }}>
        {cargando ? (
          <SkeletonMatchList count={4} />
        ) : byDay.length === 0 ? (
          <EmptyState
            illustration="whistle"
            title={isLista ? "Sin partidos programados" : "Sin partidos en esta fase"}
            description={
              !isLista && isGrupos
                ? `Aún no se cargaron partidos del grupo ${activeGrupo}.`
                : "Cuando se publique el calendario aparecerá aquí."
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
                  <div
                    key={m.id}
                    ref={isLista && m.id === siguienteId ? siguienteRef : undefined}
                  >
                    <MatchCard
                      variant="list"
                      match={m}
                      pred={predicciones[m.id]}
                      groupLabel={
                        isLista && !m.grupo ? faseNombre(m.fase_id) : undefined
                      }
                      onClick={() => navigate(`/app/partido/${m.id}`)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      )}
    </MobileShell>
  );
}

