// Texto descriptivo por fase para la pantalla de "Fases".
// Los puntos por fase viven en la tabla `fases` (columnas pts_exacto/pts_ganador)
// y el cálculo se hace en el trigger SQL `recalcular_puntos_por_partido`.
export const FASES_INFO = {
  grupos:        "48 equipos · 12 grupos · 72 partidos · Jun 11–24",
  dieciseisavos: "32 equipos · 16 partidos · Jun 28 – Jul 3",
  octavos:       "16 equipos · 8 partidos · Jul 4–7",
  cuartos:       "8 equipos · 4 partidos · Jul 9–11",
  semifinal:     "4 equipos · 2 partidos · Jul 14–15",
  tercerpuesto:  "Bronce · 1 partido · Jul 18 · Miami",
  final:         "1 partido · Jul 19 · MetLife Stadium, Nueva York",
};

// Nombres en español a códigos ISO-3 (usados por el componente <Flag/>).
export const COUNTRY_CODE = {
  "México": "MEX", "Argentina": "ARG", "Brasil": "BRA", "España": "ESP", "Francia": "FRA",
  "Alemania": "GER", "Italia": "ITA", "Portugal": "POR", "Holanda": "NED", "Países Bajos": "NED",
  "Bélgica": "BEL", "Croacia": "CRO", "Inglaterra": "ENG", "EEUU": "USA", "Estados Unidos": "USA",
  "Canadá": "CAN", "Uruguay": "URU", "Colombia": "COL", "Ecuador": "ECU", "Chile": "CHI",
  "Japón": "JPN", "Corea del Sur": "KOR", "Senegal": "SEN", "Marruecos": "MAR", "Dinamarca": "DEN",
  "Suiza": "SUI", "Polonia": "POL", "Camerún": "CMR", "Escocia": "SCO", "Australia": "AUS",
  "Honduras": "HON", "Perú": "PER", "Paraguay": "PAR", "Turquía": "TUR", "Ucrania": "UKR",
  "Austria": "AUT", "Arabia Saudita": "SAU", "Nigeria": "NGA", "Costa de Marfil": "CIV", "Ghana": "GHA",
  "Costa Rica": "CRC", "Panamá": "PAN", "Jamaica": "JAM", "Venezuela": "VEN", "Suecia": "SWE",
  "Noruega": "NOR", "Finlandia": "FIN", "Islandia": "ISL", "Serbia": "SRB", "Irán": "IRN",
  "Qatar": "QAT", "Irak": "IRQ", "Jordania": "JOR",
  // Equipos añadidos para el sorteo real del Mundial 2026
  "Sudáfrica": "RSA", "Chequia": "CZE", "Bosnia y Herzegovina": "BIH", "Haití": "HAI",
  "Curazao": "CUW", "Túnez": "TUN", "Egipto": "EGY", "Nueva Zelanda": "NZL",
  "Cabo Verde": "CPV", "Argelia": "ALG", "RD Congo": "COD", "Uzbekistán": "UZB",
};

export function code(equipo) {
  return COUNTRY_CODE[equipo] || "XXX";
}

// Conserva el helper legacy `flag()` por si algún componente todavía espera emoji.
export const FLAGS = {
  "México": "🇲🇽", "EEUU": "🇺🇸", "Canadá": "🇨🇦", "Honduras": "🇭🇳",
  "España": "🇪🇸", "Francia": "🇫🇷", "Portugal": "🇵🇹", "Marruecos": "🇲🇦",
  "Brasil": "🇧🇷", "Argentina": "🇦🇷", "Colombia": "🇨🇴", "Ecuador": "🇪🇨",
  "Alemania": "🇩🇪", "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Italia": "🇮🇹", "Bélgica": "🇧🇪",
  "Holanda": "🇳🇱", "Turquía": "🇹🇷", "Ucrania": "🇺🇦", "Austria": "🇦🇹",
  "Japón": "🇯🇵", "Corea del Sur": "🇰🇷", "Australia": "🇦🇺", "Arabia Saudita": "🇸🇦",
  "Senegal": "🇸🇳", "Nigeria": "🇳🇬", "Costa de Marfil": "🇨🇮", "Ghana": "🇬🇭",
  "Uruguay": "🇺🇾", "Chile": "🇨🇱", "Perú": "🇵🇪", "Paraguay": "🇵🇾",
  "Suiza": "🇨🇭", "Dinamarca": "🇩🇰", "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Serbia": "🇷🇸",
  "Irán": "🇮🇷", "Qatar": "🇶🇦", "Irak": "🇮🇶", "Jordania": "🇯🇴",
  "Costa Rica": "🇨🇷", "Panamá": "🇵🇦", "Jamaica": "🇯🇲", "Venezuela": "🇻🇪",
  "Suecia": "🇸🇪", "Noruega": "🇳🇴", "Finlandia": "🇫🇮", "Islandia": "🇮🇸",
  "Sudáfrica": "🇿🇦", "Chequia": "🇨🇿", "Bosnia y Herzegovina": "🇧🇦", "Haití": "🇭🇹",
  "Curazao": "🇨🇼", "Túnez": "🇹🇳", "Egipto": "🇪🇬", "Nueva Zelanda": "🇳🇿",
  "Cabo Verde": "🇨🇻", "Argelia": "🇩🇿", "RD Congo": "🇨🇩", "Uzbekistán": "🇺🇿",
};

