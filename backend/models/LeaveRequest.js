const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    discussedWithHOD: { type: Boolean, required: true },

    // Status: 'Pending', 'Approved', 'Rejected'
    status: { type: String, default: "Pending" },

    // Tracking Approver info
    approvedByRole: { type: String, default: null }, // 'HOD' or 'HR' or 'Admin'
    approvedByName: { type: String, default: null },
    decisionNote: { type: String, default: "" },

    // Admin 1-hour override window tracking
    hodOrHrApprovedAt: { type: Date, default: null },
    adminOverridden: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
