// const mongoose = require("mongoose");

// const leaveRequestSchema = new mongoose.Schema(
//   {
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     leaveType: { type: String, required: true },
//     startDate: { type: Date, required: true },
//     endDate: { type: Date, required: true },
//     reason: { type: String, required: true },
//     discussedWithHOD: { type: Boolean, required: true },

//     // Status: 'Pending', 'Approved', 'Rejected'
//     status: { type: String, default: "Pending" },

//     // Tracking Approver info
//     approvedByRole: { type: String, default: null }, // 'HOD' or 'HR' or 'Admin'
//     approvedByName: { type: String, default: null },
//     decisionNote: { type: String, default: "" },

//     // Admin 1-hour override window tracking
//     hodOrHrApprovedAt: { type: Date, default: null },
//     adminOverridden: { type: Boolean, default: false },
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);

const mongoose = require("mongoose");

// A single uploaded proof file (medical certificate, marriage card, etc.)
const proofFileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true }, // name on disk
    fileUrl: { type: String, required: true }, // full public URL, built from BASE_URL env
    fileType: { type: String, required: true }, // mimetype
    fileSize: { type: Number, required: true }, // bytes
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

    // ==========================================================
    // PROOF / SUPPORTING DOCUMENT WORKFLOW
    // status: 'None' -> nobody asked for proof yet
    //         'Requested' -> a reviewer asked, waiting on employee
    //         'Submitted' -> employee sent documents, awaiting review
    // Only one reviewer's request can be "active" (Requested) at a time.
    // ==========================================================
    proof: {
      status: {
        type: String,
        enum: ["None", "Requested", "Submitted"],
        default: "None",
      },
      remark: { type: String, default: "" }, // what the reviewer asked for
      requestedByRole: { type: String, default: null }, // 'HR' / 'Admin' / 'HOD - IT'
      requestedByName: { type: String, default: null },
      requestedAt: { type: Date, default: null },
      submittedAt: { type: Date, default: null },
      files: { type: [proofFileSchema], default: [] },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
