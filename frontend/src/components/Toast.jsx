import React, { useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

/* Same "Personnel Ledger" token system as the rest of the app. */
const T = {
  panel: "#141b2c",
  hairlineStrong: "rgba(232,227,212,0.14)",
  text: "#ece7d9",
  sage: "#7ea08d",
  brick: "#c06a56",
};

const keyframes = `
@keyframes toast-slide-in {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}`;

export const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";
  const accent = isSuccess ? T.sage : T.brick;

  return (
    <div
      style={{
        position: "fixed",
        top: "1.5rem",
        right: "1.5rem",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.85rem 1.25rem",
        background: T.panel,
        border: `1px solid ${accent}55`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: "8px",
        boxShadow: "0 12px 30px -8px rgba(0,0,0,0.5)",
        color: T.text,
        fontFamily:
          "'Noto Sans', 'Noto Sans Devanagari', system-ui, sans-serif",
        animation: "toast-slide-in 0.25s ease-out",
      }}
    >
      <style>{keyframes}</style>
      {isSuccess ? (
        <CheckCircle size={20} color={accent} />
      ) : (
        <XCircle size={20} color={accent} />
      )}
      <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>{message}</span>
    </div>
  );
};
