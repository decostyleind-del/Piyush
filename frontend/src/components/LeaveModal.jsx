import React, { useState, useEffect } from "react";
import { X, Clock, Info } from "lucide-react";
import API from "../api/axios";
import { useTranslation } from "react-i18next";

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
  "Maternity Leave (मातृत्व अवकाश)",
  "Paternity Leave (पितृत्व अवकाश)",
  "Bereavement / Death in Family (शोक / परिवार में मृत्यु)",
  "Blood Donation (रक्तदान)",
  "Voting / Election Duty (मतदान / चुनाव ड्यूटी)",
  "Court Appearance / Jury Duty (न्यायालय में उपस्थिति / जूरी ड्यूटी)",
  "Study Leave / Exam Preparation (अध्ययन अवकाश / परीक्षा की तैयारी)",
  "Sabbatical / Career Break (विश्राम अवकाश / करियर ब्रेक)",
  "Unpaid Leave / Leave Without Pay (अवैतनिक अवकाश)",
  "Quarantine / Infectious Disease (संगरोध / संक्रामक रोग)",
  "Work Injury / Occupational Accident (कार्यस्थल पर चोट / दुर्घटना)",
  "Relocation / City Transfer (स्थानांतरण / शहर बदलना)",
  "Accompanying Dependent to Hospital (आश्रित को अस्पताल ले जाना)",
  "Visa / Passport Renewal (वीज़ा / पासपोर्ट नवीनीकरण)",
  "Attending PTA / School Meeting (पीटीए / स्कूल की बैठक में उपस्थिति)",
  "Natural Disaster / Extreme Weather (प्राकृतिक आपदा / खराब मौसम)",
  "Transportation Strike / Commute Issue (परिवहन हड़ताल / आवागमन की समस्या)",
  "Volunteer Work / Social Service (स्वयंसेवी कार्य / समाज सेवा)",
  "Sibling's / Close Friend's Wedding (भाई-बहन / करीबी दोस्त की शादी)",
  "Annual Vacation / Long Holiday (वार्षिक अवकाश / लंबी छुट्टी)",
  "Minor Surgery / Dental Procedure (मामूली सर्जरी / दंत चिकित्सा)",
  "Bank Loan / Property Registration (बैंक ऋण / संपत्ति पंजीकरण)",
];

