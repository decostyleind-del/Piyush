const express = require("express");
const router = express.Router();

// Import individual route files (Names must match your files exactly!)
const authRoutes = require("./authRoutes");
const leaveRoutes = require("./leaveRoutes");
const userRoutes = require("./userRoutes");
const supportRoutes = require("./supportRoutes");

// Mount the routes to specific base paths
router.use("/auth", authRoutes);
router.use("/leaves", leaveRoutes);
router.use("/users", userRoutes);
router.use("/support-tickets", supportRoutes);

module.exports = router;
