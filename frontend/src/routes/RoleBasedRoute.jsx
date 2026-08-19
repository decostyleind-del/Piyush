import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RoleBasedRoute = ({
  children,
  element,
  allowedRole,
  allowedRoles,
}) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // 1. If an array of roles is provided (e.g., for the Employee Dashboard)
  if (allowedRoles && Array.isArray(allowedRoles)) {
    if (!allowedRoles.includes(user.role)) {
      // If their role isn't in the list, send them to their primary dashboard
      return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
    }
  }
  // 2. If a single role is provided (e.g., for HOD, HR, Admin Dashboards)
  else if (allowedRole) {
    if (user.role !== allowedRole) {
      return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
    }
  }

  // 3. Render the content (supports both wrapper <Component>...<Component/> and element prop)
  return children || element;
};
