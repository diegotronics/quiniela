const HORA_FMT = new Intl.DateTimeFormat("es", { hour: "numeric", minute: "2-digit", hour12: true });
const DIA_FMT = new Intl.DateTimeFormat("es", { day: "2-digit", month: "2-digit" });

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
