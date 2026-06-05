// Derivación de stats de usuario a partir de predicciones y partidos.
import { fechaYmdCaracas } from "./fechas";

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

// Partido "en vivo" — el más reciente sin resultado de hoy/ayer.
export function partidoEnVivo(partidos) {
  // "Hoy" según el horario de Venezuela (la fecha del partido ya está en
  // hora local de Venezuela, así que su porción YYYY-MM-DD es comparable).
  const ymd = fechaYmdCaracas(new Date());
  return (partidos || [])
    .filter((p) => !p.resultado_ingresado && (p.fecha || "").slice(0, 10) === ymd)
    .sort((a, b) => ts(a.fecha) - ts(b.fecha))[0];
}

// Carga partidos de varias fases en paralelo.
export async function listPartidosByFases(faseIds, listPartidosByFase) {
  const all = await Promise.all(faseIds.map((id) => listPartidosByFase(id)));
  return all.flat();
}
