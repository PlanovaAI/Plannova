import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AssignOrderModal({ slot, onClose, onRefresh }) {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [loading, setLoading] = useState(false);

  const { date, shift, plant } = slot;

  useEffect(() => {
    fetchUnscheduledOrders();
  }, []);

  const fetchUnscheduledOrders = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("order_number")
      .eq("status", "Pending");

    if (error) {
      console.error("Error fetching orders:", error.message);
    } else {
      setPendingOrders(data.map((o) => o.order_number));
    }
  };

  const handleAssign = async () => {
    if (!selectedOrder) return;

    setLoading(true);
    const { error } = await supabase.from("schedules").insert([
      {
        order_number: selectedOrder,
        plant,
        shift,
        date,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Error assigning order.");
      console.error(error.message);
    } else {
      onRefresh();
      onClose();
    }
  };

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <h3 style={{ fontFamily: "Segoe UI", fontSize: "1rem", marginBottom: "1rem" }}>
          ✅ Assign Order to Slot
        </h3>

        <p>
          <strong>Date:</strong> {date}
          <br />
          <strong>Shift:</strong> {shift}
          <br />
          <strong>Suggested Plant:</strong> {plant}
        </p>

        <label style={labelStyle}>Select Order:</label>
        <select
          value={selectedOrder}
          onChange={(e) => setSelectedOrder(e.target.value)}
          style={inputStyle}
        >
          <option value="">-- Select --</option>
          {pendingOrders.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button onClick={onClose} style={buttonStyle}>Cancel</button>
          <button onClick={handleAssign} disabled={loading} style={{ ...buttonStyle, backgroundColor: "#0077cc", color: "#fff" }}>
            {loading ? "Assigning..." : "Assign Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Styles
const backdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: "8px",
  width: "320px",
  fontFamily: "Segoe UI",
  fontSize: "0.8rem",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.3rem",
  marginTop: "0.75rem",
};

const inputStyle = {
  width: "100%",
  padding: "0.4rem",
  fontSize: "0.75rem",
};

const buttonStyle = {
  padding: "0.4rem 0.8rem",
  fontSize: "0.75rem",
  fontFamily: "Segoe UI",
  cursor: "pointer",
};
