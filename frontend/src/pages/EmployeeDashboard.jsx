import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { LeaveModal } from "../components/LeaveModal";
import { ProofUploadModal } from "../components/ProofuploadModal";
import {
  PlusCircle,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  FileText,
  UploadCloud,
} from "lucide-react";
import { useTranslation } from "react-i18next";

/* Same "Personnel Ledger" token system as the HR / HOD / Admin
   dashboards — keep these files in sync if you tweak the palette. */
const T = {
  ink: "#0c1120",
  panel: "#141b2c",
  panelRaised: "#1b2438",
  hairline: "rgba(232,227,212,0.08)",
  hairlineStrong: "rgba(232,227,212,0.14)",
  text: "#ece7d9",
  textDim: "#96917f",
  brass: "#c9a24b",
  brassDim: "rgba(201,162,75,0.14)",
  sage: "#7ea08d",
  sageDim: "rgba(126,160,141,0.14)",
  brick: "#c06a56",
  brickDim: "rgba(192,106,86,0.14)",
  orange: "#f97316",
  orangeDark: "#ea580c",
  orangeDim: "rgba(249,115,22,0.14)",
};

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif:wght@500;600;700&family=Noto+Serif+Devanagari:wght@500;600;700&display=swap');`;

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
        gap: "0.5rem",
        padding: "0.5rem 1.1rem 0.5rem 0.85rem",
        borderRadius: "5px",
        fontSize: "0.95rem",
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}55`,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: cfg.color,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
};

/* Small pill for the Proof column — separate from StatusStamp because
   the vocabulary/colors differ (Requested = attention/orange,
   Submitted = sage, none = muted dash). */
const ProofStamp = ({ status, label }) => {
  const cfg = {
    Requested: { color: T.orange, bg: T.orangeDim },
    Submitted: { color: T.sage, bg: T.sageDim },
  }[status] || { color: T.textDim, bg: "rgba(150,145,127,0.1)" };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        padding: "0.45rem 0.95rem 0.45rem 0.75rem",
        borderRadius: "5px",
        fontSize: "0.9rem",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}55`,
      }}
    >
      {status === "Requested" ? (
        <UploadCloud size={14} strokeWidth={2.5} />
      ) : status === "Submitted" ? (
        <FileText size={14} strokeWidth={2.5} />
      ) : null}
      {label}
    </span>
  );
};

