// src/components/EditOrderModal.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function EditOrderModal({ job, onClose, refreshOrders }) {
  const [formData, setFormData] = useState({
    order_number: "",
    job_date: "",
    customer_name: "",
    product_name: "",
    quantity: "",
    uom: "",
    plant_name: "",
    storage_yard: "",
    wip_area: "",
    byproduct: "",
    required_by: "",
    status: "",
  });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (!error) setProducts(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (job) {
      setFormData({
        order_number: job.order_number || "",
        job_date: job.job_date ? job.job_date.split("T")[0] : "",
        customer_name: job.customer_name || "",
        product_name: job.product_name || "",
        quantity: job.quantity || "",
        uom: job.uom || "",
        plant_name: job.plant_name || "",
        storage_yard: job.storage_yard || "",
        wip_area: job.wip_area || "",
        byproduct: job.byproduct || "",
        required_by: job.required_by ? job.required_by.split("T")[0] : "",
        status: job.status || "",
      });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "product_name") {
      const selected = products.find((p) => p.product_name === value);
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          uom: selected.unit_of_measure,
          plant_name: selected.plant_name,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = { ...formData };

    if (!updatedData.job_date) delete updatedData.job_date;
    if (!updatedData.required_by) delete updatedData.required_by;

    const { error } = await supabase
      .from("jobs")
      .update(updatedData)
      .eq("id", job.id);

    if (error) {
      alert("❌ Failed to update order: " + error.message);
    } else {
      alert("✅ Order updated successfully.");
      if (refreshOrders) refreshOrders();
      onClose();
    }
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <h3>Edit Order</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <label>Order Number</label>
          <input disabled name="order_number" value={formData.order_number} />

          <label>Job Date</label>
          <input name="job_date" type="date" value={formData.job_date} onChange={handleChange} />

          <label>Customer Name</label>
          <input name="customer_name" value={formData.customer_name} onChange={handleChange} />

          <label>Product</label>
          <select name="product_name" value={formData.product_name} onChange={handleChange}>
            <option value="">-- Select Product --</option>
            {products.map((p) => (
              <option key={p.product_name} value={p.product_name}>{p.product_name}</option>
            ))}
          </select>

          <label>Quantity</label>
          <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} />

          <label>Unit of Measure</label>
          <input name="uom" value={formData.uom} disabled />

          <label>Plant</label>
          <input name="plant_name" value={formData.plant_name} disabled />

          <label>Storage Yard</label>
          <input name="storage_yard" value={formData.storage_yard} onChange={handleChange} />

          <label>WIP Area</label>
          <input name="wip_area" value={formData.wip_area} onChange={handleChange} />

          <label>Byproduct</label>
          <input name="byproduct" value={formData.byproduct} onChange={handleChange} />

          <label>Required By</label>
          <input name="required_by" type="date" value={formData.required_by} onChange={handleChange} />

          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
          </select>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
            <button type="submit">💾 Save Changes</button>
            <button type="button" onClick={onClose}>❌ Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "white",
  padding: "1.5rem",
  borderRadius: "8px",
  width: "500px",
  maxHeight: "90vh",
  overflowY: "auto",
  fontSize: "0.9rem",
};
