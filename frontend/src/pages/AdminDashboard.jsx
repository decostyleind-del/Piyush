import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  X,
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Clock,
} from "lucide-react";

/* "Personnel Ledger" token system — orange accent to match the
   employee dashboard / brand palette. Keep HR/HOD dashboards in
   sync if you tweak this. */
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
  orangeDim: "rgba(249,115,22,0.14)",
  sage: "#7ea08d",
  sageDim: "rgba(126,160,141,0.14)",
  brick: "#c06a56",
  brickDim: "rgba(192,106,86,0.14)",
};

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif:wght@500;600;700&family=Noto+Serif+Devanagari:wght@500;600;700&display=swap');`;

const STATUS_FILTERS = ["All", "Pending", "Approved", "Rejected"];

const StatusStamp = ({ status }) => {
  const cfg = {
    Approved: { color: T.sage, bg: T.sageDim, label: "Approved" },
    Rejected: { color: T.brick, bg: T.brickDim, label: "Rejected" },
    Pending: { color: T.orange, bg: T.orangeDim, label: "Pending" },
  }[status] || { color: T.orange, bg: T.orangeDim, label: status };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.3rem 0.75rem 0.3rem 0.6rem",
        borderRadius: "3px",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}55`,
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: cfg.color,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
};

/* Summary stat card — matches EmployeeDashboard's cards */
const StatCard = ({ icon: Icon, value, label, color, bg }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "1.15rem",
      background: T.panel,
      border: `1px solid ${T.hairline}`,
      borderRadius: "14px",
      padding: "1.5rem 1.65rem",
      minWidth: 0,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "50px",
        height: "50px",
        borderRadius: "11px",
        background: bg,
        color,
        flexShrink: 0,
      }}
    >
      <Icon size={24} strokeWidth={2.25} />
    </div>
    <div>
      <div
        style={{
          fontSize: "1.9rem",
          fontWeight: 700,
          color: T.text,
          lineHeight: 1.1,
          fontFamily: "'Noto Serif', 'Noto Serif Devanagari', serif",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.85rem",
          color: T.textDim,
          marginTop: "0.3rem",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

export const AdminDashboard = ({ user, showToast }) => {
  const [leaves, setLeaves] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedReason, setSelectedReason] = useState(null);
  const [pendingIds, setPendingIds] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const fetchLeaves = async () => {
    try {
      const { data } = await API.get("/leaves?role=Admin");
      setLeaves(data);
    } catch (err) {
      showToast("Failed to load leaves", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (id, action) => {
    const previous = leaves;
    const optimisticRecord = {
      ...leaves.find((l) => l._id === id),
      status: action,
      approvedByName: user.name,
      approvedByRole: "Admin",
      adminOverridden: true,
    };

    setLeaves((curr) => curr.map((l) => (l._id === id ? optimisticRecord : l)));
    setPendingIds((curr) => ({ ...curr, [id]: true }));

    try {
      const { data } = await API.put(`/leaves/${id}/status`, {
        role: "Admin",
        name: user.name,
        action,
      });
      if (data?.leave) {
        setLeaves((curr) =>
          curr.map((l) => (l._id === id ? { ...l, ...data.leave } : l)),
        );
      }
      showToast(
        `Leave request ${action.toLowerCase()} successfully`,
        "success",
      );
    } catch (err) {
      setLeaves(previous);
      showToast("Failed to update status", "error");
    } finally {
      setPendingIds((curr) => {
        const next = { ...curr };
        delete next[id];
        return next;
      });
    }
  };

  const stats = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter((l) => l.status === "Pending").length;
    const approved = leaves.filter((l) => l.status === "Approved").length;
    const rejected = leaves.filter((l) => l.status === "Rejected").length;
    return { total, pending, approved, rejected };
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    let result = leaves;

    if (statusFilter !== "All") {
      result = result.filter((l) => l.status === statusFilter);
    }

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      result = result.filter((l) => {
        const haystack = [
          l.employee?.name,
          l.employee?.employeeCode,
          l.employee?.department,
          l.leaveType,
          l.reason,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    return result;
  }, [leaves, searchTerm, statusFilter]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredLeaves.length / rowsPerPage));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [filteredLeaves, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeaves.length / rowsPerPage),
  );
  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLeaves.slice(start, start + rowsPerPage);
  }, [filteredLeaves, currentPage]);

  if (!user) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        background: T.ink,
      }}
    >
      <style>{fontImport}</style>
      <main
        style={{
          padding: "2.5rem 4vw 4rem",
          width: "100%",
          boxSizing: "border-box",
          color: T.text,
          fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "2rem",
            borderBottom: `1px solid ${T.hairline}`,
            paddingBottom: "1.75rem",
            flexWrap: "wrap",
            gap: "1.25rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: T.orange,
                fontSize: "0.9rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "0.85rem",
              }}
            >
              <ShieldCheck size={18} strokeWidth={2.5} />
              Administrator
            </div>
            <h1
              style={{
                fontFamily: "'Noto Serif', 'Noto Serif Devanagari', serif",
                fontSize: "clamp(1.9rem, 5vw, 3.1rem)",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: T.text,
                lineHeight: 1.1,
              }}
            >
              Master Register
            </h1>
            <p
              style={{
                color: T.textDim,
                fontSize: "1.1rem",
                marginTop: "0.75rem",
              }}
            >
              Full visibility across every leave request. Decisions here
              override any prior review.
            </p>
          </div>
          <div
            style={{
              fontFamily: "'Noto Serif', 'Noto Serif Devanagari', serif",
              fontSize: "0.95rem",
              color: T.textDim,
              fontStyle: "italic",
            }}
          >
            {filteredLeaves.length} of {leaves.length} record
            {leaves.length !== 1 ? "s" : ""} shown
          </div>
        </div>

        {/* Summary stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.25rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard
            icon={ListChecks}
            value={stats.total}
            label="Total Requests"
            color={T.text}
            bg="rgba(236,231,217,0.1)"
          />
          <StatCard
            icon={Clock}
            value={stats.pending}
            label="Pending"
            color={T.orange}
            bg={T.orangeDim}
          />
          <StatCard
            icon={CheckCircle2}
            value={stats.approved}
            label="Approved"
            color={T.sage}
            bg={T.sageDim}
          />
          <StatCard
            icon={XCircle}
            value={stats.rejected}
            label="Rejected"
            color={T.brick}
            bg={T.brickDim}
          />
        </div>

        {/* Search + status filter toolbar */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: "1 1 320px",
              minWidth: "240px",
            }}
          >
            <Search
              size={17}
              color={T.textDim}
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by employee, code, department, type, or reason…"
              style={{
                width: "100%",
                padding: "0.85rem 1rem 0.85rem 2.75rem",
                background: T.panel,
                border: `1px solid ${T.hairlineStrong}`,
                borderRadius: "9px",
                color: T.text,
                fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
                fontSize: "0.9rem",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = `${T.orange}88`)}
              onBlur={(e) => (e.target.style.borderColor = T.hairlineStrong)}
            />
          </div>

          <div
            style={{
              display: "flex",
              background: T.panel,
              padding: "5px",
              borderRadius: "9px",
              border: `1px solid ${T.hairline}`,
            }}
          >
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "0.65rem 1.1rem",
                  borderRadius: "7px",
                  border: "none",
                  background:
                    statusFilter === s
                      ? `linear-gradient(to right, ${T.orange}, ${T.orangeDark})`
                      : "transparent",
                  color: statusFilter === s ? "#fff" : T.textDim,
                  fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  letterSpacing: "0.03em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow:
                    statusFilter === s
                      ? "0 4px 14px rgba(249,115,22,0.3)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: T.panel,
            borderRadius: "14px",
            border: `1px solid ${T.hairline}`,
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.9rem",
                minWidth: "980px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: T.panelRaised,
                    color: T.textDim,
                    textTransform: "uppercase",
                    fontSize: "0.72rem",
                    letterSpacing: "0.09em",
                    borderBottom: `1px solid ${T.hairlineStrong}`,
                  }}
                >
                  <th style={{ padding: "1.3rem 1.75rem", fontWeight: 700 }}>
                    Employee
                  </th>
                  <th style={{ padding: "1.3rem 1rem", fontWeight: 700 }}>
                    Category
                  </th>
                  <th style={{ padding: "1.3rem 1rem", fontWeight: 700 }}>
                    Dates
                  </th>
                  <th style={{ padding: "1.3rem 1rem", fontWeight: 700 }}>
                    Reason
                  </th>
                  <th style={{ padding: "1.3rem 1rem", fontWeight: 700 }}>
                    Status
                  </th>
                  <th style={{ padding: "1.3rem 1rem", fontWeight: 700 }}>
                    Reviewed by
                  </th>
                  <th
                    style={{
                      padding: "1.3rem 1.75rem",
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    Override
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialLoading ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "4.5rem",
                        color: T.textDim,
                      }}
                    >
                      Loading register…
                    </td>
                  </tr>
                ) : filteredLeaves.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "4.5rem" }}
                    >
                      <ClipboardList
                        size={32}
                        color={T.textDim}
                        style={{ marginBottom: "0.85rem" }}
                      />
                      <div style={{ color: T.textDim, fontSize: "1.05rem" }}>
                        {leaves.length === 0
                          ? "System master log empty."
                          : "No records match your search."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLeaves.map((l) => {
                    const isLongReason = l.reason && l.reason.length > 30;
                    const isBusy = !!pendingIds[l._id];

                    return (
                      <tr
                        key={l._id}
                        style={{
                          borderBottom: `1px solid ${T.hairline}`,
                          opacity: isBusy ? 0.65 : 1,
                          transition: "background 0.15s, opacity 0.15s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = T.panelRaised)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <td
                          style={{
                            padding: "1.35rem 1.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {l.employee?.name || "Unknown"}
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: T.textDim,
                              fontWeight: 400,
                              marginTop: "3px",
                            }}
                          >
                            {l.employee?.employeeCode} ·{" "}
                            {l.employee?.department}
                          </div>
                        </td>
                        <td
                          style={{ padding: "1.35rem 1rem", color: "#c9c5b6" }}
                        >
                          {l.leaveType}
                        </td>
                        <td
                          style={{
                            padding: "1.35rem 1rem",
                            color: T.textDim,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {new Date(l.startDate).toLocaleDateString()} →{" "}
                          {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td
                          style={{
                            padding: "1.35rem 1rem",
                            color: T.textDim,
                            maxWidth: "240px",
                          }}
                        >
                          <span>
                            {isLongReason
                              ? `${l.reason.substring(0, 30)}…`
                              : l.reason}
                          </span>
                          {isLongReason && (
                            <button
                              onClick={() => setSelectedReason(l.reason)}
                              style={{
                                background: "none",
                                border: "none",
                                color: T.orange,
                                cursor: "pointer",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                marginLeft: "0.5rem",
                                padding: 0,
                              }}
                            >
                              Read more
                            </button>
                          )}
                        </td>
                        <td style={{ padding: "1.35rem 1rem" }}>
                          <StatusStamp status={l.status} />
                        </td>
                        <td
                          style={{
                            padding: "1.35rem 1rem",
                            color: T.textDim,
                            fontSize: "0.83rem",
                          }}
                        >
                          {l.approvedByName && l.approvedByRole
                            ? `${l.approvedByName} (${l.approvedByRole})`
                            : "—"}
                        </td>
                        <td
                          style={{
                            padding: "1.35rem 1.75rem",
                            textAlign: "right",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "0.55rem",
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              disabled={isBusy}
                              onClick={() => handleAction(l._id, "Approved")}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.35rem",
                                padding: "0.5rem 0.95rem",
                                borderRadius: "7px",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                background: T.sageDim,
                                color: T.sage,
                                border: `1px solid ${T.sage}55`,
                                cursor: isBusy ? "default" : "pointer",
                              }}
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button
                              disabled={isBusy}
                              onClick={() => handleAction(l._id, "Rejected")}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.35rem",
                                padding: "0.5rem 0.95rem",
                                borderRadius: "7px",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                background: T.brickDim,
                                color: T.brick,
                                border: `1px solid ${T.brick}55`,
                                cursor: isBusy ? "default" : "pointer",
                              }}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {!initialLoading && filteredLeaves.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                padding: "1.25rem 1.75rem",
                borderTop: `1px solid ${T.hairline}`,
              }}
            >
              <div style={{ color: T.textDim, fontSize: "0.9rem" }}>
                Showing {(currentPage - 1) * rowsPerPage + 1}–
                {Math.min(currentPage * rowsPerPage, filteredLeaves.length)} of{" "}
                {filteredLeaves.length}
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    background: T.panelRaised,
                    border: `1px solid ${T.hairlineStrong}`,
                    color: currentPage === 1 ? T.textDim : T.text,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    opacity: currentPage === 1 ? 0.5 : 1,
                  }}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        minWidth: "38px",
                        height: "38px",
                        padding: "0 0.6rem",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        border:
                          page === currentPage
                            ? "none"
                            : `1px solid ${T.hairlineStrong}`,
                        background:
                          page === currentPage
                            ? `linear-gradient(to right, ${T.orange}, ${T.orangeDark})`
                            : T.panelRaised,
                        color: page === currentPage ? "#fff" : T.textDim,
                        boxShadow:
                          page === currentPage
                            ? "0 4px 14px rgba(249,115,22,0.3)"
                            : "none",
                      }}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    background: T.panelRaised,
                    border: `1px solid ${T.hairlineStrong}`,
                    color: currentPage === totalPages ? T.textDim : T.text,
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  }}
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedReason && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(6, 9, 17, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedReason(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.panel,
              border: `1px solid ${T.hairlineStrong}`,
              borderRadius: "10px",
              padding: "2rem",
              width: "100%",
              maxWidth: "500px",
              position: "relative",
            }}
          >
            <button
              onClick={() => setSelectedReason(null)}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                background: "none",
                border: "none",
                color: T.textDim,
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
            <h3
              style={{
                fontFamily: "'Noto Serif', 'Noto Serif Devanagari', serif",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: T.text,
                marginBottom: "1rem",
              }}
            >
              Full justification
            </h3>
            <p
              style={{
                color: "#c9c5b6",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                background: T.panelRaised,
                padding: "1rem",
                borderRadius: "6px",
                border: `1px solid ${T.hairline}`,
              }}
            >
              {selectedReason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
