const express = require("express");
const router = express.Router();

// 1. Import the entire controller instance
const leaveController = require("../controllers/leaveController");

// 2. Import your authentication middleware
const { protect } = require("../middleware/auth");

// 3. Import the file upload middleware (proof documents)
const upload = require("../middleware/upload");

// 4. Apply protection to all routes below this line
router.use(protect);

// 5. Define the endpoints using the controller instance
router
  .route("/")
  .get(leaveController.getLeaves)
  .post(leaveController.applyLeave);

// 6. Approve / Reject
router.route("/:id/status").put(leaveController.handleAction);

// 7. Proof / document workflow
//    HOD/HR/Admin ask for a document
router.route("/:id/request-proof").put(leaveController.requestProof);

//    Employee uploads document(s) — up to 5 files per request
router
  .route("/:id/proof-files")
  .post(upload.array("files", 5), leaveController.uploadProofFiles);

//    Employee removes a document before final send
router
  .route("/:id/proof-files/:fileId")
  .delete(leaveController.deleteProofFile);

//    Employee finalizes and sends documents for review
router.route("/:id/proof-submit").put(leaveController.submitProof);

module.exports = router;
