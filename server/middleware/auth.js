// server/middleware/auth.js
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/firebase");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided. Please log in." });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user still exists in Firestore
    const db = getDb();
    const userSnap = await db.collection("users").doc(decoded.uid).get();
    if (!userSnap.exists) {
      return res.status(401).json({ error: "User account not found." });
    }

    const userData = userSnap.data();
    if (userData.disabled) {
      return res.status(403).json({ error: "Your account has been disabled." });
    }

    req.user = { uid: decoded.uid, email: decoded.email, ...userData };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid token. Please log in again." });
  }
}

async function requireVerified(req, res, next) {
  if (!req.user.emailVerified) {
    return res.status(403).json({ error: "Please verify your email address before continuing." });
  }
  next();
}

module.exports = { requireAuth, requireVerified };
