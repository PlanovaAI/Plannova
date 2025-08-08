import React from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";

// Keep this storageKey in sync with supabaseClient (default Supabase key also works)
const STORAGE_KEYS = [
  "plannova-auth",                         // if you set custom storageKey
  "sb-AuthToken",                          // legacy
  // default pattern (v2): sb-<anon-key>-auth-token — we can't know anon key here,
  // so just detecting any sb-*-auth-token in localStorage:
];

function hasSupabaseToken() {
  // quick scan to avoid flicker: if a token exists, treat as "loading" not "logged out"
  for (const k of Object.keys(localStorage)) {
    if (k === "plannova-auth") return true;
    if (/^sb-.*-auth-token$/.test(k)) return true;
  }
  return false;
}

export default function PrivateRoute({ children }) {
  const session = useSession(); // undefined=loading, null=logged out, object=session

  // If we have no session yet but there is a token in storage, auth is hydrating → wait.
  if (session === undefined || (session === null && hasSupabaseToken())) {
    return null; // or a small spinner
  }

  if (session === null) {
    return <Navigate to="/" replace />;
  }

  return children;
}
