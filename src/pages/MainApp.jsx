import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePrediccionesUsuario } from "@/hooks/usePredicciones";
import { useOnboardingGate } from "@/hooks/useOnboardingGate";

export default function MainApp() {
  const { user } = useAuth();
  const location = useLocation();
  const { predicciones, loading } = usePrediccionesUsuario(user?.id);
  const { shouldRedirect } = useOnboardingGate(user?.id, predicciones, loading);

  // El admin es una cuenta netamente de administración: no juega ni pronostica,
  // así que nunca se le envía al onboarding de predicciones.
  const esAdmin = !!user?.es_admin;
  const enOnboarding = location.pathname === "/app/onboarding";

  if (loading) {
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
