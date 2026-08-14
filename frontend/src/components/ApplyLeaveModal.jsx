import { useState } from "react";

/* Same "Personnel Ledger" token system as the dashboards —
   keep in sync if you tweak the palette. */
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
  brick: "#c06a56",
  brickDim: "rgba(192,106,86,0.14)",
};

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif:wght@500;600;700&family=Noto+Serif+Devanagari:wght@500;600;700&display=swap');`;

/**
 * Two-step popup shown from the Employee Dashboard's "Apply for Leave" button.
 *
 * Step 1: "Have you discussed this leave with your HOD?" Yes / No buttons.
 *   - No  -> blocked with a message, request goes nowhere.
 *   - Yes -> step 2 reveals a reason textarea.
 * Step 2: employee explains why they want leave, then "Continue" hands
 *   { reason } back to the caller, which routes to the Apply Leave page
 *   to finish picking category + dates.
 */
export default function ApplyLeaveModal({ onClose, onContinue }) {
  const [step, setStep] = useState("ask"); // "ask" | "blocked" | "reason"
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!reason.trim()) {
      setError("Please tell us why you're requesting this leave.");
      return;
    }
    onContinue(reason.trim());
  };

  const primaryBtn = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.7rem 1.4rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: 600,
    background: T.brass,
    color: T.ink,
    border: "none",
    cursor: "pointer",
  };

  const ghostBtn = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.7rem 1.4rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: 600,
    background: "transparent",
    color: T.textDim,
    border: `1px solid ${T.hairlineStrong}`,
    cursor: "pointer",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6, 9, 17, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1.5rem",
      }}
    >
      <style>{fontImport}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.panel,
          border: `1px solid ${T.hairlineStrong}`,
          borderRadius: "10px",
          padding: "2.25rem",
          width: "100%",
          maxWidth: "440px",
          position: "relative",
          fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
          color: T.text,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "1.1rem",
            right: "1.1rem",
            background: "none",
            border: "none",
            color: T.textDim,
            fontSize: "1.4rem",
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ×
        </button>

        {step === "ask" && (
          <>
            <div
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: T.brass,
                marginBottom: "0.6rem",
              }}
            >
              Before you apply
            </div>
            <h2
              style={{
                fontFamily: "'Noto Serif', 'Noto Serif Devanagari', serif",
                fontSize: "1.4rem",
                fontWeight: 600,
                marginBottom: "0.6rem",
              }}
            >
              Have you discussed this leave with your HOD?
            </h2>
            <p
              style={{
                color: T.textDim,
                fontSize: "0.875rem",
                marginBottom: "1.75rem",
              }}
            >
              Requests without a prior conversation are usually sent back, so
              let's confirm first.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                style={{ ...primaryBtn, flex: 1 }}
                onClick={() => setStep("reason")}
              >
                Yes, I have
              </button>
              <button
                style={{ ...ghostBtn, flex: 1 }}
                onClick={() => setStep("blocked")}
              >
                No, not yet
              </button>
            </div>
          </>
        )}

        {step === "blocked" && (
          <>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.3rem 0.7rem",
                borderRadius: "3px",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: T.brick,
                background: T.brickDim,
                marginBottom: "1rem",
              }}
            >
              Talk to your HOD first
            </div>
            <h2
              style={{
                fontFamily: "'Noto Serif', 'Noto Serif Devanagari', serif",
                fontSize: "1.4rem",
                fontWeight: 600,
                marginBottom: "0.6rem",
              }}
            >
              Not quite ready yet
            </h2>
            <p
              style={{
                color: T.textDim,
                fontSize: "0.875rem",
                lineHeight: 1.6,
                marginBottom: "1.75rem",
              }}
            >
              Discuss this leave with your HOD before applying. Once that
              conversation has happened, come back and start again.
            </p>
            <button style={{ ...primaryBtn, width: "100%" }} onClick={onClose}>
              Okay, got it
            </button>
          </>
        )}

        {step === "reason" && (
          <>
            <div
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: T.brass,
                marginBottom: "0.6rem",
              }}
            >
              Step 2 of 2
            </div>
            <h2
              style={{
                fontFamily: "'Noto Serif', 'Noto Serif Devanagari', serif",
                fontSize: "1.4rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              Why do you need this leave?
            </h2>
            <textarea
              rows={4}
              placeholder="Briefly explain the reason for your leave"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              autoFocus
              style={{
                width: "100%",
                background: T.panelRaised,
                border: `1px solid ${error ? T.brick : T.hairlineStrong}`,
                borderRadius: "6px",
                padding: "0.85rem 1rem",
                color: T.text,
                fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
                fontSize: "0.875rem",
                resize: "vertical",
                outline: "none",
              }}
            />
            {error && (
              <p
                style={{
                  color: T.brick,
                  fontSize: "0.78rem",
                  marginTop: "0.5rem",
                }}
              >
                {error}
              </p>
            )}
            <div
              style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}
            >
              <button style={ghostBtn} onClick={() => setStep("ask")}>
                Back
              </button>
              <button
                style={{ ...primaryBtn, flex: 1 }}
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
