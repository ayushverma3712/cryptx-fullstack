// client/src/pages/Dashboard.js
import React from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { getStats, getHistory } from "../utils/store";
import { formatSize, getFileIcon } from "../utils/crypto";

function StatCard({ icon, label, value, color, delay }) {
  return (
    <div className="card anim-up" style={{ flex: 1, minWidth: 160, animationDelay: delay }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, fontSize: 18, flexShrink: 0,
          background: `linear-gradient(135deg, ${color}22, ${color}44)`,
          border: `1px solid ${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>{icon}</div>
        <span style={{ fontSize: 11, color: "var(--text2)", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color, letterSpacing: "-1px" }}>{value}</div>
    </div>
  );
}

function QuickAction({ to, icon, label, desc, color }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div className="card" style={{ cursor: "pointer", transition: "all .2s", height: "100%" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${color}18`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>{icon}</div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>{desc}</div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const stats = getStats();
  const history = getHistory().slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppLayout>
      {/* Header */}
      <div className="anim-up" style={{ marginBottom: 32 }}>
        <div className="badge badge-green" style={{ marginBottom: 12, display: "inline-flex" }}>
          <span className="anim-pulse">●</span>&nbsp;AES-256 Active
        </div>
        <h1 style={{ fontSize: 34, letterSpacing: "-1px", marginBottom: 8 }}>
          {greeting} 👋
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 15 }}>
          Your multimedia files are protected with military-grade encryption.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <StatCard icon="" label="Encryptions"      value={stats.totalEncryptions}                      color="#4f8eff"  delay=".05s" />
        <StatCard icon="" label="Decryptions"      value={stats.totalDecryptions}                      color="#00e5b0"  delay=".1s"  />
        <StatCard icon="" label="Data Processed"   value={formatSize(stats.totalBytesProcessed)}       color="#ffb340"  delay=".15s" />
        <StatCard icon="" label="Algorithm"        value="AES-256"                                      color="#a78bfa"  delay=".2s"  />
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, color: "var(--text2)", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace", marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          <QuickAction to="/encrypt" icon="" label="Encrypt Image"  desc="JPG, PNG, GIF, WebP, BMP…" color="#4f8eff" />
          <QuickAction to="/encrypt" icon="" label="Encrypt Audio"  desc="MP3, WAV, OGG, FLAC, AAC…" color="#00e5b0" />
          <QuickAction to="/encrypt" icon="" label="Encrypt Video"  desc="MP4, AVI, MOV, MKV, WebM…" color="#ffb340" />
          <QuickAction to="/decrypt" icon="" label="Decrypt File"   desc="Restore any .enc file"      color="#a78bfa" />
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, color: "var(--text2)", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>Recent Activity</h2>
          <Link to="/history" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>View all →</Link>
        </div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {history.length === 0 ? (
            <div style={{ padding: 56, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>No activity yet</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Encrypt your first file to see history here.</div>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>File</th><th>Operation</th><th>Size</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{getFileIcon(h.fileType, h.fileName)}</span>
                        <span style={{ fontWeight: 500, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.fileName}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${h.operation === "encrypt" ? "badge-blue" : "badge-green"}`}>{h.operation === "encrypt" ? "🔐 ENCRYPT" : "🔓 DECRYPT"}</span></td>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", color: "var(--text2)" }}>{formatSize(h.fileSize || 0)}</td>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", color: "var(--text2)", fontSize: 12 }}>{h.createdAt ? new Date(h.createdAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
