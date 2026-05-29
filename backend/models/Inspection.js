const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema({
    inspectionId: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
    },

    inspectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellOffer",
        required: true
    },

    quantityReal: {
        type: Number,
        default: null
    },

    finalRate: {
        type: Number,
        default: null
    },

    amount: {
        type: Number,
        default: null
    },

    isTransactionCompleted: {
        type: Boolean,
        default: false
    },

    transactionStatus: {
        type: String,
        enum: ["pending", "accept", "reject"],
        default: "pending"
    }

}, { timestamps: true });

module.exports = mongoose.model("Inspection", inspectionSchema);
