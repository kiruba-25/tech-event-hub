import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";
import "../styles/profile.css";

// Resize + compress an image file client-side before turning it into a
// base64 data URL, so profile photos don't bloat the database or the request.
const fileToCompressedDataUrl = (file, maxSize = 300, quality = 0.85) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", department: "", phone: "", bio: "", avatar: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({ registered: 0, certificates: 0 });

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        department: user.department || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  useEffect(() => {
    api
      .get("/registrations/mine")
      .then((res) => setStats((s) => ({ ...s, registered: res.data.length })))
      .catch(() => {});
    api
      .get("/certificates/mine")
      .then((res) => setStats((s) => ({ ...s, certificates: res.data.length })))
      .catch(() => {});
  }, []);

  const handleAvatarPick = () => fileInputRef.current?.click();

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError("");
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image is too large (max 8MB)");
      return;
    }
    setUploadingPhoto(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setForm((f) => ({ ...f, avatar: dataUrl }));
      // Save the photo immediately so it doesn't get lost if the person
      // navigates away without clicking "Save Changes" further down the page.
      const { data } = await api.put("/auth/me", { ...form, avatar: dataUrl });
      updateUser(data);
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || "Could not upload that image");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadError("");
    setUploadingPhoto(true);
    try {
      setForm((f) => ({ ...f, avatar: "" }));
      const { data } = await api.put("/auth/me", { ...form, avatar: "" });
      updateUser(data);
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || "Could not remove photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { data } = await api.put("/auth/me", form);
      updateUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }
    setPwSaving(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(err.response?.data?.message || err.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "U";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Profile" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="profile-cover">
            <div className="profile-cover-content">
              <div className="avatar-upload-wrap">
                <div className="avatar-large">
                  {form.avatar ? <img src={form.avatar} alt={form.name} /> : <span>{initials}</span>}
                  {uploadingPhoto && <div className="avatar-loading-overlay">⏳</div>}
                </div>
                <button
                  type="button"
                  className="avatar-edit-btn"
                  onClick={handleAvatarPick}
                  title="Change photo"
                  disabled={uploadingPhoto}
                >
                  📷
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </div>
              <div className="profile-cover-text">
                <h1>{form.name || user?.name}</h1>
                <p>{user?.email}</p>
                <span className={`badge ${user?.role === "admin" ? "badge-training" : "badge-conference"}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            {form.avatar && (
              <button type="button" className="link-btn danger avatar-remove-link" onClick={handleRemoveAvatar}>
                Remove photo
              </button>
            )}
            {uploadError && <div className="login-error avatar-upload-error">{uploadError}</div>}
          </div>

          <div className="profile-stats-row">
            <div className="stat-card-simple">
              <span className="stat-label">Events Registered</span>
              <span className="stat-value">{stats.registered}</span>
            </div>
            <div className="stat-card-simple">
              <span className="stat-label">Certificates Earned</span>
              <span className="stat-value">{stats.certificates}</span>
            </div>
            <div className="stat-card-simple">
              <span className="stat-label">Member Since</span>
              <span className="stat-value stat-value-sm">{memberSince}</span>
            </div>
          </div>

          <div className="profile-grid">
            <div className="details-card">
              <h3>Personal Information</h3>
              {saved && <div className="login-success">Profile updated!</div>}
              {error && <div className="login-error">{error}</div>}
              <form onSubmit={handleSave} className="form-grid">
                <label>Full Name
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label>Department
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </label>
                <label>Phone
                  <input placeholder="+91 90000 00000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </label>
                <label>Email
                  <input value={user?.email || ""} disabled />
                </label>
                <label className="span-2">Bio
                  <textarea
                    rows="3"
                    placeholder="Tell your team a bit about yourself..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </label>
                <div className="modal-actions span-2">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            <div className="details-card">
              <h3>Change Password</h3>
              {pwSaved && <div className="login-success">Password updated!</div>}
              {pwError && <div className="login-error">{pwError}</div>}
              <form onSubmit={handlePasswordSave} className="form-grid">
                <label className="span-2">Current Password
                  <input
                    type="password"
                    required
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  />
                </label>
                <label>New Password
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  />
                </label>
                <label>Confirm New Password
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  />
                </label>
                <div className="modal-actions span-2">
                  <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                    {pwSaving ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;