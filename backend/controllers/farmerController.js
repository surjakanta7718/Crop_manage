const SellOffer = require("../models/SellOffer");
const MillRequirement = require("../models/MillRequirement");

// Generate random OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create sell offer
const createSellOffer = async (req, res) => {
    try {
        const { requirementId, approxQuantitySell } = req.body;

        if (!requirementId || !approxQuantitySell) {
            return res.status(400).json({ error: "Please provide requirementId and approxQuantitySell" });
        }

        const requirement = await MillRequirement.findById(requirementId);

        if (!requirement) {
            return res.status(404).json({ error: "Requirement not found" });
        }

        if (requirement.status === "closed") {
            return res.status(400).json({ error: "Requirement is closed" });
        }

        if (approxQuantitySell > requirement.requiredTotalQuantity) {
            return res.status(400).json({ error: "Cannot sell more than required quantity" });
        }

        const otp = generateOTP();

        const offer = new SellOffer({
            requirementId,
            farmerId: req.user.id,
            approxQuantitySell,
            otp
        });

        await offer.save();
        await offer.populate([
            { path: "requirementId" },
            { path: "farmerId", select: "name email phone address" }
        ]);

        // Return OTP only to the farmer (don't send in response ideally, but for now showing)
        res.status(201).json({
            message: "Sell offer created successfully",
            offer,
            otp // OTP should be sent via email/SMS in production
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all offers of a farmer
const getMyOffers = async (req, res) => {
    try {
        const offers = await SellOffer.find({ farmerId: req.user.id })
            .populate({
                path: "requirementId",
                populate: [
                    { path: "cropId", select: "name season type" },
                    { path: "millOwnerId", select: "name email phone address millName millLocation" }
                ]
            })
            .populate("farmerId", "name email phone address");

        res.json(offers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all pending offers (for admin)
const getAllPendingOffers = async (req, res) => {
    try {
        const offers = await SellOffer.find({ status: "pending" })
            .populate({
                path: "requirementId",
                populate: [
                    { path: "cropId", select: "name season type" },
                    { path: "millOwnerId", select: "name email phone address millName millLocation" }
                ]
            })
            .populate("farmerId", "name email phone address");

        res.json(offers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get offer details
const getOfferDetails = async (req, res) => {
    try {
        const { offerId } = req.params;

        const offer = await SellOffer.findById(offerId)
            .populate({
                path: "requirementId",
                populate: [
                    { path: "cropId", select: "name season type" },
                    { path: "millOwnerId", select: "name email phone address millName millLocation" }
                ]
            })
            .populate("farmerId", "name email phone address");

        if (!offer) {
            return res.status(404).json({ error: "Offer not found" });
        }

        res.json(offer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createSellOffer,
    getMyOffers,
    getAllPendingOffers,
    getOfferDetails
};
