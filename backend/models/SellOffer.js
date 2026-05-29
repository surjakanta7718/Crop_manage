const mongoose = require("mongoose");

const sellOfferSchema = new mongoose.Schema({
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
    },

    requirementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MillRequirement",
        required: true
    },

    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    approxQuantitySell: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "assignedToInspector", "reject", "accept"],
        default: "pending"
    },

    otp: {
        type: String,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("SellOffer", sellOfferSchema);
