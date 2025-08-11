// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://okgrmvwxeizlxeytfckf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZ3Jtdnd4ZWl6bHhleXRmY2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MDg3MDUsImV4cCI6MjA2NTE4NDcwNX0.uRm9SR_-2uIB5Giye4feVKz-WNDkFxNF4r397UxKCfU";

// ✅ Ensure SINGLETON across Vite HMR / multiple imports
const globalKey = "__PLANNOVA_SUPABASE__";

export const supabase =
  globalThis[globalKey] ||
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "plannova-auth", // custom key to avoid collisions
    },
  });

if (!globalThis[globalKey]) {
  globalThis[globalKey] = supabase;
  console.log("✅ Supabase client created once.");
} else {
  console.log("♻️ Reusing existing Supabase client (HMR).");
}
