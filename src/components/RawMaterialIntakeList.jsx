import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "./Sidebar";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function RawMaterialIntakeList() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("raw_material_intake").select("*");
      if (error) console.error("❌ Error loading data:", error.message);
      else {
        setRecords(data);
        setFiltered(data);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let data = [...records];
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.material_name?.toLowerCase().includes(s) ||
          r.storage_location?.toLowerCase().includes(s) ||
          r.supplier?.toLowerCase().includes(s) ||
          r.received_by?.toLowerCase().includes(s)
      );
    }
    if (startDate && endDate) {
      const start = startDate.setHours(0, 0, 0, 0);
      const end = endDate.setHours(23, 59, 59, 999);
      data = data.filter((r) => {
        const d = new Date(r.received_date);
        return d >= start && d <= end;
      });
    }
    setFiltered(data);
    setCurrentPage(1);
  }, [search, dateRange, records]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IntakeRecords");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Raw_Material_Intake.xlsx");
  };

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "Raw_Material_Intake.csv");
  };

  const exportSummaryToCSV = () => {
    const summary = getSummary();
    const worksheet = XLSX.utils.json_to_sheet(summary);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "Daily_Material_Summary.csv");
  };

  const printTable = () => {
    const content = document.getElementById("print-area").innerHTML;
    const win = window.open("", "", "width=900,height=700");
    win.document.write(`<html><head><title>Print</title></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  const printSummary = () => {
    const content = document.getElementById("summary-area").innerHTML;
    const win = window.open("", "", "width=900,height=700");
    win.document.write(`<html><head><title>Print Summary</title></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  const getSummary = () => {
    const summary = {};
    filtered.forEach((r) => {
      const key = `${r.received_date}|${r.material_name}`;
      if (!summary[key]) {
        summary[key] = {
          date: formatDate(r.received_date),
          material: r.material_name,
          qty: parseFloat(r.quantity_received) || 0,
          uom: r.unit_of_measure,
        };
      } else {
        summary[key].qty += parseFloat(r.quantity_received) || 0;
      }
    });
    return Object.values(summary);
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-AU");
  };

  const paginatedData = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>📦 Raw Material Intake Records</h2>

        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "0.4rem", marginRight: "0.5rem", width: "200px" }}
          />
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            placeholderText="Select Date Range"
            dateFormat="dd/MM/yyyy"
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <button onClick={exportToExcel}>📤 Export Excel</button>
          <button onClick={exportToCSV}>📤 Export CSV</button>
          <button onClick={printTable}>🖨️ Print</button>
        </div>

        <div id="print-area">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Material</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>UOM</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Supplier</th>
                <th style={thStyle}>Received By</th>
                <th style={thStyle}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((r, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{formatDate(r.received_date)}</td>
                  <td style={tdStyle}>{r.material_name}</td>
                  <td style={tdStyle}>{r.quantity_received}</td>
                  <td style={tdStyle}>{r.unit_of_measure}</td>
                  <td style={tdStyle}>{r.storage_location}</td>
                  <td style={tdStyle}>{r.supplier}</td>
                  <td style={tdStyle}>{r.received_by}</td>
                  <td style={tdStyle}>{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "1rem" }}>
          Page:{" "}
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                marginRight: "5px",
                background: i + 1 === currentPage ? "#1e293b" : "#eee",
                color: i + 1 === currentPage ? "#fff" : "#000",
                padding: "0.3rem 0.6rem",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div style={{ marginTop: "2rem" }} id="summary-area">
          <h3>📊 Daily Material Summary</h3>
          <button onClick={exportSummaryToCSV}>📥 Export Summary CSV</button>
          <button onClick={printSummary} style={{ marginLeft: "0.5rem" }}>🖨️ Print Summary</button>

          <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Material</th>
                <th style={thStyle}>Total Qty</th>
                <th style={thStyle}>UOM</th>
              </tr>
            </thead>
            <tbody>
              {getSummary().map((row, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{row.date}</td>
                  <td style={tdStyle}>{row.material}</td>
                  <td style={tdStyle}>{row.qty}</td>
                  <td style={tdStyle}>{row.uom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  border: "1px solid #ccc",
  padding: "0.5rem",
  background: "#f0f0f0",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "0.5rem",
};
