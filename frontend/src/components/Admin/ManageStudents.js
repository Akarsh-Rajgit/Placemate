// src/components/Admin/ManageStudents.js
import React, { useState, useEffect } from "react";
import { getAllStudents } from "../../utils/api";
import "./ManageStudents.css";

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [search, department]);

  const fetchStudents = async () => {
    try {
      const data = await getAllStudents({ search, department });
      setStudents(data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="manage-students-container">
      <h1>Manage Students</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Filter by department..."
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="filter-input"
        />
      </div>

      {students.length > 0 ? (
        <div className="students-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Department</th>
                <th>CGPA</th>
                <th>Applications</th>
                <th>Offers</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    {student.first_name} {student.last_name}
                  </td>
                  <td>{student.roll_number}</td>
                  <td>{student.department}</td>
                  <td>{student.current_cgpa}</td>
                  <td>{student.total_applications || 0}</td>
                  <td>{student.offers_received || 0}</td>
                  <td>{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No students found</h3>
        </div>
      )}
    </div>
  );
}

export default ManageStudents;
