import React, { useState } from "react";
import API from "../api/axios";
import { X, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export const LeaveModal = ({ user, onClose, onSuccess, showToast }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [selectedReasonOption, setSelectedReasonOption] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Generate today's date in YYYY-MM-DD format for the 'min' attribute
  const today = new Date().toISOString().split("T")[0];

  // 20 Professional Reasons for Leave (Bilingual)
  const leaveReasons = [
    "Other / अन्य",
    "Medical Appointment / Doctor Visit (चिकित्सा नियुक्ति / डॉक्टर की यात्रा)",
    "Fever and Recommended Rest (बुखार और अनुशंसित विश्राम)",
    "Severe Migraine / Headache (गंभीर माइग्रेन / सिरदर्द)",
    "Stomach Infection / Food Poisoning (पेट का संक्रमण / फूड पॉइजनिंग)",
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
    "Weather Disruption / Heavy Rains (मौसम की व्यवधान / भारी बारिश)",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Resolve final reason text
    const finalReason =
      selectedReasonOption === "Other / अन्य"
        ? customReason
        : selectedReasonOption;

    if (!finalReason) {
      showToast("Please provide a reason for leave", "error");
      return;
    }

    try {
      setLoading(true);
      // discussedWithHOD is always true here since reaching step 2
      // requires clicking "Yes, let's proceed" in step 1.
      await API.post("/leaves", {
        employeeId: user._id,
        leaveType,
        startDate,
        endDate,
        reason: finalReason,
        discussedWithHOD: true,
      });

      showToast("Leave submitted successfully!", "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to apply leave",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Shared orange "primary" button style, used for the proceed / submit actions
  const orangeBtn = {
    flex: 1,
    background: "linear-gradient(to right, #f97316, #ea580c)",
    color: "#fff",
    border: "none",
  };

  // Orange "outline" button style, used for the secondary / cancel-style actions
  const orangeOutlineBtn = {
    flex: 1,
    background: "transparent",
    color: "#f97316",
    border: "1px solid #f97316",
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ position: "relative" }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>

        {step === 1 ? (
          /* ---------- STEP 1: Pre-requisite HOD check ---------- */
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div
              style={{
                display: "inline-flex",
                padding: "1rem",
                background: "var(--warning-bg)",
                color: "var(--warning)",
                borderRadius: "50%",
                marginBottom: "1.25rem",
              }}
            >
              <AlertCircle size={32} />
            </div>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                marginBottom: "0.75rem",
                color: "#fff",
              }}
            >
              {t("prerequisite.title")}
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "2rem",
                fontSize: "0.9rem",
                lineHeight: "1.5",
              }}
            >
              {t("prerequisite.description")}
            </p>
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
              <button
                onClick={onClose}
                className="btn btn-secondary"
                style={orangeOutlineBtn}
              >
                {t("prerequisite.no")}
              </button>
              <button
                onClick={() => setStep(2)}
                className="btn btn-primary"
                style={orangeBtn}
              >
                {t("prerequisite.yes")}
              </button>
            </div>
          </div>
        ) : (
          /* ---------- STEP 2: Full bilingual leave form ---------- */
          <div>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
                color: "#fff",
              }}
            >
              {t("modal.title")}
            </h3>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Leave Type */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t("modal.leave_type")}</label>
                <select
                  className="input-field"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="Casual Leave">
                    Casual Leave (आकस्मिक अवकाश)
                  </option>
                  <option value="Sick Leave">
                    Sick Leave (चिकित्सा अवकाश)
                  </option>
                  <option value="Earned Leave">
                    Earned Leave (अर्जित अवकाश)
                  </option>
                </select>
              </div>

              {/* Date Range */}
              <div style={{ display: "flex", gap: "1rem" }}>
                <div
                  className="form-group"
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <label className="form-label">START DATE</label>
                  <input
                    type="date"
                    className="input-field"
                    required
                    min={today}
                    value={startDate}
                    style={{ colorScheme: "dark", cursor: "pointer" }}
                    onClick={(e) =>
                      e.target.showPicker && e.target.showPicker()
                    }
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setStartDate(newStart);
                      // Auto-clear end date if it violates the new start date
                      setEndDate((prevEnd) =>
                        prevEnd && newStart > prevEnd ? "" : prevEnd,
                      );
                    }}
                  />
                </div>
                <div
                  className="form-group"
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <label className="form-label">END DATE</label>
                  <input
                    type="date"
                    className="input-field"
                    required
                    // Safely calculate the minimum end date (whichever is later: today or start date)
                    min={startDate > today ? startDate : today}
                    value={endDate}
                    style={{ colorScheme: "dark", cursor: "pointer" }}
                    onClick={(e) =>
                      e.target.showPicker && e.target.showPicker()
                    }
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Reason Dropdown */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t("modal.reason_label")}</label>
                <select
                  className="input-field"
                  required
                  value={selectedReasonOption}
                  onChange={(e) => setSelectedReasonOption(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="" disabled>
                    {t("modal.select_reason")}
                  </option>
                  {leaveReasons.map((reason, idx) => (
                    <option key={idx} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* CONDITIONAL TEXT BOX: Appears ONLY when 'Other / अन्य' is selected */}
              {selectedReasonOption === "Other / अन्य" && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: "#38bdf8" }}>
                    PLEASE SPECIFY REASON (कृपया कारण बताएं / हिंदी या अंग्रेजी)
                  </label>
                  <textarea
                    className="input-field"
                    required
                    rows="3"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Type here in Hindi or English..."
                    style={{ resize: "vertical", borderColor: "#38bdf8" }}
                  />
                </div>
              )}

              <div
                style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  {t("modal.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={orangeBtn}
                >
                  {loading ? "Submitting..." : t("modal.submit")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
