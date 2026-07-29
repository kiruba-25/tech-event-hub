import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/admin.css";

const emptyForm = { name: "", email: "", password: "", role: "employee", department: "General" };

const AdminUsers = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setLoadError("");
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => setLoadError(err.response?.data?.message || err.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", form);
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete user");
    }
  };

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-panel">
        <Navbar title="Users" onMenuClick={() => setMenuOpen(true)} />
        <div className="page-content">
          <div className="section-header">
            <h2>All Users</h2>
            <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setError(""); setShowModal(true); }}>+ Add User</button>
          </div>

          <div className="details-card">
            {loadError && <div className="login-error">⚠️ {loadError} — is the backend running on the expected port?</div>}
            {loading ? (
              <p className="empty-text">Loading users…</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`badge ${u.role === "admin" ? "badge-training" : "badge-conference"}`}>{u.role}</span></td>
                      <td>{u.department}</td>
                      <td className="row-actions">
                        <button className="link-btn danger" onClick={() => handleDelete(u._id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={5} className="empty-text">No users yet.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add User</h3>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit} className="form-grid">
              <label>Name
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>Email
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label>Password
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </label>
              <label>Role
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="span-2">Department
                <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </label>
              <div className="modal-actions span-2">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;