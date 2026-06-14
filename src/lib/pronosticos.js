// Cierre de pronósticos por partido.
//
// El pronóstico de cada partido se cierra una hora antes del saque. A partir
// de ese instante ocurren dos cosas al mismo tiempo:
//   1) ya no puedes editar tu pronóstico, y
//   2) los pronósticos del resto de la familia se hacen visibles.
//
// No hay ningún estado guardado ni proceso programado: el cierre se deriva
// comparando la hora del partido contra el reloj actual en el momento de leer
// (interfaz) o de escribir (trigger en la base de datos).

// Margen de cierre: una hora antes del saque.
export const MARGEN_CIERRE_MS = 60 * 60 * 1000;

// Instante (ms) en que se cierra el pronóstico de un partido: su saque menos
// una hora. Devuelve null si la fecha falta o es inválida.
export function instanteCierre(fecha) {
  if (!fecha) return null;
  const t = new Date(fecha).getTime();
  return Number.isFinite(t) ? t - MARGEN_CIERRE_MS : null;
}

// Un partido está cerrado para pronosticar cuando ya tiene resultado cargado o
// cuando falta menos de una hora para el saque. En ese mismo momento los
// pronósticos ajenos pasan a ser visibles.
export function pronosticoCerrado(partido, ahora = Date.now()) {
  if (!partido) return false;
  if (partido.resultado_ingresado) return true;
  const cierre = instanteCierre(partido.fecha);
  return cierre != null && ahora >= cierre;
}

// Un partido sigue abierto para pronosticar: sin resultado y aún falta más de
// una hora para el saque.
export function partidoAbierto(partido, ahora = Date.now()) {
  return !pronosticoCerrado(partido, ahora);
}

// Códigos con los que la base de datos rechaza un pronóstico ya cerrado.
const CODIGOS_CIERRE = ["PRONOSTICO_CERRADO", "PARTIDO_INICIADO", "PARTIDO_CERRADO"];

// True si el error proviene del cierre del pronóstico (partido cerrado por
// tiempo o con resultado cargado), no de un fallo de red u otro problema.
export function esErrorCierre(error) {
  const msg = String(error?.message || error);
  return CODIGOS_CIERRE.some((c) => msg.includes(c));
}
