// src/components/Student/SavedJobs.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSavedJobs, unsaveJob } from "../../utils/api";
import "./SavedJobs.css";

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const data = await getSavedJobs();
      setSavedJobs(data.saved_jobs || []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    if (!window.confirm("Remove this job from saved?")) return;

    try {
      await unsaveJob(jobId);
      setSavedJobs(savedJobs.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Error unsaving job:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading saved jobs...</div>;
  }

  return (
    <div className="saved-jobs-container">
      <div className="saved-jobs-header">
        <h1>Saved Jobs</h1>
        <p>Your bookmarked job opportunities</p>
      </div>

      {savedJobs.length > 0 ? (
        <div className="saved-jobs-grid">
          {savedJobs.map((job) => (
            <div key={job.id} className="saved-job-card">
              <button
                onClick={() => handleUnsave(job.id)}
                className="unsave-btn"
                title="Remove from saved"
              >
                ❤️
              </button>

              <div className="job-header">
                <img
                  src={job.company_logo || "/default-company.png"}
                  alt={job.company_name}
                  className="company-logo"
                />
                <div className="job-title-section">
                  <h3>{job.job_title}</h3>
                  <p>{job.company_name}</p>
                </div>
              </div>

              <div className="job-details">
                <span className="job-badge">{job.job_type}</span>
                <span className="job-location">📍 {job.location}</span>
                {job.is_remote && (
                  <span className="remote-badge">🏠 Remote</span>
                )}
              </div>

              <p className="job-description">
                {job.job_description?.substring(0, 150)}...
              </p>

              <div className="job-footer">
                <span className="saved-date">
                  Saved on {new Date(job.saved_at).toLocaleDateString()}
                </span>
                <Link
                  to={`/student/jobs/${job.id}`}
                  className="btn btn-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">💾</div>
          <h3>No saved jobs</h3>
          <p>Save jobs to view them later</p>
          <Link to="/student/jobs" className="btn btn-primary">
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
}

export default SavedJobs;
