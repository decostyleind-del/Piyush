import React from "react";
import { useTranslation } from "react-i18next";

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("en") ? "hi" : "en";
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      style={{
        padding: "0.5rem 1rem",
        borderRadius: "8px",
        background: "linear-gradient(to right, #f97316, #ea580c)",
        color: "#ffffff",
        border: "none",
        fontWeight: "700",
        cursor: "pointer",
        marginRight: "1rem",
      }}
    >
      {i18n.language.startsWith("en") ? "हिंदी" : "English"}
    </button>
  );
};
