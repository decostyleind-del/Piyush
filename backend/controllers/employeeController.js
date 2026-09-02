const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");

const MANAGE_ROLES = ["HR", "Admin"];

class EmployeeController {
  // GET /employees?role=HR|Admin
  async list(req, res) {
    try {
      const { role } = req.query;
      if (!MANAGE_ROLES.includes(role)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const employees = await userRepository.findAllEmployees(role);
      res.json(employees);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to fetch employees", error: err.message });
    }
  }

  // POST /employees
  async create(req, res) {
    try {
      const { role } = req.body; // acting role (who's creating), e.g. "HR"
      if (!MANAGE_ROLES.includes(role)) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const {
        name,
        email,
        employeeCode,
        dob,
        department,
        reportingManager,
        empRole, // the new user's role: Employee / HOD
        password, // only needed if empRole is HOD/HR/Admin (management login)
      } = req.body;

      if (!name || !employeeCode || !dob || !department || !empRole) {
        return res.status(400).json({
          message:
            "name, employeeCode, dob, department and empRole are required",
        });
      }

      const existing = await userRepository.findByEmployeeCode(employeeCode);
      if (existing) {
        return res
          .status(409)
          .json({ message: "Employee code already exists" });
      }

      const payload = {
        name,
        employeeCode,
        dob,
        department,
        role: empRole,
        reportingManager: reportingManager || null,
      };

      if (email) payload.email = email;
      if (password) payload.password = await bcrypt.hash(password, 10);

      const employee = await userRepository.createEmployee(payload);
      res.status(201).json({ message: "Employee added", employee });
    } catch (err) {
      res
        .status(400)
        .json({ message: "Failed to add employee", error: err.message });
    }
  }

  // PUT /employees/:id
  async update(req, res) {
    try {
      const { id } = req.params;

      const { role, employeeCode, role_, empRole, ...rest } = req.body;

      // STRICT HR CHECK
      if (role !== "HR") {
        return res.status(403).json({
          message:
            "Unauthorized: Only HR is permitted to update employee data.",
        });
      }

      // Map frontend role keys back to db role key
      const targetRole = role_ || empRole;
      if (targetRole) {
        rest.role = targetRole;
      }

      // PREVENT EMPTY STRING VALIDATION ERRORS
      if (!rest.email || rest.email.trim() === "") {
        delete rest.email;
      }

      if (employeeCode) {
        const clash = await userRepository.findByEmployeeCodeExcludingId(
          employeeCode,
          id,
        );
        if (clash) {
          return res
            .status(409)
            .json({ message: "Employee code already in use" });
        }
        rest.employeeCode = employeeCode;
      }

      if (rest.password) {
        rest.password = await bcrypt.hash(rest.password, 10);
      } else {
        delete rest.password;
      }

      const updated = await userRepository.updateEmployeeById(id, rest);
      if (!updated) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json({ message: "Employee updated", employee: updated });
    } catch (err) {
      res
        .status(400)
        .json({ message: "Failed to update employee", error: err.message });
    }
  }
  // DELETE /employees/:id
  async remove(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!MANAGE_ROLES.includes(role)) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const deleted = await userRepository.deleteEmployeeById(id);
      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json({ message: "Employee deleted" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to delete employee", error: err.message });
    }
  }
}

module.exports = new EmployeeController();
