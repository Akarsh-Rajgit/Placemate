// src/components/Admin/ManageCompanies.js
import React, { useState, useEffect } from "react";
import { getAllCompanies, verifyCompany } from "../../utils/api";
import "./ManageCompanies.css";

function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await getAllCompanies();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (companyId, isVerified) => {
    try {
      await verifyCompany(companyId, !isVerified);
      fetchCompanies();
    } catch (error) {
      console.error("Error verifying company:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading companies...</div>;
  }

  return (
    <div className="manage-companies-container">
      <h1>Manage Companies</h1>

      {companies.length > 0 ? (
        <div className="companies-table">
          <table>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Industry</th>
                <th>Jobs Posted</th>
                <th>Applications</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>{company.company_name}</td>
                  <td>{company.industry || "N/A"}</td>
                  <td>{company.total_jobs || 0}</td>
                  <td>{company.total_applications || 0}</td>
                  <td>
                    <span
                      className={`badge ${
                        company.is_verified ? "verified" : "unverified"
                      }`}
                    >
                      {company.is_verified ? "Verified" : "Not Verified"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        handleVerify(company.id, company.is_verified)
                      }
                      className="btn btn-secondary"
                    >
                      {company.is_verified ? "Unverify" : "Verify"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No companies found</h3>
        </div>
      )}
    </div>
  );
}

export default ManageCompanies;
