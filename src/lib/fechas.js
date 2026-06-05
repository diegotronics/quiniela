// Toda la app muestra fechas y horas en horario de Venezuela, sin importar
// la zona del dispositivo del usuario.
const TZ = "America/Caracas";

const HORA_FMT = new Intl.DateTimeFormat("es-VE", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true });
const DIA_FMT = new Intl.DateTimeFormat("es-VE", { timeZone: TZ, day: "2-digit", month: "2-digit" });

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function toDate(value) {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function partes(d, opts) {
  return new Intl.DateTimeFormat("es-VE", { timeZone: TZ, ...opts })
    .formatToParts(d)
    .reduce((acc, p) => ((acc[p.type] = p.value), acc), {});
}

// "Mié 5 Jun · 8:00 pm" en horario de Venezuela. Acepta ISO string o Date.
export function formatearFechaHora(value) {
  const d = toDate(value);
  if (!d) return "";
  const p = partes(d, {
    weekday: "short", day: "numeric", month: "short",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
  const dia = cap((p.weekday || "").replace(".", ""));
  const mes = cap((p.month || "").replace(".", ""));
  const periodo = (p.dayPeriod || "").replace(/[.\s]/g, "").toLowerCase();
  return `${dia} ${p.day} ${mes} · ${p.hour}:${p.minute} ${periodo}`;
}

// "8:00 pm" en horario de Venezuela.
export function formatearHoraCorta(value) {
  const d = toDate(value);
  if (!d) return "";
  const p = partes(d, { hour: "numeric", minute: "2-digit", hour12: true });
  const periodo = (p.dayPeriod || "").replace(/[.\s]/g, "").toLowerCase();
  return `${p.hour}:${p.minute} ${periodo}`;
}

// "Miércoles 5 Jun" en horario de Venezuela. Para agrupar partidos por día.
export function formatearDiaLargo(value) {
  const d = toDate(value);
  if (!d) return "Sin fecha";
  const p = partes(d, { weekday: "long", day: "numeric", month: "short" });
  return `${cap(p.weekday)} ${p.day} ${cap((p.month || "").replace(".", ""))}`;
}

// "YYYY-MM-DD" del instante, calculado en horario de Venezuela.
export function fechaYmdCaracas(value = new Date()) {
  const d = toDate(value);
  if (!d) return "";
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  })
    .formatToParts(d)
    .reduce((acc, x) => ((acc[x.type] = x.value), acc), {});
  return `${p.year}-${p.month}-${p.day}`;
}

function esMismoDia(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function formatearHora(iso) {
  if (!iso) return "";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";

  const ahora = new Date();
  const ayer = new Date(ahora);
  ayer.setDate(ayer.getDate() - 1);

  const hora = HORA_FMT.format(fecha);
  if (esMismoDia(fecha, ahora)) return hora;
  if (esMismoDia(fecha, ayer)) return `ayer ${hora}`;
  return `${DIA_FMT.format(fecha)} ${hora}`;
}
