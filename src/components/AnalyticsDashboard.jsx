// src/components/AnalyticsDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { trainForecastModel } from "../services/ml_trainer";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AnalyticsDashboard() {
  const [forecastData, setForecastData] = useState([]);
  const [copilotInControl, setCopilotInControl] = useState(true);
  const [groupMode, setGroupMode] = useState("product");
  const [showTrendline, setShowTrendline] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const forecast = await trainForecastModel(7, true); // include moving_avg
        setForecastData(forecast);
      } catch (error) {
        console.error("Failed to fetch forecast:", error);
      }
    };

    fetchForecast();
  }, []);

  const handleManualOverride = () => {
    const confirm = window.confirm("⚠️ AI Copilot will be disabled. You will now take control manually.");
    if (confirm) {
      setCopilotInControl(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(forecastData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Forecast");
    XLSX.writeFile(workbook, "Plannova_Forecast.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Plannova Forecast Report", 14, 15);
    const tableData = forecastData.map((item) => [
      item.plant_name,
      item.product_name,
      item.date,
      item.predicted_quantity,
      item.moving_avg,
    ]);

    doc.autoTable({
      startY: 25,
      head: [["Plant", "Product", "Date", "Predicted Qty", "Trend Avg"]],
      body: tableData,
    });

    doc.save("Plannova_Forecast.pdf");
  };

  return (
    <div style={{ display: "flex" }}>
      
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>📊 Analytics Dashboard</h2>

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>📈 7-Day AI Production Forecast</h3>
            {copilotInControl ? (
              <div>
                <span
                  style={{
                    backgroundColor: "#e6f2ff",
                    padding: "0.4rem 0.7rem",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    color: "#003366",
                  }}
                >
                  🤖 Plannova AI Copilot in control
                </span>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "gray",
                    marginTop: "4px",
                  }}
                >
                  AI can make mistakes. Check important info.
                </p>
              </div>
            ) : (
              <span style={{ color: "red", fontWeight: "bold" }}>
                🛑 Manual override in effect
              </span>
            )}
          </div>

          {copilotInControl && (
            <button
              onClick={handleManualOverride}
              style={{
                marginTop: "10px",
                padding: "6px 10px",
                backgroundColor: "#ffcccb",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Override AI Copilot
            </button>
          )}

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <label>
              📊 View Mode:{" "}
              <select
                onChange={(e) => setGroupMode(e.target.value)}
                value={groupMode}
                style={{ padding: "4px", marginLeft: "0.5rem" }}
              >
                <option value="product">By Product</option>
                <option value="plant">By Plant</option>
                <option value="both">By Plant + Product</option>
              </select>
            </label>

            <label>
              📉 <input type="checkbox" checked={showTrendline} onChange={() => setShowTrendline(!showTrendline)} /> Show Trendline
            </label>

            <button onClick={exportToExcel} style={{ padding: "5px 10px" }}>
              📥 Export to Excel
            </button>
            <button onClick={exportToPDF} style={{ padding: "5px 10px" }}>
              🧾 Export to PDF
            </button>
          </div>

          <div style={{ marginTop: "1.5rem", width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <BarChart
                data={forecastData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                {groupMode === "plant" && <XAxis dataKey="plant_name" />}
                {groupMode === "product" && <XAxis dataKey="product_name" />}
                {groupMode === "both" && (
                  <XAxis
                    dataKey={(entry) =>
                      `${entry.plant_name} - ${entry.product_name}`
                    }
                  />
                )}
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="predicted_quantity"
                  fill="#0073e6"
                  name="Predicted Qty"
                />
                {showTrendline && (
                  <Line
                    type="monotone"
                    dataKey="moving_avg"
                    stroke="#9c27b0"
                    name="Trend Avg"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
