import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/admin.css";

const AdminDepartments = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/users").then((res) => setUsers(res.data));
  }, []);

  const departments = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      const d = u.department || "General";
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [users]);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Departments" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="stats-grid admin-stats-grid">
            {departments.map((d) => (
              <div className="stat-card-simple" key={d.name}>
                <span className="stat-label">{d.name}</span>
                <span className="stat-value">{d.count}</span>
                <span className="empty-text">employee{d.count !== 1 ? "s" : ""}</span>
              </div>
            ))}
            {departments.length === 0 && <p className="empty-text">No department data yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDepartments;
