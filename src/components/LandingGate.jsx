import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function LandingGate() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      setReady(true);
    })();
  }, []);

  if (!ready) return <div style={{ padding: "2rem", fontFamily: "Segoe UI" }}>Please wait…</div>;
  return hasSession ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}
