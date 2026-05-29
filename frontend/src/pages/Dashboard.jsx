import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="navbar">
                <h1>AgroConnect - {user.name}</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            <div className="dashboard-content">
                <h2>Welcome, {user.name}!</h2>
                <p>Role: <strong>{user.role}</strong></p>
                <p>Email: {user.email}</p>
                <p>Verified: <strong>{user.isVerified ? "✓ Yes" : "✗ No"}</strong></p>

                <div className="dashboard-options">
                    {user.role === "admin" && (
                        <>
                            <button onClick={() => navigate("/admin")}>Admin Dashboard</button>
                            <p style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
                                Manage users, verify mill owners & inspectors, and create crops
                            </p>
                        </>
                    )}

                    {user.role === "mill_owner" && (
                        <>
                            {!user.isVerified && (
                                <div className="warning" style={{ padding: "10px", backgroundColor: "#fff3cd", borderRadius: "5px", marginBottom: "10px" }}>
                                    ⚠️ Waiting for admin verification. You cannot create requirements until verified.
                                </div>
                            )}
                            <button onClick={() => navigate("/mill-owner")}>Mill Owner Dashboard</button>
                            <p style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
                                Create and manage crop requirements
                            </p>
                        </>
                    )}

                    {user.role === "farmer" && (
                        <>
                            <button onClick={() => navigate("/farmer")}>Farmer Dashboard</button>
                            <p style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
                                View requirements and make sell offers
                            </p>
                        </>
                    )}

                    {user.role === "inspector" && (
                        <>
                            {!user.isVerified && (
                                <div className="warning" style={{ padding: "10px", backgroundColor: "#fff3cd", borderRadius: "5px", marginBottom: "10px" }}>
                                    ⚠️ Waiting for admin verification. You cannot inspect until verified.
                                </div>
                            )}
                            <button onClick={() => navigate("/inspector")}>Inspector Dashboard</button>
                            <p style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
                                Complete inspections and verify transactions
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
