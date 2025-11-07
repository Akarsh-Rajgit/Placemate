// src/components/Recruiter/PostJob.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../../utils/api";
import "./PostJob.css";

function PostJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    job_title: "",
    job_description: "",
    job_type: "Full-time",
    location: "",
    is_remote: false,
    salary_min: "",
    salary_max: "",
    currency: "INR",
    experience_required: "",
    required_skills: "",
    preferred_skills: "",
    qualifications: "",
    responsibilities: "",
    benefits: "",
    application_deadline: "",
    vacancies: 1,
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await createJob(formData);
      setMessage({ type: "success", text: "Job posted successfully!" });
      setTimeout(() => {
        navigate("/recruiter/jobs");
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to post job. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      <div className="post-job-header">
        <h1>Post a New Job</h1>
        <p>Fill in the details to create a new job posting</p>
      </div>

      {message.text && (
        <div
          className={
            message.type === "success" ? "success-message" : "error-message"
          }
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="post-job-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              required
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Job Type *</label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="form-group">
              <label>Number of Vacancies *</label>
              <input
                type="number"
                name="vacancies"
                value={formData.vacancies}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g. Bengaluru, Karnataka"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="is_remote"
                  checked={formData.is_remote}
                  onChange={handleChange}
                />
                <span>Remote Position</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              name="job_description"
              value={formData.job_description}
              onChange={handleChange}
              rows="6"
              required
              placeholder="Provide a detailed description of the job..."
            />
          </div>
        </div>

        {/* Compensation */}
        <div className="form-section">
          <h2>Compensation</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Minimum Salary (per annum)</label>
              <input
                type="number"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleChange}
                placeholder="e.g. 600000"
              />
            </div>

            <div className="form-group">
              <label>Maximum Salary (per annum)</label>
              <input
                type="number"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleChange}
                placeholder="e.g. 1000000"
              />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="form-section">
          <h2>Requirements</h2>

          <div className="form-group">
            <label>Experience Required</label>
            <input
              type="text"
              name="experience_required"
              value={formData.experience_required}
              onChange={handleChange}
              placeholder="e.g. 2-4 years"
            />
          </div>

          <div className="form-group">
            <label>Required Skills *</label>
            <textarea
              name="required_skills"
              value={formData.required_skills}
              onChange={handleChange}
              rows="3"
              required
              placeholder="List required skills separated by commas (e.g. JavaScript, React, Node.js)"
            />
          </div>

          <div className="form-group">
            <label>Preferred Skills</label>
            <textarea
              name="preferred_skills"
              value={formData.preferred_skills}
              onChange={handleChange}
              rows="3"
              placeholder="List preferred skills separated by commas"
            />
          </div>

          <div className="form-group">
            <label>Qualifications</label>
            <textarea
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              rows="4"
              placeholder="List educational and professional qualifications..."
            />
          </div>
        </div>

        {/* Responsibilities */}
        <div className="form-section">
          <h2>Job Details</h2>

          <div className="form-group">
            <label>Responsibilities</label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows="5"
              placeholder="Describe the key responsibilities..."
            />
          </div>

          <div className="form-group">
            <label>Benefits</label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              rows="4"
              placeholder="List the benefits and perks (e.g. Health Insurance, Flexible Hours, etc.)"
            />
          </div>
        </div>

        {/* Additional Settings */}
        <div className="form-section">
          <h2>Additional Settings</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Application Deadline</label>
              <input
                type="date"
                name="application_deadline"
                value={formData.application_deadline}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="form-group">
              <label>Job Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Posting..." : "Post Job"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/recruiter/jobs")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostJob;
