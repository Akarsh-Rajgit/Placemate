import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Forms.css";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/properties/${id}`);
      setProperty(response.data);
    } catch (err) {
      console.error("Error fetching property:", err);
      setError("Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const redirectPath =
      user?.role === "buyer" ? "/buyer/dashboard" : "/seller/dashboard";
    navigate(redirectPath);
  };

  if (loading) {
    return (
      <Layout role={user?.role}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading property details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout role={user?.role}>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || "Property not found"}</p>
          <button className="btn-primary" onClick={handleBack}>
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  const cityNames = {
    1: "Bangalore",
    2: "Chennai",
    3: "Delhi",
    4: "Hyderabad",
    5: "Kolkata",
    6: "Lucknow",
    7: "Mumbai",
  };

  return (
    <Layout role={user?.role}>
      <div className="property-details-container">
        <button className="btn-secondary" onClick={handleBack}>
          ← Back to Dashboard
        </button>

        <div className="property-details-card">
          <h2 className="property-title">
            {property.property_name || "Property Details"}
          </h2>

          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">City:</span>
              <span className="detail-value">
                {cityNames[property.city_id] || "Unknown"}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Area:</span>
              <span className="detail-value">
                {property.area_sqft?.toLocaleString() || "N/A"} sqft
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">BHK:</span>
              <span className="detail-value">{property.bhk || "N/A"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Furnished:</span>
              <span className="detail-value">
                {property.is_furnished ? "Yes" : "No"}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">RERA Registered:</span>
              <span className="detail-value">
                {property.is_rera_registered ? "Yes" : "No"}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value">
                {property.is_apartment ? "Apartment" : "Other"}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Listing Score:</span>
              <span className="detail-value">
                {property.listing_score?.toFixed(1) || "N/A"}
              </span>
            </div>

            {property.price && (
              <div className="detail-item">
                <span className="detail-label">Price:</span>
                <span className="detail-value price-highlight">
                  ₹{(property.price / 100000).toFixed(2)} Lakhs
                </span>
              </div>
            )}

            {property.price_per_sqft && (
              <div className="detail-item">
                <span className="detail-label">Price per Sqft:</span>
                <span className="detail-value">
                  ₹{property.price_per_sqft?.toLocaleString() || "N/A"}
                </span>
              </div>
            )}

            {property.luxury_index && (
              <div className="detail-item">
                <span className="detail-label">Luxury Index:</span>
                <span className="detail-value">
                  {property.luxury_index?.toFixed(2) || "N/A"}
                </span>
              </div>
            )}

            {property.date_posted && (
              <div className="detail-item">
                <span className="detail-label">Date Posted:</span>
                <span className="detail-value">
                  {new Date(property.date_posted).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetails;
