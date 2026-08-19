const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AuthController {
  // 1. Generate Token Helper Function
  generateToken(id) {
    const secret = process.env.JWT_SECRET || "fallback_super_secret_key";
    return jwt.sign({ id }, secret, { expiresIn: "30d" });
  }

  async login(req, res) {
    try {
      const { email, password, employeeCode, dob } = req.body;

      // ===============================================
      // Employee Portal Login (Code + DOB)
      // Anyone (HOD, HR, Admin, Employee) can log in here to apply for their own leave
      // ===============================================
      if (employeeCode && dob) {
        const user = await userRepository.findByEmployeeCode(employeeCode);

        if (!user) {
          return res
            .status(401)
            .json({ message: "Invalid Employee Code or Date of Birth" });
        }

        const formattedDbDob = new Date(user.dob).toISOString().split("T")[0];

        if (formattedDbDob !== dob) {
          return res
            .status(401)
            .json({ message: "Invalid Employee Code or Date of Birth" });
        }

        const token = this.generateToken(user._id);
        return res.json({ message: "Login successful", user, token });
      }

      // ===============================================
      // Management Portal Login (Email + Password)
      // ONLY HOD, HR, and Admin can log in here
      // ===============================================
      if (email && password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // STRICT BLOCK: Prevent standard employees from using the Management Portal
        if (user.role === "Employee") {
          return res.status(403).json({
            message:
              "Access Denied. Employees must log in via the Employee Portal.",
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = this.generateToken(user._id);
        return res.json({ message: "Login successful", user, token });
      }

      return res
        .status(400)
        .json({ message: "Please provide valid login credentials" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // 2. getMe method
  async getMe(req, res) {
    try {
      const user = await userRepository.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}

const authController = new AuthController();
authController.login = authController.login.bind(authController);
authController.getMe = authController.getMe.bind(authController);

module.exports = authController;
