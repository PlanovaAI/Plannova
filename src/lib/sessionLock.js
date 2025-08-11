// src/lib/sessionLock.js
import { supabase } from "../supabaseClient";

let hbTimer;

export async function claimLock() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return { ok: false, reason: "no-session" };

  const user_id = session.user.id;
  const session_id = session.access_token;

  const { error } = await supabase
    .from("user_session_locks")
    .upsert(
      { user_id, session_id, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) return { ok: false, reason: error.message };

  startHeartbeat(user_id, session_id);
  return { ok: true };
}

function startHeartbeat(user_id, session_id) {
  stopHeartbeat();
  hbTimer = setInterval(async () => {
    await supabase
      .from("user_session_locks")
      .update({ session_id, updated_at: new Date().toISOString() })
      .eq("user_id", user_id);
  }, 30_000);
}

export function stopHeartbeat() {
  if (hbTimer) clearInterval(hbTimer);
  hbTimer = undefined;
}

/**
 * Release the lock BEFORE signOut. If delete fails (rare), force-expire it.
 */
export async function releaseLock() {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return;

  // Try delete
  const del = await supabase.from("user_session_locks").delete().eq("user_id", userId);
  if (del.error) {
    // Fallback: mark it stale so next login isn’t blocked
    const old = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    await supabase.from("user_session_locks").update({ updated_at: old }).eq("user_id", userId);
  }
}
