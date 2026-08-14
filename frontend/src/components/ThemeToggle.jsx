import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5rem",
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.1)",
        border: "1px solid var(--border-color)",
        color: "var(--text-main)",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      title="Toggle Dark/Light Mode"
    >
      {theme === "dark" ? (
        <Sun size={18} color="#f59e0b" />
      ) : (
        <Moon size={18} color="#3b82f6" />
      )}
    </button>
  );
};
