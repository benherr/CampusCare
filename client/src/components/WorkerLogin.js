import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function WorkerLogin() {
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

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await axios.post("http://localhost:5000/api/worker/login", {
        email: normalizedEmail,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("workerToken", response.data.token);
        setSuccessMessage("Login successful! Redirecting to Worker Dashboard...");
        setTimeout(() => {
          navigate("/worker/dashboard");
        }, 1000);
      } else {
        setError("Login unsuccessful. Please check your credentials.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-content">
            <h1 className="login-title">Worker Login</h1>
            <p className="login-subtitle">Sign in with your worker account</p>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="worker-email">Email Address</label>
                <input
                  type="email"
                  id="worker-email"
                  placeholder="Enter your worker email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="worker-password">Password</label>
                <input
                  type="password"
                  id="worker-password"
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
                {loading ? "Signing in..." : "Sign In as Worker"}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Not a worker?{" "}
                <Link to="/login" className="link">
                  Login as student/admin
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
              <h2>Welcome, Worker</h2>
              <p>View your assigned complaints and update their status easily.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerLogin;
