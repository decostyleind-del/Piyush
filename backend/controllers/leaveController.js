const fs = require("fs");
const path = require("path");
const leaveRepository = require("../repositories/leaveRepository");
const userRepository = require("../repositories/userRepository");
const User = require("../models/User");
const { ABSOLUTE_UPLOAD_PATH } = require("../middleware/upload");

const REVIEWER_ROLES = ["HOD", "HR", "Admin"];

class LeaveController {
  async getLeaves(req, res) {
    try {
      const { userId, role } = req.query;
      let query = {};

      if (role === "Employee") {
        query.employee = userId;
      } else if (role === "HOD") {
        const hod = await userRepository.findById(userId);
        if (!hod) return res.status(404).json({ message: "HOD not found" });

        const employees = await userRepository.findEmployeesByManager(
          hod.employeeCode,
        );
        const employeeIds = employees.map((emp) => emp._id);
        query.employee = { $in: employeeIds };
      } else if (role === "HR") {
        const validUsers = await User.find({
          role: { $in: ["Employee", "HOD"] },
        });
        const validUserIds = validUsers.map((u) => u._id);
        query.employee = { $in: validUserIds };
      }

      let requests = await leaveRepository.find(query);
      res.json(requests);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to fetch leaves", error: err.message });
    }
  }

  async applyLeave(req, res) {
    try {
      const {
        employeeId,
        leaveType,
        startDate,
        endDate,
        startTime, // ADDED
        endTime, // ADDED
        reason,
        discussedWithHOD,
      } = req.body;

      const newLeave = await leaveRepository.create({
        employee: employeeId,
        leaveType,
        startDate,
        endDate,
        startTime, // SAVED
        endTime, // SAVED
        reason,
        discussedWithHOD,
      });
      res
        .status(201)
        .json({ message: "Leave application submitted", leave: newLeave });
    } catch (err) {
      res
        .status(400)
        .json({ message: "Failed to submit leave", error: err.message });
    }
  }

  async handleAction(req, res) {
    try {
      const { id } = req.params;
      const { role, name, action } = req.body;

      const leave = await leaveRepository.findById(id);
      if (!leave)
        return res.status(404).json({ message: "Leave request not found" });

      const approver = await userRepository.findByName(name);
      let formattedRole = role;
      if (role === "HOD" && approver) {
        formattedRole = `HOD - ${approver.department}`;
      }

      let updateData = {};

      if (role === "Admin") {
        updateData = {
          status: action,
          approvedByRole: "Admin",
          approvedByName: name,
          adminOverridden: true,
        };
      } else if (role === "HOD" || role === "HR") {
        if (action === "Approved") {
          updateData = {
            status: "Approved",
            approvedByRole: formattedRole,
            approvedByName: name,
            hodOrHrApprovedAt: new Date(),
          };
        } else {
          updateData = {
            status: "Rejected",
            approvedByRole: formattedRole,
            approvedByName: name,
          };
        }
      } else {
        return res.status(403).json({ message: "Unauthorized action" });
      }

      await leaveRepository.updateById(id, updateData);
      const [populatedLeave] = await leaveRepository.find({ _id: id });
      return res.json({
        message: `Leave request ${action.toLowerCase()} successfully`,
        leave: populatedLeave,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  async requestProof(req, res) {
    try {
      const { id } = req.params;
      const { role, name, remark } = req.body;

      if (!REVIEWER_ROLES.includes(role))
        return res.status(403).json({ message: "Unauthorized action" });
      if (!remark || !remark.trim())
        return res
          .status(400)
          .json({ message: "Please describe what document is required" });

      const leave = await leaveRepository.findById(id);
      if (!leave)
        return res.status(404).json({ message: "Leave request not found" });

      if (leave.proof?.status === "Requested") {
        return res
          .status(409)
          .json({ message: `Someone already requested a document.` });
      }

      const approver = await userRepository.findByName(name);
      let formattedRole = role;
      if (role === "HOD" && approver)
        formattedRole = `HOD - ${approver.department}`;

      const updated = await leaveRepository.updateById(id, {
        proof: {
          status: "Requested",
          remark: remark.trim(),
          requestedByRole: formattedRole,
          requestedByName: name,
          requestedAt: new Date(),
          submittedAt: null,
          files: leave.proof?.files || [],
        },
      });
      res.json({
        message: "Document request sent to employee",
        leave: updated,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  async uploadProofFiles(req, res) {
    try {
      const { id } = req.params;
      const leave = await leaveRepository.findById(id);
      if (!leave)
        return res.status(404).json({ message: "Leave request not found" });
      if (!leave.proof || leave.proof.status !== "Requested")
        return res.status(400).json({ message: "No active request" });
      if (!req.files || req.files.length === 0)
        return res.status(400).json({ message: "No files uploaded" });

      const baseUrl = (
        process.env.BASE_URL || `${req.protocol}://${req.get("host")}`
      ).replace(/\/$/, "");
      const uploadDir = (
        process.env.UPLOAD_DIR || "uploads/leave-proofs"
      ).replace(/^\/|\/$/g, "");

      const newFiles = req.files.map((f) => ({
        originalName: f.originalname,
        fileName: f.filename,
        fileUrl: `${baseUrl}/${uploadDir}/${f.filename}`,
        fileType: f.mimetype,
        fileSize: f.size,
        uploadedAt: new Date(),
      }));
      const updated = await leaveRepository.pushProofFiles(id, newFiles);
      res.json({ message: "Files uploaded", leave: updated });
    } catch (err) {
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  }

  async deleteProofFile(req, res) {
    try {
      const { id, fileId } = req.params;
      const leave = await leaveRepository.findById(id);
      if (!leave || leave.proof?.status !== "Requested")
        return res.status(400).json({ message: "Cannot edit" });

      const file = leave.proof.files.id(fileId);
      if (file)
        fs.unlink(path.join(ABSOLUTE_UPLOAD_PATH, file.fileName), () => {});

      const updated = await leaveRepository.removeProofFile(id, fileId);
      res.json({ message: "File removed", leave: updated });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  async submitProof(req, res) {
    try {
      const { id } = req.params;
      const leave = await leaveRepository.findById(id);
      if (!leave || leave.proof?.status !== "Requested")
        return res.status(400).json({ message: "No pending request" });
      if (!leave.proof.files || leave.proof.files.length === 0)
        return res.status(400).json({ message: "Attach document first" });

      const updated = await leaveRepository.updateById(id, {
        "proof.status": "Submitted",
        "proof.submittedAt": new Date(),
      });
      res.json({ message: "Documents sent", leave: updated });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}
module.exports = new LeaveController();
