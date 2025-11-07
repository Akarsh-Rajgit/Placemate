// src/components/Shared/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getNotifications } from "../../utils/api";
import "./Navbar.css";

function Navbar({ userType, onLogout }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(20);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const getNavItems = () => {
    switch (userType) {
      case "student":
        return [
          { path: "/student", label: "Dashboard", icon: "🏠" },
          { path: "/student/jobs", label: "Find Jobs", icon: "🔍" },
          {
            path: "/student/applications",
            label: "My Applications",
            icon: "📄",
          },
          { path: "/student/saved-jobs", label: "Saved", icon: "💾" },
          {
            path: "/student/resume-analyzer",
            label: "Resume Analyzer",
            icon: "📊",
          },
          { path: "/student/profile", label: "Profile", icon: "👤" },
        ];
      case "recruiter":
        return [
          { path: "/recruiter", label: "Dashboard", icon: "🏠" },
          { path: "/recruiter/post-job", label: "Post Job", icon: "➕" },
          { path: "/recruiter/jobs", label: "Manage Jobs", icon: "💼" },
          { path: "/recruiter/profile", label: "Company Profile", icon: "🏢" },
        ];
      case "admin":
        return [
          { path: "/admin", label: "Dashboard", icon: "🏠" },
          { path: "/admin/students", label: "Students", icon: "👥" },
          { path: "/admin/companies", label: "Companies", icon: "🏢" },
          { path: "/admin/reports", label: "Reports", icon: "📊" },
        ];
      case "placement_officer":
        return [
          { path: "/placement_officer", label: "Dashboard", icon: "🏠" },
          {
            path: "/placement_officer/students",
            label: "Students",
            icon: "👥",
          },
          {
            path: "/placement_officer/companies",
            label: "Companies",
            icon: "🏢",
          },
          { path: "/placement_officer/reports", label: "Reports", icon: "📊" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={`/${userType}`} className="navbar-brand">
          <span className="brand-logo">PlaceMate</span>
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? "active" : ""}`}>
          <div className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="navbar-actions">
            <Link
              to={`/${userType}/notifications`}
              className="notification-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="notification-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </Link>
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
