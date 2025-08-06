// src/components/InventoryStockForm.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

export default function InventoryStockForm() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [uom, setUom] = useState("");
  const [storageYard, setStorageYard] = useState("");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("product_name, unit_of_measure");
      if (!error && data) {
        setProducts(data);
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = (selectedProduct) => {
    const product = products.find((p) => p.product_name === selectedProduct);
    setProductName(selectedProduct);
    setUom(product?.unit_of_measure || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("inventory_stock").insert([
      {
        product_name: productName,
        category,
        quantity: parseFloat(quantity),
        unit_of_measure: uom,
        storage_yard: storageYard,
      },
    ]);

    if (error) {
      alert("❌ Error saving record: " + error.message);
    } else {
      alert("✅ Inventory stock record saved!");
      setProductName("");
      setCategory("");
      setQuantity("");
      setUom("");
      setStorageYard("");
    }
  };

  const fieldStyle = {
    display: "block",
    marginBottom: "0.75rem",
    fontSize: "0.85rem",
  };

  const inputStyle = {
    padding: "8px",
    fontSize: "0.85rem",
    width: "100%",
    maxWidth: "300px",
    fontFamily: "Segoe UI",
  };

  const buttonStyle = {
    padding: "8px 16px",
    fontSize: "0.85rem",
    fontFamily: "Segoe UI",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginTop: "1rem",
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>📦 Inventory Stock Entry</h2>
        <form onSubmit={handleSubmit}>
          <label style={fieldStyle}>Product Name:</label>
          <select
            value={productName}
            onChange={(e) => handleProductChange(e.target.value)}
            style={inputStyle}
            required
          >
            <option value="">Select product</option>
            {products.map((p, i) => (
              <option key={i} value={p.product_name}>
                {p.product_name}
              </option>
            ))}
          </select>

          <label style={fieldStyle}>Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
            required
          >
            <option value="">Select category</option>
            <option value="Raw Material">Raw Material</option>
            <option value="WIP">WIP</option>
            <option value="Finished Goods">Finished Goods</option>
          </select>

          <label style={fieldStyle}>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={inputStyle}
            required
          />

          <label style={fieldStyle}>Unit of Measure:</label>
          <input type="text" value={uom} readOnly style={inputStyle} />

          <label style={fieldStyle}>Storage Yard:</label>
          <input
            type="text"
            value={storageYard}
            onChange={(e) => setStorageYard(e.target.value)}
            style={inputStyle}
            required
          />

          <button type="submit" style={buttonStyle}>➕ Add Stock Entry</button>
        </form>
      </div>
    </div>
  );
}
