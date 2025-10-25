import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Table.css";

const Table = ({ data, columns, onEdit, onDelete, loading, emptyMessage }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>{emptyMessage || "No data available"}</p>
      </div>
    );
  }

  const handleRowClick = (row) => {
    if (row.id) {
      navigate(`/properties/${row.id}`);
    }
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className || ""}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              className="table-row"
              onClick={() => handleRowClick(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={col.className || ""}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
