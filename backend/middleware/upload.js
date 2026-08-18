const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==========================================================
// Everything below is driven by .env so this works unchanged
// whether you're on localhost or on Hostinger.
//   UPLOAD_DIR       e.g. uploads/leave-proofs   (relative to backend/)
//   MAX_FILE_SIZE_MB e.g. 5
// ==========================================================
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads/leave-proofs";
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 5;

// Resolved to an absolute path so it never breaks depending on
// which directory the Node process was started from.
const ABSOLUTE_UPLOAD_PATH = path.join(__dirname, "..", UPLOAD_DIR);

// Create the folder on boot if it doesn't exist yet — critical for a
// fresh Hostinger deploy, otherwise the very first upload would crash.
if (!fs.existsSync(ABSOLUTE_UPLOAD_PATH)) {
  fs.mkdirSync(ABSOLUTE_UPLOAD_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ABSOLUTE_UPLOAD_PATH),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBase}-${unique}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP, or PDF files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 5,
  },
});

module.exports = upload;
module.exports.ABSOLUTE_UPLOAD_PATH = ABSOLUTE_UPLOAD_PATH;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
