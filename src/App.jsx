import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MainApp from "./pages/MainApp.jsx";
import Admin from "./pages/Admin.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function Protected({ children, adminOnly }) {
  const { user, loaded } = useAuth();
  if (!loaded) return null;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && !user.es_admin) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route
        path="/app"
        element={
          <Protected>
            <MainApp />
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <Protected adminOnly>
            <Admin />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
