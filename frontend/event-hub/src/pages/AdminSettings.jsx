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

const AdminSettings = () => {
  const { user, updateUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Notification Preferences (org-wide)
  const [notif, setNotif] = useState({
    notifyNewEvents: true,
    sendReminderEmails: true,
    notifyAdminOnLimitReached: true,
    notifyOnCertificateIssued: true,
  });

  // Theme (admin's own, personal)
  const [theme, setTheme] = useState("light");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    api
      .get("/settings/org")
      .then((res) => {
        if (res.data.notificationDefaults) setNotif(res.data.notificationDefaults);
      })
      .catch((err) => setLoadError(err.response?.data?.message || err.message || "Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.appearance?.theme) setTheme(user.appearance.theme);
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
      await api.put("/settings/org", { notificationDefaults: notif });
      const { data } = await api.put("/auth/preferences", { appearance: { ...user?.appearance, theme } });
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
            {loadError && <div className="login-error">⚠️ {loadError}</div>}
            {saved && <div className="login-success">Settings saved!</div>}
            {saveError && <div className="login-error">{saveError}</div>}

            {loading ? (
              <p className="empty-text">Loading settings…</p>
            ) : (
              <form onSubmit={handleSaveAll}>
                <div className="settings-card">
                  {/* Notification Preferences */}
                  <div className="settings-section">
                    <div className="settings-section-title">Notification Preferences</div>
                    <div className="settings-row">
                      <span className="settings-row-label">Notify employees about new events</span>
                      <Toggle checked={notif.notifyNewEvents} onChange={(v) => setNotif({ ...notif, notifyNewEvents: v })} />
                    </div>
                    <div className="settings-row">
                      <span className="settings-row-label">Send event reminder emails</span>
                      <Toggle checked={notif.sendReminderEmails} onChange={(v) => setNotif({ ...notif, sendReminderEmails: v })} />
                    </div>
                    <div className="settings-row">
                      <span className="settings-row-label">Alert admin at registration limit</span>
                      <Toggle checked={notif.notifyAdminOnLimitReached} onChange={(v) => setNotif({ ...notif, notifyAdminOnLimitReached: v })} />
                    </div>
                    <div className="settings-row">
                      <span className="settings-row-label">Notify on certificate issued</span>
                      <Toggle checked={notif.notifyOnCertificateIssued} onChange={(v) => setNotif({ ...notif, notifyOnCertificateIssued: v })} />
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;