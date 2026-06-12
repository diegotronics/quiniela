import { useCallback, useEffect, useRef } from "react";
import { resultadosPendientes } from "@/lib/stats";

// Claves ya intentadas en esta carga de la página. Es un Set a nivel de
// módulo (no un ref) para que navegar entre pestañas y volver al Home no
// repita el disparo: una vez por sesión basta, el cron nocturno respalda.
const intentados = new Set();

// Solo para tests: limpia el guard entre casos.
export function _resetIntentados() {
  intentados.clear();
}

// Pide al servidor que sincronice resultados desde ESPN. El cliente nunca
// aporta goles —solo "toca el timbre"— así que nadie puede falsear un
// resultado. El endpoint tiene cooldown: si varios familiares disparan a la
// vez, solo la primera llamada sincroniza y el resto recibe 429.
async function dispararSync() {
  try {
    const res = await fetch("/api/sync-partidos", { method: "POST" });
    return res.ok;
  } catch {
    // Sin red o en desarrollo local (sin /api): el cron lo cubre.
    return false;
  }
}

/**
 * Rutina de sincronización automática de resultados. Dos disparadores:
 *
 *  1. Al abrir la app: si hay partidos que ya se jugaron pero cuyo resultado
 *     aún no está en la BD (nadie tenía la app abierta al pitazo final),
 *     se pide la sincronización de inmediato.
 *  2. Final en vivo: cuando el polling del marcador detecta que ESPN dio el
 *     partido por terminado, se guarda el resultado sin esperar al cron.
 *
 * En ambos casos el trigger de la BD reparte los puntos en la misma
 * transacción y luego se invoca `onSincronizado` para refrescar la UI
 * (también tras un 429, porque otro cliente pudo sincronizar primero).
 */
export function useAutoSyncResultados({
  partidos,
  live,
  marcador,
  onSincronizado,
}) {
  const onSincronizadoRef = useRef(onSincronizado);
  onSincronizadoRef.current = onSincronizado;

  const sincronizar = useCallback(async (clave) => {
    if (intentados.has(clave)) return;
    intentados.add(clave);
    await dispararSync();
    onSincronizadoRef.current?.();
  }, []);

  // 1) Al abrir la app: resultados que quedaron pendientes.
  const hayPendientes =
    (partidos?.length || 0) > 0 && resultadosPendientes(partidos).length > 0;
  useEffect(() => {
    if (hayPendientes) sincronizar("al-abrir");
  }, [hayPendientes, sincronizar]);

  // 2) Final del partido en vivo detectado por ESPN.
  const partidoId = live?.id;
  const finalEnVivo = Boolean(
    live && !live.resultado_ingresado && marcador?.finalizado,
  );
  useEffect(() => {
    if (finalEnVivo && partidoId) sincronizar(`final-${partidoId}`);
  }, [finalEnVivo, partidoId, sincronizar]);
}
