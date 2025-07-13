// Create a middleware to verify JWT and check if user is admin:

//Export verifyToken and isAdmin Function to other files;

const jwt = require('jsonwebtoken');
const User = require("../models/User");

exports.verifyToken = async (req, res, next) => {
  // 1. Try token from Authorization header
  let token = req.headers.authorization?.split(" ")[1];

  // 2. If not in headers, try from cookies
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
