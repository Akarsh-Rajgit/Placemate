import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/Layout.css";

const Layout = ({ children, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout-container">
      <Sidebar isOpen={sidebarOpen} role={role} />

      <div
        className={`main-content ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <header className="top-header">
          <button
            className="menu-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <span className="hamburger-icon">☰</span>
          </button>
          <h1 className="header-title">Real Estate Platform</h1>
        </header>

        <main className="content-area">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
