import React from "react";
import { X, FileText, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

/* Same token system as the rest of the dashboards. */
const T = {
  panel: "#141b2c",
  panelRaised: "#1b2438",
  hairline: "rgba(232,227,212,0.08)",
  hairlineStrong: "rgba(232,227,212,0.14)",
  text: "#ece7d9",
  textDim: "#96917f",
  sage: "#7ea08d",
  orange: "#f97316",
  orangeDim: "rgba(249,115,22,0.14)",
};

/**
 * Read-only "what did the employee attach" viewer for HR / HOD / Admin.
 * Drop this into HRDashboard.jsx (or HOD/Admin equivalents) — see the
 * integration snippet below for exactly where.
 *
 * Props:
 *   leave    -> the leave doc (needs .proof.files, .proof.remark, .employeeName, etc.)
 *   onClose  -> close handler
 */
export const ProofDocumentsViewer = ({ leave, onClose }) => {
  const { t } = useTranslation();
  const isHindi = t("table.type") === "छुट्टी का प्रकार";
  const tr = (en, hi) => (isHindi ? hi : en);

  const files = leave.proof?.files || [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6,9,16,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1.5rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "520px",
          background: T.panel,
          border: `1px solid ${T.hairlineStrong}`,
          borderRadius: "14px",
          padding: "1.75rem",
          color: T.text,
          fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "transparent",
            border: "none",
            color: T.textDim,
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h3
          style={{
            fontFamily: "'Noto Serif', 'Noto Serif Devanagari', serif",
            fontSize: "1.4rem",
            fontWeight: 600,
            marginBottom: "0.4rem",
          }}
        >
          {tr("Submitted documents", "जमा किए गए दस्तावेज़")}
        </h3>
        <div
          style={{
            color: T.textDim,
            fontSize: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          {leave.employeeName ? `${leave.employeeName} · ` : ""}
          {leave.leaveType} · {new Date(leave.startDate).toLocaleDateString()} →{" "}
          {new Date(leave.endDate).toLocaleDateString()}
        </div>

        {leave.proof?.remark && (
          <div
            style={{
              background: T.orangeDim,
              border: `1px solid ${T.orange}55`,
              borderRadius: "8px",
              padding: "0.9rem 1.1rem",
              marginBottom: "1.25rem",
              fontSize: "0.95rem",
              lineHeight: 1.5,
              color: T.textDim,
            }}
          >
            {tr("Originally requested:", "मूल अनुरोध:")}{" "}
            <span style={{ color: T.text }}>{leave.proof.remark}</span>
          </div>
        )}

        {files.length === 0 ? (
          <div style={{ color: T.textDim, fontSize: "0.95rem" }}>
            {tr(
              "No documents were attached.",
              "कोई दस्तावेज़ नहीं जोड़ा गया था।",
            )}
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            {files.map((f) => (
              <a
                key={f._id}
                href={f.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  background: T.panelRaised,
                  border: `1px solid ${T.hairline}`,
                  borderRadius: "8px",
                  padding: "0.8rem 0.95rem",
                  color: T.text,
                  textDecoration: "none",
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
                  <FileText
                    size={16}
                    color={T.sage}
                    style={{ flexShrink: 0 }}
                  />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: "0.95rem",
                    }}
                  >
                    {f.originalName || f.name}
                  </span>
                </span>
                <ExternalLink
                  size={15}
                  color={T.textDim}
                  style={{ flexShrink: 0 }}
                />
              </a>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.8rem 1.4rem",
              borderRadius: "8px",
              background: T.panelRaised,
              border: `1px solid ${T.hairlineStrong}`,
              color: T.text,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {tr("Close", "बंद करें")}
          </button>
        </div>
      </div>
    </div>
  );
};
