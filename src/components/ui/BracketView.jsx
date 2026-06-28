import { useEffect, useMemo } from "react";
import { Card } from "./Card.jsx";
import { Flag } from "./Flag.jsx";
import { Icon } from "./Icon.jsx";
import { MatchCard } from "./MatchCard.jsx";
import { ChampionReveal } from "./ChampionReveal.jsx";
import { code } from "@/lib/constants";
import { equipoGanador } from "@/lib/pronosticos";
import { celebrateChampion, celebrateOnce } from "@/lib/celebrate";

const KNOCKOUT_PHASES = [
  { id: "dieciseisavos", name: "16avos", short: "16avos" },
  { id: "octavos", name: "Octavos", short: "Octavos" },
  { id: "cuartos", name: "Cuartos", short: "Cuartos" },
  { id: "semifinal", name: "Semis", short: "Semis" },
  { id: "final", name: "Final", short: "Final" },
];

// Fases eliminatorias presentes en la configuración, con sus partidos.
export function useKnockoutRounds(fases, partidos) {
  return useMemo(() => {
    return KNOCKOUT_PHASES.map((kp) => {
      const fase = fases.find((f) => f.id === kp.id);
      const matches = partidos.filter((p) => p.fase_id === kp.id);
      return { ...kp, fase, matches };
    }).filter((r) => r.fase);
  }, [fases, partidos]);
}

// Vista del cuadro de eliminatorias: barra de progreso + columnas por fase.
export function BracketView({ rounds, predicciones }) {
  const completados = useMemo(() => {
    const all = rounds.flatMap((r) => r.matches);
    const done = all.filter((m) => m.resultado_ingresado).length;
    return { done, total: all.length };
  }, [rounds]);

  if (rounds.length === 0) {
    return (
      <Card style={{ margin: "0 20px" }}>
        <p style={{ margin: 0, color: "var(--ink-3)", textAlign: "center" }}>
          Todavía no hay partidos de eliminatorias cargados.
        </p>
      </Card>
    );
  }

  return (
    <>
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
    </>
  );
}

// Tarjeta del campeón: deriva tu pronóstico del partido final, lo compara con
// el resultado real y celebra si aciertas. No renderiza nada hasta que exista
// el partido final, para no mostrarse durante la fase de grupos.
export function ChampionCard({ rounds, predicciones }) {
  const finalRound = rounds.find((r) => r.id === "final");
  const finalMatch = finalRound?.matches[0];

  const campeonPred = useMemo(() => {
    if (!finalMatch) return null;
    const pr = predicciones[finalMatch.id];
    if (!pr || pr.goles_local == null || pr.goles_visitante == null) return null;
    if (pr.goles_local === pr.goles_visitante) return null;
    return pr.goles_local > pr.goles_visitante ? finalMatch.equipo_local : finalMatch.equipo_visitante;
  }, [finalMatch, predicciones]);

  const campeonReal = useMemo(() => equipoGanador(finalMatch), [finalMatch]);
  const acertoCampeon = campeonReal && campeonPred && campeonReal === campeonPred;

  useEffect(() => {
    if (!acertoCampeon || !finalMatch) return;
    celebrateOnce(`champion-${finalMatch.id}`, () => {
      setTimeout(celebrateChampion, 350);
    });
  }, [acertoCampeon, finalMatch]);

  if (!finalMatch) return null;

  if (acertoCampeon) {
    return (
      <Card
        className="breathe-gold"
        style={{
          background: "linear-gradient(180deg, var(--gold-soft) 0%, var(--surface) 100%)",
          border: "1px solid var(--gold)",
        }}
      >
        <div style={{ fontSize: 11, color: "var(--gold-ink)", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", textAlign: "center" }}>
          ¡Acertaste el campeón!
        </div>
        <ChampionReveal teamName={campeonReal} Flag={Flag} code={code} size={120} />
        <div style={{ textAlign: "center", marginTop: 4, fontSize: 13, color: "var(--ink-2)" }}>
          +{finalRound?.fase?.pts_exacto ?? 0} pts asegurados
        </div>
      </Card>
    );
  }

  return (
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
            {campeonReal ? "Campeón del torneo" : "Tu campeón"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            {campeonReal ? (
              <>
                <Flag code={code(campeonReal)} w={26} h={18} rounded={3} />
                <span style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{campeonReal}</span>
                {campeonPred && (
                  <span style={{ marginLeft: 6, fontSize: 11, color: "var(--ink-3)" }}>
                    (tú pronosticaste {campeonPred})
                  </span>
                )}
              </>
            ) : campeonPred ? (
              <>
                <Flag code={code(campeonPred)} w={26} h={18} rounded={3} />
                <span style={{ fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>{campeonPred}</span>
              </>
            ) : (
              <span style={{ fontSize: 14, color: "var(--ink-3)" }}>
                Pronostica el partido final para definirlo.
              </span>
            )}
          </div>
        </div>
      </div>
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
        <span>+{finalRound?.fase?.pts_exacto ?? 0} pts si aciertas</span>
        <span>Final · {finalMatch.equipo_local} vs {finalMatch.equipo_visitante}</span>
      </div>
    </Card>
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
              <MatchCard key={`empty-${i}`} variant="bracket" />
            ))
          : round.matches.map((m) => (
              <MatchCard key={m.id} variant="bracket" match={m} pred={predicciones[m.id]} />
            ))}
      </div>
    </div>
  );
}
