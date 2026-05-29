const User = require("../models/User");
const bcrypt = require("bcryptjs");

const initializeAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log("Admin user already exists");
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create admin user
        const admin = new User({
            name: "Admin",
            email: adminEmail,
            phone: "0000000000",
            address: "Admin Address",
            password: hashedPassword,
            role: "admin",
            isVerified: true
        });

        await admin.save();
        console.log("Admin user created successfully!");
    } catch (error) {
        console.error("Error initializing admin:", error.message);
    }
};

module.exports = initializeAdmin;
