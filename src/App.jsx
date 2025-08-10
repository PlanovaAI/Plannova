import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import OrderList from "./pages/OrderList";

export default function App() {
  return (
    <Routes>
      {/* Root → always show login first */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Private (single Sidebar via Layout) */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/orders" element={<OrderList />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
