const MillRequirement = require("../models/MillRequirement");

// Create mill requirement
const createMillRequirement = async (req, res) => {
    try {
        const { cropId, quality, requiredTotalQuantity, expectedRate } = req.body;

        if (!cropId || !quality || !requiredTotalQuantity || !expectedRate) {
            return res.status(400).json({ error: "Please provide all required fields" });
        }

        const requirement = new MillRequirement({
            millOwnerId: req.user.id,
            cropId,
            quality,
            requiredTotalQuantity,
            expectedRate
        });

        await requirement.save();
        await requirement.populate("cropId", "name season type");
        await requirement.populate("millOwnerId", "name email phone address millName millLocation");

        res.status(201).json({ message: "Requirement created successfully", requirement });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all requirements of a mill owner
const getMyRequirements = async (req, res) => {
    try {
        const requirements = await MillRequirement.find({ millOwnerId: req.user.id })
            .populate("cropId", "name season type")
            .populate("millOwnerId", "name email phone address millName millLocation");

        res.json(requirements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all active requirements (for farmers)
const getAllActiveRequirements = async (req, res) => {
    try {
        const requirements = await MillRequirement.find({ status: "active" })
            .populate("cropId", "name season type")
            .populate("millOwnerId", "name email phone address millName millLocation");

        res.json(requirements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update requirement status
const updateRequirementStatus = async (req, res) => {
    try {
        const { requirementId } = req.params;
        const { status } = req.body;

        if (!["active", "closed"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const requirement = await MillRequirement.findByIdAndUpdate(
            requirementId,
            { status },
            { new: true }
        ).populate("cropId").populate("millOwnerId", "name email phone address millName millLocation");

        res.json({ message: "Requirement status updated", requirement });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update required total quantity
// const updateRequiredQuantity = async (req, res) => {
//     try {
//         const { requirementId } = req.params;
//         const { reduction } = req.body;

//         const requirement = await MillRequirement.findById(requirementId);

//         if (!requirement) {
//             return res.status(404).json({ error: "Requirement not found" });
//         }

//         requirement.requiredTotalQuantity -= reduction;

//         if (requirement.requiredTotalQuantity <= 0) {
//             requirement.status = "closed";
//         }

//         await requirement.save();
//         await requirement.populate("cropId").populate("millOwnerId", "name email phone address millName millLocation");

//         res.json({ message: "Quantity updated successfully", requirement });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

module.exports = {
    createMillRequirement,
    getMyRequirements,
    getAllActiveRequirements,
    updateRequirementStatus,
    //updateRequiredQuantity
};
