const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Protected route to get user info
router.get("/me", authenticate, (req, res) => {
  const sql = "SELECT id, full_name, email, phone, role FROM users WHERE id = ?";
  db.query(sql, [req.user.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
});

module.exports = router;
