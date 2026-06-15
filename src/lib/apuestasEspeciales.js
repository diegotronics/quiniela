// Lógica compartida del estado de edición de las apuestas especiales.
//
// El admin puede forzar el estado manualmente con `abierta_manual`, lo
// que tiene prioridad sobre la fecha de cierre:
//   - true  -> abiertas (ignora `cierra_en`)
//   - false -> cerradas (ignora `cierra_en`)
//   - null  -> automático: se respeta `cierra_en`
//
// IMPORTANTE: esta regla debe mantenerse en paridad con la del servidor en
// la función `bloquear_apuesta_tardia()` (supabase/15_apuestas_apertura_manual.sql),
// que es la que realmente bloquea la escritura. Si cambias una, cambia la otra.
export function apuestasEspecialesCerradas(config, ahora = Date.now()) {
  if (!config) return false
  if (config.abierta_manual === true) return false
  if (config.abierta_manual === false) return true
  if (!config.cierra_en) return false
  return new Date(config.cierra_en).getTime() <= ahora
}
