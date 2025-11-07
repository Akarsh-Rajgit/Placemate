// src/components/Recruiter/RecruiterProfile.js
import React, { useState, useEffect } from "react";
import { getRecruiterProfile, updateRecruiterProfile } from "../../utils/api";
import "./RecruiterProfile.css";

function RecruiterProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getRecruiterProfile();
      setProfile(data.profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateRecruiterProfile(profile);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setEditing(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile" });
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="recruiter-profile-container">
      <div className="profile-header">
        <h1>Company Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn btn-primary">
            Edit Profile
          </button>
        )}
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

      <form onSubmit={handleSave} className="profile-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="company_name"
              value={profile?.company_name || ""}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
          <div className="form-group">
            <label>Industry</label>
            <input
              type="text"
              name="industry"
              value={profile?.industry || ""}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
          <div className="form-group">
            <label>Company Size</label>
            <input
              type="text"
              name="company_size"
              value={profile?.company_size || ""}
              onChange={handleInputChange}
              disabled={!editing}
              placeholder="e.g., 50-200 employees"
            />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={profile?.website || ""}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Company Description</label>
          <textarea
            name="description"
            rows="4"
            value={profile?.description || ""}
            onChange={handleInputChange}
            disabled={!editing}
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Headquarters Location</label>
            <input
              type="text"
              name="headquarters_location"
              value={profile?.headquarters_location || ""}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
          <div className="form-group">
            <label>Contact Person</label>
            <input
              type="text"
              name="contact_person_name"
              value={profile?.contact_person_name || ""}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
          <div className="form-group">
            <label>Contact Phone</label>
            <input
              type="tel"
              name="contact_phone"
              value={profile?.contact_phone || ""}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
          <div className="form-group">
            <label>LinkedIn URL</label>
            <input
              type="url"
              name="linkedin_url"
              value={profile?.linkedin_url || ""}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
        </div>

        {editing && (
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default RecruiterProfile;
