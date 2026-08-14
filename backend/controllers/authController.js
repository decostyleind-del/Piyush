const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Make sure to require JWT!

class AuthController {
  // 1. Generate Token Helper Function
  generateToken(id) {
    // Falls back to a default secret if you haven't set JWT_SECRET in your .env yet
    const secret = process.env.JWT_SECRET || "fallback_super_secret_key";
    return jwt.sign({ id }, secret, { expiresIn: "30d" });
  }

  async login(req, res) {
    try {
      const { email, password, employeeCode, dob } = req.body;

      // Employee Login via Code + DOB
      if (employeeCode && dob) {
        const user = await userRepository.findByEmployeeCode(employeeCode);

        if (!user) {
          return res
            .status(401)
            .json({ message: "Invalid Employee Code or Date of Birth" });
        }

        // Convert DB date to YYYY-MM-DD for safe comparison
        const formattedDbDob = new Date(user.dob).toISOString().split("T")[0];

        if (formattedDbDob !== dob) {
          return res
            .status(401)
            .json({ message: "Invalid Employee Code or Date of Birth" });
        }

        // Generate Token and attach it to response
        const token = this.generateToken(user._id);
        return res.json({ message: "Login successful", user, token });
      }

      // HOD, HR, Admin Login via Email + Password
      if (email && password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate Token and attach it to response
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

  // 2. ADD THIS NEW METHOD FOR getMe
  async getMe(req, res) {
    try {
      // req.user should be attached by your 'protect' middleware
      // We look up the user by that ID
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

// Ensure the context of 'this' is preserved for the generateToken method
const authController = new AuthController();
authController.login = authController.login.bind(authController);
authController.getMe = authController.getMe.bind(authController);

module.exports = authController;
