// src/components/EditScheduleModal.jsx
import React, { useState } from "react";
import ReactDOM from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "../supabaseClient";

export default function EditScheduleModal({ job, onClose, onSave }) {
  const [scheduleDate, setScheduleDate] = useState(job.date ? new Date(job.date) : new Date());
  const [shift, setShift] = useState(job.shift || "Morning Shift");
  const [plant, setPlant] = useState(job.plant || "");
  const [productName, setProductName] = useState(job.product_name || "");
  const [quantity, setQuantity] = useState(job.quantity || 0);
  const [uom, setUom] = useState(job.uom || "");
  const [requiredBy, setRequiredBy] = useState(job.required_by ? new Date(job.required_by) : null);

  const handleSave = async () => {
    const { error } = await supabase
      .from("schedules")
      .update({
        date: scheduleDate.toISOString().split("T")[0],
        shift,
        plant,
        product_name: productName,
        quantity,
        uom,
        required_by: requiredBy ? requiredBy.toISOString().split("T")[0] : null,
      })
      .eq("id", job.id);

    if (!error) {
      alert("✅ Schedule updated");
      if (onSave) onSave();
      onClose();
    } else alert("❌ Failed to update: " + error.message);
  };

  const handleLockJob = async () => {
    const { error } = await supabase
      .from("schedules")
      .update({
        date: scheduleDate.toISOString().split("T")[0],
        shift,
        plant,
        product_name: productName,
        quantity,
        uom,
        required_by: requiredBy ? requiredBy.toISOString().split("T")[0] : null,
        locked: true,
      })
      .eq("id", job.id);

    if (!error) {
      alert("✅ Job locked and sent to Production Schedule Viewer");
      if (onSave) {
        setTimeout(() => {
          onSave();
        }, 300);
      }
      onClose();
    } else alert("❌ Failed to lock job: " + error.message);
  };

  if (!job) return null;

  return ReactDOM.createPortal(
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginBottom: "0.5rem" }}>✏️ Edit Scheduled Job</h3>

        {/* Order Number & Required By */}
        <p style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
          Order #: {job.order_number}
        </p>
        <p style={{ marginBottom: "1rem", fontSize: "0.8rem", color: "#555" }}>
          Required By: {requiredBy ? requiredBy.toLocaleDateString("en-AU") : "Not Set"}
        </p>

        <label style={labelStyle}>Schedule Date:</label>
        <DatePicker
          selected={scheduleDate}
          onChange={(date) => setScheduleDate(date)}
          dateFormat="dd/MM/yyyy"
          className="form-control"
          style={inputStyle}
        />

        <label style={labelStyle}>Required By:</label>
        <DatePicker
          selected={requiredBy}
          onChange={(date) => setRequiredBy(date)}
          dateFormat="dd/MM/yyyy"
          isClearable
          className="form-control"
          style={inputStyle}
        />

        <label style={labelStyle}>Shift:</label>
        <select value={shift} onChange={(e) => setShift(e.target.value)} style={inputStyle}>
          <option>Morning Shift</option>
          <option>Afternoon Shift</option>
          <option>Night Shift</option>
        </select>

        <label style={labelStyle}>Product Name:</label>
        <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Quantity:</label>
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Unit of Measure:</label>
        <input type="text" value={uom} onChange={(e) => setUom(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Plant:</label>
        <input type="text" value={plant} onChange={(e) => setPlant(e.target.value)} style={inputStyle} />

        <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleSave} style={saveBtn}>Save</button>
          <button onClick={handleLockJob} style={lockBtn}>🔒 Lock Job</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ---------------- Styles ---------------- */
const overlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modalStyle = { backgroundColor: "#fff", padding: "2rem", borderRadius: "8px", width: "45%", maxWidth: "450px", fontFamily: "Segoe UI", fontSize: "0.8rem", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 0 12px rgba(0,0,0,0.3)" };
const inputStyle = { width: "100%", padding: "0.5rem", marginBottom: "1rem", fontSize: "0.8rem", boxSizing: "border-box" };
const labelStyle = { fontWeight: "bold", marginBottom: "0.25rem", display: "block" };
const cancelBtn = { padding: "0.5rem 1rem", marginRight: "0.5rem", backgroundColor: "#ccc", border: "none", borderRadius: "4px", cursor: "pointer" };
const saveBtn = { padding: "0.5rem 1rem", marginRight: "0.5rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const lockBtn = { padding: "0.5rem 1rem", backgroundColor: "#22c55e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
