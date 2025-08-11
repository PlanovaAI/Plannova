// src/components/Sidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { releaseSessionLock } from "../sessionLock";
import logo from "../assets/Plannova2.png";

export default function Sidebar() {
  const navigate = useNavigate();

  const buttonStyle = {
    display: "block",
    marginBottom: "0.75rem",
    padding: "0.35rem 0.6rem",
    background: "#fff",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "5px",
    cursor: "pointer",
    width: "100%",
    fontSize: "0.8rem",
    textAlign: "left",
    fontFamily: "Segoe UI",
  };

  const handleLogout = async () => {
    try { await releaseSessionLock(); } catch {}
    const { error } = await supabase.auth.signOut();
    if (error) { console.error("Logout failed:", error.message); return; }
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ width: "200px", backgroundColor: "#e6f0ff", padding: "1rem", minHeight: "100vh", fontFamily: "Segoe UI" }}>
      <img src={logo} alt="Plannova Logo" style={{ width: "210px", margin: "0 auto 1.5rem", display: "block" }} />

      <button style={buttonStyle} onClick={() => navigate("/new-order")}>➕ New Order</button>
      <button style={buttonStyle} onClick={() => navigate("/orders")}>📑 Orders List</button>
      <button style={buttonStyle} onClick={() => navigate("/completed-orders")}>✅ Completed Orders</button>
      <button style={buttonStyle} onClick={() => navigate("/products")}>🧾 Product Management</button>
      <button style={buttonStyle} onClick={() => navigate("/raw-material-intake")}>📥 Raw Material Intake</button>
      <button style={buttonStyle} onClick={() => navigate("/shift-production")}>🏭 Shift Production Entry</button>
      <button style={buttonStyle} onClick={() => navigate("/shift-production-list")}>📃 Shift End Records</button>
      <button style={buttonStyle} onClick={() => navigate("/material-usage-tracker")}>📦 Material Usage Tracker</button>
      <button style={buttonStyle} onClick={() => navigate("/wip-list")}>🔄 WIP Output Records</button>
      <button style={buttonStyle} onClick={() => navigate("/byproduct-list")}>♻️ By-product Records</button>
      <button style={buttonStyle} onClick={() => navigate("/inventory-stock")}>📋 Stocktake Update</button>
      <button style={buttonStyle} onClick={() => navigate("/inventory-stock-list")}>📦 Inventory Stock</button>
      <button style={buttonStyle} onClick={() => navigate("/production-schedule")}>📅 Production Schedule Viewer</button>
      <button style={buttonStyle} onClick={() => navigate("/scheduler")}>🤖 Smart Scheduler</button>
      <button style={buttonStyle} onClick={() => navigate("/analytics")}>📊 Analytics Dashboard</button>
      <button style={buttonStyle} onClick={() => navigate("/admin-tools")}>⚙️ Admin Tools</button>

      <button style={buttonStyle} onClick={handleLogout}>🚪 Logout</button>
    </div>
  );
}
