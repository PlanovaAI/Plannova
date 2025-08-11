// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { startSessionLock } from "../sessionLock";
import logo from "../assets/Plannova2.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;

      const r = await startSessionLock();          // ⬅️ claim strict single-session
      if (!r.ok) {
        await supabase.auth.signOut();
        setErr("This account is already active on another device/tab. Please log out there or try again later.");
        return;
      }

      navigate("/orders", { replace: true });
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={cardOuter}>
        <img src={logo} alt="Plannova" style={{ height: 64, objectFit: "contain", marginBottom: 8 }}
             onError={(ev) => (ev.currentTarget.style.display = "none")} />
        <h1 style={title}>👋 Welcome to Plannova</h1>
        <p style={subtitle}>Your intelligent production planning assistant. Log in to access your orders.</p>

        <form onSubmit={onSubmit} style={formCard}>
          <label style={label}>Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
                 required style={input} autoComplete="email" />

          <label style={label}>Password</label>
          <input type="password" value={pass} onChange={(e)=>setPass(e.target.value)}
                 required style={input} autoComplete="current-password" />

          {err && <div style={errorBox}>❌ {err}</div>}

          <button type="submit" disabled={busy} style={button}>
            <span style={{ marginRight: 8 }}>🔒</span>{busy ? "Logging in…" : "Log In"}
          </button>
        </form>

        <div style={footer}>
          <strong>Powered by Plannova AI</strong><br />
          <em>Intelligent planning at work</em><br />
          v1.0.0
        </div>
      </div>
    </div>
  );
}

/* -------- styles -------- */
const wrap = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f8ff", padding: "1.5rem", fontFamily: "Segoe UI, system-ui, Arial" };
const cardOuter = { width: "100%", maxWidth: 420, textAlign: "center" };
const title = { margin: "4px 0 2px", fontSize: "1.6rem", fontWeight: 700, color: "#111827" };
const subtitle = { margin: "0 0 18px", color: "#4b5563", fontSize: "0.95rem" };
const formCard = { margin: "0 auto", maxWidth: 420, textAlign: "left", background: "white", border: "1px solid #d6e3ff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 4px 18px rgba(17,24,39,0.06)" };
const label = { display: "block", margin: "10px 0 6px", fontSize: "0.9rem", color: "#111827" };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #cdd9f0", borderRadius: 10, fontSize: "0.95rem", background: "#eef4ff", outline: "none" };
const errorBox = { marginTop: 10, marginBottom: 6, color: "crimson", fontSize: "0.9rem" };
const button = { marginTop: 14, width: "100%", padding: "12px 14px", border: "1px solid #1d4ed8", background: "#2563eb", color: "white", borderRadius: 10, fontSize: "1rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };
const footer = { marginTop: 16, fontSize: "0.8rem", color: "#555" };
