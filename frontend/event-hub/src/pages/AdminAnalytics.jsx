import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { LineChart, DonutChart } from "../components/Charts";
import api from "../api/axios";
import "../styles/admin.css";

const CATEGORY_COLORS = { Conference: "#6d28d9", Meeting: "#2563eb", Fest: "#f97316", Training: "#16a34a" };
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const AdminAnalytics = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [monthly, setMonthly] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/users/stats/monthly").then((res) => setMonthly(res.data));
    api.get("/users/stats/overview").then((res) => setStats(res.data));
  }, []);

  const donutData = (stats?.byCategory || []).map((c) => ({
    label: c._id, value: c.count, color: CATEGORY_COLORS[c._id] || "#94a3b8",
  }));

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Analytics" subtitle="Org-wide event & engagement insights" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="details-card" style={{ marginBottom: "1.2rem" }}>
            <h3>Events vs Registrations (This Year)</h3>
            {monthly ? (
              <LineChart
                labels={MONTH_LABELS}
                series={[
                  { name: "Events", data: monthly.events, color: "#6d28d9" },
                  { name: "Registrations", data: monthly.registrations, color: "#2563eb" },
                ]}
                height={280}
              />
            ) : <p className="empty-text">Loading…</p>}
          </div>

          <div className="admin-grid">
            <div className="details-card">
              <h3>Category Breakdown</h3>
              {donutData.length ? <DonutChart data={donutData} /> : <p className="empty-text">No data yet.</p>}
            </div>
            <div className="details-card">
              <h3>Quick Facts</h3>
              <ul className="legend-list">
                <li><span className="dot" style={{ background: "#6d28d9" }} /> Total Events: {stats?.totalEvents ?? "-"}</li>
                <li><span className="dot" style={{ background: "#2563eb" }} /> Total Registrations: {stats?.totalRegistrations ?? "-"}</li>
                <li><span className="dot" style={{ background: "#16a34a" }} /> Active Events: {stats?.activeEvents ?? "-"}</li>
                <li><span className="dot" style={{ background: "#f97316" }} /> Total Employees: {stats?.totalEmployees ?? "-"}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
