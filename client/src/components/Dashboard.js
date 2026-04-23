import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ComplaintForm from "./ComplaintForm";
import ComplaintHistory from "./ComplaintHistory";
import "./Dashboard.css";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("submit");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setIsLoggedIn(true);
      fetchStats();
    }
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const response = await api.get("/users/complaints");
      const complaints = response.data || [];
      setStats({
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending' || !c.status).length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => ['Resolved', 'Completed', 'Finished'].includes(c.status)).length,
      });

      // Also fetch user profile for name display
      const profileResponse = await api.get("/users/me");
      if (profileResponse.data && profileResponse.data.name) {
        setUserName(profileResponse.data.name);
      }
    } catch (error) {
      // Quietly handle error
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!isLoggedIn) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Top Navigation */}
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-left">
            <h1 className="brand-logo">
              <span className="logo-icon"></span>
              CampusCare
            </h1>
          </div>
          
          <nav className="header-nav">
            <button
              className={`nav-tab ${activeTab === "submit" ? "active" : ""}`}
              onClick={() => setActiveTab("submit")}
            >
              <span className="tab-icon">📝</span>
              <span className="tab-text">Submit Complaint</span>
            </button>
            <button
              className={`nav-tab ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <span className="tab-icon">📋</span>
              <span className="tab-text">My Complaints</span>
            </button>
          </nav>

          <div className="header-right">
            <div className="profile-section" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="profile-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="profile-name">{userName}</span>
              <span className="dropdown-arrow">▼</span>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Stats Cards */}
          <section className="stats-section">
            <div className="stats-grid">
              <div
                className="stat-card total"
                onClick={() => {
                  setActiveTab("history");
                  setHistoryStatusFilter("all");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon-wrapper">
                  <span>📊</span>
                </div>
                <div className="stat-info">
                  <h3>{loadingStats ? "..." : stats.total}</h3>
                  <p>Total Complaints</p>
                </div>
              </div>
              <div
                className="stat-card pending"
                onClick={() => {
                  setActiveTab("history");
                  setHistoryStatusFilter("pending");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon-wrapper">
                  <span>⏳</span>
                </div>
                <div className="stat-info">
                  <h3>{loadingStats ? "..." : stats.pending}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div
                className="stat-card progress"
                onClick={() => {
                  setActiveTab("history");
                  setHistoryStatusFilter("in progress");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon-wrapper">
                  <span>🔄</span>
                </div>
                <div className="stat-info">
                  <h3>{loadingStats ? "..." : stats.inProgress}</h3>
                  <p>In Progress</p>
                </div>
              </div>
              <div
                className="stat-card resolved"
                onClick={() => {
                  setActiveTab("history");
                  setHistoryStatusFilter("resolved");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon-wrapper">
                  <span>✅</span>
                </div>
                <div className="stat-info">
                  <h3>{loadingStats ? "..." : stats.resolved}</h3>
                  <p>Resolved</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tab Content */}
          <section className="content-section">
            {activeTab === "submit" && <ComplaintForm />}
            {activeTab === "history" && (
              <ComplaintHistory initialStatusFilter={historyStatusFilter} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
