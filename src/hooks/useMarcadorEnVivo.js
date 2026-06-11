import { useEffect, useState } from "react";
import { ESPN_SCOREBOARD_URL, mapTeam } from "@/lib/equiposEspn";

// Cada cuánto se consulta el marcador mientras hay un partido en vivo.
const POLL_MS = 60 * 1000;

// YYYYMMDD en UTC, formato que espera el parámetro `dates` de ESPN.
function fmtFecha(ms) {
  return new Date(ms).toISOString().slice(0, 10).replace(/-/g, "");
}

// Busca en los eventos de ESPN el que corresponde al partido de nuestra BD,
// cruzando por nombre de equipos (en cualquier orientación, por si la fuente
// invierte local/visitante).
function buscarEvento(events, partido) {
  for (const ev of events || []) {
    const comp = ev.competitions?.[0];
    if (!comp) continue;
    const competitors = comp.competitors || [];
    const home = competitors.find((c) => c.homeAway === "home");
    const away = competitors.find((c) => c.homeAway === "away");
    if (!home || !away) continue;

    const homeEs = mapTeam(home.team?.displayName);
    const awayEs = mapTeam(away.team?.displayName);

    if (homeEs === partido.equipo_local && awayEs === partido.equipo_visitante) {
      return { comp, local: home, visitante: away };
    }
    if (homeEs === partido.equipo_visitante && awayEs === partido.equipo_local) {
      return { comp, local: away, visitante: home };
    }
  }
  return null;
}

/**
 * Marcador en tiempo real de un partido "en vivo", consultado directamente
 * al scoreboard público de ESPN (la misma fuente que /api/sync-partidos).
 *
 * Devuelve `{ marcador }` donde marcador es
 * `{ golesLocal, golesVisitante, minuto, finalizado }` o `null` mientras no
 * haya datos (antes del saque, sin red, o si ESPN no reconoce el partido).
 */
export function useMarcadorEnVivo(partido) {
  const [marcador, setMarcador] = useState(null);
  const partidoId = partido?.id;
  const equipoLocal = partido?.equipo_local;
  const equipoVisitante = partido?.equipo_visitante;
  const fecha = partido?.fecha;

  useEffect(() => {
    setMarcador(null);
    if (!partidoId || !equipoLocal || !equipoVisitante) return;

    let cancelado = false;
    let timer = null;

    // Rango de ±1 día alrededor del partido para esquivar diferencias de
    // zona horaria en cómo ESPN agrupa los eventos por fecha.
    const base = fecha ? new Date(fecha).getTime() : Date.now();
    const dia = 24 * 60 * 60 * 1000;
    const url = `${ESPN_SCOREBOARD_URL}?dates=${fmtFecha(base - dia)}-${fmtFecha(base + dia)}`;

    const consultar = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        if (cancelado) return;

        const hit = buscarEvento(
          json.events,
          { equipo_local: equipoLocal, equipo_visitante: equipoVisitante },
        );
        if (!hit) return;

        const estado = hit.comp.status?.type?.state; // 'pre' | 'in' | 'post'
        if (estado !== "in" && estado !== "post") return;

        const golesLocal = hit.local.score == null ? null : Number(hit.local.score);
        const golesVisitante =
          hit.visitante.score == null ? null : Number(hit.visitante.score);
        if (Number.isNaN(golesLocal) || Number.isNaN(golesVisitante)) return;

        const finalizado = estado === "post";
        // displayClock viene como "67'" o "45'+2'"; LiveBadge agrega su propio apóstrofo.
        const clock = hit.comp.status?.displayClock;
        const minuto =
          !finalizado && typeof clock === "string" && clock.trim()
            ? clock.replace(/'/g, "").trim()
            : null;

        setMarcador({ golesLocal, golesVisitante, minuto, finalizado });
        if (finalizado && timer) {
          clearInterval(timer);
          timer = null;
        }
      } catch {
        // Sin red o ESPN caído: se conserva el último marcador conocido.
      }
    };

    consultar();
    timer = setInterval(consultar, POLL_MS);
    return () => {
      cancelado = true;
      if (timer) clearInterval(timer);
    };
  }, [partidoId, equipoLocal, equipoVisitante, fecha]);

  return { marcador };
}
