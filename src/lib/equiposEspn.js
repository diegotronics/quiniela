// Mapeo compartido entre el frontend y /api/sync-partidos.js para cruzar
// los equipos que devuelve ESPN (en inglés) con los nombres de nuestra BD.

export const ESPN_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

// Mapeo de nombres de ESPN (inglés) → nombres en nuestra BD (español).
// Las claves van normalizadas (lowercase + sin acentos + sin guiones).
export const TEAM_MAP = {
  mexico: "México",
  "south africa": "Sudáfrica",
  "south korea": "Corea del Sur",
  czechia: "Chequia",
  canada: "Canadá",
  "bosnia herzegovina": "Bosnia y Herzegovina",
  qatar: "Qatar",
  switzerland: "Suiza",
  brazil: "Brasil",
  morocco: "Marruecos",
  haiti: "Haití",
  scotland: "Escocia",
  "united states": "EEUU",
  usa: "EEUU",
  paraguay: "Paraguay",
  australia: "Australia",
  turkey: "Turquía",
  turkiye: "Turquía",
  germany: "Alemania",
  curacao: "Curazao",
  "ivory coast": "Costa de Marfil",
  "cote d ivoire": "Costa de Marfil",
  ecuador: "Ecuador",
  netherlands: "Holanda",
  japan: "Japón",
  sweden: "Suecia",
  tunisia: "Túnez",
  belgium: "Bélgica",
  egypt: "Egipto",
  iran: "Irán",
  "new zealand": "Nueva Zelanda",
  spain: "España",
  "cape verde": "Cabo Verde",
  "cabo verde": "Cabo Verde",
  "saudi arabia": "Arabia Saudita",
  uruguay: "Uruguay",
  france: "Francia",
  senegal: "Senegal",
  iraq: "Irak",
  norway: "Noruega",
  argentina: "Argentina",
  algeria: "Argelia",
  austria: "Austria",
  jordan: "Jordania",
  portugal: "Portugal",
  "dr congo": "RD Congo",
  "congo dr": "RD Congo",
  "democratic republic of the congo": "RD Congo",
  "democratic republic of congo": "RD Congo",
  uzbekistan: "Uzbekistán",
  colombia: "Colombia",
  england: "Inglaterra",
  croatia: "Croacia",
  ghana: "Ghana",
  panama: "Panamá",
};

export function normalize(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita diacríticos combinantes
    .toLowerCase()
    .replace(/[-_'.]/g, " ") // unifica separadores
    .replace(/\s+/g, " ")
    .trim();
}

export function mapTeam(apiName) {
  const key = normalize(apiName);
  return TEAM_MAP[key] || apiName;
}
