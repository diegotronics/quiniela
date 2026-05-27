import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFases } from "@/hooks/useFases";
import { useAllPartidos } from "@/hooks/useAllPartidos";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import {
  Avatar,
  Card,
  Flag,
  Icon,
  MobileHeader,
  MobileShell,
  Pill,
} from "@/components/ui";
import { code } from "@/lib/constants";

const KNOCKOUT_PHASES = [
  { id: "dieciseisavos", name: "16avos", short: "16avos" },
  { id: "octavos", name: "Octavos", short: "Octavos" },
  { id: "cuartos", name: "Cuartos", short: "Cuartos" },
  { id: "semifinal", name: "Semis", short: "Semis" },
  { id: "final", name: "Final", short: "Final" },
];

export default function Bracket() {
  const { user } = useAuth();
  const { fases } = useFases();
  const { partidos } = useAllPartidos(fases);
  const { predicciones } = usePrediccionesUsuario(user?.id);

  const rounds = useMemo(() => {
    return KNOCKOUT_PHASES.map((kp) => {
      const fase = fases.find((f) => f.id === kp.id);
      const matches = partidos.filter((p) => p.fase_id === kp.id);
      return { ...kp, fase, matches };
    }).filter((r) => r.fase);
  }, [fases, partidos]);

  const completados = useMemo(() => {
    const all = rounds.flatMap((r) => r.matches);
    const done = all.filter((m) => m.resultado_ingresado).length;
    return { done, total: all.length };
  }, [rounds]);

  // Predicción del campeón: la del partido final
  const finalRound = rounds.find((r) => r.id === "final");
  const finalMatch = finalRound?.matches[0];
  const campeonPred = useMemo(() => {
    if (!finalMatch) return null;
    const pr = predicciones[finalMatch.id];
    if (!pr || pr.goles_local == null || pr.goles_visitante == null) return null;
    if (pr.goles_local === pr.goles_visitante) return null;
    return pr.goles_local > pr.goles_visitante ? finalMatch.equipo_local : finalMatch.equipo_visitante;
  }, [finalMatch, predicciones]);

  return (
    <MobileShell
      activeTab="bracket"
      header={
        <MobileHeader
          title="Bracket"
          subtitle="Octavos · Cuartos · Semis · Final"
          leading={<Avatar name={user?.nombre} size={36} />}
        />
      }
    >
      <div style={{ padding: "0 20px", marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderRadius: "var(--r-md)",
            background: "var(--accent-soft)",
            color: "var(--accent-ink)",
            fontSize: 12,
            letterSpacing: -0.05,
          }}
        >
          <span>
            <b>{completados.done} / {completados.total}</b> partidos jugados
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon.Lock /> Solo lectura
          </span>
        </div>
      </div>

      {rounds.length === 0 ? (
        <Card style={{ margin: "0 20px" }}>
          <p style={{ margin: 0, color: "var(--ink-3)", textAlign: "center" }}>
            Todavía no hay partidos de eliminatorias cargados.
          </p>
        </Card>
      ) : (
        <div style={{ overflowX: "auto", padding: "4px 20px 24px" }} className="scroll-hide">
          <div
            className="dotgrid"
            style={{
              display: "flex",
              gap: 14,
              padding: "20px 16px",
              background: "var(--surface-2)",
              borderRadius: "var(--r-xl)",
              border: "0.5px solid var(--line)",
              minWidth: rounds.length * 180,
            }}
          >
            {rounds.map((r) => (
              <BracketColumn key={r.id} round={r} predicciones={predicciones} />
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: "0 20px", marginTop: 4 }}>
        <Card style={{ background: "var(--gold-soft)", border: "1px solid color-mix(in oklab, var(--gold) 30%, transparent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "color-mix(in oklab, var(--gold) 30%, transparent)",
                color: "oklch(0.4 0.1 85)",
              }}
            >
              <Icon.Crown />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "oklch(0.45 0.10 85)", fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" }}>
                Tu campeón
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                {campeonPred ? (
                  <>
                    <Flag code={code(campeonPred)} w={26} h={18} rounded={3} />
                    <span style={{ fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>{campeonPred}</span>
                  </>
                ) : (
                  <span style={{ fontSize: 14, color: "var(--ink-3)" }}>
                    Pronosticá el partido final para definirlo.
                  </span>
                )}
              </div>
            </div>
          </div>
          {finalMatch && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                background: "rgba(255,255,255,0.5)",
                borderRadius: "var(--r-md)",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "var(--ink-2)",
              }}
            >
              <span>+{finalRound?.fase?.pts_exacto ?? 0} pts si acertás</span>
              <span>Final · {finalMatch.equipo_local} vs {finalMatch.equipo_visitante}</span>
            </div>
          )}
        </Card>
      </div>
    </MobileShell>
  );
}

function BracketColumn({ round, predicciones }) {
  const N = round.matches.length;
  const spacing = N <= 1 ? 380 : N === 2 ? 180 : N <= 4 ? 60 : 8;
  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 168 }}>
      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--ink-3)",
          textTransform: "uppercase",
          letterSpacing: 0.6,
          marginBottom: 12,
        }}
      >
        {round.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing }}>
        {round.matches.length === 0
          ? Array.from({ length: Math.max(1, Math.ceil(N / 2) || 1) }).map((_, i) => (
              <BracketMatch key={`empty-${i}`} />
            ))
          : round.matches.map((m) => (
              <BracketMatch key={m.id} m={m} pred={predicciones[m.id]} />
            ))}
      </div>
    </div>
  );
}

function BracketMatch({ m, pred }) {
  const winner =
    m && m.resultado_ingresado
      ? m.goles_local === m.goles_visitante
        ? null
        : m.goles_local > m.goles_visitante
          ? m.equipo_local
          : m.equipo_visitante
      : null;

  const Row = ({ equipo, isWinner }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 10px",
        background: isWinner ? "var(--ink)" : "transparent",
        color: isWinner ? "var(--bg)" : "var(--ink)",
        borderRadius: 8,
      }}
    >
      {equipo ? (
        <Flag code={code(equipo)} w={20} h={14} rounded={2} />
      ) : (
        <div style={{ width: 20, height: 14, borderRadius: 2, background: "var(--line)" }} />
      )}
      <span style={{ fontSize: 12, fontWeight: 600, flex: 1, letterSpacing: -0.1 }}>
        {equipo || "—"}
      </span>
      {isWinner && <Icon.Check style={{ color: "var(--bg)", width: 12, height: 12 }} />}
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        background: "var(--surface)",
        borderRadius: "var(--r-md)",
        border: "0.5px solid var(--line)",
        padding: 4,
        boxShadow: "var(--shadow-1)",
      }}
    >
      <Row equipo={m?.equipo_local} isWinner={winner && winner === m.equipo_local} />
      <Row equipo={m?.equipo_visitante} isWinner={winner && winner === m.equipo_visitante} />
      {m && pred?.goles_local != null && (
        <div
          style={{
            padding: "4px 8px 2px",
            fontSize: 10,
            color: "var(--ink-3)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Tu pick</span>
          <span className="mono">
            {pred.goles_local}–{pred.goles_visitante}
          </span>
        </div>
      )}
    </div>
  );
}
