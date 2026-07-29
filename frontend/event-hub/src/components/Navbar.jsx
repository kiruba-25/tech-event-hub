import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const TYPE_ICON = {
  event: "📅",
  announcement: "📢",
  registration: "✅",
  system: "🔔",
};

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Navbar = ({ title, subtitle, onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "U";

  const [searchValue, setSearchValue] = useState("");

  const runSearch = () => {
    const query = searchValue.trim();
    const base = isAdmin ? "/admin/events" : "/events";
    navigate(query ? `${base}?search=${encodeURIComponent(query)}` : base);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") runSearch();
  };

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const loadNotifications = () => {
    setLoading(true);
    api
      .get("/notifications/mine")
      .then((res) => {
        setItems(res.data.items);
        setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setOpen((prev) => !prev);
  };

  const handleItemClick = async (n) => {
    if (!n.read) {
      try {
        await api.patch(`/notifications/${n._id}/read`);
        setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  return (
    <header className="navbar">
      <button className="menu-btn" onClick={onMenuClick} aria-label="Menu">
        ☰
      </button>
      <div className="navbar-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="navbar-right">
        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search events..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button className="navbar-search-btn" onClick={runSearch} aria-label="Search">
            🔍
          </button>
        </div>

        <div className="notif-wrap" ref={panelRef}>
          <button className="navbar-bell" onClick={handleBellClick} aria-label="Notifications">
            🔔
            {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>

          {open && (
            <div className="notif-panel">
              <div className="notif-panel-head">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button className="link-btn" onClick={handleMarkAllRead}>Mark all read</button>
                )}
              </div>
              <div className="notif-panel-list">
                {loading && <p className="empty-text notif-empty">Loading…</p>}
                {!loading && items.length === 0 && <p className="empty-text notif-empty">You're all caught up.</p>}
                {!loading &&
                  items.map((n) => (
                    <button key={n._id} className={`notif-item ${n.read ? "" : "unread"}`} onClick={() => handleItemClick(n)}>
                      <span className="notif-icon">{TYPE_ICON[n.type] || "🔔"}</span>
                      <span className="notif-body">
                        <span className="notif-title">{n.title}</span>
                        {n.message && <span className="notif-message">{n.message}</span>}
                        <span className="notif-time">{timeAgo(n.createdAt)}</span>
                      </span>
                      {!n.read && <span className="notif-dot" />}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <Link to="/profile" className="navbar-avatar" title={user?.name}>
          {user?.avatar ? <img src={user.avatar} alt={user.name} /> : initials}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;