// Utilidades del onboarding de predicciones de la fase de grupos.

export const TOTAL_PARTIDOS_GRUPOS = 72;

// Cierre de predicciones — 11 de junio de 2026, 11:00 AM (CDT, UTC-5).
// Coincide con el primer partido del Mundial (11 Jun).
export const FECHA_CIERRE = new Date("2026-06-11T11:00:00-05:00");

export const FECHA_CIERRE_TEXTO = "11 de junio a las 11:00 AM";

// Devuelve días, horas y minutos hasta el cierre. `urgente` = quedan <3 días.
// `vencido` = ya pasó la fecha de cierre.
export function formatCountdown(now = new Date()) {
  const diffMs = FECHA_CIERRE.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { dias: 0, horas: 0, minutos: 0, urgente: true, vencido: true };
  }
  const totalMin = Math.floor(diffMs / 60000);
  const dias = Math.floor(totalMin / (60 * 24));
  const horas = Math.floor((totalMin % (60 * 24)) / 60);
  const minutos = totalMin % 60;
  return { dias, horas, minutos, urgente: dias < 3, vencido: false };
}

export function countdownLabel(c) {
  if (c.vencido) return "Predicciones cerradas";
  if (c.dias > 0) return `Faltan ${c.dias} día${c.dias === 1 ? "" : "s"} · ${c.horas} h`;
  if (c.horas > 0) return `Faltan ${c.horas} h · ${c.minutos} min`;
  return `Faltan ${c.minutos} min`;
}

// Primer índice de un partido aún no predicho. Si todos están listos, devuelve length.
export function getNextUnpredictedIndex(partidos, predicciones) {
  for (let i = 0; i < partidos.length; i++) {
    const p = predicciones[partidos[i].id];
    if (!p || p.goles_local == null || p.goles_visitante == null) return i;
  }
  return partidos.length;
}

export function countPredicciones(predicciones) {
  let n = 0;
  for (const k in predicciones) {
    const p = predicciones[k];
    if (p && p.goles_local != null && p.goles_visitante != null) n++;
  }
  return n;
}

// Mensajes de aliento en hitos específicos (post-confirmación del partido N).
export const MILESTONES = {
  1:  { emoji: "🚀", texto: "¡Arrancaste! 71 más y tu quiniela queda lista." },
  10: { emoji: "🎯", texto: "10 listos. El grupo A casi cubierto, vas con todo." },
  20: { emoji: "💪", texto: "Casi un tercio del camino. Tu mano viene firme." },
  36: { emoji: "🔥", texto: "¡La mitad! De aquí en adelante todo es bajada." },
  50: { emoji: "⚡", texto: "Solo 22 más. Se nota que conoces el fútbol." },
  65: { emoji: "🏁", texto: "7 partidos para el final. No aflojes ahora." },
  72: { emoji: "🏆", texto: "¡Predicciones completas! Que ruede la pelota." },
};

// Sesión: si el usuario pulsa "Continuar después" no insistimos hasta que vuelva a abrir la app.
const SESSION_KEY_PREFIX = "quiniela_onb_pospuesto:";

export function marcarPospuestoEnSesion(userId) {
  if (!userId) return;
  try {
    sessionStorage.setItem(SESSION_KEY_PREFIX + userId, String(Date.now()));
  } catch { /* ignore */ }
}

export function fuePospuestoEnSesion(userId) {
  if (!userId) return false;
  try {
    return !!sessionStorage.getItem(SESSION_KEY_PREFIX + userId);
  } catch {
    return false;
  }
}

export function limpiarPospuesto(userId) {
  if (!userId) return;
  try {
    sessionStorage.removeItem(SESSION_KEY_PREFIX + userId);
  } catch { /* ignore */ }
}
