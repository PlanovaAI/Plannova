// src/components/ManualSchedulingModal.jsx
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "../supabaseClient";

export default function ManualSchedulingModal({ selectedJobs, onClose }) {
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [shift, setShift] = useState("Morning Shift");
  const [loading, setLoading] = useState(false);

  const handleSchedule = async () => {
    setLoading(true);

    const inserts = selectedJobs.map((job) => ({
      order_number: job.order_number,
      product_name: job.product_name,
      uom: job.uom,
      quantity: job.quantity,
      plant: job.plant_name,
      shift,
      date: scheduleDate.toISOString().split("T")[0],
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase.from("schedules").insert(inserts);

    if (insertError) {
      alert("❌ Error inserting into schedules: " + insertError.message);
      setLoading(false);
      return;
    }

    const jobIds = selectedJobs.map((job) => job.id);
    const { error: updateError } = await supabase
      .from("jobs")
      .update({ status: "Scheduled" })
      .in("id", jobIds);

    setLoading(false);

    if (updateError) {
      alert("⚠️ Scheduled, but failed to update job status: " + updateError.message);
    } else {
      alert("✅ Jobs scheduled successfully!");
      onClose();
    }
  };

  if (!selectedJobs || selectedJobs.length === 0) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginBottom: "1.5rem" }}>✏️ Manual Scheduling</h3>

        {/* Schedule Date Field */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Schedule Date:</label><br />
          <DatePicker
            selected={scheduleDate}
            onChange={(date) => setScheduleDate(date)}
            dateFormat="dd/MM/yyyy"
            className="form-control"
            style={fullInput}
          />
        </div>

        {/* Shift Dropdown */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Shift:</label><br />
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            style={fullInput}
          >
            <option value="Morning Shift">Morning Shift</option>
            <option value="Afternoon Shift">Afternoon Shift</option>
            <option value="Night Shift">Night Shift</option>
          </select>
        </div>

        {/* Orders Table */}
        <div>
          <strong>📝 Orders to Schedule:</strong>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Order #</th>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>UOM</th>
                <th style={thStyle}>Plant</th>
              </tr>
            </thead>
            <tbody>
              {selectedJobs.map((job) => (
                <tr key={job.id}>
                  <td style={tdStyle}>{job.order_number}</td>
                  <td style={tdStyle}>{job.product_name}</td>
                  <td style={tdStyle}>{job.quantity}</td>
                  <td style={tdStyle}>{job.uom}</td>
                  <td style={tdStyle}>{job.plant_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button onClick={onClose} disabled={loading} style={cancelBtn}>
            Cancel
          </button>
          <button onClick={handleSchedule} disabled={loading} style={submitBtn}>
            {loading ? "Scheduling..." : "✅ Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------- Styles ------------------- */

const overlayStyle = {
  position: "fixed",
  top: 100,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center", // ✅ Vertical centering
  zIndex: 9999,         // ✅ Force on top of everything
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: "8px",
  width: "100%",
  maxWidth: "600px",    // ✅ Wide enough for table
  fontFamily: "Segoe UI",
  fontSize: "0.8rem",
  boxShadow: "0 0 12px rgba(0,0,0,0.2)",
  maxHeight: "80vh",    // ✅ Prevents modal from being pushed off-screen
  overflowY: "auto",    // ✅ Scroll inside modal if needed
};

const fullInput = {
  padding: "0.5rem",
  fontSize: "0.8rem",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle = {
  fontWeight: "bold",
  marginBottom: "0.25rem",
  display: "block",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "1rem",
  fontSize: "0.75rem",
  fontFamily: "Segoe UI",
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  backgroundColor: "#f0f0f0",
  fontWeight: "bold",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};

const submitBtn = {
  padding: "0.5rem 1rem",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginLeft: "0.5rem",
};

const cancelBtn = {
  padding: "0.5rem 1rem",
  backgroundColor: "#ccc",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
