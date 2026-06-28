import { useCallback, useMemo } from "react";
import {
  countPrediccionesDe,
  fuePospuestoEnSesion,
  marcarPospuestoEnSesion,
} from "@/lib/onboarding";

// Decide si el usuario debe ser redirigido al wizard de onboarding.
// Regla: le faltan pronósticos de la fase de grupos Y no pospuso en esta
// sesión de navegador. El progreso se mide sobre los partidos reales de grupos
// (no contra un total fijo ni mezclando eliminatorias) para que la compuerta
// coincida con lo que el asistente y el banner consideran "completo".
export function useOnboardingGate(
  userId,
  predicciones,
  prediccionesLoading,
  partidosGrupos,
  partidosLoading,
) {
  const total = (partidosGrupos || []).length;
  const totalPicks = useMemo(
    () => countPrediccionesDe(partidosGrupos, predicciones || {}),
    [partidosGrupos, predicciones],
  );

  const cargando = prediccionesLoading || partidosLoading;
  // Sin partidos de grupos cargados aún no se puede decidir: ni completo ni
  // redirigible hasta tener los datos.
  const completado = total > 0 && totalPicks >= total;
  const pospuesto = fuePospuestoEnSesion(userId);

  const shouldRedirect =
    !!userId && !cargando && total > 0 && !completado && !pospuesto;

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
