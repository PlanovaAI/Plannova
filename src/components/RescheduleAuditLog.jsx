import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";


export default function RescheduleAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reschedule_audit")
      .select("*")
      .order("changed_at", { ascending: false }); // newest first

    if (!error && data) {
      setLogs(data);
    } else {
      console.error("❌ Error fetching audit logs:", error?.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "1rem", fontFamily: "Segoe UI" }}>
        <h2 style={{ marginBottom: "1rem" }}>📜 Reschedule Audit Log</h2>
        {loading ? (
          <p>Loading logs...</p>
        ) : logs.length === 0 ? (
          <p>No audit records found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.75rem",
                minWidth: "800px",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Order Number</th>
                  <th style={thStyle}>Old Slot</th>
                  <th style={thStyle}>New Slot</th>
                  <th style={thStyle}>Timestamp</th>
                  <th style={thStyle}>Changed By</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={tdStyle}>{log.order_number || "-"}</td>
                    <td style={tdStyle}>
                      {log.old_plant || "-"} | {log.old_shift || "-"} |{" "}
                      {log.old_date || "-"}
                    </td>
                    <td style={tdStyle}>
                      {log.new_plant || "-"} | {log.new_shift || "-"} |{" "}
                      {log.new_date || "-"}
                    </td>
                    <td style={tdStyle}>
                      {log.changed_at
                        ? new Date(log.changed_at).toLocaleString("en-AU")
                        : "-"}
                    </td>
                    <td style={tdStyle}>{log.changed_by || "system"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  textAlign: "center",
  fontWeight: "bold",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  verticalAlign: "top",
};
