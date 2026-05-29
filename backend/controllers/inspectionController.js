const SellOffer = require("../models/SellOffer");
const Inspection = require("../models/Inspection");
const User = require("../models/User");
const MillRequirement = require("../models/MillRequirement");

// Assign inspection to inspector
const assignInspection = async (req, res) => {
    try {
        const { offerId, inspectorId } = req.body;

        if (!offerId || !inspectorId) {
            return res.status(400).json({ error: "Please provide offerId and inspectorId" });
        }

        const offer = await SellOffer.findById(offerId);

        if (!offer) {
            return res.status(404).json({ error: "Offer not found" });
        }

        // Update offer status
        offer.status = "assignedToInspector";
        await offer.save();

        // Create inspection record
        const inspection = new Inspection({
            inspectorId,
            offerId
        });

        await inspection.save();
        await inspection.populate("inspectorId", "name email phone address");
        await inspection.populate("offerId");

        res.status(201).json({ message: "Inspection assigned successfully", inspection });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all inspections (admin)
const getAllInspections = async (req, res) => {
    try {
        const inspections = await Inspection.find()
            .populate("inspectorId", "name email phone address")
            .populate({
                path: "offerId",
                populate: [
                    { path: "requirementId" },
                    { path: "farmerId", select: "name email phone address" }
                ]
            });

        res.json(inspections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get inspection details
const getInspectionDetails = async (req, res) => {
    try {
        const { inspectionId } = req.params;

        const inspection = await Inspection.findById(inspectionId)
            .populate("inspectorId", "name email phone address")
            .populate({
                path: "offerId",
                populate: [
                    {
                        path: "requirementId",
                        populate: [
                            { path: "cropId", select: "name season type" },
                            { path: "millOwnerId", select: "name email phone address millName millLocation" }
                        ]
                    },
                    { path: "farmerId", select: "name email phone address" }
                ]
            });

        if (!inspection) {
            return res.status(404).json({ error: "Inspection not found" });
        }

        res.json(inspection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get my assigned inspections (inspector)
const getMyInspections = async (req, res) => {
    try {
        const inspections = await Inspection.find({ inspectorId: req.user.id })
            .populate("inspectorId", "name email phone address")
            .populate({
                path: "offerId",
                populate: [
                    {
                        path: "requirementId",
                        populate: [
                            { path: "cropId", select: "name season type" },
                            { path: "millOwnerId", select: "name email phone address millName millLocation" }
                        ]
                    },
                    { path: "farmerId", select: "name email phone address" }
                ]
            });

        res.json(inspections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Complete inspection
const completeInspection = async (req, res) => {
    try {

        const { inspectionId } = req.params;

        const {
            quantityReal,
            finalRate,
            otpFromFarmer,
            transactionStatus
        } = req.body;

        // Transaction status required
        if (!transactionStatus) {
            return res.status(400).json({
                error: "Please provide transaction status"
            });
        }

        // Validate status
        if (!["accept", "reject"].includes(transactionStatus)) {
            return res.status(400).json({
                error: "Invalid transaction status"
            });
        }

        // Required fields only for ACCEPT
        if (
            transactionStatus === "accept" &&
            (
                !quantityReal ||
                !finalRate ||
                !otpFromFarmer
            )
        ) {
            return res.status(400).json({
                error: "Please provide all required fields"
            });
        }

        // Find inspection
        const inspection = await Inspection.findById(inspectionId)
            .populate("offerId");

        if (!inspection) {
            return res.status(404).json({
                error: "Inspection not found"
            });
        }

        // Find offer
        const offer = await SellOffer.findById(inspection.offerId);

        if (!offer) {
            return res.status(404).json({
                error: "Offer not found"
            });
        }

        // Verify OTP only for ACCEPT
        if (
            transactionStatus === "accept" &&
            offer.otp !== otpFromFarmer
        ) {
            return res.status(400).json({
                error: "OTP does not match"
            });
        }

        // Update inspection
        inspection.transactionStatus = transactionStatus;

        inspection.quantityReal =
            transactionStatus === "accept"
                ? quantityReal
                : 0;

        inspection.finalRate =
            transactionStatus === "accept"
                ? finalRate
                : 0;

        inspection.amount =
            transactionStatus === "accept"
                ? quantityReal * finalRate
                : 0;

        inspection.isTransactionCompleted = true;

        await inspection.save();

        // Update offer status
        offer.status =
            transactionStatus === "accept"
                ? "accept"
                : "reject";

        await offer.save();

        // Update requirement only if ACCEPT
        if (transactionStatus === "accept") {

            const requirement =
                await MillRequirement.findById(
                    offer.requirementId
                );

            if (requirement) {

                requirement.requiredTotalQuantity -= quantityReal;

                if (requirement.requiredTotalQuantity <= 0) {
                    requirement.status = "closed";
                }

                await requirement.save();
            }
        }

        // Populate inspection data
        await inspection.populate(
            "inspectorId",
            "name email phone address"
        );

        await inspection.populate({
            path: "offerId",
            populate: [
                {
                    path: "requirementId",
                    populate: [
                        {
                            path: "cropId",
                            select: "name season type"
                        },
                        {
                            path: "millOwnerId",
                            select:
                                "name email phone address millName millLocation"
                        }
                    ]
                },
                {
                    path: "farmerId",
                    select: "name email phone address"
                }
            ]
        });

        return res.json({
            message: "Inspection completed successfully",
            inspection
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    assignInspection,
    getAllInspections,
    getInspectionDetails,
    getMyInspections,
    completeInspection
};
