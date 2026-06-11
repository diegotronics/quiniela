// Derivación de stats de usuario a partir de predicciones y partidos.

// Marca de tiempo (ms) de una fecha ISO; las inválidas van al final.
function ts(fecha) {
  const t = fecha ? new Date(fecha).getTime() : NaN;
  return Number.isNaN(t) ? Infinity : t;
}

export function rankingFromUsers(usuarios, predicciones) {
  const totales = new Map();
  for (const p of predicciones) {
    totales.set(p.usuario_id, (totales.get(p.usuario_id) || 0) + (p.puntos_obtenidos || 0));
  }
  return (usuarios || [])
    .filter((u) => !u.es_admin)
    .map((u) => ({ ...u, puntos: totales.get(u.id) || 0 }))
    .sort((a, b) => b.puntos - a.puntos)
    .map((u, i) => ({ ...u, rank: i + 1 }));
}

// Devuelve aciertos exactos, aciertos ganador y partidos jugados (con resultado).
export function userScoringStats(preds, partidos) {
  let exactos = 0;
  let ganador = 0;
  let jugados = 0;
  const byPartido = new Map((partidos || []).map((p) => [p.id, p]));
  for (const pr of preds || []) {
    const m = byPartido.get(pr.partido_id);
    if (!m || !m.resultado_ingresado) continue;
    jugados += 1;
    if (pr.goles_local == null || pr.goles_visitante == null) continue;
    const exacto =
      pr.goles_local === m.goles_local && pr.goles_visitante === m.goles_visitante;
    if (exacto) exactos += 1;
    const sigPred = Math.sign(pr.goles_local - pr.goles_visitante);
    const sigReal = Math.sign(m.goles_local - m.goles_visitante);
    if (sigPred === sigReal) ganador += 1;
  }
  return { exactos, ganador, jugados };
}

// Calcula la racha actual de aciertos (consecutivos correctos en partidos jugados).
export function userStreak(preds, partidos) {
  const byPartido = new Map((partidos || []).map((p) => [p.id, p]));
  const jugados = (preds || [])
    .map((pr) => ({ pr, m: byPartido.get(pr.partido_id) }))
    .filter(({ m }) => m && m.resultado_ingresado)
    .sort((a, b) => ts(a.m.fecha) - ts(b.m.fecha))
    .reverse();
  let streak = 0;
  for (const { pr, m } of jugados) {
    if (pr.goles_local == null || pr.goles_visitante == null) break;
    const sigPred = Math.sign(pr.goles_local - pr.goles_visitante);
    const sigReal = Math.sign(m.goles_local - m.goles_visitante);
    if (sigPred === sigReal) streak += 1;
    else break;
  }
  return streak;
}

// Predicciones pendientes por usuario: partidos en fases activas, sin
// resultado todavía y sin pronóstico del usuario. Usa el mismo criterio que
// `proximoPartido`, así que el conteo refleja lo que aún se puede pronosticar.
//
// `puntajes` es la lista global de predicciones ({ usuario_id, partido_id, ... }).
// Devuelve un Map usuario_id → cantidad pendiente y el total de partidos abiertos.
export function prediccionesPendientesByUsuario(usuarios, puntajes, partidos, fases) {
  const fasesActivas = new Set(
    (fases || []).filter((f) => f.estado === "activa").map((f) => f.id),
  );
  const abiertos = (partidos || []).filter(
    (p) => fasesActivas.has(p.fase_id) && !p.resultado_ingresado,
  );
  const total = abiertos.length;
  const abiertosIds = new Set(abiertos.map((p) => p.id));

  // Partidos abiertos ya pronosticados por cada usuario (sin duplicados).
  const hechasPorUsuario = new Map();
  for (const p of puntajes || []) {
    if (!abiertosIds.has(p.partido_id)) continue;
    let set = hechasPorUsuario.get(p.usuario_id);
    if (!set) {
      set = new Set();
      hechasPorUsuario.set(p.usuario_id, set);
    }
    set.add(p.partido_id);
  }

  const pendientes = new Map();
  for (const u of usuarios || []) {
    const hechas = hechasPorUsuario.get(u.id)?.size || 0;
    pendientes.set(u.id, Math.max(0, total - hechas));
  }
  return { pendientes, total };
}

// Próximo partido sin pronóstico (en una fase activa).
export function proximoPartido(partidos, predicciones, fases) {
  const fasesActivas = new Set(
    (fases || []).filter((f) => f.estado === "activa").map((f) => f.id),
  );
  return (partidos || [])
    .filter((p) => fasesActivas.has(p.fase_id) && !p.resultado_ingresado)
    .filter((p) => !predicciones[p.id] || predicciones[p.id].goles_local == null)
    .sort((a, b) => ts(a.fecha) - ts(b.fecha))[0];
}

// Ventana (ms) durante la cual un partido ya iniciado se considera "en vivo".
// Cubre los 90 minutos reglamentarios más descanso, descuentos y posibles
// prórrogas: ~2,5 horas. Pasado ese lapso, aunque no tenga resultado cargado,
// deja de mostrarse como en vivo.
const DURACION_EN_VIVO_MS = 150 * 60 * 1000;

// Partido "en vivo" — uno sin resultado cuyo horario de inicio ya pasó y que
// aún está dentro de la ventana de juego. No basta con que sea hoy: el partido
// tiene que haber comenzado.
export function partidoEnVivo(partidos) {
  const ahora = Date.now();
  return (partidos || [])
    .filter((p) => {
      if (p.resultado_ingresado) return false;
      const inicio = ts(p.fecha);
      if (!Number.isFinite(inicio)) return false;
      return inicio <= ahora && ahora - inicio <= DURACION_EN_VIVO_MS;
    })
    // El que comenzó más recientemente (mayor timestamp) va primero.
    .sort((a, b) => ts(b.fecha) - ts(a.fecha))[0];
}

// Carga partidos de varias fases en paralelo.
export async function listPartidosByFases(faseIds, listPartidosByFase) {
  const all = await Promise.all(faseIds.map((id) => listPartidosByFase(id)));
  return all.flat();
}
