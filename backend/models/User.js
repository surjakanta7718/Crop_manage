const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: String,
        required: true,
        unique: true
    },

    address: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["farmer", "mill_owner", "admin", "inspector"],
        required: true
    },

    // Verification status for all users
    isVerified: {
        type: Boolean,
        default: false
    },

    // Required only for mill owners
    licenseNo: {
        type: String,
        required: function () {
            return this.role === "mill_owner";
        }
    },

    millName: {
        type: String,
        required: function () {
            return this.role === "mill_owner";
        }
    },

    millLocation: {
        type: String,
        required: function () {
            return this.role === "mill_owner";
        }
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
