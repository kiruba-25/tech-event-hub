import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const employeeLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/events", label: "Upcoming Events", icon: "📅" },
  { to: "/registrations", label: "My Registrations", icon: "📝" },
  { to: "/certificates", label: "My Certificates", icon: "🏆" },
  { to: "/announcements", label: "Announcements", icon: "📢" },
  { to: "/calendar", label: "Calendar", icon: "🗓️" },
  { to: "/profile", label: "Profile", icon: "👤" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

const adminLinks = [
  { to: "/admin", label: "Overview", icon: "📊" },
  { to: "/admin/events", label: "Events", icon: "📅" },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/departments", label: "Departments", icon: "🏢" },
  { to: "/admin/registrations", label: "Registrations", icon: "📝" },
  { to: "/admin/analytics", label: "Analytics", icon: "📈" },
  { to: "/admin/announcements", label: "Announcements", icon: "📢" },
  { to: "/profile", label: "Profile", icon: "👤" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️" },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === "admin" ? adminLinks : employeeLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-icon"><b>E</b></span> EVENTHUB
        </div>
        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
              onClick={onClose}
              end
            >
              <span className="sidebar-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>
          ⏻ Logout
        </button>
      </aside>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
    </>
  );
};

export default Sidebar;