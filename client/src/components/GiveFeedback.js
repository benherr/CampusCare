import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import "./Feedbacks.css";

function GiveFeedback() {
  const [complaint, setComplaint] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { complaintId } = useParams(); // Get the complaint ID from the URL
  const { success, error: showError } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchComplaintDetails();
    }
  }, [navigate, complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/complaints/${complaintId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setComplaint(response.data);
    } catch (error) {
      setError("Error fetching complaint details.");
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedbackText.trim()) {
      setError("Feedback cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/complaints/${complaintId}/feedback`,
        { text: feedbackText, rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      success("Feedback submitted successfully");
      setTimeout(() => {
        navigate("/dashboard"); // Redirect to the dashboard after submission
      }, 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error submitting feedback.";
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <div className="give-feedback-page">
      <div className="feedback-wrapper">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        
        <div className="feedback-main-card">
          <div className="header-section">
            <h2 className="title">Give Feedback</h2>
            <p className="subtitle">Tell us about your experience with this resolution</p>
          </div>

          {complaint ? (
            <div className="complaint-summary">
              <div className="summary-item">
                <span className="label">Complaint</span>
                <p className="value">{complaint.title}</p>
              </div>
              <div className="summary-item">
                <span className="label">Category</span>
                <p className="value">{complaint.category}</p>
              </div>

              <div className="rating-section">
                <span className="rating-label">How would you rate the resolution?</span>
                <div className="star-rating">
                  {[...Array(5)].map((star, index) => {
                    const ratingValue = index + 1;
                    return (
                      <button
                        type="button"
                        key={ratingValue}
                        className={ratingValue <= (hover || rating) ? "on" : "off"}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                        title={`${ratingValue} Stars`}
                      >
                        <span className="star">&#9733;</span>
                      </button>
                    );
                  })}
                </div>
                <p className="rating-hint">
                  {rating === 5 && "Excellent! ⭐⭐⭐⭐⭐"}
                  {rating === 4 && "Very Good! ⭐⭐⭐⭐"}
                  {rating === 3 && "Good! ⭐⭐⭐"}
                  {rating === 2 && "Could be better! ⭐⭐"}
                  {rating === 1 && "Poor experience! ⭐"}
                </p>
              </div>

              <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                <div className="form-group">
                  <label>Share your experience (Optional)</label>
                  <textarea
                    className="premium-textarea"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what you liked or how we can improve..."
                  />
                </div>
                
                {error && <div className="error-banner">{error}</div>}
                
                <button type="submit" className="submit-feedback-btn">
                  Submit Feedback
                </button>
              </form>
            </div>
          ) : (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading details...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GiveFeedback;
