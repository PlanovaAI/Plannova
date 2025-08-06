// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://okgrmvwxeizlxeytfckf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZ3Jtdnd4ZWl6bHhleXRmY2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MDg3MDUsImV4cCI6MjA2NTE4NDcwNX0.uRm9SR_-2uIB5Giye4feVKz-WNDkFxNF4r397UxKCfU"; // use your full anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
