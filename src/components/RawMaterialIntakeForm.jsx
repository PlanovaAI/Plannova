// src/components/NewOrderForm.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";


export default function NewOrderForm() {
  const getTodayAEST = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const aest = new Date(utc + 10 * 60 * 60000);
    return aest.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    order_number: "",
    customer_name: "",
    product_name: "",
    quantity: "",
    uom: "",
    plant_name: "",
    storage_yard: "",
    required_by: "",
    created_at: getTodayAEST(),
    status: "Pending", // default
  });

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
    generateNextOrderNumber();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("product_name, unit_of_measure, plant_name");

    if (!error) setProducts(data);
  };

  const generateNextOrderNumber = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("order_number")
      .order("order_number", { ascending: false })
      .limit(1);

    if (!error) {
      const last = data[0]?.order_number || "ORD-0000";
      const nextNumber = parseInt(last.split("-")[1]) + 1;
      const padded = String(nextNumber).padStart(4, "0");
      setFormData((prev) => ({ ...prev, order_number: `ORD-${padded}` }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (e) => {
    const selected = products.find(p => p.product_name === e.target.value);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        product_name: selected.product_name,
        uom: selected.unit_of_measure,
        plant_name: selected.plant_name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Check for existing order number
    const { data: existing } = await supabase
      .from("jobs")
      .select("order_number")
      .eq("order_number", formData.order_number);

    if (existing && existing.length > 0) {
      alert("❌ This order number already exists. Please reload and try again.");
      return;
    }

    const { error } = await supabase.from("jobs").insert([formData]);
    if (error) {
      alert("❌ Failed to submit: " + error.message);
    } else {
      alert("✅ Order submitted!");
      generateNextOrderNumber(); // auto advance to next order
      setFormData((prev) => ({
        ...prev,
        customer_name: "",
        product_name: "",
        quantity: "",
        uom: "",
        plant_name: "",
        storage_yard: "",
        required_by: "",
        status: "Pending",
      }));
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>🆕 New Order Form</h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            maxWidth: "800px",
          }}
        >
          <div>
            <label>Order Number:</label>
            <input
              type="text"
              name="order_number"
              value={formData.order_number}
              disabled
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div>
            <label>Customer Name:</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              required
              placeholder="e.g. ACME Pty Ltd"
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div>
            <label>Product:</label>
            <select
              name="product_name"
              value={formData.product_name}
              onChange={handleProductSelect}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.product_name} value={p.product_name}>
                  {p.product_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Unit of Measure:</label>
            <input
              type="text"
              name="uom"
              value={formData.uom}
              disabled
              style={{ width: "100%", padding: "0.5rem", backgroundColor: "#eee" }}
            />
          </div>

          <div>
            <label>Plant Name:</label>
            <input
              type="text"
              name="plant_name"
              value={formData.plant_name}
              disabled
              style={{ width: "100%", padding: "0.5rem", backgroundColor: "#eee" }}
            />
          </div>

          <div>
            <label>Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              placeholder="e.g. 500"
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div>
            <label>Storage Yard:</label>
            <input
              type="text"
              name="storage_yard"
              value={formData.storage_yard}
              onChange={handleChange}
              required
              placeholder="e.g. Shed A"
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div>
            <label>Required By (Date):</label>
            <input
              type="date"
              name="required_by"
              value={formData.required_by}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div style={{ gridColumn: "1 / span 2", textAlign: "right", marginTop: "1rem" }}>
            <button
              type="submit"
              style={{
                padding: "0.7rem 1.5rem",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ✅ Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
