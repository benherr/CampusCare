import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name || !email || !password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/users/register", {
        name,
        email,
        password,
      });

      setSuccessMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-left">
          <div className="register-content">
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">Join us and start reporting complaints</p>
            
            <form onSubmit={handleRegister} className="register-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}

              <button type="submit" className="register-button" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="register-footer">
              <p>
                Already have an account? <Link to="/login" className="link">Login here</Link>
              </p>
              <Link to="/" className="back-home">← Back to Home</Link>
            </div>
          </div>
        </div>
        <div className="register-right">
          <div className="register-image-overlay">
            <div className="image-content">
              <h2>Join Our Community</h2>
              <p>Register now and help us improve by reporting issues and concerns.</p>
              <div className="benefits-list">
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Track your complaints</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Get quick responses</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Stay updated on progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
