const mongoose = require("mongoose");

const proofFileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

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

    // NEW FIELDS FOR TIME (OD, WFH, LIH, Late, Early)
    startTime: { type: String, default: null },
    endTime: { type: String, default: null },

    reason: { type: String, required: true },
    discussedWithHOD: { type: Boolean, default: false },

    status: { type: String, default: "Pending" },

    approvedByRole: { type: String, default: null },
    approvedByName: { type: String, default: null },
    decisionNote: { type: String, default: "" },

    hodOrHrApprovedAt: { type: Date, default: null },
    adminOverridden: { type: Boolean, default: false },

    proof: {
      status: {
        type: String,
        enum: ["None", "Requested", "Submitted"],
        default: "None",
      },
      remark: { type: String, default: "" },
      requestedByRole: { type: String, default: null },
      requestedByName: { type: String, default: null },
      requestedAt: { type: Date, default: null },
      submittedAt: { type: Date, default: null },
      files: { type: [proofFileSchema], default: [] },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
