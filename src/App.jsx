import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { api } from "./lib/api.js";
import Login from "./pages/Login.jsx";
import Admin from "./pages/Admin.jsx";
import Invite from "./pages/Invite.jsx";

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    api("/auth/session").then(setSession).catch(() => setSession(null));
    const expire = () => setSession(null);
    window.addEventListener("auth:expired", expire);
    return () => window.removeEventListener("auth:expired", expire);
  }, []);

  if (session === undefined) return <div className="app-loading"><span className="water-loader"/><p>Menyiapkan ruangmu...</p></div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/invite/:slug" element={<Invite />} />
        <Route path="/login" element={session ? <Navigate to="/admin" replace /> : <Login onLogin={setSession} />} />
        <Route path="/admin/*" element={session ? <Admin session={session} onLogout={() => setSession(null)} /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={session ? "/admin" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
