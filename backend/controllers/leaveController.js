const leaveRepository = require("../repositories/leaveRepository");
const userRepository = require("../repositories/userRepository");

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

      const updatedLeave = await leaveRepository.updateById(id, updateData);

      return res.json({
        message: `Leave request ${action.toLowerCase()} successfully`,
        leave: updatedLeave,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}

module.exports = new LeaveController();
