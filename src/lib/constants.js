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
  final:         "🌎 1 partido · Jul 19 · MetLife Stadium, Nueva York",
};

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
