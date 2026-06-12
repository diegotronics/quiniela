import { useEffect, useRef } from "react";
import { resultadosPendientes } from "@/lib/stats";
import { listPartidosSinResultado } from "@/api/partidos";

// Evento global que anuncia que se pidió una sincronización de resultados.
// Las páginas con datos en pantalla (Inicio) lo escuchan para refrescar.
const EVENTO_SYNC = "lcf:resultados-sincronizados";

// Re-armado de la verificación "al abrir": cuando la app vuelve al primer
// plano (una PWA puede vivir días en memoria sin recargar) se revisa de
// nuevo, pero nunca más seguido que esto.
const COOLDOWN_CLIENTE_MS = 5 * 60 * 1000;

// Guards a nivel de módulo: sobreviven a remontajes de componentes dentro
// de la misma carga de página.
let ultimaVerificacion = 0;
const finalesIntentados = new Set();

// Solo para tests: limpia los guards entre casos.
export function _resetSyncState() {
  ultimaVerificacion = 0;
  finalesIntentados.clear();
}

// Pide al servidor que sincronice resultados desde ESPN. El cliente nunca
// aporta goles —solo "toca el timbre"— así que nadie puede falsear un
// resultado. El endpoint tiene cooldown propio: si varios familiares
// disparan a la vez, solo la primera llamada sincroniza y el resto recibe
// 429; en ambos casos se anuncia el evento para que la UI refresque.
async function dispararSync() {
  try {
    await fetch("/api/sync-partidos", { method: "POST" });
  } catch {
    // Sin red o en desarrollo local (sin /api): se reintentará en el
    // próximo regreso al primer plano.
  }
  window.dispatchEvent(new CustomEvent(EVENTO_SYNC));
}

/**
 * Rutina de fondo montada en MainApp: al abrir la app —y cada vez que
 * vuelve al primer plano, respetando el cooldown— consulta qué partidos ya
 * se jugaron sin resultado en la BD y, si hay alguno, pide la
 * sincronización. La consulta es barata (id y fecha de los partidos sin
 * resultado) y corre en cualquier ruta de /app, no solo en el Home.
 */
export function useSyncResultadosPendientes() {
  useEffect(() => {
    let desmontado = false;

    const verificar = async () => {
      const ahora = Date.now();
      if (ahora - ultimaVerificacion < COOLDOWN_CLIENTE_MS) return;
      ultimaVerificacion = ahora;
      try {
        const sinResultado = await listPartidosSinResultado();
        if (desmontado) return;
        if (resultadosPendientes(sinResultado).length > 0) {
          await dispararSync();
        }
      } catch {
        // Sin red: liberar el cooldown para reintentar al volver online.
        ultimaVerificacion = 0;
      }
    };

    verificar();
    const onVisible = () => {
      if (document.visibilityState === "visible") verificar();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      desmontado = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}

/**
 * Final en vivo: cuando el polling del marcador detecta que ESPN dio el
 * partido por terminado y la BD aún no tiene el resultado, lo guarda de
 * inmediato sin esperar a que alguien reabra la app. Un intento por
 * partido por sesión.
 */
export function useAutoSyncFinalEnVivo(live, marcador) {
  const partidoId = live?.id;
  const finalEnVivo = Boolean(
    live && !live.resultado_ingresado && marcador?.finalizado,
  );

  useEffect(() => {
    if (!finalEnVivo || !partidoId) return;
    if (finalesIntentados.has(partidoId)) return;
    finalesIntentados.add(partidoId);
    dispararSync();
  }, [finalEnVivo, partidoId]);
}

/**
 * Suscripción al anuncio de sincronización: las páginas que muestran
 * partidos o puntajes refrescan sus datos cuando ocurre, sin importar qué
 * componente la disparó.
 */
export function useOnResultadosSincronizados(callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = () => callbackRef.current?.();
    window.addEventListener(EVENTO_SYNC, handler);
    return () => window.removeEventListener(EVENTO_SYNC, handler);
  }, []);
}
