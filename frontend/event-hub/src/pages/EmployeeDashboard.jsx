import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [regs, setRegs] = useState([]);
  const [certCount, setCertCount] = useState(0);

  useEffect(() => {
    api.get("/events").then((res) => setEvents(res.data.slice(0, 4)));
    api.get("/registrations/mine").then((res) => setRegs(res.data));
    api.get("/certificates/mine").then((res) => setCertCount(res.data.length));
  }, []);

  const completedCount = regs.filter((r) => r.attended).length;

  const stats = [
    { label: "Upcoming Events", value: events.length, icon: "📅", color: "purple" },
    { label: "Registered Events", value: regs.length, icon: "📝", color: "blue" },
    { label: "Certificates Earned", value: certCount, icon: "🏆", color: "green", to: "/certificates" },
    { label: "Completed Events", value: completedCount, icon: "✅", color: "orange", to: "/completed-events" },
  ];

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar
          title={`Good Morning, ${user?.name?.split(" ")[0] || ""} 👋`}
          subtitle="Here's what's happening today"
          onMenuClick={() => setMenuOpen(true)}
        />
        <div className="page-content">
          <div className="stats-grid">
            {stats.map((s) => {
              const CardTag = s.to ? Link : "div";
              return (
                <CardTag
                  className={`stat-card stat-${s.color} ${s.to ? "stat-card-clickable" : ""}`}
                  key={s.label}
                  to={s.to}
                >
                  <div className="stat-info">
                    <span className="stat-value">{s.value}</span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                  <div className="stat-icon">{s.icon}</div>
                </CardTag>
              );
            })}
          </div>

          <div className="section-header">
            <h2>Upcoming Events</h2>
            <a href="#!">View All →</a>
          </div>

          <div className="events-grid">
            {events.map((ev) => (
              <EventCard event={ev} key={ev._id} />
            ))}
            {events.length === 0 && <p className="empty-text">No upcoming events yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;