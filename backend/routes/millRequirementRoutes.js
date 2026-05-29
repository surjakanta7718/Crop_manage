const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
    createMillRequirement,
    getMyRequirements,
    getAllActiveRequirements,
    updateRequirementStatus,
    updateRequiredQuantity
} = require("../controllers/millOwnerController");

// Create mill requirement
router.post("/create", auth, roleCheck(["mill_owner"]), createMillRequirement);

// Get all requirements of a mill owner
router.get("/my-requirements", auth, roleCheck(["mill_owner"]), getMyRequirements);

// Get all active requirements
router.get("/active-requirements", auth, getAllActiveRequirements);

// Update requirement status
router.put("/:requirementId/status", auth, roleCheck(["mill_owner"]), updateRequirementStatus);

// Update required quantity
//router.put("/:requirementId/quantity", auth, roleCheck(["mill_owner"]), updateRequiredQuantity);

module.exports = router;
