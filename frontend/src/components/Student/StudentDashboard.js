// src/components/Student/StudentDashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getJobRecommendations,
  getMyApplications,
  getNotifications,
} from "../../utils/api";
import "./StudentDashboard.css";

function StudentDashboard() {
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    applied: 0,
    shortlisted: 0,
    interviewed: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [recsData, appsData, notifData] = await Promise.all([
        getJobRecommendations(),
        getMyApplications(),
        getNotifications(5),
      ]);

      setRecommendations(recsData.recommendations || []);
      setApplications(appsData.applications || []);
      setNotifications(notifData.notifications || []);

      // Calculate stats
      const applied = appsData.applications?.length || 0;
      const shortlisted =
        appsData.applications?.filter((a) => a.status === "shortlisted")
          .length || 0;
      const interviewed =
        appsData.applications?.filter((a) => a.status === "interviewed")
          .length || 0;

      setStats({ applied, shortlisted, interviewed });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
    };
    return colors[status] || "#757575";
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome Back!</h1>
        <p>Here's what's happening with your job search</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#27548A" }}>
            <span>📄</span>
          </div>
          <div className="stat-content">
            <h3>{stats.applied}</h3>
            <p>Applications Sent</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#FE7743" }}>
            <span>⭐</span>
          </div>
          <div className="stat-content">
            <h3>{stats.shortlisted}</h3>
            <p>Shortlisted</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#27548A" }}>
            <span>💼</span>
          </div>
          <div className="stat-content">
            <h3>{stats.interviewed}</h3>
            <p>Interviews</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#FE7743" }}>
            <span>🔔</span>
          </div>
          <div className="stat-content">
            <h3>{notifications.filter((n) => !n.is_read).length}</h3>
            <p>New Notifications</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-cards">
            <Link to="/student/jobs" className="action-card">
              <span className="action-icon">🔍</span>
              <h3>Search Jobs</h3>
              <p>Find your dream opportunity</p>
            </Link>
            <Link to="/student/resume-analyzer" className="action-card">
              <span className="action-icon">📊</span>
              <h3>Analyze Resume</h3>
              <p>Get ATS score & feedback</p>
            </Link>
            <Link to="/student/profile" className="action-card">
              <span className="action-icon">👤</span>
              <h3>Update Profile</h3>
              <p>Keep your profile current</p>
            </Link>
            <Link to="/student/saved-jobs" className="action-card">
              <span className="action-icon">💾</span>
              <h3>Saved Jobs</h3>
              <p>View bookmarked positions</p>
            </Link>
          </div>
        </div>

        {/* Job Recommendations */}
        <div className="section">
          <div className="section-header">
            <h2>Recommended for You</h2>
            <Link to="/student/jobs" className="view-all">
              View All
            </Link>
          </div>
          <div className="job-cards">
            {recommendations.slice(0, 3).map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-card-header">
                  <img
                    src={job.company_logo || "/default-company.png"}
                    alt={job.company_name}
                    className="company-logo"
                  />
                  <div className="job-card-title">
                    <h3>{job.job_title}</h3>
                    <p>{job.company_name}</p>
                  </div>
                </div>
                <div className="job-card-details">
                  <span className="job-badge">{job.job_type}</span>
                  <span className="job-location">📍 {job.location}</span>
                  {job.match_score && (
                    <span
                      className="match-score"
                      style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      {job.match_score} skills match
                    </span>
                  )}
                </div>
                <p className="job-description">
                  {job.job_description?.substring(0, 150)}...
                </p>
                <Link
                  to={`/student/jobs/${job.id}`}
                  className="btn btn-secondary"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="section">
          <div className="section-header">
            <h2>Recent Applications</h2>
            <Link to="/student/applications" className="view-all">
              View All
            </Link>
          </div>
          {applications.length > 0 ? (
            <div className="applications-list">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="application-item">
                  <div className="application-info">
                    <img
                      src={app.company_logo || "/default-company.png"}
                      alt={app.company_name}
                      className="app-company-logo"
                    />
                    <div>
                      <h4>{app.job_title}</h4>
                      <p>
                        {app.company_name} • {app.location}
                      </p>
                    </div>
                  </div>
                  <div className="application-meta">
                    <span className="application-date">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                    <span
                      className="application-status"
                      style={{
                        backgroundColor: getStatusColor(app.status),
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                      }}
                    >
                      {app.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No applications yet. Start exploring jobs!</p>
              <Link to="/student/jobs" className="btn btn-primary">
                Browse Jobs
              </Link>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="section">
          <div className="section-header">
            <h2>Recent Notifications</h2>
            <Link to="/student/notifications" className="view-all">
              View All
            </Link>
          </div>
          {notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${
                    !notif.is_read ? "unread" : ""
                  }`}
                >
                  <div className="notification-icon">🔔</div>
                  <div className="notification-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className="notification-time">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No new notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
