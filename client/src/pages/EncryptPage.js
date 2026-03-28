// client/src/pages/EncryptPage.js
import React, { useState } from "react";
import AppLayout from "../components/AppLayout";
import DropZone from "../components/DropZone";
import { encryptFile, downloadBlob, generateKey, keyStrength, formatSize } from "../utils/crypto";
import { bumpStats, addHistory } from "../utils/store";
import toast from "react-hot-toast";

export default function EncryptPage() {
  const [file,        setFile]        = useState(null);
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [result,      setResult]      = useState(null);

  const strength = keyStrength(password);

  async function handleEncrypt() {
    if (!file)                           return toast.error("Please select a file first.");
    if (!password || password.length < 6) return toast.error("Password must be at least 6 characters.");

    setLoading(true); setResult(null); setProgress(0);
    try {
      const { blob, outputName, size } = await encryptFile(file, password, (pct, msg) => {
        setProgress(pct); setProgressMsg(msg);
      });

      downloadBlob(blob, outputName);
      setResult({ ok: true, name: outputName, size });

      // Save to localStorage history & stats
      addHistory({
        operation: "encrypt", fileName: file.name,
        outputName, fileType: file.type, fileSize: file.size, outputSize: size,
      });
      bumpStats("encrypt", file.size);
      toast.success("File encrypted & downloaded!");
    } catch (err) {
      const msg = err.message || "Encryption failed.";
      setResult({ ok: false, error: msg });
      toast.error(msg);
    } finally { setLoading(false); }
  }

  function handleGenKey() {
    const k = generateKey();
    setPassword(k);
    setShowPw(true);
    toast.success("Strong key generated! Save it somewhere safe.");
  }

  return (
    <AppLayout>
      <div className="anim-up">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="badge badge-blue" style={{ marginBottom: 10, display: "inline-flex" }}>🔐 Encrypt</div>
          <h1 style={{ fontSize: 28, letterSpacing: "-0.5px" }}>Encrypt Multimedia File</h1>
          <p style={{ color: "var(--text2)", marginTop: 6 }}>
            Protect images, audio and video with AES-256-CBC. Files are processed locally — never uploaded.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 24, alignItems: "start" }} className="enc-grid">

          {/* ── Left panel ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* File picker */}
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                📁 Select File
                <span style={{ fontSize: 12, color: "var(--text2)", fontFamily: "'JetBrains Mono',monospace", fontWeight: 400 }}>Images · Audio · Video</span>
              </div>
              <DropZone
                file={file} onFile={f => { setFile(f); setResult(null); }} onClear={() => { setFile(null); setResult(null); }}
                accept={{ "image/*": [], "audio/*": [], "video/*": [] }}
                label="Drop image, audio or video"
                hint="JPG · PNG · GIF · MP3 · WAV · OGG · MP4 · AVI · MOV · MKV"
              />
            </div>

            {/* Password */}
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 16 }}>🔑 Set Encryption Password</div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label className="label" style={{ margin: 0 }}>Passphrase</label>
                  <button onClick={handleGenKey}
                    style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>
                    ⚡ Auto-generate
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input className="input" type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters…"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleEncrypt()}
                    style={{ paddingRight: 44, fontFamily: showPw ? "'JetBrains Mono',monospace" : "inherit", fontSize: showPw ? 13 : 14 }} />
                  <button onClick={() => setShowPw(p => !p)} type="button"
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--text2)" }}>
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
                <div className="hint">⚠ Save this password — it's required to decrypt and cannot be recovered.</div>
              </div>

              {/* Strength meter */}
              {password && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 5 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength.score ? strength.color : "var(--border)", transition: "background .3s" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>
                    <span style={{ color: strength.color }}>Strength: {strength.label}</span>
                    <span style={{ color: "var(--muted)" }}>{password.length} chars</span>
                  </div>
                </div>
              )}

              {/* Progress */}
              {loading && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text2)", fontFamily: "'JetBrains Mono',monospace" }}>{progressMsg}</span>
                    <span style={{ fontSize: 13, color: "var(--accent)", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{progress}%</span>
                  </div>
                  <div className="progress-wrap"><div className="progress-fill" style={{ width: progress + "%" }} /></div>
                </div>
              )}

              {/* Result */}
              {result && !loading && (
                <div className={`alert ${result.ok ? "alert-ok" : "alert-err"}`} style={{ marginBottom: 16 }}>
                  {result.ok
                    ? <>✅ <span><strong>Encrypted & downloaded:</strong> {result.name} ({formatSize(result.size)})</span></>
                    : <>❌ {result.error}</>}
                </div>
              )}

              <button className="btn btn-primary btn-lg btn-full" onClick={handleEncrypt}
                disabled={loading || !file || !password}>
                {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Encrypting…</> : "🔐 Encrypt & Download"}
              </button>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* AES steps */}
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>How AES-256 Works</div>
              {[
                { n: "01", title: "PBKDF2 Key Derivation",  desc: "Password stretched with 1000 iterations + random salt" },
                { n: "02", title: "Random IV",               desc: "128-bit initialization vector generated per file" },
                { n: "03", title: "AES-256-CBC Cipher",      desc: "14 rounds: SubBytes → ShiftRows → MixColumns → AddRoundKey" },
                { n: "04", title: "Metadata Embedded",       desc: "Original filename & type saved inside the .enc file" },
              ].map(s => (
                <div key={s.n} style={{ display: "flex", gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(79,142,255,.15)", border: "1px solid rgba(79,142,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "var(--accent)", flexShrink: 0, fontWeight: 700 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)", lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'JetBrains Mono',monospace" }}>
                All processing is LOCAL. Files never leave your browser.
              </div>
            </div>

            {/* Formats */}
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Supported Formats</div>
              {[
                { t: "🖼️ Images", f: "JPG, PNG, GIF, BMP, WebP, SVG, TIFF" },
                { t: "🎵 Audio",  f: "MP3, WAV, OGG, AAC, FLAC, M4A" },
                { t: "🎬 Video",  f: "MP4, AVI, MOV, MKV, WebM, FLV" },
              ].map(r => (
                <div key={r.t} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{r.t}</div>
                  <div style={{ fontSize: 11, color: "var(--text2)", fontFamily: "'JetBrains Mono',monospace" }}>{r.f}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:767px){ .enc-grid{ grid-template-columns:1fr!important } }`}</style>
    </AppLayout>
  );
}
