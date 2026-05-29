const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
    cropId: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
    },
    
    name: {
        type: String,
        required: true
    },

    season: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Crop", cropSchema);
