import React, { useState, useEffect } from "react";
import API from "../api/axios";
import {
  FileBarChart2,
  X,
  Printer,
  Download,
  Loader2,
  Search,
  Calendar,
} from "lucide-react";

const T = {
  orange: "#f97316",
  orangeDark: "#ea580c",
};

const toCSV = (rows) => {
  const header = [
    "Name",
    "Employee Code",
    "Department",
    "Role",
    "Total",
    "Pending",
    "Approved",
    "Rejected",
  ];
  const lines = rows.map((r) =>
    [
      r.name,
      r.employeeCode,
      r.department,
      r.role,
      r.total,
      r.pending,
      r.approved,
      r.rejected,
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
};

export const ReportButton = ({ role, isHindi }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  // Filter States
  const [timeframe, setTimeframe] = useState("all");
  const [search, setSearch] = useState("");

  // Fetch report data (only dependent on timeframe now, search is handled locally for speed & accuracy)
  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(
        `/leaves/report?role=${role}&timeframe=${timeframe}`,
      );
      setReport(data);
    } catch (err) {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchReport();
    }
  }, [open, timeframe]);

  // LOCAL FILTERING: Ensure total > 0 AND search matches Name or Employee Code
  const displayedRows =
    report?.rows?.filter((r) => {
      // 1. Hide employees who haven't applied for leave
      if (r.total === 0) return false;

      // 2. Search filter (Name or Employee Code)
      if (search.trim() !== "") {
        const s = search.toLowerCase();
        const matchName = r.name?.toLowerCase().includes(s);
        const matchCode = String(r.employeeCode).toLowerCase().includes(s);
        return matchName || matchCode;
      }

      return true;
    }) || [];

  // Recalculate summary boxes so they match the filtered view exactly
  const summaryStats = {
    employees: displayedRows.length,
    totalLeaves: displayedRows.reduce((acc, r) => acc + r.total, 0),
    pending: displayedRows.reduce((acc, r) => acc + r.pending, 0),
    approved: displayedRows.reduce((acc, r) => acc + r.approved, 0),
    rejected: displayedRows.reduce((acc, r) => acc + r.rejected, 0),
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (displayedRows.length === 0) return;
    const csv = toCSV(displayedRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leave-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.65rem 1.1rem",
          borderRadius: "8px",
          border: "none",
          background: `linear-gradient(to right, ${T.orange}, ${T.orangeDark})`,
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.85rem",
          cursor: "pointer",
        }}
      >
        <FileBarChart2 size={16} />
        {isHindi ? "रिपोर्ट जनरेट करें" : "Generate Report"}
      </button>

      {open && (
        <div
          className="report-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(6,9,17,0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 1000,
            overflowY: "auto",
            padding: "2.5rem 1rem",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            id="printable-report"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              color: "#111",
              borderRadius: "10px",
              padding: "2.5rem",
              width: "100%",
              maxWidth: "1000px",
              position: "relative",
            }}
          >
            <button
              className="no-print"
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>

            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                marginBottom: "0.25rem",
              }}
            >
              {isHindi ? "छुट्टी रिपोर्ट" : "Leave Report"}
            </h2>
            <p
              style={{
                color: "#666",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
              }}
            >
              {isHindi ? "तैयार किया गया: " : "Generated: "}
              {new Date().toLocaleString()}
            </p>

            <div
              className="no-print"
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "2rem",
                background: "#f8f9fa",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #e5e5e5",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  background: "#fff",
                  border: "1px solid #ccc",
                  padding: "0.5rem",
                  borderRadius: "6px",
                }}
              >
                <Search
                  size={16}
                  color="#666"
                  style={{ marginRight: "0.5rem" }}
                />
                <input
                  type="text"
                  placeholder={
                    isHindi
                      ? "नाम या कोड से खोजें..."
                      : "Search by name or code..."
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#fff",
                  border: "1px solid #ccc",
                  padding: "0.5rem",
                  borderRadius: "6px",
                }}
              >
                <Calendar
                  size={16}
                  color="#666"
                  style={{ marginRight: "0.5rem" }}
                />
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">
                    {isHindi ? "सभी समय" : "All Time"}
                  </option>
                  <option value="daily">
                    {isHindi ? "आज (दैनिक)" : "Today (Daily)"}
                  </option>
                  <option value="weekly">
                    {isHindi
                      ? "पिछले 7 दिन (साप्ताहिक)"
                      : "Last 7 Days (Weekly)"}
                  </option>
                  <option value="monthly">
                    {isHindi
                      ? "पिछले 30 दिन (मासिक)"
                      : "Last 30 Days (Monthly)"}
                  </option>
                </select>
              </div>
            </div>

            {loading && !report ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "3rem 0",
                  justifyContent: "center",
                  color: "#666",
                }}
              >
                <Loader2 className="spin" size={20} />
                {isHindi ? "रिपोर्ट तैयार हो रही है..." : "Building report…"}
              </div>
            ) : !report ? (
              <p style={{ color: "#b91c1c" }}>
                {isHindi
                  ? "रिपोर्ट लोड नहीं हो पाई।"
                  : "Failed to load report."}
              </p>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "1rem",
                    marginBottom: "1.75rem",
                  }}
                >
                  {[
                    [
                      isHindi ? "कुल कर्मचारी" : "Employees",
                      summaryStats.employees,
                    ],
                    [
                      isHindi ? "कुल छुट्टियां" : "Total Leaves",
                      summaryStats.totalLeaves,
                    ],
                    [isHindi ? "लंबित" : "Pending", summaryStats.pending],
                    [isHindi ? "स्वीकृत" : "Approved", summaryStats.approved],
                    [isHindi ? "अस्वीकृत" : "Rejected", summaryStats.rejected],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      style={{
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                        padding: "1rem",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>
                        {val}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#666",
                          marginTop: "0.25rem",
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ position: "relative", minHeight: "200px" }}>
                  {loading && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(255,255,255,0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10,
                      }}
                    >
                      <Loader2 className="spin" size={24} color={T.orange} />
                    </div>
                  )}
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.85rem",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "2px solid #111",
                          textAlign: "left",
                        }}
                      >
                        <th style={{ padding: "0.6rem 0.5rem" }}>
                          {isHindi ? "नाम" : "Name"}
                        </th>
                        <th style={{ padding: "0.6rem 0.5rem" }}>
                          {isHindi ? "कोड" : "Code"}
                        </th>
                        <th style={{ padding: "0.6rem 0.5rem" }}>
                          {isHindi ? "विभाग" : "Dept"}
                        </th>
                        <th
                          style={{
                            padding: "0.6rem 0.5rem",
                            textAlign: "center",
                          }}
                        >
                          {isHindi ? "कुल" : "Total"}
                        </th>
                        <th
                          style={{
                            padding: "0.6rem 0.5rem",
                            textAlign: "center",
                          }}
                        >
                          {isHindi ? "लंबित" : "Pending"}
                        </th>
                        <th
                          style={{
                            padding: "0.6rem 0.5rem",
                            textAlign: "center",
                          }}
                        >
                          {isHindi ? "स्वीकृत" : "Approved"}
                        </th>
                        <th
                          style={{
                            padding: "0.6rem 0.5rem",
                            textAlign: "center",
                          }}
                        >
                          {isHindi ? "अस्वीकृत" : "Rejected"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            style={{
                              textAlign: "center",
                              padding: "4rem 2rem",
                              color: "#666",
                              fontSize: "1.1rem",
                            }}
                          >
                            {isHindi
                              ? "इस समय सीमा में किसी भी कर्मचारी ने छुट्टी के लिए आवेदन नहीं किया है।"
                              : "No employees have applied for leave in this timeframe."}
                          </td>
                        </tr>
                      ) : (
                        displayedRows.map((r) => (
                          <tr
                            key={r.employeeId}
                            style={{ borderBottom: "1px solid #eee" }}
                          >
                            <td
                              style={{
                                padding: "0.6rem 0.5rem",
                                fontWeight: 600,
                              }}
                            >
                              {r.name}
                            </td>
                            <td style={{ padding: "0.6rem 0.5rem" }}>
                              {r.employeeCode}
                            </td>
                            <td style={{ padding: "0.6rem 0.5rem" }}>
                              {r.department}
                            </td>
                            <td
                              style={{
                                padding: "0.6rem 0.5rem",
                                textAlign: "center",
                                fontWeight: "bold",
                              }}
                            >
                              {r.total}
                            </td>
                            <td
                              style={{
                                padding: "0.6rem 0.5rem",
                                textAlign: "center",
                              }}
                            >
                              {r.pending}
                            </td>
                            <td
                              style={{
                                padding: "0.6rem 0.5rem",
                                textAlign: "center",
                              }}
                            >
                              {r.approved}
                            </td>
                            <td
                              style={{
                                padding: "0.6rem 0.5rem",
                                textAlign: "center",
                              }}
                            >
                              {r.rejected}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div
                  className="no-print"
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "2rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={handleDownload}
                    disabled={displayedRows.length === 0}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.65rem 1.1rem",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      background: "#fff",
                      color: displayedRows.length === 0 ? "#aaa" : "#111",
                      fontWeight: 700,
                      cursor:
                        displayedRows.length === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    <Download size={16} />
                    {isHindi ? "CSV डाउनलोड करें" : "Download CSV"}
                  </button>
                  <button
                    onClick={handlePrint}
                    disabled={displayedRows.length === 0}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.65rem 1.1rem",
                      borderRadius: "8px",
                      border: "none",
                      background:
                        displayedRows.length === 0 ? "#ccc" : T.orange,
                      color: "#fff",
                      fontWeight: 700,
                      cursor:
                        displayedRows.length === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    <Printer size={16} />
                    {isHindi ? "प्रिंट करें" : "Print"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: fixed; inset: 0; margin: 0; max-width: 100%; box-shadow: none; }
          .no-print { display: none !important; }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};
