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
};

export function flag(equipo) {
  return FLAGS[equipo] || "🏳";
}

// Mock data — picadas/chat (no hay tabla todavía, visible en MatchDetail).
export const MOCK_CHAT = [
  { who_short: "María", text: "¡Vamos México! Pronosticando 2-0", t: "14:32", reacts: [{ e: "😂", n: 4 }] },
  { who_short: "Carlos", text: "Esta vez sí, papá. Nuevo entrenador, nueva era", t: "14:33" },
  { who_short: "Roberto", text: "Veré cómo te recupero el postre.", t: "14:35", reacts: [{ e: "🔥", n: 3 }] },
  { who_short: "Diego", text: "Yo voy con un 1-1 conservador.", t: "14:40" },
];

// Nombre del grupo familiar (placeholder; podría salir de un campo de configuración).
export const GROUP_NAME = "La Copa Familiar";
export const GROUP_MOTTO = "Mundial 2026";
