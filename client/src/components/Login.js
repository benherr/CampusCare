import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check if admin credentials
      if (email.trim().toLowerCase() === "admin@gmail.com" && password === "admin") {
        const response = await axios.post("http://localhost:5000/api/admin/login", {
          username: "admin",
          password: "admin",
        });

        localStorage.setItem("adminToken", response.data.token);
        setSuccessMessage("Admin login successful! Redirecting to Admin Dashboard...");

        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      } else {
        // Regular user login only
        const response = await axios.post("http://localhost:5000/api/users/login", {
          email,
          password,
        });

        localStorage.setItem("token", response.data.token);
        setSuccessMessage("Login successful! Redirecting to Dashboard...");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-content">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your account to continue</p>
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="link">
                  Register here
                </Link>
              </p>
              <p style={{ marginTop: "8px" }}>
                Are you a worker?{" "}
                <Link to="/worker/login" className="link">
                  Login as worker
                </Link>
              </p>
              <Link to="/" className="back-home">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
        <div className="login-right">
          <div className="login-image-overlay">
            <div className="image-content">
              <h2>CampusCare</h2>
              <p>Your voice matters. Report issues and get them resolved quickly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
