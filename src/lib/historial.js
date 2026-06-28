// Historial de cada equipo dentro del torneo. No hay una fuente externa de
// datos históricos: el contexto se deriva de los partidos que ya tienen
// resultado cargado en la propia base de datos. A medida que avanza el
// Mundial, cada selección acumula su racha (ganados, empatados, perdidos) y
// sus goles a favor y en contra, que es justo lo que ayuda a pronosticar el
// siguiente cruce.

// Un partido cuenta para el historial cuando ya tiene resultado oficial.
function tieneResultado(p) {
  return (
    p &&
    p.resultado_ingresado &&
    p.goles_local != null &&
    p.goles_visitante != null
  );
}

// Resultado de un partido visto desde la óptica de `equipo`: goles a favor,
// goles en contra y la letra G/E/P según el marcador. Devuelve null si el
// equipo no jugó ese partido.
function desdeEquipo(equipo, p) {
  let gf;
  let gc;
  let esLocal;
  if (p.equipo_local === equipo) {
    gf = p.goles_local;
    gc = p.goles_visitante;
    esLocal = true;
  } else if (p.equipo_visitante === equipo) {
    gf = p.goles_visitante;
    gc = p.goles_local;
    esLocal = false;
  } else {
    return null;
  }
  // G ganó, P perdió, E empató (en el marcador).
  const letra = gf > gc ? "G" : gf < gc ? "P" : "E";
  const rival = esLocal ? p.equipo_visitante : p.equipo_local;
  // Empate resuelto por penales: indicamos si este equipo fue el que avanzó.
  const porPenales = gf === gc && !!p.ganador;
  return {
    id: p.id,
    fecha: p.fecha,
    fase_id: p.fase_id,
    grupo: p.grupo,
    rival,
    esLocal,
    gf,
    gc,
    letra,
    porPenales,
    avanzoPorPenales: porPenales && p.ganador === equipo,
  };
}

// Resumen del historial de un equipo: los partidos que ya jugó (más recientes
// primero), su balance y sus goles. `excluirId` evita contar el propio partido
// que se está pronosticando. Devuelve siempre un objeto, con `partidos: []`
// cuando el equipo aún no ha jugado.
export function resumenEquipo(equipo, partidos, { excluirId } = {}) {
  const vacio = {
    equipo,
    jugados: 0,
    ganados: 0,
    empatados: 0,
    perdidos: 0,
    golesFavor: 0,
    golesContra: 0,
    partidos: [],
  };
  if (!equipo || !Array.isArray(partidos)) return vacio;

  const jugados = partidos
    .filter((p) => p.id !== excluirId && tieneResultado(p))
    .map((p) => desdeEquipo(equipo, p))
    .filter(Boolean)
    // Más recientes primero.
    .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));

  const r = { ...vacio, partidos: jugados, jugados: jugados.length };
  for (const j of jugados) {
    r.golesFavor += j.gf;
    r.golesContra += j.gc;
    if (j.letra === "G") r.ganados += 1;
    else if (j.letra === "E") r.empatados += 1;
    else r.perdidos += 1;
  }
  return r;
}

// Enfrentamientos previos entre dos equipos dentro del torneo (más recientes
// primero). Sirve para el "cara a cara" del detalle del partido.
export function caraACara(equipoA, equipoB, partidos, { excluirId } = {}) {
  if (!equipoA || !equipoB || !Array.isArray(partidos)) return [];
  return partidos
    .filter(
      (p) =>
        p.id !== excluirId &&
        tieneResultado(p) &&
        ((p.equipo_local === equipoA && p.equipo_visitante === equipoB) ||
          (p.equipo_local === equipoB && p.equipo_visitante === equipoA)),
    )
    .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")))
    .map((p) => desdeEquipo(equipoA, p));
}

// True si hay algo de historial que mostrar para alguno de los dos equipos.
export function hayHistorial(equipoLocal, equipoVisitante, partidos, opts) {
  return (
    resumenEquipo(equipoLocal, partidos, opts).jugados > 0 ||
    resumenEquipo(equipoVisitante, partidos, opts).jugados > 0
  );
}
