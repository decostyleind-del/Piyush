const LeaveRequest = require("../models/LeaveRequest");

class LeaveRepository {
  async create(leaveData) {
    const leave = new LeaveRequest(leaveData);
    return await leave.save();
  }

  // This is the .find() method your controller is trying to use!
  async find(query = {}) {
    return await LeaveRequest.find(query)
      .populate("employee", "name employeeCode department")
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await LeaveRequest.findById(id);
  }

  async updateById(id, updateData) {
    return await LeaveRequest.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("employee", "name employeeCode department");
  }

  // ==========================================================
  // PROOF / DOCUMENT WORKFLOW HELPERS
  // ==========================================================

  // Add newly uploaded files to the proof.files array
  async pushProofFiles(id, files) {
    return await LeaveRequest.findByIdAndUpdate(
      id,
      { $push: { "proof.files": { $each: files } } },
      { new: true },
    ).populate("employee", "name employeeCode department");
  }

  // Remove a single file (employee deleting before final send)
  async removeProofFile(id, fileId) {
    return await LeaveRequest.findByIdAndUpdate(
      id,
      { $pull: { "proof.files": { _id: fileId } } },
      { new: true },
    ).populate("employee", "name employeeCode department");
  }
}

// THIS BOTTOM LINE IS CRUCIAL: You must use "new" so the methods are accessible
module.exports = new LeaveRepository();
