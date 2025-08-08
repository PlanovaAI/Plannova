// src/components/Homepage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { claimLock } from "../lib/sessionLock";
import logo from "../assets/logo.png";

export default function Homepage() {
  const navigate = useNavigate();

  // Uncontrolled inputs to avoid autofill persistence
  const emailRef = useRef(null);
  const passRef  = useRef(null);

  const [seed] = useState(() => Math.random().toString(36).slice(2, 8));
  const emailName = useMemo(() => `email_${seed}`, [seed]);
  const passName  = useMemo(() => `pass_${seed}`,  [seed]);

  useEffect(() => {
    const clear = () => {
      if (emailRef.current) emailRef.current.value = "";
      if (passRef.current)  passRef.current.value  = "";
    };
    clear();
    const t = setTimeout(clear, 200);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = emailRef.current?.value?.trim() || "";
    const password = passRef.current?.value || "";
    if (!email || !password) return;

    // 1) Supabase sign-in
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      return;
    }

    // 2) Try to claim single-session lock; if blocked, just show message and stay here.
    const lock = await claimLock();
    if (!lock.ok) {
      // IMPORTANT: do NOT signOut here. We want the existing (first) session to keep running.
      alert("This account is already active on another device/tab. Please finish there or wait a couple of minutes.");
      // optional: clear only the password
      if (passRef.current) passRef.current.value = "";
      return;
    }

    // 3) Proceed to app
    if (emailRef.current) emailRef.current.value = "";
    if (passRef.current)  passRef.current.value  = "";
    navigate("/orders");
  };

  return (
    <div style={{ fontFamily: "Segoe UI", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "3rem" }}>
      <img src={logo} alt="Plannova Logo" style={{ width: 220, marginBottom: "1.5rem" }} />
      <h2 style={{ marginBottom: 8 }}>Welcome to Plannova</h2>
      <p style={{ marginTop: 0, color: "#666" }}>Intelligent Planning System</p>

      <form
        onSubmit={handleLogin}
        autoComplete="off"
        style={{ width: 300, background: "#f9f9f9", padding: "1rem", borderRadius: 8, border: "1px solid #ddd", marginTop: "1rem" }}
      >
        {/* dummy traps for autofill */}
        <input type="text" name="username" autoComplete="username" style={{ display: "none" }} />
        <input type="password" name="password" autoComplete="current-password" style={{ display: "none" }} />

        <input
          ref={emailRef}
          type="email"
          name={emailName}
          placeholder="Email"
          autoComplete="off"
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          ref={passRef}
          type="password"
          name={passName}
          placeholder="Password"
          autoComplete="new-password"
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />

        <button
          type="submit"
          style={{ width: "100%", padding: 10, background: "#007bff", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
