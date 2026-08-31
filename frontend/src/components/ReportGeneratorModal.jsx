import React, { useState } from "react";
import API from "../api/axios";
import { FileBarChart2, X, Printer, Download, Loader2 } from "lucide-react";

const T = {
  ink: "#0c1120",
  panel: "#141b2c",
  panelRaised: "#1b2438",
  hairline: "rgba(232,227,212,0.08)",
  hairlineStrong: "rgba(232,227,212,0.14)",
  text: "#ece7d9",
  textDim: "#96917f",
  orange: "#f97316",
  orangeDark: "#ea580c",
  sage: "#7ea08d",
  brick: "#c06a56",
};

const toCSV = (rows, summary) => {
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

  const generate = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const { data } = await API.get(`/leaves/report?role=${role}`);
      setReport(data);
    } catch (err) {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!report) return;
    const csv = toCSV(report.rows, report.summary);
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
        onClick={generate}
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
              maxWidth: "900px",
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
                fontSize: "1.5rem",
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

            {loading ? (
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
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "1rem",
                    marginBottom: "1.75rem",
                  }}
                >
                  {[
                    [
                      isHindi ? "कुल कर्मचारी" : "Employees",
                      report.summary.totalEmployees,
                    ],
                    [
                      isHindi ? "लंबित" : "Pending",
                      report.summary.totalPending,
                    ],
                    [
                      isHindi ? "स्वीकृत" : "Approved",
                      report.summary.totalApproved,
                    ],
                    [
                      isHindi ? "अस्वीकृत" : "Rejected",
                      report.summary.totalRejected,
                    ],
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
                    {report.rows.map((r) => (
                      <tr
                        key={r.employeeId}
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <td
                          style={{ padding: "0.6rem 0.5rem", fontWeight: 600 }}
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
                    ))}
                  </tbody>
                </table>

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
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.65rem 1.1rem",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      background: "#fff",
                      color: "#111",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Download size={16} />
                    {isHindi ? "CSV डाउनलोड करें" : "Download CSV"}
                  </button>
                  <button
                    onClick={handlePrint}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.65rem 1.1rem",
                      borderRadius: "8px",
                      border: "none",
                      background: T.orange,
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
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
          #printable-report {
            position: fixed; inset: 0; margin: 0; max-width: 100%; box-shadow: none;
          }
          .no-print { display: none !important; }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};
