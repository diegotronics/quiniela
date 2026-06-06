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
// Apuesta especial "Sorpresa del Mundial": selección revelación + hasta
// qué fase llega. Se guarda como un único texto canónico para que el
// cálculo de puntos del servidor (comparación case-insensitive) coincida
// con el resultado oficial que carga el admin.
// ------------------------------------------------------------
export const SORPRESA_FASES = [
  "Octavos de final",
  "Cuartos de final",
  "Semifinal",
  "Final",
];

const SORPRESA_SEP = " — ";

// Construye el valor canónico: "Selección — Fase". Devuelve "" si falta algo.
export function formatSorpresa(equipo, fase) {
  if (!equipo || !fase) return "";
  return `${equipo}${SORPRESA_SEP}${fase}`;
}

// Descompone un valor guardado en { equipo, fase }. Tolera datos antiguos
// en texto libre (sin separador): los devuelve como `equipo` y `fase` vacía.
export function parseSorpresa(value) {
  if (!value) return { equipo: "", fase: "" };
  const idx = value.indexOf(SORPRESA_SEP);
  if (idx === -1) return { equipo: value.trim(), fase: "" };
  return {
    equipo: value.slice(0, idx).trim(),
    fase: value.slice(idx + SORPRESA_SEP.length).trim(),
  };
}
