// server/config/firebase.js
const admin = require("firebase-admin");

let db;

function initFirebase() {
  if (admin.apps.length > 0) {
    db = admin.firestore();
    return;
  }

  // Validate required env vars
  const required = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing Firebase env var: ${key}. Check your .env file.`);
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines from .env
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });

  db = admin.firestore();
  console.log("✅ Firebase Admin SDK initialized");
}

function getDb() {
  if (!db) throw new Error("Firebase not initialized. Call initFirebase() first.");
  return db;
}

module.exports = { initFirebase, getDb, admin };
