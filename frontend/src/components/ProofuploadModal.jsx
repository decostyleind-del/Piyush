import React, { useRef, useState } from "react";
import API from "../api/axios";
import { X, UploadCloud, FileText, Trash2, Send, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

/* Same token system as EmployeeDashboard.jsx / HRDashboard.jsx —
   keep in sync if the palette changes. */
const T = {
  panel: "#141b2c",
  panelRaised: "#1b2438",
  hairline: "rgba(232,227,212,0.08)",
  hairlineStrong: "rgba(232,227,212,0.14)",
  text: "#ece7d9",
  textDim: "#96917f",
  sage: "#7ea08d",
  sageDim: "rgba(126,160,141,0.14)",
  brick: "#c06a56",
  brickDim: "rgba(192,106,86,0.14)",
  orange: "#f97316",
  orangeDark: "#ea580c",
  orangeDim: "rgba(249,115,22,0.14)",
};

const ACCEPTED = ".jpg,.jpeg,.png,.pdf";
const MAX_MB = 5;

export const ProofUploadModal = ({
  leave,
  user,
  onClose,
  onSuccess,
  showToast,
}) => {
  const { t } = useTranslation();
  const isHindi = t("table.type") === "छुट्टी का प्रकार";
  const fileInputRef = useRef(null);

  // Files already saved on the server for this leave (proof.files array)
  const [existingFiles, setExistingFiles] = useState(leave.proof?.files || []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const tr = (en, hi) => (isHindi ? hi : en);

  const handleFilePick = () => fileInputRef.current?.click();

  const handleFilesSelected = async (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file later
    if (picked.length === 0) return;

    const oversized = picked.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (oversized) {
      showToast(
        tr(
          `"${oversized.name}" is larger than ${MAX_MB}MB`,
          `"${oversized.name}" ${MAX_MB}MB से बड़ी है`,
        ),
        "error",
      );
      return;
    }

    // Works the same whether the user picks 1 file or many —
    // multer's upload.array("files", 5) on the backend accepts both.
    const formData = new FormData();
    picked.forEach((file) => formData.append("files", file));

    try {
      setUploading(true);
      const { data } = await API.post(
        `/leaves/${leave._id}/proof-files`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      // Expecting the backend to return the updated files array (or the whole leave doc).
      const updatedFiles =
        data?.files || data?.proof?.files || data?.leave?.proof?.files;
      if (Array.isArray(updatedFiles)) {
        setExistingFiles(updatedFiles);
      } else {
        // Fallback: optimistically append what we just sent if the API
        // doesn't echo the saved file list back in a shape we recognize.
        setExistingFiles((prev) => [
          ...prev,
          ...picked.map((f) => ({
            _id: `${Date.now()}-${f.name}`,
            originalName: f.name,
            url: "",
          })),
        ]);
      }
      showToast(tr("Files uploaded", "फ़ाइलें अपलोड हुईं"), "success");
    } catch (err) {
      showToast(
        err?.response?.data?.message || tr("Upload failed", "अपलोड विफल रहा"),
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      setDeletingId(fileId);
      await API.delete(`/leaves/${leave._id}/proof-files/${fileId}`);
      setExistingFiles((prev) => prev.filter((f) => f._id !== fileId));
      showToast(tr("File removed", "फ़ाइल हटाई गई"), "success");
    } catch (err) {
      showToast(
        err?.response?.data?.message ||
          tr("Couldn't remove file", "फ़ाइल हटाई नहीं जा सकी"),
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    if (existingFiles.length === 0) {
      showToast(
        tr(
          "Attach at least one document first",
          "पहले कम से कम एक दस्तावेज़ जोड़ें",
        ),
        "error",
      );
      return;
    }
    try {
      setSubmitting(true);
      await API.put(`/leaves/${leave._id}/proof-submit`);
      showToast(tr("Sent to reviewer", "समीक्षक को भेजा गया"), "success");
      onSuccess?.();
    } catch (err) {
      showToast(
        err?.response?.data?.message ||
          tr("Couldn't send documents", "दस्तावेज़ भेजे नहीं जा सके"),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const alreadySubmitted = leave.proof?.status === "Submitted";

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
          {tr("Supporting document requested", "सहायक दस्तावेज़ माँगा गया")}
        </h3>
        <div
          style={{
            color: T.textDim,
            fontSize: "1rem",
            marginBottom: "1.25rem",
          }}
        >
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
              fontSize: "0.98rem",
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: T.orange }}>
              {leave.proof.requestedByName
                ? `${leave.proof.requestedByName} ${tr("asked:", "ने माँगा:")}`
                : tr("Reviewer asked:", "समीक्षक ने माँगा:")}
            </strong>{" "}
            {leave.proof.remark}
          </div>
        )}

        {/* Existing / uploaded files */}
        <div style={{ marginBottom: "1rem" }}>
          {existingFiles.length === 0 ? (
            <div
              style={{
                color: T.textDim,
                fontSize: "0.95rem",
                marginBottom: "0.9rem",
              }}
            >
              {tr(
                "No documents attached yet.",
                "अभी तक कोई दस्तावेज़ नहीं जोड़ा गया।",
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                marginBottom: "0.9rem",
              }}
            >
              {existingFiles.map((f) => (
                <div
                  key={f._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    background: T.panelRaised,
                    border: `1px solid ${T.hairline}`,
                    borderRadius: "8px",
                    padding: "0.7rem 0.9rem",
                  }}
                >
                  <a
                    href={f.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      color: T.text,
                      textDecoration: "none",
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
                  </a>

                  {!alreadySubmitted && (
                    <button
                      onClick={() => handleDelete(f._id)}
                      disabled={deletingId === f._id}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: T.brick,
                        cursor:
                          deletingId === f._id ? "not-allowed" : "pointer",
                        opacity: deletingId === f._id ? 0.5 : 1,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                      aria-label="Remove file"
                    >
                      {deletingId === f._id ? (
                        <Loader2 size={16} className="spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!alreadySubmitted && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                multiple
                onChange={handleFilesSelected}
                style={{ display: "none" }}
              />
              <button
                onClick={handleFilePick}
                disabled={uploading}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.6rem",
                  padding: "0.9rem",
                  borderRadius: "9px",
                  border: `1px dashed ${T.hairlineStrong}`,
                  background: "transparent",
                  color: T.textDim,
                  fontSize: "0.98rem",
                  fontWeight: 600,
                  cursor: uploading ? "not-allowed" : "pointer",
                }}
              >
                {uploading ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <UploadCloud size={18} />
                )}
                {uploading
                  ? tr("Uploading…", "अपलोड हो रहा है…")
                  : tr(
                      `Click to attach files (JPG, PNG, PDF — max ${MAX_MB}MB each)`,
                      `फ़ाइलें जोड़ने के लिए क्लिक करें (JPG, PNG, PDF — अधिकतम ${MAX_MB}MB प्रत्येक)`,
                    )}
              </button>
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            marginTop: "1.25rem",
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

          {!alreadySubmitted && (
            <button
              onClick={handleSubmit}
              disabled={submitting || existingFiles.length === 0}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.8rem 1.4rem",
                borderRadius: "8px",
                background: `linear-gradient(to right, ${T.orange}, ${T.orangeDark})`,
                border: "none",
                color: "#fff",
                fontWeight: 700,
                cursor:
                  submitting || existingFiles.length === 0
                    ? "not-allowed"
                    : "pointer",
                opacity: submitting || existingFiles.length === 0 ? 0.6 : 1,
              }}
            >
              {submitting ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <Send size={16} />
              )}
              {tr("Send to reviewer", "समीक्षक को भेजें")}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
