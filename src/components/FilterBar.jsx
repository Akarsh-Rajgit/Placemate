import React, { useState, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";
import "../styles/Table.css";

const FilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    city: "",
    minBhk: "",
    maxBhk: "",
    minArea: "",
    maxArea: "",
    furnished: "",
    minPrice: "",
    maxPrice: "",
  });

  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    // Convert filter values and send to parent
    const processedFilters = {};

    if (debouncedFilters.city) processedFilters.city = debouncedFilters.city;
    if (debouncedFilters.minBhk)
      processedFilters.min_bhk = parseInt(debouncedFilters.minBhk);
    if (debouncedFilters.maxBhk)
      processedFilters.max_bhk = parseInt(debouncedFilters.maxBhk);
    if (debouncedFilters.minArea)
      processedFilters.min_area = parseFloat(debouncedFilters.minArea);
    if (debouncedFilters.maxArea)
      processedFilters.max_area = parseFloat(debouncedFilters.maxArea);
    if (debouncedFilters.furnished)
      processedFilters.furnished = debouncedFilters.furnished === "true";
    if (debouncedFilters.minPrice)
      processedFilters.min_price = parseFloat(debouncedFilters.minPrice);
    if (debouncedFilters.maxPrice)
      processedFilters.max_price = parseFloat(debouncedFilters.maxPrice);

    onFilterChange(processedFilters);
  }, [debouncedFilters, onFilterChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      city: "",
      minBhk: "",
      maxBhk: "",
      minArea: "",
      maxArea: "",
      furnished: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  return (
    <div className="filter-bar">
      <h3 className="filter-title">Filter Properties</h3>

      <div className="filter-grid">
        <div className="filter-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={filters.city}
            onChange={handleChange}
            placeholder="e.g., Mumbai, Delhi"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="minBhk">Min BHK</label>
          <input
            type="number"
            id="minBhk"
            name="minBhk"
            value={filters.minBhk}
            onChange={handleChange}
            placeholder="1"
            min="0"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="maxBhk">Max BHK</label>
          <input
            type="number"
            id="maxBhk"
            name="maxBhk"
            value={filters.maxBhk}
            onChange={handleChange}
            placeholder="5"
            min="0"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="minArea">Min Area (sqft)</label>
          <input
            type="number"
            id="minArea"
            name="minArea"
            value={filters.minArea}
            onChange={handleChange}
            placeholder="500"
            min="0"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="maxArea">Max Area (sqft)</label>
          <input
            type="number"
            id="maxArea"
            name="maxArea"
            value={filters.maxArea}
            onChange={handleChange}
            placeholder="5000"
            min="0"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="furnished">Furnished</label>
          <select
            id="furnished"
            name="furnished"
            value={filters.furnished}
            onChange={handleChange}
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="minPrice">Min Price (Lakhs)</label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="10"
            min="0"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="maxPrice">Max Price (Lakhs)</label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="100"
            min="0"
          />
        </div>
      </div>

      <button className="reset-btn" onClick={handleReset}>
        Reset Filters
      </button>
    </div>
  );
};

export default FilterBar;
