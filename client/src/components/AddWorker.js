import React, { useState } from "react";
import api from "../services/api";

function AddWorker({ setWorkerSuccess, setWorkerError, onWorkerAdded }) {
  const [workerName, setWorkerName] = useState("");
  const [workerEmail, setWorkerEmail] = useState("");
  const [workerPassword, setWorkerPassword] = useState("");
  const [workerCategory, setWorkerCategory] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddWorker = async (e) => {
    e.preventDefault();

    if (!workerName || !workerEmail || !workerPassword || !workerCategory) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/admin/add-worker", { 
        name: workerName, 
        email: workerEmail, 
        password: workerPassword, 
        category: workerCategory 
      });

      setSuccess(response.data.message);
      setError(null);
      setWorkerName("");
      setWorkerEmail("");
      setWorkerPassword("");
      setWorkerCategory("");
      
      if (onWorkerAdded) onWorkerAdded();
      if (setWorkerSuccess) setWorkerSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add worker. Please try again.");
      setSuccess(null);
      if (setWorkerError) setWorkerError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-worker-modern">
      <form onSubmit={handleAddWorker} className="worker-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="workerName">Worker Name</label>
            <input
              type="text"
              id="workerName"
              placeholder="Enter worker name"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="workerEmail">Email Address</label>
            <input
              type="email"
              id="workerEmail"
              placeholder="Enter email address"
              value={workerEmail}
              onChange={(e) => setWorkerEmail(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="workerPassword">Password</label>
            <input
              type="password"
              id="workerPassword"
              placeholder="Create password"
              value={workerPassword}
              onChange={(e) => setWorkerPassword(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="workerCategory">Category</label>
            <select
              id="workerCategory"
              value={workerCategory}
              onChange={(e) => setWorkerCategory(e.target.value)}
              className="form-input form-select"
            >
              <option value="">Select Category</option>
              <option value="plumber">Plumber</option>
              <option value="electrician">Electrician</option>
              <option value="carpenter">Carpenter</option>
              <option value="cleaning">Cleaning</option>
            </select>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="btn-spinner"></span>
              Adding Worker...
            </>
          ) : (
            <>
              <span>➕</span>
              Add Worker
            </>
          )}
        </button>
      </form>

      <style>{`
        .add-worker-modern {
          max-width: 800px;
        }

        .worker-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          font-size: 0.95rem;
        }

        .form-input {
          background: rgba(30, 41, 59, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 14px 18px;
          color: #ffffff !important;
          font-size: 1rem;
          transition: all 0.3s ease;
          -webkit-text-fill-color: #ffffff !important;
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
          -webkit-text-fill-color: rgba(255, 255, 255, 0.4) !important;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(30, 41, 59, 0.95) !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .form-select {
          cursor: pointer;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .form-select option {
          background: #1e293b;
          color: #ffffff !important;
        }

        .form-error {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 0.95rem;
        }

        .form-success {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 0.95rem;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px 28px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default AddWorker;
