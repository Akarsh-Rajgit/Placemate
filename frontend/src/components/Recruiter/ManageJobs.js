// src/components/Recruiter/ManageJobs.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecruiterJobs } from '../../utils/api';
import './ManageJobs.css';

function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await getRecruiterJobs();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === filter);

  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }

  return (
    <div className="manage-jobs-container">
      <div className="manage-jobs-header">
        <h1>Manage Jobs</h1>
        <Link to="/recruiter/post-job" className="btn btn-primary">
          + Post New Job
        </Link>
      </div>

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({jobs.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({jobs.filter(j => j.status === 'active').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}
          onClick={() => setFilter('closed')}
        >
          Closed ({jobs.filter(j => j.status === 'closed').length})
        </button>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="jobs-list">
          {filteredJobs.map((job) => (
            <div key={job.id} className="job-item">
              <div className="job-main">
                <h3>{job.job_title}</h3>
                <div className="job-meta">
                  <span>{job.job_type}</span>
                  <span>📍 {job.location}</span>
                  <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="job-stats">
                <div className="stat">
                  <span className="stat-value">{job.application_count || 0}</span>
                  <span className="stat-label">Applications</span>
                </div>
              </div>
              <div className="job-actions">
                <span className={`status-badge ${job.status}`}>{job.status}</span>
                <Link 
                  to={`/recruiter/jobs/${job.id}/applications`} 
                  className="btn btn-secondary"
                >
                  View Applications
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No jobs found</h3>
          <Link to="/recruiter/post-job" className="btn btn-primary">
            Post Your First Job
          </Link>
        </div>
      )}
    </div>
  );
}

export default ManageJobs;

