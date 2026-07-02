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

function norm(s) {
  return (s || '').toString().trim().toLowerCase()
}

// Un pick acierta el resultado oficial con la misma regla que la función de
// scoring del servidor (calcular_puntos_apuesta_especial): comparación
// insensible a mayúsculas y espacios extremos. Falso si falta el pick o si el
// resultado oficial aún no está cargado.
export function aciertoEspecial(pick, oficial) {
  if (!pick || !oficial) return false
  return norm(pick) === norm(oficial)
}

// Filas de la vista pública "Apuestas del grupo": una por miembro (el admin
// no juega y se excluye), cada una con su apuesta si existe. Los miembros sin
// apuesta también se listan: que se vea quién no apostó es parte de la
// transparencia. Con resultados oficiales cargados ordena por puntos
// obtenidos; sin resultados (o en empate), alfabético por nombre.
export function apuestasGrupoRows(usuarios, apuestas, hayResultados = false) {
  const byUsuario = new Map((apuestas || []).map((a) => [a.usuario_id, a]))
  const rows = (usuarios || [])
    .filter((u) => !u.es_admin)
    .map((u) => ({ usuario: u, apuesta: byUsuario.get(u.id) || null }))
  const nombre = (r) => (r.usuario.nombre || '').toLowerCase()
  rows.sort((a, b) => {
    if (hayResultados) {
      const pa = a.apuesta?.puntos_obtenidos || 0
      const pb = b.apuesta?.puntos_obtenidos || 0
      if (pb !== pa) return pb - pa
    }
    return nombre(a).localeCompare(nombre(b), 'es')
  })
  return rows
}
