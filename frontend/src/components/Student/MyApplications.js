// src/components/Student/MyApplications.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyApplications } from "../../utils/api";
import "./MyApplications.css";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getMyApplications();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: "#27548A",
      shortlisted: "#FE7743",
      interview_scheduled: "#FE7743",
      interviewed: "#27548A",
      offered: "#4CAF50",
      rejected: "#F44336",
      accepted: "#4CAF50",
      withdrawn: "#757575",
    };
    return colors[status] || "#757575";
  };

  const filteredApplications =
    filter === "all"
      ? applications
      : applications.filter((app) => app.status === filter);

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="my-applications-container">
      <div className="applications-header">
        <h1>My Applications</h1>
        <p>Track the status of all your job applications</p>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({applications.length})
        </button>
        <button
          className={`filter-btn ${filter === "applied" ? "active" : ""}`}
          onClick={() => setFilter("applied")}
        >
          Applied ({applications.filter((a) => a.status === "applied").length})
        </button>
        <button
          className={`filter-btn ${filter === "shortlisted" ? "active" : ""}`}
          onClick={() => setFilter("shortlisted")}
        >
          Shortlisted (
          {applications.filter((a) => a.status === "shortlisted").length})
        </button>
        <button
          className={`filter-btn ${filter === "offered" ? "active" : ""}`}
          onClick={() => setFilter("offered")}
        >
          Offered ({applications.filter((a) => a.status === "offered").length})
        </button>
      </div>

      {filteredApplications.length > 0 ? (
        <div className="applications-grid">
          {filteredApplications.map((app) => (
            <div key={app.id} className="application-card">
              <div className="card-header">
                <img
                  src={app.company_logo || "/default-company.png"}
                  alt={app.company_name}
                  className="company-logo"
                />
                <div className="job-info">
                  <h3>{app.job_title}</h3>
                  <p>{app.company_name}</p>
                  <span className="location">📍 {app.location}</span>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">Applied on:</span>
                  <span className="value">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Job Type:</span>
                  <span className="value">{app.job_type}</span>
                </div>
                {app.ats_score && (
                  <div className="info-row">
                    <span className="label">ATS Score:</span>
                    <span className="value score">{app.ats_score}%</span>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(app.status),
                    color: "white",
                  }}
                >
                  {app.status.replace("_", " ")}
                </span>
                <Link
                  to={`/student/jobs/${app.job_id}`}
                  className="view-job-link"
                >
                  View Job →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No applications found</h3>
          <p>Start applying to jobs to see them here</p>
          <Link to="/student/jobs" className="btn btn-primary">
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyApplications;
