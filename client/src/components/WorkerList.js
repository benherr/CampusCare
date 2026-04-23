import React, { useState } from "react";
import api from "../services/api";

function WorkerList({ workers, onWorkerUpdated }) {
  const [editingWorker, setEditingWorker] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    category: "",
    password: "",
  });

  const getCategoryColor = (category) => {
    const colors = {
      'plumber': '#3b82f6',
      'electrician': '#f59e0b',
      'carpenter': '#10b981',
      'cleaning': '#8b5cf6',
    };
    return colors[category?.toLowerCase()] || '#667eea';
  };

  const handleEditClick = (worker) => {
    setEditingWorker(worker);
    setEditForm({
      name: worker.name,
      email: worker.email,
      category: worker.category,
      password: "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        category: editForm.category,
      };
      
      // Only include password if it was changed
      if (editForm.password) {
        updateData.password = editForm.password;
      }

      await api.put(`/admin/update-worker/${editingWorker._id}`, updateData);

      setEditingWorker(null);
      if (onWorkerUpdated) onWorkerUpdated();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update worker");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (worker) => {
    setDeleteConfirm(worker);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);

    try {
      await api.delete(`/admin/delete-worker/${deleteConfirm._id}`);

      setDeleteConfirm(null);
      if (onWorkerUpdated) onWorkerUpdated();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete worker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worker-list">
      {workers.length > 0 ? (
        <div className="workers-grid">
          {workers.map((worker) => (
            <div key={worker._id} className="worker-card">
              <div 
                className="worker-card-avatar"
                style={{ background: `linear-gradient(135deg, ${getCategoryColor(worker.category)} 0%, ${getCategoryColor(worker.category)}99 100%)` }}
              >
                {worker.name?.charAt(0).toUpperCase()}
              </div>
              <div className="worker-card-info">
                <h4 className="worker-card-name">{worker.name}</h4>
                <p className="worker-card-email">{worker.email}</p>
                <span 
                  className="worker-card-category"
                  style={{ background: `${getCategoryColor(worker.category)}20`, color: getCategoryColor(worker.category) }}
                >
                  {worker.category}
                </span>
              </div>
              <div className="worker-card-actions">
                <button 
                  className="action-btn edit-btn" 
                  onClick={() => handleEditClick(worker)}
                  title="Edit Worker"
                >
                  ✏️
                </button>
                <button 
                  className="action-btn delete-btn" 
                  onClick={() => handleDeleteClick(worker)}
                  title="Delete Worker"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-workers">
          <span className="empty-icon">👷</span>
          <p>No workers available</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingWorker && (
        <div className="modal-overlay" onClick={() => setEditingWorker(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Worker</h3>
              <button className="modal-close" onClick={() => setEditingWorker(null)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    required
                    className="form-input form-select"
                  >
                    <option value="plumber">Plumber</option>
                    <option value="electrician">Electrician</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Enter new password"
                    className="form-input"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setEditingWorker(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Worker</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <span className="warning-icon">⚠️</span>
                <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
                <p className="warning-text">This action cannot be undone. The worker will be unassigned from all complaints.</p>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="delete-confirm-btn" onClick={handleDeleteConfirm} disabled={loading}>
                  {loading ? "Deleting..." : "Delete Worker"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .worker-list {
          margin-top: 10px;
        }

        .workers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .worker-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
          position: relative;
        }

        .worker-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-3px);
        }

        .worker-card-avatar {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .worker-card-info {
          flex: 1;
          min-width: 0;
        }

        .worker-card-name {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .worker-card-email {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          margin: 0 0 10px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .worker-card-category {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .worker-card-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .edit-btn {
          background: rgba(59, 130, 246, 0.2);
        }

        .edit-btn:hover {
          background: rgba(59, 130, 246, 0.4);
          transform: scale(1.1);
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.2);
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.4);
          transform: scale(1.1);
        }

        .empty-workers {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        .empty-workers .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 16px;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1e293b;
          border-radius: 20px;
          width: 90%;
          max-width: 450px;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        .delete-modal {
          max-width: 400px;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header h3 {
          color: white;
          font-size: 1.3rem;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 2rem;
          cursor: pointer;
          line-height: 1;
        }

        .modal-close:hover {
          color: white;
        }

        .modal-body {
          padding: 24px;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .form-input {
          background: rgba(30, 41, 59, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 12px 16px;
          color: #ffffff !important;
          font-size: 1rem;
          -webkit-text-fill-color: #ffffff !important;
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
          -webkit-text-fill-color: rgba(255, 255, 255, 0.4) !important;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-select option {
          background: #1e293b;
          color: white;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .cancel-btn {
          flex: 1;
          padding: 12px 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: white;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .save-btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .delete-warning {
          text-align: center;
          padding: 10px 0;
        }

        .warning-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
        }

        .delete-warning p {
          color: white;
          margin: 0 0 10px 0;
        }

        .warning-text {
          color: rgba(255, 255, 255, 0.5) !important;
          font-size: 0.9rem;
        }

        .delete-confirm-btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .delete-confirm-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
        }

        .delete-confirm-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .workers-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default WorkerList;
