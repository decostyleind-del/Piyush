const express = require("express");
const router = express.Router();
const {
  createTicket,
  getTickets,
  resolveTicket,
} = require("../controllers/supportController");
const { protect } = require("../middleware/auth"); // Adjust path if necessary

// ==========================================
// 1. PUBLIC ROUTE (Accessible from Login Page)
// ==========================================
router.post("/", createTicket);

// ==========================================
// 2. PROTECTED ROUTES (Only logged-in HR/Admin)
// ==========================================
router.use(protect);

router.get("/", getTickets);
router.put("/:id/resolve", resolveTicket);

module.exports = router;
