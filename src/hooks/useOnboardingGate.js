import { useCallback, useMemo } from "react";
import {
  TOTAL_PARTIDOS_GRUPOS,
  countPredicciones,
  fuePospuestoEnSesion,
  marcarPospuestoEnSesion,
} from "@/lib/onboarding";

// Decide si el usuario debe ser redirigido al wizard de onboarding.
// Regla: tiene <72 picks Y no pospuso en esta sesión de navegador.
export function useOnboardingGate(userId, predicciones, prediccionesLoading) {
  const totalPicks = useMemo(
    () => countPredicciones(predicciones || {}),
    [predicciones],
  );

  const completado = totalPicks >= TOTAL_PARTIDOS_GRUPOS;
  const pospuesto = fuePospuestoEnSesion(userId);

  const shouldRedirect =
    !!userId && !prediccionesLoading && !completado && !pospuesto;

  const dismissForSession = useCallback(() => {
    marcarPospuestoEnSesion(userId);
  }, [userId]);

  return {
    shouldRedirect,
    totalPicks,
    completado,
    pospuesto,
    dismissForSession,
  };
}
