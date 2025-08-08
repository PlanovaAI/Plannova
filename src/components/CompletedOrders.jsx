// src/components/CompletedOrders.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function CompletedOrders() {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "Completed");

    if (error) {
      console.error("Error fetching completed orders:", error.message);
    } else {
      const sorted = [...data].sort((a, b) => {
        const dateA = a.required_by ? new Date(a.required_by) : new Date(8640000000000000);
        const dateB = b.required_by ? new Date(b.required_by) : new Date(8640000000000000);
        return dateA - dateB || new Date(b.created_at) - new Date(a.created_at);
      });

      setCompletedOrders(sorted);
      setFilteredOrders(sorted);
      setProductOptions([...new Set(data.map(item => item.product_name))]);
    }
  };

  useEffect(() => {
    let filtered = [...completedOrders];

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (productFilter) {
      filtered = filtered.filter(order => order.product_name === productFilter);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.order_date || order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredOrders(filtered);
  }, [searchTerm, productFilter, startDate, endDate, completedOrders]);

  const exportToCSV = () => {
    const csvData = filteredOrders.map(({ id, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Completed Orders");
    const excelBuffer = XLSX.write(workbook, { bookType: "csv", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "text/csv" }), "completed_orders.csv");
  };

  const exportToExcel = () => {
    const excelData = filteredOrders.map(({ id, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Completed Orders");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "completed_orders.xlsx");
  };

  const printTable = () => {
    const printContent = document.getElementById("completed-orders-table").outerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Completed Orders</title>
          <style>
            table { border-collapse: collapse; width: 100%; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const showSplitBadge = (order) => order.is_split_order;
  const wasLateOrder = (order) => {
    if (!order.required_by) return false;
    return new Date(order.required_by) < new Date(order.created_at);
  };

  const totalQuantity = filteredOrders.reduce((sum, order) => sum + Number(order.quantity || 0), 0);

  // 🔹 Deduct inventory when shipping
  const shipOrder = async (order) => {
    if (!window.confirm(`Ship order ${order.order_number}? This will deduct inventory.`)) return;

    const { data: stock, error: fetchError } = await supabase
      .from("inventory_stock")
      .select("*")
      .eq("product_name", order.product_name)
      .eq("plant_name", order.plant_name)
      .maybeSingle();

    if (fetchError) {
      alert("❌ Error fetching inventory: " + fetchError.message);
      return;
    }

    if (!stock || stock.quantity < order.quantity) {
      alert("⚠ Not enough stock to fulfill this shipment.");
      return;
    }

    // Deduct stock
    const newQty = stock.quantity - order.quantity;
    const { error: updateError } = await supabase
      .from("inventory_stock")
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq("id", stock.id);

    if (updateError) {
      alert("❌ Failed to update inventory: " + updateError.message);
      return;
    }

    alert(`✅ Order ${order.order_number} shipped. Inventory updated.`);
    fetchCompletedOrders();
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>✅ Completed Orders</h2>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem", alignItems: "flex-end" }}>
          <input
            type="text"
            placeholder="Search by customer or order #"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={filterInputStyle}
          />
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            style={filterInputStyle}
          >
            <option value="">All Products</option>
            {productOptions.map(product => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
          <div style={{ width: "200px" }}>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable
              placeholderText="Select date range"
              dateFormat="dd/MM/yyyy"
              className="form-control"
              wrapperClassName="datePicker"
              popperPlacement="bottom-start"
              style={filterInputStyle}
            />
          </div>
        </div>

        {/* Table */}
        {filteredOrders.length === 0 ? (
          <p>No completed jobs found.</p>
        ) : (
          <>
            <div id="completed-orders-table">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Order #</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Customer</th>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>UOM</th>
                    <th style={thStyle}>Plant</th>
                    <th style={thStyle}>Storage Yard</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} style={{ backgroundColor: wasLateOrder(order) ? "#fff2f2" : "transparent" }}>
                      <td style={tdStyle}>
                        {order.order_number}
                        {showSplitBadge(order) && <span style={splitBadgeStyle}>Split</span>}
                        {wasLateOrder(order) && <span style={lateBadgeStyle}>⚠ Late</span>}
                      </td>
                      <td style={tdStyle}>{new Date(order.order_date || order.created_at).toLocaleDateString("en-AU")}</td>
                      <td style={tdStyle}>{order.customer_name}</td>
                      <td style={tdStyle}>{order.product_name}</td>
                      <td style={tdStyle}>{order.quantity}</td>
                      <td style={tdStyle}>{order.unit_of_measure || order.uom}</td>
                      <td style={tdStyle}>{order.plant_name}</td>
                      <td style={tdStyle}>{order.storage_yard}</td>
                      <td style={tdStyle}>
                        <button onClick={() => shipOrder(order)} style={buttonStyle}>🚚 Ship</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary + Export */}
            <div style={{ marginTop: "1rem", fontSize: "14px" }}>
              <p><strong>📊 Total Completed Orders:</strong> {filteredOrders.length}</p>
              <p><strong>📦 Total Quantity:</strong> {totalQuantity}</p>
              <button onClick={exportToCSV} style={buttonStyle}>⬇️ Export CSV</button>
              <button onClick={exportToExcel} style={buttonStyle}>📊 Export Excel</button>
              <button onClick={printTable} style={buttonStyle}>🖨️ Print</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const filterInputStyle = { width: "200px", padding: "0.4rem", fontSize: "14px" };
const thStyle = { border: "1px solid #ccc", padding: "8px", background: "#f0f0f0", textAlign: "left" };
const tdStyle = { border: "1px solid #ccc", padding: "8px" };
const buttonStyle = { marginRight: "0.5rem", padding: "6px 12px", fontSize: "12px", cursor: "pointer" };
const splitBadgeStyle = { backgroundColor: "#ffcc00", color: "#000", padding: "2px 5px", marginLeft: "6px", fontSize: "0.6rem", fontWeight: "bold", borderRadius: "4px" };
const lateBadgeStyle = { backgroundColor: "#ff4d4d", color: "#fff", padding: "2px 5px", marginLeft: "6px", fontSize: "0.6rem", fontWeight: "bold", borderRadius: "4px" };
