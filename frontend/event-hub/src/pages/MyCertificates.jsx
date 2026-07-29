import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/certificates.css";

const CATEGORIES = ["All", "Conference", "Meeting", "Fest", "Training"];

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

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const MyCertificates = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const load = () => {
    setLoading(true);
    setLoadError("");
    api
      .get("/certificates/mine")
      .then((res) => setCerts(res.data))
      .catch((err) => setLoadError(err.response?.data?.message || err.message || "Failed to load certificates"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    return certs.filter((c) => {
      const matchCat = filter === "All" || c.event?.category === filter;
      const matchSearch =
        c.event?.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.certificateId.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [certs, filter, search]);

  const handlePreview = async (cert) => {
    setActionError("");
    setBusyId(cert._id + "-preview");
    try {
      const res = await api.get(`/certificates/${cert._id}/pdf`, { responseType: "blob" });
      openBlobInNewTab(res.data);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to open preview");
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (cert) => {
    setActionError("");
    setBusyId(cert._id + "-download");
    try {
      const res = await api.get(`/certificates/${cert._id}/pdf?download=1`, { responseType: "blob" });
      downloadBlob(res.data, `${cert.certificateId}.pdf`);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to download certificate");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="My Certificates" subtitle="Certificates earned from company events & training" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="cert-toolbar">
            <input
              type="text"
              placeholder="Search certificate or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-search cert-search"
            />
            <div className="cert-total">
              <span className="cert-total-value">{certs.length}</span>
              <span className="cert-total-label">Total Certificates</span>
            </div>
          </div>

          <div className="filter-chips" style={{ marginBottom: "1.4rem" }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`chip ${filter === c ? "active" : ""}`}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {loadError && <div className="login-error">⚠️ {loadError}</div>}
          {actionError && <div className="login-error">⚠️ {actionError}</div>}

          {loading ? (
            <p className="empty-text">Loading your certificates…</p>
          ) : filtered.length > 0 ? (
            <div className="cert-grid">
              {filtered.map((c) => (
                <div className="cert-card" key={c._id}>
                  <div className="cert-card-top">
                    <span className="cert-emoji">{CATEGORY_EMOJI[c.event?.category] || "🏅"}</span>
                    <span className="badge badge-active">✔ {c.status}</span>
                  </div>
                  <h3>{c.event?.title || "Event"}</h3>
                  <p className="cert-date">
                    📅 {new Date(c.issueDate).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                  <div className="cert-id-row">
                    <span className="cert-id-label">Certificate ID</span>
                    <span className="cert-id-value">{c.certificateId}</span>
                  </div>
                  <div className="cert-actions">
                    <button
                      className="btn cert-btn-preview"
                      onClick={() => handlePreview(c)}
                      disabled={busyId === c._id + "-preview"}
                    >
                      👁️ {busyId === c._id + "-preview" ? "Opening…" : "Preview"}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDownload(c)}
                      disabled={busyId === c._id + "-download"}
                    >
                      📥 {busyId === c._id + "-download" ? "Preparing…" : "Download PDF"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-block">
              <div className="empty-state-icon">🏆</div>
              <h3>No certificates yet</h3>
              <p>Attend a registered event and your admin will mark you present — your certificate will show up here automatically.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCertificates;