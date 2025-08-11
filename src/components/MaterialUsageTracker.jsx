// src/components/MaterialUsageTracker.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CSVLink } from "react-csv";
import { format } from "date-fns";

export default function MaterialUsageTracker() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const fetchUsage = async () => {
      const { data, error } = await supabase.from("material_usage").select("*");
      if (error) console.error("Error fetching material usage:", error);
      else {
        setRecords(data);
        setFiltered(data);
      }
    };
    fetchUsage();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const filteredData = records.filter((r) => {
        const date = new Date(r.usage_date);
        return date >= startDate && date <= endDate;
      });
      setFiltered(filteredData);
    } else {
      setFiltered(records);
    }
  }, [startDate, endDate, records]);

  const handlePrint = () => {
    const printContents = document.getElementById("print-section").innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Material Usage Report</title>
        </head>
        <body style="font-family: Segoe UI; font-size: 0.75rem;">
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const headers = [
    { label: "Date", key: "usage_date" },
    { label: "Shift", key: "shift_name" },
    { label: "Operator", key: "operator" },
    { label: "Plant", key: "plant" },
    { label: "Material", key: "material_name" },
    { label: "Quantity", key: "quantity_used" },
    { label: "UOM", key: "uom" },
    { label: "Used For", key: "used_for" },
  ];

  const totalQuantity = filtered.reduce((sum, r) => sum + Number(r.quantity_used || 0), 0);

  return (
    <div style={{ display: "flex" }}>
      
      <div style={{ flex: 1, padding: "2rem", fontFamily: "Segoe UI", fontSize: "0.75rem" }}>
        <h2>📦 Material Usage Tracker</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ marginRight: "1rem" }}><strong>Filter by Date:</strong></label>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            dateFormat="dd/MM/yyyy"
            placeholderText="Select date range"
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <CSVLink data={filtered} headers={headers} filename="material_usage.csv">
            <button style={{ marginRight: "1rem" }}>⬇️ Export CSV</button>
          </CSVLink>
          <button onClick={handlePrint}>🖨️ Print</button>
        </div>

        <div id="print-section">
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Shift</th>
                <th style={thStyle}>Operator</th>
                <th style={thStyle}>Plant</th>
                <th style={thStyle}>Material</th>
                <th style={thStyle}>Quantity</th>
                <th style={thStyle}>UOM</th>
                <th style={thStyle}>Used For</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{format(new Date(r.usage_date), "dd/MM/yyyy")}</td>
                  <td style={tdStyle}>{r.shift_name}</td>
                  <td style={tdStyle}>{r.operator}</td>
                  <td style={tdStyle}>{r.plant}</td>
                  <td style={tdStyle}>{r.material_name}</td>
                  <td style={tdStyle}>{r.quantity_used}</td>
                  <td style={tdStyle}>{r.uom}</td>
                  <td style={tdStyle}>{r.used_for}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
                <td colSpan="5" style={tdStyle}>Total</td>
                <td style={tdStyle}>{totalQuantity}</td>
                <td style={tdStyle}></td>
                <td style={tdStyle}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
};
