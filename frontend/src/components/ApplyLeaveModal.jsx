import React, { useState, useEffect } from "react";
import { X, Clock, Info } from "lucide-react";
import API from "../api/axios";

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
};

const PRESET_REASONS = [
  "Select a reason...",
  "Other / अन्य",
  "Medical Appointment / Doctor Visit (चिकित्सा नियुक्ति / डॉक्टर की यात्रा)",
  "Fever and Recommended Rest (बुखार और अनुशंसित विश्राम)",
  "Severe Migraine / Headache (गंभीर माइग्रेन / सिरदर्द)",
  "Stomach Infection / Food Poisoning (पेट का संक्रमण / फूड पॉइज़निंग)",
  "Family Function / Wedding Ceremony (पारिवारिक समारोह / विवाह)",
  "Religious Ceremony / Festival (धार्मिक अनुष्ठान / त्योहार)",
  "Outstation Travel / Personal Work (आउटस्टेशन यात्रा / व्यक्तिगत कार्य)",
  "Urgent Domestic Emergency (अत्यावश्यक घरेलू आपातकाल)",
  "Home Maintenance / Plumbing Repairs (घर का रखरखाव / नलसाजी मरम्मत)",
  "Childcare / Parent Care Duties (बाल देखभाल / माता-पिता की देखभाल)",
  "Mental Health Day / Burnout Recovery (मानसिक स्वास्थ्य दिवस / थकान से रिकवरी)",
  "Legal / Government Documentation Work (कानूनी / सरकारी दस्तावेज़ीकरण कार्य)",
  "Banking / Financial Property Work (बैंकिंग / वित्तीय संपत्ति कार्य)",
  "Vehicle Servicing / Accident Repair (वाहन सर्विसिंग / दुर्घटना मरम्मत)",
  "Moving / Relocating to New House (नए घर में स्थानांतरण / शिफ्टिंग)",
  "Academic Exam / Professional Certification (शैक्षणिक परीक्षा / व्यावसायिक प्रमाणन)",
  "Attending Close Relative's Surgery (सगे संबंधी की सर्जरी में शामिल होना)",
  "Pet Care / Veterinary Emergency (पालतू जानवरों की देखभाल / पशु चिकित्सा आपातकाल)",
];

export const LeaveModal = ({ user, onClose, onSuccess, showToast }) => {
  const [requestCategory, setRequestCategory] = useState("leave");
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("Select a reason...");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (requestCategory === "leave") setLeaveType("Casual Leave");
    else setLeaveType("Out of Duty (OD)");
    setStartTime("");
    setEndTime("");
  }, [requestCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reason === "Select a reason...")
      return showToast("Please select a reason", "error");
    const finalReason = reason === "Other / अन्य" ? customReason : reason;
    if (!finalReason.trim())
      return showToast("Please provide a reason", "error");

    setIsSubmitting(true);
    try {
      const isSingleDayApp = [
        "Early Leaving",
        "Late Coming",
        "Loss in Hour (LIH)",
      ].includes(leaveType);
      const payload = {
        employeeId: user._id,
        leaveType,
        startDate,
        endDate: isSingleDayApp ? startDate : endDate,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        reason: finalReason,
        status: "Pending",
      };
      await API.post("/leaves", payload);
      showToast("Request submitted successfully", "success");
      onSuccess();
      onClose();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to submit request",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.72rem",
    fontWeight: 700,
    color: T.textDim,
    marginBottom: "0.4rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  };
  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    background: T.panelRaised,
    border: `1px solid ${T.hairlineStrong}`,
    borderRadius: "8px",
    color: T.text,
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  };

  const isSingleDayApp = [
    "Early Leaving",
    "Late Coming",
    "Loss in Hour (LIH)",
  ].includes(leaveType);
  const isSingleTimeApp = ["Early Leaving", "Late Coming"].includes(leaveType);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6, 9, 17, 0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.panel,
          border: `1px solid ${T.hairlineStrong}`,
          borderRadius: "12px",
          width: "100%",
          maxWidth: "480px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "1.5rem 1.75rem",
            borderBottom: `1px solid ${T.hairline}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "'Noto Serif', serif",
              fontSize: "1.35rem",
              fontWeight: 600,
              color: T.text,
              margin: 0,
            }}
          >
            {requestCategory === "leave"
              ? "Apply for Leave"
              : "Submit Application"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: T.textDim,
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              background: T.panelRaised,
              padding: "4px",
              borderRadius: "8px",
              border: `1px solid ${T.hairline}`,
            }}
          >
            <button
              type="button"
              onClick={() => setRequestCategory("leave")}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "6px",
                border: "none",
                background:
                  requestCategory === "leave" ? T.orangeDim : "transparent",
                color: requestCategory === "leave" ? T.orange : T.textDim,
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Standard Leave
            </button>
            <button
              type="button"
              onClick={() => setRequestCategory("application")}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "6px",
                border: "none",
                background:
                  requestCategory === "application"
                    ? T.orangeDim
                    : "transparent",
                color: requestCategory === "application" ? T.orange : T.textDim,
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Application (OD/WFH/Time)
            </button>
          </div>

          <div>
            <label style={labelStyle}>Request Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              style={inputStyle}
            >
              {requestCategory === "leave" ? (
                <>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                </>
              ) : (
                <>
                  <option value="Out of Duty (OD)">Out of Duty (OD)</option>
                  <option value="Work From Home (WFH)">
                    Work From Home (WFH)
                  </option>
                  <option value="Travel & Tour">Travel & Tour</option>
                  <option value="Early Leaving">Early Leaving</option>
                  <option value="Late Coming">Late Coming</option>
                  <option value="Loss in Hour (LIH)">Loss in Hour (LIH)</option>
                </>
              )}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label style={labelStyle}>
                {isSingleDayApp ? "Date" : "Start Date"}
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            {!isSingleDayApp && (
              <div>
                <label style={labelStyle}>End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={inputStyle}
                  min={startDate}
                />
              </div>
            )}
          </div>

          {requestCategory === "application" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginTop: "-0.5rem",
              }}
            >
              <div>
                <label style={labelStyle}>
                  {leaveType === "Late Coming"
                    ? "Arrived At"
                    : leaveType === "Early Leaving"
                      ? "Leaving At"
                      : "Start Time"}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={inputStyle}
                  required={isSingleDayApp}
                />
              </div>
              {!isSingleTimeApp && (
                <div>
                  <label style={labelStyle}>End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={inputStyle}
                    required={leaveType === "Loss in Hour (LIH)"}
                  />
                </div>
              )}
            </div>
          )}

          {requestCategory === "application" && !isSingleDayApp && (
            <div
              style={{
                fontSize: "0.75rem",
                color: T.textDim,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                marginTop: "-0.75rem",
                background: T.panelRaised,
                padding: "0.5rem",
                borderRadius: "6px",
              }}
            >
              <Info size={14} color={T.orange} /> Times are optional for
              multi-day trips.
            </div>
          )}

          <div>
            <label style={labelStyle}>Reason / Details</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={inputStyle}
            >
              {PRESET_REASONS.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === "Other / अन्य" && (
            <div>
              <label style={labelStyle}>Please specify details</label>
              <input
                type="text"
                required
                placeholder="Type details here..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "0.75rem 1.25rem",
                borderRadius: "8px",
                border: `1px solid ${T.hairlineStrong}`,
                background: "transparent",
                color: T.textDim,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                border: "none",
                background: `linear-gradient(to right, ${T.orange}, ${T.orangeDark})`,
                color: "#fff",
                fontWeight: 700,
                cursor: isSubmitting ? "default" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
