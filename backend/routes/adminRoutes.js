const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
    getAllUsers,
    verifyUser,
    createCrop,
    getAllCrops,
    deleteCrop
} = require("../controllers/adminController");

// Get all users
router.get("/users", auth, roleCheck(["admin"]), getAllUsers);

// Verify/Unverify user
router.put("/users/:userId/verify", auth, roleCheck(["admin"]), verifyUser);

// Create crop
router.post("/crops", auth, roleCheck(["admin"]), createCrop);

// Get all crops
router.get("/crops", getAllCrops);

// Delete crop
router.delete("/crops/:cropId", auth, roleCheck(["admin"]), deleteCrop);

module.exports = router;
