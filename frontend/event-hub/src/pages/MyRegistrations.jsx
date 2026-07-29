import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/admin.css";

const MyRegistrations = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = () => {
    setLoading(true);
    setLoadError("");
    api
      .get("/registrations/mine")
      .then((res) => setRegs(res.data))
      .catch((err) => setLoadError(err.response?.data?.message || err.message || "Failed to load registrations"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCancel = async (eventId) => {
    try {
      await api.delete(`/registrations/${eventId}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to cancel registration");
    }
  };

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="My Registrations" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="details-card">
            {loadError && <div className="login-error">⚠️ {loadError} — is the backend running on the expected port?</div>}
            {loading ? (
              <p className="empty-text">Loading your registrations…</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Event</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {regs.map((r) => (
                    <tr key={r._id}>
                      <td>
                        {r.event ? (
                          <Link to={`/events/${r.event._id}`}>{r.event.title}</Link>
                        ) : (
                          <span className="empty-text">Event removed</span>
                        )}
                      </td>
                      <td>{r.event ? new Date(r.event.date).toLocaleDateString() : "-"}</td>
                      <td><span className={`badge badge-${r.status?.toLowerCase()}`}>{r.status}</span></td>
                      <td className="row-actions">
                        {r.event && (
                          <button className="link-btn danger" onClick={() => handleCancel(r.event._id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {regs.length === 0 && <tr><td colSpan={4} className="empty-text">You haven't registered for any events yet.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRegistrations;