const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new user with name, email, and password
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  // Sign JWT with secret from `.env`
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Fetch current user profile
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
});

// Fetch all complaints for a specific user
router.get("/complaints", authenticate, async (req, res) => {
  try {
    // Use the userId from the JWT token (from authenticate middleware)
    const complaints = await Complaint.find({ userId: req.userId });  // Ensure you're checking with req.userId for the logged-in user
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Error fetching complaints", error: error.message });
  }
});

module.exports = router;
