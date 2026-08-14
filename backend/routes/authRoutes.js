const express = require("express");
const router = express.Router();

// Import your auth controller functions
const { login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/login", login);

// THIS is the line fixing your 404 error
router.get("/me", protect, getMe);

module.exports = router;
