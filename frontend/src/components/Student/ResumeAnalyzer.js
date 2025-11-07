// src/components/Student/ResumeAnalyzer.js
import React, { useState } from "react";
import { analyzeResume } from "../../utils/api";
import "./ResumeAnalyzer.css";

function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!resumeText || !jobDescription) {
      alert("Please provide both resume text and job description");
      return;
    }

    setAnalyzing(true);
    try {
      const data = await analyzeResume(resumeText, jobDescription, null);
      setResults(data);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#4CAF50";
    if (score >= 60) return "#FF9800";
    return "#F44336";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    return "Needs Improvement";
  };

  return (
    <div className="resume-analyzer-container">
      <div className="analyzer-header">
        <h1>AI Resume Analyzer</h1>
        <p>Get instant ATS score and personalized feedback</p>
      </div>

      <div className="analyzer-content">
        <div className="analyzer-form-section">
          <form onSubmit={handleAnalyze} className="analyzer-form">
            <div className="form-group">
              <label>Your Resume Content</label>
              <textarea
                rows="12"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                required
              />
              <p className="helper-text">
                Copy and paste all text from your resume
              </p>
            </div>

            <div className="form-group">
              <label>Job Description</label>
              <textarea
                rows="12"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description you want to apply for..."
                required
              />
              <p className="helper-text">
                Copy the complete job description including requirements
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary analyze-btn"
              disabled={analyzing}
            >
              {analyzing ? "Analyzing..." : "🔍 Analyze Resume"}
            </button>
          </form>
        </div>

        {results && (
          <div className="results-section">
            <div className="score-card">
              <h2>ATS Score</h2>
              <div
                className="score-circle"
                style={{ borderColor: getScoreColor(results.ats_score) }}
              >
                <span
                  className="score-value"
                  style={{ color: getScoreColor(results.ats_score) }}
                >
                  {results.ats_score}%
                </span>
                <span className="score-label">
                  {getScoreLabel(results.ats_score)}
                </span>
              </div>
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{
                    width: `${results.ats_score}%`,
                    backgroundColor: getScoreColor(results.ats_score),
                  }}
                />
              </div>
            </div>

            <div className="analysis-card">
              <h3>✅ Matched Skills</h3>
              <div className="skills-container">
                {results.matched_skills && results.matched_skills.length > 0 ? (
                  <div className="skills-grid">
                    {results.matched_skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag matched">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">No matched skills found</p>
                )}
              </div>
            </div>

            <div className="analysis-card">
              <h3>❌ Missing Skills</h3>
              <div className="skills-container">
                {results.missing_skills && results.missing_skills.length > 0 ? (
                  <div className="skills-grid">
                    {results.missing_skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag missing">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">
                    Great! Your resume covers all key skills
                  </p>
                )}
              </div>
            </div>

            <div className="analysis-card">
              <h3>💡 Suggestions for Improvement</h3>
              <div className="suggestions-list">
                {results.suggestions && results.suggestions.length > 0 ? (
                  results.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="suggestion-item">
                      <span className="suggestion-icon">•</span>
                      <p>{suggestion}</p>
                    </div>
                  ))
                ) : (
                  <p className="empty-text">Your resume looks great!</p>
                )}
              </div>
            </div>

            <div className="analysis-card">
              <h3>📊 Keyword Match</h3>
              <div className="keyword-match">
                <div className="match-percentage">
                  <span className="percentage-value">
                    {results.keyword_match_percentage}%
                  </span>
                  <span className="percentage-label">Keywords Matched</span>
                </div>
                <div className="match-bar">
                  <div
                    className="match-fill"
                    style={{
                      width: `${results.keyword_match_percentage}%`,
                      backgroundColor: getScoreColor(
                        results.keyword_match_percentage
                      ),
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="action-card">
              <h3>🎯 Next Steps</h3>
              <ul className="next-steps-list">
                <li>Update your resume with the missing skills you possess</li>
                <li>
                  Use keywords from the job description naturally in your resume
                </li>
                <li>Highlight relevant achievements and experiences</li>
                <li>Keep your resume concise and well-formatted</li>
                <li>Proofread for grammar and spelling errors</li>
              </ul>
              <button
                onClick={() => {
                  setResults(null);
                  setResumeText("");
                  setJobDescription("");
                }}
                className="btn btn-secondary"
              >
                Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
