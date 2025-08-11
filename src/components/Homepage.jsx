// src/components/Homepage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Homepage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg("❌ " + error.message);
    } else {
      setErrorMsg("");
      navigate("/orders");
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      fontFamily: "Segoe UI",
      background: "#f4f6f8",
      padding: "2rem",
      textAlign: "center"
    }}>
      {/* You can replace this with an <img src={logo} /> if needed */}
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        👋 Welcome to Plannova
      </h1>
      <p style={{ marginBottom: "2rem", fontSize: "1rem" }}>
        Your intelligent production planning dashboard
      </p>

      <form
        onSubmit={handleLogin}
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          width: "300px"
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>🔐 Login</h3>

        {errorMsg && (
          <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem" }}>
            {errorMsg}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.6rem",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          🔓 Login
        </button>
      </form>
    </div>
  );
}
