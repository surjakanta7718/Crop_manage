const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
    createSellOffer,
    getMyOffers,
    getAllPendingOffers,
    getOfferDetails
} = require("../controllers/farmerController");

// Create sell offer
router.post("/create", auth, roleCheck(["farmer"]), createSellOffer);

// Get all offers of a farmer
router.get("/my-offers", auth, roleCheck(["farmer"]), getMyOffers);

// Get all pending offers (admin)
router.get("/all-pending", auth, roleCheck(["admin"]), getAllPendingOffers);

// Get offer details
router.get("/:offerId", auth, getOfferDetails);

module.exports = router;
