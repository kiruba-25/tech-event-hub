import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/admin.css";

const emptyForm = {
  title: "", category: "Conference", description: "", date: "", startTime: "", endTime: "", location: "", meetingLink: "",
};

const AdminEvents = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setLoadError("");
    api
      .get("/events")
      .then((res) => setEvents(res.data))
      .catch((err) => setLoadError(err.response?.data?.message || err.message || "Failed to load events"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (ev) => ev.title.toLowerCase().includes(q) || ev.location.toLowerCase().includes(q)
    );
  }, [events, search]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
    setError("");
  };

  const openEdit = (ev) => {
    setForm({
      title: ev.title,
      category: ev.category,
      description: ev.description || "",
      date: ev.date.slice(0, 10),
      startTime: ev.startTime,
      endTime: ev.endTime,
      location: ev.location,
      meetingLink: ev.meetingLink || "",
    });
    setEditingId(ev._id);
    setShowModal(true);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/events/${editingId}`, form);
      } else {
        await api.post("/events", form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete event");
    }
  };

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Manage Events" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="section-header">
            <h2>All Events</h2>
            <button className="btn btn-primary" onClick={openCreate}>+ New Event</button>
          </div>

          <input
            type="text"
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-search"
            style={{ marginBottom: "1rem", maxWidth: 320 }}
          />

          <div className="details-card">
            {loadError && <div className="login-error">⚠️ {loadError} — is the backend running on the expected port?</div>}
            {loading ? (
              <p className="empty-text">Loading events…</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th><th>Category</th><th>Date</th><th>Location</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((ev) => (
                    <tr key={ev._id}>
                      <td>{ev.title}</td>
                      <td><span className={`badge badge-${ev.category?.toLowerCase()}`}>{ev.category}</span></td>
                      <td>{new Date(ev.date).toLocaleDateString()}</td>
                      <td>{ev.location}</td>
                      <td className="row-actions">
                        <button className="link-btn" onClick={() => openEdit(ev)}>Edit</button>
                        <button className="link-btn danger" onClick={() => handleDelete(ev._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {filteredEvents.length === 0 && (
                    <tr><td colSpan={5} className="empty-text">{search ? "No events match your search." : "No events yet."}</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Edit Event" : "New Event"}</h3>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit} className="form-grid">
              <label>Title
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label>Category
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>Conference</option><option>Meeting</option><option>Fest</option><option>Training</option>
                </select>
              </label>
              <label className="span-2">Description
                <textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <label>Date
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </label>
              <label>Location
                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </label>
              <label>Start Time
                <input required placeholder="10:00 AM" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </label>
              <label>End Time
                <input required placeholder="05:00 PM" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </label>
              <label className="span-2">Meeting Link (optional)
                <input value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />
              </label>
              <div className="modal-actions span-2">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? "Save Changes" : "Create Event"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;