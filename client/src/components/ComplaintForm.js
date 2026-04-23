import React, { useState } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import './complaintForm.css';

function ComplaintForm() {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { success, error: showError } = useToast();

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!department) newErrors.department = "Department is required";
    if (!category) newErrors.category = "Category is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError("File size must be less than 5MB");
        return;
      }
      setMedia(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setMediaPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError("Please fix the errors in the form");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("department", department);
    formData.append("category", category);
    formData.append("description", description.trim());
    if (media) formData.append("media", media);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/complaints/submit", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      success("Complaint submitted successfully!");
      setTitle("");
      setDepartment("");
      setCategory("");
      setDescription("");
      setMedia(null);
      setMediaPreview(null);
      setErrors({});
      e.target.reset();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error occurred while submitting the complaint.";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-form-container">
      <div className="complaint-form-wrapper">
        <h2 className="form-title">Submit a Complaint</h2>
        <p className="form-subtitle">Fill in the details below to register your complaint</p>

        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-group">
            <label htmlFor="title">Complaint Title <span className="required">*</span></label>
            <input
              type="text"
              id="title"
              placeholder="Enter a brief title for your complaint"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              className={errors.title ? "error-input" : ""}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department <span className="required">*</span></label>
              <select
                id="department"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  if (errors.department) setErrors({ ...errors, department: null });
                }}
                className={errors.department ? "error-input" : ""}
              >
                <option value="">Select Department</option>
                <option value="ec">EC</option>
                <option value="mca">MCA</option>
                <option value="it">IT</option>
                <option value="cs">CS</option>
              </select>
              {errors.department && <span className="error-message">{errors.department}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category <span className="required">*</span></label>
              <select
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) setErrors({ ...errors, category: null });
                }}
                className={errors.category ? "error-input" : ""}
              >
                <option value="">Select Category</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="carpentry">Carpentry</option>
                <option value="cleaning">Cleaning</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description <span className="required">*</span></label>
            <textarea
              id="description"
              placeholder="Provide a detailed description of your complaint (minimum 10 characters)"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: null });
              }}
              rows="5"
              className={errors.description ? "error-input" : ""}
            />
            <div className="char-count">{description.length} characters</div>
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="media">Attach File (Optional)</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="media"
                onChange={handleMediaChange}
                accept="image/*,.pdf,.doc,.docx"
                className="file-input"
              />
              <label htmlFor="media" className="file-label">
                <span className="file-icon">📎</span>
                <span>{media ? media.name : "Choose file or drag here"}</span>
              </label>
            </div>
            {mediaPreview && (
              <div className="media-preview">
                <img src={mediaPreview} alt="Preview" />
                <button
                  type="button"
                  onClick={() => {
                    setMedia(null);
                    setMediaPreview(null);
                  }}
                  className="remove-media"
                >
                  Remove
                </button>
              </div>
            )}
            <small className="file-hint">Supported: Images, PDF, DOC (Max 5MB)</small>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              "Submit Complaint"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ComplaintForm;
