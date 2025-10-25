import React, { useState } from "react";
import apiClient from "../api/apiClient";
import "../styles/Forms.css";

const PropertyForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    property_name: "",
    city_id: "",
    area_sqft: "",
    bhk: "",
    is_furnished: false,
    is_rera_registered: false,
    is_apartment: true,
    listing_score: "",
    price: "",
    price_per_sqft: "",
    luxury_index: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const cityOptions = [
    { id: 1, name: "Bangalore" },
    { id: 2, name: "Chennai" },
    { id: 3, name: "Delhi" },
    { id: 4, name: "Hyderabad" },
    { id: 5, name: "Kolkata" },
    { id: 6, name: "Lucknow" },
    { id: 7, name: "Mumbai" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.property_name.trim()) {
      newErrors.property_name = "Property name is required";
    }

    if (!formData.city_id) {
      newErrors.city_id = "Please select a city";
    }

    if (!formData.area_sqft || parseFloat(formData.area_sqft) <= 0) {
      newErrors.area_sqft = "Valid area is required";
    }

    if (!formData.bhk || parseInt(formData.bhk) <= 0) {
      newErrors.bhk = "Valid BHK count is required";
    }

    if (
      !formData.listing_score ||
      parseFloat(formData.listing_score) < 0 ||
      parseFloat(formData.listing_score) > 10
    ) {
      newErrors.listing_score = "Listing score must be between 0 and 10";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API
      const payload = {
        property_name: formData.property_name,
        city_id: parseInt(formData.city_id),
        area_sqft: parseFloat(formData.area_sqft),
        bhk: parseInt(formData.bhk),
        is_furnished: formData.is_furnished,
        is_rera_registered: formData.is_rera_registered,
        is_apartment: formData.is_apartment,
        listing_score: parseFloat(formData.listing_score),
        price: formData.price ? parseFloat(formData.price) : null,
        price_per_sqft: formData.price_per_sqft
          ? parseFloat(formData.price_per_sqft)
          : null,
        luxury_index: formData.luxury_index
          ? parseFloat(formData.luxury_index)
          : null,
      };

      await apiClient.post("/api/properties", payload);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating property:", error);
      const message =
        error.response?.data?.detail ||
        "Failed to create property. Please try again.";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="property-form" onSubmit={handleSubmit}>
      <h3 className="form-title">Add New Property</h3>

      {submitError && <div className="error-alert">{submitError}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="property_name">
            Property Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="property_name"
            name="property_name"
            value={formData.property_name}
            onChange={handleChange}
            placeholder="e.g., Ocean View Apartment"
            className={errors.property_name ? "error" : ""}
          />
          {errors.property_name && (
            <span className="error-text">{errors.property_name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="city_id">
            City <span className="required">*</span>
          </label>
          <select
            id="city_id"
            name="city_id"
            value={formData.city_id}
            onChange={handleChange}
            className={errors.city_id ? "error" : ""}
          >
            <option value="">Select City</option>
            {cityOptions.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {errors.city_id && (
            <span className="error-text">{errors.city_id}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="area_sqft">
            Area (sqft) <span className="required">*</span>
          </label>
          <input
            type="number"
            id="area_sqft"
            name="area_sqft"
            value={formData.area_sqft}
            onChange={handleChange}
            placeholder="e.g., 1200"
            min="0"
            step="0.01"
            className={errors.area_sqft ? "error" : ""}
          />
          {errors.area_sqft && (
            <span className="error-text">{errors.area_sqft}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="bhk">
            BHK <span className="required">*</span>
          </label>
          <input
            type="number"
            id="bhk"
            name="bhk"
            value={formData.bhk}
            onChange={handleChange}
            placeholder="e.g., 2"
            min="1"
            className={errors.bhk ? "error" : ""}
          />
          {errors.bhk && <span className="error-text">{errors.bhk}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="listing_score">
            Listing Score (0-10) <span className="required">*</span>
          </label>
          <input
            type="number"
            id="listing_score"
            name="listing_score"
            value={formData.listing_score}
            onChange={handleChange}
            placeholder="e.g., 7.5"
            min="0"
            max="10"
            step="0.1"
            className={errors.listing_score ? "error" : ""}
          />
          {errors.listing_score && (
            <span className="error-text">{errors.listing_score}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (optional)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 5000000"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="price_per_sqft">Price per Sqft (optional)</label>
          <input
            type="number"
            id="price_per_sqft"
            name="price_per_sqft"
            value={formData.price_per_sqft}
            onChange={handleChange}
            placeholder="e.g., 4500"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="luxury_index">Luxury Index (optional)</label>
          <input
            type="number"
            id="luxury_index"
            name="luxury_index"
            value={formData.luxury_index}
            onChange={handleChange}
            placeholder="e.g., 0.75"
            min="0"
            max="1"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-checkboxes">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_furnished"
            checked={formData.is_furnished}
            onChange={handleChange}
          />
          <span>Furnished</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_rera_registered"
            checked={formData.is_rera_registered}
            onChange={handleChange}
          />
          <span>RERA Registered</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_apartment"
            checked={formData.is_apartment}
            onChange={handleChange}
          />
          <span>Apartment</span>
        </label>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create Property"}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;
