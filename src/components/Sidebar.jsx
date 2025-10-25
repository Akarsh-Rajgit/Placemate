import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Layout.css";

const Sidebar = ({ isOpen, role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const buyerLinks = [
    { path: "/buyer/dashboard", label: "🏠 Browse Properties", icon: "🏠" },
  ];

  const sellerLinks = [
    { path: "/seller/dashboard", label: "📊 My Listings", icon: "📊" },
  ];

  const links = role === "buyer" ? buyerLinks : sellerLinks;

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">{isOpen ? "🏡 Real Estate" : "🏡"}</h2>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${
              location.pathname === link.path ? "active" : ""
            }`}
          >
            <span className="nav-icon">{link.icon}</span>
            {isOpen && (
              <span className="nav-label">
                {link.label.replace(/^[^ ]+ /, "")}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          {isOpen && (
            <>
              <div className="user-name">{user?.name || "User"}</div>
              <div className="user-role">{user?.role || "guest"}</div>
            </>
          )}
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          {isOpen ? "🚪 Logout" : "🚪"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
