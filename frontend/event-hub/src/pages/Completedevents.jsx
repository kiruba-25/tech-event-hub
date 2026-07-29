import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/admin.css";
import "../styles/certificates.css";

const CATEGORY_EMOJI = {
  Conference: "🎤",
  Meeting: "🤝",
  Fest: "🎉",
  Training: "🎓",
};

const openBlobInNewTab = (blob) => {
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
};

const CompletedEvents = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [regs, setRegs] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const load = () => {
    setLoading(true);
    setLoadError("");
    Promise.all([api.get("/registrations/mine"), api.get("/certificates/mine")])
      .then(([regsRes, certsRes]) => {
        setRegs(regsRes.data.filter((r) => r.attended));
        setCerts(certsRes.data);
      })
      .catch((err) => setLoadError(err.response?.data?.message || err.message || "Failed to load completed events"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const certForEvent = (eventId) => certs.find((c) => c.event?._id === eventId);

  const handleViewCertificate = async (cert) => {
    setActionError("");
    setBusyId(cert._id);
    try {
      const res = await api.get(`/certificates/${cert._id}/pdf`, { responseType: "blob" });
      openBlobInNewTab(res.data);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to open certificate");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Completed Events" subtitle="Events you've attended, marked by an admin" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          {loadError && <div className="login-error">⚠️ {loadError}</div>}
          {actionError && <div className="login-error">⚠️ {actionError}</div>}

          {loading ? (
            <p className="empty-text">Loading…</p>
          ) : regs.length > 0 ? (
            <div className="cert-grid">
              {regs.map((r) => {
                const cert = r.event ? certForEvent(r.event._id) : null;
                return (
                  <div className="cert-card" key={r._id}>
                    <div className="cert-card-top">
                      <span className="cert-emoji">{CATEGORY_EMOJI[r.event?.category] || "✅"}</span>
                      <span className="badge badge-completed">✔ Completed</span>
                    </div>
                    <h3>{r.event?.title || "Event"}</h3>
                    <p className="cert-date">
                      📅 {r.event ? new Date(r.event.date).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" }) : "-"}
                    </p>
                    <p className="cert-date">📍 {r.event?.location}</p>

                    <div className="cert-actions" style={{ marginTop: "0.6rem" }}>
                      {cert ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleViewCertificate(cert)}
                          disabled={busyId === cert._id}
                        >
                          🏆 {busyId === cert._id ? "Opening…" : "View Certificate"}
                        </button>
                      ) : (
                        <span className="empty-text">Certificate not issued yet</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-block">
              <div className="empty-state-icon">✅</div>
              <h3>No completed events yet</h3>
              <p>Once an admin marks you present for an event you attended, it'll show up here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedEvents;