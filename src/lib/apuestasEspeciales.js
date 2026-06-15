// Lógica compartida del estado de edición de las apuestas especiales.
//
// El admin puede forzar el estado manualmente con `abierta_manual`, lo
// que tiene prioridad sobre la fecha de cierre:
//   - true  -> abiertas (ignora `cierra_en`)
//   - false -> cerradas (ignora `cierra_en`)
//   - null  -> automático: se respeta `cierra_en`
export function apuestasEspecialesCerradas(config, ahora = Date.now()) {
  if (!config) return false
  if (config.abierta_manual === true) return false
  if (config.abierta_manual === false) return true
  if (!config.cierra_en) return false
  return new Date(config.cierra_en).getTime() <= ahora
}
