// src/components/NewOrderForm.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "./Sidebar";

export default function NewOrderForm() {
  const [form, setForm] = useState({
    order_number: "",
    customer_name: "",
    product_name: "",
    quantity: "",
    uom: "",
    plant_name: "",
    required_by: "",
  });

  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    generateOrderNumber();
    fetchProducts();
  }, []);

  const generateOrderNumber = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("order_number")
      .order("created_at", { ascending: false })
      .limit(1);
    if (!error) {
      const last = data[0]?.order_number || "ORD-0000";
      const num = parseInt(last.split("-")[1]) + 1;
      const next = `ORD-${String(num).padStart(4, "0")}`;
      setForm((prev) => ({ ...prev, order_number: next }));
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("product_name, unit_of_measure, plant_name");
    if (!error) {
      setProducts(data);
    }
  };

  const handleProductChange = (value) => {
    const selected = products.find((p) => p.product_name === value);
    setForm((prev) => ({
      ...prev,
      product_name: value,
      uom: selected?.unit_of_measure || "",
      plant_name: selected?.plant_name || "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from("jobs").insert({
      ...form,
      status: "Pending",
      order_date: new Date().toISOString(),
    });

    if (error) {
      alert("❌ Error submitting order: " + error.message);
    } else {
      alert("✅ Order submitted successfully.");
      setForm({
        order_number: "",
        customer_name: "",
        product_name: "",
        quantity: "",
        uom: "",
        plant_name: "",
        required_by: "",
      });
      generateOrderNumber();
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: 350,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            fontFamily: "Segoe UI",
            fontSize: "0.8rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem" }}>📋 New Order Form</h2>

          <label>Order Number</label>
          <input type="text" value={form.order_number} disabled style={inputStyle} />

          <label>Customer Name</label>
          <input name="customer_name" value={form.customer_name} onChange={handleChange} required style={inputStyle} />

          <label>Product</label>
          <select
            name="product_name"
            value={form.product_name}
            onChange={(e) => handleProductChange(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.product_name} value={p.product_name}>
                {p.product_name}
              </option>
            ))}
          </select>

          <label>Unit of Measure</label>
          <input type="text" value={form.uom} name="uom" readOnly style={inputStyle} />

          <label>Plant Name</label>
          <input type="text" value={form.plant_name} name="plant_name" readOnly style={inputStyle} />

          <label>Quantity</label>
          <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required style={inputStyle} />

          <label>Required By Date</label>
          <input name="required_by" type="date" value={form.required_by} onChange={handleChange} required style={inputStyle} />

          <button type="submit" disabled={isSubmitting} style={buttonStyle}>
            ✅ Submit Order
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "0.4rem",
  fontFamily: "Segoe UI",
  fontSize: "0.8rem",
};

const buttonStyle = {
  marginTop: "1rem",
  padding: "0.5rem",
  backgroundColor: "#007acc",
  color: "white",
  border: "none",
  borderRadius: "4px",
  fontSize: "0.8rem",
  cursor: "pointer",
  fontFamily: "Segoe UI",
};
