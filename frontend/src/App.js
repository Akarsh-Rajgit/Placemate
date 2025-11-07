// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";

// Auth
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

// Student
import StudentDashboard from "./components/Student/StudentDashboard";
import StudentProfile from "./components/Student/StudentProfile";
import JobSearch from "./components/Student/JobSearch";
import JobDetail from "./components/Student/JobDetail";
import MyApplications from "./components/Student/MyApplications";
import SavedJobs from "./components/Student/SavedJobs";
import ResumeAnalyzer from "./components/Student/ResumeAnalyzer";

// Recruiter
import RecruiterDashboard from "./components/Recruiter/RecruiterDashboard";
import RecruiterProfile from "./components/Recruiter/RecruiterProfile";
import PostJob from "./components/Recruiter/PostJob";
// these should be DEFAULT exports (see files below)
import ManageJobs from "./components/Recruiter/ManageJobs";
import ViewApplications from "./components/Recruiter/ViewApplications";

// Admin
import AdminDashboard from "./components/Admin/AdminDashboard";
import ManageStudents from "./components/Admin/ManageStudents";
import ManageCompanies from "./components/Admin/ManageCompanies";
import PlacementReports from "./components/Admin/PlacementReports";

// Placement Officer
import PlacementDashboard from "./components/PlacementOfficer/PlacementDashboard";

// Shared
import Navbar from "./components/Shared/Navbar";
import Notifications from "./components/Shared/Notifications";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    if (token && userType) setUser({ token, userType });
    setLoading(false);
  }, []);

  const handleLogin = (token, userType) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userType", userType);
    setUser({ token, userType });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    setUser(null);
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="App">
      {user && <Navbar userType={user.userType} onLogout={handleLogout} />}

      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            !user ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to={`/${user.userType}`} />
            )
          }
        />
        <Route
          path="/register"
          element={
            !user ? (
              <Register onRegister={handleLogin} />
            ) : (
              <Navigate to={`/${user.userType}`} />
            )
          }
        />

        {/* Student */}
        {user && user.userType === "student" && (
          <>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/jobs" element={<JobSearch />} />
            <Route path="/student/jobs/:id" element={<JobDetail />} />
            <Route path="/student/applications" element={<MyApplications />} />
            <Route path="/student/saved-jobs" element={<SavedJobs />} />
            <Route
              path="/student/resume-analyzer"
              element={<ResumeAnalyzer />}
            />
            <Route path="/student/notifications" element={<Notifications />} />
          </>
        )}

        {/* Recruiter */}
        {user && user.userType === "recruiter" && (
          <>
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            <Route path="/recruiter/profile" element={<RecruiterProfile />} />
            <Route path="/recruiter/post-job" element={<PostJob />} />
            <Route path="/recruiter/jobs" element={<ManageJobs />} />
            <Route
              path="/recruiter/jobs/:id/applications"
              element={<ViewApplications />}
            />
            <Route
              path="/recruiter/notifications"
              element={<Notifications />}
            />
          </>
        )}

        {/* Admin */}
        {user && user.userType === "admin" && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/companies" element={<ManageCompanies />} />
            <Route path="/admin/reports" element={<PlacementReports />} />
            <Route path="/admin/notifications" element={<Notifications />} />
          </>
        )}

        {/* Placement Officer */}
        {user && user.userType === "placement_officer" && (
          <>
            <Route path="/placement_officer" element={<PlacementDashboard />} />
            <Route
              path="/placement_officer/students"
              element={<ManageStudents />}
            />
            <Route
              path="/placement_officer/companies"
              element={<ManageCompanies />}
            />
            <Route
              path="/placement_officer/reports"
              element={<PlacementReports />}
            />
            <Route
              path="/placement_officer/notifications"
              element={<Notifications />}
            />
          </>
        )}

        {/* Default */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : (
              <Navigate to={`/${user.userType}`} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
