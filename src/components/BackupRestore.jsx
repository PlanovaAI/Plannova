import React from "react";
import Sidebar from "./Sidebar";

export default function BackupRestore() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "1rem", fontFamily: "Segoe UI" }}>
        <h2>📂 Backup & Restore</h2>
        <p>Backup and restore functions will appear here.</p>
      </div>
    </div>
  );
}