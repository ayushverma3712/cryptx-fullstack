// client/src/pages/ProfilePage.js
import React, { useState } from "react";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { formatSize } from "../utils/crypto";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!fullName.trim() || !/\s/.test(fullName.trim()))
      return toast.error("Please enter your full name (first and last).");
    setSaving(true);
    try {
      await updateProfile(fullName.trim());
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed.");
    } finally { setSaving(false); }
  }

  const stats = [
    { icon: "🔐", label: "Files Encrypted",   value: user?.totalEncryptions   ?? 0, color: "var(--accent)" },
    { icon: "🔓", label: "Files Decrypted",   value: user?.totalDecryptions   ?? 0, color: "var(--green)"  },
    { icon: "📦", label: "Data Processed",    value: formatSize(user?.totalBytesProcessed ?? 0), color: "var(--gold)" },
  ];

  return (
    <AppLayout>
      <div className="anim-up">
        <div style={{ marginBottom: 28 }}>
          <div className="badge badge-blue" style={{ marginBottom: 10, display: "inline-flex" }}>👤 Profile</div>
          <h1 style={{ fontSize: 28, letterSpacing: "-0.5px" }}>My Profile</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="profile-grid">

          {/* Profile card */}
          <div className="card">
            {/* Avatar + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#3266cc,#00e5b0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30, fontWeight: 900, color: "#07090f",
                boxShadow: "0 8px 28px rgba(79,142,255,.3)",
              }}>
                {user?.avatarInitials || "?"}
              </div>
              <div>
                <h2 style={{ fontSize: 20, marginBottom: 4 }}>{user?.fullName}</h2>
                <div style={{ color: "var(--text2)", fontSize: 13, marginBottom: 10 }}>{user?.email}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className={`badge ${user?.emailVerified ? "badge-green" : "badge-red"}`}>
                    {user?.emailVerified ? "✓ Verified" : "⚠ Unverified"}
                  </span>
                  <span className="badge badge-blue">CryptX Member</span>
                </div>
              </div>
            </div>

            {/* Edit form or detail list */}
            {editing ? (
              <div>
                <div className="form-group">
                  <label className="label">Full Name</label>
                  <input className="input" value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="First Last" onKeyDown={e => e.key === "Enter" && handleSave()} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button className="btn btn-ghost" onClick={() => { setEditing(false); setFullName(user?.fullName || ""); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                {[
                  { label: "Full Name",    value: user?.fullName },
                  { label: "Email",        value: user?.email },
                  { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A" },
                  { label: "Last Login",   value: user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "N/A" },
                ].map(f => (
                  <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text2)", fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>{f.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 240, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.value || "—"}</span>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} style={{ marginTop: 16 }}>
                  ✏️ Edit Name
                </button>
              </div>
            )}
          </div>

          {/* Stats + Security */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 16 }}>📊 Your Statistics</div>
              {stats.map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <span style={{ fontSize: 13, color: "var(--text2)" }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 16 }}>🛡️ Account Security</div>
              {[
                { icon: user?.emailVerified ? "✅" : "⚠️", title: "Email Verification", desc: user?.emailVerified ? "Your email is verified." : "Email not yet verified." },
                { icon: "🔐", title: "Password", desc: "Account is password protected with bcrypt." },
                { icon: "🔑", title: "Session Token", desc: "JWT with 7-day expiry, server-validated." },
              ].map(s => (
                <div key={s.title} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team card */}
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 18, fontSize: 15 }}>👥 Team CryptX · CYBER-IV-T073</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {[
              { name: "Ayush Verma",   roll: "230213648", role: "Team Lead"  },
              { name: "Shivansh Garg", roll: "23021145",  role: "Developer"  },
              { name: "Rani Kumari",   roll: "230121829", role: "Developer"  },
              { name: "Tanuja Bhatt",  roll: "230223711", role: "Developer"  },
            ].map(m => {
              const initials = m.name.split(" ").map(n => n[0]).join("");
              return (
                <div key={m.roll} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px", textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#3266cc,#00e5b0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#07090f", margin: "0 auto 10px" }}>{initials}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "var(--green)", marginBottom: 3, fontFamily: "'JetBrains Mono',monospace" }}>{m.role}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'JetBrains Mono',monospace" }}>{m.roll}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:767px){ .profile-grid{ grid-template-columns:1fr!important } }`}</style>
    </AppLayout>
  );
}
