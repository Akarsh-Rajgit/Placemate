import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../styles/Table.css";

const Charts = ({ properties }) => {
  if (!properties || properties.length === 0) {
    return (
      <div className="charts-empty">No data available for visualization</div>
    );
  }

  // Price distribution by BHK
  const bhkData = properties
    .reduce((acc, prop) => {
      const bhk = prop.bhk || "Unknown";
      const existing = acc.find((item) => item.bhk === bhk);
      if (existing) {
        existing.avgPrice =
          (existing.avgPrice * existing.count + (prop.price || 0)) /
          (existing.count + 1);
        existing.count += 1;
      } else {
        acc.push({ bhk, avgPrice: prop.price || 0, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => a.bhk - b.bhk)
    .map((item) => ({
      bhk: `${item.bhk} BHK`,
      avgPrice: parseFloat((item.avgPrice / 100000).toFixed(2)), // Convert to lakhs
    }));

  // Properties by city
  const cityData = properties
    .reduce((acc, prop) => {
      const city = prop.city || "Unknown";
      const existing = acc.find((item) => item.city === city);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ city, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count);

  // Furnished vs Unfurnished
  const furnishedData = [
    {
      name: "Furnished",
      value: properties.filter((p) => p.is_furnished).length,
    },
    {
      name: "Unfurnished",
      value: properties.filter((p) => !p.is_furnished).length,
    },
  ];

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  return (
    <div className="charts-container">
      <h3 className="charts-title">Property Analytics</h3>

      <div className="charts-grid">
        {/* Average Price by BHK */}
        <div className="chart-card">
          <h4>Average Price by BHK (in Lakhs)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bhkData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bhk" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgPrice" fill="#8884d8" name="Avg Price (Lakhs)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Properties by City */}
        <div className="chart-card">
          <h4>Properties by City</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cityData}
                dataKey="value"
                nameKey="city"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {cityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Furnished Status */}
        <div className="chart-card">
          <h4>Furnished Status Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={furnishedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#82ca9d"
                label
              >
                {furnishedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
