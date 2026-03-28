// client/src/pages/HistoryPage.js
import React, { useState, useCallback, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import { getHistory, deleteHistory, clearHistory } from "../utils/store";
import { formatSize, getFileIcon } from "../utils/crypto";
import toast from "react-hot-toast";

export default function HistoryPage() {
  const [history,  setHistory]  = useState([]);
  const [filter,   setFilter]   = useState("all");
  const [clearing, setClearing] = useState(false);

  const fetchHistory = useCallback(() => {
    const h = getHistory(filter !== "all" ? filter : undefined);
    setHistory(h);
  }, [filter]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  function handleDelete(id) {
    deleteHistory(id);
    setHistory(h => h.filter(e => e.id !== id));
    toast.success("Entry removed.");
  }

  function handleClearAll() {
    if (!window.confirm(`Delete all ${history.length} history entries? This cannot be undone.`)) return;
    setClearing(true);
    clearHistory();
    setHistory([]);
    toast.success("History cleared.");
    setClearing(false);
  }

  const allHistory = getHistory();
  const counts = {
    all:     allHistory.length,
    encrypt: allHistory.filter(h => h.operation === "encrypt").length,
    decrypt: allHistory.filter(h => h.operation === "decrypt").length,
  };

  return (
    <AppLayout>
      <div className="anim-up">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="badge badge-gold" style={{ marginBottom: 10, display: "inline-flex" }}>📋 History</div>
            <h1 style={{ fontSize: 28, letterSpacing: "-0.5px" }}>File History</h1>
            <p style={{ color: "var(--text2)", marginTop: 6 }}>All your encryption and decryption operations.</p>
          </div>
          {history.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleClearAll} disabled={clearing}
              style={{ color: "var(--red)", borderColor: "rgba(255,77,109,.3)" }}>
              {clearing ? "Clearing…" : "🗑 Clear All"}
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[["all", "All"], ["encrypt", "🔐 Encrypted"], ["decrypt", "🔓 Decrypted"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`btn btn-sm ${filter === val ? "btn-primary" : "btn-ghost"}`}>
              {label}
              <span style={{ background: "rgba(255,255,255,.15)", padding: "1px 8px", borderRadius: 100, fontSize: 11, marginLeft: 2 }}>
                {counts[val]}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {history.length === 0 ? (
            <div style={{ padding: 72, textAlign: "center" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>📭</div>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 16 }}>No records found</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>
                {filter !== "all" ? "No operations match this filter." : "Start encrypting files to build history."}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>File</th>
                    <th>Operation</th>
                    <th>Output</th>
                    <th>Size</th>
                    <th>Date & Time</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, i) => (
                    <tr key={entry.id}>
                      <td style={{ color: "var(--muted)", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, width: 40 }}>{i + 1}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 20, flexShrink: 0 }}>{getFileIcon(entry.fileType, entry.fileName)}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>{entry.fileName}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'JetBrains Mono',monospace" }}>{entry.fileType || "unknown"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${entry.operation === "encrypt" ? "badge-blue" : "badge-green"}`}>
                          {entry.operation === "encrypt" ? "🔐 ENCRYPT" : "🔓 DECRYPT"}
                        </span>
                      </td>
                      <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--text2)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.outputName || "—"}
                      </td>
                      <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "var(--text2)", whiteSpace: "nowrap" }}>
                        {formatSize(entry.fileSize || 0)}
                      </td>
                      <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--text2)", whiteSpace: "nowrap" }}>
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "Just now"}
                      </td>
                      <td>
                        <button onClick={() => handleDelete(entry.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--muted)", padding: "4px 8px", borderRadius: 6, transition: "color .2s" }}
                          onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}>
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)", fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }}>
            Showing {history.length} record{history.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
