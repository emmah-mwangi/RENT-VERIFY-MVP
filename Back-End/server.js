require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const receiptsRoutes = require("./routes/receipts");

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://rent-verify-mvp.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "rent-verify-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/receipts", receiptsRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in Back-End/.env.`);
    return;
  }

  console.error("Server failed to start:", error);
});
