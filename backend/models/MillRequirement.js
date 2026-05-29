const mongoose = require("mongoose");

const millRequirementSchema = new mongoose.Schema({
    requirementId: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
    },

    millOwnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    cropId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Crop",
        required: true
    },

    quality: {
        type: Number,
        required: true
    },

    requiredTotalQuantity: {
        type: Number,
        required: true
    },

    expectedRate: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["active", "closed"],
        default: "active"
    }

}, { timestamps: true });

module.exports = mongoose.model("MillRequirement", millRequirementSchema);
