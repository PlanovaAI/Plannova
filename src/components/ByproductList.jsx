// Updated ByproductList.jsx with dropdown search options, total summary, and fixed form
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CSVLink } from "react-csv";

export default function ByproductList() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchField, setSearchField] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase.from("byproducts").select("*");
    if (!error) {
      setRecords(data);
      setFiltered(data);
    } else {
      console.error(error);
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
        const recordDate = new Date(r.shift_date);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    setFiltered(filteredData);
  };

  useEffect(() => {
    filterData();
  }, [searchValue, dateRange, searchField]);

  const totalQty = filtered.reduce((sum, r) => sum + Number(r.byproduct_quantity || 0), 0);

  const printTable = () => {
    const printWindow = window.open("", "_blank");
    const htmlContent = `
      <html>
      <head>
        <title>By-products Print</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          tfoot td { font-weight: bold; background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h2>By-products Report</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Shift</th>
              <th>Operator</th>
              <th>Plant</th>
              <th>By-product</th>
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
                <td>${r.byproduct_name}</td>
                <td>${r.byproduct_quantity}</td>
              </tr>`
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5">Total Quantity:</td>
              <td>${totalQty}</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{ display: "flex" }}>
      
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>♻️ By-products Records</h2>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
            <option value="">Select Search Option</option>
            <option value="byproduct_name">Search by By-product</option>
            <option value="product_name">Search by Product</option>
            <option value="shift_name">Search by Shift</option>
            <option value="plant">Search by Plant</option>
            <option value="operator">Search by Operator</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            placeholderText="Select date range"
            dateFormat="dd/MM/yyyy"
          />
          <CSVLink data={filtered} filename="Byproducts.csv">
            <button>⬇️ Export CSV</button>
          </CSVLink>
          <button onClick={printTable}>🖨️ Print</button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Date</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Shift</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Operator</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Plant</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>By-product</th>
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
                <td style={{ padding: "8px" }}>{r.byproduct_name}</td>
                <td style={{ padding: "8px" }}>{r.byproduct_quantity}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
              <td colSpan="5" style={{ padding: "8px", textAlign: "right" }}>Total Quantity:</td>
              <td style={{ padding: "8px" }}>{totalQty}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
