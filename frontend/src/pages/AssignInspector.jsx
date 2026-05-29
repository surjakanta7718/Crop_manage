import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { assignInspection, getAllUsers } from "../services/api";
import "../App.css";

export default function AssignInspectorPage() {
    const { user } = useContext(AuthContext);

    const navigate = useNavigate();
    const { offerId } = useParams();

    const [inspectors, setInspectors] = useState([]);
    const [selectedInspector, setSelectedInspector] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadInspectors();
    }, []);

    const loadInspectors = async () => {
        try {
            const response = await getAllUsers();

            const inspectorList = response.data.filter(
                (u) => u.role === "inspector" && u.isVerified
            );

            setInspectors(inspectorList);
        } catch (err) {
            setError("Failed to load inspectors");
        }
    };

    const handleAssign = async () => {
        if (!selectedInspector) {
            setError("Please select an inspector");
            return;
        }

        try {
            setLoading(true);

            await assignInspection({
                offerId,
                inspectorId: selectedInspector,
            });

            alert("Inspector assigned successfully!");

            navigate("/admin");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to assign inspector");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Assign Inspector</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label>Select Inspector:</label>

                    <select
                        value={selectedInspector}
                        onChange={(e) => setSelectedInspector(e.target.value)}
                    >
                        <option value="">Choose an inspector</option>

                        {inspectors.map((inspector) => (
                            <option
                                key={inspector._id}
                                value={inspector._id}
                            >
                                {inspector.name} ({inspector.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginTop: "20px" }}>
                    <button onClick={handleAssign} disabled={loading}>
                        {loading ? "Assigning..." : "Assign Inspector"}
                    </button>

                    <button
                        onClick={() => navigate("/admin")}
                        style={{ marginLeft: "10px" }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}