/* Small summary card used across the top of the dashboard */
const StatCard = ({ icon: Icon, value, label, color, bg }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "1.25rem",
      background: T.panel,
      border: `1px solid ${T.hairline}`,
      borderRadius: "14px",
      padding: "1.75rem 1.85rem",
      minWidth: 0,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "56px",
        height: "56px",
        borderRadius: "12px",
        background: bg,
        color: color,
        flexShrink: 0,
      }}
    >
      <Icon size={28} strokeWidth={2.25} />
    </div>
    <div>
      <div
        style={{
          fontSize: "2.15rem",
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
          fontSize: "0.95rem",
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

export const EmployeeDashboard = ({ user, showToast }) => {
  const { t } = useTranslation();
  const [leaves, setLeaves] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Leave whose proof modal is currently open (null = closed)
  const [proofLeave, setProofLeave] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(
        `/leaves?userId=${user._id}&role=Employee`,
      );
      setLeaves(data);
    } catch (err) {
      showToast(t("errors.load_fail"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // If the underlying data shrinks/grows, keep the current page in range
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(leaves.length / rowsPerPage));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [leaves, currentPage]);

  const statusLabel = (status) =>
    status === "Approved"
      ? t("table.approved")
      : status === "Rejected"
        ? t("table.rejected")
        : t("table.pending");

  const isHindi = t("table.type") === "छुट्टी का प्रकार";

  // proof.status labels — mirrors table.approved/rejected/pending pattern.
  // Falls back to plain English/Hindi if these keys aren't in en.json/hi.json yet.
  const proofLabel = (status) => {
    if (status === "Requested")
      return t(
        "table.proof_requested",
        isHindi ? "दस्तावेज़ माँगा गया" : "Requested",
      );
    if (status === "Submitted")
      return t(
        "table.proof_submitted",
        isHindi ? "दस्तावेज़ जमा" : "Submitted",
      );
    return "—";
  };

  const stats = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter((l) => l.status === "Pending").length;
    const approved = leaves.filter((l) => l.status === "Approved").length;
    const rejected = leaves.filter((l) => l.status === "Rejected").length;
    return { total, pending, approved, rejected };
  }, [leaves]);

  const totalPages = Math.max(1, Math.ceil(leaves.length / rowsPerPage));
  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return leaves.slice(start, start + rowsPerPage);
  }, [leaves, currentPage]);

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
              <ClipboardList size={18} strokeWidth={2.5} />
              {user.department}
            </div>
            <h2
              style={{
                fontFamily: "'Noto Serif', 'Noto Serif Devanagari', serif",
                fontSize: "clamp(1.9rem, 5vw, 3.1rem)",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: T.text,
                lineHeight: 1.1,
              }}
            >
              {t("dashboard.title")}
            </h2>
            <p
              style={{
                color: T.textDim,
                fontSize: "1.2rem",
                marginTop: "0.75rem",
              }}
            >
              {t("dashboard.welcome")},{" "}
              <strong style={{ color: "#c9c5b6" }}>{user.name}</strong>
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "1.05rem 1.85rem",
              borderRadius: "9px",
              fontSize: "1.1rem",
              fontWeight: 700,
              background: `linear-gradient(to right, ${T.orange}, ${T.orangeDark})`,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 18px rgba(249,115,22,0.35)",
            }}
          >
            <PlusCircle size={22} /> {t("dashboard.apply")}
          </button>
        </div>

        {/* Summary stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.25rem",
            marginBottom: "2.25rem",
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
            label={t("table.pending")}
            color={T.orange}
            bg={T.orangeDim}
          />
          <StatCard
            icon={CheckCircle2}
            value={stats.approved}
            label={t("table.approved")}
            color={T.sage}
            bg={T.sageDim}
          />
          <StatCard
            icon={XCircle}
            value={stats.rejected}
            label={t("table.rejected")}
            color={T.brick}
            bg={T.brickDim}
          />
        </div>

        {/* Leave History */}
        <div
          style={{
            background: T.panel,
            borderRadius: "14px",
            border: `1px solid ${T.hairline}`,
            width: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1.75rem 2rem",
              borderBottom: `1px solid ${T.hairline}`,
              fontFamily: "'Noto Serif', 'Noto Serif Devanagari', serif",
              fontSize: "1.5rem",
              fontWeight: 600,
            }}
          >
            {isHindi ? "छुट्टी का इतिहास" : "Leave History"}
          </div>

          {/* Guaranteed Responsive Scroll Container */}
          <div
            style={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              display: "block",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "1rem",
                minWidth: "1080px", // widened to fit the new Proof column
              }}
            >
              <thead>
                <tr
                  style={{
                    background: T.panelRaised,
                    color: T.textDim,
                    textTransform: "uppercase",
                    fontSize: "1.05rem",
                    letterSpacing: "0.06em",
                    borderBottom: `1px solid ${T.hairlineStrong}`,
                  }}
                >
                  <th
                    style={{
                      padding: "1.6rem 2rem",
                      fontWeight: 700,
                      width: "15%",
                    }}
                  >
                    {t("table.type")}
                  </th>
                  <th
                    style={{
                      padding: "1.6rem 1.25rem",
                      fontWeight: 700,
                      width: "17%",
                    }}
                  >
                    {t("table.dates")}
                  </th>
                  <th
                    style={{
                      padding: "1.6rem 1.25rem",
                      fontWeight: 700,
                      width: "21%",
                    }}
                  >
                    {t("table.reason")}
                  </th>
                  <th
                    style={{
                      padding: "1.6rem 1.25rem",
                      fontWeight: 700,
                      width: "14%",
                    }}
                  >
                    {t("table.status")}
                  </th>
                  <th
                    style={{
                      padding: "1.6rem 1.25rem",
                      fontWeight: 700,
                      width: "16%",
                    }}
                  >
                    {isHindi ? "दस्तावेज़" : "Proof"}
                  </th>
                  <th
                    style={{
                      padding: "1.6rem 2rem",
                      fontWeight: 700,
                      width: "17%",
                    }}
                  >
                    {t("table.approver")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "5rem",
                        color: T.textDim,
                        fontSize: "1.25rem",
                      }}
                    >
                      {t("table.syncing")}
                    </td>
                  </tr>
                ) : leaves.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: "5rem" }}
                    >
                      <ClipboardList
                        size={40}
                        color={T.textDim}
                        style={{ marginBottom: "1rem" }}
                      />
                      <div style={{ color: T.textDim, fontSize: "1.25rem" }}>
                        {t("table.no_records")}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLeaves.map((l) => {
                    const proofStatus = l.proof?.status; // "Requested" | "Submitted" | undefined
                    return (
                      <tr
                        key={l._id}
                        style={{
                          borderBottom: `1px solid ${T.hairline}`,
                          transition: "background 0.15s",
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
                            padding: "1.75rem 2rem",
                            fontWeight: 700,
                            fontSize: "1.2rem",
                          }}
                        >
                          {l.leaveType}
                        </td>
                        <td
                          style={{
                            padding: "1.75rem 1.25rem",
                            color: T.textDim,
                            whiteSpace: "nowrap",
                            fontSize: "1.15rem",
                          }}
                        >
                          {new Date(l.startDate).toLocaleDateString()} →{" "}
                          {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td
                          style={{
                            padding: "1.75rem 1.25rem",
                            color: "#c9c5b6",
                            maxWidth: "380px",
                            fontSize: "1.15rem",
                            lineHeight: 1.5,
                          }}
                        >
                          {l.reason}
                        </td>
                        <td style={{ padding: "1.75rem 1.25rem" }}>
                          <StatusStamp
                            status={l.status}
                            label={statusLabel(l.status)}
                          />
                        </td>
                        <td style={{ padding: "1.75rem 1.25rem" }}>
                          {proofStatus ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: "0.6rem",
                              }}
                            >
                              <ProofStamp
                                status={proofStatus}
                                label={proofLabel(proofStatus)}
                              />

                              {/* Remark from HR/HOD explaining what's needed */}
                              {l.proof?.remark && (
                                <div
                                  style={{
                                    color: T.textDim,
                                    fontSize: "0.95rem",
                                    lineHeight: 1.4,
                                    maxWidth: "220px",
                                  }}
                                >
                                  “{l.proof.remark}”
                                </div>
                              )}

                              {/* Only actionable while HR/HOD is still waiting on the employee */}
                              {proofStatus === "Requested" && (
                                <button
                                  onClick={() => setProofLeave(l)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                    padding: "0.55rem 0.95rem",
                                    borderRadius: "7px",
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    background: T.orangeDim,
                                    color: T.orange,
                                    border: `1px solid ${T.orange}55`,
                                    cursor: "pointer",
                                  }}
                                >
                                  <UploadCloud size={15} strokeWidth={2.5} />
                                  {isHindi ? "अपलोड करें" : "Upload"}
                                </button>
                              )}

                              {proofStatus === "Submitted" && (
                                <button
                                  onClick={() => setProofLeave(l)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                    padding: "0.55rem 0.95rem",
                                    borderRadius: "7px",
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    background: "transparent",
                                    color: T.textDim,
                                    border: `1px solid ${T.hairlineStrong}`,
                                    cursor: "pointer",
                                  }}
                                >
                                  <FileText size={15} strokeWidth={2.5} />
                                  {isHindi ? "देखें" : "View"}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span
                              style={{ color: T.textDim, fontSize: "1.05rem" }}
                            >
                              —
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "1.75rem 2rem",
                            color: T.textDim,
                            fontSize: "1.1rem",
                          }}
                        >
                          {l.approvedByName && l.approvedByRole ? (
                            <span>
                              {statusLabel(l.status)}{" "}
                              {t("table.approved_by").toLowerCase() ===
                              "द्वारा स्वीकृत"
                                ? "द्वारा"
                                : "by"}{" "}
                              {l.approvedByName} ({l.approvedByRole})
                            </span>
                          ) : (
                            t("table.pending")
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {!loading && leaves.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                padding: "1.25rem 2rem",
                borderTop: `1px solid ${T.hairline}`,
              }}
            >
              <div style={{ color: T.textDim, fontSize: "0.95rem" }}>
                {isHindi
                  ? `कुल ${leaves.length} में से ${
                      (currentPage - 1) * rowsPerPage + 1
                    }–${Math.min(currentPage * rowsPerPage, leaves.length)} दिखा रहे हैं`
                  : `Showing ${(currentPage - 1) * rowsPerPage + 1}–${Math.min(
                      currentPage * rowsPerPage,
                      leaves.length,
                    )} of ${leaves.length}`}
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

      {isModalOpen && (
        <LeaveModal
          user={user}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchLeaves}
          showToast={showToast}
        />
      )}

      {/* Proof upload/view modal.
          Assumed prop contract (adjust to match your actual ProofUploadModal.jsx):
            leave      -> the full leave doc (has ._id and .proof)
            user       -> current employee, for auth headers/body as needed
            onClose    -> close without necessarily refetching
            onSuccess  -> called after upload / delete / submit-to-review;
                          triggers fetchLeaves() so the row's proof.status updates
            showToast  -> reuse existing toast pattern for success/error messages */}
      {proofLeave && (
        <ProofUploadModal
          leave={proofLeave}
          user={user}
          onClose={() => setProofLeave(null)}
          onSuccess={() => {
            setProofLeave(null);
            fetchLeaves();
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};
