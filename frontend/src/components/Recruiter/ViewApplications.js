// src/components/Recruiter/ViewApplications.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getJobApplications, updateApplicationStatus } from "../../utils/api";
import "./ViewApplications.css";

function ViewApplications() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [id, filter]);

  const fetchApplications = async () => {
  try {
    console.log('Fetching applications for job:', id);
    const data = await getJobApplications(id, filter);
    console.log('Received data:', data);
    setApplications(data.applications || []);
  } catch (error) {
    console.error("Error fetching applications:", error);
  } finally {
    setLoading(false);
  }
};

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      fetchApplications();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="view-applications-container">
      <h1>Applications</h1>

      <div className="filter-bar">
        <button
          onClick={() => setFilter("")}
          className={!filter ? "active" : ""}
        >
          All
        </button>
        <button
          onClick={() => setFilter("applied")}
          className={filter === "applied" ? "active" : ""}
        >
          Applied
        </button>
        <button
          onClick={() => setFilter("shortlisted")}
          className={filter === "shortlisted" ? "active" : ""}
        >
          Shortlisted
        </button>
        <button
          onClick={() => setFilter("interviewed")}
          className={filter === "interviewed" ? "active" : ""}
        >
          Interviewed
        </button>
      </div>

      {applications.length > 0 ? (
        <div className="applications-table">
          {applications.map((app) => (
            <div key={app.id} className="application-row">
              <div className="applicant-info">
                <h3>
                  {app.first_name} {app.last_name}
                </h3>
                <p>{app.student_email}</p>
                <p>
                  CGPA: {app.current_cgpa} | {app.department}
                </p>
              </div>
              <div className="application-actions">
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className="status-select"
                >
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">
                    Interview Scheduled
                  </option>
                  <option value="interviewed">Interviewed</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
                {app.resume_url && (
                  <a
                    href={app.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    View Resume
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No applications yet</h3>
        </div>
      )}
    </div>
  );
}

export default ViewApplications;
