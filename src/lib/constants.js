export const PUNTOS_POR_FASE = {
  grupos:        { exacto: 3,  ganador: 1 },
  dieciseisavos: { exacto: 4,  ganador: 2 },
  octavos:       { exacto: 5,  ganador: 2 },
  cuartos:       { exacto: 6,  ganador: 3 },
  semifinal:     { exacto: 8,  ganador: 4 },
  tercerpuesto:  { exacto: 6,  ganador: 3 },
  final:         { exacto: 15, ganador: 7 },
};

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

// Cuanto vale una prediccion comparada con el resultado real
export function calcularPuntos(faseId, pred, real) {
  if (
    pred == null ||
    real == null ||
    pred.goles_local == null ||
    pred.goles_visitante == null ||
    real.goles_local == null ||
    real.goles_visitante == null
  ) {
    return 0;
  }
  const pts = PUNTOS_POR_FASE[faseId];
  if (!pts) return 0;
  const exacto =
    pred.goles_local === real.goles_local &&
    pred.goles_visitante === real.goles_visitante;
  if (exacto) return pts.exacto;

  const signo = (a, b) => (a > b ? 1 : a < b ? -1 : 0);
  if (signo(pred.goles_local, pred.goles_visitante) === signo(real.goles_local, real.goles_visitante)) {
    return pts.ganador;
  }
  return 0;
}
