import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function ByproductEditModal({ record, onClose, onSave }) {
  const [formData, setFormData] = useState({
    byproduct_name: record.byproduct_name || "",
    byproduct_quantity: record.byproduct_quantity || "",
    usage_or_destination: record.usage_or_destination || "",
    plant: record.plant || "",
    shift_name: record.shift_name || "",
    operator: record.operator || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("byproducts")
      .update(formData)
      .eq("id", record.id);

    if (error) {
      alert("❌ Failed to update record: " + error.message);
    } else {
      alert("✅ Record updated successfully");
      onClose();
      onSave();
    }
  };

  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <h3>✏️ Edit By-product Record</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label>
            By-product Name:
            <input
              name="byproduct_name"
              value={formData.byproduct_name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label>
            Quantity:
            <input
              type="number"
              name="byproduct_quantity"
              value={formData.byproduct_quantity}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label>
            Usage / Destination:
            <input
              name="usage_or_destination"
              value={formData.usage_or_destination}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>

          <label>
            Plant:
            <input
              name="plant"
              value={formData.plant}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>

          <label>
            Shift:
            <select
              name="shift_name"
              value={formData.shift_name}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Select Shift</option>
              <option value="Day Shift">Day Shift</option>
              <option value="Afternoon Shift">Afternoon Shift</option>
              <option value="Night Shift">Night Shift</option>
            </select>
          </label>

          <label>
            Operator:
            <input
              name="operator"
              value={formData.operator}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button type="submit" style={saveButton}>💾 Save</button>
            <button type="button" onClick={onClose} style={cancelButton}>❌ Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Styles
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalBox = {
  background: "white",
  padding: "2rem",
  borderRadius: "8px",
  width: "400px",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
};

const inputStyle = {
  width: "100%",
  padding: "0.4rem",
  marginTop: "0.3rem",
};

const saveButton = {
  backgroundColor: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  cursor: "pointer",
};

const cancelButton = {
  backgroundColor: "#ccc",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  cursor: "pointer",
};
