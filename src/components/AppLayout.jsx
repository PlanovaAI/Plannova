// src/components/AppLayout.jsx
import React from "react";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "1rem" }}>{children}</div>
    </div>
  );
}
