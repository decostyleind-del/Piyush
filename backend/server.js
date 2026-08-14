const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const routes = require("./routes");

const app = express();

// --------------------------------------------------
// CORS
// --------------------------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language"],
  })
);

// --------------------------------------------------
// Body parser
// --------------------------------------------------
app.use(express.json());

// --------------------------------------------------
// Database
// --------------------------------------------------
connectDB();

// --------------------------------------------------
// API routes
// --------------------------------------------------
app.use("/api", routes);

// --------------------------------------------------
// React frontend
// --------------------------------------------------
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

// --------------------------------------------------
// React Router fallback
// --------------------------------------------------
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

// --------------------------------------------------
// Start server
// --------------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
