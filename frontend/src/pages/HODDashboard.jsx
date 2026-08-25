import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  XCircle,
  Layers,
  X,
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Clock,
  FileText,
  Paperclip,
  Download,
  Send,
} from "lucide-react";

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

// ---- TIME CALCULATION HELPERS ----
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hours = parseInt(h, 10);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${m} ${suffix}`;
};

const calcDuration = (start, end) => {
  if (!start || !end) return "";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) return "—";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m} mins`;
  return m > 0 ? `${h}h ${m}m` : `${h} hrs`;
};

const STATUS_FILTERS = ["All", "Pending", "Approved", "Rejected"];

const StatusStamp = ({ status, label }) => {
  const cfg = {
    Approved: { color: T.sage, bg: T.sageDim },
    Rejected: { color: T.brick, bg: T.brickDim },
    Pending: { color: T.orange, bg: T.orangeDim },
  }[status] || { color: T.orange, bg: T.orangeDim };

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
      {label || status}
    </span>
  );
};

const ProofCell = ({
  leave,
  onAskForDocument,
  onViewDocuments,
  t,
  isHindi,
}) => {
  const proof = leave.proof || { status: "None" };

  if (proof.status === "Submitted") {
    return (
      <button
        onClick={() => onViewDocuments(leave)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.45rem 0.8rem",
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: 700,
          background: T.sageDim,
          color: T.sage,
          border: `1px solid ${T.sage}55`,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <Paperclip size={13} /> {proof.files?.length || 0}{" "}
        {isHindi ? "फ़ाइलें — देखें" : "files — Review"}
      </button>
    );
  }

  if (proof.status === "Requested") {
    return (
      <span
        title={proof.remark}
        style={{
          display: "inline-flex",
          flexDirection: "column",
          gap: "0.2rem",
          maxWidth: "180px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: T.orange,
          }}
        >
          <Clock size={12} />{" "}
          {isHindi ? "कर्मचारी की प्रतीक्षा में" : "Waiting on employee"}
        </span>
        <span
          style={{
            fontSize: "0.72rem",
            color: T.textDim,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {proof.requestedByName}: {proof.remark}
        </span>
      </span>
    );
  }

  return (
    <button
      onClick={() => onAskForDocument(leave)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.45rem 0.8rem",
        borderRadius: "6px",
        fontSize: "0.75rem",
        fontWeight: 700,
        background: "transparent",
        color: T.textDim,
        border: `1px dashed ${T.hairlineStrong}`,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <FileText size={13} /> {isHindi ? "दस्तावेज़ माँगें" : "Request document"}
    </button>
  );
};

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

export const HODDashboard = ({ user, showToast }) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language && i18n.language.startsWith("hi");

  const [leaves, setLeaves] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedReason, setSelectedReason] = useState(null);
  const [pendingIds, setPendingIds] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [askDocLeave, setAskDocLeave] = useState(null);
  const [remarkInput, setRemarkInput] = useState("");
  const [requestingProof, setRequestingProof] = useState(false);
  const [viewDocsLeave, setViewDocsLeave] = useState(null);

  const fetchLeaves = async () => {
    try {
      const { data } = await API.get(`/leaves?role=HOD&userId=${user._id}`);
      setLeaves(data);
    } catch (err) {
      showToast(
        isHindi ? "लोड करने में विफल" : "Failed to load requests",
        "error",
      );
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
      approvedByRole: `HOD - ${user.department}`,
    };

    setLeaves((curr) => curr.map((l) => (l._id === id ? optimisticRecord : l)));
    setPendingIds((curr) => ({ ...curr, [id]: true }));

    try {
      const { data } = await API.put(`/leaves/${id}/status`, {
        role: "HOD",
        name: user.name,
        action,
      });
      if (data?.leave) {
        setLeaves((curr) =>
          curr.map((l) => (l._id === id ? { ...l, ...data.leave } : l)),
        );
      }
      showToast(
        isHindi
          ? "सफलतापूर्वक अद्यतित किया गया"
          : `Request ${action.toLowerCase()} successfully`,
        "success",
      );
    } catch (err) {
      setLeaves(previous);
      showToast(isHindi ? "विफल रहा" : "Action failed", "error");
    } finally {
      setPendingIds((curr) => {
        const next = { ...curr };
        delete next[id];
        return next;
      });
    }
  };

  const handleSubmitProofRequest = async () => {
    if (!askDocLeave) return;
    if (!remarkInput.trim()) {
      showToast(
        isHindi
          ? "कृपया विवरण स्पष्ट करें"
          : "Please describe what document is needed",
        "error",
      );
      return;
    }
    setRequestingProof(true);
    try {
      const { data } = await API.put(
        `/leaves/${askDocLeave._id}/request-proof`,
        {
          role: "HOD",
          name: user.name,
          remark: remarkInput.trim(),
        },
      );
      if (data?.leave) {
        setLeaves((curr) =>
          curr.map((l) =>
            l._id === askDocLeave._id ? { ...l, ...data.leave } : l,
          ),
        );
      }
      showToast(
        isHindi
          ? "कर्मचारी को अनुरोध भेजा गया"
          : "Document request sent to employee",
        "success",
      );
      setAskDocLeave(null);
      setRemarkInput("");
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          (isHindi ? "विफल रहा" : "Failed to send request"),
        "error",
      );
    } finally {
      setRequestingProof(false);
    }
  };

  // FIXED BUG HERE
  const getStatusLabel = (status) => {
    if (status === "Approved") return isHindi ? "स्वीकृत" : "Approved";
    if (status === "Rejected") return isHindi ? "अस्वीकृत" : "Rejected";
    if (status === "Pending") return isHindi ? "लंबित" : "Pending";
    return status;
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
              <Layers size={18} strokeWidth={2.5} />
              {isHindi ? "विभाग प्रमुख (HOD)" : "Head of Department"}
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
              {isHindi ? "विभाग रजिस्टर" : "Department Register"}
            </h1>
            <p
              style={{
                color: T.textDim,
                fontSize: "1.1rem",
                marginTop: "0.75rem",
              }}
            >
              {isHindi ? "" : "Leave requests from"}{" "}
              <strong style={{ color: "#c9c5b6" }}>{user.department}</strong>
              {isHindi
                ? " से छुट्टी के अनुरोध, आपकी समीक्षा की प्रतीक्षा में।"
                : ", awaiting your review."}
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
            {filteredLeaves.length} {isHindi ? "में से" : "of"} {leaves.length}{" "}
            {isHindi ? "रिकॉर्ड दिखाए गए" : "records shown"}
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
            label={isHindi ? "कुल अनुरोध" : "Total Requests"}
            color={T.text}
            bg="rgba(236,231,217,0.1)"
          />
          <StatCard
            icon={Clock}
            value={stats.pending}
            label={isHindi ? "लंबित" : "Pending"}
            color={T.orange}
            bg={T.orangeDim}
          />
          <StatCard
            icon={CheckCircle2}
            value={stats.approved}
            label={isHindi ? "स्वीकृत" : "Approved"}
            color={T.sage}
            bg={T.sageDim}
          />
          <StatCard
            icon={XCircle}
            value={stats.rejected}
            label={isHindi ? "अस्वीकृत" : "Rejected"}
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
              placeholder={
                isHindi
                  ? "कर्मचारी, कोड, प्रकार या कारण से खोजें..."
                  : "Search by employee, code, type, or reason…"
              }
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
            {STATUS_FILTERS.map((s) => {
              const label =
                s === "All" ? (isHindi ? "सभी" : "All") : getStatusLabel(s);
              return (
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
                    fontFamily:
                      "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
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
                  {label}
                </button>
              );
            })}
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
                minWidth: "1120px",
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
                    {isHindi ? "कर्मचारी" : "Employee"}
                  </th>
                  <th style={{ padding: "1.3rem 1rem", fontWeight: 700 }}>
                    {isHindi ? "श्रेणी" : "Category"}
                  </th>
                  <th style={{ padding: "1.3rem 1rem", fontWeight: 700 }}>
                    {isHindi ? "तिथियां" : "Dates"}
                  </th>
                  <th style={{ padding: "1.3rem 1rem", fontWeight: 700 }}>
                    {isHindi ? "कारण" : "Reason"}
                  </th>
                  <th style={{ padding: "1.3rem 1rem", fontWeight: 700 }}>
                    {isHindi ? "स्थिति" : "Status"}
                  </th>
                  <th style={{ padding: "1.3rem 1rem", fontWeight: 700 }}>
                    {isHindi ? "दस्तावेज़" : "Proof"}
                  </th>
                  <th style={{ padding: "1.3rem 1rem", fontWeight: 700 }}>
                    {isHindi ? "समीक्षक" : "Reviewed by"}
                  </th>
                  <th
                    style={{
                      padding: "1.3rem 1.75rem",
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {isHindi ? "कार्रवाई" : "Action"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialLoading ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "4.5rem",
                        color: T.textDim,
                      }}
                    >
                      {isHindi
                        ? "रजिस्टर लोड हो रहा है..."
                        : "Loading register…"}
                    </td>
                  </tr>
                ) : filteredLeaves.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "4.5rem" }}
                    >
                      <ClipboardList
                        size={32}
                        color={T.textDim}
                        style={{ marginBottom: "0.85rem" }}
                      />
                      <div style={{ color: T.textDim, fontSize: "1.05rem" }}>
                        {leaves.length === 0
                          ? isHindi
                            ? "सिस्टम मास्टर लॉग खाली है।"
                            : "System master log empty."
                          : isHindi
                            ? "कोई रिकॉर्ड नहीं मिला।"
                            : "No records match your search."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLeaves.map((l) => {
                    const isProcessed =
                      l.status === "Approved" || l.status === "Rejected";
                    const isLongReason = l.reason && l.reason.length > 30;
                    const isBusy = !!pendingIds[l._id];
                    const isSingleDay =
                      new Date(l.startDate).getTime() ===
                      new Date(l.endDate).getTime();

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
                            {l.employee?.employeeCode}
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
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.3rem",
                            }}
                          >
                            <span
                              style={{ color: T.textDim, fontSize: "0.95rem" }}
                            >
                              {new Date(l.startDate).toLocaleDateString()}
                              {!isSingleDay &&
                                ` → ${new Date(l.endDate).toLocaleDateString()}`}
                            </span>
                            {(l.startTime || l.endTime) && (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.4rem",
                                  fontSize: "0.8rem",
                                  color: T.orange,
                                  marginTop: "2px",
                                }}
                              >
                                <Clock size={13} strokeWidth={2.5} />
                                <span>
                                  {l.endTime ? (
                                    <>
                                      <strong
                                        style={{
                                          color: "#ece7d9",
                                          fontSize: "0.85rem",
                                          marginRight: "4px",
                                        }}
                                      >
                                        {calcDuration(l.startTime, l.endTime)}
                                      </strong>
                                      ({formatTime(l.startTime)} -{" "}
                                      {formatTime(l.endTime)})
                                    </>
                                  ) : (
                                    <strong
                                      style={{
                                        color: "#ece7d9",
                                        fontSize: "0.85rem",
                                      }}
                                    >
                                      {formatTime(l.startTime)}
                                    </strong>
                                  )}
                                </span>
                                <span
                                  style={{
                                    marginLeft: "4px",
                                    background: T.orangeDim,
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontSize: "0.65rem",
                                    fontWeight: "bold",
                                    letterSpacing: "0.05em",
                                  }}
                                >
                                  {isHindi ? "घंटे के अनुसार" : "HOURLY"}
                                </span>
                              </span>
                            )}
                          </div>
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
                              {isHindi ? "और पढ़ें" : "Read more"}
                            </button>
                          )}
                        </td>
                        <td style={{ padding: "1.35rem 1rem" }}>
                          <StatusStamp
                            status={l.status}
                            label={getStatusLabel(l.status)}
                          />
                        </td>
                        <td style={{ padding: "1.35rem 1rem" }}>
                          <ProofCell
                            leave={l}
                            isHindi={isHindi}
                            t={t}
                            onAskForDocument={(leave) => {
                              setAskDocLeave(leave);
                              setRemarkInput("");
                            }}
                            onViewDocuments={(leave) => setViewDocsLeave(leave)}
                          />
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
                          {!isProcessed ? (
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
                                <CheckCircle2 size={14} />{" "}
                                {isHindi ? "स्वीकार करें" : "Approve"}
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
                                <XCircle size={14} />{" "}
                                {isHindi ? "अस्वीकार करें" : "Reject"}
                              </button>
                            </div>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "0.4rem 0.8rem",
                                background: T.panelRaised,
                                color: T.textDim,
                                borderRadius: "5px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                letterSpacing: "0.04em",
                                border: `1px solid ${T.hairlineStrong}`,
                              }}
                            >
                              {isHindi ? "पूर्ण" : "DONE"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

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
                {isHindi
                  ? `कुल ${filteredLeaves.length} में से ${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filteredLeaves.length)} दिखा रहे हैं`
                  : `Showing ${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filteredLeaves.length)} of ${filteredLeaves.length}`}
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
              {isHindi ? "पूर्ण विवरण" : "Full justification"}
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

      {askDocLeave && (
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
          onClick={() => !requestingProof && setAskDocLeave(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.panel,
              border: `1px solid ${T.hairlineStrong}`,
              borderRadius: "10px",
              padding: "2rem",
              width: "100%",
              maxWidth: "460px",
              position: "relative",
            }}
          >
            <button
              onClick={() => !requestingProof && setAskDocLeave(null)}
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
                marginBottom: "0.4rem",
              }}
            >
              {isHindi
                ? "सहायक दस्तावेज़ का अनुरोध करें"
                : "Request a supporting document"}
            </h3>
            <p
              style={{
                color: T.textDim,
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
              }}
            >
              {askDocLeave.employee?.name} — {askDocLeave.leaveType}
            </p>
            <label
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: T.textDim,
                marginBottom: "0.5rem",
              }}
            >
              {isHindi
                ? "आपको उनसे क्या चाहिए?"
                : "What do you need from them?"}
            </label>
            <textarea
              value={remarkInput}
              onChange={(e) => setRemarkInput(e.target.value)}
              placeholder={
                isHindi
                  ? "उदा., कृपया मेडिकल सर्टिफिकेट संलग्न करें..."
                  : "e.g. Please attach a medical certificate..."
              }
              rows={3}
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                background: T.panelRaised,
                border: `1px solid ${T.hairlineStrong}`,
                borderRadius: "8px",
                color: T.text,
                fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
                fontSize: "0.9rem",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                marginBottom: "1.25rem",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setAskDocLeave(null)}
                disabled={requestingProof}
                style={{
                  padding: "0.65rem 1.2rem",
                  borderRadius: "7px",
                  border: `1px solid ${T.hairlineStrong}`,
                  background: "transparent",
                  color: T.textDim,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={handleSubmitProofRequest}
                disabled={requestingProof}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.65rem 1.2rem",
                  borderRadius: "7px",
                  border: "none",
                  background: `linear-gradient(to right, ${T.orange}, ${T.orangeDark})`,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: requestingProof ? "default" : "pointer",
                  opacity: requestingProof ? 0.7 : 1,
                }}
              >
                <Send size={14} />
                {requestingProof
                  ? isHindi
                    ? "भेजा जा रहा है..."
                    : "Sending..."
                  : isHindi
                    ? "अनुरोध भेजें"
                    : "Send request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewDocsLeave && (
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
          onClick={() => setViewDocsLeave(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.panel,
              border: `1px solid ${T.hairlineStrong}`,
              borderRadius: "10px",
              padding: "2rem",
              width: "100%",
              maxWidth: "520px",
              position: "relative",
            }}
          >
            <button
              onClick={() => setViewDocsLeave(null)}
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
                marginBottom: "0.4rem",
              }}
            >
              {isHindi ? "सबमिट किए गए दस्तावेज़" : "Submitted documents"}
            </h3>
            <p
              style={{
                color: T.textDim,
                fontSize: "0.85rem",
                marginBottom: "0.75rem",
              }}
            >
              {viewDocsLeave.employee?.name} — {viewDocsLeave.leaveType}
            </p>
            <div
              style={{
                background: T.panelRaised,
                border: `1px solid ${T.hairline}`,
                borderRadius: "8px",
                padding: "0.85rem 1rem",
                fontSize: "0.85rem",
                color: "#c9c5b6",
                marginBottom: "1.25rem",
              }}
            >
              <strong style={{ color: T.textDim }}>
                {isHindi ? "अनुरोध किया गया:" : "Requested:"}
              </strong>{" "}
              {viewDocsLeave.proof?.remark}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                marginBottom: "0.5rem",
              }}
            >
              {(viewDocsLeave.proof?.files || []).map((f) => (
                <a
                  key={f._id}
                  href={f.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    background: T.panelRaised,
                    border: `1px solid ${T.hairlineStrong}`,
                    borderRadius: "8px",
                    color: T.text,
                    textDecoration: "none",
                    fontSize: "0.85rem",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      overflow: "hidden",
                    }}
                  >
                    <FileText size={16} color={T.orange} />
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.originalName}
                    </span>
                  </span>
                  <Download size={15} color={T.textDim} />
                </a>
              ))}
              {(!viewDocsLeave.proof?.files ||
                viewDocsLeave.proof.files.length === 0) && (
                <p style={{ color: T.textDim, fontSize: "0.85rem" }}>
                  {isHindi ? "कोई फ़ाइल नहीं मिली।" : "No files found."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
