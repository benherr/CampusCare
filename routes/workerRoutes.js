const express = require("express");
const bcrypt = require("bcryptjs");  // Add bcryptjs import
const jwt = require("jsonwebtoken");
const authenticateWorker = require("../middleware/authenticateWorker");
const Worker = require("../models/Worker"); // Import Worker model
const Complaint = require("../models/Complaint"); // Import Complaint model

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();

    const worker = await Worker.findOne({ email: normalizedEmail });
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, worker.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: worker._id, role: "worker" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        category: worker.category,
      },
    });
  } catch (error) {
    console.error("Login error:", error); 
    res.status(500).json({ message: "Login failed" }); 
  }
});

router.get("/assigned-complaints", authenticateWorker, async (req, res) => {
  try {
    const workerId = req.worker.id; 

   
    const complaints = await Complaint.find({ assignedWorker: workerId });

    if (complaints.length === 0) {
      return res.status(404).json({ message: "No assigned complaints found" });
    }

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching assigned complaints:", error);
    res.status(500).json({ message: "Failed to fetch assigned complaints" });
  }
});


router.get("/completed-complaints-feedback", authenticateWorker, async (req, res) => {
  try {
    const workerId = req.worker.id; 
    const complaints = await Complaint.find({
      assignedWorker: workerId,
      status: { $in: ["Completed", "Resolved"] },
      feedback: { $exists: true, $not: { $size: 0 } }
    }).populate("feedback.userId", "name email"); 

    if (complaints.length === 0) {
      return res.status(404).json({ message: "No feedback found for your completed works" });
    }

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching feedback for completed complaints:", error);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

// Update the status of a complaint
router.put("/update-status/:complaintId", authenticateWorker, async (req, res) => {
  const { status } = req.body; 
  const { complaintId } = req.params; 

  try {
    const workerId = req.worker.id; 

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.assignedWorker.toString() !== workerId) {
      return res.status(403).json({ message: "You are not authorized to update this complaint" });
    }

    // Update the status of the complaint
    complaint.status = status;
    await complaint.save();

    res.status(200).json({ message: "Complaint status updated successfully", complaint });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
});

module.exports = router;
