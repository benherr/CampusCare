const jwt = require("jsonwebtoken");

const authenticateWorker = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.worker = decoded;  


    if (req.worker.role !== "worker") {
      return res.status(403).json({ message: "You do not have worker privileges" });
    }


    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticateWorker;
