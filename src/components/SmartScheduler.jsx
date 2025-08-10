// src/components/SmartScheduler.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import { format, addDays } from "date-fns";
import EditScheduleModal from "./EditScheduleModal";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const shifts = ["Morning Shift", "Afternoon Shift", "Night Shift"];

export default function SmartScheduler() {
  const [scheduleData, setScheduleData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [plantCapacities, setPlantCapacities] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const getDates = () => Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  useEffect(() => {
    fetchScheduledJobs();
    fetchPlantCapacities();
  }, [startDate]);

  const fetchScheduledJobs = async () => {
    const { data, error } = await supabase.from("schedules").select("*");
    if (!error) setScheduleData(data);
  };

  const fetchPlantCapacities = async () => {
    const { data, error } = await supabase.from("plant_capacity").select("*");
    if (!error) setPlantCapacities(data);
  };

  const getJobDate = (job) => {
    try {
      return format(new Date(job.date || job.required_by), "yyyy-MM-dd");
    } catch {
      return null;
    }
  };

  const getJobForCell = (date, shift) => {
    const dayStr = format(date, "yyyy-MM-dd");
    return scheduleData.filter((job) => {
      const jobDateStr = getJobDate(job);
      return jobDateStr === dayStr && job.shift?.trim().toLowerCase() === shift.trim().toLowerCase();
    });
  };

  const getCapacityInfo = (date, shift, productName, plant) => {
    const matching = plantCapacities.find(
      (c) =>
        c.shift?.trim().toLowerCase() === shift.trim().toLowerCase() &&
        c.product_name?.trim().toLowerCase() === productName?.trim().toLowerCase() &&
        c.plant_name?.trim().toLowerCase() === plant?.trim().toLowerCase()
    );
    if (!matching) return null;
    const jobs = getJobForCell(date, shift).filter((j) => j.product_name === productName && j.plant === plant);
    const totalQty = jobs.reduce((sum, j) => sum + (parseFloat(j.quantity) || 0), 0);
    const percent = (totalQty / matching.max_capacity) * 100;
    return { percent, used: totalQty, total: matching.max_capacity };
  };

  const suggestBestSlot = (job) => {
    const candidates = [];
    for (let date of getDates()) {
      for (let shift of shifts) {
        const capacityInfo = getCapacityInfo(date, shift, job.product_name, job.plant);
        if (capacityInfo) {
          candidates.push({ date, shift, percent: capacityInfo.percent });
        }
      }
    }
    const best = candidates.sort((a, b) => a.percent - b.percent)[0];
    if (best) {
      return `💡 Recommended: ${job.plant} – ${best.shift} – ${format(best.date, "dd/MM/yyyy")}`;
    }
    return null;
  };

  const handleEditClick = (job) => {
    setSelectedJob(job);
    setAiSuggestion(suggestBestSlot(job));
    setShowModal(true);
  };

  const handleDrop = async (item, date, shift) => {
    const job = item.job;
    const newDate = format(date, "yyyy-MM-dd");
    const { error } = await supabase.from("schedules").update({ date: newDate, shift }).eq("id", job.id);
    if (!error) fetchScheduledJobs();
  };

  const cellStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    height: "120px",
    verticalAlign: "top",
    fontSize: "0.75rem",
    fontFamily: "Segoe UI",
    position: "relative",
  };

  const headerStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: "0.8rem",
    fontFamily: "Segoe UI",
  };

  const DraggableJob = ({ job }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "JOB",
      item: { job },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }));
    return (
      <div
        ref={drag}
        style={{
          marginBottom: "4px",
          backgroundColor: "#e0f7fa",
          padding: "4px",
          borderRadius: "4px",
          opacity: isDragging ? 0.5 : 1,
          position: "relative",
        }}
      >
        <strong>{job.order_number}</strong>
        <br />
        {job.product_name} ({job.quantity} {job.uom})
        <button
          onClick={() => handleEditClick(job)}
          style={{
            position: "absolute",
            top: "2px",
            right: "4px",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "0.75rem",
          }}
          title="Edit job"
        >
          ✏️
        </button>
      </div>
    );
  };

  const DropCell = ({ date, shift }) => {
    const [, drop] = useDrop({ accept: "JOB", drop: (item) => handleDrop(item, date, shift) });
    const jobs = getJobForCell(date, shift);

    const productName = jobs[0]?.product_name;
    const plant = jobs[0]?.plant;
    const capacityInfo = getCapacityInfo(date, shift, productName, plant);

    let barColor = "#4caf50";
    if (capacityInfo?.percent > 100) barColor = "#f44336";
    else if (capacityInfo?.percent > 80) barColor = "#ff9800";

    return (
      <td ref={drop} style={cellStyle}>
        {capacityInfo && (
          <div style={{
            height: "6px",
            backgroundColor: "#ddd",
            borderRadius: "4px",
            marginBottom: "4px",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${Math.min(100, capacityInfo.percent)}%`,
              height: "100%",
              backgroundColor: barColor,
            }}></div>
          </div>
        )}
        {jobs.length === 0 ? (
          <span style={{ color: "#888" }}>No job</span>
        ) : (
          jobs.map((job, idx) => <DraggableJob key={idx} job={job} />)
        )}
      </td>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: "flex" }}>
        
        <div style={{ flex: 1, padding: "1rem", position: "relative" }}>
          <h2 style={{ fontFamily: "Segoe UI" }}>📅 Smart Scheduler</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={headerStyle}>Shift</th>
                {getDates().map((date, i) => (
                  <th key={i} style={headerStyle}>{format(date, "dd/MM/yyyy")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift, rowIdx) => (
                <tr key={rowIdx}>
                  <td style={cellStyle}><strong>{shift}</strong></td>
                  {getDates().map((date, colIdx) => (
                    <DropCell key={colIdx} date={date} shift={shift} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {aiSuggestion && (
            <div style={{ marginTop: "1rem", color: "#333", fontFamily: "Segoe UI", fontSize: "0.8rem" }}>
              {aiSuggestion}
            </div>
          )}

          {showModal && (
            <div
              style={{
                position: "fixed",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
              }}
            >
              <EditScheduleModal
                job={selectedJob}
                onClose={() => setShowModal(false)}
                onSave={() => {
                  setShowModal(false);
                  fetchScheduledJobs();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
