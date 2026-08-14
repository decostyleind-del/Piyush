import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Toast } from "./components/Toast";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  const [toast, setToast] = useState(null);

  // Toast.jsx owns the auto-close timer, so this just sets the toast —
  // no setTimeout here to avoid two competing timers.
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <div
          className="app-container"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Single Unified Navbar Row with Logo & Language Toggle */}
          <Navbar />

          <main className="main-content" style={{ flex: 1, padding: 0 }}>
            <AppRoutes showToast={showToast} />
          </main>

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
