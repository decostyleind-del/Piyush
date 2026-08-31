const User = require("../models/User");

class UserRepository {
  async findByEmployeeCode(employeeCode) {
    // Removed strict role filter so we can look up managers too
    return await User.findOne({ employeeCode });
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findById(id) {
    return await User.findById(id).select("-password");
  }

  // ADDED: Fetch user by name to get their department for formatting
  async findByName(name) {
    return await User.findOne({ name });
  }

  // ADDED: Fetch all employees that report to a specific manager
  async findEmployeesByManager(managerCode) {
    return await User.find({ reportingManager: managerCode });
  }

  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async deleteAll() {
    return await User.deleteMany({});
  }

  async insertMany(users) {
    return await User.insertMany(users);
  }

  // ===== Employee Management (HR/Admin) — NEW =====

  async findAllEmployees(role) {
    // HR sees Employee + HOD, Admin sees everyone
    const filter = role === "HR" ? { role: { $in: ["Employee", "HOD"] } } : {};
    return await User.find(filter).select("-password").sort({ createdAt: -1 });
  }

  async createEmployee(payload) {
    return await User.create(payload);
  }

  async updateEmployeeById(id, payload) {
    return await User.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).select("-password");
  }

  async deleteEmployeeById(id) {
    return await User.findByIdAndDelete(id);
  }

  async findByEmployeeCodeExcludingId(employeeCode, excludeId) {
    return await User.findOne({
      employeeCode,
      _id: { $ne: excludeId },
    });
  }
}

module.exports = new UserRepository();
