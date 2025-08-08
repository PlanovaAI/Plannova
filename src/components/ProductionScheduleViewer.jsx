// src/components/ProductionScheduleViewer.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";


export default function ProductionScheduleViewer() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("locked", true)
      .order("date", { ascending: true });

    if (!error) {
      setSchedules(data || []);
    } else {
      console.error("❌ Error fetching schedules:", error.message);
    }
  };

  const computeStatus = (job) => {
    const producedQty = Number(job.fulfilled_qty || 0);
    const scheduledQty = Number(job.quantity || 0);
    const percent = scheduledQty > 0 ? Math.round((producedQty / scheduledQty) * 100) : 0;

    if (producedQty >= scheduledQty && scheduledQty > 0) {
      return { icon: "✅", text: "Completed", percent };
    } else {
      return { icon: "🟡", text: "In Progress", percent };
    }
  };

  const isLate = (job) => {
    if (!job.required_by) return false;
    const required = new Date(job.required_by).setHours(0, 0, 0, 0);
    const scheduled = new Date(job.date).setHours(0, 0, 0, 0);
    return scheduled > required;
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "1rem", fontFamily: "Segoe UI" }}>
        <h2 style={{ marginBottom: "1rem" }}>📊 Production Schedule Viewer</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Order #</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Shift</th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Qty</th>
              <th style={thStyle}>Fulfilled</th>
              <th style={thStyle}>Pending</th>
              <th style={thStyle}>UOM</th>
              <th style={thStyle}>Plant</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((job) => {
              const status = computeStatus(job);
              const late = isLate(job);

              return (
                <tr
                  key={job.id}
                  style={{
                    backgroundColor: late ? "#fff2f2" : "transparent",
                  }}
                >
                  <td style={tdStyle}>
                    {job.order_number}
                    {job.is_split_order && (
                      <span style={splitBadgeStyle}>Split</span>
                    )}
                    {late && <span style={lateBadgeStyle}>⚠ Late</span>}
                  </td>
                  <td style={tdStyle}>
                    {job.date
                      ? new Date(job.date).toLocaleDateString("en-AU")
                      : ""}
                  </td>
                  <td style={tdStyle}>{job.shift}</td>
                  <td style={tdStyle}>{job.product_name}</td>
                  <td style={tdStyle}>{job.quantity}</td>
                  <td style={tdStyle}>{job.fulfilled_qty || 0}</td>
                  <td style={tdStyle}>{job.pending_qty || 0}</td>
                  <td style={tdStyle}>{job.uom}</td>
                  <td style={tdStyle}>{job.plant}</td>
                  <td style={tdStyle}>
                    {status.icon} {status.text} ({status.percent}%)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Styles ---------------- */
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.75rem",
  fontFamily: "Segoe UI",
};

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
  textAlign: "left",
};

const splitBadgeStyle = {
  backgroundColor: "#ffcc00",
  color: "#000",
  padding: "2px 5px",
  marginLeft: "6px",
  fontSize: "0.6rem",
  fontWeight: "bold",
  borderRadius: "4px",
};

const lateBadgeStyle = {
  backgroundColor: "#ff4d4d",
  color: "#fff",
  padding: "2px 5px",
  marginLeft: "6px",
  fontSize: "0.6rem",
  fontWeight: "bold",
  borderRadius: "4px",
};
