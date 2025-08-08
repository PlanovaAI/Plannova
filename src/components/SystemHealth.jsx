// src/components/SystemHealth.jsx
import React, { useEffect, useState } from "react";

import { supabase } from "../supabaseClient";

export default function SystemHealth() {
  const [pendingJobs, setPendingJobs] = useState(0);
  const [scheduledJobs, setScheduledJobs] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [capacityData, setCapacityData] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10) // default to today
  );

  const normalize = (name) => name?.trim() || "";
  const today = new Date().toISOString().slice(0, 10);

  const fetchData = async () => {
    // 1️⃣ Jobs table (Pending + Completed)
    const { data: jobsData } = await supabase.from("jobs").select("*");

    // 2️⃣ Schedules table (Scheduled, filtered to today & future)
    const { data: schedulesData } = await supabase
      .from("schedules")
      .select("*")
      .gte("date", today);

    // 3️⃣ Plant capacity for all plants/shifts
    const { data: capData } = await supabase.from("plant_capacity_view").select("*");

    // 🔹 Calculate counts
    const pendingCount = jobsData?.filter((j) => j.status === "Pending").length || 0;
    const completedCount = jobsData?.filter((j) => j.status === "Completed").length || 0;
    const scheduledCount = schedulesData?.length || 0;

    // 🔹 Update states
    setPendingJobs(pendingCount);
    setCompletedJobs(completedCount);
    setScheduledJobs(scheduledCount);
    setJobs(schedulesData || []); // only active scheduled jobs
    setCapacityData(capData?.map((c) => ({ ...c, plant_name: normalize(c.plant_name) })) || []);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const totalJobs = pendingJobs + scheduledJobs + completedJobs;

  // 🔹 Daily capacity usage for selected date
  const getUsage = (plant, shift, maxCapacity) => {
    const shiftJobs = jobs.filter(
      (j) =>
        j.plant === plant &&
        j.shift === shift &&
        j.date === selectedDate // Only selected day
    );

    const totalQty = shiftJobs.reduce((sum, j) => sum + (Number(j.quantity) || 0), 0);
    const pct = maxCapacity > 0 ? ((totalQty / maxCapacity) * 100).toFixed(1) : 0;
    return { totalQty, pct };
  };

  // 🔹 Styles
  const boxStyle = {
    display: "inline-block",
    padding: "0.5rem 1rem",
    marginRight: "1rem",
    borderRadius: "5px",
    fontSize: "0.85rem",
    border: "1px solid #ccc",
  };

  const thStyle = {
    border: "1px solid #ccc",
    padding: "6px",
    textAlign: "center",
    fontWeight: "bold",
  };

  const tdStyle = {
    border: "1px solid #ccc",
    padding: "6px",
    textAlign: "center",
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "1rem", fontFamily: "Segoe UI" }}>
        <h2 style={{ marginBottom: "1rem" }}>💻 System Health & Status</h2>

        {/* 🔹 Date Selector */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ marginRight: "0.5rem", fontWeight: "bold" }}>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: "0.3rem", fontSize: "0.8rem" }}
          />
        </div>

        {/* 🔹 Summary Boxes */}
        <div style={{ marginBottom: "1rem" }}>
          <span style={{ ...boxStyle, backgroundColor: "#f8f8f8" }}>
            📋 Total Jobs: {totalJobs}
          </span>
          <span style={{ ...boxStyle, backgroundColor: "#fff8dc" }}>
            ⏳ Pending: {pendingJobs}
          </span>
          <span style={{ ...boxStyle, backgroundColor: "#e6f0ff" }}>
            📌 Scheduled: {scheduledJobs}
          </span>
          <span style={{ ...boxStyle, backgroundColor: "#e6ffe6" }}>
            ✅ Completed: {completedJobs}
          </span>
        </div>

        {/* 🔹 Capacity Usage Table */}
        <h3 style={{ marginBottom: "0.5rem" }}>
          🏭 Plant Capacity Usage ({selectedDate})
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.8rem",
            marginBottom: "1rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={thStyle}>Plant</th>
              <th style={thStyle}>Shift</th>
              <th style={thStyle}>Load</th>
              <th style={thStyle}>Usage %</th>
            </tr>
          </thead>
          <tbody>
            {capacityData.length > 0 ? (
              capacityData.map((row, idx) => {
                const { totalQty, pct } = getUsage(
                  row.plant_name,
                  row.shift,
                  Number(row.max_capacity) || 0
                );
                return (
                  <tr key={idx}>
                    <td style={tdStyle}>{row.plant_name}</td>
                    <td style={tdStyle}>{row.shift}</td>
                    <td style={tdStyle}>{totalQty}/{row.max_capacity}</td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          width: "100%",
                          backgroundColor: "#eee",
                          borderRadius: "4px",
                          height: "12px",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor:
                              pct >= 100 ? "#ff4d4d" :
                              pct >= 70 ? "#ffcc00" : "#4CAF50",
                            height: "100%",
                            borderRadius: "4px",
                            transition: "width 0.3s",
                          }}
                        ></div>
                        <span
                          style={{
                            position: "absolute",
                            top: 0,
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: "0.65rem",
                            color: "#000",
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td style={tdStyle} colSpan={4} align="center">
                  No capacity data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
