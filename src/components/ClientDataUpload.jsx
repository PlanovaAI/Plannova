// src/components/ClientDataUpload.jsx
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../supabaseClient";


export default function ClientDataUpload() {
  const [status, setStatus] = useState("");
  const [sheetPreviews, setSheetPreviews] = useState({});

  const REQUIRED_FIELDS = {
    Products: ["product_name", "unit_of_measure", "plant_name"],
    Plants: ["plant_name"],
    "Shift Production": ["date", "product_name", "quantity"],
    WIP: ["shift_date", "wip_product_name", "wip_quantity"],
    Byproducts: ["shift_date", "byproduct_name", "byproduct_quantity"],
    Inventory: ["product_name", "stock_level"],
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus("⏳ Reading file...");
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const previews = {};
        let allValid = true;

        for (const sheetName of workbook.SheetNames) {
          const records = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          if (records.length === 0) continue;

          const required = REQUIRED_FIELDS[sheetName] || [];
          const missingFields = [];

          for (const field of required) {
            if (!Object.keys(records[0]).includes(field)) {
              missingFields.push(field);
              allValid = false;
            }
          }

          previews[sheetName] = {
            rows: records.slice(0, 5),
            missingFields,
          };
        }

        setSheetPreviews(previews);
        setStatus(allValid ? "✅ Preview ready. Click 'Upload All' to proceed." : "❌ Missing required fields. Please fix and re-upload.");
      } catch (err) {
        console.error("Read failed:", err);
        setStatus("❌ Upload failed. Check console.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    setStatus("⏳ Uploading to Supabase...");

    try {
      for (const sheetName in sheetPreviews) {
        const sheetData = sheetPreviews[sheetName];
        if (sheetData.missingFields.length > 0) continue;

        const tableMap = {
          Products: "products",
          Plants: "plants",
          "Shift Production": "shift_production",
          WIP: "wip_output",
          Byproducts: "byproducts",
          Inventory: "inventory",
        };

        const table = tableMap[sheetName];
        if (!table) continue;

        const { error } = await supabase.from(table).insert(sheetData.rows);
        if (error) {
          console.error(`Insert error in ${table}:`, error);
          setStatus(`❌ Failed to insert into ${table}`);
          return;
        }
      }

      setStatus("✅ Upload complete.");
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("❌ Upload failed.");
    }
  };

  const handleDownloadTemplate = () => {
    const workbook = XLSX.utils.book_new();

    const templates = {
      Products: [{ product_name: "", unit_of_measure: "", plant_name: "" }],
      Plants: [{ plant_name: "" }],
      "Shift Production": [{ date: "", product_name: "", quantity: "" }],
      WIP: [{ shift_date: "", wip_product_name: "", wip_quantity: "" }],
      Byproducts: [{ shift_date: "", byproduct_name: "", byproduct_quantity: "" }],
      Inventory: [{ product_name: "", stock_level: "" }],
    };

    for (const sheetName in templates) {
      const sheet = XLSX.utils.json_to_sheet(templates[sheetName]);
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    }

    XLSX.writeFile(workbook, "Plannova_Client_Template.xlsx");
  };

  return (
    <div style={{ display: "flex" }}>
      
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>📤 Client Data Upload</h2>
        <p>Upload your Excel file with sheets: Products, Plants, Shift Production, WIP, Byproducts, Inventory.</p>

        <button
          onClick={handleDownloadTemplate}
          style={{
            marginBottom: "1rem",
            padding: "0.4rem 1rem",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          📥 Download Excel Template
        </button>

        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <p style={{ fontWeight: "bold", marginTop: "1rem" }}>{status}</p>

        {Object.keys(sheetPreviews).length > 0 && (
          <>
            <button
              onClick={handleUpload}
              style={{
                padding: "0.4rem 1rem",
                marginTop: "1rem",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ✅ Upload All
            </button>

            <div style={{ marginTop: "2rem" }}>
              <h3>🔍 Sheet Previews</h3>
              {Object.entries(sheetPreviews).map(([sheet, data]) => (
                <div key={sheet} style={{ marginBottom: "2rem" }}>
                  <h4>{sheet}</h4>
                  {data.missingFields.length > 0 ? (
                    <p style={{ color: "red" }}>Missing required fields: {data.missingFields.join(", ")}</p>
                  ) : (
                    <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", fontSize: "0.85rem" }}>
                      <thead>
                        <tr>
                          {Object.keys(data.rows[0] || {}).map((col) => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.rows.map((row, idx) => (
                          <tr key={idx}>
                            {Object.keys(row).map((col) => (
                              <td key={col}>{row[col]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
