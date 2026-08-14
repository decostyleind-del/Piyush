import React from "react";
import { LanguageToggle } from "./LanguageToggle";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2.5rem",
        background: "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Left: Logo Image */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="/logo.webp"
          alt="DecoStyle Logo"
          style={{ height: "40px", objectFit: "contain" }}
        />
      </div>

      {/* Right: Language Toggle & Professional Logout Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <LanguageToggle />

        {user && (
          <button
            onClick={logout}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1rem",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
              transition: "all 0.2s",
            }}
          >
            <LogOut size={16} />
            {t("nav.logout")}
          </button>
        )}
      </div>
    </nav>
  );
};
