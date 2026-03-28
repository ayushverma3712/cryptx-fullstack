// server/index.js
require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const rateLimit = require("express-rate-limit");
const { initFirebase } = require("./config/firebase");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Init Firebase ─────────────────────────────────────────────
initFirebase();

// ── Middleware ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests. Please slow down." },
}));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",    require("./routes/auth"));
app.use("/api/history", require("./routes/history"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "2.0.0" });
});

// 404
app.use((req, res) => res.status(404).json({ error: "Route not found." }));

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🔐 CryptX Server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
  console.log(`   Firebase    : ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`   Email       : ${process.env.EMAIL_USER}\n`);
});
