// src/components/Admin/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboardStats } from "../../utils/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#27548A" }}>
            <span>👥</span>
          </div>
          <div className="stat-content">
            <h3>{stats?.total_students || 0}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#FE7743" }}>
            <span>🏢</span>
          </div>
          <div className="stat-content">
            <h3>{stats?.total_companies || 0}</h3>
            <p>Registered Companies</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#4CAF50" }}>
            <span>💼</span>
          </div>
          <div className="stat-content">
            <h3>{stats?.active_jobs || 0}</h3>
            <p>Active Jobs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#27548A" }}>
            <span>📊</span>
          </div>
          <div className="stat-content">
            <h3>{stats?.placement_percentage || 0}%</h3>
            <p>Placement Rate</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/admin/students" className="action-card">
          <span className="action-icon">👥</span>
          <h3>Manage Students</h3>
        </Link>
        <Link to="/admin/companies" className="action-card">
          <span className="action-icon">🏢</span>
          <h3>Manage Companies</h3>
        </Link>
        <Link to="/admin/reports" className="action-card">
          <span className="action-icon">📊</span>
          <h3>View Reports</h3>
        </Link>
      </div>

      {stats?.recent_applications && stats.recent_applications.length > 0 && (
        <div className="section">
          <h2>Recent Applications</h2>
          <div className="applications-list">
            {stats.recent_applications.map((app) => (
              <div key={app.id} className="application-item">
                <div>
                  <strong>
                    {app.first_name} {app.last_name}
                  </strong>{" "}
                  applied for <strong>{app.job_title}</strong> at{" "}
                  {app.company_name}
                </div>
                <span className="date">
                  {new Date(app.applied_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
