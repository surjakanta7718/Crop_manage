import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
    getAllUsers,
    verifyUser,
    createCrop,
    getAllCrops,
    deleteCrop,
    getAllInspections,
    getAllPendingOffers
} from "../services/api";
import "../App.css";

export default function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tab, setTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [crops, setCrops] = useState([]);
    const [inspections, setInspections] = useState([]);
    const [pendingOffers, setPendingOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [newCrop, setNewCrop] = useState({ name: "", season: "", type: "" });

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/login");
        }
    }, [user, navigate]);

    useEffect(() => {
        if (tab === "users") loadUsers();
        if (tab === "crops") loadCrops();
        if (tab === "inspections") loadInspections();
        if (tab === "offers") loadPendingOffers();
    }, [tab]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers();
            setUsers(response.data);
        } catch (err) {
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const loadCrops = async () => {
        try {
            setLoading(true);
            const response = await getAllCrops();
            setCrops(response.data);
        } catch (err) {
            setError("Failed to load crops");
        } finally {
            setLoading(false);
        }
    };

    const loadInspections = async () => {
        try {
            setLoading(true);
            const response = await getAllInspections();
            setInspections(response.data);
        } catch (err) {
            setError("Failed to load inspections");
        } finally {
            setLoading(false);
        }
    };

    const loadPendingOffers = async () => {
        try {
            setLoading(true);
            const response = await getAllPendingOffers();
            setPendingOffers(response.data);
        } catch (err) {
            setError("Failed to load offers");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (userId, isVerified) => {
        try {
            await verifyUser(userId, isVerified);
            loadUsers();
        } catch (err) {
            setError("Failed to verify user");
        }
    };

    const handleAddCrop = async (e) => {
        e.preventDefault();
        try {
            await createCrop(newCrop);
            setNewCrop({ name: "", season: "", type: "" });
            loadCrops();
        } catch (err) {
            setError("Failed to create crop");
        }
    };

    const handleDeleteCrop = async (cropId) => {
        try {
            await deleteCrop(cropId);
            loadCrops();
        } catch (err) {
            setError("Failed to delete crop");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="dashboard-container">
            <div className="navbar">
                <h1>AgroConnect - Admin Dashboard</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            <div className="tabs">
                <button onClick={() => setTab("users")} className={tab === "users" ? "active" : ""}>
                    Manage Users
                </button>
                <button onClick={() => setTab("crops")} className={tab === "crops" ? "active" : ""}>
                    Manage Crops
                </button>
                <button onClick={() => setTab("offers")} className={tab === "offers" ? "active" : ""}>
                    Pending Offers
                </button>
                <button onClick={() => setTab("inspections")} className={tab === "inspections" ? "active" : ""}>
                    Inspections
                </button>
            </div>

            <div className="tab-content">
                {error && <div className="error-message">{error}</div>}
                {loading && <p>Loading...</p>}

                {tab === "users" && (
                    <div>
                        <h3>All Users</h3>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Verified</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{u.role}</td>
                                        <td>{u.isVerified ? "✓" : "✗"}</td>
                                        <td>
                                            {u.role !== "farmer" && u.role !== "admin" && (
                                                <button
                                                    onClick={() => handleVerify(u._id, !u.isVerified)}
                                                    className="action-btn"
                                                >
                                                    {u.isVerified ? "Unverify" : "Verify"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === "crops" && (
                    <div>
                        <h3>Manage Crops</h3>
                        <form onSubmit={handleAddCrop} className="form">
                            <input
                                type="text"
                                placeholder="Crop Name"
                                value={newCrop.name}
                                onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Season"
                                value={newCrop.season}
                                onChange={(e) => setNewCrop({ ...newCrop, season: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Type"
                                value={newCrop.type}
                                onChange={(e) => setNewCrop({ ...newCrop, type: e.target.value })}
                                required
                            />
                            <button type="submit">Add Crop</button>
                        </form>
                        <table className="table" style={{ marginTop: "20px" }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Season</th>
                                    <th>Type</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {crops.map((crop) => (
                                    <tr key={crop._id}>
                                        <td>{crop.name}</td>
                                        <td>{crop.season}</td>
                                        <td>{crop.type}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteCrop(crop._id)}
                                                className="delete-btn"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === "offers" && (
                    <div>
                        <h3>Pending Sell Offers</h3>
                        {pendingOffers.length === 0 ? (
                            <p>No pending offers</p>
                        ) : (
                            <div className="offers-list">
                                {pendingOffers.map((offer) => (
                                    <div key={offer._id} className="offer-card">
                                        <p><strong>Offer ID:</strong> {offer._id}</p>
                                        <p><strong>Farmer:</strong> {offer.farmerId?.name}</p>
                                        <p><strong>Quantity:</strong> {offer.approxQuantitySell} units</p>
                                        <p><strong>Status:</strong> {offer.status}</p>
                                        <button onClick={() => navigate(`/admin/assign-inspector/${offer._id}`)}>
                                            Assign Inspector
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === "inspections" && (
                    <div>
                        <h3>Inspections Status</h3>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Inspector</th>
                                    <th>Offer ID</th>
                                    <th>Status</th>
                                    <th>Completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inspections.map((inspection) => (
                                    <tr key={inspection._id}>
                                        <td>{inspection.inspectorId?.name}</td>
                                        <td>{inspection.offerId?._id}</td>
                                        <td>{inspection.transactionStatus}</td>
                                        <td>{inspection.isTransactionCompleted ? "✓" : "✗"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
