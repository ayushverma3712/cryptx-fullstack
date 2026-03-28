// client/src/pages/DecryptPage.js
import React, { useState } from "react";
import AppLayout from "../components/AppLayout";
import DropZone from "../components/DropZone";
import { decryptFile, downloadBlob, formatSize } from "../utils/crypto";
import { bumpStats, addHistory } from "../utils/store";
import toast from "react-hot-toast";

export default function DecryptPage() {
  const [file,        setFile]        = useState(null);
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [result,      setResult]      = useState(null);

  async function handleDecrypt() {
    if (!file)     return toast.error("Please select an encrypted .enc file.");
    if (!password) return toast.error("Enter the decryption password.");

    setLoading(true); setResult(null); setProgress(0);
    try {
      const { blob, outputName, size, meta } = await decryptFile(file, password, (pct, msg) => {
        setProgress(pct); setProgressMsg(msg);
      });

      downloadBlob(blob, outputName);
      setResult({ ok: true, name: outputName, size, meta });

      addHistory({
        operation: "decrypt", fileName: file.name,
        outputName, fileType: file.type, fileSize: file.size, outputSize: size,
      });
      bumpStats("decrypt", file.size);
      toast.success("File decrypted & downloaded!");
    } catch (err) {
      const msg = err.message || "Decryption failed.";
      setResult({ ok: false, error: msg });
      toast.error(msg);
    } finally { setLoading(false); }
  }

  return (
    <AppLayout>
      <div className="anim-up">
        <div style={{ marginBottom: 28 }}>
          <div className="badge badge-green" style={{ marginBottom: 10, display: "inline-flex" }}>🔓 Decrypt</div>
          <h1 style={{ fontSize: 28, letterSpacing: "-0.5px" }}>Decrypt Encrypted File</h1>
          <p style={{ color: "var(--text2)", marginTop: 6 }}>
            Restore your original file from a CryptX <code style={{ color: "var(--green)", fontSize: 14 }}>.enc</code> file using your password.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 24, alignItems: "start" }} className="dec-grid">

          {/* ── Left ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 16 }}>🔒 Select Encrypted File</div>
              <DropZone
                file={file} onFile={f => { setFile(f); setResult(null); }} onClear={() => { setFile(null); setResult(null); }}
                accept={{ "application/octet-stream": [".enc"], "": [".enc"] }}
                label="Drop your .enc file here"
                hint="Only CryptX-encrypted files (.enc) are supported"
              />
            </div>

            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 16 }}>🔑 Decryption Password</div>

              <div className="form-group">
                <label className="label">Password used during encryption</label>
                <div style={{ position: "relative" }}>
                  <input className="input" type={showPw ? "text" : "password"}
                    placeholder="Enter your encryption password…"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleDecrypt()}
                    style={{ paddingRight: 44 }} />
                  <button onClick={() => setShowPw(p => !p)} type="button"
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--text2)" }}>
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
                <div className="hint">Use the exact password that was set during encryption.</div>
              </div>

              {/* Progress */}
              {loading && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text2)", fontFamily: "'JetBrains Mono',monospace" }}>{progressMsg}</span>
                    <span style={{ fontSize: 13, color: "var(--green)", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{progress}%</span>
                  </div>
                  <div className="progress-wrap"><div className="progress-fill" style={{ width: progress + "%" }} /></div>
                </div>
              )}

              {/* Result */}
              {result && !loading && (
                <div className={`alert ${result.ok ? "alert-ok" : "alert-err"}`} style={{ marginBottom: 16, flexDirection: "column", gap: 6 }}>
                  {result.ok ? (
                    <>
                      <div>✅ <strong>Decrypted & downloaded:</strong> {result.name} ({formatSize(result.size)})</div>
                      {result.meta?.encryptedAt && (
                        <div style={{ fontSize: 12, opacity: 0.8 }}>
                          Originally encrypted: {new Date(result.meta.encryptedAt).toLocaleString()}
                        </div>
                      )}
                    </>
                  ) : (
                    <div>❌ {result.error}</div>
                  )}
                </div>
              )}

              <button className="btn btn-green btn-lg btn-full" onClick={handleDecrypt}
                disabled={loading || !file || !password}>
                {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Decrypting…</> : "🔓 Decrypt & Download"}
              </button>
            </div>
          </div>

          {/* ── Right ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Important Notes</div>
              {[
                { icon: "🔑", text: "You must use the exact same password used during encryption." },
                { icon: "📄", text: "Only files with .enc extension made by CryptX work here." },
                { icon: "💻", text: "Decryption runs entirely on your computer — files never leave." },
                { icon: "⚠️", text: "Wrong password = decryption error. No recovery is possible." },
              ].map((n, i, arr) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</span>
                  <span style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{n.text}</span>
                </div>
              ))}
            </div>

            <div className="alert alert-warn" style={{ borderRadius: "var(--r)" }}>
              💾 Processing is 100% local. Your files are never uploaded to any server.
            </div>

            <div className="alert alert-info" style={{ borderRadius: "var(--r)" }}>
              💡 Lost your password? Unfortunately there's no way to recover it — AES-256 encryption is irreversible without the key.
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:767px){ .dec-grid{ grid-template-columns:1fr!important } }`}</style>
    </AppLayout>
  );
}
