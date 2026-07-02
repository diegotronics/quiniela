// Derivación de stats de usuario a partir de predicciones y partidos.

import { partidoAbierto } from "./pronosticos";

// Marca de tiempo (ms) de una fecha ISO; las inválidas van al final.
function ts(fecha) {
  const t = fecha ? new Date(fecha).getTime() : NaN;
  return Number.isNaN(t) ? Infinity : t;
}

// Ranking de competencia: los empatados en puntos comparten la posición y la
// siguiente se salta (1, 1, 3). Es la regla oficial del reglamento; si el
// empate persiste al final en un puesto con premio, el premio se comparte.
// Entre empatados el orden de la lista es alfabético, solo para que la tabla
// no baile entre recargas: la posición mostrada es la misma para ambos.
export function rankingFromUsers(usuarios, predicciones) {
  const totales = new Map();
  for (const p of predicciones) {
    totales.set(p.usuario_id, (totales.get(p.usuario_id) || 0) + (p.puntos_obtenidos || 0));
  }
  const filas = (usuarios || [])
    .filter((u) => !u.es_admin)
    .map((u) => ({ ...u, puntos: totales.get(u.id) || 0 }))
    .sort(
      (a, b) =>
        b.puntos - a.puntos ||
        (a.nombre || "").localeCompare(b.nombre || "", "es"),
    );
  let rankAnterior = 0;
  let puntosAnterior = null;
  return filas.map((u, i) => {
    const rank = u.puntos === puntosAnterior ? rankAnterior : i + 1;
    rankAnterior = rank;
    puntosAnterior = u.puntos;
    return { ...u, rank };
  });
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

// Estadísticas de la familia para la tabla de posiciones. A partir de todas las
// predicciones (con goles) y de los partidos ya jugados, devuelve cuatro
// rankings:
//   - exactos:   marcadores exactos acertados por jugador.
//   - acertados: resultados (1/X/2) acertados por jugador.
//   - primero:   jornadas en las que el jugador quedó en primer lugar.
//   - ultimo:    jornadas en las que el jugador quedó en último lugar.
//
// Una "jornada" es un día de partidos (todos los que se juegan en la misma
// fecha de Caracas). Para cada jornada se suman los puntos de ese día por
// jugador; el o los de mayor puntaje suman "primero" y el o los de menor suman
// "ultimo". Solo cuentan las jornadas con al menos dos participantes y con
// diferencia de puntos (si todos empatan no hay líder ni colero). Reutiliza el
// `puntos_obtenidos` que ya calculó el trigger de la BD.
export function familyScoreboard(usuarios, predicciones, partidos) {
  const jugadores = (usuarios || []).filter((u) => !u.es_admin);
  const idsValidos = new Set(jugadores.map((u) => u.id));
  const byPartido = new Map((partidos || []).map((p) => [p.id, p]));

  const exactos = new Map();
  const acertados = new Map();

  // Día de Caracas (ya viene en el offset de la fecha ISO) de cada partido jugado.
  const diaDePartido = new Map();
  for (const m of partidos || []) {
    if (m.resultado_ingresado && m.fecha) {
      diaDePartido.set(m.id, String(m.fecha).slice(0, 10));
    }
  }

  // jornada (día) → Map(usuario_id → puntos de ese día)
  const puntosPorJornada = new Map();

  for (const pr of predicciones || []) {
    if (!idsValidos.has(pr.usuario_id)) continue;
    if (pr.goles_local == null || pr.goles_visitante == null) continue;
    const m = byPartido.get(pr.partido_id);
    if (!m || !m.resultado_ingresado) continue;

    const exacto =
      pr.goles_local === m.goles_local && pr.goles_visitante === m.goles_visitante;
    const acierto =
      Math.sign(pr.goles_local - pr.goles_visitante) ===
      Math.sign(m.goles_local - m.goles_visitante);
    if (exacto) exactos.set(pr.usuario_id, (exactos.get(pr.usuario_id) || 0) + 1);
    if (acierto) acertados.set(pr.usuario_id, (acertados.get(pr.usuario_id) || 0) + 1);

    const dia = diaDePartido.get(pr.partido_id);
    if (!dia) continue;
    let porUsuario = puntosPorJornada.get(dia);
    if (!porUsuario) {
      porUsuario = new Map();
      puntosPorJornada.set(dia, porUsuario);
    }
    porUsuario.set(
      pr.usuario_id,
      (porUsuario.get(pr.usuario_id) || 0) + (pr.puntos_obtenidos || 0),
    );
  }

  const primero = new Map();
  const ultimo = new Map();
  let totalJornadas = 0;

  for (const porUsuario of puntosPorJornada.values()) {
    const valores = [...porUsuario.values()];
    if (valores.length < 2) continue;
    const max = Math.max(...valores);
    const min = Math.min(...valores);
    if (max === min) continue; // todos empatan: no hay líder ni colero
    totalJornadas += 1;
    for (const [uid, pts] of porUsuario) {
      if (pts === max) primero.set(uid, (primero.get(uid) || 0) + 1);
      if (pts === min) ultimo.set(uid, (ultimo.get(uid) || 0) + 1);
    }
  }

  const ranking = (conteo) =>
    jugadores
      .map((u) => ({
        id: u.id,
        nombre: u.nombre,
        valor: conteo.get(u.id) || 0,
      }))
      .sort((a, b) => b.valor - a.valor);

  return {
    exactos: ranking(exactos),
    acertados: ranking(acertados),
    primero: ranking(primero),
    ultimo: ranking(ultimo),
    totalJornadas,
  };
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

// Predicciones pendientes por usuario: partidos aún abiertos para pronosticar
// (sin resultado y a más de una hora del saque) sin pronóstico del usuario.
// Usa el mismo criterio que `proximoPartido`, así que el conteo refleja lo que
// aún se puede pronosticar.
//
// `puntajes` es la lista global de predicciones ({ usuario_id, partido_id, ... }).
// Devuelve un Map usuario_id → cantidad pendiente y el total de partidos abiertos.
export function prediccionesPendientesByUsuario(usuarios, puntajes, partidos, ahora = Date.now()) {
  const abiertos = (partidos || []).filter((p) => partidoAbierto(p, ahora));
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

// Próximo partido sin pronóstico que aún sigue abierto (a más de una hora del
// saque y sin resultado).
export function proximoPartido(partidos, predicciones, ahora = Date.now()) {
  return (partidos || [])
    .filter((p) => partidoAbierto(p, ahora))
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

// Partidos destacados de la sección "en vivo". Puede haber varios a la vez
// cuando dos o más comienzan en horarios solapados. Mientras están en juego se
// muestran todos en vivo (ordenados del más reciente al más antiguo). Cuando
// ninguno está en juego, el último que terminó se mantiene como "Finalizado"
// hasta que comience el próximo partido del calendario, que lo reemplaza.
export function partidosEnVivo(partidos, ahora = Date.now()) {
  const empezados = (partidos || [])
    .filter((p) => {
      const inicio = ts(p.fecha);
      return Number.isFinite(inicio) && inicio <= ahora;
    })
    // El que comenzó más recientemente (mayor timestamp) va primero.
    .sort((a, b) => ts(b.fecha) - ts(a.fecha));

  // Todos los que siguen en juego: la sección muestra una tarjeta por cada uno.
  const enJuego = empezados.filter((p) => !partidoTerminado(p, ahora));
  if (enJuego.length) return enJuego;

  // Ninguno en juego: el último en terminar sigue destacado hasta que arranque
  // el siguiente partido, o hasta agotar la ventana si era el último del torneo.
  const ultimo = empezados[0];
  if (!ultimo) return [];
  const hayProximo = (partidos || []).some((p) => ts(p.fecha) > ahora);
  if (hayProximo || ahora - ts(ultimo.fecha) <= VENTANA_FINALIZADO_MS) {
    return [ultimo];
  }
  return [];
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
