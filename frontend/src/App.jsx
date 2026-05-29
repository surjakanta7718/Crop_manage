import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AssignInspector from './pages/AssignInspector';

// Dashboards
import AdminDashboard from './dashboards/AdminDashboard';
import MillOwnerDashboard from './dashboards/MillOwnerDashboard';
import FarmerDashboard from './dashboards/FarmerDashboard';
import InspectorDashboard from './dashboards/InspectorDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/assign-inspector/:offerId" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AssignInspector />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/mill-owner" 
            element={
              <ProtectedRoute requiredRole="mill_owner">
                <MillOwnerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/farmer" 
            element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/inspector" 
            element={
              <ProtectedRoute requiredRole="inspector">
                <InspectorDashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
