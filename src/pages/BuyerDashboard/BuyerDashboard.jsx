import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import FilterBar from "../../components/FilterBar";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import Charts from "../../components/Charts";
import apiClient from "../../api/apiClient";
import "../../styles/Table.css";

const BuyerDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCharts, setShowCharts] = useState(false);

  const itemsPerPage = 20;

  const cityNames = {
    1: "Bangalore",
    2: "Chennai",
    3: "Delhi",
    4: "Hyderabad",
    5: "Kolkata",
    6: "Lucknow",
    7: "Mumbai",
  };

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Build query parameters
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      };

      const response = await apiClient.get("/api/properties", { params });
      const { items, total } = response.data;

      if (!items || items.length === 0) {
        setProperties([]);
        setTotalItems(0);
        return;
      }

      // Prepare data for bulk prediction
      const predictionPayload = items.map((prop) => ({
        id: prop.id,
        area_sqft: prop.area_sqft || 0,
        bhk: prop.bhk || 0,
        listing_score: prop.listing_score || 0,
        is_furnished: prop.is_furnished || false,
        city_id: prop.city_id || 0,
      }));

      // Call bulk prediction endpoint
      const predictionResponse = await apiClient.post(
        "/api/predict_bulk",
        predictionPayload
      );
      const predictions = predictionResponse.data;

      // Merge predictions with properties
      const propertiesWithPrices = items.map((prop) => {
        const prediction = predictions.find((p) => p.id === prop.id);
        return {
          ...prop,
          price: prediction ? prediction.prediction : prop.price || 0,
        };
      });

      setProperties(propertiesWithPrices);
      setTotalItems(total);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties. Please try again.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      label: "Predicted Price",
      className: "price-column",
      render: (row) => {
        const priceInLakhs = row.price
          ? (row.price / 100000).toFixed(2)
          : "N/A";
        return `₹${priceInLakhs} L`;
      },
    },
  ];

  return (
    <Layout role="buyer">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Browse Properties</h2>
          <button
            className="btn-secondary"
            onClick={() => setShowCharts(!showCharts)}
          >
            {showCharts ? "📊 Hide Analytics" : "📊 Show Analytics"}
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <FilterBar onFilterChange={handleFilterChange} />

        {showCharts && properties.length > 0 && (
          <Charts properties={properties} />
        )}

        <div className="table-section">
          <Table
            data={properties}
            columns={columns}
            loading={loading}
            emptyMessage="No properties found. Try adjusting your filters."
          />

          {!loading && properties.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BuyerDashboard;
