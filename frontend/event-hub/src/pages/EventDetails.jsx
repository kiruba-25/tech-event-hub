import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/eventdetails.css";

const tabs = ["Overview", "Agenda", "Speakers", "Participants", "Resources"];

const EventDetails = () => {
  const { id } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState("Overview");
  const [registered, setRegistered] = useState(false);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoadError("");
    api
      .get(`/events/${id}`)
      .then((res) => {
        setData(res.data);
        setRegistered(!!res.data.registration);
      })
      .catch((err) => setLoadError(err.response?.data?.message || err.message || "Failed to load event"));
  };

  useEffect(load, [id]);

  const toggleRegister = async () => {
    setActionError("");
    setBusy(true);
    try {
      if (registered) {
        await api.delete(`/registrations/${id}`);
      } else {
        await api.post(`/registrations/${id}`);
      }
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <div className="app-shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="main-panel">
          <Navbar title="Event Details" onMenuClick={() => setMenuOpen(true)} />
          <div className="page-content">
            <div className="login-error">⚠️ {loadError} — is the backend running on the expected port?</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="main-panel">
          <Navbar title="Event Details" onMenuClick={() => setMenuOpen(true)} />
          <div className="page-content">
            <p className="empty-text">Loading event…</p>
          </div>
        </div>
      </div>
    );
  }

  const { event } = data;
  const date = new Date(event.date);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Event Details" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="event-hero">
            <span className="event-hero-tag">{event.category}</span>
            <h1>{event.title}</h1>
            <p>{event.description || "Explore the future of Web Development"}</p>
            <div className="event-hero-meta">
              <span>📅 {date.toLocaleDateString()}</span>
              <span>🕐 {event.startTime} - {event.endTime}</span>
              <span>📍 {event.location}</span>
            </div>
          </div>

          <div className="tabs">
            {tabs.map((t) => (
              <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {tab === "Overview" && (
            <div className="details-grid">
              <div className="details-card">
                <h3>About the Event</h3>
                <p>{event.description || "Join industry experts and developers for a full-day conference."}</p>
                <ul className="check-list">
                  {(event.highlights?.length ? event.highlights : ["Hands-on Sessions", "Expert Talks", "Networking", "Certificate Provided"]).map((h) => (
                    <li key={h}>✔ {h}</li>
                  ))}
                </ul>
              </div>
              <div className="details-card">
                <h3>Meeting Link</h3>
                {event.meetingLink ? (
                  <a href={event.meetingLink} className="btn btn-primary btn-block" target="_blank" rel="noreferrer">
                    Join Online
                  </a>
                ) : (
                  <p className="empty-text">No online link provided.</p>
                )}
                <h3 style={{ marginTop: "1.5rem" }}>Registration</h3>
                {actionError && <div className="login-error">{actionError}</div>}
                <button
                  className={`btn btn-block ${registered ? "btn-danger" : "btn-primary"}`}
                  onClick={toggleRegister}
                  disabled={busy}
                >
                  {busy ? "Please wait…" : registered ? "Cancel Registration" : "Register Now"}
                </button>
              </div>
            </div>
          )}

          {tab !== "Overview" && (
            <div className="details-card">
              <p className="empty-text">{tab} content coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;