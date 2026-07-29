import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/admin.css";

const AdminRegistrations = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const load = () => {
    setLoading(true);
    setLoadError("");
    api
      .get("/registrations")
      .then((res) => setRegs(res.data))
      .catch((err) => setLoadError(err.response?.data?.message || err.message || "Failed to load registrations"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleAttendance = async (reg) => {
    setActionError("");
    setBusyId(reg._id + "-attendance");
    try {
      await api.patch(`/registrations/${reg._id}/attendance`, { present: !reg.attended });
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to update attendance");
    } finally {
      setBusyId(null);
    }
  };

  const generateCertificate = async (reg) => {
    setActionError("");
    setBusyId(reg._id + "-cert");
    try {
      await api.post(`/registrations/${reg._id}/generate-certificate`);
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to generate certificate");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Registrations" subtitle="Mark attendance, then issue certificates" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="details-card">
            {loadError && <div className="login-error">⚠️ {loadError}</div>}
            {actionError && <div className="login-error">⚠️ {actionError}</div>}
            {loading ? (
              <p className="empty-text">Loading registrations…</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Attendance</th>
                    <th>Certificate</th>
                    <th>Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {regs.map((r) => (
                    <tr key={r._id}>
                      <td>{r.user?.name}<div className="empty-text">{r.user?.email}</div></td>
                      <td>{r.event?.title}</td>
                      <td><span className={`badge badge-${r.status?.toLowerCase()}`}>{r.status}</span></td>
                      <td>
                        <button
                          className={`btn attendance-btn ${r.attended ? "btn-primary" : ""}`}
                          onClick={() => toggleAttendance(r)}
                          disabled={busyId === r._id + "-attendance"}
                        >
                          {busyId === r._id + "-attendance" ? "Updating…" : r.attended ? "✔ Present" : "Mark Present"}
                        </button>
                      </td>
                      <td>
                        {r.certificateEarned ? (
                          <span className="badge badge-completed">✔ Issued</span>
                        ) : (
                          <button
                            className="btn cert-generate-btn"
                            onClick={() => generateCertificate(r)}
                            disabled={!r.attended || busyId === r._id + "-cert"}
                            title={!r.attended ? "Mark attendance present first" : "Generate certificate"}
                          >
                            {busyId === r._id + "-cert" ? "Generating…" : "🏆 Generate Certificate"}
                          </button>
                        )}
                      </td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {regs.length === 0 && <tr><td colSpan={6} className="empty-text">No registrations yet.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistrations;