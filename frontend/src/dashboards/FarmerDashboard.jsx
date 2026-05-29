import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
    getAllActiveRequirements,
    createSellOffer,
    getMyOffers
} from "../services/api";
import "../App.css";

export default function FarmerDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tab, setTab] = useState("requirements");
    const [requirements, setRequirements] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedReq, setSelectedReq] = useState(null);
    const [quantityToSell, setQuantityToSell] = useState("");

    useEffect(() => {
        if (!user || user.role !== "farmer") {
            navigate("/login");
        }
    }, [user, navigate]);

    useEffect(() => {
        if (tab === "requirements") loadRequirements();
        if (tab === "my-offers") loadOffers();
    }, [tab]);

    const loadRequirements = async () => {
        try {
            setLoading(true);
            const response = await getAllActiveRequirements();
            setRequirements(response.data);
        } catch (err) {
            setError("Failed to load requirements");
        } finally {
            setLoading(false);
        }
    };

    const loadOffers = async () => {
        try {
            setLoading(true);
            const response = await getMyOffers();
            setOffers(response.data);
        } catch (err) {
            setError("Failed to load offers");
        } finally {
            setLoading(false);
        }
    };

    const handleMakeDeal = async (requirementId) => {
        try {
            if (!quantityToSell || quantityToSell <= 0) {
                setError("Please enter a valid quantity");
                return;
            }

            const response = await createSellOffer({
                requirementId,
                approxQuantitySell: parseFloat(quantityToSell)
            });

            setError("");
            alert(`Offer created successfully! Your OTP is: ${response.data.otp}`);
            setQuantityToSell("");
            setSelectedReq(null);
            loadOffers();
            setTab("my-offers");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create offer");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="dashboard-container">
            <div className="navbar">
                <h1>AgroConnect - Farmer Dashboard</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            <div className="tabs">
                <button onClick={() => setTab("requirements")} className={tab === "requirements" ? "active" : ""}>
                    Available Requirements
                </button>
                <button onClick={() => setTab("my-offers")} className={tab === "my-offers" ? "active" : ""}>
                    My Sell Offers
                </button>
            </div>

            <div className="tab-content">
                {error && <div className="error-message">{error}</div>}
                {loading && <p>Loading...</p>}

                {tab === "requirements" && (
                    <div>
                        <h3>Available Mill Requirements</h3>
                        {requirements.length === 0 ? (
                            <p>No active requirements available</p>
                        ) : (
                            <div className="requirements-list">
                                {requirements.map((req) => (
                                    <div key={req._id} className="requirement-card">
                                        <p><strong>Mill:</strong> {req.millOwnerId?.millName}</p>
                                        <p><strong>Location:</strong> {req.millOwnerId?.millLocation}</p>
                                        <p><strong>Crop:</strong> {req.cropId?.name}</p>
                                        <p><strong>Required Quantity:</strong> {req.requiredTotalQuantity} units</p>
                                        <p><strong>Expected Rate:</strong> ${req.expectedRate}/unit</p>

                                        {selectedReq === req._id ? (
                                            <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px" }}>
                                                <input
                                                    type="number"
                                                    placeholder="Enter quantity to sell"
                                                    value={quantityToSell}
                                                    onChange={(e) => setQuantityToSell(e.target.value)}
                                                    max={req.requiredTotalQuantity}
                                                    required
                                                />
                                                <div style={{ marginTop: "10px" }}>
                                                    <button
                                                        onClick={() => handleMakeDeal(req._id)}
                                                        className="action-btn"
                                                    >
                                                        Confirm Sell Offer
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedReq(null)}
                                                        className="delete-btn"
                                                        style={{ marginLeft: "10px" }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedReq(req._id)}
                                                className="action-btn"
                                            >
                                                Make Deal
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === "my-offers" && (
                    <div>
                        <h3>My Sell Offers</h3>
                        {offers.length === 0 ? (
                            <p>No offers created yet</p>
                        ) : (
                            <div className="offers-list">
                                {offers.map((offer) => (
                                    <div key={offer._id} className="offer-card">
                                        <p><strong>Mill:</strong> {offer.requirementId?.millOwnerId?.millName}</p>
                                        <p><strong>Crop:</strong> {offer.requirementId?.cropId?.name}</p>
                                        <p><strong>Quantity Selling:</strong> {offer.approxQuantitySell} units</p>
                                        <p><strong>Expected Rate:</strong> ${offer.requirementId?.expectedRate}/unit</p>
                                        <p><strong>Estimated Amount:</strong> ${offer.approxQuantitySell * offer.requirementId?.expectedRate}</p>
                                        <p><strong>Status:</strong> <span style={{
                                            color: offer.status === "pending" ? "orange" :
                                                offer.status === "accept" ? "green" :
                                                    offer.status === "reject" ? "red" : "blue"
                                        }}>{offer.status.toUpperCase()}</span></p>
                                        {offer.status === "assignedToInspector" && (
                                            <p style={{ fontSize: "12px", color: "red" }}>
                                                Your OTP: {offer.otp} (Keep it safe - you'll need it for inspection)
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
