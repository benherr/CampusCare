const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); 
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const userRoutes = require("./routes/userRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const adminRoutes = require("./routes/adminRoutes"); 
const workerRoutes = require("./routes/workerRoutes"); 
require("dotenv").config(); 

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// Serve uploads folder, but set security headers to prevent code execution if an HTML file slips through
app.use("/uploads", helmet.crossOriginResourcePolicy({ policy: "cross-origin" }), express.static(path.join(__dirname, "uploads"))); 

app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes); 
app.use("/api/worker", workerRoutes); 

const startDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully to primary URI.");
  } catch (err) {
    console.error("Primary MongoDB connection error:", err.message);
    console.log("Falling back to in-memory MongoDB...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log("In-memory MongoDB connected successfully at:", mongoUri);
  }
};

startDatabase().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

