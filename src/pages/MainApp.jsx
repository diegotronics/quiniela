import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import { useOnboardingGate } from "@/hooks/useOnboardingGate";
import { useSyncResultadosPendientes } from "@/hooks/useAutoSyncResultado";
import { useAsync } from "@/hooks/useAsync";
import { listPartidosGrupos } from "@/api/partidos";

export default function MainApp() {
  const { user } = useAuth();
  const location = useLocation();
  const { predicciones, loading } = usePrediccionesUsuario(user?.id);
  // La compuerta mide el progreso del onboarding sobre los partidos reales de
  // grupos, así que necesita esa lista para no usar un total fijo.
  const { data: partidosGrupos, loading: loadingGrupos } = useAsync(
    listPartidosGrupos,
    [],
  );
  const { shouldRedirect } = useOnboardingGate(
    user?.id,
    predicciones,
    loading,
    partidosGrupos,
    loadingGrupos,
  );

  // Rutina de fondo: al abrir la app (en cualquier ruta) y al volver al
  // primer plano, sincroniza los resultados que hayan quedado pendientes.
  useSyncResultadosPendientes();

  // El admin es una cuenta netamente de administración: no juega ni pronostica,
  // así que nunca se le envía al onboarding de predicciones.
  const esAdmin = !!user?.es_admin;
  const enOnboarding = location.pathname === "/app/onboarding";

  if (loading || loadingGrupos) {
    return <div style={{ minHeight: "100vh", background: "var(--bg)" }} />;
  }

  if (!esAdmin && shouldRedirect && !enOnboarding) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      <Outlet />
    </div>
  );
}
