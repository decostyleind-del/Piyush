const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["Admin", "HR", "HOD", "Employee"],
      required: true,
    },
    department: { type: String, required: true },
    employeeCode: { type: String, unique: true, sparse: true },
    dob: { type: String },
    // ADD THIS FIELD: Links an employee to their specific manager
    reportingManager: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
