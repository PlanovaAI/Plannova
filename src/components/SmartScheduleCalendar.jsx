// src/components/SmartScheduleCalendar.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import EditScheduleModal from "./EditScheduleModal";

export default function SmartScheduleCalendar() {
  const [scheduleData, setScheduleData] = useState([]);
  const [capacityData, setCapacityData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [selectedJob, setSelectedJob] = useState(null);
  const [draggingJob, setDraggingJob] = useState(null);
  const [hoverCell, setHoverCell] = useState({ date: null, shift: null, plant: null });
  const [autoPushEnabled, setAutoPushEnabled] = useState(false);
  const [viewDays, setViewDays] = useState(7);

  const [rolledJobs, setRolledJobs] = useState([]);
  const [showRolledModal, setShowRolledModal] = useState(false);

  const plantList = ["Pine Mill", "Hardwood Mill", "Rounding Mill", "Destrip Shed"];
  const shifts = ["Morning Shift", "Afternoon Shift", "Night Shift"];
  const today = new Date().toISOString().split("T")[0];

  const normalizePlant = (name) => {
    if (!name) return "";
    const lower = name.trim().toLowerCase();
    if (lower.includes("pine")) return "Pine Mill";
    if (lower.includes("hardwood")) return "Hardwood Mill";
    if (lower.includes("rounding")) return "Rounding Mill";
    if (lower.includes("destrip")) return "Destrip Shed";
    return name.trim();
  };

  // Monday-start N-day window
  const getNextNDays = () => {
    const day = startDate.getDay();
    const mondayOffset = (day === 0 ? -6 : 1) - day;
    const monday = new Date(startDate);
    monday.setDate(startDate.getDate() + mondayOffset);

    const days = [];
    for (let i = 0; i < viewDays; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .order("date", { ascending: true });

    if (!error && data) {
      const normalized = data.map((j) => ({
        ...j,
        plant: normalizePlant(j.plant),
        is_roll_forward: false,
        original_date: j.date,
      }));

      const rolledForward = [];
      const updated = normalized.map((job) => {
        if (job.date < today && job.status !== "Completed") {
          job.date = today;
          job.is_roll_forward = true;
          rolledForward.push(job);
        }
        return job;
      });

      setScheduleData(updated);
      setRolledJobs(rolledForward);
      setShowRolledModal(rolledForward.length > 0);
    } else {
      console.error("❌ Error fetching schedules:", error?.message);
    }
  };

  const fetchCapacity = async () => {
    const { data, error } = await supabase.from("plant_capacity").select("*");
    if (!error && data) setCapacityData(data);
    else console.error("❌ Error fetching capacity:", error?.message);
  };

  useEffect(() => {
    fetchSchedules();
    fetchCapacity();
  }, [viewDays]);

  const nextNDays = getNextNDays();

  const handleDragStart = (e, job) => {
    e.dataTransfer.setData("jobId", job.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingJob(job.id);
  };

  const allowDrop = (e, date, shift, plant) => {
    e.preventDefault();
    setHoverCell({ date, shift, plant });
  };

  const fallbackCap = [
    { plant_name: "Pine Mill", shift: "Morning Shift", max_capacity: 20 },
    { plant_name: "Pine Mill", shift: "Afternoon Shift", max_capacity: 10 },
    { plant_name: "Pine Mill", shift: "Night Shift", max_capacity: 20 },
    { plant_name: "Hardwood Mill", shift: "Morning Shift", max_capacity: 15 },
    { plant_name: "Hardwood Mill", shift: "Afternoon Shift", max_capacity: 15 },
    { plant_name: "Hardwood Mill", shift: "Night Shift", max_capacity: 15 },
    { plant_name: "Rounding Mill", shift: "Morning Shift", max_capacity: 12 },
    { plant_name: "Rounding Mill", shift: "Afternoon Shift", max_capacity: 12 },
    { plant_name: "Rounding Mill", shift: "Night Shift", max_capacity: 12 },
    { plant_name: "Destrip Shed", shift: "Morning Shift", max_capacity: 8 },
    { plant_name: "Destrip Shed", shift: "Afternoon Shift", max_capacity: 8 },
    { plant_name: "Destrip Shed", shift: "Night Shift", max_capacity: 8 },
  ];

  const getCellCapacity = (date, shift, plant) => {
    const jobs = scheduleData.filter(
      (item) => item.date === date && item.shift === shift && item.plant === plant
    );
    const totalQty = jobs.reduce((sum, job) => sum + (Number(job.quantity) || 0), 0);

    const capSource = capacityData.length > 0 ? capacityData : fallbackCap;
    const capacityRow = capSource.find(
      (c) => normalizePlant(c.plant_name) === plant && c.shift === shift
    );

    const maxCap = capacityRow ? Number(capacityRow.max_capacity) : 0;
    const usagePct = maxCap > 0 ? (totalQty / maxCap) * 100 : 0;

    return { totalQty, maxCap, usagePct };
  };

  const lockJob = async (job) => {
    const confirmLock = window.confirm(`Lock job ${job.order_number}?`);
    if (!confirmLock) return;

    const fulfilledQty = job.fulfilled_qty || 0;
    const pendingQty = Math.max((job.quantity || 0) - fulfilledQty, 0);

    const { error } = await supabase
      .from("schedules")
      .update({
        locked: true,
        fulfilled_qty: fulfilledQty,
        pending_qty: pendingQty,
        is_split_order: pendingQty > 0,
      })
      .eq("id", job.id);

    if (error) alert("❌ Failed to lock job: " + error.message);
    else fetchSchedules();
  };

  const getBarColor = (pct) => {
    if (pct > 100) return "#ff0000";
    if (pct >= 90) return "#ff4500";
    if (pct >= 70) return "#ffcc00";
    return "#4CAF50";
  };

  const isLateJob = (job) => {
    if (!job.required_by || job.status === "Completed") return false;
    const todayDate = new Date().setHours(0, 0, 0, 0);
    const requiredDate = new Date(job.required_by).setHours(0, 0, 0, 0);
    return requiredDate < todayDate;
  };

  const renderCell = (date, shift, plant) => {
    const jobs = scheduleData.filter(
      (item) => item.date === date && item.shift === shift && item.plant === plant
    );

    const isHighlighted =
      draggingJob && hoverCell.date === date && hoverCell.shift === shift && hoverCell.plant === plant;

    const { totalQty, maxCap, usagePct } = getCellCapacity(date, shift, plant);

    return (
      <div
        style={{
          minHeight: "40px",
          padding: "2px",
          position: "relative",
          backgroundColor: isHighlighted ? "#fff7cc" : "transparent",
          transition: "background-color 0.2s",
        }}
        onDragOver={(e) => allowDrop(e, date, shift, plant)}
        onDrop={(e) => handleDrop(e, date, shift, plant)}
      >
        {jobs.map((job) => {
          const isLocked = !!job.locked;
          const late = isLateJob(job);
          const split = job.is_split_order;
          const rollForward = job.is_roll_forward;

          return (
            <div
              key={job.id}
              draggable={!isLocked}
              onDragStart={(e) => handleDragStart(e, job)}
              style={{
                backgroundColor: isLocked
                  ? "#f3f4f6"
                  : rollForward
                  ? "#eeeeee"
                  : late
                  ? "#ffe6e6"
                  : "#e0f0ff",
                border: "1px solid #0077cc",
                borderRadius: "4px",
                padding: "2px 3px",
                marginBottom: "2px",
                fontSize: "0.6rem",
                opacity: isLocked ? 0.6 : 1,
                maxWidth: "120px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: isLocked ? "default" : "grab",
                transition: "all 0.25s ease-in-out",
              }}
              title={`${job.order_number} – ${job.product_name}`}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{isLocked ? "🔒 " : ""}{job.order_number}</strong>
                {!isLocked && (
                  <>
                    <span
                      style={{ cursor: "pointer", color: "#0077cc", fontSize: "0.65rem", marginLeft: "4px" }}
                      onClick={() => setSelectedJob(job)}
                      title="Edit Job"
                    >
                      ✏
                    </span>
                    <span
                      style={{ cursor: "pointer", color: "green", fontSize: "0.65rem", marginLeft: "6px" }}
                      onClick={() => lockJob(job)}
                      title="Lock Job"
                    >
                      🔒
                    </span>
                  </>
                )}
              </div>
              <div style={{ fontSize: "0.55rem", color: "#444" }}>
                {job.required_by ? `Req: ${new Date(job.required_by).toLocaleDateString("en-AU")}` : "Req: Not Set"}
              </div>
              <div>{job.product_name}</div>
              <div>
                Qty: {job.fulfilled_qty || 0}/{job.quantity} {job.uom}
              </div>
              <div>
                {split && <span style={splitBadgeStyle}>Split</span>}
                {late && <span style={lateBadgeStyle}>⚠ Late</span>}
                {rollForward && <span style={rollBadgeStyle}>🕒 Roll</span>}
              </div>
            </div>
          );
        })}

        {maxCap > 0 && (
          <div style={{ marginTop: "2px", backgroundColor: "#eee", height: "10px", borderRadius: "3px", position: "relative" }}>
            <div
              style={{
                width: `${Math.min(usagePct, 100)}%`,
                backgroundColor: getBarColor(usagePct),
                height: "100%",
                borderRadius: "3px",
                transition: "width 0.3s ease-in-out",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "0.55rem",
                color: usagePct > 70 ? "#fff" : "#000",
                lineHeight: "10px",
              }}
            >
              {usagePct === 0 ? "100% free" : `${usagePct.toFixed(0)}%`}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex" }}>
      
      <div style={{ flex: 1, padding: "1rem", fontFamily: "Segoe UI" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>📅 Smart Scheduler</h2>

        {/* 🔹 View Selector */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ marginRight: "0.5rem" }}>View:</label>
          <select value={viewDays} onChange={(e) => setViewDays(Number(e.target.value))}>
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
            <option value={30}>1 Month</option>
          </select>
        </div>

        {/* Legend */}
        <div style={{ marginBottom: "1rem", fontSize: "0.7rem", background: "#f9f9f9", padding: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}>
          <strong>Legend:</strong> &nbsp;
          <span style={{ background: "#e0f0ff", padding: "1px 3px", borderRadius: "3px" }}>Normal</span> &nbsp;
          <span style={{ background: "#ffe6e6", padding: "1px 3px", borderRadius: "3px" }}>⚠ Late</span> &nbsp;
          <span style={{ background: "#eeeeee", padding: "1px 3px", borderRadius: "3px" }}>🕒 Roll</span> &nbsp;
          <span style={{ background: "#f3f4f6", padding: "1px 3px", borderRadius: "3px" }}>🔒 Lock</span> &nbsp;
          <span style={{ background: "#ffcc00", padding: "1px 3px", borderRadius: "3px" }}>Split</span>
        </div>

        {/* Rolled Jobs Button */}
        {rolledJobs.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={() => setShowRolledModal(true)} style={rolledBtn}>
              🕒 View Rolled Jobs ({rolledJobs.length})
            </button>
          </div>
        )}

        {/* Rolled Jobs Modal */}
        {showRolledModal && (
          <div style={overlayStyle}>
            <div style={modalStyle}>
              <h3>🕒 Auto-Rolled Jobs</h3>
              <ul style={{ fontSize: "0.8rem" }}>
                {rolledJobs.map(job => (
                  <li key={job.id}>
                    {job.order_number} – {job.product_name} (from {new Date(job.original_date).toLocaleDateString("en-AU")} → Today)
                  </li>
                ))}
              </ul>
              <div style={{ textAlign: "right" }}>
                <button onClick={() => setShowRolledModal(false)} style={closeBtn}>Close</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={autoPushEnabled}
              onChange={(e) => setAutoPushEnabled(e.target.checked)}
            />{" "}
            ⚙ Auto-Push Weekly Plan
          </label>
        </div>

        <div style={{ overflowX: "auto", maxWidth: "1100px", margin: "0 auto" }}>
          {plantList.map((plant) => (
            <div key={plant} style={{ marginBottom: "2rem" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>🏭 {plant}</h3>
              <table
                key={scheduleData.length}
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.7rem",
                  minWidth: "650px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>Shift</th>
                    {nextNDays.map((date) => (
                      <th key={date} style={thStyle}>
                        {new Date(date).toLocaleDateString("en-AU", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift) => (
                    <tr key={shift}>
                      <td style={tdStyle}><strong>{shift}</strong></td>
                      {nextNDays.map((date) => (
                        <td key={date} style={tdStyle}>
                          {renderCell(date, shift, plant)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {selectedJob && (
          <EditScheduleModal
            job={selectedJob}
            onClose={() => {
              setSelectedJob(null);
              fetchSchedules();
            }}
            onSave={fetchSchedules}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- Styles ---------------- */
const thStyle = { border: "1px solid #ccc", padding: "4px", backgroundColor: "#f0f0f0", textAlign: "center", fontSize: "0.7rem" };
const tdStyle = { border: "1px solid #ccc", padding: "4px", verticalAlign: "top", fontSize: "0.7rem" };
const splitBadgeStyle = { backgroundColor: "#ffcc00", color: "#000", padding: "1px 4px", marginLeft: "2px", fontSize: "0.55rem", fontWeight: "bold", borderRadius: "3px" };
const lateBadgeStyle = { backgroundColor: "#ff4d4d", color: "#fff", padding: "1px 4px", marginLeft: "2px", fontSize: "0.55rem", fontWeight: "bold", borderRadius: "3px" };
const rollBadgeStyle = { backgroundColor: "#cccccc", color: "#000", padding: "1px 4px", marginLeft: "2px", fontSize: "0.55rem", fontWeight: "bold", borderRadius: "3px" };

const overlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modalStyle = { backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px", width: "45%", maxWidth: "450px", fontFamily: "Segoe UI", fontSize: "0.8rem", boxShadow: "0 0 12px rgba(0,0,0,0.3)" };
const closeBtn = { padding: "0.5rem 1rem", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
const rolledBtn = { padding: "0.4rem 0.8rem", fontSize: "0.75rem", backgroundColor: "#eee", border: "1px solid #888", borderRadius: "5px", cursor: "pointer" };
