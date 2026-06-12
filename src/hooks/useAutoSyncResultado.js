import { useEffect, useRef } from "react";

// Cuando el polling del marcador en vivo detecta que el partido terminó
// (estado "post" de ESPN) y la BD todavía no tiene el resultado oficial,
// dispara /api/sync-partidos. El servidor baja el marcador de ESPN por su
// cuenta (el cliente nunca aporta goles, así nadie puede falsear un
// resultado) y el trigger de la BD reparte los puntos en la misma
// transacción. Al terminar se invoca `onSincronizado` para refrescar
// partidos y puntajes.
//
// El endpoint tiene cooldown: si varios familiares lo disparan a la vez,
// solo la primera llamada sincroniza y el resto recibe 429 — por eso se
// refresca igual aunque la respuesta no sea 200. Se intenta una sola vez
// por partido por sesión; el cron nocturno queda como respaldo.
export function useAutoSyncResultado(partido, marcador, onSincronizado) {
  const intentadosRef = useRef(new Set());
  const partidoId = partido?.id;
  const pendiente = Boolean(
    partido && !partido.resultado_ingresado && marcador?.finalizado,
  );

  useEffect(() => {
    if (!pendiente || !partidoId) return;
    if (intentadosRef.current.has(partidoId)) return;
    intentadosRef.current.add(partidoId);

    let cancelado = false;
    (async () => {
      try {
        await fetch("/api/sync-partidos", { method: "POST" });
      } catch {
        // Sin red o en desarrollo local (sin /api): el cron lo cubre.
      }
      if (!cancelado) onSincronizado?.();
    })();
    return () => {
      cancelado = true;
    };
  }, [pendiente, partidoId, onSincronizado]);
}
