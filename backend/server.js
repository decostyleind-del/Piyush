const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const connectDB = require("./config/db");
const routes = require("./routes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language"],
  }),
);

app.use(express.json());

connectDB();

app.use("/api", routes);

// ==========================================================
// Serve uploaded proof documents (medical certs, marriage cards, etc.)
// Folder + public path both come from .env so this is safe to
// deploy on Hostinger without touching code:
//   UPLOAD_DIR=uploads/leave-proofs
// ==========================================================
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads/leave-proofs";
app.use(
  `/${UPLOAD_DIR.replace(/^\/|\/$/g, "")}`,
  express.static(path.join(__dirname, UPLOAD_DIR)),
);

// Serve React frontend
const frontendPath = path.join(__dirname, "public");

app.use(express.static(frontendPath));

// React Router fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

// ==========================================================
// Global error handler — MUST be last. Without this, a bad
// upload (wrong file type, too large, etc.) throws an
// unhandled error and can crash the whole Node process on
// a live host instead of returning a clean JSON response.
// ==========================================================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // e.g. file too large, too many files
    return res.status(400).json({ message: err.message });
  }
  if (err && err.message) {
    // e.g. our custom "Only JPG, PNG, WEBP, or PDF files are allowed"
    return res.status(400).json({ message: err.message });
  }
  console.error("Unhandled server error:", err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running smoothly on port ${PORT}`);
});
