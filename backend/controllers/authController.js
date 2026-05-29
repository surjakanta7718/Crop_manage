const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register user
const register = async (req, res) => {
    try {
        const { name, email, phone, address, password, role, licenseNo, millName, millLocation } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !address || !password || !role) {
            return res.status(400).json({ error: "Please fill all required fields" });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Validate mill owner specific fields
        if (role === "mill_owner") {
            if (!licenseNo || !millName || !millLocation) {
                return res.status(400).json({ error: "Mill owner must provide licenseNo, millName, and millLocation" });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user object
        const userObj = {
            name,
            email,
            phone,
            address,
            password: hashedPassword,
            role,
            isVerified: role === "farmer" ? true : false // Farmers are auto-verified
        };

        // Add mill owner specific fields
        if (role === "mill_owner") {
            userObj.licenseNo = licenseNo;
            userObj.millName = millName;
            userObj.millLocation = millLocation;
        }

        // Create new user
        user = new User(userObj);
        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Please provide email and password" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "User does not exist" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login };
