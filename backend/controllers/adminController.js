const User = require("../models/User");
const Crop = require("../models/Crop");

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Verify/Unverify user (admin only)
const verifyUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isVerified } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { isVerified },
            { new: true }
        ).select("-password");

        res.json({ message: "User verification status updated", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create crop (admin only)
const createCrop = async (req, res) => {
    try {
        const { name, season, type } = req.body;

        if (!name || !season || !type) {
            return res.status(400).json({ error: "Please provide name, season, and type" });
        }

        const crop = new Crop({ name, season, type });
        await crop.save();

        res.status(201).json({ message: "Crop created successfully", crop });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all crops
const getAllCrops = async (req, res) => {
    try {
        const crops = await Crop.find();
        res.json(crops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete crop (admin only)
const deleteCrop = async (req, res) => {
    try {
        const { cropId } = req.params;
        await Crop.findByIdAndDelete(cropId);
        res.json({ message: "Crop deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllUsers,
    verifyUser,
    createCrop,
    getAllCrops,
    deleteCrop
};
