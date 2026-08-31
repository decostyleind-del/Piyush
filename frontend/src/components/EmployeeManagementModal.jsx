import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import {
  Users,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Search,
  Save,
} from "lucide-react";

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
  sage: "#7ea08d",
  sageDim: "rgba(126,160,141,0.14)",
  brick: "#c06a56",
  brickDim: "rgba(192,106,86,0.14)",
};

const EMPTY_FORM = {
  name: "",
  email: "",
  employeeCode: "",
  dob: "",
  department: "",
  empRole: "Employee",
  reportingManager: "",
  password: "",
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem 0.9rem",
  background: T.panelRaised,
  border: `1px solid ${T.hairlineStrong}`,
  borderRadius: "8px",
  color: T.text,
  fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
  fontSize: "0.88rem",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: T.textDim,
  marginBottom: "0.4rem",
};

export const EmployeeManagement = ({ user, showToast, isHindi }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/employees?role=${user.role}`);
      setEmployees(data);
    } catch (err) {
      showToast(
        isHindi ? "कर्मचारी सूची लोड नहीं हुई" : "Failed to load employees",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (emp) => {
    setEditingId(emp._id);
    setForm({
      name: emp.name || "",
      email: emp.email || "",
      employeeCode: emp.employeeCode || "",
      dob: emp.dob ? emp.dob.slice(0, 10) : "",
      department: emp.department || "",
      empRole: emp.role || "Employee",
      reportingManager: emp.reportingManager || "",
      password: "",
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.employeeCode || !form.dob || !form.department) {
      showToast(
        isHindi
          ? "कृपया सभी आवश्यक फ़ील्ड भरें"
          : "Please fill all required fields",
        "error",
      );
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await API.put(`/employees/${editingId}`, {
          role: user.role,
          name: form.name,
          email: form.email,
          employeeCode: form.employeeCode,
          dob: form.dob,
          department: form.department,
          role_: form.empRole,
          reportingManager: form.reportingManager,
          password: form.password || undefined,
        });
        showToast(
          isHindi ? "कर्मचारी अपडेट किया गया" : "Employee updated",
          "success",
        );
      } else {
        await API.post("/employees", {
          role: user.role,
          name: form.name,
          email: form.email,
          employeeCode: form.employeeCode,
          dob: form.dob,
          department: form.department,
          empRole: form.empRole,
          reportingManager: form.reportingManager,
          password: form.password || undefined,
        });
        showToast(isHindi ? "कर्मचारी जोड़ा गया" : "Employee added", "success");
      }
      setFormOpen(false);
      fetchEmployees();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          (isHindi ? "सहेजने में विफल" : "Failed to save employee"),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/employees/${deleteTarget._id}`, {
        data: { role: user.role },
      });
      showToast(isHindi ? "कर्मचारी हटाया गया" : "Employee deleted", "success");
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          (isHindi ? "हटाने में विफल" : "Failed to delete employee"),
        "error",
      );
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      [e.name, e.employeeCode, e.department, e.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [employees, searchTerm]);

  return (
    <div
      style={{
        background: T.panel,
        borderRadius: "14px",
        border: `1px solid ${T.hairline}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "1.5rem 1.75rem",
          borderBottom: `1px solid ${T.hairline}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Users size={20} color={T.orange} />
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: T.text }}>
            {isHindi ? "कर्मचारी सूची" : "Employee Directory"}
          </h3>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              color={T.textDim}
              style={{
                position: "absolute",
                left: "0.85rem",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isHindi ? "खोजें..." : "Search…"}
              style={{
                ...inputStyle,
                padding: "0.6rem 0.9rem 0.6rem 2.4rem",
                width: "220px",
              }}
            />
          </div>
          <button
            onClick={openAdd}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1.1rem",
              borderRadius: "8px",
              border: "none",
              background: `linear-gradient(to right, ${T.orange}, ${T.orangeDark})`,
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <PlusCircle size={16} />
            {isHindi ? "कर्मचारी जोड़ें" : "Add Employee"}
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.88rem",
            minWidth: "900px",
          }}
        >
          <thead>
            <tr
              style={{
                background: T.panelRaised,
                color: T.textDim,
                textTransform: "uppercase",
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                borderBottom: `1px solid ${T.hairlineStrong}`,
              }}
            >
              <th style={{ padding: "1rem 1.5rem", textAlign: "left" }}>
                {isHindi ? "नाम" : "Name"}
              </th>
              <th style={{ padding: "1rem", textAlign: "left" }}>
                {isHindi ? "कोड" : "Code"}
              </th>
              <th style={{ padding: "1rem", textAlign: "left" }}>
                {isHindi ? "विभाग" : "Department"}
              </th>
              <th style={{ padding: "1rem", textAlign: "left" }}>
                {isHindi ? "भूमिका" : "Role"}
              </th>
              <th style={{ padding: "1rem", textAlign: "left" }}>
                {isHindi ? "प्रबंधक" : "Reports To"}
              </th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                {isHindi ? "कार्रवाई" : "Action"}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: T.textDim,
                  }}
                >
                  {isHindi ? "लोड हो रहा है..." : "Loading…"}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: T.textDim,
                  }}
                >
                  {isHindi ? "कोई कर्मचारी नहीं मिला" : "No employees found"}
                </td>
              </tr>
            ) : (
              filtered.map((emp) => (
                <tr
                  key={emp._id}
                  style={{ borderBottom: `1px solid ${T.hairline}` }}
                >
                  <td
                    style={{
                      padding: "1rem 1.5rem",
                      fontWeight: 700,
                      color: T.text,
                    }}
                  >
                    {emp.name}
                  </td>
                  <td style={{ padding: "1rem", color: T.textDim }}>
                    {emp.employeeCode}
                  </td>
                  <td style={{ padding: "1rem", color: "#c9c5b6" }}>
                    {emp.department}
                  </td>
                  <td style={{ padding: "1rem", color: T.textDim }}>
                    {emp.role}
                  </td>
                  <td style={{ padding: "1rem", color: T.textDim }}>
                    {emp.reportingManager || "—"}
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => openEdit(emp)}
                        style={{
                          padding: "0.45rem 0.7rem",
                          borderRadius: "6px",
                          background: T.orangeDim,
                          color: T.orange,
                          border: `1px solid ${T.orange}55`,
                          cursor: "pointer",
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        style={{
                          padding: "0.45rem 0.7rem",
                          borderRadius: "6px",
                          background: T.brickDim,
                          color: T.brick,
                          border: `1px solid ${T.brick}55`,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit form modal */}
      {formOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(6,9,17,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.panel,
              border: `1px solid ${T.hairlineStrong}`,
              borderRadius: "10px",
              padding: "2rem",
              width: "100%",
              maxWidth: "520px",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => !saving && setFormOpen(false)}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
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
                fontSize: "1.2rem",
                fontWeight: 700,
                color: T.text,
                marginBottom: "1.25rem",
              }}
            >
              {editingId
                ? isHindi
                  ? "कर्मचारी संपादित करें"
                  : "Edit Employee"
                : isHindi
                  ? "नया कर्मचारी जोड़ें"
                  : "Add New Employee"}
            </h3>

            {/* DUMMY INPUTS TO ABSORB BROWSER AUTO-FILL */}
            <input type="text" style={{ display: "none" }} aria-hidden="true" />
            <input
              type="password"
              style={{ display: "none" }}
              aria-hidden="true"
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={labelStyle}>
                  {isHindi ? "पूरा नाम" : "Full Name"}
                </label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div>
                <label style={labelStyle}>
                  {isHindi ? "कर्मचारी कोड" : "Employee Code"}
                </label>
                <input
                  style={inputStyle}
                  value={form.employeeCode}
                  onChange={(e) =>
                    setForm({ ...form, employeeCode: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>
              <div>
                <label style={labelStyle}>
                  {isHindi ? "जन्म तिथि" : "Date of Birth"}
                </label>
                <input
                  type="date"
                  style={inputStyle}
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  {isHindi ? "विभाग" : "Department"}
                </label>
                <input
                  style={inputStyle}
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>
              <div>
                <label style={labelStyle}>{isHindi ? "भूमिका" : "Role"}</label>
                <select
                  style={inputStyle}
                  value={form.empRole}
                  onChange={(e) =>
                    setForm({ ...form, empRole: e.target.value })
                  }
                >
                  <option value="Employee">Employee</option>
                  <option value="HOD">HOD</option>
                  <option value="HR">HR</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>
                  {isHindi ? "रिपोर्टिंग मैनेजर कोड" : "Reporting Manager Code"}
                </label>
                <input
                  style={inputStyle}
                  value={form.reportingManager}
                  onChange={(e) =>
                    setForm({ ...form, reportingManager: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>
              <div>
                <label style={labelStyle}>
                  {isHindi ? "ईमेल (वैकल्पिक)" : "Email (optional)"}
                </label>
                <input
                  style={inputStyle}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="nope"
                  name="random_email_field"
                />
              </div>
              <div>
                <label style={labelStyle}>
                  {isHindi
                    ? "पासवर्ड (HOD/HR/Admin के लिए)"
                    : "Password (for HOD/HR/Admin)"}
                </label>
                <input
                  type="password"
                  style={inputStyle}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  autoComplete="new-password"
                  name="random_password_field"
                  placeholder={
                    editingId
                      ? isHindi
                        ? "अपरिवर्तित छोड़ें"
                        : "leave blank to keep"
                      : ""
                  }
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.85rem",
                borderRadius: "8px",
                border: "none",
                background: `linear-gradient(to right, ${T.orange}, ${T.orangeDark})`,
                color: "#fff",
                fontWeight: 700,
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Save size={16} />
              {saving
                ? isHindi
                  ? "सहेजा जा रहा है..."
                  : "Saving…"
                : isHindi
                  ? "सहेजें"
                  : "Save Employee"}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(6,9,17,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.panel,
              border: `1px solid ${T.hairlineStrong}`,
              borderRadius: "10px",
              padding: "2rem",
              width: "100%",
              maxWidth: "420px",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: T.text,
                marginBottom: "0.75rem",
              }}
            >
              {isHindi ? "कर्मचारी हटाएं?" : "Delete this employee?"}
            </h3>
            <p
              style={{
                color: T.textDim,
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              {deleteTarget.name} ({deleteTarget.employeeCode}) —{" "}
              {isHindi
                ? "यह क्रिया पूर्ववत नहीं की जा सकती।"
                : "This action cannot be undone."}
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: "0.6rem 1.1rem",
                  borderRadius: "7px",
                  border: `1px solid ${T.hairlineStrong}`,
                  background: "transparent",
                  color: T.textDim,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: "0.6rem 1.1rem",
                  borderRadius: "7px",
                  border: "none",
                  background: T.brick,
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {isHindi ? "हटाएं" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
