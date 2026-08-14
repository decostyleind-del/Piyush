import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn, HelpCircle, X, Send } from "lucide-react";
import API from "../api/axios"; // Ensure you import your API instance

/* "Personnel Ledger" token system */
const T = {
  ink: "#0c1120",
  panel: "#141b2c",
  panelRaised: "#1b2438",
  hairline: "rgba(232,227,212,0.08)",
  hairlineStrong: "rgba(232,227,212,0.14)",
  text: "#ece7d9",
  textDim: "#96917f",
  brass: "#e0791a",
  brassDim: "rgba(224,121,26,0.16)",
};

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif:wght@500;600;700&family=Noto+Serif+Devanagari:wght@500;600;700&display=swap');`;

const fieldLabel = {
  display: "block",
  fontSize: "0.7rem",
  fontWeight: 700,
  color: T.textDim,
  marginBottom: "0.5rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const fieldInput = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: T.panelRaised,
  border: `1px solid ${T.hairlineStrong}`,
  borderRadius: "6px",
  color: T.text,
  fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};

export const Login = ({ showToast }) => {
  const { t } = useTranslation();
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  // Login State
  const [employeeCode, setEmployeeCode] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Support Ticket State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const credentials = isAdminLogin
        ? { email, password }
        : { employeeCode, dob };
      const user = await login(credentials);
      showToast("Login successful!", "success");

      if (user.role === "Admin") navigate("/admin");
      else if (user.role === "HR") navigate("/hr");
      else if (user.role === "HOD") navigate("/hod");
      else navigate("/employee");
    } catch (err) {
      showToast(err.response?.data?.message || "Invalid credentials", "error");
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingSupport(true);

    try {
      // REAL API CALL targeting the public endpoint
      await API.post("/support-tickets", {
        email: supportEmail,
        message: supportMessage,
      });

      showToast(
        "Support request sent to HR. They will contact you shortly.",
        "success",
      );
      setShowSupportModal(false);
      setSupportEmail("");
      setSupportMessage("");
    } catch (err) {
      showToast("Failed to send request. Please try again.", "error");
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        padding: "2rem",
        background: `radial-gradient(circle at top, #1c1710 0%, ${T.ink} 60%)`,
      }}
    >
      <style>{fontImport}</style>
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.hairlineStrong}`,
          borderRadius: "10px",
          padding: "2.75rem",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              background: T.brassDim,
              border: `1px solid ${T.brass}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.1rem",
              color: T.brass,
            }}
          >
            <LogIn size={20} />
          </div>
          <h1
            style={{
              fontFamily: "'Noto Serif', 'Noto Serif Devanagari', serif",
              fontSize: "1.65rem",
              fontWeight: 600,
              color: T.text,
              marginBottom: "0.5rem",
              lineHeight: 1.3,
            }}
          >
            {t("login.title")}
          </h1>
          <p
            style={{
              color: T.textDim,
              fontSize: "0.875rem",
              fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
            }}
          >
            {t("login.subtitle")}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            background: T.panelRaised,
            padding: "4px",
            borderRadius: "8px",
            marginBottom: "1.75rem",
            border: `1px solid ${T.hairline}`,
          }}
        >
          <button
            type="button"
            onClick={() => setIsAdminLogin(false)}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "6px",
              border: "none",
              background: !isAdminLogin ? T.brass : "transparent",
              color: !isAdminLogin ? T.ink : T.textDim,
              fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {t("login.employee_portal")}
          </button>
          <button
            type="button"
            onClick={() => setIsAdminLogin(true)}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "6px",
              border: "none",
              background: isAdminLogin ? T.brass : "transparent",
              color: isAdminLogin ? T.ink : T.textDim,
              fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {t("login.management_portal")}
          </button>
        </div>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {!isAdminLogin ? (
            <>
              <div>
                <label style={fieldLabel}>{t("login.emp_code_label")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("login.emp_code_placeholder")}
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  style={fieldInput}
                />
              </div>
              <div>
                <label style={fieldLabel}>{t("login.dob_label")}</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  style={fieldInput}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={fieldLabel}>{t("login.email_label")}</label>
                <input
                  type="email"
                  required
                  placeholder={t("login.email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={fieldInput}
                />
              </div>
              <div>
                <label style={fieldLabel}>{t("login.password_label")}</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={fieldInput}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.85rem",
              marginTop: "0.5rem",
              borderRadius: "6px",
              background: T.brass,
              border: "none",
              color: T.ink,
              fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.95rem",
              boxShadow: "0 4px 14px rgba(201,162,75,0.3)",
            }}
          >
            {t("login.sign_in")}
          </button>
        </form>

        {!isAdminLogin && (
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "6px",
                background: "transparent",
                border: `1px dashed ${T.hairlineStrong}`,
                color: T.textDim,
                fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                fontSize: "0.95rem",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = T.brass;
                e.currentTarget.style.borderColor = T.brass;
                e.currentTarget.style.background = T.brassDim;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = T.textDim;
                e.currentTarget.style.borderColor = T.hairlineStrong;
                e.currentTarget.style.background = "transparent";
              }}
            >
              <HelpCircle size={18} /> {t("login.forgot_details")}
            </button>
          </div>
        )}
      </div>

      {/* Interactive Support Modal - Wider & Bilingual */}
      {showSupportModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: T.panel,
              border: `1px solid ${T.hairlineStrong}`,
              borderRadius: "10px",
              padding: "2.5rem",
              width: "100%",
              maxWidth: "550px",
              position: "relative",
              color: T.text,
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            }}
          >
            <button
              onClick={() => setShowSupportModal(false)}
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
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
                fontSize: "1.45rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: T.text,
              }}
            >
              {t("login.support_title")}
            </h3>
            <p
              style={{
                fontSize: "0.95rem",
                color: T.textDim,
                lineHeight: "1.6",
                marginBottom: "2rem",
                fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
              }}
            >
              {t("login.support_desc")}
            </p>

            <form
              onSubmit={handleSupportSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <div>
                <label style={fieldLabel}>
                  {t("login.support_email_label")}
                </label>
                <input
                  type="email"
                  required
                  placeholder={t("login.support_email_placeholder")}
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  style={fieldInput}
                />
              </div>
              <div>
                <label style={fieldLabel}>{t("login.support_msg_label")}</label>
                <textarea
                  required
                  rows="4"
                  placeholder={t("login.support_msg_placeholder")}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  style={{ ...fieldInput, resize: "vertical" }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingSupport}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  width: "100%",
                  padding: "0.95rem",
                  marginTop: "1rem",
                  borderRadius: "6px",
                  background: T.brass,
                  border: "none",
                  color: T.ink,
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: isSubmittingSupport ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s",
                  opacity: isSubmittingSupport ? 0.7 : 1,
                }}
              >
                {isSubmittingSupport ? (
                  t("login.support_sending")
                ) : (
                  <>
                    <Send size={18} /> {t("login.support_send")}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
