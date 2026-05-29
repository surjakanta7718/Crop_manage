import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
    getMyInspections,
    completeInspection
} from "../services/api";
import "../App.css";

export default function InspectorDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [inspectionData, setInspectionData] = useState({
        quantityReal: "",
        finalRate: "",
        otpFromFarmer: "",
        transactionStatus: "accept"
    });

    useEffect(() => {
        if (!user || user.role !== "inspector") {
            navigate("/login");
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user?.isVerified) {
            loadInspections();
        }
    }, [user?.isVerified]);

    const loadInspections = async () => {
        try {
            setLoading(true);
            const response = await getMyInspections();
            setInspections(response.data);
        } catch (err) {
            setError("Failed to load inspections");
        } finally {
            setLoading(false);
        }
    };

const handleCompleteInspection = async () => {
    try {

        // Validation only for ACCEPT
        if (
            inspectionData.transactionStatus === "accept" &&
            (
                !inspectionData.quantityReal ||
                !inspectionData.finalRate ||
                !inspectionData.otpFromFarmer
            )
        ) {
            setError("Please fill all fields");
            return;
        }

        await completeInspection(
            selectedInspection._id,
            inspectionData
        );

        setError("");

        alert("Inspection completed successfully!");

        setInspectionData({
            quantityReal: "",
            finalRate: "",
            otpFromFarmer: "",
            transactionStatus: "accept"
        });

        setSelectedInspection(null);

        loadInspections();

    } catch (err) {
        setError(
            err.response?.data?.error ||
            "Failed to complete inspection"
        );
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
                    <h1>AgroConnect - Inspector</h1>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
                <div className="warning" style={{ margin: "20px", padding: "20px", backgroundColor: "#f8d7da", borderRadius: "5px" }}>
                    <h3>⚠️ Account Not Verified</h3>
                    <p>Your account is awaiting verification from the admin. You cannot inspect until verified.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="navbar">
                <h1>AgroConnect - Inspector Dashboard</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            <div className="tab-content">
                {error && <div className="error-message">{error}</div>}
                {loading && <p>Loading...</p>}

                <h3>My Assigned Inspections</h3>
                {inspections.length === 0 ? (
                    <p>No inspections assigned yet</p>
                ) : (
                    <div className="inspections-list">
                        {inspections.map((inspection) => (
                            <div key={inspection._id} className="inspection-card">
                                <p><strong>Farmer:</strong> {inspection.offerId?.farmerId?.name}</p>
                                <p><strong>Farmer Email:</strong> {inspection.offerId?.farmerId?.email}</p>
                                <p><strong>Farmer Phone:</strong> {inspection.offerId?.farmerId?.phone}</p>
                                <p><strong>Farmer Address:</strong> {inspection.offerId?.farmerId?.address}</p>
                                <p><strong>Mill:</strong> {inspection.offerId?.requirementId?.millOwnerId?.millName}</p>
                                <p><strong>Crop:</strong> {inspection.offerId?.requirementId?.cropId?.name}</p>
                                <p><strong>Quantity Offered:</strong> {inspection.offerId?.approxQuantitySell} units</p>
                                <p><strong>Expected Rate:</strong> ${inspection.offerId?.requirementId?.expectedRate}/unit</p>
                                <p><strong>Status:</strong> <span style={{
                                    color: inspection.isTransactionCompleted ?
                                        (inspection.transactionStatus === "accept" ? "green" : "red") : "orange"
                                }}>
                                    {inspection.isTransactionCompleted ? inspection.transactionStatus.toUpperCase() : "PENDING"}
                                </span></p>

                                {!inspection.isTransactionCompleted && (
                                    <>
                                        {selectedInspection?._id === inspection._id ? (
                                            <div
                                                style={{
                                                    marginTop: "15px",
                                                    padding: "15px",
                                                    backgroundColor: "#f0f0f0",
                                                    borderRadius: "5px"
                                                }}
                                            >
                                                <div className="form-group">
                                                    <label>Transaction Status:</label>

                                                    <select
                                                        value={inspectionData.transactionStatus}
                                                        onChange={(e) =>
                                                            setInspectionData({
                                                                ...inspectionData,
                                                                transactionStatus: e.target.value
                                                            })
                                                        }
                                                    >
                                                        <option value="accept">Accept</option>
                                                        <option value="reject">Reject</option>
                                                    </select>
                                                </div>

                                                {inspectionData.transactionStatus === "accept" && (
                                                    <>
                                                        <div className="form-group">
                                                            <label>Actual Quantity Inspected (units):</label>

                                                            <input
                                                                type="number"
                                                                value={inspectionData.quantityReal}
                                                                onChange={(e) =>
                                                                    setInspectionData({
                                                                        ...inspectionData,
                                                                        quantityReal: e.target.value
                                                                    })
                                                                }
                                                                required
                                                            />
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Final Rate ($/unit):</label>

                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={inspectionData.finalRate}
                                                                onChange={(e) =>
                                                                    setInspectionData({
                                                                        ...inspectionData,
                                                                        finalRate: e.target.value
                                                                    })
                                                                }
                                                                required
                                                            />
                                                        </div>

                                                        <div className="form-group">
                                                            <label>OTP from Farmer:</label>

                                                            <input
                                                                type="text"
                                                                value={inspectionData.otpFromFarmer}
                                                                onChange={(e) =>
                                                                    setInspectionData({
                                                                        ...inspectionData,
                                                                        otpFromFarmer: e.target.value
                                                                    })
                                                                }
                                                                placeholder="Enter OTP"
                                                                required
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                <div style={{ marginTop: "10px" }}>
                                                    <button
                                                        onClick={handleCompleteInspection}
                                                        className="action-btn"
                                                    >
                                                        Complete Inspection
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedInspection(null)}
                                                        className="delete-btn"
                                                        style={{ marginLeft: "10px" }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedInspection(inspection)}
                                                className="action-btn"
                                            >
                                                Complete Inspection
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
