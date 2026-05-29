import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth APIs
export const registerUser = (userData) => api.post("/auth/register", userData);
export const loginUser = (credentials) => api.post("/auth/login", credentials);

// Admin APIs
export const getAllUsers = () => api.get("/admin/users");
export const verifyUser = (userId, isVerified) => api.put(`/admin/users/${userId}/verify`, { isVerified });
export const createCrop = (cropData) => api.post("/admin/crops", cropData);
export const getAllCrops = () => api.get("/admin/crops");
export const deleteCrop = (cropId) => api.delete(`/admin/crops/${cropId}`);

// Mill Requirement APIs
export const createMillRequirement = (data) => api.post("/mill-requirements/create", data);
export const getMyRequirements = () => api.get("/mill-requirements/my-requirements");
export const getAllActiveRequirements = () => api.get("/mill-requirements/active-requirements");
export const updateRequirementStatus = (requirementId, status) =>
    api.put(`/mill-requirements/${requirementId}/status`, { status });
export const updateRequiredQuantity = (requirementId, reduction) =>
    api.put(`/mill-requirements/${requirementId}/quantity`, { reduction });

// Sell Offer APIs
export const createSellOffer = (data) => api.post("/sell-offers/create", data);
export const getMyOffers = () => api.get("/sell-offers/my-offers");
export const getAllPendingOffers = () => api.get("/sell-offers/all-pending");
export const getOfferDetails = (offerId) => api.get(`/sell-offers/${offerId}`);

// Inspection APIs
export const assignInspection = (data) => api.post("/inspections/assign", data);
export const getAllInspections = () => api.get("/inspections/all");
export const getMyInspections = () => api.get("/inspections/my-inspections");
export const getInspectionDetails = (inspectionId) => api.get(`/inspections/${inspectionId}`);
export const completeInspection = (inspectionId, data) =>
    api.put(`/inspections/${inspectionId}/complete`, data);

export default api;
