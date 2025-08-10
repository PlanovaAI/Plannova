import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

function isLocked() {
  const until = Number(sessionStorage.getItem("routeLockUntil") || 0);
  return Date.now() < until;
}

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [tick, setTick] = useState(0);           // 👈 add
  const location = useLocation();

  useEffect(() => {
    let sub;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      setLoading(false);
      sub = supabase.auth.onAuthStateChange((_e, s) => setHasSession(!!s)).data.subscription;
    })();
    return () => sub?.unsubscribe();
  }, [location.pathname]);

  // 👇 keep re-rendering while locked so it releases
  useEffect(() => {
    if (!isLocked()) return;
    const t = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(t);
  }, [location.pathname]);

  if (loading || isLocked()) return <div style={{ padding: "2rem", fontFamily: "Segoe UI" }}>Please wait…</div>;
  if (!hasSession) return <Navigate to="/login" replace />;
  return children;
}
