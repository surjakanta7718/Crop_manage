const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
    assignInspection,
    getAllInspections,
    getInspectionDetails,
    getMyInspections,
    completeInspection
} = require("../controllers/inspectionController");

// Assign inspection (admin)
router.post("/assign", auth, roleCheck(["admin"]), assignInspection);

// Get all inspections (admin)
router.get("/all", auth, roleCheck(["admin"]), getAllInspections);

// Get my inspections (inspector)
router.get("/my-inspections", auth, roleCheck(["inspector"]), getMyInspections);

// Get inspection details
router.get("/:inspectionId", auth, getInspectionDetails);

// Complete inspection (inspector)
router.put("/:inspectionId/complete", auth, roleCheck(["inspector"]), completeInspection);

module.exports = router;
