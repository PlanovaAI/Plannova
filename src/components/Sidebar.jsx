// src/components/Sidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { releaseLock, stopHeartbeat } from "../lib/sessionLock";
import logo from "../assets/logo.png";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await releaseLock(); } catch {}
    stopHeartbeat();
    await supabase.auth.signOut();
    window.location.replace("/");
  };

  const btn = {
    display: "block",
    marginBottom: "0.75rem",
    padding: "0.35rem 0.6rem",
    background: "#fff",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: 5,
    cursor: "pointer",
    width: "100%",
    fontSize: "0.8rem",
    textAlign: "left",
    fontFamily: "Segoe UI",
  };

  return (
    <div style={{ width: 200, backgroundColor: "#e6f0ff", padding: "1rem", minHeight: "100vh", fontFamily: "Segoe UI" }}>
      <img src={logo} alt="Plannova Logo" style={{ width: 210, margin: "0 auto 1.5rem", display: "block" }} />

      <button style={btn} onClick={() => navigate("/new-order")}>➕ New Order</button>
      <button style={btn} onClick={() => navigate("/orders")}>📑 Orders List</button>
      <button style={btn} onClick={() => navigate("/completed-orders")}>✅ Completed Orders</button>
      <button style={btn} onClick={() => navigate("/products")}>🧾 Product Management</button>
      <button style={btn} onClick={() => navigate("/raw-material-intake")}>📥 Raw Material Intake</button>
      <button style={btn} onClick={() => navigate("/shift-production")}>🏭 Shift Production Entry</button>
      <button style={btn} onClick={() => navigate("/shift-production-list")}>📃 Shift End Records</button>
      <button style={btn} onClick={() => navigate("/material-usage-tracker")}>📦 Material Usage Tracker</button>
      <button style={btn} onClick={() => navigate("/wip-list")}>🔄 WIP Output Records</button>
      <button style={btn} onClick={() => navigate("/byproduct-list")}>♻️ By-product Records</button>
      <button style={btn} onClick={() => navigate("/inventory-stock")}>📋 Stocktake Update</button>
      <button style={btn} onClick={() => navigate("/inventory-stock-list")}>📦 Inventory Stock</button>
      <button style={btn} onClick={() => navigate("/production-schedule")}>📅 Production Schedule Viewer</button>
      <button style={btn} onClick={() => navigate("/scheduler")}>🤖 Smart Scheduler</button>
      <button style={btn} onClick={() => navigate("/analytics")}>📊 Analytics Dashboard</button>
      <button style={btn} onClick={() => navigate("/admin-tools")}>⚙️ Admin Tools</button>
      <button style={btn} onClick={handleLogout}>🚪 Logout</button>
    </div>
  );
}
