const mongoose = require("mongoose");
const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ["plumber", "electrician", "carpenter", "cleaning"],
  },
});

const Worker = mongoose.model("Worker", workerSchema);
module.exports = Worker;
