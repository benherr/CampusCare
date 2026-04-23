import React, { useState, useEffect } from "react";
import axios from "axios";
import './AssignedComplaints.css';

function AssignedComplaints() {
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchAssignedComplaints = async () => {
      const token = localStorage.getItem("workerToken");

      if (!token) {
        setError("Worker not logged in");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/worker/assigned-complaints", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAssignedComplaints(response.data);
      } catch (err) {
        setError("Failed to fetch assigned complaints");
      }
    };

    fetchAssignedComplaints();
  }, []);

  const handleUpdateStatus = async (complaintId, newStatus) => {
    const token = localStorage.getItem("workerToken");

    if (!token) {
      setError("Worker not logged in");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/worker/update-status/${complaintId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMessage("Status updated successfully!");

      setAssignedComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const getMediaUrl = (mediaPath) => {
    if (!mediaPath) return null;
    const normalizedPath = mediaPath.replace(/\\/g, "/");
    if (normalizedPath.startsWith("http")) return normalizedPath;
    return `http://localhost:5000/${normalizedPath}`;
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      'pending': 'status-pending',
      'in progress': 'status-progress',
      'resolved': 'status-resolved',
      'completed': 'status-resolved',
    };
    return statusClass[(status || 'pending').toLowerCase()] || 'status-pending';
  };

  return (
    <div>
      <div className="section-header">
        <h2>📋 My Assigned Work</h2>
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "15px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveStatusFilter("all")}
          className={`filter-btn ${activeStatusFilter === "all" ? "active" : ""}`}
        >
          All
        </button>
        <button
          onClick={() => setActiveStatusFilter("pending")}
          className={`filter-btn ${activeStatusFilter === "pending" ? "active" : ""}`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveStatusFilter("in progress")}
          className={`filter-btn ${activeStatusFilter === "in progress" ? "active" : ""}`}
        >
          In Progress
        </button>
        <button
          onClick={() => setActiveStatusFilter("completed")}
          className={`filter-btn ${activeStatusFilter === "completed" ? "active" : ""}`}
        >
          Completed
        </button>
      </div>

      {/* Professional Filter Bar */}
      <div className="filters-container">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="professional-search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="dropdown-row">
          <select 
            className="premium-select"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="carpentry">Carpentry</option>
            <option value="cleaning">Cleaning</option>
          </select>

          <button 
            className="reset-filters-btn"
            onClick={() => {
              setSearchTerm("");
              setCatFilter("all");
              setActiveStatusFilter("all");
            }}
          >
            Reset
          </button>
        </div>
      </div>
      
      {error && <div className="error-banner">{error}</div>}
      {successMessage && <div className="success">{successMessage}</div>}
      
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Attachment</th>
              <th>Task Title</th>
              <th>Location</th>
              <th>Category</th>
              <th>Details</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assignedComplaints.length > 0 ? (
              assignedComplaints
                .filter((complaint) => {
                  // Status Filter (with synonym support)
                  const status = (complaint.status || "pending").toLowerCase();
                  let statusMatch = true;
                  if (activeStatusFilter !== "all") {
                    if (activeStatusFilter === "completed") {
                      statusMatch = status === "completed" || status === "resolved";
                    } else {
                      statusMatch = status === activeStatusFilter;
                    }
                  }

                  // Search Filter
                  const matchesSearch = 
                    complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    complaint.description?.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  // Category Filter
                  const matchesCat = catFilter === "all" || complaint.category?.toLowerCase() === catFilter.toLowerCase();

                  return statusMatch && matchesSearch && matchesCat;
                })
                .map((complaint) => (
                <tr key={complaint._id}>
                  <td className="media-cell">
                    {complaint.media ? (
                      <a href={getMediaUrl(complaint.media)} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={getMediaUrl(complaint.media)} 
                          alt="Task" 
                          className="complaint-thumbnail" 
                          onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
                        />
                        <span style={{ display: "none" }} className="media-icon">📎</span>
                      </a>
                    ) : (
                      <span className="no-media">-</span>
                    )}
                  </td>
                  <td className="title-cell">{complaint.title}</td>
                  <td><span className="dept-badge">{complaint.department?.toUpperCase()}</span></td>
                  <td className="category-cell">{complaint.category}</td>
                  <td className="desc-cell">{complaint.description?.substring(0, 50)}...</td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(complaint.status)}`}>
                      {complaint.status || "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="worker-actions">
                      {complaint.status === "Pending" && (
                        <button
                          className="action-btn start-work"
                          onClick={() => handleUpdateStatus(complaint._id, "In Progress")}
                        >
                          <span className="btn-icon">🛠️</span> Start Work
                        </button>
                      )}
                      
                      {complaint.status === "In Progress" && (
                        <button
                          className="action-btn resolve-work"
                          onClick={() => handleUpdateStatus(complaint._id, "Completed")}
                        >
                          <span className="btn-icon">✅</span> Finalize Resolution
                        </button>
                      )}

                      {(complaint.status?.toLowerCase() === "completed" || complaint.status?.toLowerCase() === "resolved") && (
                        <div className="feedback-visibility">
                          {complaint.feedback && complaint.feedback.length > 0 ? (
                            <div className="student-review">
                              <div className="review-header">
                                <span className="review-label">Student Review:</span>
                                <div className="rating-stars">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < (complaint.feedback[0].rating || 5) ? "star-on" : "star-off"}>★</span>
                                  ))}
                                </div>
                              </div>
                              <p className="review-text">"{complaint.feedback[0].text}"</p>
                            </div>
                          ) : (
                            <span className="work-finished">
                              Excellent work! (No review yet) 🎉
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <span className="empty-icon">🎉</span>
                    <p>No assigned tasks match your filter!</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignedComplaints;
