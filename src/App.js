import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BuyerDashboard from "./pages/BuyerDashboard/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard/SellerDashboard";
import PropertyDetails from "./pages/PropertyDetails";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute requiredRole="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute requiredRole="seller">
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/properties/:id"
            element={
              <ProtectedRoute>
                <PropertyDetails />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
