import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Route Guards
import { RoleBasedRoute } from "./RoleBasedRoute";
import { PublicRoute } from "./PublicRoute";

// Pages
import Home from "../pages/Home";
import { Login } from "../pages/Login";
import { EmployeeDashboard } from "../pages/EmployeeDashboard";
import { HODDashboard } from "../pages/HODDashboard";
import { HRDashboard } from "../pages/HRDashboard";
import { AdminDashboard } from "../pages/AdminDashboard";

export const AppRoutes = ({ showToast }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-main)",
          color: "#fff",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login showToast={showToast} />
          </PublicRoute>
        }
      />

      {/* PROTECTED DASHBOARDS */}

      {/* 
        FIXED: Removed "Admin" from allowedRoles. 
        Admin cannot access this page. Only Employee, HOD, and HR can apply for leaves.
        Also added user and showToast props to EmployeeDashboard.
      */}
      <Route
        path="/employee"
        element={
          <RoleBasedRoute allowedRoles={["Employee", "HOD", "HR"]}>
            <EmployeeDashboard user={user} showToast={showToast} />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/hod"
        element={
          <RoleBasedRoute
            element={<HODDashboard user={user} showToast={showToast} />}
            allowedRole="HOD"
          />
        }
      />
      <Route
        path="/hr"
        element={
          <RoleBasedRoute
            element={<HRDashboard user={user} showToast={showToast} />}
            allowedRole="HR"
          />
        }
      />
      <Route
        path="/admin"
        element={
          <RoleBasedRoute
            element={<AdminDashboard user={user} showToast={showToast} />}
            allowedRole="Admin"
          />
        }
      />

      {/* CATCH-ALL REDIRECT */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