export function flag(equipo) {
  return FLAGS[equipo] || "🏳";
}

// Nombre del grupo familiar (placeholder; podría salir de un campo de configuración).
export const GROUP_NAME = "La Copa Familiar";
export const GROUP_MOTTO = "Mundial 2026";

// Selecciones clasificadas al Mundial 2026 (48 equipos del sorteo oficial).
// Lista mantenida en sincronía con supabase/09_partidos_reales_mundial_2026.sql.
// Se usa en el desplegable de Apuestas especiales (Campeón / Subcampeón).
export const TEAMS_MUNDIAL_2026 = [
  "Alemania", "Arabia Saudita", "Argelia", "Argentina", "Australia",
  "Austria", "Bélgica", "Bosnia y Herzegovina", "Brasil", "Cabo Verde",
  "Canadá", "Chequia", "Colombia", "Corea del Sur", "Costa de Marfil",
  "Croacia", "Curazao", "Ecuador", "EEUU", "Egipto",
  "Escocia", "España", "Francia", "Ghana", "Haití",
  "Holanda", "Inglaterra", "Irak", "Irán", "Japón",
  "Jordania", "Marruecos", "México", "Noruega", "Nueva Zelanda",
  "Panamá", "Paraguay", "Portugal", "Qatar", "RD Congo",
  "Senegal", "Sudáfrica", "Suecia", "Suiza", "Túnez",
  "Turquía", "Uruguay", "Uzbekistán",
];

// ------------------------------------------------------------
// Apuesta especial "Se queda en semifinales": el jugador elige un equipo
// que llegará a semifinales pero no a la final, es decir, que termina 3.º o
// 4.º. El resultado oficial son los dos perdedores de las semifinales; el
// jugador acierta si su equipo es cualquiera de los dos. Ambos se guardan en
// un único texto canónico separados por SEMIFINAL_SEP para que el cálculo de
// puntos del servidor (comparación case-insensitive) coincida.
// ------------------------------------------------------------
export const SEMIFINAL_SEP = " · ";

// Formato anterior de la apuesta "Sorpresa" ("Equipo — Fase"), que se tolera
// al precargar picks viejos en el nuevo selector de un solo equipo.
const SORPRESA_SEP = " — ";

// Combina los dos semifinalistas eliminados en el valor canónico. Devuelve ""
// si no hay ninguno.
export function formatSemifinalistas(a, b) {
  return [a, b]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(SEMIFINAL_SEP);
}

// Descompone un resultado oficial guardado en la lista de equipos.
export function parseSemifinalistas(value) {
  if (!value) return [];
  return value
    .split(SEMIFINAL_SEP)
    .map((s) => s.trim())
    .filter(Boolean);
}

// True si el pick del jugador (un equipo) coincide con alguno de los
// semifinalistas eliminados del resultado oficial.
export function aciertaSemifinalista(pick, oficial) {
  if (!pick || !oficial) return false;
  const p = pick.toString().trim().toLowerCase();
  return parseSemifinalistas(oficial).some((t) => t.toLowerCase() === p);
}

// Extrae solo el nombre del equipo de un pick, tolerando el formato anterior
// "Equipo — Fase", para precargarlo en el selector de un solo equipo.
export function soloEquipoSemifinalista(value) {
  if (!value) return "";
  return value.split(SORPRESA_SEP)[0].split(SEMIFINAL_SEP)[0].trim();
}
