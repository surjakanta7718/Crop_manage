require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const initializeAdmin = require("./config/initializeAdmin");

// Import routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const millRequirementRoutes = require("./routes/millRequirementRoutes");
const sellOfferRoutes = require("./routes/sellOfferRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/mill-requirements", millRequirementRoutes);
app.use("/api/sell-offers", sellOfferRoutes);
app.use("/api/inspections", inspectionRoutes);

app.get("/", (req, res) => {
  res.json({ message: "AgroConnect Backend running" });
});

// Initialize admin on startup
initializeAdmin();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});