export const LeaveModal = ({ user, onClose, onSuccess, showToast }) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language && i18n.language.startsWith("hi");

  const [requestCategory, setRequestCategory] = useState("leave");
  const [leaveType, setLeaveType] = useState("Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("Select a reason...");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [misPunchType, setMisPunchType] = useState("Check-In");

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    if (requestCategory === "leave") {
      setLeaveType("Leave");
    } else {
      setLeaveType("Out Duty (OD)");
    }
    setStartTime("");
    setEndTime("");
  }, [requestCategory]);

  useEffect(() => {
    if (leaveType === "Mis-Punch") {
      setStartDate(todayString);
      setEndTime("");
    }
  }, [leaveType, todayString]);

  const isSingleDateApp = [
    "Early Leaving",
    "Late Coming",
    "Loss in Hour (LIH)",
    "Mis-Punch",
  ].includes(leaveType);
  const isSingleTimeApp = [
    "Early Leaving",
    "Late Coming",
    "Mis-Punch",
  ].includes(leaveType);

  const showTimeFields =
    requestCategory === "application" &&
    (isSingleDateApp || (startDate && endDate && startDate === endDate));

  useEffect(() => {
    if (!showTimeFields) {
      setStartTime("");
      setEndTime("");
    }
  }, [showTimeFields]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalReason = "";
    if (requestCategory === "leave") {
      if (reason === "Select a reason...") {
        return showToast(t("modal.select_reason"), "error");
      }
      finalReason = reason === "Other / अन्य" ? customReason : reason;
    } else {
      finalReason = customReason;
    }

    if (!finalReason.trim()) {
      return showToast(t("modal.select_reason"), "error");
    }

    if (leaveType === "Mis-Punch") {
      finalReason = `[Missed ${misPunchType}] ${finalReason}`;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        employeeId: user._id,
        leaveType,
        startDate,
        endDate: isSingleDateApp ? startDate : endDate,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        reason: finalReason,
        status: "Pending",
      };
      await API.post("/leaves", payload);
      showToast(t("proof.employee_send_success"), "success");
      onSuccess();
      onClose();
    } catch (error) {
      showToast(
        error.response?.data?.message || t("errors.load_fail"),
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
    caretColor: "#3b82f6",
  };

  // Reusable hint text for time fields
  const timeHintStyle = {
    fontSize: "0.65rem",
    color: T.textDim,
    marginTop: "0.3rem",
    fontStyle: "italic",
  };

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
    >
      <style>
        {`
          input[type="date"]::-webkit-calendar-picker-indicator,
          input[type="time"]::-webkit-calendar-picker-indicator {
            filter: invert(1) brightness(0.9);
            cursor: pointer;
            opacity: 0.7;
          }
          input[type="date"]::-webkit-calendar-picker-indicator:hover,
          input[type="time"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
          }
        `}
      </style>

      <div
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
              ? t("modal.title")
              : t("modal.submit_app")}
          </h2>
          <button
            type="button"
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
              {t("modal.standard_leave")}
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
              {isHindi ? "आवेदन" : "Application"}
            </button>
          </div>

          {requestCategory === "application" && (
            <div>
              <label style={labelStyle}>{t("modal.request_type")}</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                style={inputStyle}
              >
                <option value="Out Duty (OD)">Out Duty (OD)</option>
                <option value="Travel & Tour">{t("modal.travel")}</option>
                <option value="Early Leaving">
                  {t("modal.early_leaving")}
                </option>
                <option value="Late Coming">{t("modal.late_coming")}</option>
                <option value="Loss in Hour (LIH)">{t("modal.lih")}</option>
                <option value="Mis-Punch">Mis-Punch</option>
              </select>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label style={labelStyle}>
                {isSingleDateApp ? t("modal.date") : t("modal.start_date")}
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  ...inputStyle,
                  opacity: leaveType === "Mis-Punch" ? 0.7 : 1,
                }}
                readOnly={leaveType === "Mis-Punch"}
              />
            </div>
            {!isSingleDateApp && (
              <div>
                <label style={labelStyle}>{t("modal.end_date")}</label>
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

          {showTimeFields && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  leaveType === "Mis-Punch" ? "1fr" : "1fr 1fr",
                gap: "1rem",
                marginTop: "-0.5rem",
              }}
            >
              {leaveType === "Mis-Punch" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Punch Type</label>
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        marginTop: "0.8rem",
                      }}
                    >
                      <label
                        style={{
                          color: T.text,
                          fontSize: "0.9rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          value="Check-In"
                          checked={misPunchType === "Check-In"}
                          onChange={(e) => setMisPunchType(e.target.value)}
                          style={{ accentColor: T.orange }}
                        />
                        Check-In
                      </label>
                      <label
                        style={{
                          color: T.text,
                          fontSize: "0.9rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          value="Check-Out"
                          checked={misPunchType === "Check-Out"}
                          onChange={(e) => setMisPunchType(e.target.value)}
                          style={{ accentColor: T.orange }}
                        />
                        Check-Out
                      </label>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Actual Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={inputStyle}
                    />
                    <div style={timeHintStyle}>
                      * Press <b>A</b> for AM, <b>P</b> for PM, or click the
                      clock icon.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label style={labelStyle}>
                      {leaveType === "Late Coming"
                        ? t("modal.arrived_at")
                        : leaveType === "Early Leaving"
                          ? t("modal.leaving_at")
                          : t("modal.start_time")}
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={inputStyle}
                    />
                    <div style={timeHintStyle}>
                      * Press <b>A</b> (AM) or <b>P</b> (PM)
                    </div>
                  </div>
                  {!isSingleTimeApp && (
                    <div>
                      <label style={labelStyle}>{t("modal.end_time")}</label>
                      <input
                        type="time"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={inputStyle}
                      />
                      <div style={timeHintStyle}>
                        * Press <b>A</b> (AM) or <b>P</b> (PM)
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {requestCategory === "application" && !isSingleDateApp && (
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
              <Info size={14} color={T.orange} />
              {t("modal.optional_time_hint")}
            </div>
          )}

          {requestCategory === "leave" && (
            <div>
              <label style={labelStyle}>{t("modal.reason_details")}</label>
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
          )}

          {(requestCategory === "application" || reason === "Other / अन्य") && (
            <div>
              <label style={labelStyle}>{t("modal.specify_details")}</label>
              <input
                type="text"
                required
                placeholder={
                  requestCategory === "application"
                    ? t("modal.placeholder_mumbai") ||
                      "e.g., Going to Mumbai office..."
                    : t("modal.placeholder_reason")
                }
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
              {t("modal.cancel")}
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
              {isSubmitting ? t("modal.submitting") : t("modal.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
