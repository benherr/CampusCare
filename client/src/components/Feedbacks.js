import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Feedbacks.css";

function Feedbacks() {
  const [completedComplaints, setCompletedComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchCompletedComplaints = async () => {
      const token = localStorage.getItem("workerToken");

      if (!token) {
        setError("Worker not logged in");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/worker/completed-complaints", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCompletedComplaints(response.data);
      } catch (err) {
        setError("Failed to fetch completed complaints");
      }
    };

    fetchCompletedComplaints();
  }, []);

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  const handleSubmitFeedback = async () => {
    if (!feedback) {
      setError("Feedback cannot be empty");
      return;
    }

    const token = localStorage.getItem("workerToken");
    if (!token) {
      setError("Worker not logged in");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/worker/feedback/${selectedComplaintId}`,
        { feedback: { message: feedback } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Feedback submitted successfully!");
      setFeedback("");  // Clear feedback field
      setSelectedComplaintId(null); // Reset selected complaint
      // Optionally, refetch completed complaints to reflect the feedback
      setCompletedComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === selectedComplaintId
            ? { ...complaint, feedback: { message: feedback } }
            : complaint
        )
      );
    } catch (err) {
      setError("Failed to submit feedback");
    }
  };

  return (
    <div className="feedbacks-container">
      <div className="section-header">
        <h2>Completed Complaints Feedback</h2>
        <p className="section-subtitle">Manage worker comments on resolved tasks</p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Feedback Message</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {completedComplaints.length > 0 ? (
              completedComplaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td className="title-cell">{complaint.title}</td>
                  <td className="desc-cell">{complaint.feedback?.message || "No feedback provided"}</td>
                  <td>
                    {complaint.feedback ? (
                      <span className="work-finished">✅ Feedback Provided</span>
                    ) : (
                      <button 
                        className="start-work" 
                        onClick={() => setSelectedComplaintId(complaint._id)}
                      >
                        Provide Feedback
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">
                  <div className="empty-state">
                    <span className="empty-icon">📂</span>
                    <p>No completed complaints found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Feedback Form for Selected Complaint */}
      {selectedComplaintId && (
        <div className="feedback-modal-overlay">
          <div className="feedback-card">
            <h4 className="card-title">Provide Feedback</h4>
            <textarea
              className="premium-textarea"
              value={feedback}
              onChange={handleFeedbackChange}
              rows="4"
              placeholder="Enter your professional feedback here..."
            />
            <div className="card-actions">
              <button className="submit-btn" onClick={handleSubmitFeedback}>Submit Feedback</button>
              <button className="cancel-btn" onClick={() => setSelectedComplaintId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Feedbacks;
