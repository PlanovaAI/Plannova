// src/components/WIPList.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import { CSVLink } from "react-csv";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function WIPList() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchField, setSearchField] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase.from("wip_output").select("*");
    if (!error) {
      setRecords(data);
      setFiltered(data);
    } else {
      console.error("Error loading WIP data:", error);
    }
  };

  const handleSearchFieldChange = (e) => {
    const selectedField = e.target.value;
    setSearchField(selectedField);
    setSearchValue("");
    if (selectedField) {
      const uniqueOptions = [
        ...new Set(records.map((r) => r[selectedField]).filter(Boolean)),
      ];
      setOptions(uniqueOptions);
    } else {
      setOptions([]);
    }
  };

  const filterData = () => {
    let data = [...records];

    if (searchField && searchValue) {
      data = data.filter((r) => r[searchField] === searchValue);
    }

    if (startDate && endDate) {
      data = data.filter((r) => {
        const date = new Date(r.shift_date);
        return date >= startDate && date <= endDate;
      });
    }

    setFiltered(data);
  };

  useEffect(() => {
    filterData();
  }, [searchField, searchValue, dateRange]);

  const totalQty = filtered.reduce((sum, r) => sum + Number(r.wip_quantity || 0), 0);

  const printTable = () => {
    const printWindow = window.open("", "_blank");
    const htmlContent = `
      <html>
        <head>
          <title>WIP Print</title>
          <style>
            body { font-family: Segoe UI; padding: 20px; font-size: 0.8rem; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h2>WIP Output Records</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Operator</th>
                <th>Plant</th>
                <th>WIP Product</th>
                <th>Quantity</th>
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
                  <td>${r.plant}</td>
                  <td>${r.wip_product_name}</td>
                  <td>${r.wip_quantity}</td>
                </tr>`
                )
                .join("")}
              <tr style="font-weight: bold;">
                <td colspan="5" style="text-align:right">Total Quantity:</td>
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

  const clearFilters = () => {
    setSearchField("");
    setSearchValue("");
    setDateRange([null, null]);
    setFiltered(records);
    setOptions([]);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem", fontFamily: "Segoe UI", fontSize: "0.8rem" }}>
        <h2>🔄 WIP Output Records</h2>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <select value={searchField} onChange={handleSearchFieldChange}>
            <option value="">Select Search Option</option>
            <option value="wip_product_name">Search by Product</option>
            <option value="shift_name">Search by Shift</option>
            <option value="plant">Search by Plant</option>
            <option value="operator">Search by Operator</option>
          </select>

          {searchField && (
            <select value={searchValue} onChange={(e) => setSearchValue(e.target.value)}>
              <option value="">Select {searchField}</option>
              {options.map((option, i) => (
                <option key={i} value={option}>
                  {option}
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

          <button onClick={clearFilters}>❌ Clear Filters</button>

          <CSVLink data={filtered} filename="WIP.csv">
            <button>⬇️ Export CSV</button>
          </CSVLink>
          <button onClick={printTable}>🖨️ Print</button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Date</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Shift</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Operator</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Plant</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>WIP Product</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: "8px" }}>{format(new Date(r.shift_date), "dd/MM/yyyy")}</td>
                <td style={{ padding: "8px" }}>{r.shift_name}</td>
                <td style={{ padding: "8px" }}>{r.operator}</td>
                <td style={{ padding: "8px" }}>{r.plant}</td>
                <td style={{ padding: "8px" }}>{r.wip_product_name}</td>
                <td style={{ padding: "8px" }}>{r.wip_quantity}</td>
              </tr>
            ))}
            <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
              <td colSpan="5" style={{ padding: "8px", textAlign: "right" }}>Total Quantity:</td>
              <td style={{ padding: "8px" }}>{totalQty}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
