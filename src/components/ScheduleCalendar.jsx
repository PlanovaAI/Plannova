// src/components/ScheduleCalendar.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import EditScheduleModal from "./EditScheduleModal";

export default function ScheduleCalendar() {
  const [schedules, setSchedules] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("All");
  const [selectedShift, setSelectedShift] = useState("All");
  const [editingSchedule, setEditingSchedule] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching schedules:", error);
    } else {
      setSchedules(data);
    }
  };

  const getWeekDates = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  };

  const weekDates = getWeekDates();
  const plants = ["Plant A", "Plant B", "Plant C"];
  const shifts = ["Shift 1", "Shift 2", "Shift 3"];

  const filteredSchedules = schedules.filter(
    (s) =>
      (selectedPlant === "All" || s.plant === selectedPlant) &&
      (selectedShift === "All" || s.shift === selectedShift)
  );

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "1rem" }}>
        <h2>📆 Weekly Schedule Calendar</h2>

        <div style={{ marginBottom: "1rem" }}>
          <select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)}>
            <option value="All">All Plants</option>
            {plants.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}>
            <option value="All">All Shifts</option>
            {shifts.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={fetchSchedules}>🔄 Refresh</button>
        </div>

        <table border="1" style={{ width: "100%", fontSize: "0.8rem" }}>
          <thead>
            <tr>
              <th>Shift / Plant</th>
              {weekDates.map((date) => (
                <th key={date}>{new Date(date).toLocaleDateString("en-AU")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) =>
              plants.map((plant) => {
                if (
                  (selectedPlant !== "All" && selectedPlant !== plant) ||
                  (selectedShift !== "All" && selectedShift !== shift)
                ) {
                  return null;
                }

                return (
                  <tr key={`${shift}-${plant}`}>
                    <td style={{ fontWeight: "bold" }}>{shift} – {plant}</td>
                    {weekDates.map((date) => {
                      const match = schedules.find(
                        (s) => s.date === date && s.shift === shift && s.plant === plant
                      );
                      return (
                        <td key={date}>
                          {match ? (
                            <>
                              {match.order_number}
                              <button
                                onClick={() => setEditingSchedule(match)}
                                style={{
                                  marginLeft: "0.25rem",
                                  fontSize: "0.75rem",
                                  padding: "0.1rem 0.3rem",
                                }}
                              >
                                ✏️
                              </button>
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {editingSchedule && (
          <EditScheduleModal
            schedule={editingSchedule}
            onClose={() => setEditingSchedule(null)}
            onSave={async () => {
              setEditingSchedule(null);
              await fetchSchedules();
            }}
          />
        )}
      </div>
    </div>
  );
}
