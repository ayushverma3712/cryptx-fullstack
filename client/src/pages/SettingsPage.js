// client/src/pages/SettingsPage.js
import React, { useState } from "react";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Section({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { changePassword, logout, forgotPassword, user } = useAuth();

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleChangePw(e) {
    e.preventDefault();
    if (pw.next.length < 8)          return toast.error("New password must be at least 8 characters.");
    if (pw.next !== pw.confirm)       return toast.error("New passwords do not match.");
    if (pw.next === pw.current)       return toast.error("New password must differ from current.");
    setPwLoading(true);
    try {
      await changePassword(pw.current, pw.next);
      toast.success("Password changed successfully!");
      setPw({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed. Check your current password.");
    } finally { setPwLoading(false); }
  }

  async function handleForgotPw() {
    try {
      await forgotPassword(user.email);
      toast.success(`Reset link sent to ${user.email}`);
    } catch { toast.error("Could not send reset email."); }
  }

  // Password strength
  const sPwd = pw.next;
  let sScore = 0;
  if (sPwd.length >= 8)  sScore++;
  if (sPwd.length >= 14) sScore++;
  if (/[A-Z]/.test(sPwd) && /[a-z]/.test(sPwd)) sScore++;
  if (/[0-9]/.test(sPwd)) sScore++;
  if (/[^A-Za-z0-9]/.test(sPwd)) sScore++;
  const sColor = ["","#ff4d6d","#ff6b35","#ffcc00","#7ed321","#00e5b0"][Math.min(sScore,5)];
  const sLabel = ["","Very Weak","Weak","Fair","Good","Strong"][Math.min(sScore,5)];

  return (
    <AppLayout>
      <div className="anim-up" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 28 }}>
          <div className="badge badge-purple" style={{ marginBottom: 10, display: "inline-flex" }}>⚙️ Settings</div>
          <h1 style={{ fontSize: 28, letterSpacing: "-0.5px" }}>Account Settings</h1>
        </div>

        {/* Change password */}
        <Section title="🔑 Change Password">
          <form onSubmit={handleChangePw}>
            <div className="form-group">
              <label className="label">Current Password</label>
              <div style={{ position: "relative" }}>
                <input className="input" type={showPw ? "text" : "password"}
                  value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                  placeholder="Enter current password" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "var(--text2)" }}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="label">New Password</label>
              <input className="input" type="password"
                value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
                placeholder="Min. 8 characters" />
              {pw.next && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= sScore ? sColor : "var(--border)", transition: "background .3s" }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: sColor, fontFamily: "'JetBrains Mono',monospace" }}>{sLabel}</div>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="label">Confirm New Password</label>
              <input className="input" type="password"
                value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat new password" />
              {pw.confirm && pw.next && (
                pw.confirm === pw.next
                  ? <div className="fok">✓ Passwords match</div>
                  : <div className="ferr">Passwords do not match</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                {pwLoading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Updating…</> : "Update Password"}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleForgotPw}>
                Forgot current password?
              </button>
            </div>
          </form>
        </Section>

        {/* Encryption info */}
        <Section title="🔐 Encryption Configuration">
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "Algorithm",         value: "AES-256-CBC",          badge: "badge-green"  },
              { label: "Key Derivation",     value: "PBKDF2 · 1000 rounds", badge: "badge-blue"   },
              { label: "IV Generation",      value: "Random 128-bit per file", badge: "badge-green" },
              { label: "Padding",            value: "PKCS7",                badge: "badge-blue"   },
              { label: "Processing",         value: "Local browser only",   badge: "badge-gold"   },
            ].map((r, i, arr) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 13, color: "var(--text2)", fontFamily: "'JetBrains Mono',monospace" }}>{r.label}</span>
                <span className={`badge ${r.badge}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* About */}
        <Section title="ℹ️ About CryptX">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { k: "Version",     v: "2.0.0" },
              { k: "Backend",     v: "Node.js + Express" },
              { k: "Database",    v: "Firebase Firestore" },
              { k: "Auth",        v: "JWT + bcrypt" },
              { k: "Encryption",  v: "AES-256-CBC (CryptoJS)" },
              { k: "Team",        v: "CryptX · CYBER-IV-T073" },
            ].map(f => (
              <div key={f.k} style={{ background: "var(--bg2)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'JetBrains Mono',monospace", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.k}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{f.v}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="⚠️ Danger Zone">
          <div className="alert alert-err" style={{ marginBottom: 16 }}>
            These actions are permanent and cannot be reversed.
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-red btn-sm"
              onClick={() => { if (window.confirm("Sign out of your account?")) { logout(); window.location.href = "/login"; } }}>
              🚪 Sign Out
            </button>
          </div>
        </Section>
      </div>
    </AppLayout>
  );
}
