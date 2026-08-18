const fs = require("fs");
const path = require("path");
const leaveRepository = require("../repositories/leaveRepository");
const userRepository = require("../repositories/userRepository");
const { ABSOLUTE_UPLOAD_PATH } = require("../middleware/upload");

const REVIEWER_ROLES = ["HOD", "HR", "Admin"];

class LeaveController {
  async getLeaves(req, res) {
    try {
      const { userId, role } = req.query;
      let query = {};

      // 1. Department Isolation Logic
      if (role === "Employee") {
        query.employee = userId;
      } else if (role === "HOD") {
        // Fetch the HOD user to get their employeeCode
        const hod = await userRepository.findById(userId);
        if (!hod) return res.status(404).json({ message: "HOD not found" });

        // Find all employees reporting directly to this HOD
        const employees = await userRepository.findEmployeesByManager(
          hod.employeeCode,
        );
        const employeeIds = employees.map((emp) => emp._id);

        // Restrict query to only those employees
        query.employee = { $in: employeeIds };
      }
      // HR and Admin queries remain empty so they see everything

      let requests = await leaveRepository.find(query);

      // The 1-Hour Admin Window Logic has been completely removed.
      // The employee will now immediately see the actual DB status.

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
        reason,
        discussedWithHOD,
      } = req.body;
      const newLeave = await leaveRepository.create({
        employee: employeeId,
        leaveType,
        startDate,
        endDate,
        reason,
        discussedWithHOD,
      });
      res.status(201).json({
        message: "Leave application submitted successfully",
        leave: newLeave,
      });
    } catch (err) {
      res
        .status(400)
        .json({ message: "Failed to submit leave", error: err.message });
    }
  }

  async handleAction(req, res) {
    try {
      const { id } = req.params;
      const { role, name, action } = req.body; // action: 'Approved' or 'Rejected'

      const leave = await leaveRepository.findById(id);
      if (!leave)
        return res.status(404).json({ message: "Leave request not found" });

      // Fetch the approver to dynamically format their role (e.g., 'HOD - IT')
      const approver = await userRepository.findByName(name);
      let formattedRole = role;

      if (role === "HOD" && approver) {
        formattedRole = `HOD - ${approver.department}`;
      }

      let updateData = {};

      // Master Override (Admin)
      if (role === "Admin") {
        updateData = {
          status: action,
          approvedByRole: "Admin",
          approvedByName: name,
          adminOverridden: true,
        };
      }
      // Standard Approvers (HOD / HR)
      else if (role === "HOD" || role === "HR") {
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

      // Re-fetch with employee populated, since find() already does this correctly
      const [populatedLeave] = await leaveRepository.find({ _id: id });

      return res.json({
        message: `Leave request ${action.toLowerCase()} successfully`,
        leave: populatedLeave,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // ==========================================================
  // PROOF / DOCUMENT WORKFLOW
  // ==========================================================

  // HOD / HR / Admin ask the employee to attach a supporting document.
  // Only one active ("Requested") ask is allowed at a time.
  async requestProof(req, res) {
    try {
      const { id } = req.params;
      const { role, name, remark } = req.body;

      if (!REVIEWER_ROLES.includes(role)) {
        return res.status(403).json({ message: "Unauthorized action" });
      }
      if (!remark || !remark.trim()) {
        return res
          .status(400)
          .json({ message: "Please describe what document is required" });
      }

      const leave = await leaveRepository.findById(id);
      if (!leave)
        return res.status(404).json({ message: "Leave request not found" });

      // Lock: if someone already asked and is still waiting, nobody else can ask again
      if (leave.proof?.status === "Requested") {
        return res.status(409).json({
          message: `${leave.proof.requestedByName || "Someone"} already requested a document for this leave. Please wait for it to be submitted.`,
        });
      }

      const approver = await userRepository.findByName(name);
      let formattedRole = role;
      if (role === "HOD" && approver) {
        formattedRole = `HOD - ${approver.department}`;
      }

      const updated = await leaveRepository.updateById(id, {
        proof: {
          status: "Requested",
          remark: remark.trim(),
          requestedByRole: formattedRole,
          requestedByName: name,
          requestedAt: new Date(),
          submittedAt: null,
          // keep any previously submitted files visible for reference
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

  // Employee uploads one or more proof files while a request is active
  async uploadProofFiles(req, res) {
    try {
      const { id } = req.params;
      const leave = await leaveRepository.findById(id);
      if (!leave)
        return res.status(404).json({ message: "Leave request not found" });

      if (!leave.proof || leave.proof.status !== "Requested") {
        return res
          .status(400)
          .json({
            message: "There is no active document request for this leave",
          });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files were uploaded" });
      }

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

  // Employee removes a file they added, before final send
  async deleteProofFile(req, res) {
    try {
      const { id, fileId } = req.params;
      const leave = await leaveRepository.findById(id);
      if (!leave)
        return res.status(404).json({ message: "Leave request not found" });

      if (!leave.proof || leave.proof.status !== "Requested") {
        return res
          .status(400)
          .json({ message: "Documents can no longer be edited" });
      }

      const file = leave.proof.files.id(fileId);
      if (file) {
        const filePath = path.join(ABSOLUTE_UPLOAD_PATH, file.fileName);
        fs.unlink(filePath, () => {
          // ignore errors here — if the file is already gone on disk,
          // we still want the DB record removed below
        });
      }

      const updated = await leaveRepository.removeProofFile(id, fileId);
      res.json({ message: "File removed", leave: updated });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Employee finalizes — locks the files and notifies the reviewer
  async submitProof(req, res) {
    try {
      const { id } = req.params;
      const leave = await leaveRepository.findById(id);
      if (!leave)
        return res.status(404).json({ message: "Leave request not found" });

      if (!leave.proof || leave.proof.status !== "Requested") {
        return res
          .status(400)
          .json({ message: "There is no pending document request" });
      }
      if (!leave.proof.files || leave.proof.files.length === 0) {
        return res
          .status(400)
          .json({
            message: "Please attach at least one document before sending",
          });
      }

      const updated = await leaveRepository.updateById(id, {
        "proof.status": "Submitted",
        "proof.submittedAt": new Date(),
      });

      res.json({ message: "Documents sent for review", leave: updated });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}

module.exports = new LeaveController();
