import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { LineChart, DonutChart } from "../components/Charts";
import api from "../api/axios";
import "../styles/admin.css";

const CATEGORY_COLORS = {
  Conference: "#6d28d9",
  Meeting: "#2563eb",
  Fest: "#f97316",
  Training: "#16a34a",
};

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const AdminDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/users/stats/overview").then((res) => setStats(res.data));
    api.get("/users/stats/monthly").then((res) => setMonthly(res.data));
    api.get("/events").then((res) => setEvents(res.data.slice(0, 5)));
  }, []);

  const cards = stats
    ? [
        { label: "Total Employees", value: stats.totalEmployees },
        { label: "Active Events", value: stats.activeEvents },
        { label: "Total Registrations", value: stats.totalRegistrations },
        { label: "Total Events", value: stats.totalEvents },
      ]
    : [];

  const donutData = (stats?.byCategory || []).map((c) => ({
    label: c._id,
    value: c.count,
    color: CATEGORY_COLORS[c._id] || "#94a3b8",
  }));

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Admin Dashboard" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="stats-grid admin-stats-grid">
            {cards.map((c) => (
              <div className="stat-card-simple" key={c.label}>
                <span className="stat-label">{c.label}</span>
                <span className="stat-value">{c.value}</span>
              </div>
            ))}
          </div>

          <div className="admin-grid">
            <div className="details-card">
              <div className="chart-card-head">
                <h3>Events Overview</h3>
                <div className="chart-legend-inline">
                  <span><i style={{ background: "#6d28d9" }} /> Events</span>
                  <span><i style={{ background: "#2563eb" }} /> Registrations</span>
                </div>
              </div>
              {monthly ? (
                <LineChart
                  labels={MONTH_LABELS}
                  series={[
                    { name: "Events", data: monthly.events, color: "#6d28d9" },
                    { name: "Registrations", data: monthly.registrations, color: "#2563eb" },
                  ]}
                />
              ) : (
                <p className="empty-text">Loading chart…</p>
              )}
            </div>

            <div className="details-card">
              <h3>Top Event Categories</h3>
              {donutData.length > 0 ? (
                <DonutChart data={donutData} />
              ) : (
                <p className="empty-text">No data yet.</p>
              )}
            </div>
          </div>

          <div className="details-card" style={{ marginTop: "1.2rem" }}>
            <h3>Recent Events</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev._id}>
                    <td>{ev.title}</td>
                    <td><span className={`badge badge-${ev.category?.toLowerCase()}`}>{ev.category}</span></td>
                    <td>{new Date(ev.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={3} className="empty-text">No events yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;