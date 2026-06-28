import { Navigate, Route, Routes } from "react-router-dom";
import Login from "@/pages/Login.jsx";
import Register from "@/pages/Register.jsx";
import AceptarInvitacion from "@/pages/AceptarInvitacion.jsx";
import MainApp from "@/pages/MainApp.jsx";
import Inicio from "@/pages/Inicio.jsx";
import Partidos from "@/pages/Partidos.jsx";
import TablaFamiliar from "@/pages/TablaFamiliar.jsx";
import Perfil from "@/pages/Perfil.jsx";
import MatchDetail from "@/pages/MatchDetail.jsx";
import Chat from "@/pages/Chat.jsx";
import Onboarding from "@/pages/Onboarding.jsx";
import Predecir from "@/pages/Predecir.jsx";
import ApuestasEspeciales from "@/pages/ApuestasEspeciales.jsx";
import Admin from "@/pages/Admin.jsx";
import AdminMiembros from "@/pages/admin/AdminMiembros.jsx";
import AdminReglas from "@/pages/admin/AdminReglas.jsx";
import AdminPartidos from "@/pages/admin/AdminPartidos.jsx";
import UITestGallery from "@/pages/UITestGallery.jsx";
import InstallPrompt from "@/components/InstallPrompt.jsx";
import { useAuth } from "@/context/AuthContext";

function Protected({ children, adminOnly }) {
  const { user, loaded } = useAuth();
  if (!loaded) return null;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && !user.es_admin) return <Navigate to="/app/inicio" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/invitacion/:token" element={<AceptarInvitacion />} />
      <Route path="/dev/ui-test" element={<UITestGallery />} />

      <Route
        path="/app"
        element={
          <Protected>
            <MainApp />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/app/inicio" replace />} />
        <Route path="inicio" element={<Inicio />} />
        <Route path="bracket" element={<Navigate to="/app/partidos" replace />} />
        <Route path="partidos" element={<Partidos />} />
        <Route path="tabla" element={<TablaFamiliar />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="partido/:id" element={<MatchDetail />} />
        <Route path="chat" element={<Chat />} />
        <Route path="apuestas" element={<ApuestasEspeciales />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="predecir" element={<Predecir />} />
      </Route>

      <Route
        path="/admin"
        element={
          <Protected adminOnly>
            <Admin />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/admin/miembros" replace />} />
        <Route path="miembros" element={<AdminMiembros />} />
        <Route path="reglas" element={<AdminReglas />} />
        <Route path="partidos" element={<AdminPartidos />} />
      </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <InstallPrompt />
    </>
  );
}
