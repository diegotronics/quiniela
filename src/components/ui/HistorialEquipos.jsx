import { Flag } from "./Flag.jsx";
import { code } from "@/lib/constants";
import { resumenEquipo, caraACara } from "@/lib/historial";

// Contexto para pronosticar: cómo llega cada equipo según los partidos que ya
// jugó en el torneo (racha, balance y goles) más el cara a cara entre ambos.
// Todo se deriva de los resultados ya cargados; si ninguno de los dos equipos
// ha jugado todavía, el componente no renderiza nada para no estorbar.
//
// `compacto` reduce el espaciado para usarlo dentro del asistente de
// predicciones, donde el espacio vertical es valioso.
export function HistorialEquipos({
  equipoLocal,
  equipoVisitante,
  partidos,
  excluirId,
  compacto = false,
}) {
  const local = resumenEquipo(equipoLocal, partidos, { excluirId });
  const visitante = resumenEquipo(equipoVisitante, partidos, { excluirId });
  const h2h = caraACara(equipoLocal, equipoVisitante, partidos, { excluirId });

  if (local.jugados === 0 && visitante.jugados === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compacto ? 8 : 10,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-xl)",
        padding: compacto ? 12 : 14,
        textAlign: "left",
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: 600,
          color: "var(--ink-3)",
        }}
      >
        Cómo llegan
      </div>

      <FilaEquipo equipo={equipoLocal} resumen={local} />
      <div style={{ height: 1, background: "var(--line)" }} />
      <FilaEquipo equipo={equipoVisitante} resumen={visitante} />

      {h2h.length > 0 && (
        <>
          <div style={{ height: 1, background: "var(--line)" }} />
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-3)",
              lineHeight: 1.4,
            }}
          >
            <span style={{ fontWeight: 600 }}>Cara a cara: </span>
            {h2h.map((j, i) => (
              <span key={j.id}>
                {i > 0 ? " · " : ""}
                {j.gf}
                {"–"}
                {j.gc}
                {j.porPenales ? ` (${j.avanzoPorPenales ? "ganó" : "perdió"} por penales)` : ""}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Una línea por equipo: bandera + nombre a la izquierda, racha y balance a la
// derecha.
function FilaEquipo({ equipo, resumen }) {
  if (resumen.jugados === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Flag code={code(equipo)} w={22} h={16} rounded={3} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", flex: 1 }}>
          {equipo}
        </span>
        <span style={{ fontSize: 12, color: "var(--ink-4)" }}>Sin partidos aún</span>
      </div>
    );
  }
  // Los 5 partidos más recientes, mostrados en orden cronológico (el último
  // jugado queda a la derecha), como una guía de forma.
  const racha = resumen.partidos.slice(0, 5).reverse();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Flag code={code(equipo)} w={22} h={16} rounded={3} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {equipo}
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 1 }}>
          {resumen.ganados}G {resumen.empatados}E {resumen.perdidos}P · {resumen.golesFavor}:
          {resumen.golesContra}
        </div>
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {racha.map((j) => (
          <ChipResultado key={j.id} letra={j.letra} />
        ))}
      </div>
    </div>
  );
}

const COLOR_RESULTADO = {
  G: { bg: "var(--accent-soft)", fg: "var(--accent-ink)" },
  E: { bg: "var(--gold-soft)", fg: "var(--gold-ink)" },
  P: { bg: "var(--coral-soft)", fg: "var(--coral-ink)" },
};

function ChipResultado({ letra }) {
  const c = COLOR_RESULTADO[letra] || COLOR_RESULTADO.E;
  return (
    <span
      aria-hidden
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        background: c.bg,
        color: c.fg,
        fontSize: 10,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {letra}
    </span>
  );
}
