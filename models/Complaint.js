const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    media: { type: String, default: null }, // Maps to image upload path
    assignedWorker: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Worker", 
      default: null 
    },
    status: { 
      type: String, 
      enum: ["Pending", "In Progress", "Completed"], 
      default: "Pending" 
    },
    feedback: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
        text: { type: String, required: true }, 
        rating: { type: Number, min: 1, max: 5, default: 5 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true, 
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Complaint", complaintSchema);
