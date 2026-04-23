import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import logo from "../assets/images/logo.png";

function Home() {
  const navigate = useNavigate();
  
  const handleComplaintClick = (e) => {
    const token = localStorage.getItem("token");
    if (!token) {
      e.preventDefault();
      navigate("/login");
    } else {
      navigate("/complaint-form");
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="home-logo" />
          </div>
          <h1 className="hero-title">CampusCare</h1>
          <p className="hero-subtitle">College Infrastructure Complaint Management System</p>
          <p className="hero-description">
            Your voice matters. Report issues, track complaints, and get them resolved quickly.
          </p>
         
          
          {/* CTA Buttons */}
          <div className="cta-buttons">
            <button onClick={handleComplaintClick} className="cta-button primary">
              <span className="button-icon">📝</span>
              Register a Complaint
            </button>
            <Link to="/login" className="cta-button secondary">
              <span className="button-icon">🔐</span>
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          <h2 className="features-title">Why Choose Our Portal?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Quick & Easy</h3>
              <p>Submit your complaint in minutes with our simple and intuitive interface.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>Monitor the status of your complaints in real-time from your dashboard.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Stay Updated</h3>
              <p>Receive notifications and updates about your complaint resolution.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Secure & Private</h3>
              <p>Your data is protected with industry-standard security measures.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="quick-actions-container">
          <h2>Get Started</h2>
          <div className="action-buttons">
            <Link to="/register" className="action-button">
              Create Account
            </Link>
            <Link to="/login" className="action-button outline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2025 CampusCare - College of Engineering Vadakara. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;

