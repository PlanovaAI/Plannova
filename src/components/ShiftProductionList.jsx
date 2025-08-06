// src/components/ShiftProductionList.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "./Sidebar";
import { CSVLink } from "react-csv";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ShiftProductionList() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchField, setSearchField] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [uniqueOptions, setUniqueOptions] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchField, searchValue, dateRange]);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("shift_production")
      .select("*")
      .order("shift_date", { ascending: false });
    if (!error) {
      setRecords(data);
      setFiltered(data);
    } else {
      console.error("Error fetching data:", error.message);
    }
  };

  const filterData = () => {
    let filteredData = [...records];
    if (searchField && searchValue) {
      filteredData = filteredData.filter((r) =>
        r[searchField]?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    if (startDate && endDate) {
      filteredData = filteredData.filter((r) => {
        const date = new Date(r.shift_date);
        return date >= startDate && date <= endDate;
      });
    }
    setFiltered(filteredData);
  };

  useEffect(() => {
    if (searchField) {
      const options = [...new Set(records.map((r) => r[searchField]))];
      setUniqueOptions(options);
    } else {
      setUniqueOptions([]);
    }
  }, [searchField, records]);

  const totalQty = filtered.reduce(
    (sum, r) => sum + Number(r.quantity_produced || 0),
    0
  );

  const printTable = () => {
    const printWindow = window.open("", "_blank");
    const htmlContent = `
      <html>
        <head>
          <title>Shift Production Print</title>
          <style>
            body { font-family: Segoe UI; padding: 20px; font-size: 0.8rem; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h2>Shift Production Records</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Operator</th>
                <th>Plant</th>
                <th>Product</th>
                <th>UOM</th>
                <th>Quantity</th>
                <th>WIP Product</th>
                <th>WIP UOM</th>
                <th>WIP Qty</th>
                <th>By-product</th>
                <th>By-product UOM</th>
                <th>By-product Qty</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  (r) => `
                <tr>
                  <td>${format(new Date(r.shift_date), "dd/MM/yyyy")}</td>
                  <td>${r.shift_name}</td>
                  <td>${r.operator}</td>
                  <td>${r.plant_name}</td>
                  <td>${r.product_name}</td>
                  <td>${r.uom}</td>
                  <td>${r.quantity_produced}</td>
                  <td>${r.wip_product_name}</td>
                  <td>${r.wip_uom}</td>
                  <td>${r.wip_quantity}</td>
                  <td>${r.by_product_name}</td>
                  <td>${r.by_product_uom}</td>
                  <td>${r.by_product_quantity}</td>
                </tr>`
                )
                .join("")}
              <tr style="font-weight: bold;">
                <td colspan="6" style="text-align:right">Total Quantity:</td>
                <td>${totalQty}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{ display: "flex", fontFamily: "Segoe UI", fontSize: "0.8rem" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>📈 Shift End Record</h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option value="">Select Search Option</option>
            <option value="product_name">Search by Product</option>
            <option value="shift_name">Search by Shift</option>
            <option value="plant_name">Search by Plant</option>
            <option value="operator">Search by Operator</option>
          </select>

          {searchField && (
            <select
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            >
              <option value="">Select {searchField}</option>
              {uniqueOptions.map((val, i) => (
                <option key={i} value={val}>
                  {val}
                </option>
              ))}
            </select>
          )}

          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            placeholderText="Select date range"
            dateFormat="dd/MM/yyyy"
          />

          <CSVLink data={filtered} filename="ShiftProduction.csv">
            <button>⬇️ Export CSV</button>
          </CSVLink>
          <button onClick={printTable}>🖨️ Print</button>
          <button
            onClick={() => {
              setSearchField("");
              setSearchValue("");
              setDateRange([null, null]);
              setFiltered(records);
            }}
          >
            🔄 Clear Filter
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>Date</th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>Shift</th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                Operator
              </th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>Plant</th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                Product
              </th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>UOM</th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>Qty</th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>WIP</th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                WIP UOM
              </th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                WIP Qty
              </th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                By-product
              </th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                By-product UOM
              </th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                By-product Qty
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {format(new Date(r.shift_date), "dd/MM/yyyy")}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {r.shift_name}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {r.operator}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {r.plant_name}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {r.product_name}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {r.uom}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {r.quantity_produced}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {r.wip_product_name}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {r.wip_uom}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {r.wip_quantity}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {r.by_product_name}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {r.by_product_uom}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {r.by_product_quantity}
                </td>
              </tr>
            ))}
            <tr style={{ fontWeight: "bold", background: "#f5f5f5" }}>
              <td
                colSpan="6"
                style={{
                  textAlign: "right",
                  padding: "8px",
                  border: "1px solid #ccc",
                }}
              >
                Total Quantity:
              </td>
              <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                {totalQty}
              </td>
              <td colSpan="6" style={{ padding: "8px", border: "1px solid #ccc" }}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
