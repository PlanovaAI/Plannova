// src/components/AdminTools.jsx
import React from "react";

import { useNavigate } from "react-router-dom";

export default function AdminTools() {
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
    width: "220px",
    fontSize: "0.8rem",
    textAlign: "left",
    fontFamily: "Segoe UI",
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "1rem", fontFamily: "Segoe UI" }}>
        <h2 style={{ marginBottom: "1rem" }}>⚙️ Admin Tools</h2>

        <button style={buttonStyle} onClick={() => navigate("/system-health")}>
          🖥️ System Health & Status
        </button>

        <button style={buttonStyle} onClick={() => navigate("/reschedule-audit-log")}>
          📜 Reschedule Audit Log
        </button>

        <button style={buttonStyle} onClick={() => navigate("/backup-restore")}>
          📂 Backup & Restore
        </button>

        <button style={buttonStyle} onClick={() => navigate("/user-management")}>
          👥 User Management
        </button>
      </div>
    </div>
  );
}
