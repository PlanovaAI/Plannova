// src/components/OrderList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

import ManualSchedulingModal from "./ManualSchedulingModal";

export default function OrderList() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [showManualModal, setShowManualModal] = useState(false);
  const [splitJob, setSplitJob] = useState(null);
  const [splitDetails, setSplitDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .neq("status", "Scheduled")
      .neq("status", "Completed")
      .order("created_at", { ascending: false });

    if (!error && data) {
      // 🔹 Auto-sort late orders to top
      const sorted = [...data].sort((a, b) => {
        const lateA = isLateOrder(a);
        const lateB = isLateOrder(b);

        if (lateA && !lateB) return -1;
        if (!lateA && lateB) return 1;

        // If both late or both not late, sort by required_by ascending
        const dateA = a.required_by ? new Date(a.required_by) : new Date(8640000000000000); // far future
        const dateB = b.required_by ? new Date(b.required_by) : new Date(8640000000000000);
        return dateA - dateB;
      });

      setJobs(sorted);
    } else {
      console.error("❌ Error fetching jobs:", error?.message);
    }
  };

  const handleCheckboxChange = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedJobs(jobs.map((job) => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const scheduleSelectedJobs = () => {
    const selected = jobs.filter((job) => selectedJobs.includes(job.id));
    localStorage.setItem("selectedJobs", JSON.stringify(selected));
    navigate("/scheduler");
  };

  const openManualModal = () => {
    setShowManualModal(true);
  };

  const closeManualModal = () => {
    setShowManualModal(false);
    fetchJobs();
  };

  const showSplitBadge = (job) => {
    const fulfilledQty = Number(job.fulfilled_quantity) || 0;
    const totalQty = Number(job.quantity) || 0;
    return job.is_split_order && fulfilledQty < totalQty;
  };

  const isLateOrder = (job) => {
    if (!job.required_by || job.status === "Completed") return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const requiredDate = new Date(job.required_by).setHours(0, 0, 0, 0);
    return requiredDate < today;
  };

  const fetchSplitDetails = async (job) => {
    const { data: stockData } = await supabase
      .from("inventory_stock")
      .select("quantity")
      .eq("order_number", job.order_number);

    const stockQty = stockData?.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0) || 0;

    const { data: prodData } = await supabase
      .from("shift_production")
      .select("quantity")
      .eq("order_number", job.order_number);

    const prodQty = prodData?.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0) || 0;

    const totalFulfilled = stockQty + prodQty;
    const remainingQty = Math.max((Number(job.quantity) || 0) - totalFulfilled, 0);

    setSplitDetails({
      stock: stockQty,
      production: prodQty,
      remaining: remainingQty,
      fulfilled: totalFulfilled,
      total: Number(job.quantity) || 0,
    });
  };

  // 🔹 Auto-refresh split modal every 5 seconds
  useEffect(() => {
    if (!splitJob) return;
    fetchSplitDetails(splitJob);
    const interval = setInterval(() => fetchSplitDetails(splitJob), 5000);
    return () => clearInterval(interval);
  }, [splitJob]);

  const fulfillmentPercent = splitDetails
    ? ((splitDetails.fulfilled / splitDetails.total) * 100).toFixed(0)
    : 0;

  return (
    <div style={{ display: "flex" }}>
      
      <div style={{ flex: 1, padding: "2rem", fontFamily: "Segoe UI", fontSize: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>📋 Orders List</h2>
          <div>
            <button
              onClick={openManualModal}
              style={buttonStyle}
              disabled={selectedJobs.length === 0}
            >
              ✏️ Manual Schedule
            </button>
            <button
              onClick={scheduleSelectedJobs}
              style={{ ...buttonStyle, marginLeft: "0.5rem" }}
              disabled={selectedJobs.length === 0}
            >
              📅 Smart AI Schedule
            </button>
          </div>
        </div>

        <hr style={{ margin: "1rem 0" }} />

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr>
              <th style={thStyle}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedJobs.length === jobs.length && jobs.length > 0}
                />
              </th>
              <th style={thStyle}>Order #</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Quantity</th>
              <th style={thStyle}>UOM</th>
              <th style={thStyle}>Plant</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Required By</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const late = isLateOrder(job);
              return (
                <tr
                  key={job.id}
                  style={{
                    backgroundColor: late ? "#ffe6e6" : "transparent",
                  }}
                >
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => handleCheckboxChange(job.id)}
                    />
                  </td>
                  <td style={tdStyle}>
                    {job.order_number}
                    {showSplitBadge(job) && (
                      <span
                        style={splitBadgeStyle}
                        title="Click to view split details"
                        onClick={() => setSplitJob(job)}
                      >
                        Split
                      </span>
                    )}
                    {late && (
                      <span style={lateBadgeStyle} title="Order is past required date">
                        ⚠ Late
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>{job.customer_name}</td>
                  <td style={tdStyle}>{job.product_name}</td>
                  <td style={tdStyle}>{job.quantity}</td>
                  <td style={tdStyle}>{job.uom}</td>
                  <td style={tdStyle}>{job.plant_name}</td>
                  <td style={tdStyle}>{job.status}</td>
                  <td style={tdStyle}>
                    {job.required_by
                      ? new Date(job.required_by).toLocaleDateString("en-AU")
                      : "Not Set"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {showManualModal && (
          <ManualSchedulingModal
            selectedJobs={jobs.filter((j) => selectedJobs.includes(j.id))}
            onClose={closeManualModal}
          />
        )}

        {/* 🔹 Split Details Modal */}
        {splitJob && splitDetails && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h3>🔹 Split Order Details – {splitJob.order_number}</h3>

              <table style={{ width: "100%", marginBottom: "1rem", fontSize: "0.75rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f0f0f0" }}>
                    <th style={thStyle}>Source</th>
                    <th style={thStyle}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={tdStyle}>From Stock</td>
                    <td style={tdStyle}>{splitDetails.stock}</td>
                  </tr>
                  <tr>
                    <td style={tdStyle}>Production Fulfilled</td>
                    <td style={tdStyle}>{splitDetails.production}</td>
                  </tr>
                  <tr>
                    <td style={tdStyle}>Remaining</td>
                    <td style={tdStyle}>{splitDetails.remaining}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ margin: "0.5rem 0" }}>
                <div
                  style={{
                    height: "12px",
                    width: "100%",
                    backgroundColor: "#eee",
                    borderRadius: "6px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${fulfillmentPercent}%`,
                      backgroundColor: "#4CAF50",
                      transition: "width 0.3s",
                    }}
                  ></div>
                </div>
                <small>{fulfillmentPercent}% Fulfilled</small>
              </div>

              <button
                style={{ ...buttonStyle, marginTop: "1rem" }}
                onClick={() => {
                  setSplitJob(null);
                  setSplitDetails(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Styles ---------------- */
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
const buttonStyle = {
  padding: "0.4rem 0.8rem",
  fontSize: "0.75rem",
  fontFamily: "Segoe UI",
  backgroundColor: "#f0f8ff",
  border: "1px solid #0077cc",
  borderRadius: "4px",
  cursor: "pointer",
};
const splitBadgeStyle = {
  backgroundColor: "#ffcc00",
  color: "#000",
  padding: "2px 5px",
  marginLeft: "6px",
  fontSize: "0.6rem",
  fontWeight: "bold",
  borderRadius: "4px",
  cursor: "pointer",
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

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "1rem 1.5rem",
  borderRadius: "6px",
  width: "350px",
  fontSize: "0.75rem",
  fontFamily: "Segoe UI",
};
