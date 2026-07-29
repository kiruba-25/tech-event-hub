import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/settings.css";

const Toggle = ({ checked, onChange }) => (
  <label className="switch">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="switch-slider" />
  </label>
);

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Notification Preferences
  const [notif, setNotif] = useState({ newEvents: true, reminders: true, certificates: true, announcements: true });

  // Theme
  const [theme, setTheme] = useState("light");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.notificationPrefs) setNotif(user.notificationPrefs);
      if (user.appearance?.theme) setTheme(user.appearance.theme);
    }
  }, [user]);

  const applyTheme = (t) => document.documentElement.setAttribute("data-theme", t);

  const handleThemeChange = (t) => {
    setTheme(t);
    applyTheme(t); // instant preview
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const { data } = await api.put("/auth/preferences", {
        notificationPrefs: notif,
        appearance: { ...user?.appearance, theme },
      });
      updateUser(data);
      applyTheme(theme);
      localStorage.setItem("theme", theme);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Settings" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="settings-page">
            {saved && <div className="login-success">Settings saved!</div>}
            {saveError && <div className="login-error">{saveError}</div>}

            <form onSubmit={handleSaveAll}>
              <div className="settings-card">
                {/* Notification Preferences */}
                <div className="settings-section">
                  <div className="settings-section-title">Notification Preferences</div>
                  <div className="settings-row">
                    <span className="settings-row-label">New events</span>
                    <Toggle checked={notif.newEvents} onChange={(v) => setNotif({ ...notif, newEvents: v })} />
                  </div>
                  <div className="settings-row">
                    <span className="settings-row-label">Event reminders</span>
                    <Toggle checked={notif.reminders} onChange={(v) => setNotif({ ...notif, reminders: v })} />
                  </div>
                  <div className="settings-row">
                    <span className="settings-row-label">Certificate updates</span>
                    <Toggle checked={notif.certificates} onChange={(v) => setNotif({ ...notif, certificates: v })} />
                  </div>
                  <div className="settings-row">
                    <span className="settings-row-label">Company announcements</span>
                    <Toggle checked={notif.announcements} onChange={(v) => setNotif({ ...notif, announcements: v })} />
                  </div>
                </div>

                {/* Theme */}
                <div className="settings-section">
                  <div className="settings-section-title">Appearance</div>
                  <div className="settings-row">
                    <span className="settings-row-label">Theme</span>
                    <div className="theme-toggle">
                      <button type="button" className={theme === "light" ? "active" : ""} onClick={() => handleThemeChange("light")}>
                        ☀️ Light
                      </button>
                      <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => handleThemeChange("dark")}>
                        🌙 Dark
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Settings */}
                <div className="settings-save-bar">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving…" : "Save Settings"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;