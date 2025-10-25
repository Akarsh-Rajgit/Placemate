import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import PropertyForm from "../../components/PropertyForm";
import apiClient from "../../api/apiClient";
import "../../styles/Table.css";

const SellerDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const cityNames = {
    1: "Bangalore",
    2: "Chennai",
    3: "Delhi",
    4: "Hyderabad",
    5: "Kolkata",
    6: "Lucknow",
    7: "Mumbai",
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/api/properties", {
        params: { limit: 100 },
      });

      const items = response.data.items || response.data || [];
      setProperties(items);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load your listings");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchProperties();
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      await apiClient.delete(`/api/properties/${propertyId}`);
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("Failed to delete property. Please try again.");
    }
  };

  const columns = [
    {
      key: "property_name",
      label: "Property Name",
      render: (row) => row.property_name || "Unnamed Property",
    },
    {
      key: "city",
      label: "City",
      render: (row) => cityNames[row.city_id] || "Unknown",
    },
    {
      key: "bhk",
      label: "BHK",
      render: (row) => row.bhk || "N/A",
    },
    {
      key: "area_sqft",
      label: "Area (sqft)",
      render: (row) => row.area_sqft?.toLocaleString() || "N/A",
    },
    {
      key: "is_furnished",
      label: "Furnished",
      render: (row) => (row.is_furnished ? "Yes" : "No"),
    },
    {
      key: "listing_score",
      label: "Score",
      render: (row) => row.listing_score?.toFixed(1) || "N/A",
    },
    {
      key: "price",
      label: "Price",
      className: "price-column",
      render: (row) => {
        if (!row.price) return "N/A";
        const priceInLakhs = (row.price / 100000).toFixed(2);
        return `₹${priceInLakhs} L`;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="action-buttons">
          <button
            className="btn-action btn-delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout role="seller">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title">My Property Listings</h2>
          <button
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "✖ Cancel" : "➕ Add Property"}
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {showForm && (
          <div className="form-section">
            <PropertyForm
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <div className="table-section">
          <Table
            data={properties}
            columns={columns}
            loading={loading}
            emptyMessage="You haven't listed any properties yet. Click 'Add Property' to get started."
          />
        </div>

        {!loading && properties.length > 0 && (
          <div className="listings-summary">
            <p>
              Total Listings: <strong>{properties.length}</strong>
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SellerDashboard;
