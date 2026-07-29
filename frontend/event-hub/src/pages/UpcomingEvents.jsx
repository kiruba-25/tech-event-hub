import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import api from "../api/axios";
import "../styles/dashboard.css";

const CATEGORIES = [
  { name: "All", icon: "✨" },
  { name: "Conference", icon: "🎤" },
  { name: "Meeting", icon: "🤝" },
  { name: "Fest", icon: "🎉" },
  { name: "Training", icon: "🎓" },
];

const SORT_OPTIONS = [
  { value: "soonest", label: "Date: Soonest first" },
  { value: "latest", label: "Date: Latest first" },
  { value: "az", label: "Name: A → Z" },
];

const SkeletonCard = () => (
  <div className="event-card skeleton-card">
    <div className="skeleton-banner" />
    <div className="event-body">
      <div className="skeleton-line w-70" />
      <div className="skeleton-line w-50" />
      <div className="skeleton-line w-40" />
      <div className="skeleton-btn" />
    </div>
  </div>
);

const UpcomingEvents = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) setSearch(q);
  }, [searchParams]);
  const [sort, setSort] = useState("soonest");

  useEffect(() => {
    api.get("/events").then((res) => {
      setEvents(res.data);
      setLoading(false);
    });
  }, []);

  const counts = useMemo(() => {
    const map = { All: events.length };
    events.forEach((ev) => { map[ev.category] = (map[ev.category] || 0) + 1; });
    return map;
  }, [events]);

  const thisWeekCount = useMemo(() => {
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 86400000);
    return events.filter((ev) => {
      const d = new Date(ev.date);
      return d >= now && d <= in7;
    }).length;
  }, [events]);

  const filtered = useMemo(() => {
    let list = events.filter((ev) => {
      const matchCat = filter === "All" || ev.category === filter;
      const matchSearch =
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        ev.location.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

    list = [...list].sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      const diff = new Date(a.date) - new Date(b.date);
      return sort === "latest" ? -diff : diff;
    });

    return list;
  }, [events, filter, search, sort]);

  const clearFilters = () => {
    setFilter("All");
    setSearch("");
  };

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Upcoming Events" subtitle="Browse and register for company events" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="events-hero">
            <div className="events-hero-text">
              <span className="events-hero-eyebrow">📅 Event Catalog</span>
              <h1>Find your next event</h1>
              <p>Conferences, meetings, fests and training — all in one place.</p>
            </div>
            <div className="events-hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">{events.length}</span>
                <span className="hero-stat-label">Total Events</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">{thisWeekCount}</span>
                <span className="hero-stat-label">This Week</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">{Object.keys(counts).length - 1}</span>
                <span className="hero-stat-label">Categories</span>
              </div>
            </div>
          </div>

          <div className="filter-bar filter-bar-modern">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by event name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="filter-search"
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search">✕</button>
              )}
            </div>

            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-chips filter-chips-modern">
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                className={`chip chip-modern ${filter === c.name ? "active" : ""}`}
                onClick={() => setFilter(c.name)}
              >
                <span>{c.icon}</span> {c.name}
                <span className="chip-count">{counts[c.name] || 0}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="events-grid">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="events-grid">
              {filtered.map((ev, i) => (
                <div className="card-fade-in" style={{ animationDelay: `${i * 60}ms` }} key={ev._id}>
                  <EventCard event={ev} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-block">
              <div className="empty-state-icon">🗂️</div>
              <h3>No events match your search</h3>
              <p>Try a different keyword or category.</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;