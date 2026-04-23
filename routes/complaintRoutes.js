const express = require("express");
const multer = require("multer");
const Complaint = require("../models/Complaint");
const authenticate = require("../middleware/authenticate");
const authenticateAdmin = require("../middleware/authenticateAdmin");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    // Generate a safe filename
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, Date.now() + "_" + safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf/;
  const mimetype = allowedFileTypes.test(file.mimetype);
  const extname = allowedFileTypes.test(file.originalname.toLowerCase().split('.').pop());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Error: File upload only supports the following filetypes - " + allowedFileTypes));
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter 
});

router.post("/submit", authenticate, upload.single("media"), async (req, res) => {
  try {
    const { title, department, category, description } = req.body;
    const complaint = new Complaint({
      title,
      department,
      category,
      description,
      media: req.file ? req.file.path : null,
      userId: req.userId,
    });
    await complaint.save();
    res.status(201).json({ message: "Complaint submitted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/all", authenticateAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:complaintId", authenticate, async (req, res) => {
  const { complaintId } = req.params;
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:complaintId/feedback", authenticate, async (req, res) => {
  const { complaintId } = req.params;
  const { text, rating } = req.body;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Bug Fix: Ultimate robust status check
    const normalizedStatus = (complaint.status || "").toString().trim().toLowerCase();
    const isCompleted = normalizedStatus === "completed" || 
                        normalizedStatus === "resolved" || 
                        normalizedStatus === "finished" ||
                        normalizedStatus === "closed" ||
                        normalizedStatus === "success";

    if (!isCompleted) {
      return res.status(400).json({ 
        message: `You can only provide feedback for completed complaints. (Current Status: ${complaint.status || 'Unknown'})`,
        currentStatus: complaint.status 
      });
    }

    // Standardize: Push feedback with rating
    complaint.feedback.push({
      userId: req.userId,
      text,
      rating: rating || 5
    });

    await complaint.save();
    res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
