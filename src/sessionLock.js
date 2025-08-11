// src/sessionLock.js
import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabaseClient";

// ---- config ----
const IDLE_LIMIT_MS = 45 * 60 * 1000;     // 45 minutes inactivity -> auto logout
const HEARTBEAT_INTERVAL_MS = 60 * 1000;  // heartbeat every 60s

// ---- state ----
let sessionId = null;
let hbTimer = null;
let idleTimer = null;
let listenersBound = false;

// ---- helpers ----
function startIdleCountdown() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(autoLogoutForIdle, IDLE_LIMIT_MS);
}

function handleActivity() {
  startIdleCountdown();
}

async function autoLogoutForIdle() {
  try { await releaseSessionLock(); } catch {}
  try { await supabase.auth.signOut(); } catch {}
  window.location.replace("/login");
}

function bindActivityListeners() {
  if (listenersBound) return;
  ["click","keydown","mousemove","wheel","touchstart","touchmove"].forEach(evt =>
    window.addEventListener(evt, handleActivity, { passive: true })
  );
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && sessionId) {
      supabase.rpc("heartbeat", { p_session_id: sessionId }).catch(() => {});
    }
  });
  window.addEventListener("beforeunload", () => {
    releaseSessionLock();
  });
  listenersBound = true;
}

// ---- public API ----
export async function startSessionLock() {
  // fresh id per signed-in session
  sessionId = uuidv4();

  // 1) CLAIM FIRST (server blocks if another active session exists)
  const { data: ok, error } = await supabase.rpc("claim_session", { p_session_id: sessionId });
  if (error) throw error;
  if (!ok) {
    // failed claim -> make sure nothing is left locally
    await releaseSessionLock();
    return { ok: false };
  }

  // 2) After claim, start heartbeat & idle timer
  if (hbTimer) clearInterval(hbTimer);
  hbTimer = setInterval(async () => {
    try { await supabase.rpc("heartbeat", { p_session_id: sessionId }); } catch {}
  }, HEARTBEAT_INTERVAL_MS);

  bindActivityListeners();
  startIdleCountdown();

  return { ok: true };
}

export async function releaseSessionLock() {
  if (!sessionId) return;
  try { await supabase.rpc("release_session", { p_session_id: sessionId }); } catch {}
  if (hbTimer) clearInterval(hbTimer);
  if (idleTimer) clearTimeout(idleTimer);
  hbTimer = null;
  idleTimer = null;
  sessionId = null;
}
