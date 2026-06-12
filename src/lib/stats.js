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
// prórrogas: ~2,5 horas.
const DURACION_EN_VIVO_MS = 150 * 60 * 1000;

// Tope para seguir mostrando un partido terminado cuando ya no quedan
// partidos por jugar (fin del torneo): un día y se despide la tarjeta.
const VENTANA_FINALIZADO_MS = 24 * 60 * 60 * 1000;

// Partido destacado de la sección "en vivo": el que comenzó más
// recientemente. Mientras está en juego se muestra en vivo; al terminar se
// mantiene (como "Finalizado") hasta que comience el próximo partido, que lo
// reemplaza automáticamente por ser el de inicio más reciente.
export function partidoEnVivo(partidos, ahora = Date.now()) {
  const ultimo = (partidos || [])
    .filter((p) => {
      const inicio = ts(p.fecha);
      return Number.isFinite(inicio) && inicio <= ahora;
    })
    // El que comenzó más recientemente (mayor timestamp) va primero.
    .sort((a, b) => ts(b.fecha) - ts(a.fecha))[0];
  if (!ultimo) return undefined;

  if (!partidoTerminado(ultimo, ahora)) return ultimo;

  // Terminado: sigue destacado hasta que arranque el siguiente partido del
  // calendario, o hasta agotar la ventana si era el último del torneo.
  const hayProximo = (partidos || []).some((p) => ts(p.fecha) > ahora);
  if (hayProximo || ahora - ts(ultimo.fecha) <= VENTANA_FINALIZADO_MS) {
    return ultimo;
  }
  return undefined;
}

// Un partido destacado se considera terminado cuando ya tiene resultado
// oficial o cuando agotó la ventana de juego en vivo. Si hay marcador en
// tiempo real disponible (ESPN), ese estado tiene la última palabra.
export function partidoTerminado(p, ahora = Date.now()) {
  if (!p) return false;
  if (p.resultado_ingresado) return true;
  return ahora - ts(p.fecha) > DURACION_EN_VIVO_MS;
}

// Partidos que ya se jugaron (agotaron la ventana en vivo) pero cuyo
// resultado todavía no está en la BD: los candidatos a sincronizar cuando
// alguien abre la app.
export function resultadosPendientes(partidos, ahora = Date.now()) {
  return (partidos || []).filter(
    (p) => !p.resultado_ingresado && partidoTerminado(p, ahora),
  );
}

// Carga partidos de varias fases en paralelo.
export async function listPartidosByFases(faseIds, listPartidosByFase) {
  const all = await Promise.all(faseIds.map((id) => listPartidosByFase(id)));
  return all.flat();
}
