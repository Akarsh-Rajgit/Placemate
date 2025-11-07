// src/utils/api.js
const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Generic API call function
const apiCall = async (endpoint, method = "GET", body = null) => {
  const config = {
    method,
    headers: getAuthHeaders(),
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
};

// Auth APIs
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Student APIs
export const getStudentProfile = () => apiCall("/student/profile");
export const updateStudentProfile = (data) =>
  apiCall("/student/profile", "PUT", data);
export const addSkill = (skill) => apiCall("/student/skills", "POST", skill);
export const deleteSkill = (skillId) =>
  apiCall(`/student/skills/${skillId}`, "DELETE");
export const getMyApplications = () => apiCall("/applications/my-applications");
export const applyForJob = (jobId, coverLetter, resumeUrl) =>
  apiCall("/applications/apply", "POST", {
    job_id: jobId,
    cover_letter: coverLetter,
    resume_url: resumeUrl,
  });

// Job APIs
export const searchJobs = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/jobs/search?${queryString}`);
};
export const getJobDetail = (jobId) => apiCall(`/jobs/${jobId}`);
export const getJobRecommendations = () => apiCall("/ai/job-recommendations");
export const saveJob = (jobId) => apiCall(`/jobs/${jobId}/save`, "POST");
export const unsaveJob = (jobId) => apiCall(`/jobs/${jobId}/unsave`, "DELETE");
export const getSavedJobs = () => apiCall("/jobs/saved");

// AI APIs
export const analyzeResume = (resumeText, jobDescription, jobId) =>
  apiCall("/ai/resume-analysis", "POST", {
    resume_text: resumeText,
    job_description: jobDescription,
    job_id: jobId,
  });

// Recruiter APIs
export const getRecruiterProfile = () => apiCall("/recruiter/profile");
export const updateRecruiterProfile = (data) =>
  apiCall("/recruiter/profile", "PUT", data);
export const createJob = (jobData) =>
  apiCall("/recruiter/jobs", "POST", jobData);
export const getRecruiterJobs = () => apiCall("/recruiter/jobs");
export const getJobApplications = (jobId, status = "") =>
  apiCall(
    `/recruiter/jobs/${jobId}/applications${status ? `?status=${status}` : ""}`
  );
export const updateApplicationStatus = (applicationId, status) =>
  apiCall(`/recruiter/applications/${applicationId}/status`, "PUT", { status });

// Admin APIs
export const getAdminDashboardStats = () => apiCall("/admin/dashboard-stats");
export const getAllStudents = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/admin/students${queryString ? `?${queryString}` : ""}`);
};
export const getAllCompanies = () => apiCall("/admin/companies");
export const verifyCompany = (companyId, isVerified) =>
  apiCall(`/admin/companies/${companyId}/verify`, "PUT", {
    is_verified: isVerified,
  });
export const getPlacementReport = (year) =>
  apiCall(`/admin/reports/placement?year=${year}`);

// Notification APIs
export const getNotifications = (limit = 20) =>
  apiCall(`/notifications?limit=${limit}`);
export const markNotificationRead = (notificationId) =>
  apiCall(`/notifications/${notificationId}/read`, "PUT");
export const markAllNotificationsRead = () =>
  apiCall("/notifications/mark-all-read", "PUT");

export default {
  login,
  register,
  getStudentProfile,
  updateStudentProfile,
  addSkill,
  deleteSkill,
  searchJobs,
  getJobDetail,
  getJobRecommendations,
  applyForJob,
  getMyApplications,
  saveJob,
  unsaveJob,
  getSavedJobs,
  analyzeResume,
  getRecruiterProfile,
  updateRecruiterProfile,
  createJob,
  getRecruiterJobs,
  getJobApplications,
  updateApplicationStatus,
  getAdminDashboardStats,
  getAllStudents,
  getAllCompanies,
  verifyCompany,
  getPlacementReport,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
