import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import "./ComplaintDetails.css";

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { error: showError } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchComplaintDetails();
  }, [id, navigate]);

  const fetchComplaintDetails = async () => {
    try {
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load complaint details");
      showError("Could not fetch complaint details");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    const s = (status || "Pending").toLowerCase();
    if (s === "resolved" || s === "completed") return "status-resolved";
    if (s === "in progress") return "status-progress";
    return "status-pending";
  };

  const getMediaUrl = (mediaPath) => {
    if (!mediaPath) return null;
    const normalizedPath = mediaPath.replace(/\\/g, "/");
    if (normalizedPath.startsWith("http")) return normalizedPath;
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${API_URL}/${normalizedPath}`;
  };

  if (loading) {
    return (
      <div className="complaint-details-container">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="complaint-details-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Complaint</h3>
          <p>{error || "Complaint not found"}</p>
          <Link to="/dashboard" className="back-button">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="complaint-details-container">
      <div className="details-header">
        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
        <h1 className="details-title">Complaint Details</h1>
      </div>

      <div className="details-content">
        <div className="details-main">
          <div className="detail-card">
            <div className="card-header">
              <h2 className="complaint-title">{complaint.title}</h2>
              <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                {complaint.status || "Pending"}
              </span>
            </div>

            <div className="detail-section">
              <h3 className="section-title">Description</h3>
              <p className="detail-text">{complaint.description}</p>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Department</span>
                <span className="detail-value">{complaint.department?.toUpperCase() || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category</span>
                <span className="detail-value">{complaint.category || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Submitted On</span>
                <span className="detail-value">{formatDate(complaint.createdAt)}</span>
              </div>
              {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                <div className="detail-item">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">{formatDate(complaint.updatedAt)}</span>
                </div>
              )}
            </div>

            {complaint.media && (
              <div className="detail-section">
                <h3 className="section-title">Attachment</h3>
                <div className="media-container">
                  {complaint.media.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={getMediaUrl(complaint.media)}
                      alt="Complaint attachment"
                      className="media-image"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                  ) : null}
                  <a
                    href={getMediaUrl(complaint.media)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="media-link"
                  >
                    <span className="media-icon">📎</span>
                    View Attachment
                  </a>
                </div>
              </div>
            )}

            {complaint.feedback && complaint.feedback.message && (
              <div className="detail-section feedback-section">
                <h3 className="section-title">Feedback</h3>
                <div className="feedback-box">
                  <p className="feedback-text">{complaint.feedback.message}</p>
                  {complaint.feedback.rating && (
                    <div className="feedback-rating">
                      Rating: {complaint.feedback.rating}/5 ⭐
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="details-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Quick Actions</h3>
            <Link to="/dashboard" className="action-button">
              View All Complaints
            </Link>
            <Link to="/complaint-form" className="action-button secondary">
              Submit New Complaint
            </Link>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">Status Information</h3>
            <div className="status-info">
              <div className="status-item">
                <span className="status-dot pending"></span>
                <span>Pending - Awaiting assignment</span>
              </div>
              <div className="status-item">
                <span className="status-dot progress"></span>
                <span>In Progress - Being worked on</span>
              </div>
              <div className="status-item">
                <span className="status-dot resolved"></span>
                <span>Resolved - Issue fixed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetails;



