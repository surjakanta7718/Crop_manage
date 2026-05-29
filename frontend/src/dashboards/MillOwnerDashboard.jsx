import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
    createMillRequirement,
    getMyRequirements,
    getAllCrops,
    updateRequirementStatus
} from "../services/api";
import "../App.css";

export default function MillOwnerDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tab, setTab] = useState("create");
    const [crops, setCrops] = useState([]);
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [newRequirement, setNewRequirement] = useState({
        cropId: "",
        quality: "",
        requiredTotalQuantity: "",
        expectedRate: ""
    });

    useEffect(() => {
        if (!user || user.role !== "mill_owner") {
            navigate("/login");
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user?.isVerified) {
            loadCrops();
        }
        if (tab === "my-requirements") {
            loadRequirements();
        }
    }, [tab, user?.isVerified]);

    const loadCrops = async () => {
        try {
            const response = await getAllCrops();
            setCrops(response.data);
        } catch (err) {
            setError("Failed to load crops");
        }
    };

    const loadRequirements = async () => {
        try {
            setLoading(true);
            const response = await getMyRequirements();
            setRequirements(response.data);
        } catch (err) {
            setError("Failed to load requirements");
        } finally {
            setLoading(false);
        }
    };

    const handleAddRequirement = async (e) => {
        e.preventDefault();
        try {
            await createMillRequirement(newRequirement);
            setNewRequirement({
                cropId: "",
                quality: "",
                requiredTotalQuantity: "",
                expectedRate: ""
            });
            setTab("my-requirements");
            loadRequirements();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create requirement");
        }
    };

    const handleCloseRequirement = async (requirementId) => {
        try {
            await updateRequirementStatus(requirementId, "closed");
            loadRequirements();
        } catch (err) {
            setError("Failed to close requirement");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user?.isVerified) {
        return (
            <div className="dashboard-container">
                <div className="navbar">
                    <h1>AgroConnect - Mill Owner</h1>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
                <div className="warning" style={{ margin: "20px", padding: "20px", backgroundColor: "#f8d7da", borderRadius: "5px" }}>
                    <h3>⚠️ Account Not Verified</h3>
                    <p>Your account is awaiting verification from the admin. You cannot create requirements until verified.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="navbar">
                <h1>AgroConnect - Mill Owner Dashboard</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            <div className="tabs">
                <button onClick={() => setTab("create")} className={tab === "create" ? "active" : ""}>
                    Create Requirement
                </button>
                <button onClick={() => setTab("my-requirements")} className={tab === "my-requirements" ? "active" : ""}>
                    My Requirements
                </button>
            </div>

            <div className="tab-content">
                {error && <div className="error-message">{error}</div>}
                {loading && <p>Loading...</p>}

                {tab === "create" && (
                    <div>
                        <h3>Create Mill Requirement</h3>
                        <form onSubmit={handleAddRequirement} className="form">
                            <div className="form-group">
                                <label>Select Crop:</label>
                                <select
                                    value={newRequirement.cropId}
                                    onChange={(e) => setNewRequirement({ ...newRequirement, cropId: e.target.value })}
                                    required
                                >
                                    <option value="">Select a crop</option>
                                    {crops.map((crop) => (
                                        <option key={crop._id} value={crop._id}>
                                            {crop.name} ({crop.season})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Quality Need:</label>
                                <input
                                    type="number"
                                    value={newRequirement.quality}
                                    onChange={(e) => setNewRequirement({ ...newRequirement, quality: e.target.value })}
                                    placeholder="Enter quality"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Required Total Quantity:</label>
                                <input
                                    type="number"
                                    value={newRequirement.requiredTotalQuantity}
                                    onChange={(e) => setNewRequirement({ ...newRequirement, requiredTotalQuantity: e.target.value })}
                                    placeholder="Enter total quantity needed"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Expected Rate (per unit):</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newRequirement.expectedRate}
                                    onChange={(e) => setNewRequirement({ ...newRequirement, expectedRate: e.target.value })}
                                    placeholder="Enter expected rate"
                                    required
                                />
                            </div>

                            <button type="submit">Create Requirement</button>
                        </form>
                    </div>
                )}

                {tab === "my-requirements" && (
                    <div>
                        <h3>My Requirements</h3>
                        {requirements.length === 0 ? (
                            <p>No requirements created yet</p>
                        ) : (
                            <div className="requirements-list">
                                {requirements.map((req) => (
                                    <div key={req._id} className="requirement-card">
                                        <p><strong>Crop:</strong> {req.cropId?.name}</p>
                                        <p><strong>Quality Need:</strong> {req.quality} units</p>
                                        <p><strong>Required Quantity:</strong> {req.requiredTotalQuantity} units</p>
                                        <p><strong>Expected Rate:</strong> ${req.expectedRate}/unit</p>
                                        <p><strong>Status:</strong> <span style={{ color: req.status === "active" ? "green" : "red" }}>{req.status.toUpperCase()}</span></p>
                                        {req.status === "active" && (
                                            <button
                                                onClick={() => handleCloseRequirement(req._id)}
                                                className="delete-btn"
                                            >
                                                Close Requirement
                                            </button>
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
