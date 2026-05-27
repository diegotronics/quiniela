import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFases } from "@/hooks/useFases";
import { useAllPartidos } from "@/hooks/useAllPartidos";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import { useUsuariosPublic } from "@/hooks/useUsuarios";
import { useAsync } from "@/hooks/useAsync";
import { listPuntajesGlobales } from "@/api/predicciones";
import {
  Avatar,
  Button,
  Card,
  Flag,
  Icon,
  MobileHeader,
  MobileShell,
  Pill,
  SectionTitle,
} from "@/components/ui";
import {
  rankingFromUsers,
  userScoringStats,
  userStreak,
} from "@/lib/stats";
import { code, GROUP_NAME } from "@/lib/constants";

export default function Perfil() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { fases } = useFases();
  const { partidos } = useAllPartidos(fases);
  const { predicciones } = usePrediccionesUsuario(user?.id);
  const { usuarios } = useUsuariosPublic();
  const { data: puntajesRaw } = useAsync(listPuntajesGlobales, []);

  const prediccionesList = useMemo(() => Object.values(predicciones), [predicciones]);
  const stats = useMemo(
    () => userScoringStats(prediccionesList, partidos),
    [prediccionesList, partidos],
  );
  const racha = useMemo(
    () => userStreak(prediccionesList, partidos),
    [prediccionesList, partidos],
  );
  const ranking = useMemo(
    () => rankingFromUsers(usuarios, puntajesRaw || []),
    [usuarios, puntajesRaw],
  );
  const me = ranking.find((u) => u.id === user?.id);

  const mejorJornada = useMemo(() => bestJornada(prediccionesList, partidos, fases), [prediccionesList, partidos, fases]);

  // Recientes: últimas 5 predicciones (por updated_at)
  const recientes = useMemo(() => {
    const byPartido = new Map(partidos.map((p) => [p.id, p]));
    return [...prediccionesList]
      .filter((pr) => byPartido.has(pr.partido_id))
      .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))
      .slice(0, 5)
      .map((pr) => ({ pr, m: byPartido.get(pr.partido_id) }));
  }, [prediccionesList, partidos]);

  const logros = useMemo(() => deriveBadges({ stats, racha, ranking: me?.rank, total: ranking.length }), [stats, racha, me, ranking]);

  return (
    <MobileShell
      activeTab="perfil"
      header={
        <MobileHeader
          title="Perfil"
          subtitle="Tus pronósticos, racha y logros"
          leading={<Avatar name={user?.nombre} size={36} />}
        />
      }
    >
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Identidad */}
        <Card pad={18}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar name={user?.nombre} size={62} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 18, color: "var(--ink)" }}>{user?.nombre}</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>
                {user?.email} · {GROUP_NAME}
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {user?.es_admin && <Pill tone="ink" size="sm">Admin</Pill>}
                {racha > 0 && (
                  <Pill tone="gold" size="sm">
                    <Icon.Fire /> Racha {racha}
                  </Pill>
                )}
                {user?.pagado ? (
                  <Pill tone="accent" size="sm">Pago al día</Pill>
                ) : (
                  <Pill tone="coral" size="sm">Pago pendiente</Pill>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Stat label="Puntos totales" val={String(me?.puntos ?? 0)} sub={me ? `${me.rank}° lugar` : "—"} />
          <Stat label="Aciertos" val={String(stats.ganador)} sub={`de ${stats.jugados || 0}`} />
          <Stat label="Exactos" val={String(stats.exactos)} sub={stats.jugados > 0 ? `${Math.round((stats.exactos / stats.jugados) * 100)}%` : "—"} />
          <Stat label="Mejor jornada" val={mejorJornada ? `+${mejorJornada.pts}` : "—"} sub={mejorJornada ? mejorJornada.label : "Aún sin jornadas"} />
        </div>

        {/* Logros */}
        <SectionTitle action={`${logros.filter((b) => b.on).length} / ${logros.length}`}>Logros</SectionTitle>
        <Card pad={14}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {logros.map((b, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  opacity: b.on ? 1 : 0.35,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: `oklch(0.92 0.04 ${b.hue})`,
                    color: `oklch(0.32 0.10 ${b.hue})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {b.on ? "★" : "○"}
                </div>
                <div style={{ fontSize: 10, color: "var(--ink-3)", textAlign: "center" }}>{b.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recientes */}
        {recientes.length > 0 && (
          <>
            <SectionTitle action={<span onClick={() => navigate("/app/partidos")} style={{ cursor: "pointer" }}>Ver todos →</span>}>
              Pronósticos recientes
            </SectionTitle>
            <Card pad={0} style={{ overflow: "hidden" }}>
              {recientes.map(({ pr, m }, i) => {
                const isFinal = m.resultado_ingresado;
                const tone = isFinal ? (pr.puntos_obtenidos > 0 ? "accent" : "outline") : "outline";
                const status = isFinal ? `+${pr.puntos_obtenidos || 0} pts` : "Por jugar";
                return (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/app/partido/${m.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderBottom: i < recientes.length - 1 ? "0.5px solid var(--line-2)" : "none",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: 92 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Flag code={code(m.equipo_local)} w={18} h={12} rounded={2} />
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{m.equipo_local}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Flag code={code(m.equipo_visitante)} w={18} h={12} rounded={2} />
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{m.equipo_visitante}</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>
                        {pr.goles_local} – {pr.goles_visitante}
                      </span>
                      <div style={{ fontSize: 10, color: "var(--ink-3)" }}>tu pick</div>
                    </div>
                    <Pill tone={tone}>{status}</Pill>
                  </div>
                );
              })}
            </Card>
          </>
        )}

        {/* Acciones */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          {user?.es_admin && (
            <Button
              variant="ghost"
              size="lg"
              block
              onClick={() => navigate("/admin")}
              style={{ justifyContent: "space-between", paddingLeft: 16, paddingRight: 16 }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Icon.Gear /> Panel de administración
              </span>
              <Icon.Chevron />
            </Button>
          )}
          <Button
            variant="ghost"
            size="lg"
            block
            onClick={logout}
            style={{ justifyContent: "space-between", paddingLeft: 16, paddingRight: 16 }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon.Logout /> Cerrar sesión
            </span>
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}

function Stat({ label, val, sub }) {
  return (
    <Card pad={14}>
      <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500, letterSpacing: 0.2 }}>{label}</div>
      <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", gap: 6 }}>
        <span className="mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.5 }}>
          {val}
        </span>
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{sub}</span>
      </div>
    </Card>
  );
}

function deriveBadges({ stats, racha, ranking, total }) {
  return [
    { label: "1ª picada", on: stats.jugados >= 1, hue: 148 },
    { label: "Racha 3", on: racha >= 3, hue: 32 },
    { label: "Exacto", on: stats.exactos >= 1, hue: 220 },
    { label: "Top 3", on: ranking != null && ranking <= 3 && total >= 3, hue: 85 },
    { label: "10 aciertos", on: stats.ganador >= 10, hue: 280 },
    { label: "Líder", on: ranking === 1 && total >= 2, hue: 200 },
    { label: "Mil pts", on: stats.jugados >= 100, hue: 0 },
    { label: "Coleccionista", on: stats.exactos >= 5, hue: 320 },
  ];
}

function bestJornada(preds, partidos, fases) {
  const byPartido = new Map(partidos.map((p) => [p.id, p]));
  const byFase = new Map();
  for (const pr of preds) {
    const m = byPartido.get(pr.partido_id);
    if (!m || !m.resultado_ingresado) continue;
    const sum = (byFase.get(m.fase_id) || 0) + (pr.puntos_obtenidos || 0);
    byFase.set(m.fase_id, sum);
  }
  let best = null;
  for (const [faseId, pts] of byFase.entries()) {
    if (!best || pts > best.pts) {
      const f = fases.find((x) => x.id === faseId);
      best = { pts, label: f?.nombre || "Jornada" };
    }
  }
  return best && best.pts > 0 ? best : null;
}
