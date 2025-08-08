// src/components/ForecastViewer.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ForecastViewer() {
  const [forecasts, setForecasts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [productFilter, setProductFilter] = useState("All");
  const [plantFilter, setPlantFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("forecast")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error loading forecast:", error);
      } else {
        setForecasts(data);
        setFiltered(data);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let data = forecasts;

    if (productFilter !== "All") {
      data = data.filter((f) => f.product_name === productFilter);
    }

    if (plantFilter !== "All") {
      data = data.filter((f) => f.plant_name === plantFilter);
    }

    setFiltered(data);
  }, [productFilter, plantFilter, forecasts]);

  const uniqueProducts = [...new Set(forecasts.map((f) => f.product_name))];
  const uniquePlants = [...new Set(forecasts.map((f) => f.plant_name))];

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Forecast");
    XLSX.writeFile(workbook, "Forecast_History.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Forecast History", 14, 15);
    const tableData = filtered.map((item) => [
      item.date,
      item.plant_name,
      item.product_name,
      item.predicted_quantity,
      item.moving_avg,
    ]);

    doc.autoTable({
      startY: 25,
      head: [["Date", "Plant", "Product", "Predicted", "Trend Avg"]],
      body: tableData,
    });

    doc.save("Forecast_History.pdf");
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>📜 Forecast History</h2>

        <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <label>
            Filter by Product:{" "}
            <select onChange={(e) => setProductFilter(e.target.value)} value={productFilter}>
              <option>All</option>
              {uniqueProducts.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>

          <label>
            Filter by Plant:{" "}
            <select onChange={(e) => setPlantFilter(e.target.value)} value={plantFilter}>
              <option>All</option>
              {uniquePlants.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>

          <button onClick={exportToExcel}>📥 Export to Excel</button>
          <button onClick={exportToPDF}>🧾 Export to PDF</button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", fontSize: "0.85rem", minWidth: "800px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th>Date</th>
                <th>Plant</th>
                <th>Product</th>
                <th>Predicted Qty</th>
                <th>Trend Avg</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.date}</td>
                  <td>{row.plant_name}</td>
                  <td>{row.product_name}</td>
                  <td>{row.predicted_quantity}</td>
                  <td>{row.moving_avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
