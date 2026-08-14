const express = require("express");
const router = express.Router();

// 1. Import the entire controller instance
const leaveController = require("../controllers/leaveController");

// 2. Import your authentication middleware
const { protect } = require("../middleware/auth");

// 3. Apply protection to all routes below this line
router.use(protect);

// 4. Define the endpoints using the controller instance
router
  .route("/")
  .get(leaveController.getLeaves)
  .post(leaveController.applyLeave);

// 5. Use handleAction for the status updates
router.route("/:id/status").put(leaveController.handleAction);

module.exports = router;
