// src/components/ShiftProductionForm.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

import "react-datepicker/dist/react-datepicker.css";

export default function ShiftProductionForm() {
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split("T")[0]);
  const [shiftName, setShiftName] = useState("");
  const [operator, setOperator] = useState("");
  const [productEntries, setProductEntries] = useState([
    {
      product_name: "",
      uom: "",
      plant_name: "",
      quantity_produced: "",
    },
  ]);
  const [wipProductName, setWipProductName] = useState("");
  const [wipUom, setWipUom] = useState("");
  const [wipQuantity, setWipQuantity] = useState("");
  const [byProductName, setByProductName] = useState("");
  const [byProductUom, setByProductUom] = useState("");
  const [byProductQuantity, setByProductQuantity] = useState("");
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("product_name, unit_of_measure, plant_name");
      if (!error) setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleProductChange = (index, value) => {
    const selected = products.find(p => p.product_name === value);
    const updatedEntries = [...productEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      product_name: value,
      uom: selected?.unit_of_measure || "",
      plant_name: selected?.plant_name || "",
    };
    setProductEntries(updatedEntries);
  };

  const handleQuantityChange = (index, value) => {
    const updatedEntries = [...productEntries];
    updatedEntries[index].quantity_produced = value;
    setProductEntries(updatedEntries);
  };

  const addProductEntry = () => {
    setProductEntries([...productEntries, { product_name: "", uom: "", plant_name: "", quantity_produced: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const entries = productEntries.map(entry => ({
      shift_date: shiftDate,
      shift_name: shiftName,
      operator,
      ...entry,
      wip_product_name: wipProductName,
      wip_uom: wipUom,
      wip_quantity: wipQuantity,
      by_product_name: byProductName,
      by_product_uom: byProductUom,
      by_product_quantity: byProductQuantity,
    }));

    const { error } = await supabase.from("shift_production").insert(entries);
    if (error) setStatus("❌ " + error.message);
    else {
      setStatus("✅ Shift production submitted");
      setShiftName("");
      setOperator("");
      setProductEntries([{ product_name: "", uom: "", plant_name: "", quantity_produced: "" }]);
      setWipProductName("");
      setWipUom("");
      setWipQuantity("");
      setByProductName("");
      setByProductUom("");
      setByProductQuantity("");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.75rem", fontFamily: "Segoe UI", fontSize: "0.8rem" }}>
          <h2 style={{ fontFamily: "Segoe UI", fontSize: "1.25rem" }}>📋 Shift End Production Entry</h2>

          <input type="date" value={shiftDate} readOnly />

          <select value={shiftName} onChange={(e) => setShiftName(e.target.value)} required>
            <option value="">Select Shift</option>
            <option value="Shift A">Shift A</option>
            <option value="Shift B">Shift B</option>
            <option value="Shift C">Shift C</option>
          </select>

          <input type="text" placeholder="Operator Name" value={operator} onChange={(e) => setOperator(e.target.value)} required />

          {productEntries.map((entry, index) => (
            <div key={index} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <select
                value={entry.product_name}
                onChange={(e) => handleProductChange(index, e.target.value)}
                required
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.product_name} value={p.product_name}>
                    {p.product_name}
                  </option>
                ))}
              </select>
              <input type="text" placeholder="UOM" value={entry.uom} readOnly />
              <input type="text" placeholder="Plant Name" value={entry.plant_name} readOnly />
              <input
                type="number"
                placeholder="Quantity Produced"
                value={entry.quantity_produced}
                onChange={(e) => handleQuantityChange(index, e.target.value)}
                required
              />
            </div>
          ))}

          <input type="text" placeholder="WIP Product Name" value={wipProductName} onChange={(e) => setWipProductName(e.target.value)} />
          <input type="text" placeholder="WIP UOM" value={wipUom} onChange={(e) => setWipUom(e.target.value)} />
          <input type="number" placeholder="WIP Quantity" value={wipQuantity} onChange={(e) => setWipQuantity(e.target.value)} />

          <input type="text" placeholder="By-product Name" value={byProductName} onChange={(e) => setByProductName(e.target.value)} />
          <input type="text" placeholder="By-product UOM" value={byProductUom} onChange={(e) => setByProductUom(e.target.value)} />
          <input type="number" placeholder="By-product Quantity" value={byProductQuantity} onChange={(e) => setByProductQuantity(e.target.value)} />

          <button type="button" onClick={addProductEntry}>➕ Add Another Product</button>

          <button type="submit" style={{ marginTop: "1rem" }}>Submit Production</button>
          {status && <p>{status}</p>}
        </form>
      </div>
    </div>
  );
}
