// src/components/InventoryStockList.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

export default function InventoryStockList() {
  const [stocks, setStocks] = useState([]);
  const [filterType, setFilterType] = useState("storage_yard");
  const [filterValue, setFilterValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStocks = async () => {
      const { data, error } = await supabase.from("inventory_stock").select("*");
      if (error) console.error("Error fetching stock data:", error);
      else setStocks(data);
    };
    fetchStocks();
  }, []);

  const filtered = stocks.filter((item) =>
    item[filterType]?.toLowerCase().includes(filterValue.toLowerCase())
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "InventoryStock");
    XLSX.writeFile(workbook, "InventoryStock.xlsx");
  };

  const printTable = () => {
    const printWindow = window.open("", "_blank");
    const html = `
      <html><head><title>Inventory Stock List</title>
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Segoe UI; font-size: 0.75rem; }
        th, td { border: 1px solid #ccc; padding: 8px; }
        th { background: #f0f0f0; font-weight: bold; }
      </style></head><body>
      <h2>📦 Inventory Stock List</h2>
      <table>
        <thead><tr>
          <th>Product</th><th>Category</th><th>Quantity</th><th>UOM</th><th>Storage Yard</th>
        </tr></thead><tbody>
        ${filtered.map((item) => `
          <tr>
            <td>${item.product_name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>${item.unit_of_measure}</td>
            <td>${item.storage_yard}</td>
          </tr>`).join("")}
      </tbody></table></body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const buttonStyle = {
    padding: "6px 10px",
    fontSize: "0.75rem",
    fontFamily: "Segoe UI",
    height: "32px"
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>📦 Inventory Stock List</h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: "1rem", flexWrap: "wrap" }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={buttonStyle}
          >
            <option value="storage_yard">Storage Yard</option>
            <option value="product_name">Product</option>
            <option value="category">Category</option>
          </select>

          <input
            type="text"
            placeholder="Search..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            style={{ ...buttonStyle, width: "200px" }}
          />

          <button
            style={{ ...buttonStyle, backgroundColor: "#f0f0f0" }}
            onClick={() => navigate("/inventory-stock-form")}
          >
            🗃️ Stocktake Update Form
          </button>

          <CSVLink data={filtered} filename="InventoryStock.csv" style={{ textDecoration: "none" }}>
            <button style={buttonStyle}>📥 CSV</button>
          </CSVLink>
          <button onClick={exportToExcel} style={buttonStyle}>📊 Excel</button>
          <button onClick={printTable} style={buttonStyle}>🖨️ Print</button>
        </div>

        {filtered.length === 0 ? (
          <p>No inventory stock records found.</p>
        ) : (
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.75rem", fontFamily: "Segoe UI" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px", backgroundColor: "#f0f0f0" }}>Product</th>
                <th style={{ border: "1px solid #ccc", padding: "8px", backgroundColor: "#f0f0f0" }}>Category</th>
                <th style={{ border: "1px solid #ccc", padding: "8px", backgroundColor: "#f0f0f0" }}>Quantity</th>
                <th style={{ border: "1px solid #ccc", padding: "8px", backgroundColor: "#f0f0f0" }}>UOM</th>
                <th style={{ border: "1px solid #ccc", padding: "8px", backgroundColor: "#f0f0f0" }}>Storage Yard</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.product_name}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.category}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.quantity}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.unit_of_measure}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.storage_yard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
