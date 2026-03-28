// server/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { getDb, admin } = require("../config/firebase");
const { sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail } = require("../config/email");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ── Rate limiters ─────────────────────────────────────────────
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: "Too many attempts. Please wait 15 minutes." } });
const otpLimiter  = rateLimit({ windowMs: 60 * 1000,      max: 3,  message: { error: "Too many OTP requests. Wait 1 minute." } });

// ── Helpers ───────────────────────────────────────────────────
function makeOTP() { return String(Math.floor(100000 + Math.random() * 900000)); }
function makeToken() { return uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, ""); }
function signToken(uid, email) {
  return jwt.sign({ uid, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}
function ok(res, data, status = 200) { res.status(status).json({ success: true, ...data }); }
function fail(res, error, status = 400) { res.status(status).json({ success: false, error }); }

// ── REGISTER ──────────────────────────────────────────────────
router.post("/register",
  authLimiter,
  [
    body("fullName").trim().isLength({ min: 2 }).withMessage("Full name required")
      .matches(/\s/).withMessage("Enter first and last name"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return fail(res, errors.array()[0].msg);

    const { fullName, email, password } = req.body;
    const db = getDb();

    try {
      // Check if email already exists
      const existing = await db.collection("users").where("email", "==", email).limit(1).get();
      if (!existing.empty) return fail(res, "An account with this email already exists.");

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      const uid = uuidv4();
      const otp = makeOTP();
      const otpExpiry = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000);
      const avatarInitials = fullName.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);

      // Save user to Firestore
      await db.collection("users").doc(uid).set({
        uid,
        fullName: fullName.trim(),
        email,
        passwordHash,
        emailVerified: false,
        disabled: false,
        avatarInitials,
        otp,
        otpExpiry: admin.firestore.Timestamp.fromDate(otpExpiry),
        otpAttempts: 0,
        totalEncryptions: 0,
        totalDecryptions: 0,
        totalBytesProcessed: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send OTP email
      await sendOTPEmail(email, fullName.split(" ")[0], otp);

      const token = signToken(uid, email);
      ok(res, { token, uid, message: "Account created. Check your email for the OTP." }, 201);

    } catch (err) {
      console.error("Register error:", err);
      fail(res, "Registration failed. Please try again.", 500);
    }
  }
);

// ── LOGIN ─────────────────────────────────────────────────────
router.post("/login",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return fail(res, "Invalid email or password.");

    const { email, password } = req.body;
    const db = getDb();

    try {
      const snap = await db.collection("users").where("email", "==", email).limit(1).get();
      if (snap.empty) return fail(res, "No account found with this email.", 401);

      const user = snap.docs[0].data();
      if (user.disabled) return fail(res, "Your account has been disabled.", 403);

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return fail(res, "Incorrect password. Please try again.", 401);

      // Update last login
      await db.collection("users").doc(user.uid).update({
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const token = signToken(user.uid, user.email);
      ok(res, {
        token,
        user: {
          uid: user.uid,
          fullName: user.fullName,
          email: user.email,
          emailVerified: user.emailVerified,
          avatarInitials: user.avatarInitials,
          totalEncryptions: user.totalEncryptions,
          totalDecryptions: user.totalDecryptions,
          totalBytesProcessed: user.totalBytesProcessed,
          createdAt: user.createdAt,
        }
      });
    } catch (err) {
      console.error("Login error:", err);
      fail(res, "Login failed. Please try again.", 500);
    }
  }
);

// ── VERIFY OTP ────────────────────────────────────────────────
router.post("/verify-otp",
  requireAuth,
  otpLimiter,
  [body("otp").isLength({ min: 6, max: 6 }).isNumeric()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return fail(res, "Invalid OTP format.");

    const { otp } = req.body;
    const db = getDb();

    try {
      const userRef = db.collection("users").doc(req.user.uid);
      const userSnap = await userRef.get();
      const user = userSnap.data();

      if (user.emailVerified) return ok(res, { message: "Email already verified." });

      // Check attempts
      if (user.otpAttempts >= 5) {
        return fail(res, "Too many failed attempts. Request a new OTP.", 429);
      }

      // Check expiry
      const expiry = user.otpExpiry?.toDate?.() || new Date(0);
      if (new Date() > expiry) {
        return fail(res, "OTP has expired. Please request a new one.", 410);
      }

      // Check match
      if (user.otp !== otp) {
        await userRef.update({ otpAttempts: admin.firestore.FieldValue.increment(1) });
        const remaining = 5 - (user.otpAttempts + 1);
        return fail(res, `Incorrect OTP. ${remaining} attempt(s) remaining.`, 401);
      }

      // Mark verified & clear OTP
      await userRef.update({
        emailVerified: true,
        otp: null,
        otpExpiry: null,
        otpAttempts: 0,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send welcome email
      try { await sendWelcomeEmail(user.email, user.fullName.split(" ")[0]); } catch {}

      ok(res, { message: "Email verified successfully! Welcome to CryptX." });
    } catch (err) {
      console.error("OTP error:", err);
      fail(res, "Verification failed.", 500);
    }
  }
);

// ── RESEND OTP ────────────────────────────────────────────────
router.post("/resend-otp",
  requireAuth,
  otpLimiter,
  async (req, res) => {
    const db = getDb();
    try {
      const userSnap = await db.collection("users").doc(req.user.uid).get();
      const user = userSnap.data();

      if (user.emailVerified) return fail(res, "Email is already verified.");

      const otp = makeOTP();
      const otpExpiry = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000);

      await db.collection("users").doc(req.user.uid).update({
        otp,
        otpExpiry: admin.firestore.Timestamp.fromDate(otpExpiry),
        otpAttempts: 0,
      });

      await sendOTPEmail(user.email, user.fullName.split(" ")[0], otp);
      ok(res, { message: "New OTP sent to your email." });
    } catch (err) {
      console.error("Resend OTP error:", err);
      fail(res, "Could not resend OTP.", 500);
    }
  }
);

// ── FORGOT PASSWORD ───────────────────────────────────────────
router.post("/forgot-password",
  authLimiter,
  [body("email").isEmail().normalizeEmail()],
  async (req, res) => {
    // Always return success to prevent email enumeration
    const { email } = req.body;
    const db = getDb();

    try {
      const snap = await db.collection("users").where("email", "==", email).limit(1).get();
      if (!snap.empty) {
        const user = snap.docs[0].data();
        const token = makeToken();
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db.collection("users").doc(user.uid).update({
          resetToken: token,
          resetTokenExpiry: admin.firestore.Timestamp.fromDate(expiry),
        });

        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
        await sendPasswordResetEmail(user.email, user.fullName.split(" ")[0], token, clientUrl);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
    }

    ok(res, { message: "If that email is registered, a reset link has been sent." });
  }
);

// ── RESET PASSWORD ────────────────────────────────────────────
router.post("/reset-password",
  [
    body("token").notEmpty(),
    body("password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return fail(res, "Password must be at least 8 characters.");

    const { token, password } = req.body;
    const db = getDb();

    try {
      const snap = await db.collection("users").where("resetToken", "==", token).limit(1).get();
      if (snap.empty) return fail(res, "Invalid or expired reset link.", 400);

      const user = snap.docs[0].data();
      const expiry = user.resetTokenExpiry?.toDate?.() || new Date(0);
      if (new Date() > expiry) return fail(res, "Reset link has expired. Please request a new one.", 410);

      const passwordHash = await bcrypt.hash(password, 12);
      await db.collection("users").doc(user.uid).update({
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      });

      ok(res, { message: "Password reset successfully. Please log in with your new password." });
    } catch (err) {
      console.error("Reset password error:", err);
      fail(res, "Password reset failed.", 500);
    }
  }
);

// ── GET ME ────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  const db = getDb();
  try {
    const snap = await db.collection("users").doc(req.user.uid).get();
    const u = snap.data();
    ok(res, {
      user: {
        uid: u.uid, fullName: u.fullName, email: u.email,
        emailVerified: u.emailVerified, avatarInitials: u.avatarInitials,
        totalEncryptions: u.totalEncryptions, totalDecryptions: u.totalDecryptions,
        totalBytesProcessed: u.totalBytesProcessed,
        createdAt: u.createdAt, lastLoginAt: u.lastLoginAt,
      }
    });
  } catch (err) {
    fail(res, "Could not fetch user.", 500);
  }
});

// ── CHANGE PASSWORD ───────────────────────────────────────────
router.post("/change-password",
  requireAuth,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 8 }),
  ],
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const db = getDb();
    try {
      const snap = await db.collection("users").doc(req.user.uid).get();
      const user = snap.data();

      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) return fail(res, "Current password is incorrect.", 401);

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await db.collection("users").doc(req.user.uid).update({ passwordHash });
      ok(res, { message: "Password changed successfully." });
    } catch (err) {
      fail(res, "Failed to change password.", 500);
    }
  }
);

// ── UPDATE PROFILE ────────────────────────────────────────────
router.put("/profile",
  requireAuth,
  [body("fullName").trim().isLength({ min: 2 }).matches(/\s/)],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return fail(res, "Please enter your full name (first and last).");

    const { fullName } = req.body;
    const db = getDb();
    try {
      const avatarInitials = fullName.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
      await db.collection("users").doc(req.user.uid).update({ fullName: fullName.trim(), avatarInitials });
      ok(res, { message: "Profile updated.", fullName: fullName.trim(), avatarInitials });
    } catch (err) {
      fail(res, "Failed to update profile.", 500);
    }
  }
);

module.exports = router;
