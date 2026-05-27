import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useFases } from "@/hooks/useFases";
import { useAllPartidos } from "@/hooks/useAllPartidos";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import { useUsuariosPublic } from "@/hooks/useUsuarios";
import { useAsync } from "@/hooks/useAsync";
import { listPuntajesGlobales } from "@/api/predicciones";
import { listPuntajesApuestasEspeciales } from "@/api/apuestasEspeciales";
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
  ringFor,
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
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { fases } = useFases();
  const { partidos } = useAllPartidos(fases);
  const { predicciones } = usePrediccionesUsuario(user?.id);
  const { usuarios } = useUsuariosPublic();
  const { data: puntajesRaw } = useAsync(listPuntajesGlobales, []);
  const { data: puntajesEspeciales } = useAsync(listPuntajesApuestasEspeciales, []);

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
    () => rankingFromUsers(usuarios, [
      ...(puntajesRaw || []),
      ...(puntajesEspeciales || []),
    ]),
    [usuarios, puntajesRaw, puntajesEspeciales],
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
          subtitle={perfilSubtitle({ rank: me?.rank, total: ranking.length, puntos: me?.puntos, racha })}
          leading={<Avatar name={user?.nombre} size={36} ring={ringFor({ rank: me?.rank, streak: racha })} />}
        />
      }
    >
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Identidad */}
        <Card pad={0} elevated style={{ overflow: "hidden" }}>
          <div
            className="dotgrid-soft"
            style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}
          >
            <Avatar
              name={user?.nombre}
              size={62}
              ring={ringFor({ rank: me?.rank, streak: racha })}
            />
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
          <Stat index={0} label="Puntos totales" val={String(me?.puntos ?? 0)} sub={me ? `${me.rank}° lugar` : "—"} />
          <Stat index={1} label="Aciertos" val={String(stats.ganador)} sub={`de ${stats.jugados || 0}`} />
          <Stat index={2} label="Exactos" val={String(stats.exactos)} sub={stats.jugados > 0 ? `${Math.round((stats.exactos / stats.jugados) * 100)}%` : "—"} />
          <Stat index={3} label="Mejor jornada" val={mejorJornada ? `+${mejorJornada.pts}` : "—"} sub={mejorJornada ? mejorJornada.label : "Aún sin jornadas"} />
        </div>

        {/* Logros */}
        <SectionTitle action={`${logros.filter((b) => b.on).length} / ${logros.length}`}>Logros</SectionTitle>
        <Card pad={14}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {logros.map((b, i) => (
              <div
                key={i}
                className="stagger-item"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  opacity: b.on ? 1 : 0.35,
                  animationDelay: `${i * 45}ms`,
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
          <ThemeToggleRow isDark={isDark} onToggle={toggleTheme} />
          <Button
            variant="ghost"
            size="lg"
            block
            onClick={() => navigate("/app/apuestas")}
            style={{ justifyContent: "space-between", paddingLeft: 16, paddingRight: 16 }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon.Crown /> Apuestas especiales
            </span>
            <Icon.Chevron />
          </Button>
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

function ThemeToggleRow({ isDark, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={onToggle}
      className="btn-interactive"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        width: "100%",
        padding: "14px 16px",
        borderRadius: "var(--r-lg)",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-1)",
        color: "var(--ink)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 999,
            background: isDark ? "var(--surface-2)" : "var(--gold-soft)",
            color: isDark ? "var(--ink)" : "var(--gold-ink)",
            transition: "background 200ms ease, color 200ms ease",
          }}
        >
          {isDark ? <Icon.Moon /> : <Icon.Sun />}
        </span>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Modo oscuro</span>
          <span style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>
            {isDark ? "Activado" : "Desactivado"}
          </span>
        </span>
      </span>
      <span
        aria-hidden
        style={{
          position: "relative",
          width: 44,
          height: 26,
          borderRadius: 999,
          background: isDark ? "var(--accent)" : "var(--line-strong)",
          transition: "background 200ms ease",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: isDark ? 21 : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.08)",
            transition: "left 200ms cubic-bezier(.2,.7,.2,1)",
          }}
        />
      </span>
    </button>
  );
}

function Stat({ label, val, sub, index = 0 }) {
  return (
    <Card pad={14} className="stagger-item" style={{ animationDelay: `${index * 60}ms` }}>
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

function perfilSubtitle({ rank, total, puntos, racha }) {
  const partes = [];
  if (rank && total) {
    partes.push(`#${rank} de ${total}`);
  } else {
    partes.push(GROUP_NAME);
  }
  if (typeof puntos === "number") partes.push(`${puntos} pts`);
  if ((racha || 0) >= 2) partes.push(`Racha ${racha}`);
  return partes.join(" · ");
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
