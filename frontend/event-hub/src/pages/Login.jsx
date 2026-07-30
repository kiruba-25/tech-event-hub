import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";
import teamIllustration from "../assets/team-illustration.png";

const Login = () => {
  const [role, setRole] = useState("employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password, role);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  // Demo Employee Login
  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const user = await login(
        "demo.employee@example.com",
        "Demo@12345",
        "employee",
      );

      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <span className="brand-icon">
            <b>E</b>
          </span>
          <span className="brand-text">
            EVENT<span className="brand-accent">HUB</span>
          </span>
        </div>

        <h1>
          Make every
          <br />
          event <span className="highlight">meaningful.</span>
        </h1>
        <p>Conferences, Meetings, Fests, Workshops — all in one place.</p>

        <div className="login-badges">
          <span>🛡 Secure</span>
          <span>⚡ Fast</span>
          <span>✔ Smart</span>
        </div>

        <div className="illustration-wrap">
          <span className="deco diamond d1"></span>
          <span className="deco diamond d2"></span>
          <span className="deco diamond d3"></span>
          <span className="deco dot dt1"></span>
          <span className="deco dot dt2"></span>
          <div className="illustration-wrap">
            <img
              src={teamIllustration}
              alt="Team collaboration"
              className="illustration-svg"
            />
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back! 👋</h2>
          <p className="login-subtitle">Sign in to continue to Event Hub</p>

          <div className="role-toggle">
            <button
              type="button"
              className={role === "employee" ? "active" : ""}
              onClick={() => setRole("employee")}
            >
              <span className="toggle-icon">👤</span> Employee
            </button>
            <button
              type="button"
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
            >
              <span className="toggle-icon">👥</span> HR / Event Team
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>Work Email</label>
            <div className="input-with-icon">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="label-row">
              <label>Password</label>
            </div>
            <div className="input-with-icon">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <input
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="checkbox-row">
              <label className="checkbox">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#!" className="forgot-link">
                Forgot?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
          {/* DEMO LOGIN */}
          <div className="demo-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="btn btn-demo btn-block"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "🚀 Login as Demo Employee"}
          </button>
          <p className="demo-info">
            Explore the Employee Dashboard using a demo account
          </p>
          <p className="login-footer">
            Don't have an account?{" "}
            <a href="#!" className="signup-link">
              Contact HR
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
