import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

const Announcements = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", audience: "All" });
  const [formError, setFormError] = useState("");

  const load = () => {
    setLoading(true);
    setLoadError("");
    api
      .get("/announcements")
      .then((res) => setItems(res.data))
      .catch((err) => setLoadError(err.response?.data?.message || err.message || "Failed to load announcements"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await api.post("/announcements", form);
      setForm({ title: "", message: "", audience: "All" });
      setShowModal(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "Failed to post announcement");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete announcement");
    }
  };

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Announcements" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          {isAdmin && (
            <div className="section-header">
              <h2>Company Announcements</h2>
              <button
                className="btn btn-primary"
                onClick={() => { setForm({ title: "", message: "", audience: "All" }); setFormError(""); setShowModal(true); }}
              >
                + New Announcement
              </button>
            </div>
          )}

          {loadError && <div className="login-error">⚠️ {loadError} — is the backend running on the expected port?</div>}

          {loading ? (
            <p className="empty-text">Loading announcements…</p>
          ) : (
            <div className="announcement-list">
              {items.map((a) => (
                <div className="details-card announcement-item" key={a._id}>
                  <div className="announcement-head">
                    <h3>{a.title}</h3>
                    <span className="badge badge-conference">{a.audience}</span>
                  </div>
                  <p>{a.message}</p>
                  <div className="announcement-meta">
                    <span>By {a.createdBy?.name || "Admin"} · {new Date(a.createdAt).toLocaleDateString()}</span>
                    {isAdmin && <button className="link-btn danger" onClick={() => handleDelete(a._id)}>Delete</button>}
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="empty-text">No announcements yet.</p>}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>New Announcement</h3>
            {formError && <div className="login-error">{formError}</div>}
            <form onSubmit={handleSubmit} className="form-grid">
              <label className="span-2">Title
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label className="span-2">Message
                <textarea rows="3" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </label>
              <label>Audience
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                  <option>All</option><option>Engineering</option><option>HR</option><option>Sales</option><option>Design</option><option>Operations</option>
                </select>
              </label>
              <div className="modal-actions span-2">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;