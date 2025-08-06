import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "./Sidebar";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function InventoryStock() {
  const [stock, setStock] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const fetchStock = async () => {
      const { data, error } = await supabase.from("inventory_stock").select("*");
      if (error) console.error("Error loading inventory stock:", error);
      else {
        setStock(data);
        setFiltered(data);
      }
    };
    fetchStock();
  }, []);

  useEffect(() => {
    let data = [...stock];

    if (filterType && filterValue) {
      data = data.filter((r) =>
        r[filterType]?.toLowerCase?.().includes(filterValue.toLowerCase())
      );
    }

    if (startDate && endDate) {
      data = data.filter((r) => {
        const entryDate = new Date(r.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [filterType, filterValue, startDate, endDate, stock]);

  const getUniqueValues = (type) => {
    if (!type) return [];
    const values = stock.map((r) => r[type]).filter(Boolean);
    return [...new Set(values)];
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "InventoryStock");
    XLSX.writeFile(workbook, "InventoryStock.xlsx");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const html = `
      <html>
        <head>
          <title>Inventory Stock</title>
          <style>
            body { font-family: Segoe UI; font-size: 0.75rem; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f0f0f0; }
          </style>
        </head>
        <body>
          <h2>Inventory Stock</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Plant</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  (r) => `
                <tr>
                  <td>${new Date(r.date).toLocaleDateString("en-AU")}</td>
                  <td>${r.product}</td>
                  <td>${r.type}</td>
                  <td>${r.quantity}</td>
                  <td>${r.unit}</td>
                  <td>${r.plant}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const clearFilters = () => {
    setFilterType("");
    setFilterValue("");
    setDateRange([null, null]);
    setFiltered(stock);
  };

  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const tableStyle = {
    borderCollapse: "collapse",
    width: "100%",
    fontSize: "0.75rem",
    fontFamily: "Segoe UI",
  };

  const cellStyle = {
    padding: "8px",
    border: "1px solid #ccc",
  };

  const headerStyle = {
    ...cellStyle,
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  };

  const buttonStyle = {
    padding: "6px 10px",
    fontSize: "0.75rem",
    fontFamily: "Segoe UI",
    height: "32px",
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>📦 Inventory Stock</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "1rem" }}>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setFilterValue(""); }} style={buttonStyle}>
            <option value="">Choose Filter</option>
            <option value="product">Product</option>
            <option value="type">Type</option>
            <option value="plant">Plant</option>
          </select>

          {filterType && (
            <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} style={buttonStyle}>
              <option value="">Select {filterType}</option>
              {getUniqueValues(filterType).map((val, i) => (
                <option key={i} value={val}>{val}</option>
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
            className="date-picker"
            style={buttonStyle}
          />

          <button onClick={clearFilters} style={buttonStyle}>🔄 Clear Filter</button>

          <CSVLink data={filtered} filename="InventoryStock.csv" style={{ textDecoration: "none" }}>
            <button style={buttonStyle}>⬇️ CSV</button>
          </CSVLink>

          <button onClick={handleExportExcel} style={buttonStyle}>📊 Excel</button>
          <button onClick={handlePrint} style={buttonStyle}>🖨️ Print</button>
        </div>

        {filtered.length === 0 ? (
          <p>No inventory records found.</p>
        ) : (
          <>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerStyle}>Date</th>
                  <th style={headerStyle}>Product</th>
                  <th style={headerStyle}>Type</th>
                  <th style={headerStyle}>Quantity</th>
                  <th style={headerStyle}>Unit</th>
                  <th style={headerStyle}>Plant</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((r, idx) => (
                  <tr key={idx}>
                    <td style={cellStyle}>{new Date(r.date).toLocaleDateString("en-AU")}</td>
                    <td style={cellStyle}>{r.product}</td>
                    <td style={cellStyle}>{r.type}</td>
                    <td style={cellStyle}>{r.quantity}</td>
                    <td style={cellStyle}>{r.unit}</td>
                    <td style={cellStyle}>{r.plant}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: "1rem" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{ ...buttonStyle, backgroundColor: page === currentPage ? "#ddd" : "#fff" }}
                >
                  {page}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
