// src/components/Student/JobSearch.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchJobs, saveJob, unsaveJob } from "../../utils/api";
import "./JobSearch.css";

function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    job_type: "",
    location: "",
    page: 1,
  });
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchJobs(filters);
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Error searching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSaveJob = async (jobId) => {
    try {
      if (savedJobIds.has(jobId)) {
        await unsaveJob(jobId);
        setSavedJobIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await saveJob(jobId);
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error("Error saving/unsaving job:", error);
    }
  };

  const formatSalary = (min, max, currency) => {
    if (!min) return "Not disclosed";
    const formatted = `${currency} ${(min / 100000).toFixed(1)}L`;
    if (max && max !== min) {
      return `${formatted} - ${(max / 100000).toFixed(1)}L`;
    }
    return formatted;
  };

  return (
    <div className="job-search-container">
      <div className="search-header">
        <h1>Find Your Dream Job</h1>
        <p>Discover opportunities that match your skills and aspirations</p>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-bar">
            <input
              type="text"
              name="search"
              placeholder="Job title, keywords, or company"
              value={filters.search}
              onChange={handleFilterChange}
              className="search-input"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
              className="location-input"
            />
            <button type="submit" className="btn btn-primary search-btn">
              🔍 Search
            </button>
          </div>

          <div className="filters">
            <select
              name="job_type"
              value={filters.job_type}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="search-results">
        <div className="results-header">
          <h2>{jobs.length} Jobs Found</h2>
        </div>

        {loading ? (
          <div className="loading">Searching...</div>
        ) : jobs.length > 0 ? (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job.id} className="job-card-search">
                <div className="job-card-top">
                  <div className="job-card-left">
                    <img
                      src={job.company_logo || "/default-company.png"}
                      alt={job.company_name}
                      className="company-logo-large"
                    />
                    <div className="job-info">
                      <Link
                        to={`/student/jobs/${job.id}`}
                        className="job-title-link"
                      >
                        <h3>{job.job_title}</h3>
                      </Link>
                      <p className="company-name">{job.company_name}</p>
                      <div className="job-meta">
                        <span className="meta-item">📍 {job.location}</span>
                        {job.is_remote && (
                          <span className="meta-item remote">🏠 Remote</span>
                        )}
                        <span className="meta-item">💼 {job.job_type}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveJob(job.id)}
                    className={`save-btn ${
                      savedJobIds.has(job.id) ? "saved" : ""
                    }`}
                    title={savedJobIds.has(job.id) ? "Unsave job" : "Save job"}
                  >
                    {savedJobIds.has(job.id) ? "❤️" : "🤍"}
                  </button>
                </div>

                <p className="job-description-preview">
                  {job.job_description?.substring(0, 200)}...
                </p>

                <div className="job-card-footer">
                  <div className="job-tags">
                    {job.required_skills
                      ?.split(",")
                      .slice(0, 3)
                      .map((skill, idx) => (
                        <span key={idx} className="skill-tag">
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                  <div className="job-salary">
                    <span className="salary-label">Salary:</span>
                    <span className="salary-amount">
                      {formatSalary(
                        job.salary_min,
                        job.salary_max,
                        job.currency
                      )}
                    </span>
                  </div>
                </div>

                <div className="job-actions">
                  <Link
                    to={`/student/jobs/${job.id}`}
                    className="btn btn-secondary"
                  >
                    View Details
                  </Link>
                  <span className="posted-date">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSearch;
