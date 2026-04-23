import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AssignedComplaints from "./AssignedComplaints";
import Feedbacks from "./Feedbacks";
import "./WorkerDashboard.css";

function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState("assignedComplaints");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("workerToken");
    if (!token) {
      navigate("/worker/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("workerToken");
    navigate("/login");
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="worker-dashboard">
      <header className="worker-header">
        <div className="worker-header-left">
          <h1 className="worker-logo">Worker Dashboard</h1>
        </div>
        <div className="worker-header-right">
          <button className="worker-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="worker-main">
        <div className="worker-tabs">
          <button
            className={`worker-tab ${activeTab === "assignedComplaints" ? "active" : ""}`}
            onClick={() => setActiveTab("assignedComplaints")}
          >
            Assigned Complaints
          </button>
          <button
            className={`worker-tab ${activeTab === "feedbacks" ? "active" : ""}`}
            onClick={() => setActiveTab("feedbacks")}
          >
            Feedbacks
          </button>
        </div>

        <div className="worker-content-card">
          {activeTab === "assignedComplaints" && <AssignedComplaints />}
          {activeTab === "feedbacks" && <Feedbacks />}
        </div>
      </main>
    </div>
  );
}

export default WorkerDashboard;
