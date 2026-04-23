const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); 
    req.user = decoded;  

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "You do not have admin privileges" });
    }

    next();
  } catch (err) {
    console.error("Token verification error:", err);  
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticateAdmin;
