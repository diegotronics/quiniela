import { Outlet } from "react-router-dom";

export default function MainApp() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      <Outlet />
    </div>
  );
}
