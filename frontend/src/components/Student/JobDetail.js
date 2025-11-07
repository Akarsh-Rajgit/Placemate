// src/components/Student/JobDetail.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobDetail, applyForJob, saveJob, unsaveJob } from "../../utils/api";
import "./JobDetail.css";

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      const data = await getJobDetail(id);
      setJob(data.job);
    } catch (error) {
      console.error("Error fetching job detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);

    try {
      await applyForJob(id, coverLetter, resumeUrl);
      setMessage({
        type: "success",
        text: "Application submitted successfully!",
      });
      setShowApplyModal(false);
      setTimeout(() => {
        navigate("/student/applications");
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to submit application",
      });
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    try {
      if (isSaved) {
        await unsaveJob(id);
        setIsSaved(false);
        setMessage({ type: "success", text: "Job removed from saved" });
      } else {
        await saveJob(id);
        setIsSaved(true);
        setMessage({ type: "success", text: "Job saved successfully!" });
      }
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save job" });
    }
  };

  const formatSalary = (min, max, currency) => {
    if (!min) return "Not disclosed";
    const formatted = `${currency} ${(min / 100000).toFixed(1)}L`;
    if (max && max !== min) {
      return `${formatted} - ${(max / 100000).toFixed(1)}L`;
    }
    return formatted;
  };

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (!job) {
    return <div className="error-state">Job not found</div>;
  }

  return (
    <div className="job-detail-container">
      {message.text && (
        <div
          className={
            message.type === "success" ? "success-message" : "error-message"
          }
        >
          {message.text}
        </div>
      )}

      <div className="job-detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back to Jobs
        </button>
      </div>

      <div className="job-detail-content">
        <div className="job-main-info">
          <div className="job-header-section">
            <img
              src={job.company_logo || "/default-company.png"}
              alt={job.company_name}
              className="company-logo-large"
            />
            <div className="job-title-section">
              <h1>{job.job_title}</h1>
              <h2>{job.company_name}</h2>
              <div className="job-meta-tags">
                <span className="meta-tag">📍 {job.location}</span>
                {job.is_remote && (
                  <span className="meta-tag remote">🏠 Remote</span>
                )}
                <span className="meta-tag">💼 {job.job_type}</span>
                <span className="meta-tag">
                  📅 Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="job-actions-bar">
            <button
              onClick={() => setShowApplyModal(true)}
              className="btn btn-primary apply-btn"
            >
              Apply Now
            </button>
            <button
              onClick={handleSaveJob}
              className={`btn save-job-btn ${isSaved ? "saved" : ""}`}
            >
              {isSaved ? "❤️ Saved" : "🤍 Save Job"}
            </button>
          </div>

          <div className="job-section">
            <h3>Job Description</h3>
            <p className="job-description">{job.job_description}</p>
          </div>

          {job.responsibilities && (
            <div className="job-section">
              <h3>Responsibilities</h3>
              <p className="job-text">{job.responsibilities}</p>
            </div>
          )}

          {job.qualifications && (
            <div className="job-section">
              <h3>Qualifications</h3>
              <p className="job-text">{job.qualifications}</p>
            </div>
          )}

          {job.required_skills && (
            <div className="job-section">
              <h3>Required Skills</h3>
              <div className="skills-list">
                {job.required_skills.split(",").map((skill, idx) => (
                  <span key={idx} className="skill-badge">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.preferred_skills && (
            <div className="job-section">
              <h3>Preferred Skills</h3>
              <div className="skills-list">
                {job.preferred_skills.split(",").map((skill, idx) => (
                  <span key={idx} className="skill-badge secondary">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.benefits && (
            <div className="job-section">
              <h3>Benefits</h3>
              <p className="job-text">{job.benefits}</p>
            </div>
          )}
        </div>

        <div className="job-sidebar">
          <div className="sidebar-card">
            <h3>Job Overview</h3>
            <div className="overview-item">
              <span className="overview-label">Job Type</span>
              <span className="overview-value">{job.job_type}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Experience</span>
              <span className="overview-value">
                {job.experience_required || "Not specified"}
              </span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Salary</span>
              <span className="overview-value salary">
                {formatSalary(job.salary_min, job.salary_max, job.currency)}
              </span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Vacancies</span>
              <span className="overview-value">{job.vacancies}</span>
            </div>
            {job.application_deadline && (
              <div className="overview-item">
                <span className="overview-label">Deadline</span>
                <span className="overview-value">
                  {new Date(job.application_deadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="sidebar-card">
            <h3>About {job.company_name}</h3>
            <p className="company-description">
              {job.company_description || "No description available"}
            </p>
            {job.website && (
              <a
                href={job.website}
                target="_blank"
                rel="noopener noreferrer"
                className="company-website"
              >
                Visit Website →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply for {job.job_title}</h2>
              <button
                onClick={() => setShowApplyModal(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label>Resume URL</label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="Link to your resume"
                  required
                />
              </div>
              <div className="form-group">
                <label>Cover Letter</label>
                <textarea
                  rows="8"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're a great fit for this role..."
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={applying}
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetail;
