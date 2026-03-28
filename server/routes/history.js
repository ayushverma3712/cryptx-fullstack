// server/routes/history.js
const express = require("express");
const { getDb, admin } = require("../config/firebase");
const { requireAuth, requireVerified } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

function ok(res, data)   { res.json({ success: true, ...data }); }
function fail(res, msg, code = 400) { res.status(code).json({ success: false, error: msg }); }

// ── ADD ENTRY ─────────────────────────────────────────────────
router.post("/", requireAuth, requireVerified, async (req, res) => {
  const { operation, fileName, outputName, fileType, fileSize, outputSize } = req.body;
  if (!operation || !fileName) return fail(res, "Missing required fields.");

  const db = getDb();
  try {
    const id = uuidv4();
    const entry = {
      id,
      uid: req.user.uid,
      operation,       // "encrypt" | "decrypt"
      fileName,
      outputName: outputName || "",
      fileType: fileType || "",
      fileSize: fileSize || 0,
      outputSize: outputSize || 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("fileHistory").doc(id).set(entry);

    // Update user stats
    const statsField = operation === "encrypt" ? "totalEncryptions" : "totalDecryptions";
    await db.collection("users").doc(req.user.uid).update({
      [statsField]: admin.firestore.FieldValue.increment(1),
      totalBytesProcessed: admin.firestore.FieldValue.increment(fileSize || 0),
    });

    ok(res, { id, message: "History entry saved." });
  } catch (err) {
    console.error("History add error:", err);
    fail(res, "Could not save history.", 500);
  }
});

// ── GET HISTORY ───────────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
  const db = getDb();
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const filter = req.query.filter; // "encrypt" | "decrypt" | undefined

  try {
    let query = db.collection("fileHistory")
      .where("uid", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (filter === "encrypt" || filter === "decrypt") {
      query = db.collection("fileHistory")
        .where("uid", "==", req.user.uid)
        .where("operation", "==", filter)
        .orderBy("createdAt", "desc")
        .limit(limit);
    }

    const snap = await query.get();
    const history = snap.docs.map(d => {
      const data = d.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });

    ok(res, { history });
  } catch (err) {
    console.error("History get error:", err);
    fail(res, "Could not fetch history.", 500);
  }
});

// ── DELETE ENTRY ──────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req, res) => {
  const db = getDb();
  try {
    const ref = db.collection("fileHistory").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return fail(res, "Entry not found.", 404);
    if (snap.data().uid !== req.user.uid) return fail(res, "Unauthorized.", 403);
    await ref.delete();
    ok(res, { message: "Entry deleted." });
  } catch (err) {
    fail(res, "Could not delete entry.", 500);
  }
});

// ── CLEAR ALL HISTORY ─────────────────────────────────────────
router.delete("/", requireAuth, async (req, res) => {
  const db = getDb();
  try {
    const snap = await db.collection("fileHistory").where("uid", "==", req.user.uid).get();
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    ok(res, { message: `Deleted ${snap.size} entries.` });
  } catch (err) {
    fail(res, "Could not clear history.", 500);
  }
});

module.exports = router;
