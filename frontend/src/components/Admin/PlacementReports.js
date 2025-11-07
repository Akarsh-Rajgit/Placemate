// src/components/Admin/PlacementReports.js
import React, { useState, useEffect } from "react";
import { getPlacementReport } from "../../utils/api";
import "./PlacementReports.css";

function PlacementReports() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [year]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await getPlacementReport(year);
      setReport(data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading report...</div>;
  }

  return (
    <div className="placement-reports-container">
      <h1>Placement Reports</h1>

      <div className="year-selector">
        <label>Select Year:</label>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {Array.from(
            { length: 5 },
            (_, i) => new Date().getFullYear() - i
          ).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {report && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{report.stats?.total_students || 0}</h3>
              <p>Total Students</p>
            </div>
            <div className="stat-card">
              <h3>{report.stats?.placed_students || 0}</h3>
              <p>Placed Students</p>
            </div>
            <div className="stat-card">
              <h3>
                {report.stats?.avg_package
                  ? `₹${(report.stats.avg_package / 100000).toFixed(2)}L`
                  : "N/A"}
              </h3>
              <p>Average Package</p>
            </div>
            <div className="stat-card">
              <h3>
                {report.stats?.highest_package
                  ? `₹${(report.stats.highest_package / 100000).toFixed(2)}L`
                  : "N/A"}
              </h3>
              <p>Highest Package</p>
            </div>
          </div>

          {report.department_wise && report.department_wise.length > 0 && (
            <div className="section">
              <h2>Department-wise Placement</h2>
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total Students</th>
                    <th>Placed Students</th>
                    <th>Placement %</th>
                  </tr>
                </thead>
                <tbody>
                  {report.department_wise.map((dept, idx) => (
                    <tr key={idx}>
                      <td>{dept.department}</td>
                      <td>{dept.total_students}</td>
                      <td>{dept.placed_students}</td>
                      <td>
                        {(
                          (dept.placed_students / dept.total_students) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {report.top_companies && report.top_companies.length > 0 && (
            <div className="section">
              <h2>Top Recruiting Companies</h2>
              <table>
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Total Offers</th>
                  </tr>
                </thead>
                <tbody>
                  {report.top_companies.map((company, idx) => (
                    <tr key={idx}>
                      <td>{company.company_name}</td>
                      <td>{company.total_offers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PlacementReports;
