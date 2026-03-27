const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// --- SIGNUP ---
router.post("/signup", async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const sql = `INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)`;
    db.run(sql, [fullName, email, phone, hashedPassword], function(err) {
      if (err) {
        return res.status(400).json({ message: "Email already exists" });
      }
      res.status(201).json({ message: "Account created successfully" });
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- LOGIN ---
router.post("/login", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `SELECT * FROM users WHERE email = ?`;
  db.get(sql, [identifier], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user: { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone } });
  });
});

module.exports = router;
