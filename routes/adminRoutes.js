const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); 
const authenticateAdmin = require("../middleware/authenticateAdmin"); 
const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker"); 

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD; // Assumed to be a bcrypt hash now

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (username === adminUsername) {
      // If ADMIN_PASSWORD in env is plaintext (fallback for old setups) vs hashed
      const isMatch = adminPasswordHash.startsWith("$2a$") || adminPasswordHash.startsWith("$2b$") 
        ? await bcrypt.compare(password, adminPasswordHash)
        : password === adminPasswordHash; // fallback for legacy securely

      if (isMatch) {
        const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.json({ token });
      }
    }
    
    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/complaints", authenticateAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: "Failed to fetch complaints." });
  }
});

router.get("/workers", authenticateAdmin, async (req, res) => {
  try {
    const workers = await Worker.find();
    res.status(200).json(workers);
  } catch (error) {
    console.error("Error fetching workers:", error);
    res.status(500).json({ message: "Failed to fetch workers." });
  }
});

router.post("/add-worker", authenticateAdmin, async (req, res) => {
  try {
    const { name, email, password, category } = req.body;
    const validCategories = ["plumber", "electrician", "carpenter", "cleaning"];

    if (!validCategories.includes(category)) {
      return res
        .status(400)
        .json({ message: "Invalid category. Choose from plumber, electrician, carpenter, or cleaning." });
    }

    const normalizedEmail = email.toLowerCase();

    const existingWorker = await Worker.findOne({ email: normalizedEmail });
    if (existingWorker) {
      return res.status(400).json({ message: "Worker with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newWorker = new Worker({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      category,
    });

    await newWorker.save();
    res.status(201).json({ message: "Worker added successfully", worker: { name: newWorker.name, email: newWorker.email, category: newWorker.category } });
  } catch (error) {
    console.error("Error adding worker:", error);
    res.status(500).json({ message: "Failed to add worker." });
  }
});

router.post("/assign-worker", authenticateAdmin, async (req, res) => {
  try {
    const { complaintId, workerId } = req.body;

    if (!complaintId || !workerId) {
      return res.status(400).json({ message: "Complaint ID and Worker ID are required" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    complaint.assignedWorker = workerId;
    await complaint.save();
    res.status(200).json({ message: "Worker assigned successfully", complaint });
  } catch (error) {
    console.error("Error assigning worker:", error);
    res.status(500).json({ message: "Failed to assign worker" });
  }
});

// Update worker
router.put("/update-worker/:workerId", authenticateAdmin, async (req, res) => {
  try {
    const { workerId } = req.params;
    const { name, email, category, password } = req.body;
    const validCategories = ["plumber", "electrician", "carpenter", "cleaning"];

    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category." });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Check if email is being changed and if it already exists
    const normalizedEmail = email ? email.toLowerCase() : undefined;
    if (normalizedEmail && normalizedEmail !== worker.email) {
      const existingWorker = await Worker.findOne({ email: normalizedEmail });
      if (existingWorker) {
        return res.status(400).json({ message: "Email already in use by another worker." });
      }
    }

    // Update fields
    if (name) worker.name = name;
    if (normalizedEmail) worker.email = normalizedEmail;
    if (category) worker.category = category;
    if (password) {
      worker.password = await bcrypt.hash(password, 10);
    }

    await worker.save();
    res.status(200).json({ 
      message: "Worker updated successfully", 
      worker: { _id: worker._id, name: worker.name, email: worker.email, category: worker.category } 
    });
  } catch (error) {
    console.error("Error updating worker:", error);
    res.status(500).json({ message: "Failed to update worker." });
  }
});

// Delete worker
router.delete("/delete-worker/:workerId", authenticateAdmin, async (req, res) => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Check if worker is assigned to any complaints
    const assignedComplaints = await Complaint.find({ assignedWorker: workerId });
    if (assignedComplaints.length > 0) {
      // Unassign worker from all complaints
      await Complaint.updateMany(
        { assignedWorker: workerId },
        { $unset: { assignedWorker: "" } }
      );
    }

    await Worker.findByIdAndDelete(workerId);
    res.status(200).json({ message: "Worker deleted successfully" });
  } catch (error) {
    console.error("Error deleting worker:", error);
    res.status(500).json({ message: "Failed to delete worker." });
  }
});

router.post("/worker-login", async (req, res) => {
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

    const token = jwt.sign({ id: worker._id, role: "worker" }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token, worker: { id: worker._id, name: worker.name, email: worker.email, category: worker.category } });
  } catch (error) {
    console.error("Worker login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
