import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Global (module-level) subscription so HMR doesn't create multiple listeners
let subscribed = false;

function initGlobalAuthBroadcast() {
  if (subscribed) return;
  subscribed = true;

  // Emit current session once at startup
  supabase.auth.getSession().then(({ data }) => {
    const ev = new CustomEvent("plannova-session", { detail: data?.session ?? null });
    window.dispatchEvent(ev);
  });

  // Listen for future changes and broadcast to all hooks
  supabase.auth.onAuthStateChange((_event, session) => {
    const ev = new CustomEvent("plannova-session", { detail: session ?? null });
    window.dispatchEvent(ev);
  });
}

export function useSession() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    initGlobalAuthBroadcast();

    const handler = (e) => setSession(e.detail);
    window.addEventListener("plannova-session", handler);

    // Kick a fresh check in case we mounted mid-flight
    supabase.auth.getSession().then(({ data }) => {
      setSession((prev) => (prev === undefined ? (data?.session ?? null) : prev));
    });

    return () => window.removeEventListener("plannova-session", handler);
  }, []);

  return session;
}
