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
// invierte local/visitante). Exportada para poder probarla.
export function buscarEvento(events, partido) {
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

// Nombre más compacto disponible para un goleador (apellido si ESPN lo trae).
function nombreGoleador(at) {
  return at?.shortName || at?.displayName || at?.fullName || null;
}

/**
 * Goleadores de un partido a partir del array `details` del scoreboard de
 * ESPN, separados por equipo. Cada gol queda atribuido al equipo cuyo marcador
 * sube (el `team` de la jugada), así que la lista siempre cuadra con el
 * resultado; los autogoles y penales se marcan aparte. Exportada para tests.
 */
export function extraerGoleadores(comp, local, visitante) {
  const vacio = { local: [], visitante: [] };
  const details = comp?.details;
  if (!Array.isArray(details)) return vacio;

  const localId = local?.id ?? local?.team?.id;
  const visitanteId = visitante?.id ?? visitante?.team?.id;
  const golesLocal = [];
  const golesVisitante = [];

  for (const d of details) {
    if (!d?.scoringPlay) continue;
    const nombre = nombreGoleador(d.athletesInvolved?.[0]);
    if (!nombre) continue;

    const tipo = (d.type?.text || "").toLowerCase();
    // displayValue viene como "23'" o "45'+2'"; se guarda sin apóstrofo.
    const minuto =
      typeof d.clock?.displayValue === "string" && d.clock.displayValue.trim()
        ? d.clock.displayValue.replace(/'/g, "").trim()
        : null;
    const gol = {
      nombre,
      minuto,
      penal: Boolean(d.penaltyKick) || tipo.includes("penalty"),
      autogol: Boolean(d.ownGoal) || tipo.includes("own goal"),
    };

    const teamId = d.team?.id;
    if (teamId != null && String(teamId) === String(visitanteId)) {
      golesVisitante.push(gol);
    } else {
      golesLocal.push(gol);
    }
  }

  return { local: golesLocal, visitante: golesVisitante };
}

/**
 * Marcador en tiempo real de un partido "en vivo", consultado directamente
 * al scoreboard público de ESPN (la misma fuente que /api/sync-partidos).
 *
 * Devuelve `{ marcador }` donde marcador es
 * `{ golesLocal, golesVisitante, minuto, medioTiempo, finalizado, goleadores }`
 * (con `goleadores = { local, visitante }`) o `null` mientras no haya datos
 * (antes del saque, sin red, o si ESPN no reconoce el partido).
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
        const medioTiempo =
          hit.comp.status?.type?.name === "STATUS_HALFTIME";
        // displayClock viene como "67'" o "45'+2'"; LiveBadge agrega su propio apóstrofo.
        const clock = hit.comp.status?.displayClock;
        const minuto =
          !finalizado && !medioTiempo && typeof clock === "string" && clock.trim()
            ? clock.replace(/'/g, "").trim()
            : null;

        const goleadores = extraerGoleadores(hit.comp, hit.local, hit.visitante);

        setMarcador({
          golesLocal,
          golesVisitante,
          minuto,
          medioTiempo,
          finalizado,
          goleadores,
        });
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
