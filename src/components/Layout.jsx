import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar"; // <-- this is required

export default function Layout() {
  const location = useLocation();
  const hideSidebar = location.pathname.startsWith("/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {!hideSidebar && <Sidebar />}
      <main style={{ flex: 1, padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
}

