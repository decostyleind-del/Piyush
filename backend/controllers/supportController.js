// 1. MUST IMPORT THE MODEL AT THE TOP!
const SupportTicket = require("../models/SupportTicket");

// Employee submits a ticket from the Login page
exports.createTicket = async (req, res) => {
  try {
    const { email, message } = req.body;

    // Safety check: Log what the backend is actually receiving
    console.log("📥 Received Ticket Data:", { email, message });

    // Safety check: If empty, tell the frontend immediately
    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Email and message are required! (Backend didn't receive them)",
      });
    }

    // Create the ticket in the database
    const ticket = await SupportTicket.create({ email, message });
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    // Log the actual crash reason to your VS Code Terminal!
    console.error("💥 MONGO DB ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create support ticket",
      error: error.message,
    });
  }
};

// HR fetches tickets to view on their Dashboard
exports.getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Fetch tickets error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch tickets" });
  }
};

// HR marks a ticket as resolved
exports.resolveTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status: "Resolved" },
      { new: true },
    );
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Resolve ticket error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to resolve ticket" });
  }
};
