// src/components/Recruiter/RecruiterDashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRecruiterJobs } from "../../utils/api";
import "./RecruiterDashboard.css";

function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    closedJobs: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await getRecruiterJobs();
      setJobs(data.jobs || []);

      const totalJobs = data.jobs?.length || 0;
      const activeJobs =
        data.jobs?.filter((j) => j.status === "active").length || 0;
      const closedJobs =
        data.jobs?.filter((j) => j.status === "closed").length || 0;
      const totalApplications =
        data.jobs?.reduce(
          (sum, job) => sum + (job.application_count || 0),
          0
        ) || 0;

      setStats({ totalJobs, activeJobs, closedJobs, totalApplications });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="recruiter-dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Your Recruiter Dashboard</h1>
        <Link to="/recruiter/post-job" className="btn btn-primary">
          + Post New Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#27548A" }}>
            <span>💼</span>
          </div>
          <div className="stat-content">
            <h3>{stats.totalJobs}</h3>
            <p>Total Jobs Posted</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#4CAF50" }}>
            <span>✅</span>
          </div>
          <div className="stat-content">
            <h3>{stats.activeJobs}</h3>
            <p>Active Jobs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#FE7743" }}>
            <span>📄</span>
          </div>
          <div className="stat-content">
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#757575" }}>
            <span>🔒</span>
          </div>
          <div className="stat-content">
            <h3>{stats.closedJobs}</h3>
            <p>Closed Jobs</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <Link to="/recruiter/post-job" className="action-card">
            <span className="action-icon">➕</span>
            <h3>Post New Job</h3>
            <p>Create a new job posting</p>
          </Link>
          <Link to="/recruiter/jobs" className="action-card">
            <span className="action-icon">📋</span>
            <h3>Manage Jobs</h3>
            <p>View and edit your job postings</p>
          </Link>
          <Link to="/recruiter/profile" className="action-card">
            <span className="action-icon">🏢</span>
            <h3>Company Profile</h3>
            <p>Update company information</p>
          </Link>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="section">
        <div className="section-header">
          <h2>Your Job Postings</h2>
          <Link to="/recruiter/jobs" className="view-all">
            View All
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="jobs-table">
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Applications</th>
                  <th>Posted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 5).map((job) => (
                  <tr key={job.id}>
                    <td className="job-title-cell">{job.job_title}</td>
                    <td>
                      <span className={`status-badge ${job.status}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{job.location}</td>
                    <td className="applications-count">
                      {job.application_count || 0}
                    </td>
                    <td>{new Date(job.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link
                        to={`/recruiter/jobs/${job.id}/applications`}
                        className="btn-link"
                      >
                        View Applications
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>No jobs posted yet</h3>
            <p>Start by posting your first job opening</p>
            <Link to="/recruiter/post-job" className="btn btn-primary">
              Post Your First Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboard;
