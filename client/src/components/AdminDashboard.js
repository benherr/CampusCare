import React, { useState, useEffect } from "react";
import axios from "axios";
import './adminDashboard.css';
import * as XLSX from 'xlsx';
import AddWorker from "./AddWorker";
import WorkerList from "./WorkerList";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("complaints");
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workerError, setWorkerError] = useState(null);
  const [workerSuccess, setWorkerSuccess] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assigningWorker, setAssigningWorker] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");

  const normalizeCategory = (value) => {
    if (!value) return "";
    const v = value.toLowerCase();
    if (v.startsWith("plumb")) return "plumber";
    if (v.startsWith("electr")) return "electrician";
    if (v.startsWith("carpent")) return "carpenter";
    if (v.startsWith("clean")) return "cleaning";
    return v;
  };

  const getMediaUrl = (mediaPath) => {
    if (!mediaPath) return null;
    const normalizedPath = mediaPath.replace(/\\/g, "/");
    if (normalizedPath.startsWith("http")) return normalizedPath;
    return `http://localhost:5000/${normalizedPath}`;
  };

  const stats = {
    totalComplaints: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending' || !c.status).length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved' || c.status === 'Completed').length,
    totalWorkers: workers.length,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      setError("Admin not logged in");
      setLoading(false);
      return;
    }

    try {
      const complaintsResponse = await axios.get("http://localhost:5000/api/admin/complaints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(complaintsResponse.data);

      const workersResponse = await axios.get("http://localhost:5000/api/admin/workers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkers(workersResponse.data);
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWorker = async (complaintId, workerId) => {
    const token = localStorage.getItem("adminToken");
    setAssigningWorker(true);
    
    try {
      await axios.post("http://localhost:5000/api/admin/assign-worker", 
        { complaintId, workerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
      setSelectedComplaint(null);
    } catch (err) {
      alert("Failed to assign worker");
    } finally {
      setAssigningWorker(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  };

  const exportToExcel = () => {
    // 1. Get filtered complaints
    const filteredData = complaints.filter((complaint) => {
      const status = complaint.status || "Pending";
      let statusMatch = true;
      if (activeStatusFilter !== "all") {
        if (activeStatusFilter === "Resolved") {
          statusMatch = status === "Resolved" || status === "Completed";
        } else {
          statusMatch = status === activeStatusFilter;
        }
      }
      const matchesSearch = 
        complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        complaint.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === "all" || complaint.department?.toLowerCase() === deptFilter.toLowerCase();
      const matchesCat = catFilter === "all" || complaint.category?.toLowerCase() === catFilter.toLowerCase();
      
      return statusMatch && matchesSearch && matchesDept && matchesCat;
    });

    // 2. Format data for Excel
    const worksheetData = filteredData.map(c => ({
      "Complaint ID": c._id,
      "Title": c.title,
      "Category": c.category,
      "Department": c.department?.toUpperCase(),
      "Status": c.status || "Pending",
      "Description": c.description,
      "Created Date": new Date(c.createdAt).toLocaleDateString(),
      "Worker Assigned": workers.find(w => w._id === c.assignedWorker)?.name || "Unassigned",
      "Media Attached": c.media ? "Yes" : "No",
      "User Feedback": c.feedback && c.feedback.length > 0 ? c.feedback[0].text : "N/A"
    }));

    // 3. Generate WorkBook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints Report");

    // 4. Set column widths
    const wscols = [
      {wch: 25}, {wch: 25}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 50}, {wch: 15}, {wch: 20}, {wch: 15}, {wch: 40}
    ];
    worksheet['!cols'] = wscols;

    // 5. Download
    XLSX.writeFile(workbook, `CampusCare_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      'Pending': 'status-pending',
      'In Progress': 'status-progress',
      'Resolved': 'status-resolved',
      'Completed': 'status-resolved',
    };
    return statusClass[status] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-container">
          <div className="header-left">
            <h1 className="admin-logo">
              <span className="logo-icon"></span>
              Admin Dashboard
            </h1>
          </div>

          <nav className="admin-nav">
            <button
              className={`nav-tab ${activeTab === "complaints" ? "active" : ""}`}
              onClick={() => setActiveTab("complaints")}
            >
              <span className="tab-icon">📋</span>
              <span className="tab-text">Complaints</span>
            </button>
            <button
              className={`nav-tab ${activeTab === "workers" ? "active" : ""}`}
              onClick={() => setActiveTab("workers")}
            >
              <span className="tab-icon">👷</span>
              <span className="tab-text">Workers</span>
            </button>
            <button
              className={`nav-tab ${activeTab === "addWorker" ? "active" : ""}`}
              onClick={() => setActiveTab("addWorker")}
            >
              <span className="tab-icon">➕</span>
              <span className="tab-text">Add Worker</span>
            </button>
          </nav>

          <div className="header-right">
            <div className="profile-section" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="profile-avatar admin-avatar">A</div>
              <span className="profile-name">Admin</span>
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
      <main className="admin-main">
        <div className="admin-content">
          {/* Stats Section */}
          <section className="admin-stats">
            <div className="stats-grid">
              <div
                className="stat-card purple"
                onClick={() => {
                  setActiveTab("complaints");
                  setActiveStatusFilter("all");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon-wrapper">📊</div>
                <div className="stat-info">
                  <h3>{stats.totalComplaints}</h3>
                  <p>Total Complaints</p>
                </div>
              </div>
              <div
                className="stat-card orange"
                onClick={() => {
                  setActiveTab("complaints");
                  setActiveStatusFilter("Pending");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon-wrapper">⏳</div>
                <div className="stat-info">
                  <h3>{stats.pending}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div
                className="stat-card blue"
                onClick={() => {
                  setActiveTab("complaints");
                  setActiveStatusFilter("In Progress");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon-wrapper">🔄</div>
                <div className="stat-info">
                  <h3>{stats.inProgress}</h3>
                  <p>In Progress</p>
                </div>
              </div>
              <div
                className="stat-card green"
                onClick={() => {
                  setActiveTab("complaints");
                  setActiveStatusFilter("Resolved");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon-wrapper">✅</div>
                <div className="stat-info">
                  <h3>{stats.resolved}</h3>
                  <p>Resolved</p>
                </div>
              </div>
              <div
                className="stat-card teal"
                onClick={() => setActiveTab("workers")}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-icon-wrapper">👷</div>
                <div className="stat-info">
                  <h3>{stats.totalWorkers}</h3>
                  <p>Total Workers</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tab Content */}
          <section className="content-section">
            {error && <div className="error-banner">{error}</div>}

            {activeTab === "complaints" && (
              <div className="complaints-section">
                <div className="section-header">
                  <h2>📋 Manage Complaints</h2>
                  <span className="badge">{complaints.length} total</span>
                </div>

                {/* Professional Filter Bar */}
                <div className="filters-container">
                  <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      className="professional-search"
                      placeholder="Search by title, student name, or details..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="dropdown-row">
                    <select 
                      className="premium-select"
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                    >
                      <option value="all">All Departments</option>
                      <option value="ec">EC</option>
                      <option value="mca">MCA</option>
                      <option value="it">IT</option>
                      <option value="cs">CS</option>
                    </select>

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
                        setDeptFilter("all");
                        setCatFilter("all");
                        setActiveStatusFilter("all");
                      }}
                    >
                      ↺ Reset
                    </button>

                    <button 
                      className="download-report-btn"
                      onClick={exportToExcel}
                    >
                      📥 Download Excel Report
                    </button>
                  </div>
                </div>

                {complaints.length > 0 ? (
                  <div className="table-container">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Attachment</th>
                          <th>Title</th>
                          <th>Department</th>
                          <th>Category</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Assigned To</th>
                          <th>User Feedback</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints
                          .filter((complaint) => {
                            // Status Filter (with synonym support)
                            const status = complaint.status || "Pending";
                            let statusMatch = true;
                            if (activeStatusFilter !== "all") {
                              if (activeStatusFilter === "Resolved") {
                                statusMatch = status === "Resolved" || status === "Completed";
                              } else {
                                statusMatch = status === activeStatusFilter;
                              }
                            }

                            // Search Filter
                            const matchesSearch = 
                              complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              complaint.description?.toLowerCase().includes(searchTerm.toLowerCase());

                            // Dept Filter
                            const matchesDept = deptFilter === "all" || complaint.department?.toLowerCase() === deptFilter.toLowerCase();
                            
                            // Category Filter
                            const matchesCat = catFilter === "all" || complaint.category?.toLowerCase() === catFilter.toLowerCase();

                            return statusMatch && matchesSearch && matchesDept && matchesCat;
                          })
                          .map((complaint) => (
                          <tr key={complaint._id}>
                            <td className="media-cell">
                              {complaint.media ? (
                                <a href={getMediaUrl(complaint.media)} target="_blank" rel="noopener noreferrer">
                                  <img 
                                    src={getMediaUrl(complaint.media)} 
                                    alt="Complaint" 
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
                            <td>
                              <span className="dept-badge">{complaint.department?.toUpperCase()}</span>
                            </td>
                            <td className="category-cell">{complaint.category}</td>
                            <td className="desc-cell">{complaint.description?.substring(0, 50)}...</td>
                            <td>
                              <span className={`status-badge ${getStatusBadge(complaint.status)}`}>
                                {complaint.status || "Pending"}
                              </span>
                            </td>
                            <td>
                              {complaint.assignedWorker ? (
                                <span className="assigned-badge">
                                  {workers.find(w => w._id === complaint.assignedWorker)?.name || "Assigned"}
                                </span>
                              ) : (
                                <span className="not-assigned">Not Assigned</span>
                              )}
                            </td>
                            <td className="feedback-cell">
                              {complaint.feedback && complaint.feedback.length > 0 ? (
                                <div className="admin-feedback-preview" title={complaint.feedback[0].text}>
                                  <div className="mini-stars">
                                    {[...Array(5)].map((_, i) => (
                                      <span key={i} className={i < (complaint.feedback[0].rating || 5) ? "star-on" : "star-off"}>★</span>
                                    ))}
                                  </div>
                                  <span className="preview-text-snippet">{complaint.feedback[0].text.substring(0, 20)}...</span>
                                </div>
                              ) : (
                                <span className="no-feedback">-</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="assign-btn"
                                onClick={() => setSelectedComplaint(complaint)}
                                disabled={complaint.status === 'Completed' || complaint.status === 'Resolved'}
                              >
                                {complaint.assignedWorker ? "Reassign" : "Assign"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <p>No complaints found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "workers" && (
              <div className="workers-section">
                <div className="section-header">
                  <h2>👷 Worker List</h2>
                  <span className="badge">{workers.length} workers</span>
                </div>
                <WorkerList workers={workers} onWorkerUpdated={fetchData} />
              </div>
            )}

            {activeTab === "addWorker" && (
              <div className="add-worker-section">
                <div className="section-header">
                  <h2>➕ Add New Worker</h2>
                </div>
                <AddWorker 
                  setWorkerSuccess={setWorkerSuccess} 
                  setWorkerError={setWorkerError}
                  onWorkerAdded={fetchData}
                />
                {workerSuccess && <div className="success-message">{workerSuccess}</div>}
                {workerError && <div className="error-message">{workerError}</div>}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Assign Worker Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Worker</h3>
              <button className="modal-close" onClick={() => setSelectedComplaint(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-complaint-title">
                <strong>Complaint:</strong> {selectedComplaint.title}
              </p>
              <p className="modal-category">
                <strong>Category:</strong> {selectedComplaint.category}
              </p>
              <div className="worker-select-list">
                <p className="select-label">Select a worker:</p>
                {workers
                  .filter(
                    (w) =>
                      normalizeCategory(w.category) === normalizeCategory(selectedComplaint.category)
                  )
                  .length > 0 ? (
                  workers
                    .filter(
                      (w) =>
                        normalizeCategory(w.category) ===
                        normalizeCategory(selectedComplaint.category)
                    )
                    .map((worker) => (
                      <button
                        key={worker._id}
                        className="worker-select-btn"
                        onClick={() => handleAssignWorker(selectedComplaint._id, worker._id)}
                        disabled={assigningWorker}
                      >
                        <span className="worker-avatar">{worker.name?.charAt(0)}</span>
                        <div className="worker-info">
                          <span className="worker-name">{worker.name}</span>
                          <span className="worker-category">{worker.category}</span>
                        </div>
                      </button>
                    ))
                ) : (
                  <p className="no-workers">
                    No workers available for this category. Check that worker category matches the
                    complaint category.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
