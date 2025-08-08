import React from "react";


export default function UserManagement() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "1rem", fontFamily: "Segoe UI" }}>
        <h2>👥 User Management</h2>
        <p>Manage user access and roles here.</p>
      </div>
    </div>
  );
}